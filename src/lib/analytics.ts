import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "ar_sid_v1";

function uid() {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  } catch {}
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = uid();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return uid();
  }
}

let sessionEnsured = false;

export async function ensureSession() {
  if (sessionEnsured || typeof window === "undefined") return;
  sessionEnsured = true;
  const session_id = getSessionId();
  try {
    await supabase.from("artist_sessions").upsert(
      {
        session_id,
        last_seen: new Date().toISOString(),
        user_agent: navigator.userAgent?.slice(0, 255) ?? null,
        referrer: document.referrer?.slice(0, 500) || null,
      },
      { onConflict: "session_id", ignoreDuplicates: false },
    );
  } catch {
    /* tracking is best-effort */
  }
}

async function bumpSession(field: "view_count" | "click_count" | "hover_count") {
  if (typeof window === "undefined") return;
  const session_id = getSessionId();
  try {
    const { data } = await supabase
      .from("artist_sessions")
      .select("view_count,click_count,hover_count")
      .eq("session_id", session_id)
      .maybeSingle();
    const current = (data?.[field] as number | null) ?? 0;
    const patch =
      field === "view_count"
        ? { view_count: current + 1, last_seen: new Date().toISOString() }
        : field === "click_count"
        ? { click_count: current + 1, last_seen: new Date().toISOString() }
        : { hover_count: current + 1, last_seen: new Date().toISOString() };
    await supabase.from("artist_sessions").update(patch).eq("session_id", session_id);
  } catch {
    /* best-effort */
  }
}

export async function trackView(artistId: string, source = "card") {
  if (typeof window === "undefined" || !artistId) return;
  await ensureSession();
  try {
    await supabase.from("artist_views").insert({
      artist_id: artistId,
      session_id: getSessionId(),
      source,
    });
    void bumpSession("view_count");
  } catch {
    /* best-effort */
  }
}

export async function trackClick(artistId: string, link_type: string) {
  if (typeof window === "undefined" || !artistId) return;
  await ensureSession();
  try {
    await supabase.from("artist_clicks").insert({
      artist_id: artistId,
      session_id: getSessionId(),
      link_type,
    });
    void bumpSession("click_count");
  } catch {
    /* best-effort */
  }
}

// Hover tracking is debounced per-artist to avoid spam
const hoverDebounce = new Map<string, number>();
export function trackHover(artistId: string) {
  if (typeof window === "undefined" || !artistId) return;
  const now = Date.now();
  const last = hoverDebounce.get(artistId) ?? 0;
  if (now - last < 1500) return;
  hoverDebounce.set(artistId, now);
  void bumpSession("hover_count");
}