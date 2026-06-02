import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

// Deployment target: "vercel" | "cloudflare-workers" (default: vercel)
// Set DEPLOY_TARGET=cloudflare-workers to build for Cloudflare Workers instead.
const deployTarget = process.env.DEPLOY_TARGET ?? "vercel";

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
    // Nitro server adapter — only active during production builds.
    // Uses Vercel preset by default; override with DEPLOY_TARGET env var.
    ...(command === "build"
      ? [
          nitro({
            preset: deployTarget === "cloudflare-workers" ? "cloudflare-workers" : "vercel",
          }),
        ]
      : []),
  ],
}));
