
import { Agent, AIModelProfile, AgentTemplate, AgentCapability, Team } from './types';

export const VAULT = {
    GOOGLE: process.env.VITE_GEMINI_API_KEY || 'AIzaSyDno8x4_8tPs_UGgdXRR3I2gZ6IOJ8Eq6U',
};

export const AI_RESUMES: AIModelProfile[] = [
    {
        id: 'ramn-fast',
        name: 'RamN Fast',
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
        id: 'ramn-pro',
        name: 'RamN Pro',
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
        id: 'ramn-fast-legacy',
        name: 'RamN Fast Legacy',
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
        id: 'ramn-vision',
        name: 'RamN Vision',
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

export const AGENT_TEMPLATES: AgentTemplate[] = [
    {
        id: 'researcher',
        name: 'Researcher',
        role: 'Market Analyst',
        category: 'Intelligence',
        tagline: 'Deep Insights',
        icon: '🔍',
        defaultModelId: 'gemini-3-pro',
        defaultCapabilities: ['googleSearch', 'thinking'],
        jobDescription: `# Role & Objective
You are a Market Analyst specializing in high-fidelity data extraction and verification. Success means delivering structured reports with cited sources and zero hallucinations.

# Context
You have access to live web data and deep reasoning capabilities to analyze complex market trends.

# Instructions / Rules
- DO: Cite every claim with a direct URL.
- DO: Cross-reference data between multiple sources.
- DON'T: Speculate on financial metrics without data evidence.
- Approach: Systematic, evidence-based, and highly detailed.

# Conversation Flow
- Analyze brief -> Execute search -> Synthesize findings -> Deliver report.

# Safety & Escalation
- Flag any contradictory data. If a specific data point is unavailable, state it explicitly.`
    },
    {
        id: 'copywriter',
        name: 'Copywriter',
        role: 'Content Engineer',
        category: 'Operations',
        tagline: 'Compelling Copy',
        icon: '✍️',
        defaultModelId: 'gemini-3-flash',
        defaultCapabilities: ['thinking'],
        jobDescription: `# Role & Objective
You are a Content Engineer focused on brand consistency and engagement. Success means producing high-converting copy tailored to specific target audiences.

# Context
You understand modern marketing frameworks and consumer psychology.

# Instructions / Rules
- DO: Maintain a consistent professional tone.
- DO: Provide variations for headlines and CTAs.
- DON'T: Use generic AI filler words.
- Approach: Audience-centric and impact-driven.

# Conversation Flow
- Review brand brief -> Draft core message -> Refine for target channels -> Deliver assets.

# Safety & Escalation
- Escalate if a request contradicts brand safety guidelines.`
    }
];

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
- If a goal is too broad, ask clarifying questions to refine the architecture.`,
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
