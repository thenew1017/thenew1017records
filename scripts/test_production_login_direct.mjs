async function run() {
  const url = "https://vveslmalxlprmlfcdjae.supabase.co/auth/v1/token?grant_type=password";
  const apiKey = "sb_publishable_jjJ_rgamG9H9cTmsq176qA__qlPZSE6";
  
  console.log(`Sending POST to: ${url}`);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": apiKey
      },
      body: JSON.stringify({
        email: "armyking1428@gmail.com",
        password: "4*nk%Dw6$KkwBp"
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
