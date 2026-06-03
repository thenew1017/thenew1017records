import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useIsMobile } from "@/hooks/useIsMobile";

interface TransitionContextType {
  isTransitioning: boolean;
  startTransition: (to: string) => Promise<void>;
}

const TransitionContext = createContext<TransitionContextType | null>(null);

export function usePageTransition() {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error("usePageTransition must be used within a PageTransitionProvider");
  }
  return context;
}

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionTo, setTransitionTo] = useState<string | null>(null);
  const navigate = useNavigate();
  const router = useRouter();
  const isMobile = useIsMobile();

  const startTransition = async (to: string) => {
    if (isMobile) {
      await navigate({ to: to as any });
      return;
    }
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTransitionTo(to);
  };

  useEffect(() => {
    if (isTransitioning && transitionTo) {
      // 1. Wait for fade-in animation to complete (200ms)
      const timer = setTimeout(async () => {
        // 2. Perform the actual navigation instantly under the cover of pure black
        await navigate({ to: transitionTo as any });
        
        // 3. Force router to resolve layout/hydration
        router.commitLocation(router.state.location);

        // 4. Trigger the fade-out phase
        setTransitionTo(null);
      }, 250); // slight buffer to ensure full black opacity is reached

      return () => clearTimeout(timer);
    }
  }, [isTransitioning, transitionTo, navigate, router]);

  // When transitionTo is null but isTransitioning is still true, we are in the fade-out exit phase
  useEffect(() => {
    if (isTransitioning && !transitionTo) {
      // 5. Wait for fade-out animation to complete (300ms)
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 350); // exit animation buffer

      return () => clearTimeout(timer);
    }
  }, [isTransitioning, transitionTo]);

  return (
    <TransitionContext.Provider value={{ isTransitioning, startTransition }}>
      {children}
    </TransitionContext.Provider>
  );
}

export function PageTransitionOverlay() {
  const { isTransitioning } = usePageTransition();
  const isMobile = useIsMobile();

  return (
    <AnimatePresence>
      {!isMobile && isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.25,
            ease: [0.16, 1, 0.3, 1] // Elite premium easing curve (Cubic Bezier)
          }}
          className="fixed inset-0 z-[9999] bg-[#000000] flex flex-col items-center justify-center pointer-events-auto"
        >
          {/* Subtle luxurious gold ambient light inside the transition */}
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,213,192,0.03),transparent_70%)] pointer-events-none" />
          
          {/* Elite minimalist loading pulse indicator */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: [0, 0.8, 0], scale: [0.98, 1, 0.98] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="flex flex-col items-center space-y-4"
          >
            <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#E5D5C0] to-transparent shadow-[0_0_12px_rgba(229,213,192,0.4)]" />
            <span className="text-[8px] font-mono uppercase tracking-[0.4em] text-[#E5D5C0]/70">
              1017 Gateway
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface TransitionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function TransitionLink({ to, children, className = "", onClick, ...props }: TransitionLinkProps) {
  const { startTransition } = usePageTransition();

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onClick) {
      onClick(e);
    }
    // Start premium transition overlay
    await startTransition(to);
  };

  return (
    <a href={to} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
}
