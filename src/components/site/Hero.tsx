import { motion } from "motion/react";
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPublicSettings } from "@/lib/cms.functions";
import { Link } from "@tanstack/react-router";
import { TransitionLink } from "@/components/ui/PageTransition";
import { preload } from "react-dom";
import fallbackBanner from "@/assets/showcase.jpg";

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
  title: "A New Era of Sound",
  subtitle: "Where Culture, Talent And Legacy Converge.",
  banner_url: "",
};

export function Hero() {
  const fetchSettings = useServerFn(getPublicSettings);
  
  const { data } = useQuery({
    queryKey: ["public-settings"],
    queryFn: () => fetchSettings(),
    staleTime: 30_000,
  });

  const hero: HeroSettings = {
    ...HERO_FALLBACK,
    ...((data?.settings?.hero as HeroSettings | undefined) ?? {}),
  };

  const displayBanner = hero.banner_url || fallbackBanner;

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

          {/* Curated stats indicators - luxury music layout */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.9 }}
            className="mt-8 grid grid-cols-3 gap-6 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500 border-t border-b border-white/5 py-4 w-full max-w-xl text-left bg-transparent rounded-none backdrop-blur-none"
          >
            <div>
              <span className="block text-zinc-600 mb-1 font-bold">ROSTER</span>
              <span className="text-white font-semibold">1017 ALUMNI</span>
            </div>
            <div>
              <span className="block text-zinc-600 mb-1 font-bold">NETWORKS</span>
              <span className="text-white font-semibold">GLOBAL DSPs</span>
            </div>
            <div>
              <span className="block text-zinc-600 mb-1 font-bold">A&R STATUS</span>
              <span className="text-white font-semibold flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                ACTIVE QUEUE
              </span>
            </div>
          </motion.div>

          {/* Dual Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.9 }}
            className="mt-14 lg:mt-16 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5 w-full sm:w-auto"
          >
            {/* Primary APPLY FOR REVIEW Button */}
            <TransitionLink
              to="/about-1017"
              className="relative w-full sm:w-auto overflow-hidden inline-flex items-center justify-center bg-[#E5D5C0] hover:bg-[#F1E5D1] text-black px-10 py-4.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] transition-all duration-500 hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_12px_30px_rgba(229,213,192,0.12)] rounded-[32px] text-center border border-[#E5D5C0]/20"
            >
              APPLY FOR REVIEW
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

  // Preload centerpiece image natively using React 19 hook during render phase
  preload(displayBanner, { as: "image" });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotateX(-y / (rect.height / 15));
    setRotateY(x / (rect.width / 15));
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
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${logoLoaded ? 1.03 : 1}, ${logoLoaded ? 1.03 : 1}, 1.01)`,
        transition: "transform 0.15s ease-out",
        transformStyle: "preserve-3d",
      }}
      className="relative w-full max-w-[380px] lg:max-w-[440px] flex items-center justify-center select-none cursor-pointer group"
    >
      {/* Soft gold radial glow backing that blooms on hover behind the frameless emblem */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#E5D5C0]/4 rounded-full blur-[40px] pointer-events-none group-hover:bg-[#E5D5C0]/8 transition-all duration-700" />

      {/* Layered luxury ambient particles - highly subtle for clean premium feel */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[15%] left-[20%] w-1.5 h-1.5 rounded-full bg-[#E5D5C0]/85 animate-pulse duration-[3000ms]" style={{ animationDelay: '0ms' }} />
        <div className="absolute top-[80%] left-[15%] w-1 h-1 rounded-full bg-[#E5D5C0]/65 animate-pulse duration-[4000ms]" style={{ animationDelay: '1200ms' }} />
        <div className="absolute top-[25%] right-[25%] w-1.5 h-1.5 rounded-full bg-[#E5D5C0]/90 animate-pulse duration-[3500ms]" style={{ animationDelay: '600ms' }} />
        <div className="absolute top-[70%] right-[20%] w-2 h-2 rounded-full bg-[#E5D5C0]/55 animate-pulse duration-[4500ms]" style={{ animationDelay: '1800ms' }} />
        <div className="absolute bottom-[35%] left-[40%] w-1 h-1 rounded-full bg-[#E5D5C0]/75 animate-pulse duration-[2800ms]" style={{ animationDelay: '900ms' }} />
        <div className="absolute top-[45%] right-[15%] w-1.5 h-1.5 rounded-full bg-[#E5D5C0]/45 animate-pulse duration-[3000ms]" style={{ animationDelay: '300ms' }} />
      </div>

      {/* Shimmer skeleton for smooth loading transition */}
      {!logoLoaded && (
        <div className="absolute inset-0 m-auto w-48 h-48 bg-gradient-to-r from-white/[0.01] via-white/[0.05] to-white/[0.01] bg-[length:200%_100%] animate-shimmer pointer-events-none rounded-full" />
      )}

      {/* Main Centerpiece Logo - Completely frameless, transparent background */}
      <img
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
    </motion.div>
  );
}
