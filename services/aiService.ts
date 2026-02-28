
import { GoogleGenAI, Type, Modality, FunctionDeclaration, GenerateContentResponse } from "@google/genai";
import { Message, Agent, MessageContent, Task, GroundingChunk, AgentCapability, ToolCall } from "../types";
import { AGENTS, AI_RESUMES } from "../constants";
import { canMakeRequest, recordRequest } from "./rateLimiter";
import { userMapService } from "./userMapService";

// ─── Platform-managed API key (RamN provides this, users don't touch it) ───
const PLATFORM_GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const PLATFORM_GCP_PROJECT_ID = import.meta.env.VITE_GCP_PROJECT_ID as string;
const PLATFORM_GCP_LOCATION = (import.meta.env.VITE_GCP_LOCATION as string) || 'us-central1';

/**
 * RamN AI always uses Gemini 2.0 Flash — platform managed.
 * No user API keys required.
 */
export function resolvePrismModel(): { model: string; provider: 'google' } {
    return { model: 'gemini-2.0-flash', provider: 'google' };
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
 * PLATFORM-MANAGED GENERATE CONTENT
 * All calls use the RamN-provided Gemini key (env var).
 * Supports Context Caching via `cachedContent` param to cut token costs for long user contexts.
 */
export async function hybridGenerateContent(
    params: any,
    _userKeys?: any, // kept for signature compatibility — ignored, platform key is used
    maxRetries = 3,
    contextInfo?: { userId: string, agentId?: string }
): Promise<GenerateContentResponse | any> {
    const provider = detectProvider(params.model);
    let lastError: any;

    // --- INTEGRATED USERMAP (LONG-TERM MEMORY) ---
    // Instead of old AWS backend, we use the local/cloud userMapService
    let injectedMemoryContext = '';

    if (contextInfo?.userId) {
        const lastUserMessage = params.contents?.slice().reverse().find((c: any) => c.role === 'user')?.parts?.[0]?.text;

        if (lastUserMessage) {
            try {
                const facts = await userMapService.getRelevantContext(contextInfo.userId, lastUserMessage);
                if (facts) {
                    injectedMemoryContext = facts;
                }
            } catch (e) {
                console.error('[UserMap Memory Search Error]', e);
            }
        }
    }

    // Inject memory into system prompt if exists
    if (injectedMemoryContext) {
        params.config = params.config || {};
        params.config.systemInstruction = (params.config.systemInstruction || '') + injectedMemoryContext;
    }
    // ----------------------------------------------

    for (let i = 0; i < maxRetries; i++) {
        try {
            const rateCheck = canMakeRequest('google');
            if (!rateCheck.allowed) {
                const secs = Math.ceil((rateCheck.retryAfterMs || 5000) / 1000);
                throw new Error(`Rate limit hit. Please wait ${secs} seconds.`);
            }
            recordRequest('google');

            // ========== GEMINI (Platform Managed) ==========
            const apiKey = PLATFORM_GEMINI_KEY;
            if (!apiKey) throw new Error('[RamN] Platform Gemini key not configured. Contact support.');

            // Context Caching: if cachedContent ID is passed, use it to skip re-sending large context
            const cachedContentId: string | undefined = params.cachedContentId;

            const payload: any = {
                contents: params.contents,
                tools: params.config?.tools,
                generationConfig: {
                    ...(params.config?.thinkingConfig ? { thinkingConfig: params.config.thinkingConfig } : {}),
                    temperature: 0.7,
                    topP: 0.95,
                }
            };

            // If using a cached context, reference it — otherwise send full system instruction
            if (cachedContentId) {
                payload.cachedContent = cachedContentId;
            } else {
                payload.systemInstruction = params.config?.systemInstruction
                    ? { parts: [{ text: params.config.systemInstruction }] }
                    : undefined;
            }

            const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${params.model}:generateContent?key=${apiKey}`;

            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errText = await response.text();
                if (errText.includes('API_KEY_INVALID')) throw new Error('[RamN] Platform API key is invalid. Contact support.');
                if (errText.includes('RESOURCE_EXHAUSTED')) throw new Error('Platform rate limit reached. Please try again in a moment.');
                throw new Error(`Google API error: ${response.statusText}`);
            }

            const data = await response.json();
            const part = data.candidates?.[0]?.content?.parts?.[0];
            if (part?.functionCall) {
                return { functionCalls: [{ id: part.functionCall.name, name: part.functionCall.name, args: part.functionCall.args }], text: '' };
            }
            return { text: part?.text || '', candidates: data.candidates };

        } catch (error: any) {
            lastError = error;
            if (error.message.includes("RESOURCE_EXHAUSTED") && i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
                continue;
            }
            throw error;
        }
    }
    throw lastError;
}

const TOOL_SAFETY_MAP: Record<string, 'READ_ONLY' | 'ACTION'> = {
    executeSearch: 'READ_ONLY',
    executeMarketResearch: 'READ_ONLY',
    generateVisualAsset: 'ACTION',
    fabricateAgent: 'ACTION',
    fabricateTeam: 'ACTION'
};

const CAPABILITY_TOOLS: Record<string, FunctionDeclaration> = {
    googleSearch: {
        name: 'executeSearch',
        description: 'Query the live web for real-time intelligence.',
        parameters: {
            type: Type.OBJECT,
            properties: { query: { type: Type.STRING } },
            required: ['query']
        }
    },
    marketResearch: {
        name: 'executeMarketResearch',
        description: 'Deep analyze industry trends, competitors, and sentiment.',
        parameters: {
            type: Type.OBJECT,
            properties: { topic: { type: Type.STRING } },
            required: ['topic']
        }
    },
    imageGeneration: {
        name: 'generateVisualAsset',
        description: 'Create high-fidelity images via DALL-E or Imagen.',
        parameters: {
            type: Type.OBJECT,
            properties: { prompt: { type: Type.STRING } },
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
    _userKeys?: any, // kept for signature compat — ignored
    userId?: string
): Promise<MessageContent | null> {

    const caps = agent.capabilities || [];
    let systemPrompt = `You are ${agent.name}, ${agent.role}.\n\n[SYSTEM_INSTRUCTION]\n${agent.jobDescription}\n\n`;

    // Inject UserMap context for stability and recall
    if (userId) {
        const lastMsg = history.length > 0 ? history[history.length - 1].content.text : '';
        const userRecall = await userMapService.getRelevantContext(userId, lastMsg);
        systemPrompt += userRecall;
    }

    try {
        const contents = history.map(msg => ({
            role: MsgRole(msg.type),
            parts: [{ text: (msg.content as any).text || "" }]
        }));

        const availableTools = caps.map(cap => CAPABILITY_TOOLS[cap]).filter(Boolean);

        const response = await hybridGenerateContent({
            model: agent.model,
            contents: contents as any,
            config: {
                systemInstruction: systemPrompt,
                tools: availableTools.length > 0 ? [{ functionDeclarations: availableTools }] : undefined,
                thinkingConfig: agent.model.includes('pro') ? { thinkingBudget: 32768 } : undefined
            }
        }, undefined, 3, { userId: userId || '', agentId: agent.id });

        if (response.functionCalls && response.functionCalls.length > 0) {
            const call = response.functionCalls[0];
            return {
                type: 'text',
                text: response.text || "Initiating tool sequence...",
                mode: 'TASK_PROPOSAL',
                toolCall: {
                    id: call.id || `call-${Date.now()}`,
                    name: call.name,
                    args: call.args,
                    safetyType: TOOL_SAFETY_MAP[call.name] || 'ACTION'
                }
            };
        }

        return {
            type: 'text',
            text: response.text || "Operational.",
            mode: responseMode === 'CHAT' ? 'CHAT' : 'SOLUTION'
        };

    } catch (error: any) {
        return { type: 'text', text: `⚠️ Operational Fault: ${error.message}` };
    }
}

function MsgRole(type: string): string {
    return type === 'user' ? 'user' : 'model';
}

export async function generatePrismResponse(
    history: Message[],
    prismAgent: Agent,
    setStatus: (s: string) => void,
    _userKeys?: any, // kept for signature compat — ignored, platform managed
    _availableProviders?: string,
    userId?: string
) {
    setStatus("Refracting...");
    const { model, provider } = resolvePrismModel();
    let modifiedPrism = { ...prismAgent, model, provider };

    // Inject tool catalog context if available
    try {
        const { getToolCatalog, getToolCatalogSummary } = await import('./toolService');
        const catalog = await getToolCatalog();
        if (catalog.length > 0) {
            const catalogSummary = getToolCatalogSummary(catalog);
            modifiedPrism.jobDescription += `\n\n[TOOL_CATALOG]\n${catalogSummary}`;
        }
    } catch { }

    return generateSingleAgentResponse(history, modifiedPrism, [], [], 'CHAT', undefined, userId);
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

export async function executeInterceptedCommand(agent: Agent, toolCall: ToolCall, userKeys?: { openAiKey?: string, anthropicKey?: string, geminiKey?: string }): Promise<MessageContent | null> {
    try {
        if (toolCall.name === 'generateVisualAsset') {
            // GEMINI — native image generation
            if (userKeys?.geminiKey) {
                const response = await hybridGenerateContent({
                    model: 'gemini-2.0-flash',
                    contents: [{ role: 'user', parts: [{ text: toolCall.args.prompt }] }]
                }, userKeys);
                const part = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
                if (part?.inlineData?.data) {
                    return {
                        type: 'image',
                        imageUrl: `data:image/png;base64,${part.inlineData.data}`,
                        mimeType: 'image/png',
                        text: `Synthesis Resolved.`
                    };
                }
            }
            // OPENAI — DALL-E 3
            if (userKeys?.openAiKey) {
                const response = await fetch('https://api.openai.com/v1/images/generations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userKeys.openAiKey}` },
                    body: JSON.stringify({ model: 'dall-e-3', prompt: toolCall.args.prompt, n: 1, size: '1024x1024', response_format: 'url' })
                });
                if (response.ok) {
                    const data = await response.json();
                    const url = data.data?.[0]?.url;
                    if (url) return { type: 'image', imageUrl: url, mimeType: 'image/png', text: 'Synthesis Resolved.' };
                }
            }
            return { type: 'text', text: '⚠️ Image generation requires a valid Gemini or OpenAI API key.' };
        }
        return { type: 'text', text: "Operation committed." };
    } catch (e: any) {
        return { type: 'text', text: `⚠️ Command failed: ${e.message || 'Error'}` };
    }
}
