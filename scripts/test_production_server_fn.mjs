

async function run() {
  const origin = "https://thenew1017records.vercel.app";
  console.log(`Fetching production HTML from: ${origin}`);
  try {
    const res = await fetch(origin);
    const html = await res.text();
    
    // Find all JS asset URLs in HTML
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
    
    console.log("Production JS files found:", jsFiles);
    
    let getPublicSettingsId = null;
    for (const file of jsFiles) {
      const fileUrl = `${origin}/assets/${file}`;
      const resFile = await fetch(fileUrl);
      const code = await resFile.text();
      
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
      console.log("Could not find getPublicSettings function ID.");
      process.exit(1);
    }
    
    const fnUrl = `${origin}/_serverFn/${getPublicSettingsId}`;
    console.log(`\nCalling server function: ${fnUrl}`);
    const fnRes = await fetch(fnUrl, {
      headers: {
        'Accept': 'application/json',
      }
    });
    console.log("Response status:", fnRes.status);
    console.log("Response headers:", Object.fromEntries(fnRes.headers.entries()));
    const fnText = await fnRes.text();
    console.log("Response text length:", fnText.length);
    console.log("Response text:", fnText);
    
  } catch (err) {
    console.error("Error:", err.message);
  }
}
run();
