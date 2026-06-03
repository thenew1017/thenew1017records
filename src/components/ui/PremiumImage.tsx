import React, { useState, useEffect, useRef } from "react";

interface PremiumImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aspectRatioClass?: string; // e.g., "aspect-[3/4]"
  className?: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  fallbackSrc?: string;
}

export function PremiumImage({
  src,
  alt,
  aspectRatioClass = "aspect-square",
  className = "",
  loading = "lazy",
  fetchPriority = "auto",
  fallbackSrc,
  style,
  ...props
}: PremiumImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Preload critical images above the fold
  useEffect(() => {
    if (loading === "eager" || fetchPriority === "high") {
      const img = new Image();
      img.src = src;
    }
  }, [src, loading, fetchPriority]);

  // Sync complete state if image is already cached/loaded before hydration
  useEffect(() => {
    if (imgRef.current) {
      if (imgRef.current.complete) {
        setLoaded(true);
      } else {
        setLoaded(false);
      }
    }
  }, [src]);

  // Callback ref is executed as soon as the element is mounted/rendered to the DOM
  const refCallback = (node: HTMLImageElement | null) => {
    // @ts-ignore
    imgRef.current = node;
    if (node && node.complete) {
      setLoaded(true);
    }
  };

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    console.error(`❌ [PremiumImage Error] Failed to load image from URL: "${src}" (Alt: "${alt}")`);
    setError(true);
  };

  const finalSrc = error && fallbackSrc ? fallbackSrc : src;

  return (
    <div 
      className={`relative overflow-hidden w-full h-full ${aspectRatioClass} bg-[#0b0c10] rounded-[inherit] artist-photo-container`}
    >
      {/* Premium Dark Gradient Shimmer Skeleton */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0e12] via-[#1a1c24] to-[#0d0e12] bg-[length:200%_100%] animate-shimmer pointer-events-none rounded-[inherit]" />
      )}

      {/* Actual Image */}
      {finalSrc && (
        <img
          ref={refCallback}
          src={finalSrc}
          alt={alt}
          loading={loading}
          // @ts-ignore
          fetchpriority={fetchPriority}
          onLoad={handleLoad}
          onError={handleError}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[450ms] ease-out ${
            loaded ? "opacity-100" : "opacity-0"
          } ${className}`}
          style={{
            objectFit: "cover",
            imageRendering: "auto",
            ...style
          }}
          {...props}
        />
      )}

      {/* Fallback Display if Error & No Fallback Image */}
      {error && !fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 text-zinc-500 text-[10px] font-mono uppercase tracking-widest select-none p-4 text-center rounded-[inherit] border border-white/5">
          Dossier Offline
        </div>
      )}
    </div>
  );
}

