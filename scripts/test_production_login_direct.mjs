async function run() {
  const url = "https://vveslmalxlprmlfcdjae.supabase.co/auth/v1/token?grant_type=password";
  const apiKey = process.env.VITE_SUPABASE_ANON_KEY || "";
  
  console.log(`Sending POST to: ${url}`);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": apiKey
      },
      body: JSON.stringify({
        email: process.env.ADMIN_EMAIL || "",
        password: process.env.ADMIN_PASSWORD || ""
      })
    });
    
    console.log("Status:", res.status);
    const data = await res.json();
    if (res.status === 200) {
      console.log("✅ Success! Access Token received:", data.access_token ? "Yes" : "No");
      console.log("User UUID:", data.user?.id);
    } else {
      console.log("❌ Error response:", data);
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}
run();
