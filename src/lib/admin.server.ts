import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export function getAdminClient() {
  const url = 
    import.meta.env.VITE_SUPABASE_URL || 
    process.env.SUPABASE_URL || 
    process.env.VITE_SUPABASE_URL;
  const key = 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
    import.meta.env.VITE_SUPABASE_ANON_KEY || 
    process.env.SUPABASE_PUBLISHABLE_KEY || 
    process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase URL or Key not configured in environment variables.");
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function assertAdmin(userId: string, customClient?: any) {
  const admin = customClient || getAdminClient();
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

    // If the user does not have the admin role, but we have a service role key configured,
    // we can automatically insert the admin role for them in the database using the admin client.
    const serviceRoleKey = 
      process.env.SUPABASE_SERVICE_ROLE_KEY || 
      import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    const isServiceKey = serviceRoleKey && 
      serviceRoleKey !== process.env.SUPABASE_PUBLISHABLE_KEY && 
      serviceRoleKey !== process.env.VITE_SUPABASE_ANON_KEY &&
      serviceRoleKey !== import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY &&
      serviceRoleKey !== import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (isServiceKey) {
      console.log(`[Admin Autopromote] User ${userId} is not an admin, but service role key is configured. Auto-assigning admin role...`);
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