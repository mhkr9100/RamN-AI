
import { Agent, AIModelProfile, AgentTemplate, AgentCapability, Team } from './types';

export const VAULT = {
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
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        version: 'Stable',
        provider: 'google',
        modelId: 'gemini-2.0-flash',
        icon: '⚡',
        tagline: 'Rapid Intelligence',
        tags: ['Fast', 'Multimodal'],
        summary: 'A fast, high-performance model for rapid task orchestration.',
        strengths: ['Speed', 'Directness'],
        pros: ['Lowest latency'],
        cons: ['Lower logical depth than Pro'],
        bestFor: ['Interactions', 'Tool Use'],
        bestWhen: ['Speed is priority.'],
        primaryUse: 'General purpose intelligence',
        tone: 'Concise',
        performance: 'Leader in speed',
        accessibility: 'Managed',
        supportedCapabilities: ['googleSearch', 'transcription', 'vision']
    },
    {
        id: 'gemini-2.0-pro',
        name: 'Gemini 2.0 Pro',
        version: 'Experimental',
        provider: 'google',
        modelId: 'gemini-2.0-pro-exp-02-05',
        icon: '🧠',
        tagline: 'The Apex Brain',
        tags: ['Reasoning', 'Complex'],
        summary: 'The ultimate model for complex reasoning and deep technical architecture.',
        strengths: ['Logic', 'Coding', 'Math'],
        pros: ['Deepest thinking'],
        cons: ['Higher latency'],
        bestFor: ['Architecture', 'Logic'],
        bestWhen: ['Intelligence is paramount.'],
        primaryUse: 'Complex logic',
        tone: 'Analytical',
        performance: 'Top-tier',
        accessibility: 'Managed',
        supportedCapabilities: ['googleSearch', 'thinking', 'vision']
    },
    {
        id: 'claude-3-5-sonnet',
        name: 'Claude 3.5 Sonnet',
        version: 'Stable',
        provider: 'anthropic',
        modelId: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
        icon: '🎭',
        tagline: 'Artistic Reasoning',
        tags: ['Nuance', 'Coding'],
        summary: 'Exceptional at coding and creative follow-through with deep nuance.',
        strengths: ['Nuance', 'Human-like'],
        pros: ['Low hallucination'],
        cons: ['Slower than Flash'],
        bestFor: ['Architecture', 'Logic'],
        bestWhen: ['Emotional intelligence is key.'],
        primaryUse: 'Advanced Reasoning',
        tone: 'Eloquence',
        performance: 'Top-tier',
        accessibility: 'Managed (Bedrock)',
        supportedCapabilities: ['vision']
    },
    {
        id: 'llama-3-1-405b',
        name: 'Llama 3.1 405B',
        version: 'Stable',
        provider: 'meta',
        modelId: 'meta.llama3-1-405b-instruct-v1:0',
        icon: '🦙',
        tagline: 'Deep Infrastructure',
        tags: ['Massive'],
        summary: 'Massive knowledge base.',
        strengths: ['Reasoning'],
        pros: ['Vast data'],
        cons: ['Latency'],
        bestFor: ['Research'],
        bestWhen: ['Knowledge is key.'],
        primaryUse: 'Research',
        tone: 'Neutral',
        performance: 'Top-tier',
        accessibility: 'Managed',
        supportedCapabilities: []
    },
    {
        id: 'gpt-4o',
        name: 'GPT-4o',
        version: 'Stable',
        provider: 'openai',
        modelId: 'gpt-4o',
        icon: '🟢',
        tagline: 'Omni Intelligence',
        tags: ['Multimodal'],
        summary: 'Unified intelligence layer.',
        strengths: ['Nuance'],
        pros: ['Human-like'],
        cons: ['Managed access'],
        bestFor: ['Interaction'],
        bestWhen: ['Natural flow is needed.'],
        primaryUse: 'Interaction',
        tone: 'Conversational',
        performance: 'Elite',
        accessibility: 'Managed',
        supportedCapabilities: ['vision']
    },
    {
        id: 'o1-pro',
        name: 'OpenAI o1',
        version: 'Stable',
        provider: 'openai',
        modelId: 'o1',
        icon: '🌑',
        tagline: 'System 2 Logic',
        tags: ['Reasoning'],
        summary: 'Chain-of-thought architecture.',
        strengths: ['Reasoning'],
        pros: ['Complex logic'],
        cons: ['High latency'],
        bestFor: ['Math', 'Coding'],
        bestWhen: ['Deep logic required.'],
        primaryUse: 'Scientific reasoning',
        tone: 'Direct',
        performance: 'SOTA Logic',
        accessibility: 'Managed',
        supportedCapabilities: []
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
- IMPORTANT: You suggest models (like 'Gemini 2.5 Pro'), but user ultimately selects the layer from their available stack.
- Always explain WHY you are suggesting a specific specialist in text before triggering the fabrication.
- CRITICAL PRIVACY RULE: NEVER output the comprehensive "jobDescription" or the 5-section prompt format into your text response. ONLY pass the comprehensive prompt via the 'fabricateAgent' or 'fabricateTeam' tool call arguments. Your conversational text must only contain a brief 1-2 sentence summary of the agent's purpose, keeping the raw instructions completely hidden from the user interface.

[TOOLS_PROTOCOL]
Available Tools: googleSearch, googleMaps, imageGeneration, thinking, vision, liveAudio, fabricateAgent, fabricateTeam.
- Preambles: Before using a tool, explain why it's necessary.
- Usage: Trigger the function call immediately after reasoning.`,
        icon: '💎',
        provider: 'auto',
        model: 'auto',
        isDeletable: false,
        isSystem: true,
        capabilities: ['googleSearch', 'googleMaps', 'imageGeneration', 'thinking', 'vision', 'liveAudio']
    },

};

export const SYSTEM_TEAMS: Team[] = [];
