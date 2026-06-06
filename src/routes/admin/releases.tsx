import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminGetSettings, adminSetSetting } from "@/lib/cms.functions";
import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Upload, X, Search, ChevronUp, ChevronDown, Music, Star, Pin, BarChart2, Award, Settings, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/admin/releases")({
  component: ReleasesAdmin,
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
});

export type BadgeTemplate = {
  id: "verified_hit" | "gold_record" | "platinum_record";
  title: string;
  icon: string;
  theme: "red" | "gold" | "platinum" | "purple" | "cyan";
  glow: number; // 0.1 to 1.0
  order: number;
  visible: boolean;
};

const DEFAULT_TEMPLATES = (): BadgeTemplate[] => [
  { id: "verified_hit", title: "HIT RECORD", icon: "🔥", theme: "red", glow: 0.6, order: 0, visible: true },
  { id: "gold_record", title: "GOLD CERTIFIED", icon: "🥇", theme: "gold", glow: 0.8, order: 1, visible: true },
  { id: "platinum_record", title: "PLATINUM CERTIFIED", icon: "💿", theme: "platinum", glow: 1.0, order: 2, visible: true },
];

export type Release = {
  id: string;
  title: string;
  artist: string;
  cover_url: string;
  release_date: string;
  format: "Single" | "EP" | "Album" | "Mixtape";
  genre: string;
  description: string;
  spotify_url: string;
  apple_url: string;
  youtube_url: string;
  soundcloud_url: string;
  website_url: string;
  sort_order: number;
  published: boolean;
  featured: boolean;
  pinned: boolean;
  // Stats Metrics
  views?: number | null;
  streams?: number | null;
  rating?: number | null;
  likes?: number | null;
  favorites?: number | null;
  shares?: number | null;
  listeners?: number | null;
  downloads?: number | null;
  // Certifications enabled per-release
  verified_hit?: boolean;
  gold_record?: boolean;
  platinum_record?: boolean;
};

const EMPTY_RELEASE = (): Release => ({
  id: "",
  title: "",
  artist: "",
  cover_url: "",
  release_date: new Date().toISOString().split("T")[0],
  format: "Single",
  genre: "",
  description: "",
  spotify_url: "",
  apple_url: "",
  youtube_url: "",
  soundcloud_url: "",
  website_url: "",
  sort_order: 0,
  published: true,
  featured: false,
  pinned: false,
  views: null,
  streams: null,
  rating: null,
  likes: null,
  favorites: null,
  shares: null,
  listeners: null,
  downloads: null,
  verified_hit: false,
  gold_record: false,
  platinum_record: false,
});

function ReleasesAdmin() {
  const get = useServerFn(adminGetSettings);
  const set = useServerFn(adminSetSetting);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["adm-settings"],
    queryFn: () => get(),
  });

  const rawReleases = useMemo(() => {
    return (data?.settings?.releases as Release[] | undefined) ?? [];
  }, [data]);

  const rawTemplates = useMemo(() => {
    return (data?.settings?.releases_badge_templates as BadgeTemplate[] | undefined) ?? DEFAULT_TEMPLATES();
  }, [data]);

  const [releases, setReleases] = useState<Release[]>([]);
  const [templates, setTemplates] = useState<BadgeTemplate[]>(DEFAULT_TEMPLATES());
  const [showTemplates, setShowTemplates] = useState(false);
  const [savingTemplates, setSavingTemplates] = useState(false);

  useEffect(() => {
    if (rawReleases) {
      const sorted = [...rawReleases].sort((a, b) => a.sort_order - b.sort_order);
      setReleases(sorted);
    }
  }, [rawReleases]);

  useEffect(() => {
    if (rawTemplates) {
      const sorted = [...rawTemplates].sort((a, b) => a.order - b.order);
      setTemplates(sorted);
    }
  }, [rawTemplates]);

  const [analyticsStyle, setAnalyticsStyle] = useState<string>("Premium");
  const [savingStyle, setSavingStyle] = useState(false);

  useEffect(() => {
    if (data?.settings?.analytics_display_style) {
      setAnalyticsStyle(String(data.settings.analytics_display_style));
    }
  }, [data]);

  const handleSaveStyle = async (newStyle: string) => {
    setSavingStyle(true);
    setAnalyticsStyle(newStyle);
    try {
      await set({ data: { key: "analytics_display_style", value: newStyle } });
      qc.invalidateQueries({ queryKey: ["adm-settings"] });
      qc.invalidateQueries({ queryKey: ["public-settings"] });
    } catch (err) {
      console.error("[Save Style Error]:", err);
      alert("Failed to save style setting.");
    } finally {
      setSavingStyle(false);
    }
  };

  const [editing, setEditing] = useState<Release | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [busy, setBusy] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  // Sync releases to Supabase
  const saveAll = async (updatedList: Release[]) => {
    setBusy(true);
    setSavedMsg(false);
    try {
      const cleanList = updatedList.map((item, idx) => ({
        ...item,
        sort_order: idx,
      }));
      await set({ data: { key: "releases", value: cleanList } });
      setReleases(cleanList);
      qc.invalidateQueries({ queryKey: ["adm-settings"] });
      qc.invalidateQueries({ queryKey: ["public-settings"] });
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
    } catch (err) {
      console.error("[Releases Save Error]:", err);
      alert(err instanceof Error ? err.message : "Failed to save releases");
    } finally {
      setBusy(false);
    }
  };

  // Sync Certification Badge Templates globally to Supabase Settings
  const saveTemplates = async () => {
    setSavingTemplates(true);
    try {
      const sortedTemplates = [...templates].map((t, idx) => ({
        ...t,
        order: idx,
      }));
      await set({ data: { key: "releases_badge_templates", value: sortedTemplates } });
      qc.invalidateQueries({ queryKey: ["adm-settings"] });
      qc.invalidateQueries({ queryKey: ["public-settings"] });
      alert("Award templates updated globally! Check the public site for real-time metallic updates.");
      setShowTemplates(false);
    } catch (err) {
      console.error("[Templates Save Error]:", err);
      alert(err instanceof Error ? err.message : "Failed to save certification templates");
    } finally {
      setSavingTemplates(false);
    }
  };

  const handleUpdateTemplate = <K extends keyof BadgeTemplate>(id: BadgeTemplate["id"], key: K, val: BadgeTemplate[K]) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, [key]: val } : t)));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this release from the catalog? This action cannot be undone.")) return;
    const remaining = releases.filter((r) => r.id !== id);
    await saveAll(remaining);
  };

  const handleTogglePublish = async (id: string) => {
    const updated = releases.map((r) => (r.id === id ? { ...r, published: !r.published } : r));
    await saveAll(updated);
  };

  const handleToggleFeatured = async (id: string) => {
    const updated = releases.map((r) => (r.id === id ? { ...r, featured: !r.featured } : r));
    await saveAll(updated);
  };

  const handleTogglePinned = async (id: string) => {
    const updated = releases.map((r) => (r.id === id ? { ...r, pinned: !r.pinned } : r));
    await saveAll(updated);
  };

  const handleToggleCert = async (id: string, type: "verified_hit" | "gold_record" | "platinum_record") => {
    const updated = releases.map((r) => (r.id === id ? { ...r, [type]: !r[type] } : r));
    await saveAll(updated);
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const nextIdx = direction === "up" ? index - 1 : index + 1;
    if (nextIdx < 0 || nextIdx >= releases.length) return;

    const list = [...releases];
    const temp = list[index];
    list[index] = list[nextIdx];
    list[nextIdx] = temp;

    await saveAll(list);
  };

  const filteredReleases = useMemo(() => {
    return releases.filter((r) => {
      const matchSearch =
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.artist.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchFormat = formatFilter === "All" || r.format === formatFilter;
      
      let matchStatus = true;
      if (statusFilter === "Published") matchStatus = r.published;
      else if (statusFilter === "Drafts") matchStatus = !r.published;
      else if (statusFilter === "Featured") matchStatus = r.featured;
      else if (statusFilter === "Pinned") matchStatus = r.pinned;

      return matchSearch && matchFormat && matchStatus;
    });
  }, [releases, searchQuery, formatFilter, statusFilter]);

  const formatMetric = (num: number | undefined | null): string => {
    if (num === undefined || num === null || isNaN(num) || num <= 0) return "";
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  };

  // Render Theme Label
  const getThemeLabel = (theme: BadgeTemplate["theme"]) => {
    switch (theme) {
      case "red": return "🔴 Red Metallic finish";
      case "gold": return "🟡 Gold Metallic appearance";
      case "platinum": return "⚪ Platinum/Silver Chrome finish";
      case "purple": return "🟣 Royal Purple Metallic";
      case "cyan": return "🔵 Cyan Laser Metallic";
    }
  };

  if (isLoading) {
    return (
      <AdminShell title="Release Manager">
        <p className="text-muted-foreground text-sm">Retrieving site catalog database…</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Release Manager">
      <div className="flex flex-col gap-6">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="text-sm text-muted-foreground">
              Manage your catalog releases, streaming portal links, cover art, custom metrics, gold/platinum certifications, and global award design templates.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Analytics Display Style Select Option */}
            <div className="flex items-center gap-2 bg-secondary border border-border rounded-md px-3 py-2 text-xs">
              <span className="text-muted-foreground uppercase font-mono tracking-wider text-[9px] shrink-0 font-bold">Analytics Style:</span>
              <select
                value={analyticsStyle}
                disabled={savingStyle}
                onChange={(e) => handleSaveStyle(e.target.value)}
                className="bg-transparent border-0 text-lux-white focus:outline-none cursor-pointer uppercase font-mono tracking-wider font-extrabold text-[9px] min-w-[140px]"
              >
                <option value="Compact" className="bg-zinc-950 text-white">Compact</option>
                <option value="Premium" className="bg-zinc-950 text-white">Premium</option>
                <option value="Billboard Style" className="bg-zinc-950 text-white">Billboard Style</option>
                <option value="Spotify Style" className="bg-zinc-950 text-white">Spotify Style</option>
                <option value="Apple Music Style" className="bg-zinc-950 text-white">Apple Music Style</option>
              </select>
              {savingStyle && <span className="h-1.5 w-1.5 rounded-full bg-accent animate-ping ml-1" />}
            </div>

            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="inline-flex items-center gap-2 bg-secondary hover:bg-accent hover:text-accent-foreground px-4 py-2.5 rounded-md text-xs uppercase tracking-[0.25em] font-semibold transition-colors"
            >
              <Settings className="h-4 w-4" /> Global Badges Template Manager
            </button>
            <button
              onClick={() => {
                const fresh = EMPTY_RELEASE();
                fresh.id = crypto.randomUUID();
                setEditing(fresh);
              }}
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2.5 rounded-md text-xs uppercase tracking-[0.25em] font-semibold hover:bg-yellow-400 shadow-md transition-colors"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" /> Add New Release
            </button>
          </div>
        </div>

        {/* Dynamic Global Badges Template Panel Overlay */}
        {showTemplates && (
          <div className="bg-secondary/15 border border-border p-6 rounded-2xl space-y-6 relative overflow-hidden bg-gradient-to-r from-secondary/10 via-red-950/5 to-secondary/10">
            <div className="absolute top-4 right-4">
              <button onClick={() => setShowTemplates(false)} className="p-1 hover:bg-secondary rounded text-muted-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div>
              <h2 className="text-sm font-mono uppercase tracking-[0.3em] text-accent flex items-center gap-2">
                <Award className="h-4 w-4" /> ⚙️ Global Award Certification Badge Templates
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Customize titles, icons/emojis, metallic colors, and bloom glow intensities. Updates are applied globally to all releases instantly.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {templates.map((t) => (
                <div key={t.id} className="bg-black/30 border border-white/5 p-4 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-bold">Template ID: {t.id}</span>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-mono uppercase tracking-widest">
                      <input
                        type="checkbox"
                        checked={t.visible}
                        onChange={(e) => handleUpdateTemplate(t.id, "visible", e.target.checked)}
                        className="rounded border-border bg-secondary text-accent h-3.5 w-3.5"
                      />
                      <span>Global Show</span>
                    </label>
                  </div>

                  <div className="space-y-3">
                    <label className="block">
                      <span className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground">Badge Label Title</span>
                      <input
                        value={t.title}
                        onChange={(e) => handleUpdateTemplate(t.id, "title", e.target.value.toUpperCase())}
                        className="w-full bg-secondary/50 border border-border rounded px-2.5 py-1.5 text-xs text-lux-white mt-1"
                        placeholder="e.g. GOLD CERTIFIED"
                      />
                    </label>

                    <div className="grid grid-cols-3 gap-2">
                      <label className="col-span-1">
                        <span className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground">Icon/Emoji</span>
                        <input
                          value={t.icon}
                          onChange={(e) => handleUpdateTemplate(t.id, "icon", e.target.value)}
                          className="w-full bg-secondary/50 border border-border rounded px-2.5 py-1.5 text-xs text-center text-lux-white mt-1"
                          placeholder="e.g. 🥇"
                        />
                      </label>
                      <label className="col-span-2">
                        <span className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground">Metallic Finish Theme</span>
                        <select
                          value={t.theme}
                          onChange={(e) => handleUpdateTemplate(t.id, "theme", e.target.value as BadgeTemplate["theme"])}
                          className="w-full bg-secondary/50 border border-border rounded px-2.5 py-1.5 text-xs text-lux-white mt-1 focus:outline-none"
                        >
                          <option value="red">Red Metallic</option>
                          <option value="gold">Gold Metallic</option>
                          <option value="platinum">Platinum Chrome</option>
                          <option value="purple">Royal Purple</option>
                          <option value="cyan">Cyan Laser</option>
                        </select>
                      </label>
                    </div>

                    <label className="block">
                      <div className="flex justify-between text-[8px] font-mono uppercase tracking-widest text-muted-foreground">
                        <span>Glow / Bloom Intensity</span>
                        <span>{Math.round(t.glow * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={t.glow}
                        onChange={(e) => handleUpdateTemplate(t.id, "glow", parseFloat(e.target.value))}
                        className="w-full mt-1.5 h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-accent"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
              <button
                type="button"
                onClick={saveTemplates}
                disabled={savingTemplates}
                className="bg-accent text-accent-foreground px-5 py-2.5 rounded-md text-xs uppercase tracking-[0.25em] font-extrabold hover:bg-yellow-400 disabled:opacity-50 transition-colors shadow-md"
              >
                {savingTemplates ? "Updating Global Award Parameters…" : "Publish Global Badge Designs"}
              </button>
            </div>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-card/40 p-4 border border-border rounded-xl">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search catalog by title or artist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary/40 border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-accent placeholder-muted-foreground/60 text-lux-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-secondary/40 p-0.5 rounded-lg border border-border">
              {["All", "Single", "EP", "Album", "Mixtape"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFormatFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-wider transition-colors ${formatFilter === f ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {f}s
                </button>
              ))}
            </div>

            <div className="flex bg-secondary/40 p-0.5 rounded-lg border border-border">
              {["All", "Published", "Drafts", "Featured", "Pinned"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-wider transition-colors ${statusFilter === st ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Releases Grid list */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredReleases.map((r, index) => {
            const listIndex = releases.findIndex((orig) => orig.id === r.id);
            return (
              <div
                key={r.id}
                className={`glass rounded-xl border relative overflow-hidden transition-all duration-300 hover:border-white/15 flex flex-col justify-between ${
                  r.featured 
                    ? "border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)] bg-gradient-to-b from-card/90 to-red-950/10" 
                    : "border-border bg-card/60"
                }`}
              >
                {/* Format Badges */}
                <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1 max-w-[70%]">
                  <span className="bg-black/60 backdrop-blur-sm border border-white/10 text-white text-[8px] uppercase tracking-[0.2em] font-mono px-2 py-0.5 rounded shadow-sm">
                    {r.format}
                  </span>
                  {r.featured && (
                    <span className="bg-red-600/90 border border-red-500 text-white text-[8px] uppercase tracking-[0.2em] font-mono px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                      <Star className="h-2 w-2 fill-current" /> Featured
                    </span>
                  )}
                  {r.pinned && (
                    <span className="bg-blue-600/90 border border-blue-500 text-white text-[8px] uppercase tracking-[0.2em] font-mono px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                      <Pin className="h-2 w-2 fill-current" /> Pinned
                    </span>
                  )}
                </div>

                {/* Published state Indicator */}
                <div className="absolute top-3 right-3 z-10">
                  <span className={`text-[8px] uppercase tracking-[0.25em] font-mono px-2.5 py-0.5 rounded border ${
                    r.published 
                      ? "bg-green-500/10 border-green-500/30 text-green-400" 
                      : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                  }`}>
                    {r.published ? "Published" : "Draft"}
                  </span>
                </div>

                {/* Cover Art Wrapper */}
                <div className="aspect-square w-full bg-secondary/20 relative flex items-center justify-center border-b border-border">
                  {r.cover_url ? (
                    <img src={r.cover_url} alt={r.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]" />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground p-4 text-center">
                      <Music className="h-10 w-10 opacity-30" />
                      <span className="text-[9px] uppercase tracking-[0.3em]">No Cover Uploaded</span>
                    </div>
                  )}

                  {/* Certification Badges over Cover (Admin view) */}
                  <div className="absolute bottom-3 left-3 z-20 flex flex-col gap-1 pointer-events-none">
                    {r.verified_hit && (
                      <span className="bg-orange-600/90 border border-orange-500 text-white text-[7px] uppercase tracking-[0.2em] font-mono px-2 py-0.5 rounded shadow shadow-orange-950/20">
                        🔥 HIT RECORD
                      </span>
                    )}
                    {r.gold_record && (
                      <span className="bg-yellow-600/90 border border-yellow-500 text-white text-[7px] uppercase tracking-[0.2em] font-mono px-2 py-0.5 rounded shadow shadow-yellow-950/20">
                        🥇 GOLD CERTIFIED
                      </span>
                    )}
                    {r.platinum_record && (
                      <span className="bg-slate-600/90 border border-slate-500 text-white text-[7px] uppercase tracking-[0.2em] font-mono px-2 py-0.5 rounded shadow shadow-slate-950/20">
                        💿 PLATINUM CERTIFIED
                      </span>
                    )}
                  </div>
                </div>

                {/* Data section */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="mb-4">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground font-mono truncate">{r.artist || "Unknown Artist"}</p>
                    <h3 className="font-display text-2xl uppercase mt-1.5 text-lux-white leading-tight truncate" title={r.title}>
                      {r.title || "Untitled"}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-muted-foreground/80">
                      <span>{r.release_date || "No Date"}</span>
                      <span>•</span>
                      <span className="uppercase">{r.genre || "Genre unassigned"}</span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-[9px] font-mono bg-black/20 p-2 rounded border border-white/5">
                      {r.streams ? <span className="text-accent font-bold">🎧 {formatMetric(r.streams)}</span> : null}
                      {r.views ? <span className="text-white/80">▶ {formatMetric(r.views)}</span> : null}
                      {r.rating ? <span className="text-yellow-400">⭐ {r.rating}</span> : null}
                      {r.likes ? <span className="text-red-400">❤️ {formatMetric(r.likes)}</span> : null}
                      {!r.streams && !r.views && !r.rating && !r.likes && (
                        <span className="text-muted-foreground/50">No stats added yet</span>
                      )}
                    </div>
                  </div>

                  {/* Operational Controls & Quick Toggles */}
                  <div className="space-y-3.5 pt-3 border-t border-border/60">
                    <div className="flex items-center justify-between bg-black/35 rounded-lg border border-white/5 px-2 py-1.5">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/70">Sort Index // 0{listIndex + 1}</span>
                      <div className="flex gap-1">
                        <button
                          disabled={listIndex === 0 || busy}
                          onClick={() => handleMove(listIndex, "up")}
                          className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          title="Move Up"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          disabled={listIndex === releases.length - 1 || busy}
                          onClick={() => handleMove(listIndex, "down")}
                          className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          title="Move Down"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Inline Quick Certification Switches */}
                    <div className="flex items-center justify-between gap-1 text-[8px] font-mono uppercase tracking-widest text-muted-foreground">
                      <button
                        onClick={() => handleToggleCert(r.id, "verified_hit")}
                        className={`flex-1 text-center py-1 rounded transition-colors border ${
                          r.verified_hit 
                            ? "bg-orange-950/20 border-orange-500/20 text-orange-400 hover:bg-orange-950/40 font-bold" 
                            : "bg-secondary/40 border-border text-muted-foreground/60 hover:bg-secondary/70 hover:text-foreground"
                        }`}
                        title="Toggle Hit Record"
                      >
                        🔥 Hit
                      </button>
                      <button
                        onClick={() => handleToggleCert(r.id, "gold_record")}
                        className={`flex-1 text-center py-1 rounded transition-colors border ${
                          r.gold_record 
                            ? "bg-yellow-950/20 border-yellow-500/20 text-yellow-400 hover:bg-yellow-950/40 font-bold" 
                            : "bg-secondary/40 border-border text-muted-foreground/60 hover:bg-secondary/70 hover:text-foreground"
                        }`}
                        title="Toggle Gold Certified"
                      >
                        🥇 Gold
                      </button>
                      <button
                        onClick={() => handleToggleCert(r.id, "platinum_record")}
                        className={`flex-1 text-center py-1 rounded transition-colors border ${
                          r.platinum_record 
                            ? "bg-slate-950/20 border-slate-500/20 text-slate-400 hover:bg-slate-950/40 font-bold" 
                            : "bg-secondary/40 border-border text-muted-foreground/60 hover:bg-secondary/70 hover:text-foreground"
                        }`}
                        title="Toggle Platinum Certified"
                      >
                        💿 Plat
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-1 text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                      <button
                        onClick={() => handleTogglePublish(r.id)}
                        className={`flex-1 text-center py-1 rounded transition-colors border ${
                          r.published 
                            ? "bg-green-950/20 border-green-500/20 text-green-400 hover:bg-green-950/40" 
                            : "bg-secondary/40 border-border text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                        }`}
                      >
                        {r.published ? "Published" : "Draft"}
                      </button>
                      <button
                        onClick={() => handleToggleFeatured(r.id)}
                        className={`flex-1 text-center py-1 rounded transition-colors border ${
                          r.featured 
                            ? "bg-red-950/20 border-red-500/20 text-red-400 hover:bg-red-950/40 font-bold" 
                            : "bg-secondary/40 border-border text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                        }`}
                      >
                        Featured
                      </button>
                      <button
                        onClick={() => handleTogglePinned(r.id)}
                        className={`flex-1 text-center py-1 rounded transition-colors border ${
                          r.pinned 
                            ? "bg-blue-950/20 border-blue-500/20 text-blue-400 hover:bg-blue-950/40" 
                            : "bg-secondary/40 border-border text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                        }`}
                      >
                        Pinned
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditing(r)}
                        className="flex-1 inline-flex items-center justify-center gap-2 text-[10px] uppercase font-bold tracking-[0.25em] bg-secondary hover:bg-accent hover:text-accent-foreground py-2 rounded transition-colors"
                      >
                        <Pencil className="h-3 w-3" /> Edit Profile
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="inline-flex items-center justify-center px-3 text-destructive border border-transparent hover:border-destructive/20 hover:bg-destructive/10 py-2 rounded transition-colors"
                        title="Delete Release"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredReleases.length === 0 && (
            <div className="col-span-full bg-card/25 border border-dashed border-border/80 rounded-2xl flex flex-col items-center justify-center p-12 text-center">
              <Music className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-sm uppercase tracking-widest font-mono">No releases match the current query criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFormatFilter("All");
                  setStatusFilter("All");
                }}
                className="mt-4 text-xs text-accent underline uppercase tracking-widest"
              >
                Clear Filter Settings
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit/Add Modal Panel overlay */}
      {editing && (
        <ReleaseForm
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={async (savedRelease) => {
            let updatedList = [];
            const exists = releases.some((r) => r.id === savedRelease.id);
            if (exists) {
              updatedList = releases.map((r) => (r.id === savedRelease.id ? savedRelease : r));
            } else {
              const nextSort = releases.length > 0 ? Math.max(...releases.map((r) => r.sort_order)) + 1 : 0;
              updatedList = [...releases, { ...savedRelease, sort_order: nextSort }];
            }
            await saveAll(updatedList);
            setEditing(null);
          }}
        />
      )}
    </AdminShell>
  );
}

function ReleaseForm({
  initial,
  onClose,
  onSave,
}: {
  initial: Release;
  onClose: () => void;
  onSave: (r: Release) => Promise<void>;
}) {
  const [r, setR] = useState<Release>(initial);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const set = <K extends keyof Release>(k: K, v: Release[K]) => setR((s) => ({ ...s, [k]: v }));

  const handleUpload = async (file: File) => {
    setUploading(true);
    setErr(null);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `releases/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file, { cacheControl: "31536000", upsert: false });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
      set("cover_url", publicUrl);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Media upload transaction failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveCover = () => {
    set("cover_url", "");
  };

  const parseStat = (val: string): number | null => {
    if (val.trim() === "") return null;
    const parsed = parseFloat(val);
    return isNaN(parsed) || parsed < 0 ? null : parsed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!r.title.trim()) {
      setErr("Title field is required.");
      return;
    }
    if (!r.artist.trim()) {
      setErr("Artist field is required.");
      return;
    }

    if (r.rating !== undefined && r.rating !== null && (r.rating < 0 || r.rating > 5)) {
      setErr("Rating score must be a number between 0 and 5.");
      return;
    }

    setBusy(true);
    setErr(null);
    try {
      const cleaned: Release = {
        ...r,
        title: r.title.trim(),
        artist: r.artist.trim(),
        genre: r.genre.trim(),
        description: r.description.trim(),
        spotify_url: r.spotify_url.trim(),
        apple_url: r.apple_url.trim(),
        youtube_url: r.youtube_url.trim(),
        soundcloud_url: r.soundcloud_url.trim(),
        website_url: r.website_url.trim(),
        views: r.views === undefined ? null : r.views,
        streams: r.streams === undefined ? null : r.streams,
        rating: r.rating === undefined ? null : r.rating,
        likes: r.likes === undefined ? null : r.likes,
        favorites: r.favorites === undefined ? null : r.favorites,
        shares: r.shares === undefined ? null : r.shares,
        listeners: r.listeners === undefined ? null : r.listeners,
        downloads: r.downloads === undefined ? null : r.downloads,
        verified_hit: !!r.verified_hit,
        gold_record: !!r.gold_record,
        platinum_record: !!r.platinum_record,
      };
      await onSave(cleaned);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upsert transaction rejected by server");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl w-full max-w-3xl p-6 md:p-8 my-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
        
        {/* Header Title */}
        <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
          <div>
            <h2 className="font-display text-3xl uppercase text-lux-white flex items-center gap-2">
              <Music className="h-6 w-6 text-accent" /> {initial.title ? "Edit Catalog Release" : "Add Release to Database"}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Specify release metadata, cover art assets, platform stats, certifications, and streaming links.</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent border-b border-white/5 pb-1">01 // Metadata Dossier</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Song / Release Title *">
                <input required value={r.title} onChange={(e) => set("title", e.target.value)} className={inputCls} placeholder="e.g. Neon Saint" />
              </Field>
              <Field label="Artist / Performer Name *">
                <input required value={r.artist} onChange={(e) => set("artist", e.target.value)} className={inputCls} placeholder="e.g. Gold Chain" />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Release Date">
                  <input type="date" value={r.release_date} onChange={(e) => set("release_date", e.target.value)} className={inputCls} />
                </Field>
                <Field label="Format Option">
                  <select value={r.format} onChange={(e) => set("format", e.target.value as Release["format"])} className={inputCls}>
                    <option value="Single">Single</option>
                    <option value="EP">EP (Extended Play)</option>
                    <option value="Album">Album</option>
                    <option value="Mixtape">Mixtape</option>
                  </select>
                </Field>
              </div>
              <Field label="Primary Genre">
                <input value={r.genre} onChange={(e) => set("genre", e.target.value)} className={inputCls} placeholder="e.g. Hip Hop / Trap" />
              </Field>
            </div>
            <Field label="Dossier Description (Press Copy)">
              <textarea rows={2} value={r.description} onChange={(e) => set("description", e.target.value)} className={inputCls} placeholder="Press notes, credit rolls, or creative lore details..." />
            </Field>
          </div>

          {/* Section 2: Music Stats / Engagement */}
          <div className="space-y-4 bg-secondary/10 p-5 rounded-xl border border-white/5">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent border-b border-white/5 pb-1 flex items-center gap-2">
              <BarChart2 className="h-3.5 w-3.5" /> 02 // Music Intelligence & Engagement Metrics
            </h3>
            <p className="text-[10px] text-muted-foreground/80 leading-normal mb-3">
              Manually configure stats and streams metrics. If a field is left blank, it will automatically be hidden on the frontend card.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Field label="Streams (Total)">
                <input
                  type="number"
                  min="0"
                  value={r.streams === null || r.streams === undefined ? "" : r.streams}
                  onChange={(e) => set("streams", parseStat(e.target.value))}
                  className={inputCls}
                  placeholder="e.g. 12000000"
                />
              </Field>
              <Field label="Views (Video/Audio)">
                <input
                  type="number"
                  min="0"
                  value={r.views === null || r.views === undefined ? "" : r.views}
                  onChange={(e) => set("views", parseStat(e.target.value))}
                  className={inputCls}
                  placeholder="e.g. 5200000"
                />
              </Field>
              <Field label="Rating (0.0 - 5.0)">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={r.rating === null || r.rating === undefined ? "" : r.rating}
                  onChange={(e) => set("rating", parseStat(e.target.value))}
                  className={inputCls}
                  placeholder="e.g. 4.9"
                />
              </Field>
              <Field label="Likes (Favorites/Saves)">
                <input
                  type="number"
                  min="0"
                  value={r.likes === null || r.likes === undefined ? "" : r.likes}
                  onChange={(e) => set("likes", parseStat(e.target.value))}
                  className={inputCls}
                  placeholder="e.g. 450000"
                />
              </Field>
              <Field label="Favorites (Bookmarks)">
                <input
                  type="number"
                  min="0"
                  value={r.favorites === null || r.favorites === undefined ? "" : r.favorites}
                  onChange={(e) => set("favorites", parseStat(e.target.value))}
                  className={inputCls}
                  placeholder="e.g. 125000"
                />
              </Field>
              <Field label="Shares (Viral Hooks)">
                <input
                  type="number"
                  min="0"
                  value={r.shares === null || r.shares === undefined ? "" : r.shares}
                  onChange={(e) => set("shares", parseStat(e.target.value))}
                  className={inputCls}
                  placeholder="e.g. 98000"
                />
              </Field>
              <Field label="Monthly Listeners">
                <input
                  type="number"
                  min="0"
                  value={r.listeners === null || r.listeners === undefined ? "" : r.listeners}
                  onChange={(e) => set("listeners", parseStat(e.target.value))}
                  className={inputCls}
                  placeholder="e.g. 6800000"
                />
              </Field>
              <Field label="Downloads (HQ Wave)">
                <input
                  type="number"
                  min="0"
                  value={r.downloads === null || r.downloads === undefined ? "" : r.downloads}
                  onChange={(e) => set("downloads", parseStat(e.target.value))}
                  className={inputCls}
                  placeholder="e.g. 24000"
                />
              </Field>
            </div>
          </div>

          {/* Section 3: Certifications & Awards */}
          <div className="space-y-4 bg-secondary/5 p-5 rounded-xl border border-white/5">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent border-b border-white/5 pb-1 flex items-center gap-2">
              <Award className="h-3.5 w-3.5" /> 03 // Industry Awards & Certifications
            </h3>
            <p className="text-[10px] text-muted-foreground/80 leading-normal mb-3">
              Configure RIAA-tier award flags. Active toggles will instantly stamp high-end dynamic metallic badges onto the frontend layouts.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex items-center gap-3 cursor-pointer select-none bg-orange-950/10 border border-orange-500/10 p-3 rounded-lg hover:border-orange-500/30 transition-colors">
                <input
                  type="checkbox"
                  checked={!!r.verified_hit}
                  onChange={(e) => set("verified_hit", e.target.checked)}
                  className="rounded border-orange-500/30 bg-secondary text-orange-500 focus:ring-orange-500 focus:ring-offset-background h-4.5 w-4.5"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-400">🔥 Verified Hit</span>
                  <span className="text-[9px] text-muted-foreground/75 font-mono mt-0.5">Attach custom HIT RECORD badge</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none bg-yellow-950/10 border border-yellow-500/10 p-3 rounded-lg hover:border-yellow-500/30 transition-colors">
                <input
                  type="checkbox"
                  checked={!!r.gold_record}
                  onChange={(e) => set("gold_record", e.target.checked)}
                  className="rounded border-yellow-500/30 bg-secondary text-yellow-500 focus:ring-yellow-500 focus:ring-offset-background h-4.5 w-4.5"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider text-yellow-400">🥇 Gold Record</span>
                  <span className="text-[9px] text-muted-foreground/75 font-mono mt-0.5">Attach custom GOLD CERTIFIED badge</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none bg-slate-900/40 border border-slate-500/10 p-3 rounded-lg hover:border-slate-500/30 transition-colors">
                <input
                  type="checkbox"
                  checked={!!r.platinum_record}
                  onChange={(e) => set("platinum_record", e.target.checked)}
                  className="rounded border-slate-500/30 bg-secondary text-slate-400 focus:ring-slate-500 focus:ring-offset-background h-4.5 w-4.5"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">💿 Platinum Record</span>
                  <span className="text-[9px] text-muted-foreground/75 font-mono mt-0.5">Attach custom PLATINUM CERTIFIED</span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 4: Visual Assets */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent border-b border-white/5 pb-1">04 // HD Visual Media</h3>
            <Field label="Cover Art Thumbnail (Square 1:1 Recommended)">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-1 bg-secondary/20 p-4 border border-border/80 rounded-lg">
                {r.cover_url ? (
                  <div className="relative group/cover shrink-0">
                    <img src={r.cover_url} alt="Cover Preview" className="h-24 w-24 object-cover rounded border border-border shadow" />
                    <button
                      type="button"
                      onClick={handleRemoveCover}
                      className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full h-5 w-5 flex items-center justify-center text-[9px] font-bold shadow-md"
                      title="Clear Cover Art"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="h-24 w-24 bg-black/40 rounded border border-dashed border-border flex flex-col items-center justify-center text-[8px] font-mono uppercase text-muted-foreground shrink-0 select-none">
                    <Music className="h-6 w-6 opacity-30 mb-1" />
                    No Image
                  </div>
                )}
                <div className="flex flex-col gap-2 flex-1">
                  <p className="text-[10px] text-muted-foreground/80 leading-normal">
                    Upload a high-fidelity JPG, WebP, or PNG file. Image is automatically stored and optimized inside the Supabase Storage CDN.
                  </p>
                  <label className="inline-flex items-center justify-center gap-2 cursor-pointer bg-secondary hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded text-xs uppercase tracking-[0.2em] transition-colors self-start font-bold">
                    <Upload className="h-3.5 w-3.5" /> {uploading ? "Uploading CDN Asset…" : "Upload Cover Art"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                  </label>
                </div>
              </div>
              <input value={r.cover_url} onChange={(e) => set("cover_url", e.target.value)} className={`${inputCls} mt-2`} placeholder="or paste absolute remote Cover Art URL" />
            </Field>
          </div>

          {/* Section 5: Platform Streaming Links */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent border-b border-white/5 pb-1">05 // Streaming Portal Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Spotify URL">
                <input type="url" value={r.spotify_url} onChange={(e) => set("spotify_url", e.target.value)} className={inputCls} placeholder="https://open.spotify.com/album/..." />
              </Field>
              <Field label="Apple Music URL">
                <input type="url" value={r.apple_url} onChange={(e) => set("apple_url", e.target.value)} className={inputCls} placeholder="https://music.apple.com/us/album/..." />
              </Field>
              <Field label="YouTube Video / Audio URL">
                <input type="url" value={r.youtube_url} onChange={(e) => set("youtube_url", e.target.value)} className={inputCls} placeholder="https://youtube.com/watch?v=..." />
              </Field>
              <Field label="SoundCloud URL">
                <input type="url" value={r.soundcloud_url} onChange={(e) => set("soundcloud_url", e.target.value)} className={inputCls} placeholder="https://soundcloud.com/1017records/..." />
              </Field>
              <Field label="Alternative Website Landing Link">
                <input type="url" value={r.website_url} onChange={(e) => set("website_url", e.target.value)} className={inputCls} placeholder="https://example.com/..." />
              </Field>
            </div>
          </div>

          {/* Section 6: Settings Toggles */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent border-b border-white/5 pb-1">06 // Configuration & Visibility</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-secondary/15 p-4 rounded-xl border border-white/5">
              
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={r.published}
                  onChange={(e) => set("published", e.target.checked)}
                  className="rounded border-border bg-secondary text-accent focus:ring-accent focus:ring-offset-background h-4.5 w-4.5"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider text-lux-white">Published</span>
                  <span className="text-[9px] text-muted-foreground/80 font-mono mt-0.5">Visible in homepage grid</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={r.featured}
                  onChange={(e) => set("featured", e.target.checked)}
                  className="rounded border-border bg-secondary text-accent focus:ring-accent focus:ring-offset-background h-4.5 w-4.5"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider text-lux-white">Featured Release</span>
                  <span className="text-[9px] text-muted-foreground/80 font-mono mt-0.5">Double-width glowing card</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={r.pinned}
                  onChange={(e) => set("pinned", e.target.checked)}
                  className="rounded border-border bg-secondary text-accent focus:ring-accent focus:ring-offset-background h-4.5 w-4.5"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider text-lux-white">Pinned to Top</span>
                  <span className="text-[9px] text-muted-foreground/80 font-mono mt-0.5">Anchored ahead of grid catalog</span>
                </div>
              </label>

            </div>
          </div>
        </div>

        {/* Error message */}
        {err && <p className="mt-5 text-xs text-red-500 bg-red-600/10 border border-red-500/25 px-4 py-2 rounded font-mono">{err}</p>}

        {/* Modal Buttons */}
        <div className="mt-8 flex gap-4 justify-end border-t border-border pt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || uploading}
            className="bg-accent text-accent-foreground px-6 py-3 rounded-md text-xs uppercase tracking-[0.3em] font-extrabold hover:bg-yellow-400 disabled:opacity-50 shadow-md transition-colors"
          >
            {busy ? "Syncing Catalog Data…" : "Save Release Record"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "w-full bg-secondary/50 border border-border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-accent text-lux-white placeholder-muted-foreground/50 transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
