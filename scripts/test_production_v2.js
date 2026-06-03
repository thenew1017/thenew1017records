

async function run() {
  const origin = "https://thenew1017records.vercel.app";
  console.log(`Starting production asset scan on: ${origin}`);
  
  // We will keep a list of URLs to scan
  const scanned = new Set();
  const queue = ["https://thenew1017records.vercel.app/"];
  
  let getPublicSettingsId = null;
  
  while (queue.length > 0 && !getPublicSettingsId) {
    const url = queue.shift();
    if (scanned.has(url)) continue;
    scanned.add(url);
    
    console.log(`Scanning: ${url}`);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.log(`  Failed to fetch: ${res.status}`);
        continue;
      }
      
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("html") || url.endsWith("/")) {
        const text = await res.text();
        // Extract all JS files
        const jsMatches = text.matchAll(/href="\/assets\/(.*?\.js)"/g);
        for (const m of jsMatches) {
          queue.push(`${origin}/assets/${m[1]}`);
        }
        const srcMatches = text.matchAll(/src="\/assets\/(.*?\.js)"/g);
        for (const m of srcMatches) {
          queue.push(`${origin}/assets/${m[1]}`);
        }
      } else if (contentType.includes("javascript") || url.endsWith(".js")) {
        const text = await res.text();
        
        // Search for server function signatures
        // Server functions in TanStack Start are created using createServerFn
        // Look for string "getPublicSettings"
        const idx = text.indexOf("getPublicSettings");
        if (idx !== -1) {
          console.log(`  Found "getPublicSettings" in: ${url}`);
          const context = text.substring(idx - 200, idx + 400);
          console.log(`  Context:\n${context}\n`);
          
          // Match any 64-char hexadecimal string (SHA-256 ID of the server function)
          const idMatch = context.match(/["']([a-f0-9]{64})["']/);
          if (idMatch) {
            getPublicSettingsId = idMatch[1];
            console.log(`=====> Found function ID: ${getPublicSettingsId}`);
            break;
          }
          
          // Also match other patterns like _serverFn/...
          const serverFnMatch = context.match(/_serverFn\/([a-f0-9]{64})/);
          if (serverFnMatch) {
            getPublicSettingsId = serverFnMatch[1];
            console.log(`=====> Found function ID from _serverFn: ${getPublicSettingsId}`);
            break;
          }
        }
        
        // Check for other JS files imported/referenced in this file
        const importMatches = text.matchAll(/["']\/assets\/(.*?\.js)["']/g);
        for (const m of importMatches) {
          queue.push(`${origin}/assets/${m[1]}`);
        }
        const relativeImportMatches = text.matchAll(/from\s*["']\.\/(.*?\.js)["']/g);
        for (const m of relativeImportMatches) {
          queue.push(`${origin}/assets/${m[1]}`);
        }
      }
    } catch (err) {
      console.error(`  Error scanning ${url}:`, err.message);
    }
  }
  
  if (getPublicSettingsId) {
    const fnUrl = `${origin}/_serverFn/${getPublicSettingsId}`;
    console.log(`\nCalling server function: ${fnUrl}`);
    const fnRes = await fetch(fnUrl);
    console.log("Response status:", fnRes.status);
    console.log("Response headers:", Object.fromEntries(fnRes.headers.entries()));
    const fnText = await fnRes.text();
    console.log("Response text length:", fnText.length);
    console.log("Response text:", fnText);
  } else {
    console.log("Could not find getPublicSettings ID in production assets.");
  }
}

run();
