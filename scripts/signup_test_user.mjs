import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vveslmalxlprmlfcdjae.supabase.co";
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const email = `testadmin_${Date.now()}@thenew1017records.com`;
  const password = "SuperSecurePassword123!";
  
  console.log(`Signing up user: ${email}...`);
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  
  if (error) {
    console.error("Sign up error:", error.message);
    process.exit(1);
  }
  
  console.log("Sign up success! User ID:", data.user?.id);
  console.log("Confirmed At:", data.user?.email_confirmed_at);
  console.log("Identities:", data.user?.identities);
  
  // Try to sign in with this new user
  console.log("\nAttempting to sign in with new user...");
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (signInError) {
    console.error("Sign in error:", signInError.message);
  } else {
    console.log("✅ Sign in success! Access Token:", signInData.session?.access_token ? "Yes" : "No");
  }
}
run();
