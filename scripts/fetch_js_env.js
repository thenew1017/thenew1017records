async function checkFile(url) {
  try {
    const res = await fetch(url);
    const code = await res.text();
    const index1 = code.indexOf("vves1malx");
    const indexL = code.indexOf("vveslmalx");
    if (index1 !== -1) {
      console.log(`❌ Found TYPO URL (vves1malx) in JS: ${url}`);
      console.log("  Context:", code.substring(index1 - 50, index1 + 100));
    }
    if (indexL !== -1) {
      console.log(`✅ Found CORRECT URL (vveslmalx) in JS: ${url}`);
      console.log("  Context:", code.substring(indexL - 50, indexL + 100));
    }
  } catch (err) {
    console.error(`Error fetching ${url}:`, err.message);
  }
}

async function run() {
  const assets = [
    "index-DfpM1Nrc.js",
    "index-BVklFC1B.js",
    "index-BPNN-QBD.js",
    "PremiumImage-C_I-jidP.js",
    "createLucideIcon-C3GdnwIL.js",
    "Artists-S7scDUKR.js",
    "SocialLinks-BJXQLhD3.js",
    "music-2-BhGAcKR_.js"
  ];
  
  for (const asset of assets) {
    await checkFile(`https://thenew1017records.vercel.app/assets/${asset}`);
  }
}
run();
