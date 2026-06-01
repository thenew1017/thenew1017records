import React, { useState } from "react";
import { Globe } from "lucide-react";

// Platform Type definition
export type PlatformType =
  | "spotify"
  | "apple"
  | "youtube"
  | "instagram"
  | "tiktok"
  | "x"
  | "facebook"
  | "soundcloud"
  | "audiomack"
  | "deezer"
  | "amazon"
  | "globe";

// Extract platform dynamically from URL
export function getPlatformFromUrl(url: string): PlatformType {
  if (!url) return "globe";
  const low = url.toLowerCase().trim();
  if (low.includes("spotify.com")) return "spotify";
  if (low.includes("apple.com") || low.includes("music.apple")) return "apple";
  if (low.includes("youtube.com") || low.includes("youtu.be")) return "youtube";
  if (low.includes("instagram.com")) return "instagram";
  if (low.includes("tiktok.com")) return "tiktok";
  if (low.includes("twitter.com") || low.includes("x.com")) return "x";
  if (low.includes("facebook.com")) return "facebook";
  if (low.includes("soundcloud.com")) return "soundcloud";
  if (low.includes("audiomack.com")) return "audiomack";
  if (low.includes("deezer.com")) return "deezer";
  if (low.includes("amazon.com") || low.includes("amazon.co")) return "amazon";
  return "globe";
}

// Get display label for platforms
export function getPlatformLabel(platform: PlatformType): string {
  switch (platform) {
    case "spotify":
      return "Spotify";
    case "apple":
      return "Apple Music";
    case "youtube":
      return "YouTube";
    case "instagram":
      return "Instagram";
    case "tiktok":
      return "TikTok";
    case "x":
      return "X";
    case "facebook":
      return "Facebook";
    case "soundcloud":
      return "SoundCloud";
    case "audiomack":
      return "Audiomack";
    case "deezer":
      return "Deezer";
    case "amazon":
      return "Amazon Music";
    default:
      return "Website";
  }
}

// Get official high-visibility brand colors and neon-glow values
export function getPlatformStyles(platform: PlatformType) {
  return {
    color: "#FAFAFA",
    glow: "rgba(229, 213, 192, 0.05)",
    hoverGlow: "rgba(229, 213, 192, 0.4)",
  };
}

interface SocialIconProps {
  platform: PlatformType;
  className?: string;
}

// Official High-Fidelity SVG Platform Brand Logos - Standing completely standalone without circles, pill buttons or boxes
export function SocialIconSVG({ platform, className = "w-8 h-8 md:w-[34px] md:h-[34px] lg:w-[40px] lg:h-[40px]" }: SocialIconProps) {
  switch (platform) {
    case "spotify":
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17.502 17.31c-.22.359-.689.471-1.05.249-2.73-1.668-6.17-2.048-10.21-1.121-.413.093-.82-.167-.914-.582-.093-.413.167-.82.582-.914 4.41-.1 8.21.321 11.29 2.21.359.22.471.689.249 1.05zm1.44-3.26c-.279.449-.87.59-1.32.31-3.13-1.92-7.91-2.48-11.61-1.36-.5.15-1.02-.14-1.17-.64-.15-.5.14-1.02.64-1.17 4.23-1.28 9.51-.66 13.13 1.56.45.28.59.87.31 1.32zm.11-3.41C15.22 8.32 8.79 8.1 5.06 9.24c-.54.16-1.11-.15-1.27-.69-.16-.54.15-1.11.69-1.27 4.28-1.3 11.39-1.05 16.14 1.77.49.29.65.92.36 1.41-.29.49-.92.65-1.41.36z" />
        </svg>
      );
    case "apple":
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.54 9.103 1.51 12.06 1.005 1.45 2.19 3.078 3.766 3.014 1.52-.064 2.09-.99 3.93-.99 1.83 0 2.365.99 3.93.96 1.6-.032 2.653-1.477 3.628-2.9 1.135-1.65 1.6-3.25 1.63-3.33-.035-.015-3.136-1.2-3.17-4.787-.03-2.99 2.45-4.425 2.56-4.5-1.4-2.05-3.56-2.285-4.32-2.34-2-.162-3.41 1.04-3.94 1.04zm2.593-4.54a3.83 3.83 0 0 0 .97-2.356 3.91 3.91 0 0 0-2.54 1.3 3.66 3.66 0 0 0-.99 2.27 3.52 3.52 0 0 0 2.56-1.214z" />
        </svg>
      );
    case "youtube":
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23.49 6.12a3.01 3.01 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.39.52A3.01 3.01 0 0 0 .51 6.12a34 34 0 0 0 0 11.76 3.01 3.01 0 0 0 2.1 2.1c1.89.52 9.39.52 9.39.52s7.5 0 9.39-.52a3.01 3.01 0 0 0 2.1-2.1 34 34 0 0 0 0-11.76zM9.5 15.5V8.5l6.5 3.5z" />
        </svg>
      );
    case "instagram":
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .8.11V9.4a6.27 6.27 0 0 0-3.11-.27A6.26 6.26 0 0 0 2 15.39a6.26 6.26 0 0 0 6.26 6.26 6.25 6.25 0 0 0 6.26-6.26V7.95a11.12 11.12 0 0 0 5.07 1.25V5.79a4.8 4.8 0 0 1-2-.35z" />
        </svg>
      );
    case "x":
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "facebook":
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
        </svg>
      );
    case "soundcloud":
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23.999 14.165c-.052 1.796-1.612 3.169-3.4 3.169h-8.18a.68.68 0 0 1-.675-.683V7.862a.747.747 0 0 1 .452-.724s.75-.513 2.333-.513a5.364 5.364 0 0 1 2.763.755 5.433 5.433 0 0 1 2.57 3.54c.282-.08.574-.121.868-.12.884 0 1.73.358 2.347.992s.948 1.49.922 2.373ZM10.721 8.421c.247 2.98.427 5.697 0 8.672a.264.264 0 0 1-.53 0c-.395-2.946-.22-5.718 0-8.672a.264.264 0 0 1 .53 0ZM9.072 9.448c.285 2.659.37 4.986-.006 7.655a.277.277 0 0 1-.55 0c-.331-2.63-.256-5.02 0-7.655a.277.277 0 0 1 .556 0Zm-1.663-.257c.27 2.726.39 5.171 0 7.904a.266.266 0 0 1-.53 0c-.38-2.69-.257-5.21 0-7.904a.266.266 0 0 1 .532 0Zm-1.647.77a26.108 26.108 0 0 1-.008 7.147.272.272 0 0 1-.542 0 27.955 27.955 0 0 1 0-7.147.275.275 0 0 1 .55 0Zm-1.67 1.769c.421 1.865.228 3.5-.029 5.388a.257.257 0 0 1-.514 0c-.21-1.858-.398-3.549 0-5.389a.272.272 0 0 1 .543 0Zm-1.655-.273c.388 1.897.26 3.508-.01 5.412-.026.28-.514.283-.54 0-.244-1.878-.347-3.54-.01-5.412a.283.283 0 0 1 .56 0Zm-1.668.911c.4 1.268.257 2.292-.026 3.572a.257.257 0 0 1-.514 0c-.241-1.262-.354-2.312-.023-3.572a.283.283 0 0 1 .563 0Z" />
        </svg>
      );
    case "audiomack":
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M2.5 10.5h2v3h-2zm4-3.5h2v10h-2zm4-2.5h2v15h-2zm4 3.5h2v10h-2zm4 3.5h2v3h-2z" />
        </svg>
      );
    case "deezer":
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M2 17.5h3.2v3H2zm4.8 0h3.2v3H6.8zm4.8 0h3.2v3h-3.2zm4.8 0H22v3h-3.2zM2 13h3.2v3.5H2zm4.8 0h3.2v3.5H6.8zm4.8-4.5h3.2v8h-3.2zm4.8 4.5H22v3.5h-3.2z" />
        </svg>
      );
    case "amazon":
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8.88 20.35c-2.43 0-4.63-1.07-4.63-3.79 0-3.3 3.09-4.32 6.07-4.32 1.34 0 2.53.25 3.12.5v-.57c0-1.46-.71-2.14-2.32-2.14-1.28 0-2.25.32-3.14.71l-.54-1.35c1.18-.68 2.75-1.07 4.53-1.07 3.14 0 4.67 1.5 4.67 4.14v7.35c0 1.25.29 1.64.96 1.89v.75c-1.39.11-2.93.18-4.39.18-1.57 0-3.11-.07-4.39-.21v-.75c.96-.21 1.53-.64 1.53-1.78v-4.14c0-1.89-.78-2.68-2.14-2.68-1.6 0-2.75 1.07-2.75 3.07 0 2.14 1.39 3.14 3.75 3.14.93 0 1.86-.07 2.68-.25l.39 1.39c-1.18.36-2.5.54-3.71.54z" />
        </svg>
      );
    default:
      return <Globe className={className} aria-hidden="true" />;
  }
}

interface SocialLinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  url: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  customLabel?: string;
}

// Helper to map size prop to responsive button and icon classes to prevent desktop layout breaks
function getSocialButtonSizes(size: "sm" | "md" | "lg") {
  switch (size) {
    case "sm":
      return {
        button: "min-w-[44px] min-h-[44px] p-2 md:min-w-[32px] md:min-h-[32px] md:p-1 lg:min-w-[32px] lg:min-h-[32px]",
        icon: "w-5 h-5 md:w-[18px] md:h-[18px] lg:w-[18px] lg:h-[18px]"
      };
    case "md":
      return {
        button: "min-w-[44px] min-h-[44px] p-2 md:min-w-[38px] md:min-h-[38px] md:p-1.5 lg:min-w-[40px] lg:min-h-[40px]",
        icon: "w-6 h-6 md:w-[22px] md:h-[22px] lg:w-[24px] lg:h-[24px]"
      };
    case "lg":
    default:
      return {
        button: "min-w-[44px] min-h-[44px] p-2 md:min-w-[48px] md:min-h-[48px] lg:min-w-[48px] lg:min-h-[48px]",
        icon: "w-8 h-8 md:w-[34px] md:h-[34px] lg:w-[40px] lg:h-[40px]"
      };
  }
}

// Redesigned Standalone Minimalist SVG Platform Button
export function SocialLinkButton({
  url,
  size = "md",
  className = "",
  customLabel,
  ...props
}: SocialLinkButtonProps) {
  if (!url) return null;
  const platform = getPlatformFromUrl(url);
  const label = customLabel || getPlatformLabel(platform);
  const styles = getPlatformStyles(platform);
  const [hovered, setHovered] = useState(false);
  const sizes = getSocialButtonSizes(size);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`inline-flex items-center justify-center cursor-pointer select-none transition-all duration-200 ease-in-out transform hover:scale-[1.12] active:scale-[0.96] focus:outline-none focus:ring-1 focus:ring-lux-gold/40 rounded-full ${sizes.button} ${className}`}
      style={{
        color: hovered ? "#E5D5C0" : "#FAFAFA",
        filter: hovered 
          ? `drop-shadow(0 0 8px rgba(229, 213, 192, 0.4))` 
          : `drop-shadow(0 0 2px rgba(229, 213, 192, 0.05))`,
      }}
      {...props}
    >
      <SocialIconSVG 
        platform={platform} 
        className={`${sizes.icon} transition-all duration-200`} 
      />
    </a>
  );
}

interface SocialLinksRowProps {
  urls: (string | null | undefined)[];
  size?: "sm" | "md" | "lg";
  spacingClass?: string;
  className?: string;
}

// Redesigned Horizontal Standalone Row (Display: flex; align-items: center; gap: 28px)
export function SocialLinksRow({
  urls,
  size = "md",
  spacingClass = "gap-[28px]", // exactly 28px gap
  className = "",
}: SocialLinksRowProps) {
  const validUrls = urls.filter((url): url is string => !!url && url.trim().length > 0);

  if (validUrls.length === 0) return null;

  return (
    <div className={`flex items-center ${spacingClass} ${className}`}>
      {validUrls.map((url, idx) => (
        <SocialLinkButton key={`${url}-${idx}`} url={url} size={size} />
      ))}
    </div>
  );
}
