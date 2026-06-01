import { Link, useLocation } from "@tanstack/react-router";

export function Logo({ className = "", scrolled = false }: { className?: string; scrolled?: boolean }) {
  const location = useLocation();

  const handleLogoClick = (e: React.MouseEvent) => {
    if (location.pathname === "/") {
      e.preventDefault();
      // Smoothly scroll to top first
      window.scrollTo({ top: 0, behavior: "smooth" });
      
      // Then trigger full page reload after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 250);
    } else {
      // Navigate to homepage, scroll instantly to top
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  return (
    <Link
      to="/"
      onClick={handleLogoClick}
      aria-label="1017 Records Home"
      className={`inline-flex items-center gap-3 group cursor-pointer transition-all duration-500 select-none active:scale-[0.97] transform-gpu relative ${className}`}
    >
      {/* Subtle background glow that blossoms on hover */}
      <div className="absolute -inset-3 bg-gradient-to-r from-lux-gold/5 to-white/5 opacity-0 blur-xl group-hover:opacity-100 transition-opacity duration-500 rounded-full pointer-events-none" />
      
      {/* Clean Logo Digits (No boxes around logo) */}
      <div className="relative flex items-center gap-3">
        {/* Big Editorial 1017 block */}
        <span className={`font-display font-black tracking-tighter text-white transition-all duration-500 ${
          scrolled ? "text-2xl" : "text-3xl"
        }`}>
          1017
        </span>
        
        {/* Divider */}
        <span className="h-6 w-[1px] bg-white/10 transition-colors group-hover:bg-white/20" />
        
        {/* Vertical brand description */}
        <div className="flex flex-col leading-none">
          <span className="text-[8px] font-bold uppercase tracking-[0.35em] text-lux-gold transition-colors group-hover:text-lux-cream pb-0.5">
            THE NEW
          </span>
          <div className="flex items-center gap-1.5">
            <span className={`font-sans font-black tracking-wider text-white transition-all duration-500 ${
              scrolled ? "text-xs" : "text-sm"
            }`}>
              RECORDS
            </span>
            {/* Glowing Verified Badge */}
            <svg 
              className="w-3.5 h-3.5 text-[#1877F2] fill-current drop-shadow-[0_0_6px_rgba(24,119,242,0.8)] hover:scale-110 transition-transform duration-300 pointer-events-none" 
              viewBox="0 0 24 24"
            >
              <path d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.7l-3.61.81.34 3.68L1 12l2.44 2.79-.34 3.69 3.61.82 1.89 3.2 3.4-1.46 3.4 1.46 1.89-3.2 3.61-.82-.34-3.69L23 12zm-13 5l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}