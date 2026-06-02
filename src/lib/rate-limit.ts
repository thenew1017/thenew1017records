type RateLimitRecord = {
  tokens: number;
  lastRefill: number;
};

// In-memory token store mapped by "limitKey:ip"
const limits = new Map<string, RateLimitRecord>();

/**
 * Token Bucket Rate Limiter
 * 
 * @param ip Client IP address to rate limit
 * @param limitKey Key describing the action (e.g. 'submit_application')
 * @param maxTokens Maximum capacity of the token bucket
 * @param refillRateSec Time in seconds required to refill a single token
 * @returns boolean True if the request is allowed, false if rate limited
 */
export function rateLimit(
  ip: string,
  limitKey: string,
  maxTokens: number = 3,
  refillRateSec: number = 1200 // Default: 20 minutes per token (3 tokens max = 1 hour window)
): boolean {
  const now = Date.now();
  const key = `${limitKey}:${ip}`;
  let record = limits.get(key);

  if (!record) {
    record = { tokens: maxTokens, lastRefill: now };
  } else {
    // Calculate refilled tokens since last access
    const elapsedMs = now - record.lastRefill;
    const refillTokens = Math.floor(elapsedMs / (refillRateSec * 1000));
    
    if (refillTokens > 0) {
      record.tokens = Math.min(maxTokens, record.tokens + refillTokens);
      // Keep fractional time for accurate sliding windows
      record.lastRefill = record.lastRefill + refillTokens * refillRateSec * 1000;
    }
  }

  if (record.tokens <= 0) {
    return false;
  }

  // Consume a token
  record.tokens -= 1;
  limits.set(key, record);
  return true;
}
