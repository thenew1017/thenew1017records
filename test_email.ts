import { submitArtistApplication } from "./src/lib/cms.functions.ts";

async function run() {
  console.log("🚀 Testing submitArtistApplication via Node...");
  try {
    const result = await submitArtistApplication({
      data: {
        fullName: "Test User",
        email: "test@example.com",
        artistName: "DJ Test",
        spotifyLink: "https://open.spotify.com/artist/test",
        campaignDetails: "This is a test campaign.\n--- SOCIAL CHANNELS ---\nInstagram: @test\nTwitter: @test",
        artistPhotoUrl: "https://vveslmalxlprmlfcdjae.supabase.co/storage/v1/object/public/artist-photos/test.jpg",
        epkUrl: "https://vveslmalxlprmlfcdjae.supabase.co/storage/v1/object/public/artist-photos/test.pdf"
      }
    });
    console.log("✅ Success:", result);
  } catch (error) {
    console.error("❌ Failed:", error);
  }
}

run();
