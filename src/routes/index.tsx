import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { ArtistCTA } from "@/components/site/ArtistCTA";
import { Footer } from "@/components/site/Footer";
import { Artists } from "@/components/site/Artists";
import { Releases } from "@/components/site/Releases";
import { ArtistDiscovery } from "@/components/site/ArtistDiscovery";
import { Manifesto } from "@/components/site/Manifesto";
import { Showcase } from "@/components/site/Showcase";

import { listPublicArtists } from "@/lib/cms.functions";

export const Route = createFileRoute("/")({
  component: Index,
  errorComponent: HomepageErrorComponent,
  pendingComponent: HomepagePendingComponent,
  loader: async () => {
    try {
      const res = await listPublicArtists();
      const resolvedUrl = process.env.SUPABASE_URL || "NOT_SET";
      const resolvedKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || "NOT_SET";
      return { 
        artists: res?.artists || [], 
        error: null,
        debugInfo: `URL: ${resolvedUrl}, Key: ${resolvedKey.substring(0, 12)}...`
      };
    } catch (err: any) {
      console.error("Homepage SSR loader error:", err);
      return { artists: [], error: err?.message || String(err), debugInfo: "Error" };
    }
  },
  head: () => ({
    meta: [
      { title: "The New 1017 Records — A New Era of Sound" },
      { name: "description", content: "Official home of The New 1017 Records. Discover the roster, latest releases, tour dates and the official store." },
      { property: "og:title", content: "The New 1017 Records" },
      { property: "og:description", content: "A new era of sound — artists, releases and merchandise." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

function HomepageErrorComponent({ error }: { error: any }) {
  console.error("Homepage SSR/Render Error caught by boundary:", error);
  return (
    <main className="relative min-h-screen bg-[#000000] text-foreground flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,215,0,0.04),transparent_50%)]" />
      <span className="h-12 w-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-lg border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)] font-bold">
        ⚠
      </span>
      <h1 className="font-display text-4xl uppercase tracking-wider text-gradient-gold">Secure Portal Shield Active</h1>
      <p className="text-sm text-muted-foreground max-w-md leading-relaxed font-light">
        A system anomaly was intercepted on our secure homepage grid nodes. Safe-mode fallbacks have successfully isolated the error.
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-5 py-2.5 text-[10px] font-mono uppercase tracking-[0.2em] hover:border-[#D4AF37] hover:text-[#D4AF37] rounded-sm transition-all duration-300 cursor-pointer"
      >
        ⚡ Re-Initialize System Node
      </button>
    </main>
  );
}

function HomepagePendingComponent() {
  return (
    <main className="relative min-h-screen bg-[#000000] text-foreground flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,215,0,0.02),transparent_50%)]" />
      <div className="space-y-4">
        <div className="h-6 w-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#D4AF37] animate-pulse">Initializing Secure 1017 Grid...</p>
      </div>
    </main>
  );
}

function Index() {
  const loaderData = Route.useLoaderData();
  return (
    <main id="top" className="relative min-h-screen bg-background text-foreground grain-overlay">
      <Nav />
      <Hero />
      <Marquee />

      <Artists initialArtists={loaderData?.artists} />
      <Showcase />
      <Manifesto />
      <Releases />
      <ArtistDiscovery />
      <ArtistCTA />
      <Footer />
    </main>
  );
}
