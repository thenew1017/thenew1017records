import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPublicArtists, slugify } from "@/lib/cms.functions";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Youtube, Music2, Apple, Globe } from "lucide-react";
import { trackClick, trackHover, ensureSession } from "@/lib/analytics";
import { PremiumImage } from "@/components/ui/PremiumImage";
import { SocialLinkButton } from "@/components/ui/SocialLinks";


type Artist = {
  id?: string;
  name: string;
  role?: string | null;
  tag?: string | null;
  bio?: string | null;
  image_url?: string | null;
  spotify_url?: string | null;
  apple_url?: string | null;
  youtube_url?: string | null;
  instagram_url?: string | null;
  twitter_url?: string | null;
  website_url?: string | null;
};



const socialDefs: { key: keyof Artist; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "spotify_url", label: "Spotify", Icon: Music2 },
  { key: "apple_url", label: "Apple Music", Icon: Apple },
  { key: "youtube_url", label: "YouTube", Icon: Youtube },
  { key: "instagram_url", label: "Instagram", Icon: Instagram },
  { key: "twitter_url", label: "Twitter", Icon: Twitter },
  { key: "website_url", label: "Website", Icon: Globe },
];

function SocialRow({ a, size = "sm" }: { a: Artist; size?: "sm" | "lg" }) {
  const links = socialDefs.filter((s) => a[s.key]);
  if (links.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-1.5 lg:gap-1 w-full max-w-full px-1">
      {links.map(({ key }) => {
        const url = a[key] as string;
        return (
          <SocialLinkButton
            key={key}
            url={url}
            size={size === "lg" ? "md" : "sm"}
            className=""
            onClick={(e) => {
              e.stopPropagation();
              if (a.id) void trackClick(a.id, String(key).replace(/_url$/, ""));
            }}
          />
        );
      })}
    </div>
  );
}

const MotionLink = motion.create(Link);

function getPremiumBadge(role?: string | null): string {
  if (!role) return "✓ Official Roster";
  const r = role.toLowerCase();
  if (r.includes("flagship")) return "✓ Flagship Talent";
  if (r.includes("1017")) return "✓ 1017 Records Artist";
  if (r.includes("frozone") || r.includes("queen")) return "✓ Featured Artist";
  if (r.includes("verified")) return "✓ Verified Artist";
  return `✓ ${role}`;
}




export function CinematicArtistImage({ 
  src, 
  alt, 
  aspect = "aspect-[3/4]" 
}: { 
  src: string; 
  alt: string; 
  aspect?: string; 
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [lightX, setLightX] = useState(50);
  const [lightY, setLightY] = useState(50);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const normX = (x / rect.width) - 0.5;
    const normY = (y / rect.height) - 0.5;
    
    setRotateX(-normY * 9);
    setRotateY(normX * 9);
    
    setLightX((x / rect.width) * 100);
    setLightY((y / rect.height) * 100);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setLightX(50);
    setLightY(50);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative ${aspect} w-full rounded-sm overflow-hidden bg-[#000000] shadow-lg select-none cursor-pointer transform-gpu artist-photo-container`}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
        willChange: "transform",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden"
      }}
    >
      {/* 3D Motion Container */}
      <div
        className="relative w-full h-full rounded-sm transition-all duration-300 ease-out will-change-transform transform-gpu artist-photo-container"
        style={{
          transform: isHovered 
            ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.06, 1.06, 1.06) translateZ(0)` 
            : "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateZ(0)",
          boxShadow: isHovered
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 35px rgba(255, 255, 255, 0.04)"
            : "0 10px 20px -10px rgba(0, 0, 0, 0.5)",
          transformStyle: "preserve-3d",
          transition: isHovered ? "transform 0.08s ease-out, box-shadow 0.3s ease" : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: "transform",
          backfaceVisibility: "hidden"
        }}
      >
        {src ? (
          <>
            {/* Full-Color Premium Image - GPU Accelerated with Luxury Visuals */}
            <PremiumImage
              src={src}
              alt={alt}
              loading="eager"
              fetchPriority="high"
              aspectRatioClass=""
              className="transition-transform duration-[700ms] ease-out transform-gpu"
              style={{
                transform: isHovered ? "scale(1.03) translateZ(0)" : "scale(1) translateZ(0)",
                filter: "contrast(1.03) saturate(1.06) brightness(0.96)",
                transition: "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), filter 0.5s ease",
              }}
            />



            {/* Ambient Dark Cinematic Shading */}
            <div 
              className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent pointer-events-none transition-opacity duration-500"
              style={{ opacity: isHovered ? 0.75 : 0.85 }}
            />

            {/* Dynamic Studio Lighting Spotlight Reflection Layer */}
            <div
              className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-0 transition-opacity duration-300 will-change-transform"
              style={{
                opacity: isHovered ? 0.6 : 0,
                background: `radial-gradient(circle at ${lightX}% ${lightY}%, rgba(255, 255, 255, 0.45) 0%, transparent 60%)`,
              }}
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c0d10] to-[#020203] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden border border-white/5">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E5D5C0]/[0.02] to-transparent -translate-x-full animate-shimmer pointer-events-none" />
            <svg className="w-12 h-12 text-zinc-700 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7a3 3 0 100 6 3 3 0 000-6z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 18.75a9 9 0 0115 0" />
            </svg>
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#E5D5C0]/50 mt-4 leading-none select-none">OFFICIAL DOSSIER PORTRAIT</span>
          </div>
        )}

        {/* High-End Glass Bevel highlight */}
        <div 
          className="absolute inset-0 border border-white/5 rounded-sm pointer-events-none transition-colors duration-300"
          style={{
            borderColor: isHovered ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.05)",
          }}
        />
      </div>
    </div>
  );
}

export function Artists({ initialArtists }: { initialArtists?: any[] }) {
  const fetchArtists = useServerFn(listPublicArtists);
  const qc = useQueryClient();
  const { data } = useQuery({ 
    queryKey: ["public-artists"], 
    queryFn: () => fetchArtists(),
    initialData: initialArtists ? { artists: initialArtists } : undefined
  });

  useEffect(() => {
    void ensureSession();
    const channel = supabase
      .channel("artists-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "artists" }, () => {
        qc.invalidateQueries({ queryKey: ["public-artists"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  const artists: (Artist & { rating?: number })[] = (data?.artists.length ?? 0) > 0
    ? (data!.artists as Artist[]).map((a, i) => {
        const [tagVal, ratingVal] = (a.tag || "").split("|");
        return {
          ...a,
          image_url: a.image_url || null,
          tag: tagVal || String(i + 1).padStart(2, "0"),
          rating: ratingVal ? parseInt(ratingVal) : 5,
        };
      })
    : [];

  // Public Hydration Logs verifying photo & logo fields fetched from Supabase
  if (typeof window !== "undefined") {
    console.log("=== 1017 PUBLIC ROSTER HYDRATION AUDIT ===");
    console.log("⚡ [Supabase Client Query] Fetching public roster via listPublicArtists server function.");
    console.log("⚡ [Supabase Client Query Definition] SELECT id, name, role, tag, bio, image_url, spotify_url, apple_url, youtube_url, instagram_url, twitter_url, website_url, sort_order FROM artists WHERE published = true ORDER BY sort_order ASC, created_at ASC");
    if (data?.artists) {
      console.log("✅ [Supabase Client Response] Full database payload received:", data.artists);
    } else {
      console.log("❌ [Supabase Client Response] No payload or empty array received. SSR initialData may be pending.");
    }
    
    if (artists.length > 0) {
      artists.forEach((app) => {
        console.log(`Artist Card: ${app.name}`);
        console.log(` - image_url: ${app.image_url || "NONE"}`);
      });
    } else {
      console.log("ℹ️ [Supabase Client Response] Roster is empty.");
    }
    console.log("==========================================");
  }

  return (
    <section id="artists" className="relative px-6 py-32 md:px-10 border-t border-white/5 content-visibility-auto">
      {/* Background glow flares for division */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="pointer-events-none absolute -right-32 top-1/2 h-[70vmin] w-[70vmin] glow-gold opacity-[0.02] -translate-y-1/2" />
      
      <div className="mx-auto max-w-[1600px] relative">
        
        {/* Header Terminal Block */}
        <div className="mb-20 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3.5 py-1.5 rounded-full text-[10px] font-sans font-medium uppercase tracking-[0.25em] text-white/80 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.02)]">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              Official Records Roster
            </div>
            <h2 className="font-display text-5xl uppercase leading-[0.9] md:text-7xl lg:text-8xl">
              The <span className="text-stroke font-black">Artists</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground border-l border-white/10 pl-5 py-1">
            A roster forged in late nights and louder mornings. Discover the specialized sound vectors defining the next global audio wave.
          </p>
        </div>
 
        {/* Roster Module Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {artists.map((a, i) => (
            <motion.div
              key={a.id ?? a.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              style={{
                willChange: "transform, opacity",
                transform: "translateZ(0)",
                backfaceVisibility: "hidden"
              }}
              className="group relative flex flex-col text-left bg-transparent p-0 border-none transition-all duration-[250ms] ease-in-out select-none transform-gpu"
            >
              <Link
                to="/artist/$name"
                params={{ name: slugify(a.name) }}
                onMouseEnter={() => {
                  if (a.id) trackHover(a.id);
                }}
                className="outline-none focus-visible:ring-2 focus-visible:ring-accent flex flex-col flex-grow text-left cursor-pointer"
              >
                {/* Middle: Cinematic Standalone Artist Image */}
                <CinematicArtistImage
                  src={a.image_url ?? ""}
                  alt={a.name}
                />

                {/* Bottom: Artist Name, Bio & Platform Icons */}
                <div className="pt-5 relative w-full flex flex-col flex-grow">
                  {/* Flat Typographic Roster Badges */}
                  <div className="flex items-center justify-between gap-3 mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                    <span>{getPremiumBadge(a.role)}</span>
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      LIVE
                    </span>
                  </div>

                  <h3 className="font-display text-2xl uppercase tracking-tight text-white group-hover:text-[#E5D5C0] transition-colors duration-[250ms] ease-in-out">
                    {a.name}
                  </h3>
                  
                  {a.bio && (
                    <p className="mt-2 text-xs leading-relaxed text-zinc-400 font-light font-sans line-clamp-2">
                      {a.bio}
                    </p>
                  )}
                </div>
              </Link>

              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-center w-full relative z-30">
                <SocialRow a={a} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
