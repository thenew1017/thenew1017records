import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin, getAdminClient, getClientIp, logActivity } from "./admin.server";
import { rateLimit } from "./rate-limit";
import { supabase } from "@/integrations/supabase/client";
import { Resend } from "resend";

type Json = string | number | boolean | null | { [k: string]: Json } | Json[];

const ArtistSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  role: z.string().max(120).nullable().optional(),
  tag: z.string().max(20).nullable().optional(),
  bio: z.string().max(2000).nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  spotify_url: z.string().url().nullable().optional(),
  apple_url: z.string().url().nullable().optional(),
  youtube_url: z.string().url().nullable().optional(),
  instagram_url: z.string().url().nullable().optional(),
  twitter_url: z.string().url().nullable().optional(),
  website_url: z.string().url().nullable().optional(),
  sort_order: z.number().int().min(0).max(9999).default(0),
  published: z.boolean().default(true),
});

// Public reads (no auth) in-memory caches removed for serverless compatibility.

export function clearPublicCaches() {
  console.log("⚡ [Server Cache] Caches are now managed externally, skipped internal clear.");
}

export const listPublicArtists = createServerFn({ method: "GET" }).handler(async () => {
  const ip = getClientIp();
  const allowed = await rateLimit(ip, "public_artists", 60, 60);
  if (!allowed) {
    throw new Error("Too many requests. Please try again later.");
  }
  
  const resolvedUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
  const resolvedKey = 
    process.env.SUPABASE_PUBLISHABLE_KEY || 
    process.env.SUPABASE_ANON_KEY || 
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
    process.env.VITE_SUPABASE_ANON_KEY || 
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
    import.meta.env.VITE_SUPABASE_ANON_KEY;
  console.log("=== SUPABASE SERVER CONFIGURATION AUDIT ===");
  console.log(` - Resolved URL: ${resolvedUrl}`);
  console.log(` - Resolved Key (anon): ${resolvedKey ? resolvedKey.substring(0, 20) + "..." : "MISSING"}`);
  console.log("==========================================");
  
  const queryColumns = "id,name,role,tag,bio,image_url,spotify_url,apple_url,youtube_url,instagram_url,twitter_url,website_url,sort_order";
  console.log("⚡ [Supabase Server Roster Query] Executing:", `supabase.from("artists").select("${queryColumns}")`);
  console.log("⚡ [SQL Equivalent]:", `SELECT ${queryColumns} FROM public.artists WHERE published = true ORDER BY sort_order ASC, created_at ASC;`);
  
  const { supabase } = await import("@/integrations/supabase/client");
  const { data, error } = await supabase
    .from("artists")
    .select(queryColumns)
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
    
  if (error) {
    console.error("❌ [Supabase Server Roster Query Failure] Error:", error.message);
    throw new Error("A database transaction error occurred. Operation aborted safely.");
  }
  
  console.log(`✅ [Supabase Server Roster Query Success] Fetched ${data?.length ?? 0} artists from database:`);
  console.dir(data, { depth: null });
  
  return { artists: data ?? [] };
});

export const getPublicSettings = createServerFn({ method: "GET" }).handler(async () => {
  const ip = getClientIp();
  const allowed = await rateLimit(ip, "public_settings", 60, 60);
  if (!allowed) {
    throw new Error("Too many requests. Please try again later.");
  }
  console.log("⚡ [Supabase Server Settings Query] Executing: supabase.from('site_settings').select('key,value')");
  const { supabase } = await import("@/integrations/supabase/client");
  const { data, error } = await supabase.from("site_settings").select("key,value");
  if (error) {
    console.error("❌ [Supabase Server Settings Query Failure] Error:", error.message);
    throw new Error("A database transaction error occurred. Operation aborted safely.");
  }
  console.log(`✅ [Supabase Server Settings Query Success] Fetched ${data?.length ?? 0} settings keys.`);
  const map: Record<string, Json> = {};
  for (const row of data ?? []) map[row.key] = row.value as Json;
  return { settings: map };
});

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export const getPublicArtistBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ name: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const res = await listPublicArtists();
    const artist = res.artists.find((a) => slugify(a.name) === data.name);
    return { artist: artist ?? null };
  });

export const getPublicReleaseBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ name: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const res = await getPublicSettings();
    const releases = (res.settings?.releases as any[] | undefined) ?? [];
    const release = releases.find((r) => slugify(r.title) === data.name);
    return { release: release ?? null };
  });

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ email: z.string().email().max(255) }).parse(input))
  .handler(async ({ data }) => {
    const ip = getClientIp();
    const allowed = await rateLimit(ip, "subscribe_newsletter", 5, 3600);
    if (!allowed) {
      throw new Error("Too many subscription requests from this IP. Please try again in an hour.");
    }
    
    const admin = getAdminClient();
    const { error } = await admin.from("newsletter_subscribers").insert({ email: data.email });
    if (error && !error.message.toLowerCase().includes("duplicate")) {
      throw new Error("A database transaction error occurred. Operation aborted safely.");
    }
    
    await logActivity(null, "public_newsletter_subscribed", { email: data.email });
    return { ok: true };
  });

// Admin: artists
export const adminListArtists = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertAdmin(context.userId, context.supabase, context.userEmail);
    const { data, error } = await admin.from("artists").select("*").order("sort_order").order("created_at");
    if (error) throw new Error("A database transaction error occurred. Operation aborted safely.");
    return { artists: data ?? [] };
  });

export const adminUpsertArtist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ArtistSchema.parse(input))
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context.userId, context.supabase, context.userEmail);
    if (data.id) {
      const { id, ...rest } = data;
      const { error } = await admin.from("artists").update(rest).eq("id", id);
      if (error) throw new Error("A database transaction error occurred. Operation aborted safely.");
      clearPublicCaches();
      await logActivity(context.userId, "admin_update_artist", { id, name: data.name });
      return { id };
    } else {
      const { id: _ignore, ...rest } = data;
      const { data: row, error } = await admin.from("artists").insert(rest).select("id").single();
      if (error) throw new Error("A database transaction error occurred. Operation aborted safely.");
      clearPublicCaches();
      await logActivity(context.userId, "admin_create_artist", { id: row.id, name: data.name });
      return { id: row.id };
    }
  });

export const adminDeleteArtist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context.userId, context.supabase, context.userEmail);
    const { error } = await admin.from("artists").delete().eq("id", data.id);
    if (error) throw new Error("A database transaction error occurred. Operation aborted safely.");
    clearPublicCaches();
    await logActivity(context.userId, "admin_delete_artist", { id: data.id });
    return { ok: true };
  });

import DOMPurify from "isomorphic-dompurify";

// Helper to sanitize unknown JSON recursively against XSS
function sanitizeJsonDeep(obj: any): any {
  if (typeof obj === "string") return DOMPurify.sanitize(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeJsonDeep);
  if (obj !== null && typeof obj === "object") {
    const sanitized: any = {};
    for (const k in obj) sanitized[k] = sanitizeJsonDeep(obj[k]);
    return sanitized;
  }
  return obj;
}

// Admin: settings
export const adminGetSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertAdmin(context.userId, context.supabase, context.userEmail);
    const { data, error } = await admin.from("site_settings").select("key,value");
    if (error) throw new Error("A database transaction error occurred. Operation aborted safely.");
    const map: Record<string, Json> = {};
    for (const row of data ?? []) map[row.key] = row.value as Json;
    return { settings: map };
  });

export const adminSetSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      key: z.string().min(1).max(80).regex(/^[a-z0-9_]+$/),
      value: z.unknown(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context.userId, context.supabase, context.userEmail);
    const sanitizedValue = sanitizeJsonDeep(data.value);
    const { error } = await admin
      .from("site_settings")
      .upsert({ key: data.key, value: sanitizedValue as Json }, { onConflict: "key" });
    if (error) throw new Error("A database transaction error occurred. Operation aborted safely.");
    clearPublicCaches();
    await logActivity(context.userId, "admin_set_setting", { key: data.key });
    return { ok: true };
  });

// Admin: subscribers
export const adminListSubscribers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertAdmin(context.userId, context.supabase, context.userEmail);
    const { data, error } = await admin
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error("A database transaction error occurred. Operation aborted safely.");
    return { subscribers: data ?? [] };
  });

export const adminDeleteSubscriber = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context.userId, context.supabase, context.userEmail);
    const { error } = await admin.from("newsletter_subscribers").delete().eq("id", data.id);
    if (error) throw new Error("A database transaction error occurred. Operation aborted safely.");
    await logActivity(context.userId, "admin_delete_subscriber", { id: data.id });
    return { ok: true };
  });

// Helper: recursively list all files in a Supabase storage bucket
async function listAllStorageFilesRecursive(
  adminClient: any,
  bucket: string,
  folderPath: string = ""
): Promise<Array<{ name: string; url: string; size: number; created_at: string | null }>> {
  const { data, error } = await adminClient.storage.from(bucket).list(folderPath, {
    limit: 100,
  });
  if (error) {
    console.error(`[Storage Recursive List Error] Directory: ${folderPath || "root"}:`, error.message);
    return [];
  }

  let results: Array<{ name: string; url: string; size: number; created_at: string | null }> = [];
  const url = process.env.SUPABASE_URL!;

  for (const item of (data ?? [])) {
    if (item.id === null && item.metadata === null) {
      // It is a directory, recurse into it!
      const subPath = folderPath ? `${folderPath}/${item.name}` : item.name;
      const subFiles = await listAllStorageFilesRecursive(adminClient, bucket, subPath);
      results = results.concat(subFiles);
    } else if (item.name && !item.name.startsWith(".")) {
      // It is a file!
      const fullPath = folderPath ? `${folderPath}/${item.name}` : item.name;
      results.push({
        name: fullPath,
        url: `${url}/storage/v1/object/public/${bucket}/${fullPath}`,
        size: item.metadata?.size ?? 0,
        created_at: item.created_at ?? null,
      });
    }
  }

  return results;
}

// Admin: media (list + delete via service role; uploads go through browser supabase client with auth)
export const adminListMedia = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertAdmin(context.userId, context.supabase, context.userEmail);
    const files = await listAllStorageFilesRecursive(admin, "media");
    
    // Sort files by created_at desc (newest first)
    files.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });

    return { files };
  });

export const adminDeleteMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ name: z.string().min(1).max(255) }).parse(input))
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context.userId, context.supabase, context.userEmail);
    const { error } = await admin.storage.from("media").remove([data.name]);
    if (error) throw new Error("A database transaction error occurred. Operation aborted safely.");
    await logActivity(context.userId, "admin_delete_media", { name: data.name });
    return { ok: true };
  });

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => 
    z.object({ token: z.string().optional() }).parse(input)
  )
  .handler(async ({ data, context }) => {
    try {
      let userId = context?.userId;
      let userEmail = context?.userEmail;
      let client: any = null;

      if (data?.token) {
        const { createClient } = await import("@supabase/supabase-js");
        const url = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const key = 
          import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
          import.meta.env.VITE_SUPABASE_ANON_KEY || 
          process.env.SUPABASE_PUBLISHABLE_KEY || 
          process.env.SUPABASE_ANON_KEY || 
          process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
          process.env.VITE_SUPABASE_ANON_KEY;
        client = createClient(url!, key!, {
          global: {
            headers: {
              Authorization: `Bearer ${data.token}`,
            },
          },
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        });
        const { data: userData, error: userError } = await client.auth.getUser(data.token);
        if (!userError && userData?.user) {
          userId = userData.user.id;
          userEmail = userData.user.email;
        }
      }

      if (!userId) {
        throw new Error("Unauthorized: No user ID found");
      }

      console.log('checkIsAdmin -> userId:', userId, 'userEmail:', userEmail); await assertAdmin(userId, client || context?.supabase, userEmail);
      return { isAdmin: true };
    } catch (err) {
      console.error("[checkIsAdmin Error]:", err);
      return { isAdmin: false };
    }
  });

// Admin: analytics aggregation
type ArtistLite = { id: string; name: string; image_url: string | null };
type ViewRow = { artist_id: string; created_at: string };
type ClickRow = { artist_id: string; link_type: string; created_at: string };

export const adminGetAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertAdmin(context.userId, context.supabase, context.userEmail);
    const now = Date.now();
    const since30 = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
    const since7 = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
    const since14 = new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString();

    const [artistsRes, viewsRes, clicksRes, sessionsRes] = await Promise.all([
      admin.from("artists").select("id,name,image_url").eq("published", true),
      admin.from("artist_views").select("artist_id,created_at").gte("created_at", since30),
      admin.from("artist_clicks").select("artist_id,link_type,created_at").gte("created_at", since30),
      admin.from("artist_sessions").select("id,last_seen", { count: "exact", head: false }).gte("last_seen", since30),
    ]);

    if (artistsRes.error) throw new Error(artistsRes.error.message);
    if (viewsRes.error) throw new Error(viewsRes.error.message);
    if (clicksRes.error) throw new Error(clicksRes.error.message);
    if (sessionsRes.error) throw new Error(sessionsRes.error.message);

    const artists = (artistsRes.data ?? []) as ArtistLite[];
    const views = (viewsRes.data ?? []) as ViewRow[];
    const clicks = (clicksRes.data ?? []) as ClickRow[];

    const artistMap = new Map<string, ArtistLite>();
    for (const a of artists) artistMap.set(a.id, a);

    // Per-artist aggregates
    type Agg = {
      id: string;
      name: string;
      image_url: string | null;
      views_30d: number;
      clicks_30d: number;
      views_7d: number;
      views_prev_7d: number;
      clicks_7d: number;
      engagement: number;
      growth_pct: number | null;
    };
    const map = new Map<string, Agg>();
    const ensure = (id: string): Agg | null => {
      if (map.has(id)) return map.get(id)!;
      const a = artistMap.get(id);
      if (!a) return null;
      const agg: Agg = {
        id,
        name: a.name,
        image_url: a.image_url,
        views_30d: 0,
        clicks_30d: 0,
        views_7d: 0,
        views_prev_7d: 0,
        clicks_7d: 0,
        engagement: 0,
        growth_pct: null,
      };
      map.set(id, agg);
      return agg;
    };

    for (const v of views) {
      const a = ensure(v.artist_id);
      if (!a) continue;
      a.views_30d += 1;
      if (v.created_at >= since7) a.views_7d += 1;
      else if (v.created_at >= since14) a.views_prev_7d += 1;
    }
    for (const c of clicks) {
      const a = ensure(c.artist_id);
      if (!a) continue;
      a.clicks_30d += 1;
      if (c.created_at >= since7) a.clicks_7d += 1;
    }
    for (const a of map.values()) {
      a.engagement = a.views_30d + a.clicks_30d * 3;
      if (a.views_prev_7d > 0) {
        a.growth_pct = Math.round(((a.views_7d - a.views_prev_7d) / a.views_prev_7d) * 100);
      } else if (a.views_7d > 0) {
        a.growth_pct = 100;
      } else {
        a.growth_pct = 0;
      }
    }

    // Ensure every published artist appears even with zero data
    for (const a of artists) ensure(a.id);

    const aggList = Array.from(map.values());
    const leaderboard = [...aggList].sort((a, b) => b.engagement - a.engagement).slice(0, 10);
    const trending = [...aggList]
      .filter((a) => a.views_7d > 0)
      .sort((a, b) => (b.growth_pct ?? 0) - (a.growth_pct ?? 0))
      .slice(0, 5);

    // Daily time series (last 30 days)
    const days: { date: string; views: number; clicks: number }[] = [];
    const byDay = new Map<string, { views: number; clicks: number }>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      byDay.set(key, { views: 0, clicks: 0 });
    }
    for (const v of views) {
      const k = v.created_at.slice(0, 10);
      const e = byDay.get(k);
      if (e) e.views += 1;
    }
    for (const c of clicks) {
      const k = c.created_at.slice(0, 10);
      const e = byDay.get(k);
      if (e) e.clicks += 1;
    }
    for (const [date, v] of byDay) days.push({ date, ...v });

    // Click breakdown by link_type
    const breakdownMap = new Map<string, number>();
    for (const c of clicks) {
      breakdownMap.set(c.link_type, (breakdownMap.get(c.link_type) ?? 0) + 1);
    }
    const click_breakdown = Array.from(breakdownMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    const totals = {
      views_30d: views.length,
      clicks_30d: clicks.length,
      sessions_30d: sessionsRes.count ?? 0,
      artists: artists.length,
      views_7d: views.filter((v) => v.created_at >= since7).length,
      clicks_7d: clicks.filter((c) => c.created_at >= since7).length,
    };

    return {
      totals,
      leaderboard,
      trending,
      days,
      click_breakdown,
      most_viewed: leaderboard[0] ?? null,
    };
  });

// Helper: Ensure required Supabase storage buckets exist and are public
async function ensureBucketsExist() {
  const admin = getAdminClient();
  try {
    const { data: buckets, error } = await admin.storage.listBuckets();
    if (error) throw error;
    
    const existing = buckets?.map(b => b.name) ?? [];
    
    if (!existing.includes("artist-photos")) {
      const { error: err } = await admin.storage.createBucket("artist-photos", { public: true });
      if (err) console.error("Error creating bucket artist-photos:", err.message);
    }
    
    if (!existing.includes("artist-portfolios")) {
      const { error: err } = await admin.storage.createBucket("artist-portfolios", { public: true });
      if (err) console.error("Error creating bucket artist-portfolios:", err.message);
    }
  } catch (err: any) {
    console.error("Bucket auto-initializer warning:", err.message);
  }
}

// Public: submit artist application
export const submitArtistApplication = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({
      fullName: z.string().min(1, "Name is required").max(120),
      email: z.string().email("Invalid email format").max(120),
      artistName: z.string().min(1, "Artist name is required").max(120),
      spotifyLink: z.string().max(1000).optional().nullable(),
      campaignDetails: z.string().max(2000).optional().nullable(),
      artistPhotoUrl: z.string().url().optional().nullable(),
      epkUrl: z.string().url().optional().nullable(),
    }).parse(input)
  )
  .handler(async ({ data }) => {
    const ip = getClientIp();
    const allowed = await rateLimit(ip, "submit_application", 3, 3600);
    if (!allowed) {
      throw new Error("Artist application rate limit exceeded (max 3 submissions per hour). Please try again later.");
    }
    
    // Dynamically ensure required storage buckets exist
    await ensureBucketsExist();

    // Sanitize inputs
    const sanitized = {
      full_name: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      artist_name: data.artistName.trim(),
      spotify_link: data.spotifyLink ? data.spotifyLink.trim() : null,
      campaign_details: data.campaignDetails ? data.campaignDetails.trim() : null,
      artist_photo_url: data.artistPhotoUrl ? data.artistPhotoUrl.trim() : null,
      epk_url: data.epkUrl ? data.epkUrl.trim() : null,
      status: "Pending",
    };

    // Validate Spotify URL format if provided
    if (sanitized.spotify_link && !/^https?:\/\//i.test(sanitized.spotify_link)) {
      throw new Error("Invalid Spotify URL format");
    }

    const admin = getAdminClient();
    const { data: insertedData, error } = await admin.from("artist_applications").insert(sanitized).select("id, application_number").single();
    if (error) {
      throw new Error("A database transaction error occurred. Operation aborted safely.");
    }
    
    await logActivity(null, "public_application_submitted", { email: sanitized.email, artist_name: sanitized.artist_name });

    // Send email notification via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const appId = insertedData?.application_number ? insertedData.application_number.toString() : `34333`;
        
        // 1. Send notification to Admin
        await resend.emails.send({
          from: "The New 1017 Records <notifications@thenew1017records.us>",
          to: "contact@thenew1017records.us",
          replyTo: "contact@thenew1017records.us",
          subject: "New Artist Application Received",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #D4AF37;">New Artist Application Received</h2>
              <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: bold; width: 30%;">Full Name</td>
                  <td style="padding: 10px 0;">${sanitized.full_name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: bold;">Email</td>
                  <td style="padding: 10px 0;">
                    <a href="mailto:${sanitized.email}" style="color: #000;">${sanitized.email}</a>
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: bold;">Artist Name</td>
                  <td style="padding: 10px 0;">${sanitized.artist_name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: bold;">Spotify Link</td>
                  <td style="padding: 10px 0;">
                    ${sanitized.spotify_link ? `<a href="${sanitized.spotify_link}" target="_blank" style="color: #000;">${sanitized.spotify_link}</a>` : "Not provided"}
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: bold;">Photo URL</td>
                  <td style="padding: 10px 0;">
                    ${sanitized.artist_photo_url ? `<a href="${sanitized.artist_photo_url}" target="_blank" style="color: #000;">View Photo</a>` : "Not provided"}
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; font-weight: bold;">EPK URL</td>
                  <td style="padding: 10px 0;">
                    ${sanitized.epk_url ? `<a href="${sanitized.epk_url}" target="_blank" style="color: #000;">View EPK</a>` : "Not provided"}
                  </td>
                </tr>
              </table>
              <div style="margin-top: 20px;">
                <h3 style="margin-bottom: 10px; font-size: 16px;">Biography / Campaign Details:</h3>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap; font-size: 14px; line-height: 1.5;">${sanitized.campaign_details || "Not provided"}</div>
              </div>
            </div>
          `
        });

        // 2. Send confirmation to Applicant
        await resend.emails.send({
          from: "The New 1017 Records <notifications@thenew1017records.us>",
          to: sanitized.email,
          replyTo: "contact@thenew1017records.us",
          subject: "Application Received - The New 1017 Records",
          html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Application Received</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #E5E5E5; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <div style="text-align: center; margin-bottom: 40px;">
      <img src="https://thenew1017records.us/official_logo.png" alt="The New 1017 Records" width="120" style="display: inline-block; width: 120px; height: auto;" />
    </div>
    
    <div style="background-color: #111111; border: 1px solid #333333; border-radius: 8px; padding: 40px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #D4AF37; font-size: 24px; font-weight: 600; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 2px;">Application Received</h1>
        <p style="color: #888888; font-size: 14px; margin: 0; letter-spacing: 1px;">OFFICIAL ARTIST SUBMISSION</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 35px;">
        <tr>
          <td style="padding: 15px 0; border-bottom: 1px solid #222222; color: #888888; font-size: 14px; width: 40%;">Application ID</td>
          <td style="padding: 15px 0; border-bottom: 1px solid #222222; color: #FFFFFF; font-weight: 500; font-size: 14px; text-align: right;">${appId}</td>
        </tr>
        <tr>
          <td style="padding: 15px 0; border-bottom: 1px solid #222222; color: #888888; font-size: 14px;">Artist</td>
          <td style="padding: 15px 0; border-bottom: 1px solid #222222; color: #FFFFFF; font-weight: 500; font-size: 14px; text-align: right;">${sanitized.artist_name}</td>
        </tr>
        <tr>
          <td style="padding: 15px 0; border-bottom: 1px solid #222222; color: #888888; font-size: 14px;">Date Submitted</td>
          <td style="padding: 15px 0; border-bottom: 1px solid #222222; color: #FFFFFF; font-weight: 500; font-size: 14px; text-align: right;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
        </tr>
      </table>

      <div style="margin: 0 0 35px 0; padding: 20px; background-color: #0A0A0A; border-radius: 6px; border: 1px solid #1A1A1A;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding-bottom: 20px;">
              <span style="display: inline-block; width: 10px; height: 10px; background-color: #D4AF37; border-radius: 50%; margin-right: 15px; box-shadow: 0 0 8px rgba(212, 175, 55, 0.6);"></span>
              <span style="color: #D4AF37; font-size: 15px; font-weight: 600;">1. Application Received</span>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 20px;">
              <span style="display: inline-block; width: 10px; height: 10px; background-color: #333333; border-radius: 50%; margin-right: 15px;"></span>
              <span style="color: #666666; font-size: 15px; font-weight: 500;">2. Under Review</span>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 20px;">
              <span style="display: inline-block; width: 10px; height: 10px; background-color: #333333; border-radius: 50%; margin-right: 15px;"></span>
              <span style="color: #666666; font-size: 15px; font-weight: 500;">3. Shortlist Review</span>
            </td>
          </tr>
          <tr>
            <td>
              <span style="display: inline-block; width: 10px; height: 10px; background-color: #333333; border-radius: 50%; margin-right: 15px;"></span>
              <span style="color: #666666; font-size: 15px; font-weight: 500;">4. Final Decision</span>
            </td>
          </tr>
        </table>
      </div>

      <div style="font-size: 15px; line-height: 1.6; color: #CCCCCC;">
        <p style="margin: 0 0 15px 0;">Your dossier has been securely received by our A&R team. We will carefully review your sound and campaign details.</p>
        <p style="margin: 0;">Due to the high volume of submissions, only artists selected to move forward will be contacted directly via this email address.</p>
      </div>
    </div>

    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #222222;">
      <div style="margin-bottom: 20px;">
        <a href="https://thenew1017records.us" style="color: #D4AF37; text-decoration: none; font-size: 13px; margin: 0 15px; font-weight: 500;">Website</a>
        <a href="mailto:contact@thenew1017records.us" style="color: #D4AF37; text-decoration: none; font-size: 13px; margin: 0 15px; font-weight: 500;">Support Email</a>
      </div>
      <p style="color: #666666; font-size: 12px; line-height: 1.5; margin: 0 0 10px 0;">
        If you did not submit this application or need assistance, simply reply to this email and our team will assist you.
      </p>
      <p style="color: #444444; font-size: 12px; margin: 0;">
        &copy; ${new Date().getFullYear()} The New 1017 Records. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
          `
        });

        console.log("✅ [Resend] Application notification emails sent successfully");
      } catch (emailErr: any) {
        console.error("❌ [Resend] Failed to send email notification:", emailErr?.message || emailErr);
      }
    } else {
      console.warn("⚠️ [Resend] RESEND_API_KEY not set. Skipping email notification.");
    }

    return { ok: true };
  });

// Admin: list artist applications
export const adminListApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertAdmin(context.userId, context.supabase, context.userEmail);
    const { data, error } = await admin
      .from("artist_applications")
      .select("*")
      .order("submitted_at", { ascending: false });
    if (error) throw new Error("A database transaction error occurred. Operation aborted safely.");
    return { applications: data ?? [] };
  });

// Admin: update application status
export const adminUpdateApplicationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["Pending", "Reviewed", "Reviewing", "Approved", "Rejected", "Archived"]),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context.userId, context.supabase, context.userEmail);

    // 1. Fetch current application details
    const { data: currentApp, error: fetchError } = await admin
      .from("artist_applications")
      .select("status, artist_name, email, application_number, submitted_at")
      .eq("id", data.id)
      .single();
    
    if (fetchError || !currentApp) {
      throw new Error("Application not found.");
    }

    // 2. Prevent duplicate emails if the status is exactly the same
    if (currentApp.status === data.status) {
      return { ok: true };
    }

    // 3. Perform database update
    const { error } = await admin
      .from("artist_applications")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error("A database transaction error occurred. Operation aborted safely.");

    await logActivity(context.userId, "admin_update_application_status", { id: data.id, status: data.status });

    // 4. Send email notification using Resend
    const shouldSendEmail = ["Pending", "Reviewing", "Approved", "Rejected"].includes(data.status);
    if (process.env.RESEND_API_KEY && shouldSendEmail) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const appId = currentApp.application_number ? currentApp.application_number.toString() : "Unknown ID";
        const submittedDate = new Date(currentApp.submitted_at || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        
        let statusTitle = "Status Update";
        let statusDesc = "Your application status has been updated.";
        let statusColor = "#D4AF37"; // Gold default

        if (data.status === "Pending") {
            statusTitle = "Application Re-opened";
            statusDesc = "Your application has been moved back to Pending status and is queued for future review.";
            statusColor = "#888888"; // Gray
        } else if (data.status === "Reviewing") {
            statusTitle = "Application Under Review";
            statusDesc = "Our A&R team is currently reviewing your submission. We will notify you once a final decision is made.";
            statusColor = "#D4AF37"; // Gold
        } else if (data.status === "Approved") {
            statusTitle = "Application Approved";
            statusDesc = "Congratulations, your application has been approved. A member of our team will be in touch shortly with next steps.";
            statusColor = "#10B981"; // Emerald Green
        } else if (data.status === "Rejected") {
            statusTitle = "Application Update";
            statusDesc = "Thank you for submitting your music. Unfortunately, we are passing on your submission at this time. We wish you the best in your career.";
            statusColor = "#EF4444"; // Red
        }

        const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${statusTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #E5E5E5; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <div style="text-align: center; margin-bottom: 40px;">
      <img src="https://thenew1017records.us/official_logo.png" alt="The New 1017 Records" width="120" style="display: inline-block; width: 120px; height: auto;" />
    </div>
    
    <div style="background-color: #111111; border: 1px solid #333333; border-radius: 8px; padding: 40px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: ${statusColor}; font-size: 24px; font-weight: 600; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 2px;">${statusTitle}</h1>
        <p style="color: #888888; font-size: 14px; margin: 0; letter-spacing: 1px;">OFFICIAL ARTIST SUBMISSION</p>
      </div>

      <p style="color: #E5E5E5; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
        ${statusDesc}
      </p>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 35px;">
        <tr>
          <td style="padding: 15px 0; border-bottom: 1px solid #222222; color: #888888; font-size: 14px; width: 40%;">Application ID</td>
          <td style="padding: 15px 0; border-bottom: 1px solid #222222; color: #FFFFFF; font-weight: 500; font-size: 14px; text-align: right;">${appId}</td>
        </tr>
        <tr>
          <td style="padding: 15px 0; border-bottom: 1px solid #222222; color: #888888; font-size: 14px;">Artist</td>
          <td style="padding: 15px 0; border-bottom: 1px solid #222222; color: #FFFFFF; font-weight: 500; font-size: 14px; text-align: right;">${currentApp.artist_name}</td>
        </tr>
        <tr>
          <td style="padding: 15px 0; border-bottom: 1px solid #222222; color: #888888; font-size: 14px;">Date Submitted</td>
          <td style="padding: 15px 0; border-bottom: 1px solid #222222; color: #FFFFFF; font-weight: 500; font-size: 14px; text-align: right;">${submittedDate}</td>
        </tr>
        <tr>
          <td style="padding: 15px 0; border-bottom: 1px solid #222222; color: #888888; font-size: 14px;">Current Status</td>
          <td style="padding: 15px 0; border-bottom: 1px solid #222222; color: ${statusColor}; font-weight: 600; font-size: 14px; text-align: right; text-transform: uppercase;">${data.status}</td>
        </tr>
      </table>

      <div style="text-align: center; border-top: 1px solid #222222; padding-top: 30px;">
        <a href="https://thenew1017records.us" style="color: #D4AF37; text-decoration: none; font-size: 14px; font-weight: 500; letter-spacing: 1px; margin: 0 15px;">WEBSITE</a>
        <a href="mailto:contact@thenew1017records.us" style="color: #D4AF37; text-decoration: none; font-size: 14px; font-weight: 500; letter-spacing: 1px; margin: 0 15px;">SUPPORT</a>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 30px; color: #666666; font-size: 12px; line-height: 1.5;">
      <p style="margin: 0 0 10px 0;">&copy; ${new Date().getFullYear()} The New 1017 Records. All rights reserved.</p>
      <p style="margin: 0;">If you did not submit this application or need assistance, simply reply to this email and our team will assist you.</p>
    </div>
  </div>
</body>
</html>`;

        await resend.emails.send({
          from: "The New 1017 Records <notifications@thenew1017records.us>",
          replyTo: "contact@thenew1017records.us",
          to: [currentApp.email],
          subject: `Application Update: ${currentApp.artist_name} - ${data.status}`,
          html: emailHtml,
        });
      } catch (err) {
        console.error("Failed to send status update email:", err);
      }
    }

    return { ok: true };
  });

// Helper: Extract storage path from Supabase public URL
function extractStoragePath(url: string | null, bucket: string): string | null {
  if (!url) return null;
  try {
    const searchStr = `/storage/v1/object/public/${bucket}/`;
    const index = url.indexOf(searchStr);
    if (index !== -1) {
      return url.substring(index + searchStr.length);
    }
    const parts = url.split(`/${bucket}/`);
    if (parts.length > 1) {
      return parts[1];
    }
  } catch (e) {
    console.error("Error parsing storage path:", e);
  }
  return null;
}

// Admin: delete application (with synchronized storage cleanup)
export const adminDeleteApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context.userId, context.supabase, context.userEmail);
    
    // 1. Retrieve application record before deletion to locate storage paths
    const { data: record, error: getError } = await admin
      .from("artist_applications")
      .select("artist_photo_url, epk_url")
      .eq("id", data.id)
      .single();
      
    if (getError && getError.code !== "PGRST116") {
      throw new Error(getError.message);
    }

    // 2. Perform physical storage deletion if URLs exist
    if (record) {
      if (record.artist_photo_url) {
        const path = extractStoragePath(record.artist_photo_url, "artist-photos");
        if (path) {
          const { error: delPhotoError } = await admin.storage.from("artist-photos").remove([path]);
          if (delPhotoError) {
            console.error("Storage clean warning (photo):", delPhotoError.message);
          }
        }
      }
      if (record.epk_url) {
        const path = extractStoragePath(record.epk_url, "artist-portfolios");
        if (path) {
          const { error: delEpkError } = await admin.storage.from("artist-portfolios").remove([path]);
          if (delEpkError) {
            console.error("Storage clean warning (EPK):", delEpkError.message);
          }
        }
      }
    }

    // 3. Delete database record
    const { error: deleteDbError } = await admin.from("artist_applications").delete().eq("id", data.id);
    if (deleteDbError) throw new Error(deleteDbError.message);
    
    await logActivity(context.userId, "admin_delete_application_permanent", { id: data.id });
    return { ok: true };
  });

// Founder Spotlight Schema
const FounderSpotlightSchema = z.object({
  id: z.string().uuid().optional(),
  founder_name: z.string().min(1),
  founder_title: z.string().min(1),
  founder_badge: z.string().min(1),
  founder_description: z.string().min(1),
  stat_1_label: z.string().min(1),
  stat_1_value: z.string().min(1),
  stat_2_label: z.string().min(1),
  stat_2_value: z.string().min(1),
  stat_3_label: z.string().min(1),
  stat_3_value: z.string().min(1),
  founder_image_url: z.string().nullable().optional(),
  founder_image_alt: z.string().min(1),
  is_visible: z.boolean().default(true),
});

export const DEFAULT_SPOTLIGHT = {
  founder_name: "Gucci Mane",
  founder_title: "Gucci Mane",
  founder_badge: "1017 FOUNDER // A&R CHIEF",
  founder_description: "Gucci Mane is the visionary architect of modern trap music. By establishing 1017 Records, he built an elite talent incubator that pioneered soundwaves and launched global careers. With deep instinctual expertise, he continues to identify, sign, and launch independent artists onto the world stage, making the 1017 Records network the ultimate launchpad.",
  stat_1_label: "Signed Alumni",
  stat_1_value: "12+",
  stat_2_label: "Streams Built",
  stat_2_value: "5B+",
  stat_3_label: "Careers Run",
  stat_3_value: "PLATINUM",
  founder_image_url: "https://vveslmalxlprmlfcdjae.supabase.co/storage/v1/object/public/media/founder/spotlight-1780301297380.jpg",
  founder_image_alt: "Gucci Mane Founder Showcase",
  is_visible: true,
};

export function sanitizeSpotlightData(data: any): any {
  if (!data || typeof data !== "object") return DEFAULT_SPOTLIGHT;
  return {
    id: data.id || undefined,
    founder_name: data.founder_name || DEFAULT_SPOTLIGHT.founder_name,
    founder_title: data.founder_title || DEFAULT_SPOTLIGHT.founder_title,
    founder_badge: data.founder_badge || DEFAULT_SPOTLIGHT.founder_badge,
    founder_description: data.founder_description || DEFAULT_SPOTLIGHT.founder_description,
    stat_1_label: data.stat_1_label || DEFAULT_SPOTLIGHT.stat_1_label,
    stat_1_value: data.stat_1_value || DEFAULT_SPOTLIGHT.stat_1_value,
    stat_2_label: data.stat_2_label || DEFAULT_SPOTLIGHT.stat_2_label,
    stat_2_value: data.stat_2_value || DEFAULT_SPOTLIGHT.stat_2_value,
    stat_3_label: data.stat_3_label || DEFAULT_SPOTLIGHT.stat_3_label,
    stat_3_value: data.stat_3_value || DEFAULT_SPOTLIGHT.stat_3_value,
    founder_image_url: data.founder_image_url || DEFAULT_SPOTLIGHT.founder_image_url,
    founder_image_alt: data.founder_image_alt || DEFAULT_SPOTLIGHT.founder_image_alt,
    is_visible: data.is_visible !== false,
  };
}

async function getOrCreateFounderSpotlight(admin: any) {
  try {
    const { data, error } = await admin.from("founder_spotlight").select("*").maybeSingle();
    if (!error && data) {
      return sanitizeSpotlightData(data);
    }
    if (!error && !data) {
      const { data: inserted, error: insertError } = await admin
        .from("founder_spotlight")
        .insert({
          id: "d18d4d9b-d805-4c07-b0b2-0be724c9657b",
          ...DEFAULT_SPOTLIGHT
        })
        .select()
        .maybeSingle();
      if (!insertError && inserted) {
        return sanitizeSpotlightData(inserted);
      }
    }
    if (error) {
      console.warn("⚠️ [founder_spotlight table select error]:", error.message);
    }
  } catch (err: any) {
    console.warn("⚠️ [founder_spotlight table exception]:", err.message);
  }

  // Fallback to site_settings
  try {
    const { data: settingsRow, error: settingsError } = await admin
      .from("site_settings")
      .select("value")
      .eq("key", "founder_spotlight")
      .maybeSingle();
    if (!settingsError && settingsRow?.value) {
      return sanitizeSpotlightData(settingsRow.value);
    }
    const { error: upsertError } = await admin
      .from("site_settings")
      .upsert({ key: "founder_spotlight", value: DEFAULT_SPOTLIGHT }, { onConflict: "key" });
    if (!upsertError) {
      return DEFAULT_SPOTLIGHT;
    }
  } catch (err: any) {
    console.warn("⚠️ [site_settings fallback exception]:", err.message);
  }

  return DEFAULT_SPOTLIGHT;
}

export const adminGetFounderSpotlight = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertAdmin(context.userId, context.supabase, context.userEmail);
    const data = await getOrCreateFounderSpotlight(admin);
    return { data };
  });

export const adminRegenerateAdminTokens = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertAdmin(context.userId, context.supabase, context.userEmail);
    await logActivity(context.userId, "admin_security_token_refresh", {});
    return { ok: true };
  });

export const adminGetVisitorAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertAdmin(context.userId, context.supabase, context.userEmail);
    
    const now = Date.now();
    // Fetch last 30 days of data
    const since30 = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
    const since1 = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    const activeThreshold = new Date(now - 5 * 60 * 1000).toISOString();

    const { data: siteSettings, error: sErr } = await admin
      .from("site_settings")
      .select("value")
      .like("key", "analytics:session:%");

    const { data: artistsData, error: aErr } = await admin
      .from("artists")
      .select("id,name");

    if (sErr || aErr) {
      throw new Error("Failed to fetch analytics data");
    }

    const sessions = (siteSettings || []).map(s => s.value as any).filter(s => s && s.first_seen >= since30);

    // Process overview
    const totalVisitors = sessions.length;
    const activeVisitors = sessions.filter(s => s.last_seen >= activeThreshold).length;
    const newVisitorsToday = sessions.filter(s => s.first_seen >= since1).length;
    const returningVisitors = sessions.filter(s => {
      const first = new Date(s.first_seen).getTime();
      const last = new Date(s.last_seen).getTime();
      return (last - first) > 24 * 60 * 60 * 1000;
    }).length;

    const totalVisits = sessions.reduce((acc, s) => acc + (s.view_count || 1), 0);

    let avgSessionDuration = 0;
    let durationCount = 0;
    sessions.forEach(s => {
      const first = new Date(s.first_seen).getTime();
      const last = new Date(s.last_seen).getTime();
      if (last > first) {
        avgSessionDuration += (last - first);
        durationCount++;
      }
    });
    if (durationCount > 0) {
      avgSessionDuration = avgSessionDuration / durationCount; // in MS
    }

    // Process Geography & Devices from user_agent
    const geoMap = new Map<string, number>();
    let mobile = 0, desktop = 0, tablet = 0;

    sessions.forEach(s => {
      const ua = s.user_agent || "";
      if (ua.match(/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/)) {
        if (ua.match(/tablet|ipad|playbook|silk/i)) tablet++;
        else mobile++;
      } else {
        desktop++;
      }

      const geoMatch = ua.match(/\[GEO:(.*?)\]/);
      if (geoMatch && geoMatch[1]) {
        const loc = geoMatch[1].trim();
        geoMap.set(loc, (geoMap.get(loc) || 0) + 1);
      } else {
        geoMap.set("Unknown", (geoMap.get("Unknown") || 0) + 1);
      }
    });

    const geography = Array.from(geoMap.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Process Top Pages (Artists & Generic Pages)
    const artistNameMap = new Map<string, string>();
    artistsData?.forEach(a => artistNameMap.set(a.id, a.name));

    const pageViewCount = new Map<string, number>();
    
    sessions.forEach(s => {
      if (s.pages && typeof s.pages === 'object') {
        Object.entries(s.pages).forEach(([path, count]) => {
          let name = path;
          if (path.startsWith("artist:")) {
            const id = path.replace("artist:", "");
            name = artistNameMap.get(id) || "Unknown Artist";
          }
          pageViewCount.set(name, (pageViewCount.get(name) || 0) + (count as number));
        });
      }
    });

    const topPages = Array.from(pageViewCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Traffic Charts (Daily)
    const days: { date: string; visitors: number; views: number }[] = [];
    const byDay = new Map<string, { visitors: number; views: number }>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      byDay.set(key, { visitors: 0, views: 0 });
    }
    
    sessions.forEach(s => {
      const k = s.first_seen?.slice(0, 10);
      const e = byDay.get(k);
      if (e) {
        e.visitors += 1;
        e.views += (s.view_count || 1);
      }
    });

    for (const [date, v] of byDay) days.push({ date, ...v });

    return {
      overview: {
        totalVisitors,
        totalVisits,
        returningVisitors,
        newVisitorsToday,
        activeVisitors,
        avgSessionDuration,
      },
      geography,
      device: { mobile, desktop, tablet },
      topPages,
      traffic: days,
      visitors: sessions.map(s => {
        const geoMatch = (s.user_agent || "").match(/\[GEO:(.*?)\]/);
        return {
          id: s.session_id,
          country: geoMatch ? geoMatch[1].split(',')[0] : "Unknown",
          device: (s.user_agent || "").match(/tablet|ipad/i) ? "Tablet" : (s.user_agent || "").match(/Mobile/) ? "Mobile" : "Desktop",
          first_visit: s.first_seen,
          last_visit: s.last_seen,
          visit_count: s.view_count || 1
        };
      }).sort((a, b) => new Date(b.last_visit).getTime() - new Date(a.last_visit).getTime())
    };
  });

export const adminSaveFounderSpotlight = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    if (!input || typeof input !== "object") {
      throw new Error("Invalid payload: expected an object");
    }
    return FounderSpotlightSchema.parse(input);
  })
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context.userId, context.supabase, context.userEmail);
    const sanitized = sanitizeSpotlightData(data);
    try {
      if (sanitized.id) {
        const { id, ...rest } = sanitized;
        const { error } = await admin.from("founder_spotlight").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await admin.from("founder_spotlight").insert(sanitized);
        if (error) throw error;
      }
      clearPublicCaches();
      return { ok: true };
    } catch (err: any) {
      console.warn("⚠️ [founder_spotlight save fallback]:", err.message);
      const { error: settingsError } = await admin
        .from("site_settings")
        .upsert({ key: "founder_spotlight", value: sanitized }, { onConflict: "key" });
      if (settingsError) throw new Error(settingsError.message);
      clearPublicCaches();
      return { ok: true };
    }
  });

export const getPublicFounderSpotlight = createServerFn({ method: "GET" })
  .handler(async () => {
    const admin = getAdminClient();
    const data = await getOrCreateFounderSpotlight(admin);
    return { data };
  });

// Media Gallery schemas & Server Functions
const GalleryImageSchema = z.object({
  id: z.string().uuid().optional(),
  artist_id: z.string().uuid(),
  image_url: z.string(),
  caption: z.string().max(500).nullable().optional().default(""),
  credit: z.string().max(200).nullable().optional().default(""),
  category: z.enum(["Press Photo", "Performance", "Studio Session", "Behind The Scenes", "Lifestyle"]).default("Press Photo"),
  sort_order: z.number().int().min(0).max(9999).default(0),
  featured: z.boolean().default(false),
});

export const getArtistMediaGallery = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ artistId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data: gallery, error } = await supabase
      .from("media_gallery")
      .select("*")
      .eq("artist_id", data.artistId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) {
      console.warn("⚠️ [getArtistMediaGallery error]:", error.message);
      return { gallery: [] };
    }
    return { gallery: gallery ?? [] };
  });

export const adminUpsertGalleryImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => GalleryImageSchema.parse(input))
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context.userId, context.supabase, context.userEmail);
    if (data.id) {
      const { id, ...rest } = data;
      const { error } = await admin.from("media_gallery").update(rest).eq("id", id);
      if (error) throw new Error("A database transaction error occurred. Operation aborted safely.");
      return { id };
    } else {
      const { id: _ignore, ...rest } = data;
      const { data: row, error } = await admin.from("media_gallery").insert(rest).select("id").single();
      if (error) throw new Error("A database transaction error occurred. Operation aborted safely.");
      return { id: row.id };
    }
  });

export const adminDeleteGalleryImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context.userId, context.supabase, context.userEmail);
    const { error } = await admin.from("media_gallery").delete().eq("id", data.id);
    if (error) throw new Error("A database transaction error occurred. Operation aborted safely.");
    return { ok: true };
  });