import { useState } from "react";
import { Logo } from "./Logo";

export function Footer() {
  const [isInstaHovered, setIsInstaHovered] = useState(false);
  const [isEmailHovered, setIsEmailHovered] = useState(false);

  return (
    <footer id="contact" className="relative border-t border-white/5 bg-[#000000] px-6 pb-12 pt-24 md:px-10 overflow-hidden">
      
      {/* Soft background grid pattern */}
      <div className="absolute inset-0 cyber-grid-dots opacity-[0.04] pointer-events-none" />

      {/* Dynamic columns - stacked mobile cards to desktop columns */}
      <div className="mx-auto flex flex-col gap-12 text-center items-center md:grid md:grid-cols-12 md:gap-16 md:text-left md:items-start max-w-[1600px] relative z-10">
        
        {/* Brand identity stacked card */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left md:col-span-5 border-b border-white/5 pb-10 w-full md:border-0 md:pb-0">
          <Logo />
          <p className="mt-6 max-w-sm text-[15px] md:text-xs leading-[1.7] text-muted-foreground/75 font-light">
            A new era of sound. The official digital roster portal of **The New 1017 Records** — discovering talent, releasing records, and driving global musical movements.
          </p>
        </div>

        {/* Social media stacked card */}
        <div id="social" className="flex flex-col items-center text-center md:items-center md:text-center md:col-span-4 border-b border-white/5 pb-10 w-full md:border-0 md:pb-0">
          <p className="mb-6 text-[18px] md:text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.25em] text-white/95 font-mono">
            Connect With Us
          </p>
          <div className="flex items-center justify-center gap-6">
            <a
              href="https://www.instagram.com/1017___.records"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              title="Instagram"
              onMouseEnter={() => setIsInstaHovered(true)}
              onMouseLeave={() => setIsInstaHovered(false)}
              className="inline-flex items-center justify-center cursor-pointer select-none transition-all duration-200 ease-in-out transform hover:scale-[1.12] active:scale-[0.96] focus:outline-none focus:ring-1 focus:ring-lux-gold/40 rounded-full min-w-[44px] min-h-[44px] p-2 md:min-w-[38px] md:min-h-[38px] md:p-1.5 lg:min-w-[40px] lg:min-h-[40px]"
              style={{
                color: isInstaHovered ? "#E5D5C0" : "#FAFAFA",
                filter: isInstaHovered 
                  ? "drop-shadow(0 0 8px rgba(229, 213, 192, 0.4))" 
                  : "drop-shadow(0 0 2px rgba(229, 213, 192, 0.05))",
              }}
            >
              <svg className="w-6 h-6 md:w-[22px] md:h-[22px] lg:w-[24px] lg:h-[24px] transition-all duration-200" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              </svg>
            </a>

            <a
              href="mailto:1017recordsoffcial@gmail.com"
              aria-label="Email"
              title="Email"
              onMouseEnter={() => setIsEmailHovered(true)}
              onMouseLeave={() => setIsEmailHovered(false)}
              className="inline-flex items-center justify-center cursor-pointer select-none transition-all duration-200 ease-in-out transform hover:scale-[1.12] active:scale-[0.96] focus:outline-none focus:ring-1 focus:ring-lux-gold/40 rounded-full min-w-[44px] min-h-[44px] p-2 md:min-w-[38px] md:min-h-[38px] md:p-1.5 lg:min-w-[40px] lg:min-h-[40px]"
              style={{
                color: isEmailHovered ? "#E5D5C0" : "#FAFAFA",
                filter: isEmailHovered 
                  ? "drop-shadow(0 0 8px rgba(229, 213, 192, 0.4))" 
                  : "drop-shadow(0 0 2px rgba(229, 213, 192, 0.05))",
              }}
            >
              <svg className="w-6 h-6 md:w-[22px] md:h-[22px] lg:w-[24px] lg:h-[24px] transition-all duration-200" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </a>
          </div>
        </div>

        {/* Links stacked card */}
        <div id="shop" className="flex flex-col items-center text-center md:items-start md:text-left md:col-span-3 w-full pb-4 md:pb-0">
          <p className="mb-6 text-[18px] md:text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.25em] text-white/95 font-mono">
            Roster Resources
          </p>
          <ul className="space-y-4 md:space-y-2 text-[15px] md:text-[11px] lg:text-[12px] font-bold uppercase tracking-[0.2em] leading-[1.7]">
            <li>
              <a 
                className="hover:text-lux-gold transition-colors text-foreground/75 flex items-center justify-center md:justify-start gap-2 py-1.5 md:py-0.5" 
                href="https://shop.thenew1017records.com/"
                target="_blank"
                rel="noreferrer"
              >
                Official Store
              </a>
            </li>
            <li>
              <a className="hover:text-lux-gold transition-colors text-foreground/75 py-1.5 md:py-0.5 block" href="#">
                Press & Media
              </a>
            </li>
            <li>
              <a className="hover:text-lux-gold transition-colors text-foreground/75 py-1.5 md:py-0.5 block" href="#">
                Privacy Policy
              </a>
            </li>
            <li>
              <a className="hover:text-lux-gold transition-colors text-foreground/75 py-1.5 md:py-0.5 block" href="#">
                Terms of Service
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer bottom bar */}
      <div className="mx-auto mt-20 flex max-w-[1600px] flex-col items-center justify-between gap-6 border-t border-white/5 pt-8 text-[13px] md:text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 md:flex-row md:items-center relative z-10">
        
        {/* Core copyright */}
        <span className="text-center md:text-left leading-relaxed">
          © {new Date().getFullYear()} The New 1017 Records. All Rights Reserved.
        </span>

        {/* Global branding text tags */}
        <div className="flex flex-wrap items-center justify-center gap-6">
          <span className="flex items-center gap-2 text-white/35">
            1017 RECORDS GLOBAL
          </span>
          <span className="text-white/35 hidden sm:inline">
            ●
          </span>
          <span className="text-white/35">
            DESIGNED FOR THE CULTURE.
          </span>
        </div>
      </div>
    </footer>
  );
}