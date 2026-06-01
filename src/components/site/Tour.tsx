import { motion } from "motion/react";

const dates = [
  { date: "Jun 14", city: "Atlanta, GA", venue: "State Farm Arena", status: "On Sale" },
  { date: "Jun 22", city: "Memphis, TN", venue: "FedExForum", status: "On Sale" },
  { date: "Jul 03", city: "Houston, TX", venue: "Toyota Center", status: "Few Left" },
  { date: "Jul 12", city: "Los Angeles, CA", venue: "Crypto.com Arena", status: "Sold Out" },
  { date: "Jul 27", city: "New York, NY", venue: "Madison Square Garden", status: "On Sale" },
  { date: "Aug 09", city: "London, UK", venue: "The O2", status: "Pre-Sale" },
];

export function Tour() {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "sold out":
        return {
          bg: "border-red-500/20 bg-red-500/5 text-red-400",
          beacon: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
        };
      case "few left":
        return {
          bg: "border-amber-500/20 bg-amber-500/5 text-amber-400",
          beacon: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse"
        };
      case "pre-sale":
        return {
          bg: "border-cyan-500/20 bg-cyan-500/5 text-cyan-400",
          beacon: "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse"
        };
      default: // On Sale
        return {
          bg: "border-green-500/20 bg-green-500/5 text-green-400",
          beacon: "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse"
        };
    }
  };

  return (
    <section id="tour" className="relative px-6 py-32 md:px-10 border-t border-white/5">
      {/* Background ambient grids */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="pointer-events-none absolute -left-32 top-1/2 h-[75vmin] w-[75vmin] glow-gold opacity-[0.02] -translate-y-1/2" />
      
      <div className="mx-auto max-w-[1600px] relative">
        
        {/* Section Header */}
        <div className="mb-20 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 border border-white/5 bg-white/5 px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-[0.35em] text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_var(--color-accent)]" />
              MISSIONS DEPLOYMENT // LOGS
            </div>
            <h2 className="font-display text-5xl uppercase leading-[0.9] md:text-7xl lg:text-8xl">
              Tour <span className="text-stroke font-black">Dates</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground border-l border-white/10 pl-5 py-1">
            The 2026 worldwide live run. High-intensity audio transmission logs. Limited deployment space coordinates.
          </p>
        </div>

        {/* Telemetry Log List */}
        <ul className="space-y-3 relative z-10">
          {dates.map((d, i) => {
            const config = getStatusConfig(d.status);
            return (
              <motion.li
                key={d.city + d.date}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="group relative"
              >
                {/* Visual glass grid panel */}
                <a
                  href="#"
                  className="relative grid grid-cols-12 items-center gap-4 py-5 px-6 rounded-md glass transition-all duration-300 hover:border-white/15 hover:bg-white/[0.03] hover:translate-x-1"
                >
                  {/* Left accent marker line */}
                  <span className="absolute left-0 top-[20%] bottom-[20%] w-[2px] bg-accent/0 transition-all duration-300 group-hover:bg-accent shadow-[0_0_8px_var(--color-accent)]" />
                  
                  {/* DATE */}
                  <span className="relative col-span-3 font-display text-2xl uppercase md:text-4xl text-foreground group-hover:text-gradient-gold transition-all duration-500">
                    {d.date}
                  </span>
                  
                  {/* LOCATION */}
                  <span className="relative col-span-5 text-[11px] font-bold uppercase tracking-[0.25em] md:col-span-4 md:text-sm text-foreground/80">
                    {d.city}
                  </span>
                  
                  {/* VENUE */}
                  <span className="relative col-span-12 hidden text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground md:col-span-3 md:block">
                    {d.venue}
                  </span>
                  
                  {/* STATUS INDICATOR (Beaconic status pill) */}
                  <span className="relative col-span-4 flex items-center justify-end gap-4 md:col-span-2">
                    <span className={`inline-flex items-center gap-2 border px-2.5 py-1 text-[8px] font-mono uppercase tracking-widest rounded-sm ${config.bg}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${config.beacon}`} />
                      {d.status}
                    </span>
                    
                    <span className="text-muted-foreground group-hover:text-accent group-hover:translate-x-1.5 transition-all duration-300 text-xs">
                      →
                    </span>
                  </span>
                </a>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
