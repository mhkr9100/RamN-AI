/**
 * Memory Layer (Phase 5)
 * 
 * Provides long-term memory extraction and injection via localStorage.
 * Scoped by userId and agentId.
 */

import { Message } from '../types';

export interface MemoryEntry {
    id: string;
    userId: string;
    agentId: string;
    fact: string;
    timestamp: number;
}

const MEMORY_STORAGE_KEY = 'ramn_ai_memories';

export const memoryService = {
    // Retrieve memories from localStorage
    getMemories(userId: string, agentId: string): MemoryEntry[] {
        try {
            const stored = localStorage.getItem(MEMORY_STORAGE_KEY);
            if (!stored) return [];
            const allMemories: MemoryEntry[] = JSON.parse(stored);
            return allMemories.filter(m => m.userId === userId && (m.agentId === agentId || m.agentId === 'global'));
        } catch (e) {
            console.error("Failed to parse memories", e);
            return [];
        }
    },

    // Save new memory
    saveMemory(userId: string, agentId: string, fact: string) {
        try {
            const stored = localStorage.getItem(MEMORY_STORAGE_KEY);
            const allMemories: MemoryEntry[] = stored ? JSON.parse(stored) : [];

            const newMemory: MemoryEntry = {
                id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                userId,
                agentId,
                fact,
                timestamp: Date.now()
            };

            allMemories.push(newMemory);
            localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(allMemories));
        } catch (e) {
            console.error("Failed to save memory", e);
        }
    },

    // Heuristic extraction of facts from assistant responses or user prompts
    extractAndStoreMemories(userId: string, agentId: string, text: string) {
        // Basic heuristic patterns for memory extraction
        const patterns = [
            /i (am|like|love|hate|prefer|want|need|work as|live in) ([^.,!?\n]+)/ig,
            /my (name is|favorite|goal is|job is) ([^.,!?\n]+)/ig,
            /remember that ([^.,!?\n]+)/ig
        ];

        const extractedFacts = new Set<string>();

        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                // e.g., "I like apples" -> "User likes apples"
                // Let's just store the exact match context for now
                const fact = match[0].trim();
                extractedFacts.add(fact);
            }
        }

        // Store unique facts
        extractedFacts.forEach(fact => {
            this.saveMemory(userId, agentId, fact);
            console.log(`[Memory Extracted]: ${fact}`);
        });
    },

    // Build a memory context string to prepend to system prompts
    buildMemoryContext(userId: string, agentId: string): string {
        const memories = this.getMemories(userId, agentId);
        if (memories.length === 0) return "";

        const factsList = memories.map(m => `- ${m.fact}`).join("\n");
        return `\n\n=== LONG-TERM MEMORY ===\nYou have the following facts stored about this user/context:\n${factsList}\n========================\n\n`;
    }
};
