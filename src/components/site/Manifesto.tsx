import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["15%", "-15%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0.25, 1, 1, 0.25]);

  const words = "A new era of sound. Built in the dark, delivered to the world.".split(" ");

  return (
    <section id="manifesto" ref={ref} className="relative overflow-hidden px-6 pt-16 pb-28 md:px-10 md:pt-20 md:pb-40">
      {/* Top subtle fading gradient to blend from statistics section */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#000000] via-[#000000]/60 to-transparent" />

      {/* Gigantic backing 1017 watermark */}
      <motion.div
        style={{ y }}
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center select-none"
      >
        <span className="font-display text-[26vw] uppercase leading-none text-white/[0.012] font-black tracking-tighter">
          1017
        </span>
      </motion.div>

      {/* Cyber ambient glows */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 glow-gold opacity-[0.02]" />

      <motion.div
        style={{ opacity }}
        className="mx-auto max-w-[1400px] relative z-10"
      >
        <div className="relative mb-8 inline-flex items-center gap-2.5 overflow-hidden rounded-full border border-[#D4AF37]/25 bg-gradient-to-b from-black/80 to-[#111111]/90 px-4 py-1.5 md:px-5 md:py-2 backdrop-blur-md shadow-[0_0_30px_rgba(212,175,55,0.15),inset_0_1px_1px_rgba(212,175,55,0.2)]">
          {/* Gold sweep effect every 10 seconds */}
          <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
             <div className="absolute top-0 -left-[200%] h-full w-[200%] animate-[gold-sweep-loop_10s_infinite_linear] bg-gradient-to-r from-transparent via-[#F4D06F]/15 to-transparent skew-x-[-25deg]" />
          </div>

          <span className="relative z-10 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D4AF37] animate-pulse shadow-[0_0_10px_#F4D06F,0_0_2px_#D4AF37]" />
          <span className="relative z-10 pt-[2px] text-[10px] md:text-xs font-mono uppercase tracking-[0.25em] md:tracking-[0.28em] font-medium text-[#C9A227] leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            CORE OBJECTIVE // MANIFESTO
          </span>
        </div>
        
        <p className="font-display text-4xl uppercase leading-[1.0] text-foreground sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-tight text-balance">
          {words.map((w, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0.15, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, filter: "blur(0px)" }}
              viewport={{ once: false, amount: 0.6 }}
              transition={{ duration: 0.7, delay: i * 0.05, ease: "easeOut" }}
              className="mr-4 inline-block hover:text-gradient-gold transition-all duration-300 hover:scale-[1.02] cursor-default"
            >
              {w}
            </motion.span>
          ))}
        </p>
      </motion.div>
    </section>
  );
}
