import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPublicReleaseBySlug, getPublicSettings, slugify } from "@/lib/cms.functions";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, Music2, Apple, Youtube, Globe, Heart, Share2, Star, Download, Play, Disc } from "lucide-react";
import { PremiumImage } from "@/components/ui/PremiumImage";
import { getPlatformFromUrl, getPlatformLabel, SocialIconSVG, SocialLinkButton } from "@/components/ui/SocialLinks";

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

type BadgeTemplate = {
  id: "verified_hit" | "gold_record" | "platinum_record";
  title: string;
  icon: string;
  theme: "red" | "gold" | "platinum" | "purple" | "cyan";
  glow: number;
  order: number;
  visible: boolean;
};

const DEFAULT_TEMPLATES: BadgeTemplate[] = [
  { id: "verified_hit", title: "HIT RECORD", icon: "🔥", theme: "red", glow: 0.6, order: 0, visible: true },
  { id: "gold_record", title: "GOLD CERTIFIED", icon: "🥇", theme: "gold", glow: 0.8, order: 1, visible: true },
  { id: "platinum_record", title: "PLATINUM CERTIFIED", icon: "💿", theme: "platinum", glow: 1.0, order: 2, visible: true },
];

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
    spotify_url: "https://spotify.com",
    apple_url: "https://apple.co",
    youtube_url: "https://youtube.com",
    soundcloud_url: "https://soundcloud.com",
    website_url: "https://google.com",
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
    spotify_url: "https://spotify.com",
    apple_url: "https://apple.co",
    youtube_url: "https://youtube.com",
    soundcloud_url: "https://soundcloud.com",
    website_url: "https://google.com",
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
    spotify_url: "https://spotify.com",
    apple_url: "https://apple.co",
    youtube_url: "https://youtube.com",
    soundcloud_url: "https://soundcloud.com",
    website_url: "https://google.com",
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
    spotify_url: "https://spotify.com",
    apple_url: "https://apple.co",
    youtube_url: "https://youtube.com",
    soundcloud_url: "https://soundcloud.com",
    website_url: "https://google.com",
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

const SVGIcons = {
  streams: (className = "h-5 w-5") => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  ),
  views: (className = "h-5 w-5") => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  rating: (className = "h-5 w-5") => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  ),
  likes: (className = "h-5 w-5") => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
  shares: (className = "h-5 w-5") => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l4.636-2.318a3 3 0 10-.712-1.423l-4.636 2.318a3 3 0 100 4.195l4.636 2.318a3 3 0 10.712-1.423l-4.636-2.318z" />
    </svg>
  ),
  listeners: (className = "h-5 w-5") => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  downloads: (className = "h-5 w-5") => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  favorites: (className = "h-5 w-5") => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
};

const getBadgeIcon = (theme: BadgeTemplate["theme"], className = "h-3.5 w-3.5") => {
  switch (theme) {
    case "red":
      return (
        <svg className={`${className} text-red-500`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      );
    case "gold":
      return (
        <svg className={`${className} text-[#d4af37]`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3.5" strokeWidth={1.5} />
        </svg>
      );
    case "platinum":
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

const getThemeClasses = (theme: BadgeTemplate["theme"]) => {
  switch (theme) {
    case "red":
      return "bg-[#090a0c] border border-zinc-800/80 border-l-[3px] border-l-red-500 text-white font-sans font-bold uppercase tracking-[0.08em] shadow-md relative overflow-hidden";
    case "gold":
      return "bg-[#0f1013] border border-zinc-800/80 border-l-[3px] border-l-[#d4af37] text-[#d4af37] font-sans font-bold uppercase tracking-[0.08em] shadow-md relative overflow-hidden";
    case "platinum":
      return "bg-[#14161a] border border-zinc-800/80 border-l-[3px] border-l-slate-400 text-slate-200 font-sans font-bold uppercase tracking-[0.08em] shadow-md relative overflow-hidden";
    case "purple":
      return "bg-[#090a0c] border border-zinc-800/80 border-l-[3px] border-l-purple-500 text-white font-sans font-bold uppercase tracking-[0.08em] shadow-md relative overflow-hidden";
    case "cyan":
      return "bg-[#090a0c] border border-zinc-800/80 border-l-[3px] border-l-cyan-500 text-white font-sans font-bold uppercase tracking-[0.08em] shadow-md relative overflow-hidden";
    default:
      return "bg-[#090a0c] border border-zinc-800 text-white font-sans";
  }
};

const formatMetric = (num: number | undefined | null): string => {
  if (num === undefined || num === null || isNaN(num) || num <= 0) return "0";
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
};

function AnimatedNumber({ value, isFloat = false }: { value: number | null | undefined; isFloat?: boolean }) {
  const [displayValue, setDisplayValue] = useState(0);
  const safeValue = value ?? 0;

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1500; // 1.5 seconds smooth counting animation
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Premium easeOutCubic curve
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      setDisplayValue(easeProgress * safeValue);
      
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };
    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (typeof window !== "undefined" && animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [safeValue]);

  if (value === null || value === undefined) {
    return <span>N/A</span>;
  }

  if (isFloat) {
    return <span>{displayValue.toFixed(1)}</span>;
  }
  return <span>{formatMetric(Math.floor(displayValue))}</span>;
}

export const Route = createFileRoute("/release/$name")({
  component: ReleaseDetailPage,
  errorComponent: ReleaseErrorComponent,
  pendingComponent: ReleasePendingComponent,
  loader: async ({ params }) => {
    try {
      const [releaseRes, settingsRes] = await Promise.all([
        getPublicReleaseBySlug({ data: { name: params.name } }),
        getPublicSettings()
      ]);
      return { release: releaseRes.release, settings: settingsRes?.settings || {} };
    } catch {
      try {
        const settingsRes = await getPublicSettings();
        return { release: null, settings: settingsRes?.settings || {} };
      } catch {
        return { release: null, settings: {} };
      }
    }
  },
  head: ({ loaderData }) => {
    const release = loaderData?.release;
    return {
      meta: [
        { title: release ? `${release.title} — ${release.artist} | The New 1017 Records` : "Release Signature Locked — The New 1017 Records" },
        { name: "description", content: release?.description || "High-fidelity release campaign dossier catalog portal." },
        { property: "og:title", content: release ? `${release.title} — ${release.artist}` : "Release Profile" },
        { property: "og:description", content: release?.description || "High-fidelity release campaign dossier catalog portal." },
        { property: "og:image", content: release?.cover_url || "" },
        { property: "og:type", content: "music.album" },
      ],
    };
  },
});

function ReleaseErrorComponent({ error }: { error: any }) {
  console.error("Release Page SSR/Render Error caught by boundary:", error);
  return (
    <main className="relative min-h-screen bg-[#000000] text-foreground flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,0,0,0.04),transparent_50%)]" />
      <span className="h-12 w-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-lg border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)] font-bold">
        ⚠
      </span>
      <h1 className="font-display text-4xl uppercase tracking-wider text-gradient-gold">Signature Locked</h1>
      <p className="text-sm text-muted-foreground max-w-md leading-relaxed font-light">
        A coordinate decryption error has occurred. Safe-mode shields have isolated the catalog campaign transmission path.
      </p>
      <Link to="/" className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-5 py-2.5 text-[10px] font-mono uppercase tracking-[0.2em] hover:border-[#D4AF37] hover:text-[#D4AF37] rounded-sm transition-all duration-300">
        ← Return to Main Portal
      </Link>
    </main>
  );
}

function ReleasePendingComponent() {
  return (
    <main className="relative min-h-screen bg-[#000000] text-foreground flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,215,0,0.02),transparent_50%)]" />
      <div className="space-y-4">
        <div className="h-6 w-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#D4AF37] animate-pulse">Decrypting Catalog Signature...</p>
      </div>
    </main>
  );
}

function ReleaseDetailPage() {
  const { name } = useParams({ from: "/release/$name" });
  const fetchRelease = useServerFn(getPublicReleaseBySlug);
  const fetchSettings = useServerFn(getPublicSettings);
  const loaderData = Route.useLoaderData();

  const { data: releaseQuery } = useQuery({
    queryKey: ["public-release", name],
    queryFn: () => fetchRelease({ data: { name } }),
    initialData: loaderData?.release ? { release: loaderData.release } : undefined,
    staleTime: 30_000,
  });

  const { data: settingsQuery } = useQuery({
    queryKey: ["public-settings"],
    queryFn: () => fetchSettings(),
    initialData: loaderData?.settings ? { settings: loaderData.settings } : undefined,
    staleTime: 30_000,
  });

  let release = releaseQuery?.release || loaderData?.release;

  // Fallback to FALLBACK_RELEASES if database doesn't have it (for perfect backwards compatibility / preview)
  if (!release) {
    release = FALLBACK_RELEASES.find((r) => slugify(r.title) === name) || null;
  }

  if (!release) {
    return (
      <main className="relative min-h-screen bg-background text-foreground grain-overlay flex flex-col justify-between">
        <Nav />
        <div className="mx-auto max-w-lg text-center px-6 py-40 space-y-6">
          <h1 className="font-display text-5xl uppercase text-gradient-gold">Dossier Locked</h1>
          <p className="text-sm text-muted-foreground">The requested audio catalog signature coordinates could not be retrieved from our active database nodes.</p>
          <Link to="/" className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-widest hover:border-accent hover:text-accent rounded-sm transition-colors">
            <ArrowLeft className="h-4 w-4" /> ← Back to Home
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const badgeTemplates = (settingsQuery?.settings?.releases_badge_templates as BadgeTemplate[] | undefined) ?? DEFAULT_TEMPLATES;
  const analyticsStyle = (settingsQuery?.settings?.analytics_display_style as string | undefined) ?? "Premium";
  const allReleases = (settingsQuery?.settings?.releases as ReleaseSetting[] | undefined) ?? FALLBACK_RELEASES;

  // Filter dynamic badges enabled for this specific release
  const activeBadges = [
    release.verified_hit && badgeTemplates.find((t) => t.id === "verified_hit"),
    release.gold_record && badgeTemplates.find((t) => t.id === "gold_record"),
    release.platinum_record && badgeTemplates.find((t) => t.id === "platinum_record"),
  ]
    .filter((b): b is BadgeTemplate => !!b && b.visible)
    .sort((a, b) => a.order - b.order);

  // Stats matrix
  const hasStats = true; // Always display analytics section with safe defaults if data is missing

  const statsList = [
    { key: "streams" as const, label: "Streams", val: release.streams, color: "text-accent" },
    { key: "views" as const, label: "Views", val: release.views, color: "text-lux-white" },
    { key: "rating" as const, label: "Rating", val: release.rating, color: "text-yellow-400" },
    { key: "likes" as const, label: "Likes", val: release.likes, color: "text-red-400" },
    { key: "favorites" as const, label: "Favorites", val: release.favorites, color: "text-pink-400" },
    { key: "shares" as const, label: "Shares", val: release.shares, color: "text-blue-400" },
    { key: "listeners" as const, label: "Listeners", val: release.listeners, color: "text-teal-400" },
    { key: "downloads" as const, label: "Downloads", val: release.downloads, color: "text-green-400" },
  ].filter((s) => s.val !== undefined && s.val !== null && s.val > 0);

  // Dynamically build platforms from pasted URLs
  const rawUrls = [
    { key: "spotify", url: release.spotify_url },
    { key: "apple", url: release.apple_url },
    { key: "youtube", url: release.youtube_url },
    { key: "soundcloud", url: release.soundcloud_url },
    { key: "website", url: release.website_url }
  ];

  const platforms = rawUrls
    .filter((item) => item.url && item.url.trim().length > 0)
    .map((item) => {
      const url = item.url!;
      const platform = getPlatformFromUrl(url);
      const name = getPlatformLabel(platform);
      return {
        name,
        url,
        platform,
        borderColor: "hover:border-white/20 hover:shadow-[0_0_25px_rgba(255,255,255,0.08)]",
      };
    });

  // Related releases
  const related = allReleases
    .filter((r) => r && r.title && slugify(r.title) !== name && r.published)
    .slice(0, 3);

  // Custom 3D hover/micro-tilt cover effect
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [lightX, setLightX] = useState(50);
  const [lightY, setLightY] = useState(50);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = x / rect.width - 0.5;
    const normY = y / rect.height - 0.5;
    setRotateX(-normY * 8);
    setRotateY(normX * 8);
    setLightX((x / rect.width) * 100);
    setLightY((y / rect.height) * 100);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setLightX(50);
    setLightY(50);
  };

  const renderDetailStats = () => {
    if (!hasStats) return null;

    const getMetricCard = (
      key: "streams" | "views" | "rating" | "likes" | "listeners" | "downloads" | "shares" | "favorites", 
      label: string, 
      val: number | undefined | null
    ) => {
      const isFloat = key === "rating";

      return (
        <div 
          key={key} 
          className="flex flex-col justify-start text-left w-full select-none"
        >
          <span 
            className="block text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-none font-sans"
            style={{
              fontFamily: "Inter, 'SF Pro Display', Geist, sans-serif"
            }}
          >
            <AnimatedNumber value={val} isFloat={isFloat} />
          </span>
          <span className="block text-[10px] font-mono tracking-[0.4em] text-[#E5D5C0] uppercase font-extrabold mt-3.5">
            {label}
          </span>
        </div>
      );
    };

    return (
      <div className="relative w-full">
        {/* 4-Column Typographic Editorial Grid Layout */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-10 sm:gap-y-12 lg:gap-y-16 w-full max-w-7xl mx-auto py-8">
          {statsList.map((s) => 
            getMetricCard(s.key, s.label, s.val)
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="relative min-h-screen bg-background text-foreground grain-overlay overflow-x-hidden">
      <Nav />

      {/* Cyber Ambient Lighting Grid */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-[80vmin] w-[80vmin] glow-gold opacity-[0.02]" />
        <div className="absolute top-1/3 -right-32 h-[80vmin] w-[80vmin] glow-gold opacity-[0.02]" />
        <div className="absolute left-1/3 bottom-1/4 h-[70vmin] w-[70vmin] glow-gold opacity-[0.02]" />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
      </div>

      <div className="mx-auto max-w-[1400px] px-6 pt-32 pb-24 md:px-10 md:pt-40 lg:pb-32">
        {/* Back Link Breadcrumb */}
        <Link
          to="/"
          className="group inline-flex items-center gap-2.5 text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground hover:text-accent transition-colors mb-12 border border-white/5 bg-black/40 px-4 py-2 rounded-sm backdrop-blur-md"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          ← Back to Home
        </Link>

        {/* HERO SECTION */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 items-start">
          {/* LEFT: Premium 3D Album Cover Artwork */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-[480px] select-none"
            >
              <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative aspect-square w-full rounded-none overflow-hidden bg-black/40 border border-white/5 transform-gpu transition-transform duration-200 ease-out"
                style={{
                  transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`,
                }}
              >
                {/* Outer gradient shadow */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-85 z-20" />

                {/* Sub-pixel rim lighting (Anodized Metal Highlight) */}
                <div className="absolute inset-0 z-30 pointer-events-none rounded-none border border-white/5" style={{ boxShadow: "inset 0 1px 0px rgba(255,255,255,0.08)" }} />

                {release.cover_url ? (
                  <PremiumImage
                    src={release.cover_url}
                    alt={release.title}
                    aspectRatioClass="aspect-square"
                    loading="eager"
                    fetchPriority="high"
                    className="transition-transform duration-1000"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0c0d10] to-[#040405] flex flex-col items-center justify-center p-12 border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E5D5C0]/[0.04] to-transparent -translate-x-full animate-shimmer pointer-events-none" />
                    <svg className="w-20 h-20 text-zinc-700 animate-spin" style={{ animationDuration: '8s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="7.5" strokeDasharray="2 2" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="12" cy="12" r="1.5" />
                    </svg>
                    <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-[#E5D5C0]/50 mt-6 animate-pulse select-none">1017 SIGNATURE DISK</span>
                  </div>
                )}

                {/* Cinematic Studio Lighting Reflection */}
                <div
                  className="absolute inset-0 z-20 pointer-events-none opacity-30 transition-opacity duration-300 bg-radial-gradient"
                  style={{
                    background: `radial-gradient(circle 240px at ${lightX}% ${lightY}%, rgba(255, 255, 255, 0.12), transparent)`,
                  }}
                />

                {/* Cover Art Sweep Shine */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full animate-shine z-25 pointer-events-none" />
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Release specifications & metadata */}
          <div className="lg:col-span-7 space-y-8">
            <span className="text-[10px] font-mono tracking-[0.35em] text-[#E5D5C0] block font-bold">
              CAT-1017 // OFFICIAL RELEASE SIGNATURE
            </span>

            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-white/50 block">
                {release.format} • {release.genre}
              </span>
              <h1 className="font-display text-5xl uppercase leading-[0.95] text-foreground sm:text-6xl md:text-7xl">
                {release.title}
              </h1>
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-red-500 font-black flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                {release.artist}
              </p>
            </div>

            {/* Certifications Luxury Editorial-style status chips */}
            {activeBadges.length > 0 && (
              <div className="flex flex-wrap gap-4 pt-3">
                {activeBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="inline-flex items-center gap-2 px-4.5 py-2 border border-[#E5D5C0]/25 bg-transparent text-[9px] font-bold tracking-[0.2em] text-[#E5D5C0] font-sans rounded-full uppercase"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#E5D5C0] shadow-[0_0_8px_rgba(229,213,192,0.5)] animate-pulse" />
                    {badge.title}
                  </div>
                ))}
              </div>
            )}

            {/* Editorial Information Panel */}
            <div className="w-full border-t border-white/[0.08] pt-8 mt-12 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                
                {/* Release Status */}
                <div className="space-y-2">
                  <span className="block font-display text-[9px] tracking-[0.3em] text-[#E5D5C0]/60 uppercase font-black">
                    RELEASE STATUS
                  </span>
                  <span className="block font-sans text-xs sm:text-sm font-bold uppercase tracking-wider text-green-400 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
                    LIVE DISTRIBUTION
                  </span>
                </div>

                {/* Release Year */}
                <div className="space-y-2">
                  <span className="block font-display text-[9px] tracking-[0.3em] text-[#E5D5C0]/60 uppercase font-black">
                    RELEASE YEAR
                  </span>
                  <span className="block font-sans text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                    {release.release_date ? new Date(release.release_date).getFullYear() : "2026"}
                  </span>
                </div>

                {/* Genre */}
                <div className="space-y-2">
                  <span className="block font-display text-[9px] tracking-[0.3em] text-[#E5D5C0]/60 uppercase font-black">
                    GENRE
                  </span>
                  <span className="block font-sans text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                    {release.genre ? release.genre.toUpperCase() : "TRAP / HIP-HOP"}
                  </span>
                </div>

                {/* Certification */}
                <div className="space-y-2">
                  <span className="block font-display text-[9px] tracking-[0.3em] text-[#E5D5C0]/60 uppercase font-black">
                    CERTIFICATION
                  </span>
                  <span className="block font-sans text-xs sm:text-sm font-bold uppercase tracking-wider text-accent">
                    {release.platinum_record ? "PLATINUM" : release.gold_record ? "GOLD" : release.verified_hit ? "HIT RECORD" : "OFFICIAL"}
                  </span>
                </div>

              </div>
              <div className="w-full border-b border-white/[0.08] pb-6" />
            </div>

            {/* Description */}
            {release.description && (
              <div className="space-y-3">
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30 block">
                  EDITORIAL OVERVIEW
                </span>
                <p className="text-sm leading-relaxed text-muted-foreground border-l-2 border-accent/20 pl-4 py-0.5">
                  {release.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* STREAMING PLATFORMS SELECTION GRID */}
        {platforms.length > 0 && (
          <div className="pt-20 mt-20 border-t border-white/5 space-y-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 border border-white/5 bg-white/5 px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-[0.35em] text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                TRANSMISSION PATH SELECTOR
              </div>
              <h2 className="font-display text-4xl uppercase text-foreground md:text-5xl">
                Streaming <span className="text-gradient-gold">Platforms</span>
              </h2>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                Select your preferred high-fidelity stream node below.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-[28px] pt-4">
              {platforms.map((platform) => (
                <SocialLinkButton
                  key={platform.name}
                  url={platform.url}
                />
              ))}
            </div>
          </div>
        )}

        {/* STATS ANALYTICS PANEL (Music Intelligence Mosaic System) */}
        {hasStats && (
          <div className="pt-16 sm:pt-24 space-y-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.35em] text-[#E5D5C0] font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E5D5C0] animate-pulse" />
                CONFIDENTIAL A&R REGISTRY BRIEFING
              </div>
              <h2 className="font-display text-4xl uppercase text-foreground md:text-5xl">
                Global <span className="text-gradient-gold">Cultural Reach</span>
              </h2>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                Audited network transmission records and artist performance indexes synced across global 1017 coordinate system nodes.
              </p>
            </div>

            {renderDetailStats()}
          </div>
        )}

        {/* RELATED RELEASES GRID */}
        {related.length > 0 && (
          <div className="pt-20 mt-20 border-t border-white/5 space-y-12">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 border border-white/5 bg-white/5 px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-[0.35em] text-accent">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_var(--color-accent)]" />
                  EXPLORE THE CATALOG SIGNATURES
                </div>
                <h2 className="font-display text-4xl uppercase text-foreground md:text-5xl">
                  Related <span className="text-gradient-gold">Releases</span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {related.map((r, i) => {
                const relImage = r.cover_url || "";
                const relYear = r.release_date ? new Date(r.release_date).getFullYear().toString() : "2026";
                return (
                   <Link
                    key={r.id || r.title}
                    to="/release/$name"
                    params={{ name: slugify(r.title) }}
                    className="group relative flex flex-col text-left outline-none bg-transparent p-0 border-none transition-all duration-500"
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-none bg-black/50 border border-white/5 flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-80 z-20" />
                      {relImage ? (
                        <PremiumImage
                          src={relImage}
                          alt={r.title}
                          aspectRatioClass="aspect-square"
                          loading="lazy"
                          className="transition-transform duration-1000 group-hover:scale-[1.05]"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#0c0d10] to-[#040405] flex flex-col items-center justify-center p-6 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E5D5C0]/[0.03] to-transparent -translate-x-full animate-shimmer pointer-events-none" />
                          <svg className="w-10 h-10 text-zinc-700 animate-spin" style={{ animationDuration: '6s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="7.5" strokeDasharray="2 2" />
                            <circle cx="12" cy="12" r="4" />
                            <circle cx="12" cy="12" r="1.5" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out z-20 pointer-events-none" />
                    </div>

                    <div className="pt-4 px-1 flex justify-between items-center w-full">
                      <div>
                        <p className="text-[8px] font-mono uppercase tracking-widest text-accent">{r.format}</p>
                        <h3 className="font-display text-xl uppercase mt-1 group-hover:text-[#d4af37] transition-colors truncate max-w-[200px]" title={r.title}>
                          {r.title}
                        </h3>
                        <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">{r.artist}</p>
                      </div>
                      <div className="p-2 rounded-full border border-white/10 bg-white/5 text-muted-foreground group-hover:text-accent group-hover:border-accent group-hover:bg-accent/5 transition-all">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
