async function run() {
  const url = "https://thenew1017records.vercel.app/";
  console.log(`Scanning client scripts on: ${url}`);
  try {
    const htmlRes = await fetch(url + "?t=" + Date.now(), {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await htmlRes.text();
    
    // Find all js script tags or modulepreloads
    const matches = html.matchAll(/src="([^"]+\.js)"|href="([^"]+\.js)"/g);
    const scripts = [];
    for (const match of matches) {
      const src = match[1] || match[2];
      if (src && !src.startsWith("http")) {
        scripts.push(url + src.replace(/^\//, ""));
      }
    }
    
    console.log("Found client scripts:", scripts);
    for (const sUrl of scripts) {
      console.log(`Fetching script: ${sUrl}`);
      const res = await fetch(sUrl);
      const text = await res.text();
      console.log(` - Length: ${text.length}`);
      console.log(` - Contains project ID 'vveslmalxlprmlfcdjae':`, text.includes("vveslmalxlprmlfcdjae"));
      console.log(` - Contains publishable key:`, text.includes("sb_publishable_jjJ_rgamG9H9cTmsq176qA__qlPZSE6") || text.includes("sb_publishable"));
    }
  } catch (err) {
    console.error("Scan error:", err);
  }
}

run();
