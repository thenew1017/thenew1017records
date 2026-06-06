import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { ArrowLeft, Check, Sparkles, Music2, Activity, Award, TrendingUp, Compass, Users, Flame, Camera, Play, Radio, ShieldCheck, Globe, ArrowRight } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { submitArtistApplication, getPublicFounderSpotlight } from "@/lib/cms.functions";
import { PremiumImage } from "@/components/ui/PremiumImage";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/useIsMobile";

export const Route = createFileRoute("/about-1017")({
  component: AboutPage,
  errorComponent: AboutErrorComponent,
  pendingComponent: AboutPendingComponent,
  loader: async () => {
    try {
      console.log("📥 [Founder Loader] Fetching founder spotlight directly from Supabase...");
      const { data } = await getPublicFounderSpotlight();
      if (!data) {
        throw new Error("No founder spotlight data returned from Supabase");
      }
      if (!data.founder_image_url) {
        console.error("❌ [Founder Loader Warning] Image URL is missing in the retrieved founder spotlight object:", data);
      } else {
        console.log("✅ [Founder Loader Success] Successfully loaded founder spotlight image URL:", data.founder_image_url);
      }
      return { spotlight: data };
    } catch (err: any) {
      console.error("❌ [Founder Loader Error] Failed to fetch founder spotlight from Supabase:", err?.message || err);
      return { spotlight: null, error: err?.message || String(err) };
    }
  },
  head: () => ({
    meta: [
      { name: "description", content: "Submit your sound to the elite artist recruitment portal overseen by Gucci Mane's 1017 Records network." },
      { property: "og:title", content: "Artist Recruitment Portal — The New 1017 Records" },
      { property: "og:description", content: "Join the talent pipeline responsible for launching independent creators into global recognition." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/about-1017" },
    ],
    links: [
      {
        rel: "preload",
        href: "https://vveslmalxlprmlfcdjae.supabase.co/storage/v1/object/public/media/founder/spotlight-1780301297380.jpg",
        as: "image",
        // @ts-ignore
        fetchpriority: "high"
      }
    ],
  }),
});

function AboutErrorComponent({ error }: { error: any }) {
  console.error("Recruitment Page SSR/Render Error caught by boundary:", error);
  return (
    <main className="relative min-h-screen bg-[#000000] text-foreground grain-overlay overflow-x-hidden w-full max-w-full flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.04),transparent_50%)]" />
      <span className="h-12 w-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-lg border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)] font-bold">
        ⚠
      </span>
      <h1 className="font-display text-4xl uppercase tracking-wider text-gradient-gold">Portal Security Active</h1>
      <p className="text-sm text-muted-foreground max-w-md leading-relaxed font-light">
        A system anomaly was intercepted. The secure recruitment portal has activated safe-mode fallbacks to prevent page failure.
      </p>
      <Link to="/" className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-5 py-2.5 text-[10px] font-mono uppercase tracking-[0.2em] hover:border-[#E5D5C0] hover:text-[#E5D5C0] rounded-full transition-all duration-300">
        ← Return to Main Portal
      </Link>
    </main>
  );
}

function AboutPendingComponent() {
  return (
    <main className="relative min-h-screen bg-[#000000] text-foreground grain-overlay overflow-x-hidden w-full max-w-full flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.02),transparent_50%)]" />
      <div className="space-y-4">
        <div className="h-6 w-6 border-2 border-[#E5D5C0] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#E5D5C0] animate-pulse">Initializing Recruitment Portal...</p>
      </div>
    </main>
  );
}

const pressLogos = [
  { name: "Billboard", desc: "Recruitment Coverage" },
  { name: "Complex", desc: "Incubator Spotlights" },
  { name: "XXL Magazine", desc: "Roster Placements" },
  { name: "Rolling Stone", desc: "Sound Waves Curation" },
  { name: "The Fader", desc: "Independent Crossover" }
];

const timelineEvents = [
  { year: "2007", title: "Roster Origin", desc: "Gucci Mane founded So Icey Entertainment to catalog southern trap." },
  { year: "2010", title: "Mainstream Dominance", desc: "Charted multiple Billboard gold-certified trap anthems." },
  { year: "2020", title: "The New 1017 Era", desc: "Revamped the recruitment pipeline for streaming markets." },
  { year: "Present", title: "Global Sound Pipeline", desc: "Mentoring and positioning independent creators worldwide." }
];

const processSteps = [
  { number: "Step 01", title: "Dossier Submission", desc: "Transmit your creative credentials, catalog links, and identity package.", icon: Music2 },
  { number: "Step 02", title: "Scouting Assessment", desc: "Initial review by our active A&R scout network.", icon: Activity },
  { number: "Step 03", title: "A&R Evaluation", desc: "Detailed listening queue audition and consistency review.", icon: Award },
  { number: "Step 04", title: "Executive Review", desc: "Consensus evaluation by label founders and director boards.", icon: TrendingUp },
  { number: "Step 05", title: "Roster Consideration", desc: "Final invitation offering for official contract mapping.", icon: Compass }
];

const valueProps = [
  { name: "1017 Heritage", desc: "Gain affiliation with Gucci Mane's legendary trap legacy, historic catalog strength, and cultural authority.", icon: Globe },
  { name: "Industry Integration", desc: "Direct path to elite multi-platinum writers, producers, and executive industry decision-makers.", icon: Users },
  { name: "Executive Mentorship", desc: "One-on-one strategic development blueprints and creative guidance from verified record executives.", icon: TrendingUp },
  { name: "Creative Curation", desc: "High-end studio access, premium tracking, expert mixing, and advanced artist development incubation.", icon: Music2 },
  { name: "Brand Identity Design", desc: "Elite visual styling, luxury brand alignment, custom apparel mappings, and campaign assets.", icon: Camera },
  { name: "Worldwide Distribution", desc: "Seamless major-channel publication vectors and first-priority global catalog deployment.", icon: Flame },
  { name: "Live Showcase Integration", desc: "First-priority consideration for active label concerts, tours, and global festival configurations.", icon: Play },
  { name: "Strategic Media Alliances", desc: "Dedicated editorial coverage and catalog spotlights across premium music magazines.", icon: Radio }
];

function AboutPage() {
  const loaderData = Route.useLoaderData();
  const fetchFounder = useServerFn(getPublicFounderSpotlight);
  
  const { data: spotlightQuery, isLoading, isError, error } = useQuery({
    queryKey: ["public-founder-spotlight"],
    queryFn: () => fetchFounder(),
    initialData: loaderData?.spotlight ? { data: loaderData.spotlight } : undefined,
    staleTime: 0, // Bypass caches to query directly from Supabase every time
  });

  const [activeSection, setActiveSection] = useState("");
  const [highlightPortal, setHighlightPortal] = useState(false);
  const [triggerFocus, setTriggerFocus] = useState(0);
  const [showSticky, setShowSticky] = useState(false);
  const isMobileDevice = useIsMobile();

  useEffect(() => {
    // 1. Intersection Observer for progress funnel
    const sections = ["gucci-legacy", "process", "benefits", "recruitment-portal"];
    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -55% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    // 2. Scroll event listener for sticky CTA
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowSticky(true);
      } else {
        setShowSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToPortal = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const el = document.getElementById("recruitment-portal");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setTriggerFocus(prev => prev + 1);
      setHighlightPortal(true);
      setTimeout(() => setHighlightPortal(false), 2000);
    }
  };

  const spotlight = spotlightQuery?.data || loaderData?.spotlight || {
    is_visible: true,
    founder_name: "Gucci Mane",
    founder_title: "1017 RECORDS FOUNDER // A&R CHIEF",
    founder_badge: "Verified Music Mogul",
    founder_description: "Gucci Mane is the visionary architect of modern trap music. By establishing 1017 Records, he built an elite talent incubator that pioneered soundwaves and launched global careers. With deep instinctual expertise, he continues to identify, sign, and launch independent artists onto the world stage, making the 1017 Records network the ultimate launchpad.",
    founder_image_url: "https://vveslmalxlprmlfcdjae.supabase.co/storage/v1/object/public/media/founder/spotlight-1780301297380.jpg",
    founder_image_alt: "Gucci Mane Founder Showcase",
    stat_1_value: "5B+",
    stat_1_label: "Streams Built",
    stat_2_value: "12+",
    stat_2_label: "Platinum Signings",
    stat_3_value: "150M+",
    stat_3_label: "Worldwide Fanbase"
  };

  // Perform robust error logging to console
  useEffect(() => {
    if (isError) {
      console.error("❌ [Founder Page Error] Failed to fetch founder spotlight from Supabase via query:", error);
    }
    if (spotlight && !spotlight.founder_image_url) {
      console.error("❌ [Founder Page Error] Founder image URL is empty/missing in the retrieved data:", spotlight);
    }
  }, [isError, error, spotlight]);

  // Prevent rendering if the image URL is not yet available and show proper loading state
  if (isLoading && !spotlight?.founder_image_url) {
    return <AboutPendingComponent />;
  }

  return (
    <main className="relative min-h-screen bg-[#000000] text-foreground grain-overlay overflow-x-hidden w-full max-w-full">
      <Nav />

      {/* Cyber Ambient Lighting Grid - Matte Black Refinement */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[#000000]" />
      </div>

      <div className="mx-auto max-w-[1600px] px-6 pt-32 pb-24 md:px-10 md:pt-40 lg:pb-32">
        
        {/* Back Link Breadcrumb */}
        <Link
          to="/"
          className="group inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground hover:text-[#E5D5C0] transition-colors mb-16 border border-white/5 bg-black/40 px-5 py-2.5 rounded-full backdrop-blur-md"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          ← Back to Home
        </Link>

        {/* SECTION 2: GUCCI MANE LEGACY (LUXURY EDITORIAL SHOWCASE) */}
        {spotlight.is_visible && (
          <div id="gucci-legacy" className="space-y-12 mb-28 scroll-mt-24">
            <div className="flex items-center gap-3">
              <span className="text-[#E5D5C0] font-mono text-sm">✦</span>
              <h2 className="font-display text-2xl uppercase tracking-wider text-white">
                Gucci Mane Legacy
              </h2>
            </div>
            
            {/* Luxury Editorial Showcase Box */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center bg-transparent relative overflow-hidden text-left py-12 border-t border-white/5 content-visibility-auto">
              
              {/* Premium Portrait Frame */}
              <div className={isMobileDevice ? "lg:col-span-5 w-full max-w-[420px] aspect-[3/4] overflow-hidden rounded-none border border-[#E5D5C0]/20 mx-auto lg:mx-0 group flex items-center justify-center relative bg-[#000000]" : "lg:col-span-5 w-full max-w-[420px] aspect-[3/4] overflow-hidden rounded-none border border-[#E5D5C0]/20 mx-auto lg:mx-0 group flex items-center justify-center relative bg-[#000000] artist-photo-container"}>
                {spotlight.founder_image_url ? (
                  <div className="relative w-full h-full overflow-hidden border border-white/5">
                    <PremiumImage
                      src={spotlight.founder_image_url}
                      alt={spotlight.founder_image_alt || spotlight.founder_name}
                      aspectRatioClass="aspect-[3/4]"
                      loading="eager"
                      decoding="async"
                      fetchPriority="high"
                      className={isMobileDevice ? "artist-photo-image" : "transition-transform duration-700 ease-out transform-gpu group-hover:scale-103"}
                      style={{
                        filter: "contrast(1.05) saturate(1.04) brightness(0.98)",
                      }}
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E5D5C0]/[0.03] to-transparent -translate-x-full animate-shimmer pointer-events-none" />
                    <Users className="w-16 h-16 text-zinc-700 animate-pulse" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-[#E5D5C0]/50 mt-5 leading-none select-none">EXECUTIVE PORTRAIT SIGNATURE</span>
                  </div>
                )}
              </div>

              {/* Biography & Achievements Editorial Description */}
              <div className="lg:col-span-7 flex flex-col justify-between h-full py-2 space-y-10">
                <div className="space-y-8">
                  {/* Premium verified badge & title */}
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#E5D5C0] font-bold">
                      {spotlight.founder_title || "1017 RECORDS FOUNDER"}
                    </span>
                    {spotlight.founder_badge && (
                      <span className="inline-flex items-center gap-2 border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-300 backdrop-blur-md">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#E5D5C0] shadow-[0_0_8px_rgba(229,213,192,0.6)]" />
                        {spotlight.founder_badge}
                      </span>
                    )}
                  </div>

                  {/* Founder Name */}
                  <h3 className="font-display text-5xl sm:text-6xl lg:text-7xl uppercase font-black tracking-tight text-white leading-[0.9]">
                    {spotlight.founder_name}
                  </h3>

                  {/* Biography Description */}
                  <p className="text-zinc-300 text-sm sm:text-base leading-relaxed tracking-wide font-light border-l-2 border-[#E5D5C0]/20 pl-6 whitespace-pre-line">
                    {spotlight.founder_description}
                  </p>
                </div>

                {/* Chronology Timeline milestones block */}
                <div className="space-y-6 pt-4 border-t border-white/[0.06]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500 font-mono">CHRONOLOGICAL MILESTONES</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {timelineEvents.map((ev, index) => (
                      <div key={index} className="space-y-1.5 text-left border-l border-white/10 pl-3">
                        <span className="block text-[15px] font-bold text-[#E5D5C0] font-mono leading-none">{ev.year}</span>
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-white">{ev.title}</span>
                        <span className="block text-[10px] text-zinc-400 leading-relaxed font-light">{ev.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flat A&R Review CTA Button */}
                <div className="pt-2">
                  <button
                    onClick={scrollToPortal}
                    className="group inline-flex items-center gap-2.5 border border-[#E5D5C0]/20 bg-[#E5D5C0]/5 text-[#E5D5C0] hover:text-white px-8 py-3.5 text-[9px] font-bold uppercase tracking-[0.25em] transition-all duration-300 rounded-full hover:border-[#E5D5C0]/50 cursor-pointer"
                  >
                    APPLY FOR REVIEW
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>

                {/* Editorial Achievements Stats */}
                <div className="grid grid-cols-3 gap-8 border-t border-white/[0.06] pt-8 font-mono text-[9px] uppercase tracking-widest text-zinc-400">
                  <div className="space-y-2">
                    <span className="block text-white font-sans font-extrabold text-2xl sm:text-3xl tracking-tight leading-none">{spotlight.stat_1_value}</span>
                    <span className="text-zinc-500 font-semibold block">{spotlight.stat_1_label}</span>
                  </div>
                  <div className="space-y-2">
                    <span className="block text-white font-sans font-extrabold text-2xl sm:text-3xl tracking-tight leading-none">{spotlight.stat_2_value}</span>
                    <span className="text-zinc-500 font-semibold block">{spotlight.stat_2_label}</span>
                  </div>
                  <div className="space-y-2">
                    <span className="block text-white font-sans font-extrabold text-2xl sm:text-3xl tracking-tight leading-none">{spotlight.stat_3_value}</span>
                    <span className="text-zinc-500 font-semibold block">{spotlight.stat_3_label}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: HOW THE PROCESS WORKS (5-STEP TIMELINE) */}
        <div id="process" className="space-y-12 mb-28 scroll-mt-24">
          <div className="flex items-center gap-3">
            <span className="text-[#E5D5C0] font-mono text-sm">✦</span>
            <h2 className="font-display text-2xl uppercase tracking-wider text-white">
              How the Process Works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {processSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div 
                  key={idx} 
                  className="relative group flex flex-col justify-between gap-6 border-t border-white/5 pt-8 overflow-hidden text-left"
                >
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold tracking-widest text-[#E5D5C0]">{step.number}</span>
                    <Icon 
                      className="h-5 w-5 text-[#E5D5C0] stroke-[1.25] transition-transform duration-500 group-hover:scale-105" 
                    />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">{step.title}</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-light">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Flat A&R Review CTA Button */}
          <div className="flex justify-center pt-8">
            <button
              onClick={scrollToPortal}
              className="group inline-flex items-center gap-2.5 border border-[#E5D5C0]/20 bg-[#E5D5C0]/5 text-[#E5D5C0] hover:text-white px-8 py-3.5 text-[9px] font-bold uppercase tracking-[0.25em] transition-all duration-300 rounded-full hover:border-[#E5D5C0]/50 cursor-pointer"
            >
              INITIALIZE DOSSIER REGISTRATION
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* SECTION 5: WHY INDEPENDENT ARTISTS APPLY (PREMIUM EDITORIAL REFACTOR) */}
        <div id="benefits" className="space-y-16 mb-28 scroll-mt-24">
          <div className="flex items-center gap-3">
            <span className="text-[#E5D5C0] font-mono text-sm">✦</span>
            <h2 className="font-display text-2xl uppercase tracking-wider text-white">
              Why Apply to 1017 Records
            </h2>
          </div>
          <div className="w-full border-t border-white/[0.08]">
            {valueProps.map((val, idx) => (
              <div 
                key={idx} 
                className="group py-10 md:py-12 border-b border-white/[0.08] flex flex-col items-start justify-start w-full select-none"
              >
                <h3 className="font-display text-lg sm:text-xl md:text-2xl font-black text-white group-hover:text-[#D4AF37] transition-all duration-500 tracking-tight leading-none uppercase">
                  {val.name}
                </h3>
                <p className="font-sans text-xs sm:text-sm md:text-base font-light leading-relaxed text-zinc-400 mt-3.5 sm:mt-4 max-w-2xl">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Flat A&R Review CTA Button */}
          <div className="flex justify-start pt-10">
            <button
              onClick={scrollToPortal}
              className="group inline-flex items-center gap-2.5 border border-[#E5D5C0]/20 bg-[#E5D5C0]/5 text-[#E5D5C0] hover:text-white px-8 py-3.5 text-[9px] font-bold uppercase tracking-[0.25em] transition-all duration-300 rounded-full hover:border-[#E5D5C0]/50 cursor-pointer"
            >
              REQUEST A&R AUDITION
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* SECTION 6 & 7: ELITE APPLICATION PORTAL & TRUST SIGNALS */}
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-20 items-start">
          
          {/* LEFT: Trust Signals and A&R Information */}
          <div className="lg:col-span-5 space-y-14 text-left">
            
            {/* Selective A&R Information bulletin */}
            <div className="bg-transparent p-0 border-none shadow-none space-y-8">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-[#E5D5C0] rounded-full animate-pulse shadow-[0_0_8px_rgba(229,213,192,0.6)]" />
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#E5D5C0] font-mono">
                  A&R RECRUITMENT PARAMETERS
                </p>
              </div>
              <h3 className="font-display text-2xl uppercase tracking-tight text-white font-extrabold leading-tight">
                Highly Selective Roster Incubation
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                The New 1017 Records does not operate as a mass distribution label. We run an elite, high-value music incubation network that only offers official contracts to artists demonstrating immense creative discipline, exceptional sonic identity, and strong independent motivation.
              </p>
              <div className="border-t border-white/[0.06] pt-6 space-y-5 text-xs font-light text-zinc-400">
                <div className="flex items-start gap-3.5">
                  <span className="text-[#E5D5C0] font-mono text-[9px] mt-1">✦</span>
                  <span>**Real-time Listening Queue**: Every submitted audio link is queued and auditioned directly by our verified A&R scouting directors.</span>
                </div>
                <div className="flex items-start gap-3.5">
                  <span className="text-[#E5D5C0] font-mono text-[9px] mt-1">✦</span>
                  <span>**Strategic Brand Integration**: Successful roster entries unlock elite positioning, premium industry syndications, and high-fidelity video showcase configurations.</span>
                </div>
              </div>
            </div>
 
            {/* Social Proof Press Logos Section */}
            <div className="space-y-6 pt-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-zinc-500 font-mono">GLOBAL PRESS RECOGNITION</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 items-center border-t border-white/5 pt-8">
                {pressLogos.map((logo, index) => (
                  <div 
                    key={index}
                    className="flex flex-col items-center justify-center py-4 bg-transparent border-none transition-all duration-300 group cursor-default"
                  >
                    <span className="text-[11px] font-black uppercase text-zinc-500 group-hover:text-white transition-colors duration-300 font-sans tracking-widest">{logo.name}</span>
                    <span className="text-[7px] font-mono tracking-wider text-zinc-600 group-hover:text-[#E5D5C0] transition-colors mt-1 text-center leading-none">{logo.desc}</span>
                  </div>
                ))}
              </div>
            </div>
 
          </div>
 
          {/* RIGHT: Redesigned Selective Booking Portal */}
          <div id="recruitment-portal" className="lg:col-span-7 space-y-6 text-left scroll-mt-24">
            
            <div className={`bg-[#030303] border rounded-2xl p-10 sm:p-14 space-y-12 relative overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.9)] transition-all duration-[800ms] group/portal ${
              highlightPortal ? "border-[#E5D5C0] shadow-[0_0_40px_rgba(229,213,192,0.15)] scale-[1.005]" : "border-white/5"
            }`}>
              {/* Thin Premium Gold Border on Top Edge */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#E5D5C0]/25 to-transparent pointer-events-none z-20" />
              
              {/* Ultra-thin Premium Editorial Framing Corner Details */}
              <div className="absolute top-8 left-8 w-6 h-6 border-t border-l border-white/5 pointer-events-none group-hover/portal:border-[#E5D5C0]/10 transition-all duration-700" />
              <div className="absolute top-8 right-8 w-6 h-6 border-t border-r border-white/5 pointer-events-none group-hover/portal:border-[#E5D5C0]/10 transition-all duration-700" />
              <div className="absolute bottom-8 left-8 w-6 h-6 border-b border-l border-white/5 pointer-events-none group-hover/portal:border-[#E5D5C0]/10 transition-all duration-700" />
              <div className="absolute bottom-8 right-8 w-6 h-6 border-b border-r border-white/5 pointer-events-none group-hover/portal:border-[#E5D5C0]/10 transition-all duration-700" />
              
              {/* A&R Registry Status Bar */}
              <div className="space-y-8 relative z-10">
                <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#E5D5C0] block font-extrabold">
                  OFFICIAL A&R REGISTRY PORTAL
                </span>
                
                {/* Luxury Editorial Dossier Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-white/[0.06] relative z-10">
                  <div className="space-y-1">
                    <span className="block text-[8px] font-mono tracking-[0.25em] text-[#E5D5C0] uppercase font-extrabold">REGISTRY PORTAL SPECIFICATION</span>
                    <span className="text-white text-[11px] font-black uppercase tracking-[0.15em] font-sans">A&R RECORDING SYSTEM // RECRUITMENT v5.2</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-600 font-bold">ACCEPTANCE:</span>
                      <span className="text-[#E5D5C0] font-black">3.8% (EXCLUSIVE)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-600 font-bold">REVIEW STATUS:</span>
                      <span className="text-[#E5D5C0] font-black flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#E5D5C0]" />
                        ACCEPTING APPLICATIONS
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-600 font-bold">PRIVATE REVIEW:</span>
                      <span className="text-white font-extrabold">CONFIDENTIAL</span>
                    </div>
                  </div>
                </div>
  
                <div className="space-y-4 relative">
                  <h3 
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    className="text-5xl sm:text-6xl md:text-7xl uppercase text-white font-black tracking-wide leading-none text-center sm:text-left"
                  >
                    Artist Application Portal
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-light max-w-xl text-center sm:text-left border-t border-white/5 pt-4">
                    Submit your sonic credentials and music portfolio. Our priority listening queue directors will audit your sound.
                  </p>
                </div>
              </div>
  
              {/* Redesigned Selective Booking Form */}
              <BookingForm triggerFocus={triggerFocus} />
  
              {/* Application security notice */}
              <div className="border-t border-white/[0.06] pt-8 flex items-start gap-4 relative z-10">
                <ShieldCheck className="h-5 w-5 text-[#E5D5C0] shrink-0 mt-0.5" style={{ filter: "drop-shadow(0 0 4px rgba(229, 213, 192, 0.3))" }} />
                <div className="space-y-1.5 text-left">
                  <span className="block text-[8px] font-sans uppercase font-extrabold text-[#E5D5C0] tracking-[0.25em]">PRIVATE SYSTEM ENCRYPTION SHIELD</span>
                  <p className="text-[10px] text-zinc-400 leading-relaxed font-light">
                    All application details, Spotify catalog connections, and contact credentials are encrypted via end-to-end SSL layers. Access is restricted exclusively to active 1017 A&R administrators.
                  </p>
                </div>
              </div>
  
            </div>
  
          </div>
 
        </div>

      </div>

      {/* Floating Progress Funnel Indicator */}
      <div className="fixed right-10 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-8 font-mono text-[9px] uppercase tracking-[0.25em] z-50 text-right pr-6 border-r border-white/5">
        {[
          { id: "gucci-legacy", label: "Gucci Mane Legacy" },
          { id: "process", label: "Process" },
          { id: "benefits", label: "Benefits" },
          { id: "recruitment-portal", label: "Application Portal" },
        ].map((sec) => (
          <button
            key={sec.id}
            onClick={() => {
              const el = document.getElementById(sec.id);
              if (el) {
                el.scrollIntoView({ behavior: "smooth" });
                if (sec.id === "recruitment-portal") {
                  setTriggerFocus(prev => prev + 1);
                  setHighlightPortal(true);
                  setTimeout(() => setHighlightPortal(false), 2000);
                }
              }
            }}
            className="transition-colors duration-300 text-right flex items-center justify-end gap-3 group focus:outline-none cursor-pointer"
          >
            <span className={`transition-colors duration-300 ${
              activeSection === sec.id ? "text-[#E5D5C0] font-bold" : "text-zinc-600 group-hover:text-zinc-400"
            }`}>
              {sec.label}
            </span>
            <span className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
              activeSection === sec.id 
                ? "bg-[#E5D5C0] scale-125 shadow-[0_0_8px_rgba(229,213,192,0.6)]" 
                : "bg-zinc-700 group-hover:bg-zinc-500"
            }`} />
          </button>
        ))}
      </div>

      {/* Viewport-Sticky Conversion CTA (Option B) */}
      <AnimatePresence>
        {showSticky && activeSection !== "recruitment-portal" && (
          <motion.div
            initial={{ opacity: 0, y: 30, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 30, x: "-50%" }}
            transition={{ duration: 0.4 }}
            className="fixed bottom-8 left-1/2 z-50 pointer-events-auto"
          >
            <button
              onClick={scrollToPortal}
              className="bg-[#E5D5C0] hover:bg-[#F1E5D1] text-black border border-[#E5D5C0]/20 shadow-[0_20px_50px_rgba(0,0,0,0.9)] hover:scale-105 active:scale-95 transition-all duration-300 font-sans text-[10px] font-black uppercase tracking-[0.3em] px-8 py-3.5 rounded-full flex items-center gap-2 cursor-pointer"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" />
              APPLY FOR REVIEW
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}

function BookingForm({ triggerFocus = 0 }: { triggerFocus?: number }) {
  const submitFn = useServerFn(submitArtistApplication);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [artistName, setArtistName] = useState("");
  const [spotifyLink, setSpotifyLink] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (triggerFocus > 0) {
      setStep(1);
      setTimeout(() => {
        const firstInput = document.getElementById("candidate-name-input");
        if (firstInput) {
          (firstInput as HTMLInputElement).focus();
        }
      }, 850);
    }
  }, [triggerFocus]);

  // Premium expansion: file upload states
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoProgress, setPhotoProgress] = useState<number | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isPhotoDragOver, setIsPhotoDragOver] = useState(false);

  const [epkFile, setEpkFile] = useState<File | null>(null);
  const [epkProgress, setEpkProgress] = useState<number | null>(null);
  const [epkUrl, setEpkUrl] = useState<string | null>(null);
  const [isEpkDragOver, setIsEpkDragOver] = useState(false);

  // Multi-step states
  const [step, setStep] = useState(1);
  const [instagramLink, setInstagramLink] = useState("");
  const [twitterLink, setTwitterLink] = useState("");
  const [formError, setFormError] = useState("");

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const emailInvalid = touched.email && email.trim() !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const spotifyInvalid = touched.spotifyLink && spotifyLink.trim() !== "" && !/^https?:\/\//i.test(spotifyLink.trim());

  // Client-side image compressor using Canvas API
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          const MAX_SIZE = 1600;
          if (width > MAX_SIZE || height > MAX_SIZE) {
            if (width > height) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            } else {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(file);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                resolve(file);
              }
            },
            "image/jpeg",
            0.8
          );
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  // Storage Upload Handlers
  const handlePhotoUpload = async (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Please upload a valid image file (JPG, PNG, or WEBP).");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      alert("Photo file size exceeds the 3 MB limit.");
      return;
    }
    setPhotoFile(file);
    const localPreview = URL.createObjectURL(file);
    setPhotoPreview(localPreview);

    setPhotoProgress(10);
    const interval = setInterval(() => {
      setPhotoProgress((prev) => {
        if (prev === null) return 10;
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 200);

    try {
      // Compress the image before uploading to optimize storage footprint
      const compressedBlob = await compressImage(file);
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 12)}.jpg`;
      const filePath = `applications/${fileName}`;

      const { data, error } = await supabase.storage
        .from("artist-photos")
        .upload(filePath, compressedBlob, { contentType: "image/jpeg" });
        
      clearInterval(interval);

      if (error) {
        throw new Error(error.message);
      }

      setPhotoProgress(100);
      const { data: urlData } = supabase.storage.from("artist-photos").getPublicUrl(filePath);
      setPhotoUrl(urlData.publicUrl);
      setTimeout(() => setPhotoProgress(null), 800);
    } catch (err: any) {
      console.error("Storage upload error:", err.message);
      setPhotoProgress(null);
      setPhotoFile(null);
      setPhotoPreview(null);
      setPhotoUrl(null);
      alert(`Failed to upload photo to Supabase storage: ${err.message}. Please try again.`);
    }
  };

  const handleEpkUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Please upload a valid PDF document for your EPK.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("EPK file size exceeds the 10 MB limit.");
      return;
    }
    setEpkFile(file);

    setEpkProgress(10);
    const interval = setInterval(() => {
      setEpkProgress((prev) => {
        if (prev === null) return 10;
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 200);

    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 12)}.pdf`;
      const filePath = `applications/${fileName}`;

      const { data, error } = await supabase.storage
        .from("artist-portfolios")
        .upload(filePath, file, { contentType: "application/pdf" });
        
      clearInterval(interval);

      if (error) {
        throw new Error(error.message);
      }

      setEpkProgress(100);
      const { data: urlData } = supabase.storage.from("artist-portfolios").getPublicUrl(filePath);
      setEpkUrl(urlData.publicUrl);
      setTimeout(() => setEpkProgress(null), 800);
    } catch (err: any) {
      console.error("EPK upload error:", err.message);
      setEpkProgress(null);
      setEpkFile(null);
      setEpkUrl(null);
      alert(`Failed to upload EPK to Supabase storage: ${err.message}. Please try again.`);
    }
  };

  const handleContinue = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setFormError("");

    if (step === 1) {
      const newTouched = { ...touched, name: true, email: true, artistName: true };
      setTouched(newTouched);
      if (!name.trim()) {
        setFormError("Full Name is required to initialize your candidate dossier.");
        return;
      }
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setFormError("A valid communication channel / email address is required.");
        return;
      }
      if (!artistName.trim()) {
        setFormError("Stage Name / Creative Alias is required.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setTouched(prev => ({ ...prev, spotifyLink: true }));
      if (spotifyLink.trim() && !/^https?:\/\//i.test(spotifyLink.trim())) {
        setFormError("Spotify URL signature must start with http:// or https://");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (photoProgress !== null) {
        setFormError("Please wait for your press photo portrait transmission to complete.");
        return;
      }
      if (epkProgress !== null) {
        setFormError("Please wait for your EPK document transmission to complete.");
        return;
      }
      if (!photoUrl) {
        setFormError("A high-resolution Press Photo is required for roster credentials.");
        return;
      }
      setStep(4);
    }
  };

  const handlePrevious = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setFormError("");
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setFormError("");
    try {
      if (!name.trim() || !email.trim() || !artistName.trim()) {
        throw new Error("Required fields Name, Email, and Artist Alias cannot be empty.");
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        throw new Error("Invalid email format. Please enter a valid email address.");
      }

      if (spotifyLink.trim() && !/^https?:\/\//i.test(spotifyLink.trim())) {
        throw new Error("Invalid Spotify URL format. Link must begin with http:// or https://");
      }

      if (!photoUrl) {
        throw new Error("A high-resolution Press Photo is required for roster credentials.");
      }

      const socialInfo: string[] = [];
      if (instagramLink.trim()) {
        socialInfo.push(`Instagram: ${instagramLink.trim()}`);
      }
      if (twitterLink.trim()) {
        socialInfo.push(`Twitter: ${twitterLink.trim()}`);
      }

      let finalCampaignDetails = message.trim();
      if (socialInfo.length > 0) {
        const socialBlock = `\n--- SOCIAL CHANNELS ---\n${socialInfo.join("\n")}`;
        finalCampaignDetails = finalCampaignDetails ? `${finalCampaignDetails}\n${socialBlock}` : socialBlock;
      }

      await submitFn({
        data: {
          fullName: name,
          email: email,
          artistName: artistName,
          spotifyLink: spotifyLink.trim() || null,
          campaignDetails: finalCampaignDetails || null,
          artistPhotoUrl: photoUrl || null,
          epkUrl: epkUrl || null,
        }
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred during submission. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="border border-[#E5D5C0]/20 bg-[#080808] p-10 rounded-[24px] text-center space-y-6 relative overflow-hidden shadow-2xl"
      >
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#E5D5C0]/30 to-transparent" />
        
        <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#E5D5C0]/10 text-[#E5D5C0] text-lg animate-pulse border border-[#E5D5C0]/30 shadow-md">
          ✓
        </span>
        <h4 className="text-[11px] font-sans font-extrabold uppercase tracking-[0.3em] text-[#E5D5C0]">
          TRANSMISSION SECURED
        </h4>
        <p className="text-[10px] text-zinc-300 leading-relaxed uppercase tracking-[0.15em] font-light max-w-md mx-auto">
          Your artist application has successfully entered the A&R priority queue. We will review your sound vector coordinates and contact you directly via your verified secure channel.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Dynamic Champagne-Gold Progress Indicator */}
      <div className="space-y-4 pb-6 border-b border-white/5 relative z-10 text-left">
        <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.25em] text-[#E5D5C0] font-bold">
          <span>
            {step === 1 && "Step 01 / Identity Package"}
            {step === 2 && "Step 02 / Catalog & Channels"}
            {step === 3 && "Step 03 / Creative Assets"}
            {step === 4 && "Step 04 / Dossier Submission"}
          </span>
          <span className="text-zinc-500 font-extrabold">{step} / 4</span>
        </div>
        
        {/* Progress Track */}
        <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden relative">
          <motion.div
            className="h-full bg-gradient-to-r from-[#E5D5C0]/60 via-[#E5D5C0] to-[#F1E5D1]"
            initial={{ width: "25%" }}
            animate={{ width: `${step * 25}%` }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          />
        </div>
      </div>

      {(errorMsg || formError) && (
        <div className="border border-red-500/30 bg-red-500/5 p-4 rounded-xl text-[10px] text-red-400 font-mono uppercase tracking-wider relative overflow-hidden text-left animate-fadeIn">
          <div className="absolute inset-y-0 left-0 w-[3px] bg-red-500" />
          ⚡ ERROR: {errorMsg || formError}
        </div>
      )}
      
      <div className="relative min-h-[160px] flex flex-col justify-start">
        {/* STEP 1: Artist Identity */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-8 text-left"
          >
            {/* Name input */}
            <div className="group block space-y-3">
              <span className="text-[10px] font-sans uppercase font-extrabold text-zinc-400 group-hover:text-zinc-300 group-focus-within:text-[#E5D5C0]/90 tracking-[0.25em] block transition-colors duration-300">
                Candidate Identity / Full Name *
              </span>
              <input
                required
                id="candidate-name-input"
                value={name}
                onChange={(e) => { setName(e.target.value); setFormError(""); }}
                onBlur={() => handleBlur("name")}
                className="w-full bg-transparent border-b border-white/10 hover:border-white/30 focus:border-[#E5D5C0] rounded-none px-0 py-3 text-base text-white placeholder:text-zinc-700 placeholder:font-light focus:bg-transparent transition-all duration-300 font-sans outline-none focus:ring-0 tracking-widest"
                placeholder="Enter your legal full name"
              />
              {touched.name && !name.trim() && (
                <span className="block text-[8px] font-mono text-red-400 uppercase tracking-widest pt-1 animate-fadeIn">Required parameter missing</span>
              )}
            </div>

            {/* Email input */}
            <div className="group block space-y-3">
              <span className="text-[10px] font-sans uppercase font-extrabold text-zinc-400 group-hover:text-zinc-300 group-focus-within:text-[#E5D5C0]/90 tracking-[0.25em] block transition-colors duration-300">
                Verified Communication Channel / Email *
              </span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFormError(""); }}
                onBlur={() => handleBlur("email")}
                className={`w-full bg-transparent border-b ${emailInvalid ? "border-red-500/50" : "border-white/10 hover:border-white/30"} focus:border-[#E5D5C0] rounded-none px-0 py-3 text-base text-white placeholder:text-zinc-700 placeholder:font-light focus:bg-transparent transition-all duration-300 font-sans outline-none focus:ring-0 tracking-widest`}
                placeholder="name@example.com"
              />
              {touched.email && !email.trim() && (
                <span className="block text-[8px] font-mono text-red-400 uppercase tracking-widest pt-1 animate-fadeIn">Required parameter missing</span>
              )}
              {emailInvalid && (
                <span className="block text-[8px] font-mono text-red-400 uppercase tracking-widest pt-1 animate-fadeIn">Invalid dossier syntax</span>
              )}
            </div>

            {/* Artist Alias input */}
            <div className="group block space-y-3">
              <span className="text-[10px] font-sans uppercase font-extrabold text-zinc-400 group-hover:text-zinc-300 group-focus-within:text-[#E5D5C0]/90 tracking-[0.25em] block transition-colors duration-300">
                Creative Alias / Stage Name *
              </span>
              <input
                required
                value={artistName}
                onChange={(e) => { setArtistName(e.target.value); setFormError(""); }}
                onBlur={() => handleBlur("artistName")}
                className="w-full bg-transparent border-b border-white/10 hover:border-white/30 focus:border-[#E5D5C0] rounded-none px-0 py-3 text-base text-white placeholder:text-zinc-700 placeholder:font-light focus:bg-transparent transition-all duration-300 font-sans outline-none focus:ring-0 tracking-widest"
                placeholder="Artist or band name"
              />
              {touched.artistName && !artistName.trim() && (
                <span className="block text-[8px] font-mono text-red-400 uppercase tracking-widest pt-1 animate-fadeIn">Required parameter missing</span>
              )}
            </div>
          </motion.div>
        )}

        {/* STEP 2: Music Information */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-8 text-left"
          >
            {/* Spotify link input */}
            <div className="group block space-y-3">
              <span className="text-[10px] font-sans uppercase font-extrabold text-zinc-400 group-hover:text-zinc-300 group-focus-within:text-[#E5D5C0]/90 tracking-[0.25em] block transition-colors duration-300">
                Primary Catalog Connection / Spotify Link
              </span>
              <input
                type="url"
                value={spotifyLink}
                onChange={(e) => { setSpotifyLink(e.target.value); setFormError(""); }}
                onBlur={() => handleBlur("spotifyLink")}
                className={`w-full bg-transparent border-b ${spotifyInvalid ? "border-red-500/50" : "border-white/10 hover:border-white/30"} focus:border-[#E5D5C0] rounded-none px-0 py-3 text-base text-white placeholder:text-zinc-700 placeholder:font-light focus:bg-transparent transition-all duration-300 font-sans outline-none focus:ring-0 tracking-widest`}
                placeholder="https://open.spotify.com/artist/..."
              />
              {spotifyInvalid && (
                <span className="block text-[8px] font-mono text-red-400 uppercase tracking-widest pt-1 animate-fadeIn">Link signature must start with http:// or https://</span>
              )}
            </div>

            {/* Instagram connection input */}
            <div className="group block space-y-3">
              <span className="text-[10px] font-sans uppercase font-extrabold text-zinc-400 group-hover:text-zinc-300 group-focus-within:text-[#E5D5C0]/90 tracking-[0.25em] block transition-colors duration-300">
                Social Credentials / Instagram
              </span>
              <input
                type="text"
                value={instagramLink}
                onChange={(e) => { setInstagramLink(e.target.value); setFormError(""); }}
                className="w-full bg-transparent border-b border-white/10 hover:border-white/30 focus:border-[#E5D5C0] rounded-none px-0 py-3 text-base text-white placeholder:text-zinc-700 placeholder:font-light focus:bg-transparent transition-all duration-300 font-sans outline-none focus:ring-0 tracking-widest"
                placeholder="@username or profile link"
              />
            </div>

            {/* Twitter connection input */}
            <div className="group block space-y-3">
              <span className="text-[10px] font-sans uppercase font-extrabold text-zinc-400 group-hover:text-zinc-300 group-focus-within:text-[#E5D5C0]/90 tracking-[0.25em] block transition-colors duration-300">
                Social Credentials / Twitter
              </span>
              <input
                type="text"
                value={twitterLink}
                onChange={(e) => { setTwitterLink(e.target.value); setFormError(""); }}
                className="w-full bg-transparent border-b border-white/10 hover:border-white/30 focus:border-[#E5D5C0] rounded-none px-0 py-3 text-base text-white placeholder:text-zinc-700 placeholder:font-light focus:bg-transparent transition-all duration-300 font-sans outline-none focus:ring-0 tracking-widest"
                placeholder="@username or profile link"
              />
            </div>

            {/* Dossier brief textarea */}
            <div className="group block space-y-3">
              <span className="text-[10px] font-sans uppercase font-extrabold text-zinc-400 group-hover:text-zinc-300 group-focus-within:text-[#E5D5C0]/90 tracking-[0.25em] block transition-colors duration-300">
                Artist Dossier Brief / Campaign Details
              </span>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-transparent border-b border-white/10 hover:border-white/30 focus:border-[#E5D5C0] rounded-none px-0 py-3 text-base text-white placeholder:text-zinc-700 placeholder:font-light focus:bg-transparent transition-all duration-300 font-sans outline-none focus:ring-0 resize-none tracking-wide"
                placeholder="Tell us about your background, sound, style, achievements, and release goals..."
              />
            </div>
          </motion.div>
        )}

        {/* STEP 3: Artist Package */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-8 text-left"
          >
            <div className="space-y-6">
              <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#E5D5C0] block font-extrabold">
                ARTIST IDENTITY PACKAGE
              </span>
      
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* FEATURE 01: ARTIST PRESS PHOTO */}
                <div className="space-y-4">
                  <span className="text-[10px] font-sans uppercase font-extrabold text-zinc-500 tracking-[0.25em]">ARTIST PRESS PHOTO *</span>
                  
                  {!photoPreview ? (
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsPhotoDragOver(true); }}
                      onDragLeave={() => setIsPhotoDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsPhotoDragOver(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handlePhotoUpload(file);
                      }}
                      className="relative border border-white/5 bg-black hover:border-white/25 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 group shadow-md min-h-[160px]"
                    >
                      <input 
                        type="file" 
                        accept="image/jpeg, image/png, image/webp" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePhotoUpload(file);
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                      />
                      <div className="h-10 w-10 rounded-full border border-white/10 bg-black/60 flex items-center justify-center mb-3 transition-all duration-500 group-hover:scale-105 group-hover:border-[#E5D5C0]/30 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                        <Camera className="h-4 w-4 text-[#E5D5C0]/85 stroke-[1.25]" style={{ filter: "drop-shadow(0 0 6px rgba(229, 213, 192, 0.45))" }} />
                      </div>
                      <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-white group-hover:text-[#E5D5C0] transition-colors duration-300">Upload Press Photo</span>
                      <span className="text-[7px] font-mono tracking-widest text-zinc-500 group-hover:text-zinc-400 mt-2 uppercase transition-colors duration-300">JPG, PNG, WEBP — MAX 3MB // HIGH RESOLUTION</span>
                    </div>
                  ) : (
                    <div className="relative aspect-[16/10] rounded-lg overflow-hidden border border-white/[0.08] bg-zinc-950 group shadow-[0_30px_70px_rgba(0,0,0,0.7)] p-1">
                      <div className="w-full h-full rounded-md overflow-hidden relative">
                        <img src={photoPreview} alt="Press Photo" className="w-full h-full object-cover filter brightness-[0.9] contrast-[1.03] group-hover:scale-[1.03] transition-transform duration-700 ease-out" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                      </div>
                      
                      {/* Upload progress overlay */}
                      {photoProgress !== null && (
                        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 space-y-4 z-20">
                          <span className="text-[8px] font-mono uppercase tracking-[0.3em] text-[#E5D5C0] animate-pulse">TRANSMITTING PORTRAIT VECTOR DATA...</span>
                          <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#E5D5C0] transition-all duration-300" style={{ width: `${photoProgress}%` }} />
                          </div>
                        </div>
                      )}
      
                      {/* Photo Action Overlay */}
                      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center z-10">
                        <div className="text-[7.5px] font-mono tracking-[0.25em] text-[#E5D5C0] uppercase font-bold flex items-center gap-1.5 bg-black/80 px-2.5 py-1 rounded-full border border-[#E5D5C0]/20 shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
                          <span className="h-1 w-1 rounded-full bg-[#E5D5C0] animate-pulse" />
                          STORED
                        </div>
                        <div className="flex gap-2">
                          <div className="relative overflow-hidden inline-block">
                            <input 
                              type="file" 
                              accept="image/jpeg, image/png, image/webp" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handlePhotoUpload(file);
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                            />
                            <button type="button" className="text-[7.5px] font-bold uppercase tracking-[0.15em] text-black bg-[#E5D5C0] hover:bg-[#F1E5D1] px-2.5 py-1 rounded-full transition-colors cursor-pointer">
                              REPLACE
                            </button>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => {
                              setPhotoFile(null);
                              setPhotoPreview(null);
                              setPhotoUrl(null);
                            }}
                            className="text-[7.5px] font-bold uppercase tracking-[0.15em] text-white bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 px-2.5 py-1 rounded-full transition-all cursor-pointer"
                          >
                            REMOVE
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
      
                {/* FEATURE 02: OPTIONAL EPK UPLOAD */}
                <div className="space-y-4">
                  <span className="text-[10px] font-sans uppercase font-extrabold text-zinc-500 tracking-[0.25em]">ELECTRONIC PRESS KIT (EPK)</span>
                  
                  {!epkUrl ? (
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsEpkDragOver(true); }}
                      onDragLeave={() => setIsEpkDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsEpkDragOver(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleEpkUpload(file);
                      }}
                      className="relative border border-white/5 bg-[#030303] hover:border-[#E5D5C0]/20 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 group shadow-md min-h-[160px]"
                    >
                      <input 
                        type="file" 
                        accept="application/pdf" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleEpkUpload(file);
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                      />
                      <div className="h-10 w-10 rounded-full border border-white/10 bg-black/60 flex items-center justify-center mb-3 transition-all duration-500 group-hover:scale-105 group-hover:border-[#E5D5C0]/30 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                        <Award className="h-4 w-4 text-[#E5D5C0]/85 stroke-[1.25]" style={{ filter: "drop-shadow(0 0 6px rgba(229, 213, 192, 0.45))" }} />
                      </div>
                      <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-white group-hover:text-[#E5D5C0] transition-colors duration-300">Upload EPK PDF</span>
                      <span className="text-[7px] font-mono tracking-widest text-zinc-500 group-hover:text-zinc-400 mt-2 uppercase transition-colors duration-300">PDF FORMAT — MAXIMUM 10MB // OPTIONAL</span>
                    </div>
                  ) : (
                    <div className="border border-white/[0.08] bg-white/[0.01] hover:bg-white/[0.02] backdrop-blur-md p-5 rounded-lg flex items-center justify-between shadow-[0_25px_50px_rgba(0,0,0,0.8)] min-h-[160px] relative overflow-hidden flex-wrap gap-4 group hover:border-[#E5D5C0]/30 transition-all duration-500">
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-40" />
                      
                      {/* Upload progress overlay */}
                      {epkProgress !== null && (
                        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 space-y-4 z-20">
                          <span className="text-[8px] font-mono uppercase tracking-[0.3em] text-[#E5D5C0] animate-pulse">TRANSMITTING DIGITAL PORTFOLIO...</span>
                          <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#E5D5C0] transition-all duration-300" style={{ width: `${epkProgress}%` }} />
                          </div>
                        </div>
                      )}
      
                      <div className="flex items-center gap-2.5 relative z-10 text-left">
                        <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-[#E5D5C0]/10 text-[#E5D5C0] text-[10px] border border-[#E5D5C0]/20 shadow-inner shrink-0">
                          ✓
                        </span>
                        <div className="font-mono max-w-[130px] sm:max-w-[180px] overflow-hidden">
                          <span className="text-[8.5px] font-bold uppercase tracking-[0.2em] text-[#E5D5C0] block">EPK ATTACHED</span>
                          <span className="text-[7px] text-zinc-400 block uppercase tracking-widest mt-1 truncate">{epkFile?.name || "document.pdf"}</span>
                          <span className="text-[7.5px] text-zinc-500 block font-bold uppercase mt-0.5">{(Math.round((epkFile?.size || 0) / 1024 / 1024 * 100) / 100) || "Loaded"} MB</span>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => {
                          setEpkFile(null);
                          setEpkUrl(null);
                        }}
                        className="text-[7.5px] font-bold uppercase tracking-[0.15em] text-white bg-white/5 border border-white/10 hover:bg-[#E5D5C0]/10 hover:border-red-500/20 px-2.5 py-1 rounded-full transition-all font-mono cursor-pointer relative z-20 shadow-sm hover:text-red-400"
                      >
                        REMOVE
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* PORTRAIT PREVIEW */}
            {photoPreview && (
              <div className="space-y-3 pt-4 border-t border-white/[0.06] text-left animate-fadeIn">
                <span className="text-[9px] font-sans uppercase tracking-[0.3em] text-[#E5D5C0] block font-extrabold">
                  ROSTER CANDIDATE DOSSIER PORTRAIT
                </span>
                
                <div className="relative max-w-[240px] aspect-[4/5] rounded-lg overflow-hidden border border-[#E5D5C0]/25 bg-zinc-950 shadow-[0_20px_50px_rgba(0,0,0,0.85)] group p-1.5 transition-all duration-300 hover:border-[#E5D5C0]/45">
                  <div className="relative w-full h-full overflow-hidden rounded-md border border-white/5">
                    <img 
                      src={photoPreview} 
                      alt={artistName || "Candidate Preview"} 
                      className="w-full h-full object-cover filter brightness-[0.85] contrast-[1.05]" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" />
                    
                    <div className="absolute bottom-3.5 left-3.5 right-3.5 text-left">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[6.5px] font-mono font-bold uppercase tracking-wider border border-[#E5D5C0]/40 bg-black/75 text-[#E5D5C0] mb-1 shadow-sm">
                        ROSTER CANDIDATE
                      </span>
                      <h4 className="font-display text-lg uppercase font-black text-white leading-tight tracking-tight">
                        {artistName || "ARTIST ALIAS"}
                      </h4>
                      <div className="flex justify-between items-center text-[7.5px] font-mono text-zinc-400 mt-1.5 uppercase tracking-[0.15em] border-t border-white/10 pt-1.5">
                        <span>STATUS: PENDING REVIEW</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 4: Review & Submit */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-6 text-left"
          >
            {/* Dossier summary grid panels */}
            <div className="border-b border-white/5 py-6 space-y-5">
              <span className="text-[9px] font-sans uppercase tracking-[0.25em] text-[#E5D5C0] block font-extrabold border-b border-white/5 pb-2">
                Candidate Identity
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-1">
                  <span className="text-zinc-500 block uppercase tracking-wider text-[8px]">Full Name</span>
                  <span className="text-white block text-sm tracking-wide font-sans">{name}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-zinc-500 block uppercase tracking-wider text-[8px]">Creative Alias</span>
                  <span className="text-[#E5D5C0] block text-sm tracking-wide font-sans font-bold">{artistName}</span>
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <span className="text-zinc-500 block uppercase tracking-wider text-[8px]">Secure Email Channel</span>
                  <span className="text-white block tracking-wide">{email}</span>
                </div>
              </div>
            </div>

            <div className="border-b border-white/5 py-6 space-y-5">
              <span className="text-[9px] font-sans uppercase tracking-[0.25em] text-[#E5D5C0] block font-extrabold border-b border-white/5 pb-2">
                Music Information & Channels
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="sm:col-span-2 space-y-1">
                  <span className="text-zinc-500 block uppercase tracking-wider text-[8px]">Spotify Catalog URL</span>
                  <span className="text-white block truncate tracking-wide">{spotifyLink || "No link provided"}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-zinc-500 block uppercase tracking-wider text-[8px]">Instagram</span>
                  <span className="text-white block truncate tracking-wide">{instagramLink || "No link provided"}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-zinc-500 block uppercase tracking-wider text-[8px]">Twitter</span>
                  <span className="text-white block truncate tracking-wide">{twitterLink || "No link provided"}</span>
                </div>
                {message.trim() && (
                  <div className="sm:col-span-2 space-y-1">
                    <span className="text-zinc-500 block uppercase tracking-wider text-[8px]">Dossier Brief Description</span>
                    <p className="text-zinc-300 block font-sans font-light leading-relaxed whitespace-pre-line text-xs">{message}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-b border-white/5 py-6 space-y-5">
              <span className="text-[9px] font-sans uppercase tracking-[0.25em] text-[#E5D5C0] block font-extrabold border-b border-white/5 pb-2">
                Identity Assets
              </span>
              <div className="flex flex-wrap gap-4 items-center">
                {photoPreview && (
                  <div className="flex items-center gap-3 border border-white/5 bg-black/40 rounded-xl p-2.5">
                    <img src={photoPreview} alt="Dossier Portrait" className="h-10 w-10 rounded-lg object-cover border border-white/10" />
                    <div className="font-mono text-left">
                      <span className="text-[8px] font-bold text-[#E5D5C0] block uppercase tracking-wider">PRESS PHOTO</span>
                      <span className="text-[7.5px] text-zinc-400 block uppercase tracking-widest mt-0.5">VERIFIED PORTRAIT</span>
                    </div>
                  </div>
                )}
                
                {epkUrl ? (
                  <div className="flex items-center gap-3 border border-white/5 bg-black/40 rounded-xl p-2.5">
                    <div className="h-10 w-10 rounded-lg border border-white/10 bg-black/60 flex items-center justify-center">
                      <Award className="h-4.5 w-4.5 text-[#E5D5C0]" />
                    </div>
                    <div className="font-mono text-left">
                      <span className="text-[8px] font-bold text-[#E5D5C0] block uppercase tracking-wider">EPK DOCUMENT</span>
                      <span className="text-[7.5px] text-zinc-400 block uppercase tracking-widest mt-0.5 truncate max-w-[130px]">{epkFile?.name || "Attached PDF"}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 border border-white/5 bg-black/40 rounded-xl p-2.5 opacity-50">
                    <div className="h-10 w-10 rounded-lg border border-white/5 bg-zinc-950 flex items-center justify-center">
                      <Award className="h-4.5 w-4.5 text-zinc-600" />
                    </div>
                    <div className="font-mono text-left">
                      <span className="text-[8px] font-bold text-zinc-500 block uppercase tracking-wider">EPK DOCUMENT</span>
                      <span className="text-[7.5px] text-zinc-600 block uppercase tracking-widest mt-0.5">NOT PROVIDED</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Responsive Button Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/5 relative z-10">
        {step > 1 && (
          <button
            type="button"
            onClick={handlePrevious}
            className="flex-1 cursor-pointer relative overflow-hidden group border border-white/10 bg-transparent text-white hover:bg-white/5 font-sans text-[10px] font-bold uppercase tracking-[0.2em] py-4 rounded-full transition-all duration-300 flex items-center justify-center gap-2"
          >
            Previous Step
          </button>
        )}
        
        {step < 4 ? (
          <button
            type="button"
            onClick={handleContinue}
            className="flex-1 cursor-pointer relative overflow-hidden group border border-[#E5D5C0]/30 bg-[#E5D5C0] text-black hover:bg-[#F1E5D1] font-sans text-[10px] font-black uppercase tracking-[0.25em] py-4 rounded-full shadow-[0_15px_30px_rgba(0,0,0,0.4)] transition-all duration-300 flex items-center justify-center gap-2"
          >
            Continue
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="flex-1 cursor-pointer relative overflow-hidden group border border-[#E5D5C0]/30 bg-[#080808] text-white hover:text-black font-sans text-[10px] font-black uppercase tracking-[0.25em] py-4 rounded-full shadow-[0_20px_45px_rgba(229,213,192,0.06),0_15px_30px_rgba(0,0,0,0.8)] transition-all duration-500 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#E5D5C0] via-[#F1E5D1] to-[#C9B9A5] opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
            <div className="absolute -inset-px rounded-full border border-white/5 pointer-events-none group-hover:border-[#E5D5C0]/60 transition-colors duration-500" />
            
            <Sparkles className="h-3.5 w-3.5 text-[#E5D5C0] group-hover:text-black transition-colors duration-300 animate-pulse" />
            {loading ? "TRANSMITTING DATA..." : "Begin Artist Evaluation"}
          </button>
        )}
      </div>
    </form>
  );
}
