async function checkFile(url) {
  try {
    const res = await fetch(url);
    if (res.status !== 200) {
      console.log(`- ${url}: HTTP ${res.status}`);
      return;
    }
    const code = await res.text();
    const index1 = code.indexOf("vves1malx");
    const indexL = code.indexOf("vveslmalx");
    
    console.log(`- File: ${url.split('/').pop()}`);
    if (index1 !== -1) {
      console.log(`  ❌ Typo URL (vves1malx) found!`);
      console.log("  Context:", code.substring(index1 - 30, index1 + 80));
    }
    if (indexL !== -1) {
      console.log(`  ✅ Correct URL (vveslmalx) found!`);
      console.log("  Context:", code.substring(indexL - 30, indexL + 80));
    }
    
    // Check if there are other supabase.co strings
    const allSupabase = code.match(/https?:\/\/[a-z0-9\-]+\.supabase\.co/g);
    if (allSupabase) {
      console.log(`  All Supabase URLs found in this file:`, [...new Set(allSupabase)]);
    }
  } catch (err) {
    console.error(`Error checking ${url}:`, err.message);
  }
}

async function run() {
  const url = "https://thenew1017records-dd69doaqh-thenew1017-s-projects.vercel.app";
  console.log(`Fetching homepage HTML from: ${url}`);
  try {
    const res = await fetch(url);
    const html = await res.text();
    
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
    
    console.log("Found client-side JS files:", jsFiles);
    
    for (const file of jsFiles) {
      await checkFile(`${url}/assets/${file}`);
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}
run();
