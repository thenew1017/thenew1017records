import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { getPublicSettings, slugify } from "@/lib/cms.functions";
import { ExternalLink } from "lucide-react";
import { PremiumImage } from "@/components/ui/PremiumImage";
import { SocialLinksRow } from "@/components/ui/SocialLinks";

type BadgeTemplate = {
  id: "verified_hit" | "gold_record" | "platinum_record";
  title: string;
  icon: string;
  theme: "red" | "gold" | "platinum" | "purple" | "cyan";
  glow: number; // 0.1 to 1.0
  order: number;
  visible: boolean;
};

const DEFAULT_TEMPLATES: BadgeTemplate[] = [
  { id: "verified_hit", title: "HIT RECORD", icon: "🔥", theme: "red", glow: 0.6, order: 0, visible: true },
  { id: "gold_record", title: "GOLD CERTIFIED", icon: "🥇", theme: "gold", glow: 0.8, order: 1, visible: true },
  { id: "platinum_record", title: "PLATINUM CERTIFIED", icon: "💿", theme: "platinum", glow: 1.0, order: 2, visible: true },
];

const SVGIcons = {
  streams: (className = "h-5 w-5") => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="7.5" strokeDasharray="2 2" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="2.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 3-9 6h2" />
    </svg>
  ),
  views: (className = "h-5 w-5") => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v3m4-6v9m4-13v17m4-11v5m4-7v9" />
    </svg>
  ),
  rating: (className = "h-5 w-5") => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6a6 6 0 0 1 6 6m-12 0a6 6 0 0 1 6-6m6 12a6 6 0 0 1-6 6m0-12a6 6 0 0 1 6 6" strokeDasharray="3 2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a10 10 0 0 1 10 10m-20 0A10 10 0 0 1 12 2m10 10a10 10 0 0 1-10 10m0-20a10 10 0 0 1 10 10" />
    </svg>
  ),
  likes: (className = "h-5 w-5") => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M2 12h20" />
      <circle cx="12" cy="12" r="6" strokeDasharray="2 2" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  ),
  shares: (className = "h-5 w-5") => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m13 5 7 7-7 7M4 12h16M9 7l5 5-5 5" />
    </svg>
  ),
  listeners: (className = "h-5 w-5") => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9z" />
    </svg>
  ),
  downloads: (className = "h-5 w-5") => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v16H4zM4 9h16M4 14h16M9 4v16" />
    </svg>
  ),
  favorites: (className = "h-5 w-5") => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v4M12 17v4M3 12h4M17 12h4" />
    </svg>
  )
};

const getBadgeIcon = (theme: "red" | "gold" | "platinum" | "purple" | "cyan", className = "h-3.5 w-3.5") => {
  switch (theme) {
    case "red":
      // Premium verified badge icon (solid circle with check)
      return (
        <svg className={`${className} text-red-500`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      );
    case "gold":
      // Minimalist, premium thin concentric gold record ring
      return (
        <svg className={`${className} text-[#d4af37]`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3.5" strokeWidth={1.5} />
        </svg>
      );
    case "platinum":
      // Minimalist, premium thin concentric platinum ring
      return (
        <svg className={`${className} text-slate-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3.5" strokeWidth={1.5} />
        </svg>
      );
    case "purple":
      return (
        <svg className={`${className} text-purple-500`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
        </svg>
      );
    case "cyan":
      return (
        <svg className={`${className} text-cyan-500`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      );
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
};

type ReleaseSetting = {
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
  // Dynamic Certifications
  verified_hit?: boolean;
  gold_record?: boolean;
  platinum_record?: boolean;
};

const FALLBACK_RELEASES: ReleaseSetting[] = [
  {
    id: "fallback-1",
    title: "Golden Hour",
    artist: "Shadow Era",
    release_date: "2026-01-01",
    cover_url: "",
    format: "Single",
    genre: "Hip Hop",
    description: "The flagship single defining the cinematic transition of Shadow Era. A luxurious blend of high-end bass vectors and street poetry.",
    spotify_url: "#",
    apple_url: "",
    youtube_url: "",
    soundcloud_url: "",
    website_url: "",
    sort_order: 0,
    published: true,
    featured: false,
    pinned: false,
    views: 5200000,
    streams: 12000000,
    rating: 4.9,
    likes: 450000,
    favorites: 125000,
    shares: 98000,
    listeners: 6800000,
    downloads: 24000,
    verified_hit: true,
    gold_record: true,
  },
  {
    id: "fallback-2",
    title: "Run It Back",
    artist: "Gold Chain",
    release_date: "2026-02-01",
    cover_url: "",
    format: "Single",
    genre: "Trap",
    description: "Gold Chain returns with a high-energy trap anthem that merges heavy sub-bass structures with crystal clean modular synthesis.",
    spotify_url: "#",
    apple_url: "",
    youtube_url: "",
    soundcloud_url: "",
    website_url: "",
    sort_order: 1,
    published: true,
    featured: false,
    pinned: false,
    views: 3100000,
    streams: 8500000,
    rating: 4.8,
    likes: 320000,
    verified_hit: true,
  },
  {
    id: "fallback-3",
    title: "Neon Saint EP",
    artist: "Neon Saint",
    release_date: "2025-11-01",
    cover_url: "",
    format: "EP",
    genre: "Electronic",
    description: "A futuristic voyage into the cyberpunk districts of Atlanta. Neon Saint layers vintage analogue warmth under driving industrial grooves.",
    spotify_url: "#",
    apple_url: "",
    youtube_url: "",
    soundcloud_url: "",
    website_url: "",
    sort_order: 2,
    published: true,
    featured: false,
    pinned: false,
    views: 1800000,
    streams: 4200000,
    rating: 4.7,
    likes: 195000,
    platinum_record: true,
  },
  {
    id: "fallback-4",
    title: "City Lights",
    artist: "Amber Glow",
    release_date: "2025-08-01",
    cover_url: "",
    format: "Mixtape",
    genre: "R&B",
    description: "Late night reflections and smooth ambient melodies. Amber Glow curates an elegant soundtrack for nocturnal city drives.",
    spotify_url: "#",
    apple_url: "",
    youtube_url: "",
    soundcloud_url: "",
    website_url: "",
    sort_order: 3,
    published: true,
    featured: false,
    pinned: false,
    views: 950000,
    streams: 2400000,
    rating: 4.6,
    likes: 110000,
    gold_record: true,
  },
];

const METRIC_THEMES = {
  streams: {
    bg: "bg-[#050505]",
    border: "border-white/[0.04] hover:border-[#E5D5C0]/30 hover:shadow-[0_0_30px_rgba(229,213,192,0.06)]",
    text: "text-[#E5D5C0]",
    label: "GLOBAL REACH"
  },
  views: {
    bg: "bg-[#050505]",
    border: "border-white/[0.04] hover:border-[#E5D5C0]/30 hover:shadow-[0_0_30px_rgba(229,213,192,0.06)]",
    text: "text-[#E5D5C0]",
    label: "ARTIST INFLUENCE"
  },
  rating: {
    bg: "bg-[#050505]",
    border: "border-white/[0.04] hover:border-[#E5D5C0]/30 hover:shadow-[0_0_30px_rgba(229,213,192,0.06)]",
    text: "text-[#E5D5C0]",
    label: "EXECUTIVE RECOGNITION"
  },
  likes: {
    bg: "bg-[#050505]",
    border: "border-white/[0.04] hover:border-[#E5D5C0]/30 hover:shadow-[0_0_30px_rgba(229,213,192,0.06)]",
    text: "text-[#E5D5C0]",
    label: "CULTURAL IMPACT"
  },
  favorites: {
    bg: "bg-[#050505]",
    border: "border-white/[0.04] hover:border-[#E5D5C0]/30 hover:shadow-[0_0_30px_rgba(229,213,192,0.06)]",
    text: "text-[#E5D5C0]",
    label: "AUDIENCE RETENTION"
  },
  shares: {
    bg: "bg-[#050505]",
    border: "border-white/[0.04] hover:border-[#E5D5C0]/30 hover:shadow-[0_0_30px_rgba(229,213,192,0.06)]",
    text: "text-[#E5D5C0]",
    label: "INDUSTRY MOMENTUM"
  },
  listeners: {
    bg: "bg-[#050505]",
    border: "border-white/[0.04] hover:border-[#E5D5C0]/30 hover:shadow-[0_0_30px_rgba(229,213,192,0.06)]",
    text: "text-[#E5D5C0]",
    label: "NETWORK EXPANSION"
  },
  downloads: {
    bg: "bg-[#050505]",
    border: "border-white/[0.04] hover:border-[#E5D5C0]/30 hover:shadow-[0_0_30px_rgba(229,213,192,0.06)]",
    text: "text-[#E5D5C0]",
    label: "CATALOG GROWTH"
  }
};

export function Releases({ settings }: { settings?: Record<string, any> }) {
  const { data } = useQuery({
    queryKey: ["public-settings"],
    queryFn: () => getPublicSettings(),
    initialData: settings ? { settings } : undefined,
    staleTime: 30_000,
  });

  const parsedReleases = (data?.settings?.releases as ReleaseSetting[] | undefined) ?? [];
  const badgeTemplates = (data?.settings?.releases_badge_templates as BadgeTemplate[] | undefined) ?? DEFAULT_TEMPLATES;
  const publishedReleases = parsedReleases.filter((r) => r.published);

  const displayList = publishedReleases.length > 0 ? publishedReleases : FALLBACK_RELEASES;

  const sortedReleases = [...displayList].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
  });

  // Dynamic premium luxury matte certification chips with brushed metal accent indicators
  const getThemeClasses = (theme: BadgeTemplate["theme"]) => {
    switch (theme) {
      case "red":
        // Matte black background, white typography, minimal red accent line
        return "bg-[#090a0c] border border-zinc-800/80 border-l-[3px] border-l-red-500 text-white font-sans font-bold uppercase tracking-[0.08em] shadow-md relative overflow-hidden";
      case "gold":
        // Matte charcoal background, brushed gold accent detail, no yellow glow
        return "bg-[#0f1013] border border-zinc-800/80 border-l-[3px] border-l-[#d4af37] text-[#d4af37] font-sans font-bold uppercase tracking-[0.08em] shadow-md relative overflow-hidden";
      case "platinum":
        // Matte graphite background, brushed platinum accent, slate text
        return "bg-[#14161a] border border-zinc-800/80 border-l-[3px] border-l-slate-400 text-slate-200 font-sans font-bold uppercase tracking-[0.08em] shadow-md relative overflow-hidden";
      case "purple":
        return "bg-[#090a0c] border border-zinc-800/80 border-l-[3px] border-l-purple-500 text-white font-sans font-bold uppercase tracking-[0.08em] shadow-md relative overflow-hidden";
      case "cyan":
        return "bg-[#090a0c] border border-zinc-800/80 border-l-[3px] border-l-cyan-500 text-white font-sans font-bold uppercase tracking-[0.08em] shadow-md relative overflow-hidden";
      default:
        return "bg-[#090a0c] border border-zinc-800 text-white font-sans";
    }
  };

  // Subtle luxury sub-pixel highlights and clean shadows, no cheap neon blooms
  const getThemeShadow = (theme: BadgeTemplate["theme"], glowVal: number) => {
    return "0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0px rgba(255, 255, 255, 0.04)";
  };

  // Numbers Formatting Utility: 1.2K, 1.2M, 1.2B
  const formatMetric = (num: number | undefined | null): string => {
    if (num === undefined || num === null || isNaN(num) || num <= 0) return "";
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  };

  const analyticsStyle = (data?.settings?.analytics_display_style as string | undefined) ?? "Premium";

  const renderFeaturedStats = (release: ReleaseSetting, hasStats: boolean) => {
    if (!hasStats) return null;

    const statsList = [
      { key: "streams" as const, val: release.streams },
      { key: "views" as const, val: release.views },
      { key: "rating" as const, val: release.rating },
      { key: "likes" as const, val: release.likes },
      { key: "favorites" as const, val: release.favorites },
      { key: "shares" as const, val: release.shares },
      { key: "listeners" as const, val: release.listeners },
      { key: "downloads" as const, val: release.downloads },
    ].filter(s => s.val !== undefined && s.val !== null && s.val > 0);

    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-6 my-6 w-full max-w-4xl">
        {statsList.map(s => {
          const theme = METRIC_THEMES[s.key as keyof typeof METRIC_THEMES] || METRIC_THEMES.streams;
          const displayVal = s.key === "rating" ? s.val : formatMetric(s.val as number);
          return (
            <div 
              key={s.key} 
              className="flex flex-col justify-start text-left pt-1 w-full select-none"
            >
              <span 
                className="font-sans font-extrabold text-2xl md:text-3xl text-white leading-none tracking-tight"
                style={{
                  fontFamily: "Inter, 'SF Pro Display', Geist, sans-serif"
                }}
              >
                {displayVal}
              </span>
              <span 
                className="block text-[9px] font-mono tracking-[0.2em] text-[#E5D5C0] uppercase font-bold mt-1.5 leading-none"
                style={{
                  fontFamily: "Inter, 'SF Pro Display', Geist, sans-serif"
                }}
              >
                {theme.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderStandardStats = (release: ReleaseSetting, hasStats: boolean) => {
    if (!hasStats) return null;

    const statsList = [
      { key: "streams" as const, val: release.streams },
      { key: "views" as const, val: release.views },
      { key: "rating" as const, val: release.rating },
    ].filter(s => s.val !== undefined && s.val !== null && s.val > 0);

    return (
      <div className="grid grid-cols-3 gap-x-4 w-full mt-4">
        {statsList.slice(0, 3).map(s => {
          const theme = METRIC_THEMES[s.key as keyof typeof METRIC_THEMES] || METRIC_THEMES.streams;
          const displayVal = s.key === "rating" ? s.val : formatMetric(s.val as number);
          return (
            <div 
              key={s.key} 
              className="flex flex-col justify-start text-left pt-1 w-full select-none"
            >
              <span 
                className="font-sans font-extrabold text-base md:text-lg text-white leading-none tracking-tight"
                style={{
                  fontFamily: "Inter, 'SF Pro Display', Geist, sans-serif"
                }}
              >
                {displayVal}
              </span>
              <span 
                className="block text-[8px] font-mono tracking-[0.15em] text-[#E5D5C0] uppercase font-bold mt-1.5 leading-none"
                style={{
                  fontFamily: "Inter, 'SF Pro Display', Geist, sans-serif"
                }}
              >
                {theme.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <section id="releases" className="relative border-t border-white/5 bg-[#000000] px-6 py-32 md:px-10 cyber-grid-dots">
      <div className="pointer-events-none absolute left-1/4 bottom-0 -z-10 h-[50vmin] w-[50vmin] glow-red opacity-10" />

      <div className="mx-auto max-w-[1600px] relative">
        
        {/* Section Header */}
        <div className="mb-20 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 border border-white/5 bg-white/5 px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-[0.35em] text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_var(--color-accent)]" />
              CATALOG PORTAL // DYNAMIC BROADCAST
            </div>
            <h2 className="font-display text-5xl uppercase leading-[0.9] md:text-7xl lg:text-8xl">
              Latest <br /> <span className="text-gradient-gold">Releases</span>
            </h2>
          </div>
          <a
            href="#releases"
            className="group inline-flex items-center gap-3 border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground transition-all hover:border-accent hover:text-accent rounded-sm"
          >
            Digital Catalog 
            <span className="inline-block transition-transform group-hover:translate-x-1.5">→</span>
          </a>
        </div>

        {/* Database Interactive Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {sortedReleases.map((r, i) => {
            const primaryLink = r.spotify_url || r.apple_url || r.youtube_url || r.soundcloud_url || r.website_url || "#";
            const yearStr = r.release_date ? new Date(r.release_date).getFullYear().toString() : "2026";

            // Resolve dynamic badges enabled for this specific release
            const activeBadges = [
              r.verified_hit && badgeTemplates.find((t) => t.id === "verified_hit"),
              r.gold_record && badgeTemplates.find((t) => t.id === "gold_record"),
              r.platinum_record && badgeTemplates.find((t) => t.id === "platinum_record"),
            ]
              .filter((b): b is BadgeTemplate => !!b && b.visible)
              .sort((a, b) => a.order - b.order);

            const hasStats =
              (r.views !== undefined && r.views !== null && r.views > 0) ||
              (r.streams !== undefined && r.streams !== null && r.streams > 0) ||
              (r.rating !== undefined && r.rating !== null && r.rating > 0) ||
              (r.likes !== undefined && r.likes !== null && r.likes > 0) ||
              (r.favorites !== undefined && r.favorites !== null && r.favorites > 0) ||
              (r.shares !== undefined && r.shares !== null && r.shares > 0) ||
              (r.listeners !== undefined && r.listeners !== null && r.listeners > 0) ||
              (r.downloads !== undefined && r.downloads !== null && r.downloads > 0);

            // SPECIAL RENDER CASE: FEATURED RELEASE (Double-width split-panel)
            if (r.featured) {
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  className="col-span-1 sm:col-span-2 lg:col-span-4 group relative bg-transparent py-8 flex flex-col md:flex-row items-stretch gap-6 md:gap-10 border-b border-white/5 transition-all duration-700 overflow-hidden"
                >
                  {/* Left Column: Cover Artwork (Primary Focus) */}
                  <div className="w-full md:w-[38%] aspect-square shrink-0 rounded-none overflow-hidden border border-white/5 relative transition-all duration-700">
                    {r.cover_url ? (
                      <PremiumImage
                        src={r.cover_url}
                        alt={r.title}
                        aspectRatioClass="aspect-square"
                        loading="lazy"
                        className="transition-transform duration-[1000ms] ease-out group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0c0d10] to-[#040405] flex flex-col items-center justify-center p-6 border border-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E5D5C0]/[0.03] to-transparent -translate-x-full animate-shimmer" />
                        <svg className="w-12 h-12 text-zinc-700 animate-spin animate-vinyl-spin" style={{ animationDuration: '6s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
                          <circle cx="12" cy="12" r="10" />
                          <circle cx="12" cy="12" r="7.5" strokeDasharray="2 2" />
                          <circle cx="12" cy="12" r="4" />
                          <circle cx="12" cy="12" r="1.5" />
                        </svg>
                        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#E5D5C0]/50 mt-4 leading-none select-none">1017 SIGNATURE DISK</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-85 z-20" />

                    {/* Integrated Certification Badges inside Cover Frame */}
                    {activeBadges.length > 0 && (
                      <div className="absolute bottom-4 left-4 z-30 flex flex-wrap gap-2 pointer-events-auto">
                        {activeBadges.map((badge) => (
                          <div
                            key={badge.id}
                            className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-none text-xs md:text-[13px] tracking-[0.06em] transition-all duration-300 border border-zinc-800/80 border-l-[3.5px] ${
                              badge.theme === "red" 
                                ? "bg-[#090a0c]/95 border-l-red-500 text-white" 
                                : badge.theme === "gold" 
                                ? "bg-[#0f1013]/95 border-l-[#d4af37] text-[#d4af37]" 
                                : "bg-[#14161a]/95 border-l-slate-400 text-slate-200"
                            }`}
                            style={{
                              boxShadow: "0 8px 16px rgba(0,0,0,0.6), inset 0 1px 0px rgba(255,255,255,0.04)"
                            }}
                          >
                            <span className="shrink-0">{getBadgeIcon(badge.theme, "h-4.5 w-4.5")}</span>
                            <span className="leading-none">{badge.title}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Apple/Netflix-style Listen Hover Overlay */}
                    <Link
                      to="/release/$name"
                      params={{ name: slugify(r.title) }}
                      className="absolute inset-0 flex items-center justify-center z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50"
                    >
                      <span className="bg-white text-black flex h-16 w-16 items-center justify-center rounded-full shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><path d="M8 5v14l11-7z" /></svg>
                      </span>
                    </Link>
                  </div>

                  {/* Right Column: Info & Stats */}
                  <div className="flex-1 flex flex-col justify-between py-2 relative z-10 text-left">
                    <div className="mt-4 md:mt-0 space-y-4">
                      <div className="flex items-center gap-3 font-mono text-[9px] text-muted-foreground uppercase tracking-[0.25em]">
                        <span className="border border-white/10 px-2 py-0.5 bg-white/5 rounded-md font-bold text-accent">FEATURED</span>
                        <span>FORMAT: {r.format}</span>
                        <span>•</span>
                        <span>YEAR: {yearStr}</span>
                        {r.genre && (
                          <>
                            <span>•</span>
                            <span className="text-accent">{r.genre}</span>
                          </>
                        )}
                      </div>

                      <h3
                        className="font-display text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight text-white leading-[0.95] group-hover:text-[#d4af37] transition-colors duration-500"
                        style={{
                          textShadow: "0px 2px 10px rgba(0,0,0,0.5)"
                        }}
                      >
                        {r.title}
                      </h3>

                      <p className="text-[12px] font-mono uppercase tracking-[0.3em] text-red-500 font-extrabold flex items-center gap-2">
                        <svg className="h-4.5 w-4.5 text-red-500 fill-current shrink-0" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        {r.artist}
                        <span className="text-white/20 font-black tracking-widest text-[9px] ml-auto font-mono">1017 SIGNATURE DISK</span>
                      </p>

                      {renderFeaturedStats(r, hasStats)}

                      {r.description && (
                        <p className="text-xs font-mono text-muted-foreground/80 leading-relaxed max-w-2xl border-l-2 border-red-500/20 pl-4 py-0.5 uppercase tracking-[0.08em]">
                          {r.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-5 border-t border-white/5 pt-6 mt-6">
                      <Link
                        to="/release/$name"
                        params={{ name: slugify(r.title) }}
                        className="bg-white text-black hover:bg-white/90 px-8 py-4 text-[11px] font-black uppercase tracking-[0.25em] shadow-xl hover:shadow-[0_15px_30px_rgba(255,255,255,0.1)] transition-all duration-300 rounded-lg inline-flex items-center gap-2.5"
                      >
                        ▶ Listen Now
                      </Link>

                      <SocialLinksRow
                        urls={[r.spotify_url, r.apple_url, r.youtube_url, r.soundcloud_url]}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            }

            // STANDARD RENDER CASE: Luxury Collector's Cover Card
            return (
              <Link
                key={r.id}
                to="/release/$name"
                params={{ name: slugify(r.title) }}
                className="block outline-none group"
              >
                <motion.div
                  initial={{ opacity: 0, y: 45 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col text-left relative bg-transparent border-none p-0 transition-all duration-700 overflow-hidden"
                >
                  {/* Artwork (Primary Focus - occupying 80% visual attention) */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-none bg-black/50 z-10 flex items-center justify-center border border-white/5">
                    
                    {/* Outer gradient shadow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-85 z-20" />
                    
                    {r.cover_url ? (
                      <PremiumImage
                        src={r.cover_url}
                        alt={r.title}
                        aspectRatioClass="aspect-square"
                        loading="lazy"
                        className="transition-transform duration-[1000ms] ease-out group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0c0d10] to-[#040405] flex flex-col items-center justify-center p-6 border border-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E5D5C0]/[0.03] to-transparent -translate-x-full animate-shimmer" />
                        <svg className="w-10 h-10 text-zinc-700 animate-spin" style={{ animationDuration: '6s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
                          <circle cx="12" cy="12" r="10" />
                          <circle cx="12" cy="12" r="7.5" strokeDasharray="2 2" />
                          <circle cx="12" cy="12" r="4" />
                          <circle cx="12" cy="12" r="1.5" />
                        </svg>
                        <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-[#E5D5C0]/40 mt-3 leading-none select-none">1017 SIGNATURE DISK</span>
                      </div>
                    )}

                    {/* Integrated Certification Badges inside Cover Frame */}
                    {activeBadges.length > 0 && (
                      <div className="absolute bottom-3 left-3 z-30 flex flex-wrap gap-1.5 pointer-events-auto">
                        {activeBadges.map((badge) => (
                          <div
                            key={badge.id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none text-[9px] font-sans font-bold uppercase tracking-[0.08em] shadow-lg border border-zinc-800/80 border-l-[3.5px] ${
                              badge.theme === "red" 
                                ? "bg-[#090a0c]/95 border-l-red-500 text-white" 
                                : badge.theme === "gold" 
                                ? "bg-[#0f1013]/95 border-l-[#d4af37] text-[#d4af37]" 
                                : "bg-[#14161a]/95 border-l-slate-400 text-slate-200"
                            }`}
                            style={{
                              boxShadow: "0 6px 12px rgba(0,0,0,0.5), inset 0 1px 0px rgba(255,255,255,0.04)"
                            }}
                          >
                            <span className="shrink-0">{getBadgeIcon(badge.theme, "h-3.5 w-3.5")}</span>
                            <span className="leading-none">{badge.title}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Apple/Netflix-style Listen Hover Overlay */}
                    <div
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-center justify-center p-4"
                    >
                      <span className="bg-white text-black font-sans font-black uppercase text-[10px] tracking-[0.2em] px-5 py-3 rounded-md shadow-2xl transform translate-y-3 group-hover:translate-y-0 transition-all duration-500 hover:bg-white/90 flex items-center gap-1.5">
                        <span>▶ Listen Now</span>
                      </span>
                    </div>

                    {r.pinned && (
                      <div className="absolute top-3 right-3 z-30 text-blue-400 bg-black/40 p-1.5 rounded-full border border-white/5 backdrop-blur-md" title="Pinned to Top">
                        <svg className="w-3.5 h-3.5 fill-current animate-pulse" viewBox="0 0 24 24">
                          <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info & Data specifications */}
                  <div className="mt-4 flex flex-col gap-2.5 relative z-10">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2.5">
                        <h3 className="font-display text-2xl uppercase tracking-tight text-white group-hover:text-[#d4af37] transition-colors duration-500 truncate" title={r.title}>
                          {r.title}
                        </h3>
                        <span className="font-mono text-[9px] tracking-widest text-muted-foreground bg-white/5 border border-white/10 px-2 py-0.5 rounded-md shrink-0 font-bold uppercase">
                          {yearStr}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-red-500 flex items-center gap-1.5 font-extrabold">
                        <svg className="h-3.5 w-3.5 text-red-500 fill-current shrink-0" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        <span className="truncate" title={r.artist}>{r.artist}</span>
                        <span className="text-white/20 font-black tracking-widest text-[8px] ml-auto font-mono">1017 ARTIST</span>
                      </p>
                    </div>

                    {renderStandardStats(r, hasStats)}
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
