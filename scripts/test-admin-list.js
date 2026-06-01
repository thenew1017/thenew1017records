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
  console.log("Verifying admin-level read capabilities...");
  
  const { data, error } = await supabase
    .from("artist_applications")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("❌ Admin-level query failed:", error.message);
  } else {
    console.log("✅ Admin-level query successful! Found records:", data.length);
    console.log("Dossier list retrieved:");
    data.forEach((row, i) => {
      console.log(`[${i + 1}] Artist: ${row.artist_name}, Applicant: ${row.full_name}, Email: ${row.email}, Status: ${row.status}, Date: ${row.submitted_at}`);
    });
  }
}

run();
