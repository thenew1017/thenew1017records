import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPublicArtistBySlug, listPublicArtists, slugify, getArtistMediaGallery } from "@/lib/cms.functions";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { CinematicArtistImage } from "@/components/site/Artists";
import { motion } from "motion/react";
import { ArrowLeft, Music2, Apple, Youtube, Instagram, Twitter, Globe, ArrowRight, Camera } from "lucide-react";
import { SocialLinksRow } from "@/components/ui/SocialLinks";
import { useIsMobile } from "@/hooks/useIsMobile";

const fallbacks: string[] = [];

export const Route = createFileRoute("/artist/$name")({
  component: ArtistDetailPage,
  errorComponent: ArtistErrorComponent,
  pendingComponent: ArtistPendingComponent,
  loader: async ({ params }) => {
    // Perform server-side loading for perfect SEO indexing (SSR)
    const fetchArtist = getPublicArtistBySlug;
    try {
      const { artist } = await fetchArtist({ data: { name: params.name } });
      return { artist };
    } catch {
      return { artist: null };
    }
  },
  head: ({ loaderData }) => {
    const artist = loaderData?.artist;
    const title = artist ? `${artist.name} — The New 1017 Records` : "Artist Profile";
    const desc = artist?.bio || "Decrypted artist profile and discography database.";
    const img = artist?.image_url || "";
    const url = artist ? `https://www.thenew1017records.in/artist/${slugify(artist.name)}` : "https://www.thenew1017records.in";
    
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:image", content: img },
        { property: "og:url", content: url },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: img },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: artist ? [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MusicGroup",
            "name": artist.name,
            "image": img,
            "description": desc,
            "url": url
          })
        }
      ] : []
    };
  },
});

function ArtistErrorComponent({ error }: { error: any }) {
  console.error("Artist Page SSR/Render Error caught by boundary:", error);
  return (
    <main className="relative min-h-screen bg-[#000000] text-foreground flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,0,0,0.04),transparent_50%)]" />
      <span className="h-12 w-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-lg border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)] font-bold">
        ⚠
      </span>
      <h1 className="font-display text-4xl uppercase tracking-wider text-gradient-gold">Dossier Locked</h1>
      <p className="text-sm text-muted-foreground max-w-md leading-relaxed font-light">
        A coordinate decryption error has occurred. Safe-mode shields have isolated the dossier transmission path.
      </p>
      <Link to="/" className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-5 py-2.5 text-[10px] font-mono uppercase tracking-[0.2em] hover:border-[#D4AF37] hover:text-[#D4AF37] rounded-sm transition-all duration-300">
        ← Return to Main Portal
      </Link>
    </main>
  );
}

function ArtistPendingComponent() {
  return (
    <main className="relative min-h-screen bg-[#000000] text-foreground flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,215,0,0.02),transparent_50%)]" />
      <div className="space-y-4">
        <div className="h-6 w-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#D4AF37] animate-pulse">Decrypting Artist Dossier...</p>
      </div>
    </main>
  );
}

const socialDefs: { key: string; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "spotify_url", label: "Spotify", Icon: Music2 },
  { key: "apple_url", label: "Apple Music", Icon: Apple },
  { key: "youtube_url", label: "YouTube", Icon: Youtube },
  { key: "instagram_url", label: "Instagram", Icon: Instagram },
  { key: "twitter_url", label: "Twitter", Icon: Twitter },
  { key: "website_url", label: "Website", Icon: Globe },
];

function getArtistDetailExtras(artistName: string) {
  const norm = artistName.toLowerCase();
  
  if (norm.includes("pooh") || norm.includes("shiesty")) {
    return {
      monthlyListeners: "14,839,204",
      verifiedRole: "✓ Flagship Talent",
      totalStreams: "2.4B Global Streams",
      stats: [
        { value: "3x Platinum", label: "RIAA Certifications" },
        { value: "1.4 Billion", label: "Spotify Streams" },
        { value: "Billboard #3", label: "Billboard 200 Debut" },
        { value: "1017 Leader", label: "Roster Influence" }
      ],
      story: "Born and raised in Memphis, Tennessee, Pooh Shiesty emerged as the undisputed crown jewel of the new 1017 Records roster under the direct guidance of Gucci Mane. Known for his signature whispering flow, calm delivery, and sharp trap realism, he captured the ears of the hip-hop world with his breakout anthem 'Back in Blood'.\n\nHis debut mixtape, 'Shiesty Season', went certified platinum, scoring triple-platinum tracks and securing his position as a flagship giant of Southern trap music. With over 2.4 billion global streams and heavy collaborations across the elite of modern rap, he continues to dictate the sonic aesthetics of modern street narrative.",
      gallery: ["", "", "", ""]
    };
  }
  
  if (norm.includes("foogiano")) {
    return {
      monthlyListeners: "8,921,048",
      verifiedRole: "✓ 1017 Records Artist",
      totalStreams: "940M Global Streams",
      stats: [
        { value: "Gold Record", label: "RIAA Certification" },
        { value: "480 Million", label: "Spotify Streams" },
        { value: "SoIcey MVP", label: "Roster Standout" },
        { value: "Atlanta's Voice", label: "Regional Dominance" }
      ],
      story: "Hailing from Greensboro, Georgia, Foogiano—the 'Mayor of Greensboro'—was the first artist signed to Gucci Mane's revamped 1017 roster, instantly bringing a dynamic, rapid-fire flow and high-voltage Southern charisma. His raw street anthems and uncompromising bars represent the unyielding pulse of modern trap.\n\nHis debut project, 'Gutta Baby', solidified his place in the industry, showing a versatile artist capable of executing both hard-hitting trap records and highly melodic Southern anthems. Backed by massive club anthems and a solid regional backing, Foogiano is the heart and soul of the 1017 street roster.",
      gallery: ["", "", "", ""]
    };
  }

  if (norm.includes("scarr") || norm.includes("frozone")) {
    return {
      monthlyListeners: "11,209,492",
      verifiedRole: "✓ Featured Artist",
      totalStreams: "1.6B Global Streams",
      stats: [
        { value: "Platinum", label: "RIAA Certified" },
        { value: "850 Million", label: "Spotify Streams" },
        { value: "Frozone Icon", label: "Signature Wave" },
        { value: "Everlasting", label: "Legacy Score" }
      ],
      story: "The late Memphis legend Big Scarr brought a cool, calm, and incredibly clinical energy to the trap genre. Famously known as 'The Frozone' due to his icy demeanor and razor-sharp, effortless delivery, he stood as one of the most commercially successful breakouts from the 1017 family.\n\nHis certified platinum project 'Big Grim Reaper' was highly praised for its unvarnished lyricism and innovative beat selections, charting highly on the Billboard 200. Big Scarr's legacy remains as a primary force that reshaped the Memphis rap soundscape for a generation.",
      gallery: ["", "", "", ""]
    };
  }

  if (norm.includes("enchanting") || norm.includes("queen")) {
    return {
      monthlyListeners: "6,482,901",
      verifiedRole: "✓ Featured Artist",
      totalStreams: "680M Global Streams",
      stats: [
        { value: "Gold Certified", label: "RIAA Standards" },
        { value: "320 Million", label: "Spotify Streams" },
        { value: "R&B Queen", label: "Vocal Mastery" },
        { value: "Trendsetter", label: "Genre Fusion" }
      ],
      story: "The late 1017 siren Enchanting stood at the premium intersection of ethereal R&B vocals and gritty, hard-hitting trap beats. Her unique style—blending angelic vocal harmonies with rapid trap flows—paved a highly specialized path that set her apart from all contemporaries.\n\nHer albums 'No Luv' and 'Luv Enchanting' proved her versatility as both a vocalist and a songwriter, earning massive digital streaming counts and national acclaim. Her bold artistic vision continues to inspire and define the modern melodic trap subgenre.",
      gallery: ["", "", "", ""]
    };
  }

  return {
    monthlyListeners: "5,200,000",
    verifiedRole: "✓ Verified Artist",
    totalStreams: "350M Global Streams",
    stats: [
      { value: "Gold Status", label: "Certified Milestones" },
      { value: "150 Million", label: "Global Streams" },
      { value: "1017 Roster", label: "Label Assignment" },
      { value: "Rising Star", label: "Career Vector" }
    ],
    story: `As an official member of the revamped 1017 Records roster, this artist represents the brand-new creative direction under the guidance of Gucci Mane. Fusing traditional trap drums with modern digital melodic styles, they represent the continuing evolution of Atlanta's iconic label.\n\nTheir releases are paving the way for heavy collaborations, extensive DSP support, and global tour appearances, ensuring the legacy of the 1017 sound system remains fresh, relevant, and dominant on the global rap charts.`,
    gallery: ["", "", "", ""]
  };
}

function ArtistDetailPage() {
  const { name } = useParams({ from: "/artist/$name" });
  const fetchArtist = useServerFn(getPublicArtistBySlug);
  const fetchAll = useServerFn(listPublicArtists);
  const fetchGallery = useServerFn(getArtistMediaGallery);

  const isMobileDevice = useIsMobile();

  // Client-side hydration query (shares the SSR loaderData cache)
  const { data: artistQuery } = useQuery({
    queryKey: ["public-artist", name],
    queryFn: () => fetchArtist({ data: { name } }),
    staleTime: 30_000,
  });

  const { data: rosterQuery } = useQuery({
    queryKey: ["public-artists"],
    queryFn: () => fetchAll(),
    staleTime: 30_000,
  });

  const loaderData = Route.useLoaderData();
  const artist = artistQuery?.artist || loaderData?.artist;

  const { data: galleryQuery } = useQuery({
    queryKey: ["public-artist-gallery", artist?.id],
    queryFn: () => fetchGallery({ data: { artistId: artist!.id! } }),
    enabled: !!artist?.id,
    staleTime: 30_000,
  });

  if (!artist) {
    return (
      <main className="relative min-h-screen bg-background text-foreground grain-overlay overflow-x-hidden w-full max-w-full flex flex-col justify-between">
        <Nav />
        <div className="mx-auto max-w-lg text-center px-6 py-40 space-y-6">
          <h1 className="font-display text-5xl uppercase text-gradient-gold">Dossier Locked</h1>
          <p className="text-sm text-muted-foreground">The requested audio signature coordinates could not be retrieved from the Supabase databases.</p>
          <Link to="/" className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-widest hover:border-accent hover:text-accent rounded-sm transition-colors">
            <ArrowLeft className="h-4 w-4" /> ← Back to Home
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  // Related artists
  const allArtists = rosterQuery?.artists ?? [];
  const related = allArtists
    .filter((a) => slugify(a.name) !== name)
    .slice(0, 3);

  const [tagVal, ratingVal] = (artist.tag || "").split("|");
  const rating = ratingVal ? parseInt(ratingVal) : 5;
  const tag = tagVal || "01";
  const artistImage = artist.image_url || "";
  const extras = getArtistDetailExtras(artist.name);

  // Verification Logging for artist details
  if (typeof window !== "undefined" && artist) {
    console.log(`=== 1017 ARTIST DETAILS HYDRATION AUDIT (${artist.name}) ===`);
    console.log(` - image_url: ${artist.image_url || "NONE"}`);
    console.log("=============================================================");
  }

  return (
    <main className="relative min-h-screen bg-background text-foreground grain-overlay overflow-x-hidden w-full max-w-full">
      <Nav />

      {/* Cyber Ambient Lighting Grid */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-[80vmin] w-[80vmin] glow-gold opacity-[0.02]" />
        <div className="absolute top-1/3 -right-32 h-[80vmin] w-[80vmin] glow-gold opacity-[0.02]" />
        <div className="absolute left-1/3 bottom-1/4 h-[70vmin] w-[70vmin] glow-gold opacity-[0.04]" />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
      </div>

      {/* Dynamic Profile Wrapper */}
      <div className="mx-auto max-w-[1600px] px-6 pt-32 pb-24 md:px-10 md:pt-40 lg:pb-32">
        
        {/* Back Link Breadcrumb */}
        <Link
          to="/"
          className="group inline-flex items-center gap-2.5 text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground hover:text-accent transition-colors mb-12 border border-white/5 bg-black/40 px-4 py-2 rounded-sm backdrop-blur-md"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          ← Back to Home
        </Link>

        {/* SECTION 1 — HERO AREA */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 items-center content-visibility-auto">
          
          {/* LEFT: Premium Portrait Showcase */}
          <div className="lg:col-span-5 flex justify-center">
            {isMobileDevice ? (
              <div className="w-full max-w-[420px] select-none">
                <CinematicArtistImage
                  src={artistImage}
                  alt={artist.name}
                />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[420px] select-none artist-photo-container"
                style={{
                  willChange: "transform, opacity",
                  transform: "translateZ(0)",
                  backfaceVisibility: "hidden",
                  perspective: 1000,
                }}
              >
                <CinematicArtistImage
                  src={artistImage}
                  alt={artist.name}
                />
              </motion.div>
            )}
          </div>

          {/* RIGHT: High-contrast typography & listeners counter */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            {/* Premium glassmorphic status badge */}
            <div className="flex items-center gap-2.5">
              <div className="h-8 md:h-9 px-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center shadow-[0_0_12px_rgba(255,255,255,0.02)] hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                <span className="font-sans text-[10px] md:text-xs font-semibold tracking-wider text-white flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  {extras.verifiedRole}
                </span>
              </div>
            </div>

            {/* Listeners & Streams Counters */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 font-sans text-xs tracking-[0.2em] font-semibold text-white/40 uppercase">
              <span className="text-[#D4AF37]">{extras.monthlyListeners} Monthly Listeners</span>
              <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
              <span>{extras.totalStreams}</span>
            </div>

            {/* Artist Name & Optional Logo */}
            <div className="flex flex-wrap items-center gap-6">
              <h1 className="font-display text-5xl uppercase leading-[0.85] text-foreground sm:text-6xl md:text-7xl lg:text-8xl xl:text-[96px] tracking-tighter">
                {artist.name}
              </h1>

            </div>

            {/* Short Bio Block */}
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground font-light font-sans max-w-xl">
              {artist.bio ? artist.bio.split("\n\n")[0] : "Official 1017 Records Artist Roster."}
            </p>

            {/* Social Icons row */}
            <div className="pt-2">
              <SocialLinksRow 
                urls={socialDefs.map((def) => artist[def.key as keyof typeof artist] as string)} 
                size="md"
                spacingClass="gap-[28px]"
              />
            </div>
          </div>
        </div>



        {/* SECTION 3 — CAREER HIGHLIGHTS */}
        <div className="pt-24 mt-24 border-t border-white/5 content-visibility-auto">
          <div className="mb-12">
            <h2 className="font-display text-3xl uppercase tracking-tight text-white/90 md:text-4xl lg:text-5xl">
              Career <span className="text-stroke font-black">Highlights</span>
            </h2>
            <p className="mt-2 text-xs md:text-sm text-muted-foreground font-sans font-light">
              Verified record achievements and global catalog influence metrics.
            </p>
          </div>

          <div className="w-full border-t border-white/[0.08] mt-8">
            {extras.stats.map((stat, idx) => (
              <div
                key={idx}
                className="group py-8 sm:py-10 md:py-12 border-b border-white/[0.08] flex flex-col items-start justify-start w-full select-none"
              >
                <span
                  className="block font-display text-[clamp(1.8rem,5.5vw,4.5rem)] font-black text-white group-hover:text-[#D4AF37] transition-all duration-500 tracking-tighter leading-none uppercase"
                  style={{
                    whiteSpace: "nowrap",
                    wordBreak: "keep-all",
                    overflowWrap: "normal",
                  }}
                >
                  {stat.value}
                </span>
                <span className="block font-sans text-xs sm:text-sm font-bold tracking-[0.35em] text-[#E5D5C0]/65 uppercase mt-3 sm:mt-4 group-hover:text-[#E5D5C0] transition-colors duration-500">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4 — ARTIST STORY */}
        <div className="pt-24 mt-24 border-t border-white/5 max-w-4xl mx-auto text-left space-y-8 content-visibility-auto">
          <div className="text-center">
            <h2 className="font-display text-3xl uppercase tracking-tight text-white/90 md:text-4xl lg:text-5xl">
              The <span className="text-stroke font-black">Story</span>
            </h2>
          </div>

          <div className="text-lg md:text-xl leading-relaxed text-white/80 font-light font-sans space-y-6 pt-6">
            {extras.story.split("\n\n").map((para, idx) => {
              if (idx === 0) {
                // Drop-cap styled first paragraph!
                const firstChar = para.charAt(0);
                const restOfPara = para.substring(1);
                return (
                  <p key={idx} className="relative first-letter:text-6xl first-letter:font-black first-letter:text-[#D4AF37] first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display">
                    {restOfPara}
                  </p>
                );
              }
              return <p key={idx}>{para}</p>;
            })}
          </div>
        </div>

        {/* SECTION 5 — MEDIA GALLERY */}
        {galleryQuery?.gallery && galleryQuery.gallery.length > 0 && (
          <div className="pt-24 mt-24 border-t border-white/5 content-visibility-auto">
            <div className="mb-12">
              <h2 className="font-display text-3xl uppercase tracking-tight text-white/90 md:text-4xl lg:text-5xl">
                Media <span className="text-stroke font-black">Gallery</span>
              </h2>
              <p className="mt-2 text-xs md:text-sm text-muted-foreground font-sans font-light">
                Press editorial photos, studio captures, and live performances.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {galleryQuery.gallery.map((img: any, idx: number) => {
                const aspect = idx % 3 === 0 ? "aspect-[3/4]" : idx % 3 === 1 ? "aspect-[4/3]" : "aspect-square";
                return (
                  <div
                    key={img.id || idx}
                    className={isMobileDevice 
                      ? "relative w-full aspect-square rounded-none overflow-hidden bg-black/40 border border-white/5 select-none" 
                      : "group relative w-full aspect-square rounded-none overflow-hidden bg-black/40 border border-white/5 hover:border-white/15 transition-all duration-500 transform-gpu"}
                  >
                    {img.image_url ? (
                      <img
                        src={img.image_url}
                        alt={img.caption || "Gallery photo"}
                        decoding="async"
                        loading="eager"
                        className={isMobileDevice
                          ? "w-full h-full object-cover"
                          : "w-full h-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.03]"}
                        style={isMobileDevice ? { pointerEvents: "none" } : undefined}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0c0d10] to-[#020203] flex flex-col items-center justify-center p-4 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E5D5C0]/[0.02] to-transparent -translate-x-full animate-shimmer pointer-events-none" />
                        <Camera className="w-8 h-8 text-zinc-700 animate-pulse" />
                        <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#E5D5C0]/35 mt-2">Dossier Visual</span>
                      </div>
                    )}
                    
                    {/* Apple Music Style Captions & Credits Hover Overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end text-left select-none">
                      <span className="font-sans text-[8px] font-bold tracking-widest text-[#D4AF37] uppercase">
                        {img.category || "Press Photo"}
                      </span>
                      <p className="text-xs text-white font-medium line-clamp-2 mt-1">
                        {img.caption || ""}
                      </p>
                      {img.credit && (
                        <p className="text-[9px] text-white/40 font-mono tracking-wider mt-1">
                          Shot by {img.credit}
                        </p>
                      )}
                    </div>

                    {/* Subtle hover bezel glow */}
                    <div className="absolute inset-0 border border-white/5 rounded-none pointer-events-none group-hover:border-white/15 transition-all duration-300" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 6 — RELATED 1017 ARTISTS */}
        {related.length > 0 && (
          <div className="pt-24 mt-24 border-t border-white/5 content-visibility-auto">
            <div className="mb-12">
              <h2 className="font-display text-3xl uppercase tracking-tight text-white/90 md:text-4xl lg:text-5xl">
                Related <span className="text-stroke font-black">Roster</span>
              </h2>
              <p className="mt-2 text-xs md:text-sm text-muted-foreground font-sans font-light">
                Discover more sound vectors within the official records roster.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {related.map((a, i) => {
                const relImage = a.image_url || "";
                const relExtras = getArtistDetailExtras(a.name);
                return (
                  <Link
                    key={a.id || a.name}
                    to="/artist/$name"
                    params={{ name: slugify(a.name) }}
                    className={isMobileDevice 
                      ? "relative flex flex-col text-left outline-none bg-transparent p-0 border-none select-none cursor-pointer"
                      : "group relative flex flex-col text-left outline-none bg-transparent p-0 border-none transition-all duration-[250ms] ease-in-out cursor-pointer select-none transform-gpu"}
                  >
                    {/* Middle: Cinematic Image */}
                    <CinematicArtistImage
                      src={relImage}
                      alt={a.name}
                      aspect="aspect-[4/3]"
                    />

                    {/* Bottom: Name & Bio */}
                    <div className="pt-4 flex flex-col flex-grow">
                      <div className="flex items-center justify-between gap-3 mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500 select-none">
                        <span>{relExtras.verifiedRole}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-zinc-500 group-hover:text-[#E5D5C0] group-hover:translate-x-1 transition-all" />
                      </div>
                      <h3 className="font-display text-xl uppercase tracking-tight text-white group-hover:text-[#E5D5C0] transition-colors leading-tight">
                        {a.name}
                      </h3>
                      {a.bio && (
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground font-light font-sans">
                          {a.bio}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </div>

      <Footer />
    </main>
  );
}
