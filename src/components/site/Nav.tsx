import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState, useRef, useEffect } from "react";
import { Logo } from "./Logo";
import { Link, useLocation } from "@tanstack/react-router";
import { TransitionLink } from "@/components/ui/PageTransition";

const links = [
  { label: "Artists", href: "/#artists", hash: "#artists" },
  { label: "Discovery", href: "/#discovery", hash: "#discovery" },
  { label: "Manifesto", href: "/#manifesto", hash: "#manifesto" },
  { label: "Media", href: "/#music", hash: "#music" },
  { label: "Contact", href: "/#contact", hash: "#contact" }
];


// Magnetic Mouse Effect Wrapper Component
function Magnetic({ children }: { children: React.ReactElement }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");
    setIsMobile(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) return;
    if (isMobile) return;
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    // Premium soft displacement scale factor (0.3)
    const x = (clientX - centerX) * 0.3;
    const y = (clientY - centerY) * 0.3;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}

export function Nav() {
  const { scrollY } = useScroll();
  const location = useLocation();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Prevent body scrolling when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = "mailto:1017recordsoffcial@gmail.com";
  };

  const [last, setLast] = useState(0);
  const [activeSection, setActiveSection] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const headerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");
    setIsMobile(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  // Scroll logic for premium Apple-like header transformation
  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 20);
    // Hide header on down-scroll past 160px, reveal instantly on scroll-up
    if (y > last && y > 160) setHidden(true);
    else setHidden(false);
    setLast(y);
  });

  // Track the current active section on the page using IntersectionObserver
  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection("");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );

    const ids = ["artists", "discovery", "manifesto", "music"];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
    };
  }, [location.pathname]);

  // Track cursor position inside the header to drive proximity gold aura reflections
  const handleHeaderMouseMove = (e: React.MouseEvent) => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) return;
    if (isMobile) return;
    if (!headerRef.current) return;
    const rect = headerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: hidden ? -110 : 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50 transition-all duration-500 px-4 md:px-8 py-4 pointer-events-none"
      >
        <div 
          ref={headerRef}
          onMouseMove={handleHeaderMouseMove}
          className={`group mx-auto flex flex-row-reverse items-center justify-between transition-all duration-500 transform-gpu relative overflow-hidden pointer-events-auto ${
            scrolled 
              ? "max-w-[1360px] h-14 px-6 rounded-full bg-black/50 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_2px_rgba(255,255,255,0.05)_inset] backdrop-blur-xl" 
              : "max-w-[1600px] h-20 px-8 rounded-2xl bg-white/[0.01] border border-white/[0.04] backdrop-blur-md"
          }`}
        >
          {/* Beveled reflection light line */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

          {/* Proximity Cursor Glow */}
          <div
            className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-full"
            style={{
              background: !isMobile 
                ? `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(229, 213, 192, 0.06), transparent 80%)`
                : "none"
            }}
          />

          {/* LEFT - Logo Area (Staggered Mount) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          >
            <Logo className="relative z-10" scrolled={scrolled} />
          </motion.div>

          {/* MIDDLE - Desktop Nav Links (Staggered Mount) */}
          <motion.nav 
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.04, delayChildren: 0.1 }
              }
            }}
            className="hidden items-center gap-[32px] lg:flex"
          >
            {links.map((l) => {
              const isActive = activeSection ? l.hash === `#${activeSection}` : false;
              const isContact = l.label === "Contact";
              const linkContent = isContact ? (
                 <a
                   key={l.href}
                   href="mailto:1017recordsoffcial@gmail.com"
                   onClick={handleContactClick}
                   className="relative py-2 text-[11px] font-bold uppercase tracking-[0.25em] text-white/45 hover:text-white transition-colors duration-300 select-none cursor-pointer"
                >
                  {l.label}
                  <span className="absolute bottom-0 left-1/2 h-[2px] -translate-x-1/2 bg-lux-gold transition-all duration-300 ease-out shadow-[0_0_8px_rgba(229,213,192,0.6)] w-0 opacity-0 group-hover:w-full group-hover:opacity-100" />
                </a>
              ) : (
                <a
                  key={l.href}
                  href={l.href}
                  className={`relative py-2 text-[11px] font-bold uppercase tracking-[0.25em] transition-colors duration-300 select-none cursor-pointer ${
                    isActive ? "text-white" : "text-white/45 hover:text-white"
                  }`}
                >
                  {l.label}
                  {/* Grow-from-center Gold Underline */}
                  <span 
                    className={`absolute bottom-0 left-1/2 h-[2px] -translate-x-1/2 bg-lux-gold transition-all duration-300 ease-out shadow-[0_0_8px_rgba(229,213,192,0.6)] ${
                      isActive ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"
                    }`} 
                  />
                </a>
              );

              return (
                <motion.div
                  key={l.href}
                  variants={{
                    hidden: { y: -10, opacity: 0 },
                    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 16 } }
                  }}
                  className="group relative"
                >
                  <Magnetic>{linkContent}</Magnetic>
                </motion.div>
              );
            })}
          </motion.nav>

          {/* RIGHT - Live Network Beacon & Secure CTAs (Staggered Mount) */}
          <motion.div 
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0, x: -20 },
              show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 15, delay: 0.2 } }
            }}
            className="hidden items-center gap-5 lg:flex"
          >
            {/* Elegant Live Network Pulse Indicator */}
            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.25em] text-white/45 bg-white/[0.02] px-3.5 py-1.5 rounded-full border border-white/[0.04]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E5D5C0] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E5D5C0] shadow-[0_0_8px_rgba(229,213,192,0.85)]"></span>
              </span>
              <span className="text-white/60">LIVE NETWORK</span>
            </div>
            
            {/* Outline Secondary CTA (Inner Circle) */}
            <a
              href="#artist-cta"
              className="inline-flex items-center justify-center border border-white/10 hover:border-lux-gold bg-white/5 hover:bg-white/[0.08] text-white/80 hover:text-white px-5 py-2.5 text-[9px] font-bold uppercase tracking-[0.25em] transition-all duration-300 active:scale-[0.98] rounded-full"
            >
              Inner Circle
            </a>

            {/* Premium Gold Gradient Primary CTA (Apply for Review) */}
            <TransitionLink
              to="/about-1017"
              className="relative overflow-hidden inline-flex items-center justify-center bg-gradient-to-r from-[#E5D5C0] via-[#F1E5D1] to-[#C9B9A5] text-black px-6 py-2.5 text-[9px] font-black uppercase tracking-[0.25em] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] hover:shadow-[0_0_20px_rgba(229,213,192,0.35)] rounded-full"
            >
              Apply for Review
            </TransitionLink>
          </motion.div>

          {/* Mobile Menu Toggle Button */}
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className={`relative z-55 flex h-10 w-10 flex-col items-center justify-center gap-1 lg:hidden select-none cursor-pointer focus:outline-none transition-opacity duration-300 ${open ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          >
            <span className="h-[1.5px] w-5 bg-white" />
            <span className="h-[1.5px] w-5 bg-white" />
            <span className="h-[1.5px] w-5 bg-white" />
          </button>
        </div>
      </motion.header>

      {/* Modern Fullscreen Editorial Mobile Menu Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex flex-col justify-between bg-black/98 backdrop-blur-3xl px-8 pb-12 pt-32 sm:px-16 lg:hidden"
          >
            {/* Dedicated Top-Right Close Button inside overlay */}
            <button
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute top-6 right-6 sm:top-8 sm:right-10 z-55 flex h-10 w-10 flex-col items-center justify-center gap-1.5 cursor-pointer focus:outline-none group"
            >
              <span className="h-[2px] w-5 bg-white rotate-45 translate-y-[2.5px] group-hover:bg-[#D4AF37] transition-colors duration-300" />
              <span className="h-[2px] w-5 bg-white -rotate-45 -translate-y-[2.5px] group-hover:bg-[#D4AF37] transition-colors duration-300" />
            </button>
            {/* Centered Large Editorial Navigation Menu */}
            <div className="flex flex-col gap-6 relative z-10 w-full max-w-4xl mx-auto justify-center flex-grow">
              {links.map((l, i) => {
                const isActive = activeSection ? l.hash === `#${activeSection}` : false;
                const isContact = l.label === "Contact";

                return (
                   <motion.div
                     key={l.href}
                     initial={{ opacity: 0, scale: 0.95, y: 30 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 20 }}
                     transition={{ delay: i * 0.04, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                   >
                      <a
                        href={isContact ? "mailto:1017recordsoffcial@gmail.com" : l.href}
                        onClick={(e) => {
                          if (isContact) {
                            handleContactClick(e);
                          }
                          setOpen(false);
                        }}
                        className={`group flex items-baseline justify-between border-b border-white/5 pb-4 font-display text-4xl sm:text-6xl uppercase tracking-tighter transition-all duration-500 cursor-pointer select-none mobile-nav-link ${
                          isActive ? "text-[#D4AF37]" : "text-white/45 hover:text-white"
                        }`}
                      >
                        <span>{l.label}</span>
                        <span className={`font-mono text-xs sm:text-sm tracking-widest transition-opacity duration-300 ${
                          isActive ? "text-[#D4AF37] opacity-100" : "text-lux-gold opacity-0 group-hover:opacity-100"
                        }`}>
                          // 0{i + 1}
                        </span>
                      </a>
                   </motion.div>
                );
              })}
            </div>

            {/* Bottom Actions Area */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col gap-4 relative z-10 border-t border-white/5 pt-8 max-w-4xl mx-auto"
            >
              {/* Real-time pulse node */}
              <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.25em] text-white/45 mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E5D5C0] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E5D5C0] shadow-[0_0_8px_rgba(229,213,192,0.85)]"></span>
                </span>
                <span className="text-white/60">OFFICIAL TALENT GATEWAY</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 cta-buttons">
                <a
                  href="#artist-cta"
                  onClick={() => setOpen(false)}
                  className="text-center border border-white/10 hover:border-lux-gold bg-white/5 py-4 text-[9px] font-bold uppercase tracking-[0.25em] text-white rounded-full transition-all duration-300"
                >
                  Inner Circle
                </a>
                
                <TransitionLink
                  to="/about-1017"
                  onClick={() => setOpen(false)}
                  className="text-center bg-gradient-to-r from-[#E5D5C0] via-[#F1E5D1] to-[#C9B9A5] py-4 text-[9px] font-black uppercase tracking-[0.25em] text-black rounded-full transition-all duration-300"
                >
                  Apply for Review
                </TransitionLink>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
