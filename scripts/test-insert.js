import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Parse .env manually
const envFile = fs.readFileSync(".env", "utf8");
const envVars = {};
envFile.split("\n").forEach((line) => {
  const parts = line.split("=");
  if (parts.length >= 2) {
    const key = parts[0].trim();
    let val = parts.slice(1).join("=").trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    envVars[key] = val;
  }
});

const url = envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL;
const key = envVars.VITE_SUPABASE_PUBLISHABLE_KEY || envVars.VITE_SUPABASE_ANON_KEY || envVars.SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(url, key);

async function run() {
  console.log("Submitting a test application directly via the anonymous public client...");
  
  const testData = {
    full_name: "Test Applicant",
    email: "test.applicant@gmail.com",
    artist_name: "Neon Horizon",
    spotify_link: "https://open.spotify.com/artist/5P24nlsyZ6Hk117eJ37QvS",
    campaign_details: "This is a programmatic test to verify that the RLS insert policies and schema connections are 100% operational.",
    status: "Pending",
    artist_photo_url: "https://example.com/photo.jpg",
    epk_url: "https://example.com/epk.pdf"
  };

  const { data, error } = await supabase
    .from("artist_applications")
    .insert(testData)
    .select();

  if (error) {
    console.error("❌ Programmatic submission failed:", error.message, error.code);
  } else {
    console.log("✅ Programmatic submission successful! Inserted data:", data);
  }
}

run();
