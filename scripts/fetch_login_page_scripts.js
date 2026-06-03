import { readFileSync } from "node:fs";

async function run() {
  const url = "https://thenew1017records.vercel.app/admin/login";
  console.log(`Fetching HTML from: ${url}`);
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
    
    console.log("Found client-side JS files on login page:", jsFiles);
    
    for (const file of jsFiles) {
      const fileUrl = `https://thenew1017records.vercel.app/assets/${file}`;
      const resFile = await fetch(fileUrl);
      const code = await resFile.text();
      const index1 = code.indexOf("vves1malx");
      const indexL = code.indexOf("vveslmalx");
      
      if (index1 !== -1) {
        console.log(`❌ Found TYPO URL (vves1malx) in JS file: ${file}`);
        console.log("  Context:", code.substring(index1 - 50, index1 + 100));
      }
      if (indexL !== -1) {
        console.log(`✅ Found CORRECT URL (vveslmalx) in JS file: ${file}`);
        console.log("  Context:", code.substring(indexL - 50, indexL + 100));
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}
run();
