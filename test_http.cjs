async function run() {
  console.log("🚀 Making HTTP POST to dev server...");
  try {
    const payload = [{
      data: {
        fullName: "API Test User",
        email: "contact@thenew1017records.us", // use the actual contact email to receive the test
        artistName: "DJ API Test",
        spotifyLink: "https://open.spotify.com/artist/test",
        campaignDetails: "This is a test campaign via HTTP.\n--- SOCIAL CHANNELS ---\nInstagram: @test\nTwitter: @test",
        artistPhotoUrl: "https://vveslmalxlprmlfcdjae.supabase.co/storage/v1/object/public/media/founder/spotlight-1780301297380.jpg",
        epkUrl: "https://vveslmalxlprmlfcdjae.supabase.co/storage/v1/object/public/media/founder/spotlight-1780301297380.jpg"
      }
    }];

    const response = await fetch("http://localhost:5173/_server/?_serverFnId=submitArtistApplication&_serverFnName=submitArtistApplication", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    console.log("Status:", response.status);
    console.log("Response:", text);
    
  } catch (error) {
    console.error("❌ Failed:", error);
  }
}

run();
