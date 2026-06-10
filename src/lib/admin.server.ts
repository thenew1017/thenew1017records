import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { getRequest, getRequestHeader } from "@tanstack/react-start/server";
import fs from "fs";
import path from "path";

// Light-weight custom .env file parser to populate process.env in server context (SSR/Server functions)
function loadEnv() {
  if (process.env.NODE_ENV === "production") return;
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      content.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const index = trimmed.indexOf("=");
          if (index !== -1) {
            const key = trimmed.substring(0, index).trim();
            let val = trimmed.substring(index + 1).trim();
            if (val.startsWith('"') && val.endsWith('"')) {
              val = val.substring(1, val.length - 1);
            }
            if (val.startsWith("'") && val.endsWith("'")) {
              val = val.substring(1, val.length - 1);
            }
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      });
      console.log("⚡ [Server Env Loader] Loaded local .env variables into process.env.");
    }
  } catch (err: any) {
    console.warn("⚠️ [Server Env Loader] Warning loading .env file:", err.message);
  }
}

// Execute immediately upon server import
loadEnv();

export function getAdminClient() {
  const url = 
    process.env.SUPABASE_URL || 
    import.meta.env.VITE_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;
    
  // Strictly process.env is checked for the service role key. 
  // We NEVER look up a VITE_ prefixed variable for the secret to prevent bundler leakage to the client-side.
  const key = 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.SUPABASE_ROLE_KEY;
    
  if (!key) {
    console.error("⚠️ [Supabase Server Client] SUPABASE_SERVICE_ROLE_KEY is missing! Failing closed to prevent privilege escalation.");
  }
    
  if (!url || !key) {
    throw new Error("CRITICAL: Server-side Supabase configuration missing or invalid. Verify environment settings.");
  }
  
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function assertAdmin(userId: string, customClient?: any, userEmail?: string) {
  const serviceClient = getAdminClient();
  const authClient = customClient || serviceClient;
  
  // Whitelist admin emails and IDs
  const normalizedEmail = userEmail?.toLowerCase()?.trim();
  if (
    normalizedEmail === "contact@thenew1017records.us" || 
    userId === "cd45b27d-7cce-47fe-8457-2cf5c098bb3f" // contact@thenew1017records.us fallback
  ) {
    return serviceClient;
  }

  throw new Error("Forbidden: admin role required");
}

/**
 * Retrieve client IP address securely, checking proxy headers first
 */
export function getClientIp(): string {
  try {
    const cfConnectingIp = getRequestHeader("cf-connecting-ip");
    if (cfConnectingIp) return cfConnectingIp.trim();

    const xForwardedFor = getRequestHeader("x-forwarded-for");
    if (xForwardedFor) {
      const ips = xForwardedFor.split(",");
      return ips[0].trim();
    }

    const xRealIp = getRequestHeader("x-real-ip");
    if (xRealIp) return xRealIp.trim();
  } catch (err) {
    // Silently fall back if getRequestHeader fails outside request context
  }

  try {
    const request = getRequest();
    if (request && request.headers) {
      const cfConnectingIp = request.headers.get?.("cf-connecting-ip");
      if (cfConnectingIp) return cfConnectingIp.trim();

      const xForwardedFor = request.headers.get?.("x-forwarded-for");
      if (xForwardedFor) {
        const ips = xForwardedFor.split(",");
        return ips[0].trim();
      }

      const xRealIp = request.headers.get?.("x-real-ip");
      if (xRealIp) return xRealIp.trim();
    }
  } catch (err) {
    // Silently fall back
  }

  // If we can't determine the IP, return a random UUID or unique string per request 
  // so we don't block EVERYONE globally if the proxy headers are missing.
  return "unknown-" + Math.random().toString(36).substring(7);
}

/**
 * Log administrative activity to database security audit table
 */
export async function logActivity(
  userId: string | null,
  action: string,
  details: Record<string, any>
) {
  try {
    const admin = getAdminClient();
    const ip = getClientIp();
    await admin.from("activity_logs").insert({
      user_id: userId,
      action,
      details,
      ip_address: ip,
    });
  } catch (err: any) {
    console.error(`[Security Audit Log Failure] Failed to record event: ${action}:`, err.message);
  }
}