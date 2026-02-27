/**
 * Client-Side Rate Limiter — Token Bucket Algorithm
 * Prevents excessive API calls per provider.
 */

interface BucketState {
    tokens: number;
    lastRefill: number;
}

const RATE_CONFIG = {
    maxTokens: 15,         // max burst
    refillRate: 10,        // tokens per minute
    refillIntervalMs: 60_000
};

const buckets: Record<string, BucketState> = {};

function getBucket(provider: string): BucketState {
    if (!buckets[provider]) {
        buckets[provider] = { tokens: RATE_CONFIG.maxTokens, lastRefill: Date.now() };
    }
    return buckets[provider];
}

function refillBucket(bucket: BucketState): void {
    const now = Date.now();
    const elapsed = now - bucket.lastRefill;
    const tokensToAdd = (elapsed / RATE_CONFIG.refillIntervalMs) * RATE_CONFIG.refillRate;
    bucket.tokens = Math.min(RATE_CONFIG.maxTokens, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
}

/**
 * Check if a request is allowed for the given provider.
 */
export function canMakeRequest(provider: string): { allowed: boolean; retryAfterMs?: number } {
    const bucket = getBucket(provider);
    refillBucket(bucket);

    if (bucket.tokens >= 1) {
        return { allowed: true };
    }

    // Calculate when next token will be available
    const msPerToken = RATE_CONFIG.refillIntervalMs / RATE_CONFIG.refillRate;
    const deficit = 1 - bucket.tokens;
    const retryAfterMs = Math.ceil(deficit * msPerToken);
    return { allowed: false, retryAfterMs };
}

/**
 * Record that a request was made (consume a token).
 */
export function recordRequest(provider: string): void {
    const bucket = getBucket(provider);
    refillBucket(bucket);
    bucket.tokens = Math.max(0, bucket.tokens - 1);
}

/**
 * Get remaining tokens for a provider (for UI display).
 */
export function getRemainingTokens(provider: string): number {
    const bucket = getBucket(provider);
    refillBucket(bucket);
    return Math.floor(bucket.tokens);
}
