import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

const discoveryNodes = [
  {
    id: "01",
    title: "Talent Discovery",
    desc: "Our network continuously evaluates emerging artists with exceptional potential and long-term scalability.",
    tag: "SCOUTING VECTOR",
    action: "EVALUATE CREDENTIALS →"
  },
  {
    id: "02",
    title: "Artist Evaluation",
    desc: "Every selected artist undergoes a detailed review process focused on originality, consistency, market fit, and growth potential.",
    tag: "METRIC REVIEW",
    action: "INSPECT PARAMETERS →"
  },
  {
    id: "03",
    title: "Strategic Development",
    desc: "Selected artists gain access to advanced guidance, industry insights, and development frameworks.",
    tag: "INCUBATOR PIPELINE",
    action: "ENGAGE BLUEPRINT →"
  },
  {
    id: "04",
    title: "Private Mentorship",
    desc: "Qualified artists may receive direct feedback, coaching, and strategic direction from experienced industry professionals.",
    tag: "MOGUL ACCESS",
    action: "CONNECT SCRIPTS →"
  },
  {
    id: "05",
    title: "Industry Access",
    desc: "High-potential artists can gain opportunities to connect with key decision-makers and industry networks.",
    tag: "GATEWAY CONTROL",
    action: "REQUEST DEPLOYMENT →"
  },
  {
    id: "06",
    title: "1017 Network",
    desc: "Exceptional talent may be introduced to opportunities associated with the broader 1017 ecosystem.",
    tag: "ROSTER LINKAGE",
    action: "ALIGN ECOSYSTEM →"
  }
];

export function ArtistDiscovery() {
  return (
    <section id="discovery" className="relative px-6 py-32 md:px-10 border-t border-white/5 bg-[#000000] overflow-hidden">
      {/* Background ambient grids & cinematic light flares */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="pointer-events-none absolute inset-0 cyber-grid-dots opacity-[0.03] -z-10" />
      
      {/* Faint luxury cinematic gold and white glow coordinates */}
      <div className="pointer-events-none absolute -left-32 top-1/3 h-[90vmin] w-[90vmin] rounded-full bg-[#E5D5C0]/[0.015] blur-[120px] -z-10" />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 h-[95vmin] w-[95vmin] rounded-full bg-white/[0.008] blur-[150px] -z-10" />
      <div className="pointer-events-none absolute left-1/3 top-1/2 h-[75vmin] w-[75vmin] glow-gold opacity-[0.01] -translate-y-1/2 -z-10" />
      
      <div className="mx-auto max-w-[1600px] relative">
        
        {/* Section Header */}
        <div className="mb-20 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="text-[10px] font-mono tracking-[0.35em] text-[#E5D5C0] block font-bold mb-6">
              SECURE REGISTRY SYSTEM // SC SCOUTING CORE
            </span>
            <h2 
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              className="text-6xl sm:text-7xl uppercase leading-[0.8] md:text-8xl lg:text-9xl text-white tracking-wide"
            >
              Artist Discovery <span className="text-stroke font-black">Ecosystem</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-zinc-400 border-l border-white/[0.08] pl-5 py-1 font-light font-sans">
            An elite, invitation-only selection platform backstopped by 1017 Records. We evaluate creative discipline and original soundscapes for strategic network integration.
          </p>
        </div>

        {/* Premium Promotional Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {discoveryNodes.map((node, i) => (
            <DiscoveryCard key={node.title} node={node} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function DiscoveryCard({ node, index }: { node: typeof discoveryNodes[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");
    setIsMobile(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Smooth 3D Parallax scale (max 10 degrees rotation for premium look)
    setRotateX(-y / (rect.height / 10));
    setRotateY(x / (rect.width / 10));
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.8, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      style={{
        transform: !isMobile 
          ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)` 
          : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
        transition: "transform 0.12s ease-out",
        transformStyle: "preserve-3d",
      }}
      className="group relative bg-transparent p-6 flex flex-col justify-between select-none transition-all duration-500 overflow-hidden cursor-pointer border-t border-white/5 pt-8"
    >
      {/* Subtle top champagne-gold line */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#E5D5C0]/20 to-transparent pointer-events-none z-20" />

      <div className="space-y-8" style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}>
        {/* NODE ID & SELECTION PROCESS LABEL */}
        <div className="flex justify-between items-center" style={{ transform: "translateZ(10px)" }}>
          <span className="block font-mono text-[9px] tracking-[0.35em] text-[#E5D5C0] font-bold">
            // REGISTRY {node.id}
          </span>
          <span className="block font-mono text-[8px] tracking-[0.25em] text-zinc-500 group-hover:text-[#E5D5C0]/65 transition-colors uppercase font-extrabold">
            SELECTION PROCESS
          </span>
        </div>

        {/* VECTOR TITLE */}
        <div className="space-y-1" style={{ transform: "translateZ(15px)" }}>
          <h3 
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            className="block text-4xl sm:text-5xl font-bold text-white group-hover:text-[#D4AF37] transition-all duration-500 uppercase leading-none tracking-wide"
          >
            {node.title}
          </h3>
        </div>

        {/* DESCRIPTION */}
        <p 
          className="text-zinc-400 group-hover:text-zinc-300 transition-colors text-xs leading-relaxed font-sans font-light pt-5 border-t border-white/[0.05]"
          style={{ transform: "translateZ(5px)" }}
        >
          {node.desc}
        </p>
      </div>

      {/* Secure Dossier Action Footer */}
      <div 
        className="mt-12 border-t border-white/[0.05] pt-6 flex justify-between items-center z-20"
        style={{ transform: "translateZ(10px)" }}
      >
        <span className="text-[8px] font-mono tracking-widest text-zinc-600 group-hover:text-zinc-400 transition-colors uppercase leading-none">
          {node.tag}
        </span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-[#D4AF37] transition-colors leading-none flex items-center gap-1.5 font-sans">
          {node.action}
        </span>
      </div>
    </motion.div>
  );
}
