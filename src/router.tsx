import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 30, // 30 seconds default stale time for public data
        refetchOnWindowFocus: false, // Prevents aggressive and laggy refetching on window focus
      },
    },
  });

  let nonce = "";
  if (typeof window === "undefined" && typeof crypto !== "undefined" && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    nonce = Buffer.from(array).toString("base64");
  }

  const router = createRouter({
    routeTree,
    context: { queryClient, nonce },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    ssr: { nonce },
  });

  console.log("ROUTER SSR NONCE IN GETROUTER:", router.options.ssr);

  return router;
};

