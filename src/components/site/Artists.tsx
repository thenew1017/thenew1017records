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
import a1 from "@/assets/artist-1.jpg";
import a2 from "@/assets/artist-2.jpg";
import a3 from "@/assets/artist-3.jpg";
import a4 from "@/assets/artist-4.jpg";

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

const fallback: Artist[] = [
  {
    name: "Pooh Shiesty",
    role: "Flagship Artist",
    image_url: a1,
    tag: "01|5",
    bio: "The Memphis-born breakout star of 1017 Records. With a raw signature flow and triple-platinum hits like 'Back in Blood', Pooh Shiesty defines the sound of modern trap.",
    spotify_url: "https://open.spotify.com/artist/5P24nlsyZ6Hk117eJ37QvS",
    apple_url: "https://music.apple.com/us/artist/pooh-shiesty/1487212001",
    youtube_url: "https://www.youtube.com/channel/UCyNqYc9lT59nZc-kI8pIhIg",
    instagram_url: "https://www.instagram.com/poohshiesty/",
  },
  {
    name: "Foogiano",
    role: "1017 MC",
    image_url: a2,
    tag: "02|5",
    bio: "Known as the 'Mayor of Greensboro' and first artist signed to the new 1017 Records. Bringing unyielding Southern energy, rapid-fire flows, and hard-hitting street anthems.",
    spotify_url: "https://open.spotify.com/artist/2L4dE2QeI2k3220p9x72Vd",
    apple_url: "https://music.apple.com/us/artist/foogiano/1486518151",
    youtube_url: "https://www.youtube.com/channel/UC0dI32599723l84h031239",
    instagram_url: "https://www.instagram.com/foogiano/",
  },
  {
    name: "Big Scarr",
    role: "The Frozone",
    image_url: a3,
    tag: "03|5",
    bio: "The late Memphis legend who electrified the hip-hop world. His signature calm delivery, razor-sharp lyricism, and platinum records leave behind an everlasting legacy.",
    spotify_url: "https://open.spotify.com/artist/6P24nlsyZ6Hk117eJ37QvS",
    apple_url: "https://music.apple.com/us/artist/big-scarr/1497212001",
    youtube_url: "https://www.youtube.com/channel/UCy9283723",
    instagram_url: "https://www.instagram.com/bigscarr/",
  },
  {
    name: "Enchanting",
    role: "The R&B Queen",
    image_url: a4,
    tag: "04|5",
    bio: "The late 1017 siren who seamlessly blended ethereal R&B vocals with razor-sharp trap verses. Her angelic delivery and bold songwriting paved a unique lane in modern hip-hop.",
    spotify_url: "https://open.spotify.com/artist/1487212001",
    apple_url: "https://music.apple.com/us/artist/enchanting/1497212001",
    youtube_url: "https://www.youtube.com/channel/UCy14872",
    instagram_url: "https://www.instagram.com/luvenchanting/",
  },
];

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
    
    // Coordinates normalized from -0.5 to 0.5
    const normX = (x / rect.width) - 0.5;
    const normY = (y / rect.height) - 0.5;
    
    // Realistic 3D Tilt bounds: max 9 degrees for luxurious micro-tilt
    setRotateX(-normY * 9);
    setRotateY(normX * 9);
    
    // Live studio lighting reflection coordinates
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
      className={`relative ${aspect} w-full rounded-sm overflow-hidden bg-black/40 shadow-lg select-none cursor-pointer transform-gpu`}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
    >
      {/* 3D Motion Container */}
      <div
        className="relative w-full h-full rounded-sm transition-all duration-300 ease-out will-change-transform transform-gpu"
        style={{
          transform: isHovered 
            ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.06, 1.06, 1.06)` 
            : "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
          boxShadow: isHovered
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 35px rgba(255, 255, 255, 0.04)"
            : "0 10px 20px -10px rgba(0, 0, 0, 0.5)",
          transformStyle: "preserve-3d",
          transition: isHovered ? "transform 0.08s ease-out, box-shadow 0.3s ease" : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Full-Color Premium Image - GPU Accelerated with Luxury Visuals */}
        <PremiumImage
          src={src}
          alt={alt}
          loading="lazy"
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

export function Artists() {
  const fetchArtists = useServerFn(listPublicArtists);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["public-artists"], queryFn: () => fetchArtists() });

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
          image_url: a.image_url || fallback[i % fallback.length].image_url,
          tag: tagVal || String(i + 1).padStart(2, "0"),
          rating: ratingVal ? parseInt(ratingVal) : 5,
        };
      })
    : fallback.map((a) => ({ ...a, rating: 5 }));

  return (
    <section id="artists" className="relative px-6 py-32 md:px-10 border-t border-white/5">
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
            <MotionLink
              key={a.id ?? a.name}
              to="/artist/$name"
              params={{ name: slugify(a.name) }}
              onMouseEnter={() => {
                if (a.id) trackHover(a.id);
              }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group relative flex flex-col text-left outline-none focus-visible:ring-2 focus-visible:ring-accent glass p-3 rounded-xl border border-white/5 hover:border-white/20 transition-all duration-[250ms] ease-in-out hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.85),0_0_30px_rgba(255,255,255,0.03)] cursor-pointer select-none transform-gpu"
            >
              {/* Top: Premium Artist Status Badge & Live Pulse Indicator */}
              <div className="flex items-center justify-between w-full mb-3 select-none">
                {/* Status Badge */}
                <div className="h-8 px-3.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center shadow-[0_0_12px_rgba(255,255,255,0.02)] group-hover:bg-white/10 group-hover:border-white/20 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-all duration-[250ms] ease-in-out">
                  <span className="font-sans text-[10px] font-semibold tracking-wider text-white/90">
                    {getPremiumBadge(a.role)}
                  </span>
                </div>
                
                {/* Live Pulse Beacon */}
                <div className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-red-500/10 border border-red-500/20 backdrop-blur-sm shadow-[0_0_10px_rgba(239,68,68,0.05)] group-hover:shadow-[0_0_15px_rgba(239,68,68,0.15)] group-hover:bg-red-500/15 transition-all duration-[250ms] ease-in-out">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  <span className="font-sans text-[9px] font-bold tracking-widest text-red-400">LIVE</span>
                </div>
              </div>

              {/* Middle: Cinematic Standalone Artist Image */}
              <CinematicArtistImage
                src={a.image_url ?? ""}
                alt={a.name}
              />

              {/* Bottom: Artist Name, Bio & Platform Icons */}
              <div className="pt-4 px-1 relative w-full flex flex-col flex-grow">
                <h3 className="font-display text-2xl uppercase tracking-tight text-foreground group-hover:text-gradient-gold group-hover:[text-shadow:0_0_12px_rgba(212,175,55,0.25)] transition-all duration-[250ms] ease-in-out">
                  {a.name}
                </h3>
                
                {a.bio && (
                  <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground font-light font-sans">
                    {a.bio}
                  </p>
                )}
                
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-center w-full">
                  <SocialRow a={a} />
                </div>
              </div>
            </MotionLink>
          ))}
        </div>
      </div>
    </section>
  );
}
