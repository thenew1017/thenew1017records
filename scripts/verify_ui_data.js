async function verifyPage(path, requiredStrings) {
  const url = `https://thenew1017records.vercel.app${path}`;
  console.log(`\nVerifying Page: ${url}`);
  try {
    const res = await fetch(url);
    if (res.status !== 200) {
      console.error(`❌ Page returned status ${res.status}`);
      return false;
    }
    const html = await res.text();
    console.log(`✅ Connection Successful (200 OK). Page size: ${html.length} bytes`);
    
    let allPassed = true;
    for (const str of requiredStrings) {
      if (html.includes(str)) {
        console.log(`  [PASS] Found: "${str}"`);
      } else {
        console.error(`  [FAIL] Missing: "${str}"`);
        allPassed = false;
      }
    }
    return allPassed;
  } catch (err) {
    console.error(`❌ Network error fetching ${url}:`, err.message);
    return false;
  }
}

async function run() {
  console.log("=== STARTING PRODUCTION URL VERIFICATION ===");
  
  // 1. Verify Homepage
  const homepagePassed = await verifyPage("/", [
    "Pooh shiesty",
    "Foogiano",
    "Big Scarr",
    "Enchanting",
    "BiC Fizzle",
    "Golden Hour",
    "Run It Back",
    "Neon Saint EP",
    "City Lights",
    "https://vveslmalxlprmlfcdjae.supabase.co/storage/v1/object/public/media/"
  ]);

  // 2. Verify About & Apply Page
  const aboutPassed = await verifyPage("/about-1017", [
    "Gucci Mane",
    "1017 FOUNDER // A&R CHIEF",
    "Streams Built",
    "Candidate Identity / Full Name",
    "https://vveslmalxlprmlfcdjae.supabase.co/storage/v1/object/public/media/founder/spotlight-1780301297380.jpg"
  ]);

  // 3. Verify Artist Profile Page
  const artistPassed = await verifyPage("/artist/pooh-shiesty", [
    "Pooh shiesty",
    "Flagship Artist",
    "Memphis, Tennessee",
    "https://vveslmalxlprmlfcdjae.supabase.co/storage/v1/object/public/media/artists/1780201068222-qb8ro0.jpg"
  ]);

  // 4. Verify Release Detail Page
  const releasePassed = await verifyPage("/release/golden-hour", [
    "Golden Hour",
    "Shadow Era",
    "2026"
  ]);

  console.log("\n=== SUMMARY ===");
  console.log(`Homepage: ${homepagePassed ? "PASSED" : "FAILED"}`);
  console.log(`About/Apply: ${aboutPassed ? "PASSED" : "FAILED"}`);
  console.log(`Artist Profile: ${artistPassed ? "PASSED" : "FAILED"}`);
  console.log(`Release Detail: ${releasePassed ? "PASSED" : "FAILED"}`);
}

run();
