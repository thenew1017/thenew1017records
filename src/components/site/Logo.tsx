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
      <div className="absolute -inset-3 bg-gradient-to-r from-[#E5D5C0]/5 to-white/5 opacity-0 blur-xl group-hover:opacity-100 transition-opacity duration-500 rounded-full pointer-events-none" />
      
      {/* Clean Logo Digits */}
      <div className="relative flex items-center gap-3.5 md:gap-4">
        {/* Big Editorial 1017 block */}
        <span 
          style={{ letterSpacing: "-0.04em" }}
          className={`font-display font-black text-white group-hover:text-[#D4AF37] transition-all duration-500 leading-none ${
            scrolled ? "text-xl sm:text-2xl" : "text-2xl sm:text-3.5xl"
          }`}
        >
          1017
        </span>
        
        {/* Clean Luxury Divider */}
        <span className="h-5 w-[1px] bg-white/10 group-hover:bg-[#E5D5C0]/30 transition-colors duration-500" />
        
        {/* Balanced brand secondary description */}
        <span 
          className={`font-sans font-black uppercase tracking-[0.35em] text-white/45 group-hover:text-[#E5D5C0] transition-colors duration-500 leading-none ${
            scrolled ? "text-[8px]" : "text-[9px]"
          }`}
        >
          THE NEW RECORDS
        </span>
      </div>
    </Link>
  );
}