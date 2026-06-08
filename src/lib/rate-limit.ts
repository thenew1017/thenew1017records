import { getAdminClient } from "./admin.server";

/**
 * DB-backed Token Bucket Rate Limiter (Serverless Safe)
 * 
 * @param ip Client IP address to rate limit
 * @param limitKey Key describing the action (e.g. 'submit_application')
 * @param maxTokens Maximum capacity of the token bucket
 * @param refillRateSec Time in seconds required to refill a single token
 * @returns Promise<boolean> True if the request is allowed, false if rate limited
 */
export async function rateLimit(
  ip: string,
  limitKey: string,
  maxTokens: number = 3,
  refillRateSec: number = 1200 // Default: 20 minutes per token (3 tokens max = 1 hour window)
): Promise<boolean> {
  const admin = getAdminClient();
  const windowSec = maxTokens * refillRateSec;
  const since = new Date(Date.now() - windowSec * 1000).toISOString();

  // For high-volume public endpoints, we could use a dedicated rate limit table
  // but activity_logs works well enough for forms and newsletters.
  // We look for 'rate_limit_consume' events.
  const { data, error } = await admin
    .from("activity_logs")
    .select("created_at")
    .eq("ip_address", ip)
    .eq("action", `rate_limit:${limitKey}`)
    .gte("created_at", since);

  if (error) {
    console.error("[Rate Limit DB Error]:", error.message);
    // Fail closed on DB error for critical routes
    return false;
  }

  // Count how many tokens have been consumed in the rolling window
  const consumed = data ? data.length : 0;

  if (consumed >= maxTokens) {
    return false; // Bucket is empty
  }

  // Consume a token by logging it
  await admin.from("activity_logs").insert({
    user_id: null,
    action: `rate_limit:${limitKey}`,
    details: { windowSec, maxTokens },
    ip_address: ip,
  });

  return true;
}
