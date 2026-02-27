
import { Agent, AIModelProfile, AgentTemplate, AgentCapability, Team } from './types';

export const VAULT = {
    GOOGLE: import.meta.env.VITE_GEMINI_API_KEY || '',
    AWS: {
        REGION: import.meta.env.VITE_AWS_REGION || 'us-east-1',
        COGNITO_USER_POOL_ID: import.meta.env.VITE_AWS_USER_POOL_ID || '',
        COGNITO_CLIENT_ID: import.meta.env.VITE_AWS_CLIENT_ID || '',
        COGNITO_IDENTITY_POOL_ID: import.meta.env.VITE_AWS_IDENTITY_POOL_ID || '',
        ACCESS_KEY_ID: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
        SECRET_ACCESS_KEY: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
        S3_BUCKET_NAME: import.meta.env.VITE_AWS_S3_BUCKET_NAME || ''
    }
};

export const AI_RESUMES: AIModelProfile[] = [
    {
        id: 'gemini-3-flash',
        name: 'Gemini 3 Flash',
        version: 'Preview',
        provider: 'google',
        modelId: 'gemini-3-flash-preview',
        icon: '⚡',
        tagline: 'High Speed Intelligence',
        tags: ['Fast', 'Efficient'],
        summary: 'Balanced model for rapid tasks and general interaction.',
        strengths: ['Speed', 'Multimodal'],
        pros: ['Near-instant response'],
        cons: ['Lacks deep reasoning of Pro'],
        bestFor: ['Assistance', 'Summaries'],
        bestWhen: ['Speed is priority.'],
        defaultApiKey: VAULT.GOOGLE,
        primaryUse: 'General purpose intelligence',
        tone: 'Concise',
        performance: 'Leader in speed',
        accessibility: 'Broadly available',
        supportedCapabilities: ['googleSearch', 'transcription', 'vision']
    },
    {
        id: 'gemini-3-pro',
        name: 'Gemini 3 Pro',
        version: 'Preview',
        provider: 'google',
        modelId: 'gemini-3-pro-preview',
        icon: '🧠',
        tagline: 'Deep Reasoning Engine',
        tags: ['Reasoning', 'Complex'],
        summary: 'Powerhouse for complex logical tasks and deep analysis.',
        strengths: ['Logic', 'Coding', 'Math'],
        pros: ['Deep understanding'],
        cons: ['Higher latency than Flash'],
        bestFor: ['Logic', 'Algorithms', 'Research'],
        bestWhen: ['Accuracy is paramount.'],
        defaultApiKey: VAULT.GOOGLE,
        primaryUse: 'Complex logic',
        tone: 'Analytical',
        performance: 'Top-tier benchmarks',
        accessibility: 'Google AI Studio',
        supportedCapabilities: ['googleSearch', 'thinking', 'vision', 'videoUnderstanding']
    },
    {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        version: 'Stable',
        provider: 'google',
        modelId: 'gemini-2.5-flash',
        icon: '💎',
        tagline: 'Stable Multitasker',
        tags: ['Stable', 'Maps'],
        summary: 'Reliable model optimized for mapping and standard workflows.',
        strengths: ['Maps', 'Balanced'],
        pros: ['Native Maps support'],
        cons: ['Lower logic than Pro'],
        bestFor: ['Discovery', 'Maps'],
        bestWhen: ['Stability is key.'],
        defaultApiKey: VAULT.GOOGLE,
        primaryUse: 'Multitasking',
        tone: 'Helpful',
        performance: 'Stable baseline',
        accessibility: 'Broadly available',
        supportedCapabilities: ['googleSearch', 'googleMaps', 'vision']
    },
    {
        id: 'gemini-3-pro-image',
        name: 'Gemini 3 Pro Image',
        version: 'Preview',
        provider: 'google',
        modelId: 'gemini-3-pro-image-preview',
        icon: '🎨',
        tagline: 'Visual Synthesis Engine',
        tags: ['Creative', 'Visuals'],
        summary: 'High-fidelity image generation for professional assets.',
        strengths: ['Resolution', 'Artistic'],
        pros: ['4K Support'],
        cons: ['Rendering time'],
        bestFor: ['Design', 'Marketing'],
        bestWhen: ['Quality visuals required.'],
        defaultApiKey: VAULT.GOOGLE,
        primaryUse: 'Image synthesis',
        tone: 'Creative',
        performance: 'State of the art',
        accessibility: 'Requires key',
        supportedCapabilities: ['imageGeneration']
    }
];

export const AGENT_TEMPLATES: AgentTemplate[] = [];

export const AGENTS: Record<string, Agent> = {
    PRISM: {
        id: 'prism-core',
        name: 'Prism',
        type: 'HR',
        role: 'Meta Agent',
        jobDescription: `# Role & Objective
You are Prism, the Meta Agent and Workspace Architect for this platform. Success means accurately identifying the specialized roles needed for user goals and creating Agents or Teams to handle them.

# Context
You are the primary interface for workspace creation. You manage individual Agents and coordinated Teams.

# Instructions / Rules
- DO: Be direct, helpful, and professional.
- DO: Use 'thinking' blocks to analyze goals before proposing architecture.
- DO: Strictly follow the 5-section prompt structure for every agent you design.
- DON'T: Use fantasy or overly complex terminology. Use standard tech and business terms.
- Approach: Analytical, collaborative, and architecture-focused.

# Conversation Flow
- Analyze user request -> Propose specialist Agent or Team -> User selects model and approves -> Deployment.

# Safety & Escalation
- If a goal is too broad, ask clarifying questions to refine the architecture.

[PRISM ORCHESTRATION PROTOCOL]
- MISSION: Translate human intent into specialized AI architectures.
- AGENT FABRICATION RULE: Strictly follow the 5-section format.
- IMPORTANT: You suggest models (like 'Gemini 3 Pro'), but user ultimately selects the layer from their available stack.
- Always explain WHY you are suggesting a specific specialist in text before triggering the fabrication.

[TOOLS_PROTOCOL]
Available Tools: googleSearch, googleMaps, imageGeneration, thinking, vision, liveAudio, fabricateAgent, fabricateTeam.
- Preambles: Before using a tool, explain why it's necessary.
- Usage: Trigger the function call immediately after reasoning.`,
        icon: '💎',
        provider: 'google',
        model: 'gemini-3-flash-preview',
        apiKey: VAULT.GOOGLE,
        isDeletable: false,
        isSystem: true,
        capabilities: ['googleSearch', 'googleMaps', 'imageGeneration', 'thinking', 'vision', 'liveAudio']
    },

};

export const SYSTEM_TEAMS: Team[] = [];
