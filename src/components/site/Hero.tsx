import { motion } from "motion/react";
import { useRef, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPublicSettings } from "@/lib/cms.functions";
import { Link } from "@tanstack/react-router";
import { TransitionLink } from "@/components/ui/PageTransition";
import { preload } from "react-dom";

type HeroSettings = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  cta_label?: string;
  cta_href?: string;
  banner_url?: string;
};

const HERO_FALLBACK: HeroSettings = {
  eyebrow: "Est. 2017",
  title: "The New Standard in Global Music",
  subtitle: "Defining the Future of Culture.",
  banner_url: "",
};

export function Hero({ settings }: { settings?: Record<string, any> }) {
  const fetchSettings = useServerFn(getPublicSettings);
  
  const { data } = useQuery({
    queryKey: ["public-settings"],
    queryFn: () => fetchSettings(),
    initialData: settings ? { settings } : undefined,
    staleTime: 30_000,
  });

  const hero: HeroSettings = {
    ...HERO_FALLBACK,
    ...((data?.settings?.hero as HeroSettings | undefined) ?? {}),
  };

  const displayBanner = hero.banner_url || "";

  return (
    <section
      id="hero"
      className="relative min-h-[90vh] lg:min-h-screen flex items-center pt-28 pb-16 lg:pt-36 lg:pb-24 relative overflow-hidden bg-[#000000]"
    >
      {/* Deep luxury backings and atmospheric glow vectors */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-32 h-[80vmin] w-[80vmin] glow-gold opacity-[0.02]" />
        <div className="absolute top-1/3 -right-32 h-[80vmin] w-[80vmin] glow-gold opacity-[0.02]" />
        <div className="absolute left-1/3 top-1/2 h-[75vmin] w-[75vmin] glow-gold opacity-[0.05]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 items-center gap-16 lg:grid-cols-12 lg:gap-16 px-6 md:px-10 relative z-10">
        
        {/* LEFT — Cinematic Copy & CTAs */}
        <div className="relative z-10 lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
          
          {/* CURATED EMBEDDED SCROLL TARGETS */}
          <span className="text-[10px] font-mono tracking-[0.35em] text-[#E5D5C0] block font-bold mb-6">
            {hero.eyebrow}
          </span>
          
          <h1 className="font-display font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight uppercase leading-[0.9] text-white">
            {hero.title?.split(" ").slice(0, -1).join(" ")}{" "}
            <span className="text-stroke font-black block sm:inline">
              {hero.title?.split(" ").slice(-1)[0]}
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.9 }}
            className="mt-14 lg:mt-16 max-w-3xl text-lg md:text-xl lg:text-2xl font-light tracking-wide text-zinc-200 leading-relaxed text-left pl-0"
          >
            {hero.subtitle}
          </motion.p>



          {/* Dual Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.9 }}
            className="mt-14 lg:mt-16 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5 w-full sm:w-auto"
          >
            {/* Primary Submit Button */}
            <TransitionLink
              to="/about-1017"
              className="relative w-full sm:w-auto overflow-hidden inline-flex items-center justify-center bg-[#E5D5C0] hover:bg-[#F1E5D1] text-black px-10 py-4.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] transition-all duration-500 hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_12px_30px_rgba(229,213,192,0.12)] rounded-[32px] text-center border border-[#E5D5C0]/20"
            >
              SUBMIT YOUR SOUND
            </TransitionLink>

            {/* Secondary VIEW ROSTER Button */}
            <a
              href="#artists"
              className="w-full sm:w-auto text-center inline-flex items-center justify-center border border-white/10 hover:border-[#E5D5C0]/40 bg-transparent hover:bg-white/[0.02] text-white hover:text-[#E5D5C0] px-10 py-4.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] transition-all duration-500 hover:scale-[1.01] active:scale-[0.99] rounded-[32px]"
            >
              VIEW ROSTER
            </a>
          </motion.div>
        </div>

        {/* RIGHT — Curated Frameless Logo Emblem centerpiece (Optimized Isolated Re-renders) */}
        <div className="relative lg:col-span-5 w-full flex flex-col items-center justify-center min-h-[350px] lg:min-h-[500px]">
          <LogoEmblem displayBanner={displayBanner} title={hero.title ?? "1017 Records Headquarters Logo"} />
        </div>

      </div>
    </section>
  );
}

// Sub-component to completely isolate 3D hover updates from parent elements
function LogoEmblem({ displayBanner, title }: { displayBanner: string; title: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");
    setIsMobile(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  // Preload centerpiece image natively using React 19 hook during render phase
  if (displayBanner) {
    preload(displayBanner, { as: "image" });
  }

  // Sync complete state when banner changes
  useEffect(() => {
    if (imgRef.current) {
      if (imgRef.current.complete) {
        setLogoLoaded(true);
      } else {
        setLogoLoaded(false);
      }
    }
  }, [displayBanner]);

  // Callback ref is executed as soon as the img element is mounted
  const refCallback = (node: HTMLImageElement | null) => {
    // @ts-ignore
    imgRef.current = node;
    if (node && node.complete) {
      setLogoLoaded(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) return;
    if (isMobile) return;
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotateX(-y / (rect.height / 6));
    setRotateY(x / (rect.width / 6));
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.25, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: (displayBanner && logoLoaded && !isMobile)
          ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.01)`
          : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
        transition: (displayBanner && logoLoaded && !isMobile) ? "transform 0.15s ease-out" : "transform 0.5s ease",
        transformStyle: "preserve-3d",
      }}
      className="relative w-full max-w-[380px] lg:max-w-[440px] flex items-center justify-center select-none cursor-pointer group"
    >
      {/* Soft gold radial glow backing that blooms on hover behind the frameless emblem */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#E5D5C0]/4 rounded-full blur-[40px] pointer-events-none group-hover:bg-[#E5D5C0]/8 transition-all duration-700" />

      {/* Layered luxury ambient particles - highly subtle for clean premium feel */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[15%] left-[20%] w-1.5 h-1.5 rounded-full bg-[#E5D5C0]/85 animate-pulse duration-[3000ms]" style={{ animationDelay: '0ms' }} />
        <div className="absolute top-[80%] left-[15%] w-1.5 h-1.5 rounded-full bg-[#E5D5C0]/65 animate-pulse duration-[4000ms]" style={{ animationDelay: '1200ms' }} />
        <div className="absolute top-[25%] right-[25%] w-1.5 h-1.5 rounded-full bg-[#E5D5C0]/90 animate-pulse duration-[3500ms]" style={{ animationDelay: '600ms' }} />
        <div className="absolute top-[70%] right-[20%] w-2 h-2 rounded-full bg-[#E5D5C0]/55 animate-pulse duration-[4500ms]" style={{ animationDelay: '1800ms' }} />
        <div className="absolute bottom-[35%] left-[40%] w-1.5 h-1.5 rounded-full bg-[#E5D5C0]/75 animate-pulse duration-[2800ms]" style={{ animationDelay: '900ms' }} />
        <div className="absolute top-[45%] right-[15%] w-1.5 h-1.5 rounded-full bg-[#E5D5C0]/45 animate-pulse duration-[3000ms]" style={{ animationDelay: '300ms' }} />
      </div>

      {displayBanner ? (
        <>
          {/* Shimmer skeleton for smooth loading transition */}
          {!logoLoaded && (
            <div className="absolute inset-0 m-auto w-48 h-48 bg-gradient-to-r from-white/[0.01] via-white/[0.05] to-white/[0.01] bg-[length:200%_100%] animate-shimmer pointer-events-none rounded-full" />
          )}

          {/* Main Centerpiece Logo - Completely frameless, transparent background */}
          <img
            ref={refCallback}
            src={displayBanner}
            alt={title}
            onLoad={() => setLogoLoaded(true)}
            loading="eager"
            // @ts-ignore
            fetchpriority="high"
            className={`w-full max-w-[85%] h-auto object-contain transition-all duration-700 ease-out group-hover:scale-[1.04] drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] drop-shadow-[0_0_10px_rgba(229,213,192,0.08)] group-hover:drop-shadow-[0_8px_20px_rgba(0,0,0,0.9)] group-hover:drop-shadow-[0_0_15px_rgba(229,213,192,0.12)] ${
              logoLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{
              imageRendering: "auto",
              transform: `translateZ(30px)`, // creates a premium 3D parallax pop-out effect
            }}
          />
        </>
      ) : (
        <div 
          className="relative w-full max-w-[85%] aspect-square flex flex-col items-center justify-center border border-[#E5D5C0]/25 rounded-full bg-gradient-to-br from-black/60 to-white/[0.01] shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-md transition-all duration-500 hover:border-[#E5D5C0]/40 group-hover:scale-[1.02]"
          style={{ transform: `translateZ(30px)` }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-[#E5D5C0]/5 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
          <span className="font-display font-black text-5xl sm:text-6xl md:text-7xl tracking-[0.2em] text-gradient-gold select-none animate-pulse mr-[-0.2em]">
            1017
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-[#E5D5C0]/60 mt-5">
            Headquarters Portal
          </span>
        </div>
      )}
    </motion.div>
  );
}
