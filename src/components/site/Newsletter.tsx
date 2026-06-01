import { motion } from "motion/react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { subscribeNewsletter } from "@/lib/cms.functions";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const subscribe = useServerFn(subscribeNewsletter);

  return (
    <section id="newsletter" className="relative px-6 py-28 md:px-10 border-t border-white/5 bg-[#000000] overflow-hidden">
      
      {/* Soft radial gold glow behind layout */}
      <div className="pointer-events-none absolute right-1/4 top-1/2 -z-10 h-[50vmin] w-[50vmin] -translate-y-1/2 glow-gold opacity-5" />
      
      <div className="mx-auto grid max-w-[1600px] gap-16 md:grid-cols-12 relative z-10 items-center">
        
        {/* Left Copy Panel */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="md:col-span-6 space-y-6 text-center md:text-left flex flex-col items-center md:items-start"
        >
          {/* 30% Larger glowing gold badge */}
          <div className="inline-flex items-center gap-2 border border-[#E5D5C0]/20 bg-[#E5D5C0]/5 px-5 py-2 rounded-full text-xs font-semibold tracking-[0.25em] text-[#E5D5C0] shadow-[0_0_15px_rgba(229,213,192,0.12)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E5D5C0] animate-pulse" />
            ✦ EXCLUSIVE MEMBER ACCESS
          </div>
          
          <h2 className="font-display text-5xl uppercase leading-[0.9] text-white md:text-7xl font-black tracking-tighter">
            ENTER THE <br />
            <span className="text-stroke font-black">1017 NETWORK.</span>
          </h2>
          
          <p className="max-w-md text-[15px] leading-[1.7] text-muted-foreground/80 border-l-2 border-[#E5D5C0]/20 pl-5 font-light text-left">
            Join a global community of artists and fans. Receive priority access to releases, events, exclusive content, and future opportunities.
          </p>
        </motion.div>

        {/* Right Form Panel */}
        <motion.form
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          onSubmit={async (e) => {
            e.preventDefault();
            if (!email) return;
            setBusy(true);
            try { 
              await subscribe({ data: { email } }); 
              setSent(true); 
            }
            catch { 
              setSent(true); 
            }
            finally { 
              setBusy(false); 
            }
          }}
          className="flex flex-col gap-6 md:col-span-6 bg-[#050505] border border-white/[0.04] p-8 sm:p-10 rounded-[24px] shadow-2xl relative"
        >
          {/* Beveled light reflections */}
          <div className="absolute top-6 left-6 w-3 h-3 border-t border-l border-white/10 pointer-events-none" />
          <div className="absolute top-6 right-6 w-3 h-3 border-t border-r border-white/10 pointer-events-none" />

          {/* Form Header */}
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/30 border-b border-white/5 pb-4 mb-2 font-mono">
            <span>1017 VIP GATEWAY</span>
            <span>EXCLUSIVE NETWORK</span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field 
              label="Email Address" 
              value={email} 
              onChange={setEmail} 
              type="email" 
              required 
              placeholder="name@domain.com"
            />
            <Field 
              label="Zip Code (Optional)" 
              value={postalCode}
              onChange={setPostalCode}
              placeholder="30301"
            />
          </div>
          
          {/* Consent Checkbox */}
          <label className="flex items-start gap-3.5 text-xs leading-relaxed text-muted-foreground mt-2 cursor-pointer select-none">
            <input 
              type="checkbox" 
              required
              defaultChecked
              className="mt-1.5 h-4.5 w-4.5 rounded bg-black border-white/10 accent-[#E5D5C0] cursor-pointer" 
            />
            <span className="font-light text-[12px] leading-relaxed text-zinc-400">
              I authorize The New 1017 Records to send communications regarding releases, events, and exclusive network opportunities. I can unsubscribe at any time.
            </span>
          </label>
          
          {/* Champagne Gold Gradient Button */}
          <button
            type="submit"
            className="group relative inline-flex h-14 items-center justify-center overflow-hidden bg-gradient-to-r from-[#E5D5C0] via-[#F1E5D1] to-[#C9B9A5] hover:from-[#F1E5D1] hover:via-[#FBF5ED] hover:to-[#D5C5B0] text-black font-mono text-[10px] font-extrabold uppercase tracking-[0.3em] shadow-[0_4px_20px_rgba(229,213,192,0.12)] hover:shadow-[0_12px_35px_rgba(229,213,192,0.25)] transition-all duration-500 rounded-full hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
          >
            <span className="relative z-10">
              {sent ? "SUBSCRIBED ✓" : busy ? "JOINING THE NETWORK..." : "JOIN THE NETWORK"}
            </span>
          </button>
        </motion.form>
      </div>
    </section>
  );
}

function Field({
  label, value, onChange, type = "text", required, placeholder
}: { label: string; value?: string; onChange?: (v: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <label className="group relative block w-full">
      <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 transition-colors group-focus-within:text-[#E5D5C0]">
        {label}
      </span>
      {/* text-base base size on mobile to prevent iOS Safari auto zoom */}
      <input
        type={type}
        required={required}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className="mt-2.5 w-full border border-white/[0.06] bg-white/[0.02] px-5 py-4 text-base md:text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-[#E5D5C0] rounded-[14px] focus:bg-white/[0.04] focus:ring-1 focus:ring-[#E5D5C0]/20 font-mono"
      />
    </label>
  );
}