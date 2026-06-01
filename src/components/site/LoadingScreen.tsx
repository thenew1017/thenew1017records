import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const logItems = [
  "SYSTEM INIT: 1017 SOUND ENGINE v2.42",
  "ESTABLISHING SECURE CONNECTION TO SUPABASE DB CORES...",
  "DECRYPTING AUDIO SIGNATURE KEYS...",
  "ALLOCATING MEMORY SLOTS FOR ROSTER OBJECTS [4 SELECTED]...",
  "ROSTER SECURED: [POOH SHIESTY, FOOGIANO, BIG SCARR, ENCHANTING]",
  "SYNCING SPECTROGRAMS AND DISCOGRAPHY RECORDS...",
  "SECURING HIGHEST-FIDELITY AUDIO OUTPUT CHANNELS...",
  "STATUS: READY // TRANSMISSION CHANNELS DEPLOYED."
];

export function LoadingScreen() {
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);

  useEffect(() => {
    const start = performance.now();
    const dur = 300; // Optimized to 300ms for ultra-fast loading speed
    let raf = 0;
    
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const currentPct = Math.round(p * 100);
      setProgress(currentPct);
      
      // Calculate how many log items should be shown based on progress
      const logCount = Math.min(
        logItems.length,
        Math.floor((currentPct / 100) * (logItems.length + 1))
      );
      
      if (logCount > 0) {
        setVisibleLogs(logItems.slice(0, logCount));
      }

      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => setDone(true), 100); // Optimized for instant reveal
      }
    };
    
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(20px)" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#02040a] cyber-grid px-6"
        >
          {/* Subtle glow flares */}
          <div aria-hidden className="absolute -left-32 top-1/4 h-[50vmin] w-[50vmin] rounded-full bg-purple-900/10 blur-[120px]" />
          <div aria-hidden className="absolute -right-32 bottom-1/4 h-[50vmin] w-[50vmin] rounded-full bg-yellow-900/10 blur-[120px]" />

          <div className="w-full max-w-lg border border-white/5 bg-black/40 p-6 backdrop-blur-xl rounded-md shadow-2xl relative">
            {/* Tech Corner brackets */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-white/20" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-white/20" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-white/20" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-white/20" />

            {/* Header Telemetry */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 text-[9px] uppercase tracking-[0.25em] text-muted-foreground font-mono">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_var(--color-accent)]" />
                INIT ENGINE
              </span>
              <span>UTC {new Date().toISOString().slice(11, 19)}</span>
            </div>

            {/* Title */}
            <div className="text-center py-4 mb-6">
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="font-display text-4xl uppercase tracking-tight md:text-5xl"
              >
                <span className="text-gradient-gold">1017 Records</span>
              </motion.div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mt-2 font-display font-light">
                A NEW ERA OF SOUND // SYSTEM BOOT
              </p>
            </div>

            {/* Boot Logs */}
            <div className="h-36 overflow-y-auto font-mono text-[9px] uppercase tracking-wider text-muted-foreground/80 space-y-1.5 mb-6 border border-white/5 bg-black/60 p-4 select-none scrollbar-none">
              {visibleLogs.map((log, index) => {
                const isLast = index === visibleLogs.length - 1;
                return (
                  <motion.div
                    key={log}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex items-start gap-2 ${isLast ? "text-foreground font-semibold" : ""}`}
                  >
                    <span className={isLast && progress < 100 ? "text-accent animate-pulse" : "text-white/40"}>
                      &gt;
                    </span>
                    <span className="leading-relaxed">{log}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* Progress Telemetry */}
            <div className="space-y-3">
              <div className="flex justify-between items-end text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                <span>System Loading</span>
                <span className="text-foreground font-semibold font-mono">
                  {progress.toString().padStart(3, "0")}%
                </span>
              </div>
              
              <div className="h-1.5 w-full overflow-hidden bg-white/5 border border-white/5 p-0.5 rounded-full">
                <motion.div
                  className="h-full bg-accent rounded-full shadow-[0_0_12px_rgba(230,195,0,0.5)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
