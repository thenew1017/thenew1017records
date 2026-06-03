async function run() {
  const url = "http://localhost:5173/";
  console.log(`Fetching local HTML from: ${url}`);
  try {
    const res = await fetch(url);
    console.log("Status:", res.status);
    const html = await res.text();
    console.log("HTML length:", html.length);
    
    // Check for Pooh, Gucci, Artists
    console.log("Contains 'Pooh':", html.includes("Pooh") || html.includes("pooh"));
    console.log("Contains 'Gucci':", html.includes("Gucci") || html.includes("gucci"));
    
    // Find section with id="artists"
    const artistsIdx = html.indexOf('id="artists"');
    if (artistsIdx !== -1) {
      console.log("Local excerpt around id=\"artists\":", html.substring(artistsIdx - 100, artistsIdx + 1500));
    } else {
      console.log("No section with id=\"artists\" found!");
    }
  } catch (err) {
    console.error("Local fetch error:", err);
  }
}

run();
