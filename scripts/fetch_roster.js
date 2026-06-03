async function checkUrl(url) {
  console.log(`\nFetching: ${url}`);
  try {
    const res = await fetch(url);
    const html = await res.text();
    
    // Check for debug logs rendered on page
    const debugLogMatch = html.match(/id="ssr-debug-log"[\s\S]*?>([\s\S]*?)<\/div>/);
    const errorLogMatch = html.match(/id="ssr-error-log"[\s\S]*?>([\s\S]*?)<\/div>/);
    if (debugLogMatch) {
      console.log("  [Page SSR Debug Log]:", debugLogMatch[1].trim());
    }
    if (errorLogMatch) {
      console.log("  [Page SSR Error Log]:", errorLogMatch[1].trim());
    }

    // Extract $_TSR.router matches
    const match = html.match(/\$_TSR\.router=([\s\S]*?)\$_TSR\.e\(\)/);
    if (match) {
      const stateText = match[1];
      if (stateText.includes("artists")) {
        const artistsMatch = stateText.match(/artists:\$R\[\d+\]=\[([\s\S]*?)\]/);
        if (artistsMatch) {
          console.log("  [Roster Data]:", artistsMatch[0]);
        } else {
          console.log("  [Roster Data]: artists empty or structure different. Full matches state segment:");
          console.log("  ", stateText.substring(stateText.indexOf("matches:"), stateText.indexOf("matches:") + 400));
        }
      } else {
        console.log("  [Roster Data]: 'artists' key not found in router state.");
      }
    } else {
      console.log("  $_TSR.router state not found in HTML!");
    }
  } catch (err) {
    console.error("  Error fetching URL:", err.message);
  }
}

async function run() {
  await checkUrl("https://thenew1017records.vercel.app");
  await checkUrl("https://luxury-label-recreation-main.vercel.app");
}

run();
