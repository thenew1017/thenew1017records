async function run() {
  const url = "https://thenew1017records.vercel.app";
  console.log(`Fetching homepage HTML from: ${url}`);
  try {
    const res = await fetch(url);
    const html = await res.text();
    
    // Check if the HTML contains the artist names
    const artists = ["Pooh Shiesty", "Foogiano", "Big Scarr", "Enchanting", "BiC Fizzle"];
    console.log("\n=== Checking Artist Names in HTML ===");
    for (const name of artists) {
      const found = html.includes(name);
      console.log(`- ${name}: ${found ? "FOUND" : "NOT FOUND"}`);
    }
    
    // Check if there are any image URLs containing supabase.co
    console.log("\n=== Checking Supabase Image URLs in HTML ===");
    const imageMatches = html.matchAll(/https:\/\/vveslmalxlprmlfcdjae\.supabase\.co\/storage\/v1\/object\/public\/media\/[^\s"'`>]+/g);
    const urls = [...imageMatches].map(m => m[0]);
    if (urls.length > 0) {
      console.log(`Found ${urls.length} Supabase image URLs:`);
      for (const u of urls.slice(0, 10)) {
        console.log(`  - ${u}`);
      }
    } else {
      console.log("No Supabase image URLs found in HTML!");
    }
    
    // Check for fallback placeholders or other images
    console.log("\n=== Checking other image or fallback patterns ===");
    const imgTags = html.matchAll(/<img[^>]+src=["']([^"']+)["']/g);
    for (const img of imgTags) {
      console.log(`  - <img src="${img[1]}">`);
    }
    
  } catch (err) {
    console.error("Error:", err.message);
  }
}
run();
