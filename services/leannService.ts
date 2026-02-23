/**
 * LEANN Local RAG Integration (Phase 6)
 * 
 * Provides an interface to interact with the local LEANN Python CLI or server.
 * Allows agents to inject local RAG content into their context.
 */

export const leannService = {
    async search(query: string, indexDir: string = './demo.leann', topK: number = 3): Promise<string> {
        try {
            const response = await fetch('/api/leann/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, indexDir, topK })
            });

            if (!response.ok) {
                return "[LEANN]: Local RAG service unavailable or failed to execute.";
            }

            const data = await response.json();
            return data.result || "[LEANN]: No relevant context found.";
        } catch (error) {
            console.error("[LEANN Error] Search failed:", error);
            return "[LEANN]: Local RAG service unavailable or failed to execute.";
        }
    },

    /**
     * Format the retrieved RAG context for injection into the LLM system prompt.
     */
    formatContextForPrompt(query: string, rawContext: string): string {
        if (!rawContext || rawContext.includes("unavailable")) return "";

        return `\n\n=== LOCAL KNOWLEDGE BASE (LEANN RAG) ===\nContext for query: "${query}"\n${rawContext}\n========================================\n\n`;
    }
};
