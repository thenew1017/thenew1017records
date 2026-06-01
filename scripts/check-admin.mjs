import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(ROOT, ".env");

if (!existsSync(envPath)) {
  console.error("Error: .env file not found in project root.");
  process.exit(1);
}

const envFile = readFileSync(envPath, "utf8");

// Parse env variables
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

if (!url || !key) {
  console.error("Error: Supabase URL or Key not found in .env file.");
  process.exit(1);
}

const supabase = createClient(url, key);

async function inspectAuthorization() {
  console.log("Connecting to Supabase instance:", url);
  console.log("Authenticating user 'armyking1428@gmail.com'...");
  
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "armyking1428@gmail.com",
    password: "4*nk%Dw6$KkwBp"
  });
  
  if (authError) {
    console.error("\n❌ Authentication failed:", authError.message);
    process.exit(1);
  }
  
  const user = authData.user;
  console.log("\n✅ Authentication successful!");
  console.log("Authenticated User UUID:", user.id);
  console.log("Email Verified:", user.email_confirmed_at ? "Yes" : "No");

  // 1. Try to read user_roles table
  console.log("\nQuerying 'public.user_roles' table for this user...");
  const { data: roles, error: rolesError } = await supabase
    .from("user_roles")
    .select("*");
    
  if (rolesError) {
    console.log("\n❌ Error querying 'user_roles' table:", rolesError.message);
    if (rolesError.message.includes("does not exist") || rolesError.message.includes("cache")) {
      console.log("\n👉 REASON FOR DENIAL: The database tables have NOT been created yet in your Supabase project!");
      console.log("You must run the SQL migrations from implementation_plan.md inside the Supabase SQL Editor first.");
    }
  } else {
    console.log("\n✅ 'user_roles' table found.");
    console.log("Database records in 'public.user_roles':", roles);
    
    const userRole = roles.find(r => r.user_id === user.id);
    if (userRole) {
      console.log(`\n👉 Role assigned to this user: '${userRole.role}'`);
      if (userRole.role === "admin") {
        console.log("✅ User has full admin permissions.");
      } else {
        console.log("❌ User has role but it is NOT 'admin'. Access will be denied.");
      }
    } else {
      console.log("\n👉 REASON FOR DENIAL: No role record exists in 'user_roles' for your user UUID.");
      console.log("The 'user_roles' table is empty or does not map your account to any role.");
    }
  }
}

inspectAuthorization();
