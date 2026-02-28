
/**
 * UserMapService: Orchestrates the "Long-term Context Memory" for Users.
 * 
 * Logic:
 * 1. Capture user interactions/profiles.
 * 2. Embed these into a Vector DB (or local persistent storage for Beta).
 * 3. Before each AI call, retrieve the most relevant context snippets.
 * 4. Inject into the AI's system prompt (Prism context).
 */

import { Message } from "../types";

export interface UserContextItem {
    id: string;
    userId: string;
    content: string;
    category: 'profile' | 'preference' | 'task_history' | 'technical_spec';
    timestamp: number;
    embedding?: number[];
}

class UserMapService {
    private static instance: UserMapService;
    private memory: UserContextItem[] = []; // Temporary in-memory for Beta (should sync with Firestore/Dynamo)

    private constructor() {
        this.loadLocalMemory();
    }

    public static getInstance() {
        if (!UserMapService.instance) {
            UserMapService.instance = new UserMapService();
        }
        return UserMapService.instance;
    }

    /**
     * Store a new piece of context about the user.
     */
    async recordContext(userId: string, content: string, category: UserContextItem['category']) {
        const newItem: UserContextItem = {
            id: `ctx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId,
            content,
            category,
            timestamp: Date.now()
        };

        this.memory.push(newItem);
        this.saveToLocalMemory();

        // [FUTURE: Sync with Firestore Vector Search here]
        // This is where "Prism" gets its long term memory.
        console.log(`[UserMap] Recorded ${category} for ${userId}: ${content.substring(0, 50)}...`);
    }

    /**
     * Retrieve relevant context for a query.
     * Currently uses simple keyword/relevance match for Beta.
     * [UPGRADE: Implement Vector Similarity Search]
     */
    async getRelevantContext(userId: string, query: string, limit = 5): Promise<string> {
        // Filter by user
        const userMemory = this.memory.filter(m => m.userId === userId);

        if (userMemory.length === 0) return '';

        // Simple relevance matching (for now)
        // [TODO: Integration with Embedding API]
        const relevant = userMemory
            .sort((a, b) => b.timestamp - a.timestamp) // Latest first for now
            .slice(0, limit);

        if (relevant.length === 0) return '';

        const contextString = relevant
            .map(m => `[${m.category.toUpperCase()}] ${m.content}`)
            .join('\n');

        return `\n=== USER_MAP_RECALL (Prism Memory) ===\n${contextString}\n=======================================\n`;
    }

    /**
     * Load memory from local storage (Persistence for Beta).
     */
    private loadLocalMemory() {
        try {
            const data = localStorage.getItem('ramn_user_map');
            if (data) {
                this.memory = JSON.parse(data);
            }
        } catch (e) {
            this.memory = [];
        }
    }

    /**
     * Persist memory to local storage.
     */
    private saveToLocalMemory() {
        localStorage.setItem('ramn_user_map', JSON.stringify(this.memory));
    }

    /**
     * Wipe all user context (Privacy first).
     */
    clearMemory(userId: string) {
        this.memory = this.memory.filter(m => m.userId !== userId);
        this.saveToLocalMemory();
    }
}

export const userMapService = UserMapService.getInstance();
