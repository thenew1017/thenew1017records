import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 grain-overlay overflow-hidden">
      {/* Cyber Ambient Lighting Grid */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-[70vmin] w-[70vmin] glow-gold opacity-[0.02]" />
        <div className="absolute bottom-1/4 right-1/4 h-[70vmin] w-[70vmin] glow-gold opacity-15" />
      </div>

      <div className="max-w-md w-full text-center border border-[#FFD700]/10 bg-[#050505]/80 p-8 backdrop-blur-2xl rounded-2xl relative shadow-2xl space-y-6">
        {/* Tech brackets */}
        <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-[#FFD700]/30" />
        <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-[#FFD700]/30" />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-[#FFD700]/30" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-[#FFD700]/30" />

        <div className="inline-flex items-center gap-2 border border-red-500/20 bg-red-500/5 px-3 py-1 rounded-full text-[8px] font-mono uppercase tracking-[0.35em] text-red-400">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
          SIGNAL ERROR // 404 OUT-OF-BOUNDS
        </div>

        <h1 className="font-display text-8xl uppercase tracking-tighter text-gradient-gold">404</h1>
        <h2 className="font-display text-xl uppercase tracking-widest text-white">Dossier Access Blocked</h2>
        <p className="text-xs text-muted-foreground leading-relaxed font-light">
          The requested coordinate signature could not be localized within our server-side database modules. The node may have been retired or shifted.
        </p>

        <div className="pt-4">
          <Link
            to="/"
            className="group relative inline-flex w-full cursor-pointer items-center justify-center overflow-hidden border border-[#FFD700] bg-[#FFD700] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-black transition-all hover:bg-yellow-400 active:scale-[0.98] rounded-md font-semibold"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "The New 1017 Records" },
      { name: "description", content: "Official home of The New 1017 Records — artists, releases, artist discovery system and the official store." },
      { name: "author", content: "The New 1017 Records" },
      { name: "theme-color", content: "#000000" },
      { property: "og:title", content: "The New 1017 Records" },
      { property: "og:description", content: "A new era of sound." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous" as any,
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Unbounded:wght@800;900&family=Space+Grotesk:wght@700&family=Syne:wght@800&family=Bebas+Neue&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { PageTransitionProvider, PageTransitionOverlay } from "@/components/ui/PageTransition";

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <PageTransitionProvider>
        <Outlet />
        <PageTransitionOverlay />
      </PageTransitionProvider>
    </QueryClientProvider>
  );
}
