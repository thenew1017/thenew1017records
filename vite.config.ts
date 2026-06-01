import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ command }) => ({
  plugins: [
    tsconfigPaths(),
    // tanstackStart (and its bundled TanStack Router plugin) must come BEFORE
    // react() — the router plugin enforces this ordering requirement.
    tanstackStart({
      server: { entry: "src/server.ts" },
    }),
    // React Refresh (HMR) — after tanstackStart so router plugin runs first,
    // but still registered so /@react-refresh resolves for dev-client-entry.
    react(),
    tailwindcss(),
    // Cloudflare Workers plugin only needed for production builds.
    // In dev it triggers its own esbuild pass on the server bundle before
    // TanStack Start's virtual modules are registered, causing resolution errors.
    ...(command === "build" ? [cloudflare({ persistState: false })] : []),
  ],
}));
