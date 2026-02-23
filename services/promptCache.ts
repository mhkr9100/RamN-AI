/**
 * PromptCache Layer (Phase 5)
 * 
 * Provides semantic caching using FNV-1a fingerprint hashing to prevent 
 * redundant LLM API calls and speed up responses.
 */

export interface CacheEntry {
    hash: string;
    response: any;
    timestamp: number;
}

const CACHE_STORAGE_KEY = 'ramn_ai_prompt_cache';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour TTL
const MAX_CACHE_ENTRIES = 200;

export const promptCacheService = {
    // FNV-1a Hash Implementation for fast string matching
    // https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function
    hashFNV1a(str: string): string {
        let hash = 2166136261;
        for (let i = 0; i < str.length; i++) {
            hash ^= str.charCodeAt(i);
            hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
        }
        return (hash >>> 0).toString(16);
    },

    // Create a normalized fingerprint for the prompt + context
    createFingerprint(model: string, systemPrompt: string, historyLength: number, lastMessage: string): string {
        const normalized = `${model}||${systemPrompt}||${historyLength}||${lastMessage}`.toLowerCase().trim();
        return this.hashFNV1a(normalized);
    },

    // Retrieve cached response if valid
    getCache(fingerprint: string): any | null {
        try {
            const stored = localStorage.getItem(CACHE_STORAGE_KEY);
            if (!stored) return null;

            let cache: Record<string, CacheEntry> = JSON.parse(stored);
            const entry = cache[fingerprint];

            if (entry) {
                // Check TTL
                if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
                    delete cache[fingerprint];
                    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cache));
                    return null;
                }
                console.log(`[Cache Hit] Serving from promptCache. Hash: ${fingerprint}`);
                // Log analytics event (future)
                return entry.response;
            }
            return null;
        } catch (e) {
            console.error("Cache retrieval failed", e);
            return null;
        }
    },

    // Store new successful response
    setCache(fingerprint: string, response: any) {
        try {
            const stored = localStorage.getItem(CACHE_STORAGE_KEY);
            let cache: Record<string, CacheEntry> = stored ? JSON.parse(stored) : {};

            cache[fingerprint] = {
                hash: fingerprint,
                response,
                timestamp: Date.now()
            };

            // Prune old entries
            const entries = Object.values(cache);
            if (entries.length > MAX_CACHE_ENTRIES) {
                // Auto-evict oldest
                entries.sort((a, b) => b.timestamp - a.timestamp); // Newest first
                const prunedEntries = entries.slice(0, MAX_CACHE_ENTRIES);
                cache = {};
                for (const entry of prunedEntries) {
                    cache[entry.hash] = entry;
                }
            }

            localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cache));
        } catch (e) {
            console.error("Cache set failed", e);
        }
    }
};
