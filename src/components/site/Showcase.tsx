import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublicSettings } from "@/lib/cms.functions";
import showcase from "@/assets/showcase.jpg";
import { Link } from "@tanstack/react-router";
import { TransitionLink } from "@/components/ui/PageTransition";

type ShowcaseSetting = {
  enabled: boolean;
  image_url: string;
  title: string;
  subtitle: string;
  description: string;
  button_label: string;
  button_url: string;
};

const SHOWCASE_DEFAULT: ShowcaseSetting = {
  enabled: false,
  image_url: "",
  title: "Turn Your Music",
  subtitle: "Into Momentum.",
  description: "Submit your sound, build your audience, and connect with opportunities across the modern music industry.",
  button_label: "Submit Your Sound",
  button_url: "/about-1017"
};

export function Showcase() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.15, 1]);
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  const { data } = useQuery({
    queryKey: ["public-settings"],
    queryFn: () => getPublicSettings(),
    staleTime: 30_000,
  });

  const showcaseSettings: ShowcaseSetting = {
    ...SHOWCASE_DEFAULT,
    ...((data?.settings?.showcase as ShowcaseSetting | undefined) ?? {}),
  };

  // Resolve custom uploaded banner or the visual default fallback
  const displayImage = showcaseSettings.enabled && showcaseSettings.image_url 
    ? showcaseSettings.image_url 
    : showcase;

  const isExternalLink = !!showcaseSettings.button_url && /^https?:\/\//i.test(showcaseSettings.button_url);
  const isHashLink = !!showcaseSettings.button_url && showcaseSettings.button_url.startsWith("#");

  return (
    <section id="music" ref={ref} className="relative overflow-hidden">
      <div className="relative h-[90vh] min-h-[640px] w-full overflow-hidden">
        <motion.img
          src={displayImage}
          alt={showcaseSettings.title}
          style={{ scale, y }}
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover object-[30%_center] md:object-center"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,oklch(0.04_0_0/0.6)_100%)]" />

        <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-6 pb-20 md:px-10 md:pb-28">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.8 }}
            className="mb-6 text-[10px] font-semibold uppercase tracking-[0.5em] text-accent"
          >
            — Feature Presentation
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-4xl sm:text-5xl leading-[0.95] md:text-7xl lg:text-[7.5rem] tracking-tighter"
          >
            <span 
              className="block text-white font-black uppercase"
              style={{
                textShadow: "0px 4px 12px rgba(0, 0, 0, 0.65), 0px 1px 1px rgba(255, 255, 255, 0.15)"
              }}
            >
              {showcaseSettings.title}
            </span>
            <span 
              className="block text-white/40 text-[0.55em] font-extrabold uppercase tracking-widest mt-6"
              style={{
                letterSpacing: "4px",
                textShadow: "0px 2px 6px rgba(0, 0, 0, 0.5)"
              }}
            >
              {showcaseSettings.subtitle}
            </span>
          </motion.h2>

          {showcaseSettings.enabled && showcaseSettings.description && (
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.8 }}
              className="mt-6 max-w-xl text-[10px] leading-relaxed text-muted-foreground/80 font-mono uppercase tracking-[0.15em] border-l-2 border-accent/30 pl-4"
            >
              {showcaseSettings.description}
            </motion.p>
          )}

          <div className="mt-12 flex flex-wrap items-center gap-6">
            {isExternalLink || isHashLink ? (
              <a
                href={showcaseSettings.button_url}
                target={isExternalLink ? "_blank" : undefined}
                rel={isExternalLink ? "noreferrer" : undefined}
                className="group inline-flex items-center gap-4 border border-foreground/40 bg-background/30 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.35em] text-foreground backdrop-blur-md transition-all hover:border-accent hover:bg-accent hover:text-accent-foreground rounded-none text-left"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-foreground transition-transform group-hover:scale-110">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                </span>
                {showcaseSettings.button_label}
              </a>
            ) : (
              <TransitionLink
                to={showcaseSettings.button_url as any}
                className="group inline-flex items-center gap-4 border border-foreground/40 bg-background/30 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.35em] text-foreground backdrop-blur-md transition-all hover:border-accent hover:bg-accent hover:text-accent-foreground rounded-none text-left"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-foreground transition-transform group-hover:scale-110">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                </span>
                {showcaseSettings.button_label}
              </TransitionLink>
            )}
            <a
              href="#releases"
              className="text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Explore Latest Releases →
            </a>
          </div>
        </div>
      </div>

      <div className="border-y border-white/5 bg-[#000000]">
        <div className="mx-auto grid max-w-[1600px] grid-cols-2 divide-x divide-white/5 md:grid-cols-4">
          {[
            { k: "2017", v: "Established" },
            { k: "13+", v: "Artists Signed" },
            { k: "40M", v: "Monthly Listeners" },
            { k: "∞", v: "The Energy" },
          ].map((s, i) => (
            <motion.div
              key={s.v}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="px-6 py-10 md:px-10 md:py-14"
            >
              <p className="font-display text-4xl uppercase leading-none md:text-6xl">{s.k}</p>
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">{s.v}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}