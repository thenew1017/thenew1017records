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
  console.log("Checking founder_spotlight table contents...");
  const { data, error } = await supabase.from("founder_spotlight").select("*").limit(1);
  if (error) {
    console.error("❌ Failed to query founder_spotlight:", error.message);
  } else {
    console.log("✅ Query successful! Founder spotlight records:");
    console.log(JSON.stringify(data, null, 2));
  }
}

run();
