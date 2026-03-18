// ─── Lightweight in-memory sliding-window rate limiter ──────────────
// No Redis required — uses a Map with automatic expiry.

interface RateLimitOptions {
    interval: number;                 // Window duration in milliseconds
    uniqueTokenPerInterval?: number;  // Max unique tokens tracked (prevents memory leak)
}

interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number; // Unix timestamp (ms) when the window resets
}

export function rateLimit(options: RateLimitOptions) {
    const { interval, uniqueTokenPerInterval = 500 } = options;

    const tokenCache = new Map<string, { count: number; expiresAt: number }>();

    // Periodic cleanup of expired entries every interval
    const cleanup = () => {
        const now = Date.now();
        for (const [key, value] of tokenCache) {
            if (now >= value.expiresAt) {
                tokenCache.delete(key);
            }
        }
    };

    // Run cleanup every interval
    if (typeof setInterval !== "undefined") {
        const timer = setInterval(cleanup, interval);
        // Don't block Node.js shutdown
        if (timer.unref) timer.unref();
    }

    return {
        /**
         * Check if a request from `token` (usually an IP) is within the limit.
         * @param limit  Max requests allowed per window
         * @param token  Unique identifier (IP address, user ID, etc.)
         */
        check(limit: number, token: string): RateLimitResult {
            const now = Date.now();
            const entry = tokenCache.get(token);

            // Evict if cache is full and this is a new token
            if (!entry && tokenCache.size >= uniqueTokenPerInterval) {
                cleanup();
            }

            // Token not seen yet or window has expired → fresh window
            if (!entry || now >= entry.expiresAt) {
                tokenCache.set(token, {
                    count: 1,
                    expiresAt: now + interval,
                });
                return {
                    success: true,
                    limit,
                    remaining: limit - 1,
                    reset: now + interval,
                };
            }

            // Still within the window — increment
            entry.count += 1;

            if (entry.count > limit) {
                return {
                    success: false,
                    limit,
                    remaining: 0,
                    reset: entry.expiresAt,
                };
            }

            return {
                success: true,
                limit,
                remaining: limit - entry.count,
                reset: entry.expiresAt,
            };
        },
    };
}

// ─── Pre-configured limiters for different route groups ─────────────

/** Auth routes: 5 requests per 60 seconds */
export const authLimiter = rateLimit({ interval: 60_000 });

/** Upload / settings routes: 10 requests per 60 seconds */
export const settingsLimiter = rateLimit({ interval: 60_000 });

/** Heavy sync routes: 5 requests per 60 seconds */
export const syncLimiter = rateLimit({ interval: 60_000 });
