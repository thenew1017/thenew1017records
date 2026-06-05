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
let cachedGeo = "";

async function getGeoString() {
  if (cachedGeo) return cachedGeo;
  try {
    const res = await fetch("https://get.geojs.io/v1/ip/geo.json");
    if (res.ok) {
      const data = await res.json();
      if (data.country && data.city) {
        cachedGeo = `[GEO:${data.country}, ${data.city}]`;
        return cachedGeo;
      }
    }
  } catch {
    /* ignore network errors for tracking */
  }
  return "[GEO:Unknown, Unknown]";
}

async function updateSession(updater: (val: any) => void) {
  if (typeof window === "undefined") return;
  const session_id = getSessionId();
  const key = `analytics:session:${session_id}`;
  try {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();

    let val: any = data?.value;

    if (!val || typeof val !== 'object') {
      const geo = await getGeoString();
      const uaBase = navigator.userAgent?.slice(0, 200) ?? "Unknown";
      val = {
        session_id,
        first_seen: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        user_agent: `${uaBase} ${geo}`,
        referrer: document.referrer?.slice(0, 500) || null,
        view_count: 0,
        click_count: 0,
        hover_count: 0,
        pages: {}
      };
    }

    updater(val);
    val.last_seen = new Date().toISOString();

    await supabase.from("site_settings").upsert(
      { key, value: val },
      { onConflict: "key" }
    );
  } catch {
    /* tracking is best-effort */
  }
}

export async function ensureSession() {
  if (sessionEnsured || typeof window === "undefined") return;
  sessionEnsured = true;
  await updateSession(() => {});
}

export async function trackPage() {
  if (typeof window === "undefined") return;
  await ensureSession();
  
  const path = window.location.pathname;
  // Debounce basic page views so we don't spam db on fast navigation
  const lastTrack = sessionStorage.getItem(`track_${path}`);
  if (lastTrack && Date.now() - parseInt(lastTrack) < 5000) return;
  sessionStorage.setItem(`track_${path}`, Date.now().toString());

  await updateSession((val) => {
    val.view_count = (val.view_count || 0) + 1;
    val.pages = val.pages || {};
    val.pages[path] = (val.pages[path] || 0) + 1;
  });
}

export async function trackView(artistId: string, source = "card") {
  if (typeof window === "undefined" || !artistId) return;
  await ensureSession();
  await updateSession((val) => {
    val.view_count = (val.view_count || 0) + 1;
    val.pages = val.pages || {};
    const p = `artist:${artistId}`;
    val.pages[p] = (val.pages[p] || 0) + 1;
  });
}

export async function trackClick(artistId: string, link_type: string) {
  if (typeof window === "undefined" || !artistId) return;
  await ensureSession();
  await updateSession((val) => {
    val.click_count = (val.click_count || 0) + 1;
  });
}

// Hover tracking is debounced per-artist to avoid spam
const hoverDebounce = new Map<string, number>();
export function trackHover(artistId: string) {
  if (typeof window === "undefined" || !artistId) return;
  const now = Date.now();
  const last = hoverDebounce.get(artistId) ?? 0;
  if (now - last < 1500) return;
  hoverDebounce.set(artistId, now);
  
  void updateSession((val) => {
    val.hover_count = (val.hover_count || 0) + 1;
  });
}