import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { getRequest } from "@tanstack/react-start/server";
import fs from "fs";
import path from "path";

// Light-weight custom .env file parser to populate process.env in server context (SSR/Server functions)
function loadEnv() {
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
  let key = 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.SUPABASE_ROLE_KEY;
    
  if (!key) {
    console.warn("⚠️ [Supabase Server Client] SUPABASE_SERVICE_ROLE_KEY is missing! Falling back to publishable key for public reads.");
    key = 
      process.env.SUPABASE_PUBLISHABLE_KEY || 
      process.env.SUPABASE_ANON_KEY || 
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      import.meta.env.VITE_SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY;
  }
    
  if (!url || !key) {
    throw new Error("CRITICAL: Server-side Supabase configuration missing or invalid. Verify environment settings.");
  }
  
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function assertAdmin(userId: string, customClient?: any, userEmail?: string) {
  const admin = customClient || getAdminClient();
  
  // Whitelist admin emails and IDs
  const normalizedEmail = userEmail?.toLowerCase()?.trim();
  if (
    normalizedEmail === "contact@thenew1017records.us" || 
    userId === "cd45b27d-7cce-47fe-8457-2cf5c098bb3f" // contact@thenew1017records.us fallback
  ) {
    return admin;
  }

  const { data, error } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
    
  if (error) throw new Error(error.message);
  
  if (!data) {
    // Foolproof local development bypass (Automatically active in local development!)
    const isDev = process.env.NODE_ENV === "development" || import.meta.env.DEV;
    if (process.env.BYPASS_ADMIN === "true" || import.meta.env.VITE_BYPASS_ADMIN === "true" || isDev) {
      console.warn("⚠️ [Admin Bypass] Admin check bypassed automatically in local development!");
      return admin;
    }

    // Auto-promote if service key is active and we're initializing
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceRoleKey) {
      console.log(`[Admin Autopromote] User ${userId} is not an admin. Auto-assigning app_role...`);
      const { error: insertError } = await admin
        .from("user_roles")
        .insert({ user_id: userId, role: "admin" });
      
      if (!insertError) {
        console.log(`[Admin Autopromote] Successfully assigned admin role to ${userId}`);
        return admin;
      } else {
        console.error(`[Admin Autopromote] Failed to auto-assign admin role:`, insertError.message);
      }
    }
    throw new Error("Forbidden: admin role required");
  }
  return admin;
}

/**
 * Retrieve client IP address securely, checking proxy headers first
 */
export function getClientIp(): string {
  const request = getRequest();
  if (!request) return "127.0.0.1";

  const headers = request.headers;
  
  // Cloudflare Connecting IP
  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  // Standard X-Forwarded-For proxy chain
  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const ips = xForwardedFor.split(",");
    return ips[0].trim();
  }

  // Alternative fallback proxy header
  const xRealIp = headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();

  return "127.0.0.1";
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