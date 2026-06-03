async function run() {
  const url = "https://thenew1017records.vercel.app/assets/login-BnrEYFCY.js";
  console.log(`Fetching login JS: ${url}`);
  try {
    const res = await fetch(url);
    const code = await res.text();
    
    console.log("Length of code:", code.length);
    
    // Search for supabase in code
    const index = code.indexOf("supabase");
    if (index !== -1) {
      console.log("Found 'supabase' in login JS:");
      console.log("  Context:", code.substring(index - 50, index + 200));
    } else {
      console.log("'supabase' not found in login JS.");
    }
    
    // Search for any other URL patterns like http:// or https://
    const urlMatches = code.match(/https?:\/\/[^\s"'`]+/g);
    if (urlMatches) {
      console.log("URLs found in login JS:", urlMatches);
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}
run();
