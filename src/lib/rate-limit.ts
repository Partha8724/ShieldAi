interface RateLimitStore {
  [key: string]: number[];
}

const store: RateLimitStore = {};

// Clean up old entries periodically to prevent memory leaks in dev/production
if (typeof global !== "undefined") {
  const globalAny = global as any;
  if (!globalAny.rateLimitCleanupInterval) {
    globalAny.rateLimitCleanupInterval = setInterval(() => {
      const now = Date.now();
      Object.keys(store).forEach((key) => {
        store[key] = store[key].filter((timestamp) => now - timestamp < 60000);
        if (store[key].length === 0) {
          delete store[key];
        }
      });
    }, 60000);
  }
}

/**
 * Basic rate limiting helper using sliding window.
 * 
 * @param key Unique key to identify the client (e.g., IP address or email)
 * @param limit Maximum number of requests allowed in the window
 * @param windowMs Time window in milliseconds (default: 1 minute / 60000ms)
 */
export function rateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 60000
) {
  const now = Date.now();

  if (!store[key]) {
    store[key] = [];
  }

  // Filter out timestamps outside the sliding window
  store[key] = store[key].filter((timestamp) => now - timestamp < windowMs);

  if (store[key].length >= limit) {
    const oldestTimestamp = store[key][0];
    const resetTime = oldestTimestamp + windowMs;
    const retryAfter = Math.ceil((resetTime - now) / 1000);
    return {
      success: false,
      limit,
      remaining: 0,
      reset: retryAfter > 0 ? retryAfter : 1,
    };
  }

  store[key].push(now);

  return {
    success: true,
    limit,
    remaining: limit - store[key].length,
    reset: Math.ceil(windowMs / 1000),
  };
}
