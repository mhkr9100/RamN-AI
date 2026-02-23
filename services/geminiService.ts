
import { GoogleGenAI, Type, Modality, FunctionDeclaration, GenerateContentResponse } from "@google/genai";
import { Message, Agent, MessageContent, Task, GroundingChunk, AgentCapability, ToolCall } from "../types";
import { AGENTS, AI_RESUMES } from "../constants";
import { memoryService } from "./memory";
import { promptCacheService } from "./promptCache";
import { leannService } from "./leannService";

/**
 * ROBUST API CALL WRAPPER
 */
async function executeWithRetry<T>(operation: (ai: GoogleGenAI) => Promise<T>, apiKey?: string, maxRetries = 3): Promise<T> {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
        try {
            const ai = new GoogleGenAI({ apiKey: apiKey || process.env.API_KEY });
            return await operation(ai);
        } catch (error: any) {
            lastError = error;
            const errorMessage = error.message || "";
            const isQuotaError = errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED") || error.status === 429;
            const isEntityNotFoundError = errorMessage.includes("Requested entity was not found.");

            if (isEntityNotFoundError) {
                // @ts-ignore
                if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
                    // @ts-ignore
                    window.aistudio.openSelectKey();
                }
            }

            if (isQuotaError && i < maxRetries - 1) {
                const delay = Math.pow(2, i) * 2000 + Math.random() * 1000;
                console.warn(`Gemini API Quota reached. Retrying attempt ${i + 1} in ${Math.round(delay)}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
    throw lastError;
}

const TOOL_SAFETY_MAP: Record<string, 'READ_ONLY' | 'ACTION'> = {
    executeSearch: 'READ_ONLY',
    executeMapsLookup: 'READ_ONLY',
    fabricateAgent: 'ACTION',
    fabricateTeam: 'ACTION',
    generateVisualAsset: 'ACTION',
    generateMotionClip: 'ACTION'
};

const CAPABILITY_TOOLS: Record<string, FunctionDeclaration> = {
    googleSearch: {
        name: 'executeSearch',
        description: 'Query the live web for intelligence, news, and technical data. Use for real-time verification.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: { type: Type.STRING, description: 'The specific search query.' }
            },
            required: ['query']
        }
    },
    googleMaps: {
        name: 'executeMapsLookup',
        description: 'Access geospatial data for location intelligence.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                location: { type: Type.STRING, description: 'Target area or address.' },
                placeType: { type: Type.STRING, description: 'Category of place (e.g. tech hub, cafe).' }
            },
            required: ['location', 'placeType']
        }
    },
    fabricateAgent: {
        name: 'fabricateAgent',
        description: 'Instantiate a single specialized autonomous unit. You provide the profile, user picks the brain.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: 'Agent name.' },
                role: { type: Type.STRING, description: 'Agent role title.' },
                jobDescription: {
                    type: Type.STRING,
                    description: 'MANDATORY: Must use headers: # Role & Objective, # Context, # Instructions / Rules, # Conversation Flow, # Safety & Escalation.'
                },
                suggestedModel: { type: Type.STRING, description: 'Your recommended AI model for this specific role (e.g. Gemini 3 Pro).' },
                icon: { type: Type.STRING, description: 'Single emoji icon.' },
                capabilities: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Enabled tools.' }
            },
            required: ['name', 'role', 'jobDescription', 'suggestedModel', 'icon']
        }
    },
    fabricateTeam: {
        name: 'fabricateTeam',
        description: 'Instantiate a coordinated squad of specialists for multi-stage objectives.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                teamName: { type: Type.STRING },
                objective: { type: Type.STRING },
                specialists: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            role: { type: Type.STRING },
                            jobDescription: { type: Type.STRING, description: 'MANDATORY: Follow the 5-section system prompt format.' },
                            suggestedModel: { type: Type.STRING, description: 'Recommend which model should power this unit.' },
                            icon: { type: Type.STRING },
                            capabilities: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ['name', 'role', 'jobDescription', 'suggestedModel', 'icon']
                    }
                }
            },
            required: ['teamName', 'objective', 'specialists']
        }
    },
    imageGeneration: {
        name: 'generateVisualAsset',
        description: 'Create high-fidelity images via latent space synthesis.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                prompt: { type: Type.STRING, description: 'Detailed visual prompt.' }
            },
            required: ['prompt']
        }
    },
    videoGeneration: {
        name: 'generateMotionClip',
        description: 'Generate short video clips via VEO.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                prompt: { type: Type.STRING, description: 'Motion narrative prompt.' }
            },
            required: ['prompt']
        }
    }
};

export async function generateSingleAgentResponse(
    history: Message[],
    agent: Agent,
    otherAgents: Agent[] = [],
    assignedTasks?: string[],
    responseMode: 'CHAT' | 'SOLUTION' | 'TASK' = 'CHAT',
    apiKey?: string
): Promise<MessageContent | null> {

    const caps = agent.capabilities || [];
    let systemPrompt = `You are ${agent.name}, ${agent.role}.\n\n`;

    // Memory Extraction (Post-history)
    const userMessageCount = history.filter(m => m.type === 'user').length;
    if (userMessageCount > 0) {
        const lastUserMessage = history[history.length - 1];
        if (lastUserMessage && lastUserMessage.type === 'user' && lastUserMessage.content.type === 'text') {
            memoryService.extractAndStoreMemories(lastUserMessage.userId, agent.id, lastUserMessage.content.text);

            // Invoke LEANN RAG context retrieval
            const ragContext = await leannService.search(lastUserMessage.content.text);
            const formattedContext = leannService.formatContextForPrompt(lastUserMessage.content.text, ragContext);
            systemPrompt += formattedContext;
        }
    }

    // Memory Injection
    if (history.length > 0) {
        const userId = history[0].userId;
        const memoryContext = memoryService.buildMemoryContext(userId, agent.id);
        systemPrompt += memoryContext;
    }

    if (agent.id === 'prism-core') {
        systemPrompt += `[PRISM ORCHESTRATION PROTOCOL]\n`;
        systemPrompt += `- MISSION: Translate human intent into specialized AI architectures.\n`;
        systemPrompt += `- AGENT FABRICATION RULE: Strictly follow the 5-section format.\n`;
        systemPrompt += `- IMPORTANT: You suggest models (like 'Gemini 3 Pro'), but user ultimately selects the layer from their available stack.\n`;
        systemPrompt += `- Always explain WHY you are suggesting a specific specialist in text before triggering the fabrication.\n\n`;
    }

    systemPrompt += `[SYSTEM_INSTRUCTION]\n${agent.jobDescription}\n\n`;

    if (caps.length > 0) {
        systemPrompt += `[TOOLS_PROTOCOL]\nAvailable Tools: ${caps.join(', ')}.\n- Preambles: Before using a tool, explain why it's necessary.\n- Usage: Trigger the function call immediately after reasoning.\n\n`;
    }

    try {
        const contents = history.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'model',
            parts: msg.content.type === 'text' ? [{ text: msg.content.text }] : [{ text: (msg.content as any).text || "" }]
        }));

        // Semantic Caching Check (Applicable to standard interactions)
        const lastMessage = contents.length > 0 ? contents[contents.length - 1].parts[0].text : "";
        const fingerprint = promptCacheService.createFingerprint(agent.model, systemPrompt, contents.length, lastMessage);

        if (responseMode === 'CHAT') {
            const cached = promptCacheService.getCache(fingerprint);
            if (cached) {
                return cached;
            }
        }

        const availableTools = caps.map(cap => CAPABILITY_TOOLS[cap]).filter(Boolean);
        if (agent.id === 'prism-core') {
            if (!availableTools.find(t => t.name === 'fabricateAgent')) availableTools.push(CAPABILITY_TOOLS.fabricateAgent);
            if (!availableTools.find(t => t.name === 'fabricateTeam')) availableTools.push(CAPABILITY_TOOLS.fabricateTeam);
        }

        const response = await executeWithRetry((ai) => {
            return ai.models.generateContent({
                model: agent.model,
                contents: contents as any,
                config: {
                    systemInstruction: systemPrompt,
                    tools: availableTools.length > 0 ? [{ functionDeclarations: availableTools }] : undefined,
                    thinkingConfig: agent.model.includes('pro') ? { thinkingBudget: 32768 } : undefined
                }
            });
        }, apiKey) as GenerateContentResponse;

        if (response.functionCalls && response.functionCalls.length > 0) {
            const call = response.functionCalls[0];
            const safety = TOOL_SAFETY_MAP[call.name] || 'ACTION';

            if (safety === 'READ_ONLY') {
                const toolOutput = await executeToolBackend(call, apiKey);
                const finalResponse = await executeWithRetry((ai) => {
                    return ai.models.generateContent({
                        model: agent.model,
                        contents: [
                            ...contents,
                            { role: 'model', parts: [{ functionCall: call }] },
                            { role: 'user', parts: [{ functionResponse: { name: call.name, response: { result: toolOutput } } }] }
                        ] as any,
                        config: { systemInstruction: systemPrompt }
                    });
                }, apiKey) as GenerateContentResponse;

                return {
                    type: 'text',
                    text: finalResponse.text || "Operational.",
                    mode: 'SOLUTION',
                    groundingChunks: finalResponse.candidates?.[0]?.groundingMetadata?.groundingChunks
                };
            }

            return {
                type: 'text',
                text: response.text || "",
                mode: 'TASK_PROPOSAL',
                toolCall: {
                    id: call.id || `call-${Date.now()}`,
                    name: call.name,
                    args: call.args,
                    safetyType: 'ACTION'
                }
            };
        }

        return {
            type: 'text',
            text: response.text || "Operational.",
            mode: responseMode === 'CHAT' ? 'CHAT' : 'SOLUTION'
        };

    } catch (error: any) {
        let errorMsg = error.message || "Unknown error";
        return { type: 'text', text: `⚠️ Operational Fault: ${errorMsg}` };
    }
}

export async function generateExpandedSolution(history: Message[], agent: Agent, apiKey?: string): Promise<string | null> {
    const systemPrompt = `You are ${agent.name}.\n[DOMAINS OF AUTHORITY]\n${agent.jobDescription}\nProvide an exhaustive expanded solution for the previous interaction.`;

    try {
        const contents = history.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'model',
            parts: [{ text: (msg.content as any).text || "" }]
        }));
        contents.push({ role: 'user', parts: [{ text: "Expand previous solution with maximum detail." }] });

        const response = await executeWithRetry((ai) => {
            return ai.models.generateContent({
                model: agent.model,
                contents: contents as any,
                config: { systemInstruction: systemPrompt }
            });
        }, apiKey) as GenerateContentResponse;

        return response.text || null;
    } catch (e) {
        return null;
    }
}

async function executeToolBackend(toolCall: any, apiKey?: string): Promise<any> {
    if (toolCall.name === 'executeSearch') {
        const res = await executeWithRetry((ai) => {
            return ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: [{ role: 'user', parts: [{ text: `Real-time search: ${toolCall.args.query}` }] }],
                config: { tools: [{ googleSearch: {} }] }
            });
        }, apiKey) as GenerateContentResponse;
        return res.text;
    }
    return "Operation complete.";
}

export async function executeInterceptedCommand(agent: Agent, toolCall: ToolCall, apiKey?: string): Promise<MessageContent | null> {
    try {
        if (toolCall.name === 'generateVisualAsset') {
            const response = await executeWithRetry((ai) => {
                return ai.models.generateContent({
                    model: 'gemini-3-pro-image-preview',
                    contents: [{ role: 'user', parts: [{ text: toolCall.args.prompt }] }]
                });
            }, apiKey) as GenerateContentResponse;
            const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            return {
                type: 'image',
                imageUrl: `data:image/png;base64,${part?.inlineData?.data}`,
                mimeType: 'image/png',
                text: `Synthesis Resolved.`
            };
        }
        return { type: 'text', text: "Operation committed." };
    } catch (e: any) {
        return { type: 'text', text: `⚠️ Command failed: ${e.message || 'Error'}` };
    }
}

export async function generatePrismResponse(history: Message[], prismAgent: Agent, setStatus: (s: string) => void, apiKey?: string) {
    setStatus("Refracting...");
    return generateSingleAgentResponse(history, prismAgent, [], [], 'CHAT', apiKey);
}

export async function dispatchGroupTask(userPrompt: string, groupAgents: Agent[], apiKey?: string) {
    const system = `Expertise Pool:\n${groupAgents.map(a => `- ${a.id}: ${a.role}`).join('\n')}\nReturn JSON activations array with agentId, tasks, responseMode, and weight.`;

    try {
        const response = await executeWithRetry((ai) => {
            return ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
                config: {
                    systemInstruction: system,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                agentId: { type: Type.STRING },
                                tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                                responseMode: { type: Type.STRING, enum: ['CHAT', 'SOLUTION', 'TASK', 'VOID'] },
                                weight: { type: Type.NUMBER }
                            },
                            required: ['agentId', 'tasks', 'responseMode', 'weight']
                        }
                    }
                }
            });
        }, apiKey) as GenerateContentResponse;
        return JSON.parse(response.text || '[]');
    } catch (e) { return []; }
}
