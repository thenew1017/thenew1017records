import { motion } from "motion/react";
import { TransitionLink } from "@/components/ui/PageTransition";

export function ArtistCTA() {
  return (
    <section id="artist-cta" className="relative px-6 py-40 md:px-10 border-t border-white/[0.08] bg-gradient-to-b from-[#000000] to-[#040404] overflow-hidden text-center">
      {/* Cinematic ambient lighting & textures */}
      <div className="pointer-events-none absolute inset-0 cyber-grid-dots opacity-[0.02] -z-10" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[80vmin] w-[80vmin] rounded-full bg-[#E5D5C0]/[0.015] blur-[100px]" />
      <div className="pointer-events-none absolute left-1/4 top-1/3 h-[50vmin] w-[50vmin] rounded-full bg-white/[0.005] blur-[120px] -z-10" />

      {/* Top subtle golden light beam line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-[#E5D5C0]/10 to-transparent" />

      <div className="mx-auto max-w-[1400px] relative z-10 space-y-16">
        
        {/* Core Narrative / Subtitle & Title stacked */}
        <div className="space-y-6 flex flex-col items-center">
          {/* Gold Badge eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.35em] text-[#E5D5C0] uppercase font-mono"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#E5D5C0] animate-pulse" />
            ROSTER SCOUTING OPEN
          </motion.div>

          {/* Bebas Neue Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-[8rem] uppercase leading-[0.8] text-white font-black tracking-wide"
          >
            The Next Artist <span className="text-stroke font-black block sm:inline">Could Be You</span>
          </motion.h2>

          {/* Elegant descriptive subheadline */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="max-w-xl text-zinc-300 text-sm sm:text-base leading-relaxed tracking-wide font-light border-t border-white/5 pt-6 mt-4"
          >
            Exceptional talent deserves exceptional opportunities. <br className="hidden sm:inline" />
            Submit your profile for evaluation by our discovery network scouts.
          </motion.p>
        </div>

        {/* Dual Conversion Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto"
        >
          {/* Primary Action Button */}
          <TransitionLink
            to="/about-1017"
            className="relative w-full sm:w-auto overflow-hidden inline-flex items-center justify-center bg-[#E5D5C0] hover:bg-[#F1E5D1] text-black px-10 py-5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] transition-all duration-500 hover:scale-[1.03] active:scale-[0.98] hover:shadow-[0_12px_35px_rgba(229,213,192,0.18)] rounded-full text-center border border-[#E5D5C0]/20 min-w-[240px]"
          >
            APPLY FOR REVIEW
          </TransitionLink>

          {/* Secondary Action Button */}
          <a
            href="#artists"
            className="w-full sm:w-auto text-center inline-flex items-center justify-center border border-white/10 hover:border-[#E5D5C0]/40 bg-transparent hover:bg-white/[0.02] text-white hover:text-[#E5D5C0] px-10 py-5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] transition-all duration-500 hover:scale-[1.03] active:scale-[0.98] rounded-full min-w-[240px]"
          >
            VIEW ROSTER
          </a>
        </motion.div>
      </div>
    </section>
  );
}
