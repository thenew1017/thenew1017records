import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(ROOT, ".env");

if (!existsSync(envPath)) {
  console.error("Error: .env file not found.");
  process.exit(1);
}

const envFile = readFileSync(envPath, "utf8");
const vars = {};
envFile.split("\n").forEach(line => {
  const parts = line.split("=");
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join("=").trim().replace(/"/g, "").replace(/'/g, "");
    vars[key] = val;
  }
});

const url = vars.SUPABASE_URL || vars.VITE_SUPABASE_URL;
const key = vars.SUPABASE_PUBLISHABLE_KEY || vars.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function run() {
  console.log("Logging in as armyking1428@gmail.com...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: process.env.ADMIN_EMAIL || "",
    password: process.env.ADMIN_PASSWORD || ""
  });
  
  if (authError) {
    console.error("Auth error:", authError.message);
    process.exit(1);
  }
  
  console.log("Logged in user UUID:", authData.user.id);
  
  console.log("\nQuerying 'public.user_roles' table...");
  const { data: roles, error: rolesError } = await supabase
    .from("user_roles")
    .select("*");
    
  if (rolesError) {
    console.error("Error fetching user_roles:", rolesError.message);
  } else {
    console.log("User Roles list:", roles);
  }
}
run();
