async function run() {
  const localOrigin = "http://localhost:5173";
  console.log(`Fetching local homepage HTML from: ${localOrigin}`);
  try {
    const res = await fetch(localOrigin);
    const html = await res.text();
    
    // Find all JS asset URLs in local HTML
    const jsFiles = [];
    const scriptMatches = html.matchAll(/src="\/assets\/(.*?)"/g);
    for (const m of scriptMatches) {
      jsFiles.push(m[1]);
    }
    const preloadMatches = html.matchAll(/"\/assets\/(.*?)"/g);
    for (const m of preloadMatches) {
      if (m[1].endsWith(".js") && !jsFiles.includes(m[1])) {
        jsFiles.push(m[1]);
      }
    }
    
    console.log("Local JS files found:", jsFiles);
    
    let getPublicSettingsId = null;
    for (const file of jsFiles) {
      const fileUrl = `${localOrigin}/assets/${file}`;
      const resFile = await fetch(fileUrl);
      const code = await resFile.text();
      // Look for getPublicSettings function ID registration
      // In TanStack Start it might look like registerServerFn or createServerFn
      const match = code.match(/id:\s*["']([0-9a-f]{64})["']/);
      if (match) {
        console.log(`Found a server function ID in ${file}: ${match[1]}`);
      }
      
      // Let's search for "getPublicSettings" string and print the context
      const getSettingsIdx = code.indexOf("getPublicSettings");
      if (getSettingsIdx !== -1) {
        console.log(`Found "getPublicSettings" in ${file}!`);
        const context = code.substring(getSettingsIdx - 100, getSettingsIdx + 300);
        console.log("Context:", context);
        // Try to parse the function ID
        const idMatch = context.match(/["']([a-f0-9]{64})["']/);
        if (idMatch) {
          getPublicSettingsId = idMatch[1];
          console.log(`===> Parsed function ID: ${getPublicSettingsId}`);
          break;
        }
      }
    }
    
    if (!getPublicSettingsId) {
      console.log("Could not find getPublicSettings function ID on localhost.");
      process.exit(1);
    }
    
    const fnUrl = `${localOrigin}/_serverFn/${getPublicSettingsId}`;
    console.log(`\nCalling local server function: ${fnUrl}`);
    const fnRes = await fetch(fnUrl);
    console.log("Local response status:", fnRes.status);
    console.log("Local response headers:", Object.fromEntries(fnRes.headers.entries()));
    const fnText = await fnRes.text();
    console.log("Local response text:", fnText);
    
  } catch (err) {
    console.error("Error:", err.message);
  }
}
run();
