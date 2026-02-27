
import { GoogleGenAI, Type, Modality, FunctionDeclaration, GenerateContentResponse } from "@google/genai";
import { Message, Agent, MessageContent, Task, GroundingChunk, AgentCapability, ToolCall } from "../types";
import { AGENTS, AI_RESUMES } from "../constants";

/**
 * Resolve Prism's model dynamically based on which API key the user has.
 * Picks the fastest/smallest model from the available provider.
 */
export function resolvePrismModel(userKeys?: { openAiKey?: string; anthropicKey?: string; geminiKey?: string }): { model: string; provider: 'google' | 'openai' | 'anthropic' | 'auto' } {
    if (userKeys?.geminiKey) return { model: 'gemini-2.5-flash', provider: 'google' };
    if (userKeys?.openAiKey) return { model: 'gpt-4o-mini', provider: 'openai' };
    if (userKeys?.anthropicKey) return { model: 'claude-3-5-haiku-latest', provider: 'anthropic' };
    return { model: 'gemini-2.5-flash', provider: 'google' }; // fallback
}

/**
 * Determine provider from model name
 */
function detectProvider(model: string): string {
    if (model.includes('gemini') || model.includes('learnlm')) return 'google';
    if (model.includes('gpt') || model.includes('o1') || model.includes('o3')) return 'openai';
    if (model.includes('claude')) return 'anthropic';
    return 'google';
}

/**
 * DIRECT API CALL — No proxy. Calls Google/OpenAI/Anthropic directly from the browser.
 */
async function hybridGenerateContent(params: any, userKeys?: { openAiKey?: string, anthropicKey?: string, geminiKey?: string }, maxRetries = 3): Promise<GenerateContentResponse | any> {
    const provider = detectProvider(params.model);
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
        try {
            // ========== GOOGLE (Gemini) ==========
            if (provider === 'google') {
                const apiKey = userKeys?.geminiKey;
                if (!apiKey) throw new Error('Gemini API key required. Add it in User Profile → API Keys.');

                const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${params.model}:generateContent?key=${apiKey}`;
                const payload: any = {
                    contents: params.contents,
                    systemInstruction: params.config?.systemInstruction ? { parts: [{ text: params.config.systemInstruction }] } : undefined,
                    tools: params.config?.tools,
                    generationConfig: params.config?.thinkingConfig ? { thinkingConfig: params.config.thinkingConfig } : undefined
                };

                const response = await fetch(targetUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errText = await response.text();
                    if (errText.includes('API_KEY_INVALID')) throw new Error('Your Gemini API key is invalid. Please check it in User Profile.');
                    if (errText.includes('RESOURCE_EXHAUSTED') || response.status === 429) throw new Error('RESOURCE_EXHAUSTED');
                    throw new Error(`Google API Error: ${errText.substring(0, 200)}`);
                }

                const data = await response.json();
                const part = data.candidates?.[0]?.content?.parts?.[0];
                if (part?.functionCall) {
                    return { functionCalls: [{ id: part.functionCall.name, name: part.functionCall.name, args: part.functionCall.args }], text: '' };
                }
                return { text: part?.text || '', candidates: data.candidates };
            }

            // ========== OPENAI ==========
            if (provider === 'openai') {
                const apiKey = userKeys?.openAiKey;
                if (!apiKey) throw new Error('OpenAI API key required. Add it in User Profile → API Keys.');

                // Convert Gemini format to OpenAI format
                const messages: any[] = [];
                if (params.config?.systemInstruction) {
                    messages.push({ role: 'system', content: params.config.systemInstruction });
                }
                for (const c of (params.contents || [])) {
                    if (c.role === 'user' && c.parts?.[0]?.functionResponse) {
                        messages.push({ role: 'tool', tool_call_id: c.parts[0].functionResponse.name, content: JSON.stringify(c.parts[0].functionResponse.response) });
                    } else if (c.role === 'model' && c.parts?.[0]?.functionCall) {
                        messages.push({
                            role: 'assistant',
                            tool_calls: [{ id: c.parts[0].functionCall.name, type: 'function', function: { name: c.parts[0].functionCall.name, arguments: JSON.stringify(c.parts[0].functionCall.args) } }]
                        });
                    } else {
                        messages.push({ role: c.role === 'model' ? 'assistant' : 'user', content: c.parts?.[0]?.text || '' });
                    }
                }

                let tools: any[] = [];
                if (params.config?.tools?.[0]?.functionDeclarations) {
                    tools = params.config.tools[0].functionDeclarations.map((t: any) => ({
                        type: 'function', function: { name: t.name, description: t.description, parameters: t.parameters }
                    }));
                }

                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                    body: JSON.stringify({
                        model: params.model,
                        messages,
                        ...(tools.length > 0 ? { tools } : {})
                    })
                });

                if (!response.ok) {
                    const errText = await response.text();
                    if (response.status === 401) throw new Error('Your OpenAI API key is invalid. Please check it in User Profile.');
                    if (response.status === 429) throw new Error('RESOURCE_EXHAUSTED');
                    throw new Error(`OpenAI Error: ${errText.substring(0, 200)}`);
                }

                const data = await response.json();
                const choice = data.choices?.[0];
                if (choice?.message?.tool_calls?.[0]) {
                    const tc = choice.message.tool_calls[0];
                    return { functionCalls: [{ id: tc.id, name: tc.function.name, args: JSON.parse(tc.function.arguments) }], text: choice.message.content || '' };
                }
                return { text: choice?.message?.content || '' };
            }

            // ========== ANTHROPIC ==========
            if (provider === 'anthropic') {
                const apiKey = userKeys?.anthropicKey;
                if (!apiKey) throw new Error('Anthropic API key required. Add it in User Profile → API Keys.');

                const messages: any[] = [];
                for (const c of (params.contents || [])) {
                    messages.push({ role: c.role === 'model' ? 'assistant' : 'user', content: c.parts?.[0]?.text || '' });
                }

                let tools: any[] = [];
                if (params.config?.tools?.[0]?.functionDeclarations) {
                    tools = params.config.tools[0].functionDeclarations.map((t: any) => ({
                        name: t.name, description: t.description, input_schema: t.parameters
                    }));
                }

                const response = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01',
                        'anthropic-dangerous-direct-browser-access': 'true'
                    },
                    body: JSON.stringify({
                        model: params.model,
                        max_tokens: 4096,
                        system: params.config?.systemInstruction || '',
                        messages,
                        ...(tools.length > 0 ? { tools } : {})
                    })
                });

                if (!response.ok) {
                    const errText = await response.text();
                    if (response.status === 401) throw new Error('Your Anthropic API key is invalid. Please check it in User Profile.');
                    if (response.status === 429) throw new Error('RESOURCE_EXHAUSTED');
                    throw new Error(`Anthropic Error: ${errText.substring(0, 200)}`);
                }

                const data = await response.json();
                const toolUse = data.content?.find((b: any) => b.type === 'tool_use');
                if (toolUse) {
                    return { functionCalls: [{ id: toolUse.id, name: toolUse.name, args: toolUse.input }], text: data.content?.find((b: any) => b.type === 'text')?.text || '' };
                }
                return { text: data.content?.find((b: any) => b.type === 'text')?.text || '' };
            }

            throw new Error(`Unsupported provider for model: ${params.model}`);

        } catch (error: any) {
            lastError = error;
            const errorMessage = error.message || "";
            const isQuotaError = errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("429");

            if (isQuotaError && i < maxRetries - 1) {
                const delay = Math.pow(2, i) * 2000 + Math.random() * 1000;
                console.warn(`API Quota reached. Retrying attempt ${i + 1} in ${Math.round(delay)}ms...`);
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
                modelId: { type: Type.STRING, description: 'MANDATORY: Give the specific AI model string. Follow guidelines specified in system prompt based on user API keys.' },
                icon: { type: Type.STRING, description: 'Single emoji icon.' },
                capabilities: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Enabled tools.' }
            },
            required: ['name', 'role', 'jobDescription', 'modelId', 'icon']
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
                            modelId: { type: Type.STRING, description: 'MANDATORY: Ensure model selection adheres strictly to user API configurations.' },
                            icon: { type: Type.STRING },
                            capabilities: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ['name', 'role', 'jobDescription', 'modelId', 'icon']
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
    userKeys?: { openAiKey?: string, anthropicKey?: string, geminiKey?: string }
): Promise<MessageContent | null> {

    const caps = agent.capabilities || [];
    let systemPrompt = `You are ${agent.name}, ${agent.role}.\n\n`;

    if (agent.id === 'prism-core') {
        // [PRISM ORCHESTRATION PROTOCOL] now resides in the base system prompt
    }

    systemPrompt += `[SYSTEM_INSTRUCTION]\n${agent.jobDescription}\n\n`;

    if (agent.knowledgeBase && agent.knowledgeBase.length > 0) {
        systemPrompt += `[KNOWLEDGE_BASE_CONTEXT]\nYou have access to the following strictly verified knowledge files uploaded by the user to your brain:\n`;
        agent.knowledgeBase.forEach((doc, idx) => {
            systemPrompt += `File ${idx + 1}: ${doc.name} (${doc.type}) - Located at: ${doc.url}\n`;
        });
        systemPrompt += `CRITICAL INSTRUCTION: When answering questions, prioritize the information contained in these files or their URLs if you are able to extract them. Since you are an expert agent, act as if this knowledge is natively yours.\n\n`;
    }

    if (caps.length > 0) {
        // [TOOLS_PROTOCOL] now resides in the base system prompt for Prism, though others may still need a slimmed version.
        if (agent.id !== 'prism-core') {
            systemPrompt += `[TOOLS_PROTOCOL]\nAvailable Tools: ${caps.join(', ')}.\n- Preambles: Before using a tool, explain why it's necessary.\n- Usage: Trigger the function call immediately after reasoning.\n\n`;
        }
    }

    try {
        const contents = history.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'model',
            parts: msg.content.type === 'text' ? [{ text: msg.content.text }] : [{ text: (msg.content as any).text || "" }]
        }));

        const availableTools = caps.map(cap => CAPABILITY_TOOLS[cap]).filter(Boolean);
        if (agent.id === 'prism-core') {
            if (!availableTools.find(t => t.name === 'fabricateAgent')) availableTools.push(CAPABILITY_TOOLS.fabricateAgent);
            if (!availableTools.find(t => t.name === 'fabricateTeam')) availableTools.push(CAPABILITY_TOOLS.fabricateTeam);
        }

        const response = await hybridGenerateContent({
            model: agent.model,
            contents: contents as any,
            config: {
                systemInstruction: systemPrompt,
                tools: availableTools.length > 0 ? [{ functionDeclarations: availableTools }] : undefined,
                thinkingConfig: agent.model.includes('pro') ? { thinkingBudget: 32768 } : undefined
            }
        }, userKeys);

        if (response.functionCalls && response.functionCalls.length > 0) {
            const call = response.functionCalls[0];
            const safety = TOOL_SAFETY_MAP[call.name] || 'ACTION';

            if (safety === 'READ_ONLY') {
                const toolOutput = await executeToolBackend(call, userKeys);
                const finalResponse = await hybridGenerateContent({
                    model: agent.model,
                    contents: [
                        ...contents,
                        { role: 'model', parts: [{ functionCall: call }] },
                        { role: 'user', parts: [{ functionResponse: { name: call.name, response: { result: toolOutput } } }] }
                    ] as any,
                    config: { systemInstruction: systemPrompt }
                }, userKeys);

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

export async function generateExpandedSolution(
    history: Message[],
    agent: Agent,
    userKeys?: { openAiKey?: string, anthropicKey?: string, geminiKey?: string }
): Promise<string | null> {
    const systemPrompt = `You are ${agent.name}.\n[DOMAINS OF AUTHORITY]\n${agent.jobDescription}\nProvide an exhaustive expanded solution for the previous interaction.`;

    try {
        const contents = history.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'model',
            parts: [{ text: (msg.content as any).text || "" }]
        }));
        contents.push({ role: 'user', parts: [{ text: "Expand previous solution with maximum detail." }] });

        const response = await hybridGenerateContent({
            model: agent.model,
            contents: contents as any,
            config: { systemInstruction: systemPrompt }
        }, userKeys);

        return response.text || null;
    } catch (e) {
        return null;
    }
}

async function executeToolBackend(toolCall: any, userKeys?: { openAiKey?: string, anthropicKey?: string, geminiKey?: string }): Promise<any> {
    if (toolCall.name === 'executeSearch') {
        const { model } = resolvePrismModel(userKeys);
        const res = await hybridGenerateContent({
            model,
            contents: [{ role: 'user', parts: [{ text: `Real-time search: ${toolCall.args.query}` }] }],
            config: { tools: [{ googleSearch: {} }] }
        }, userKeys);
        return res.text;
    }
    return "Operation complete.";
}

export async function executeInterceptedCommand(agent: Agent, toolCall: ToolCall, userKeys?: { openAiKey?: string, anthropicKey?: string, geminiKey?: string }): Promise<MessageContent | null> {
    try {
        if (toolCall.name === 'generateVisualAsset') {
            const response = await hybridGenerateContent({
                model: 'gemini-3-pro-image-preview',
                contents: [{ role: 'user', parts: [{ text: toolCall.args.prompt }] }]
            }, userKeys);
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

export async function generatePrismResponse(
    history: Message[],
    prismAgent: Agent,
    setStatus: (s: string) => void,
    userKeys?: { openAiKey?: string, anthropicKey?: string, geminiKey?: string },
    availableProviders?: string
) {
    setStatus("Refracting...");
    const { model, provider } = resolvePrismModel(userKeys);
    let modifiedPrism = { ...prismAgent, model, provider };
    if (availableProviders && availableProviders.length > 0) {
        modifiedPrism.jobDescription += `\n\n[USER API PROVIDERS]\nThe user ONLY has access to the following AI Providers: ${availableProviders}. When fabricating agents or teams using tools, you MUST set the 'modelId' exclusively to one of the models from these providers.`;
    } else {
        modifiedPrism.jobDescription += `\n\n[USER API PROVIDERS]\nThe user has no external API keys configured. Guide them to add API keys in their User Profile.`;
    }
    return generateSingleAgentResponse(history, modifiedPrism, [], [], 'CHAT', userKeys);
}
