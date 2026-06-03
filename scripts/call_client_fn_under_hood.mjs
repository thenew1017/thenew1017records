// Mock browser environment for TanStack Start client-side runtime
globalThis.window = {
  location: {
    origin: "http://localhost:5173",
    href: "http://localhost:5173/admin/dashboard",
    pathname: "/admin/dashboard",
    search: "",
    hash: ""
  }
};
globalThis.document = {
  currentScript: null
};

// Intercept global fetch and log it, then forward to local dev server
globalThis.fetch = async (input, init) => {
  console.log("\n=== INTERCEPTED FETCH ===");
  console.log("URL:", input);
  console.log("Method:", init?.method || "GET");
  console.log("Headers:", init?.headers);
  console.log("Body:", init?.body);
  console.log("=========================\n");
  
  // Forward to localhost
  const localUrl = input.replace("https://thenew1017records.vercel.app", "http://localhost:5173");
  try {
    const res = await globalThis.originalFetch(localUrl, init);
    console.log("=== LOCAL RESPONSE ===");
    console.log("Status:", res.status);
    console.log("Content-Type:", res.headers.get("content-type"));
    const text = await res.text();
    console.log("Body:", text);
    console.log("======================\n");
    return {
      status: res.status,
      headers: res.headers,
      text: async () => text,
      json: async () => JSON.parse(text)
    };
  } catch (err) {
    console.error("Local forward failed:", err.message);
    throw err;
  }
};

// Save original fetch
globalThis.originalFetch = fetch;

async function run() {
  console.log("Importing from built server chunk...");
  const { checkIsAdmin } = await import("../.vercel/output/functions/__server.func/_ssr/cms.functions-m1rXlg9N.mjs");
  
  console.log("Calling checkIsAdmin as if on the client...");
  try {
    const res = await checkIsAdmin({ data: { token: "mock-token-123" } });
    console.log("Client result:", res);
  } catch (err) {
    console.error("Client call failed:", err);
  }
}
run();
