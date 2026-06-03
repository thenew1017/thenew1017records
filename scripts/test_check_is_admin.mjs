import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vveslmalxlprmlfcdjae.supabase.co";
const SUPABASE_KEY = "sb_publishable_jjJ_rgamG9H9cTmsq176qA__qlPZSE6";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log("1. Authenticating as armyking1428@gmail.com...");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "armyking1428@gmail.com",
    password: "4*nk%Dw6$KkwBp"
  });
  
  if (error) {
    console.error("Sign in failed:", error.message);
    process.exit(1);
  }
  
  const token = data.session.access_token;
  console.log("✅ Authenticated successfully! Token obtained.");
  
  const fnId = "8ae5d192f2668153388d8fc63709625dd8a006f88a2b6e68af2f5f8509020ccb";
  const url = `https://thenew1017records.vercel.app/_serverFn/${fnId}`;
  
  console.log(`\n2. Querying checkIsAdmin server function on production: ${url}`);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    console.log("HTTP Status:", res.status);
    console.log("Headers:", Object.fromEntries(res.headers.entries()));
    const text = await res.text();
    console.log("Response text:", text);
  } catch (err) {
    console.error("Request failed:", err);
  }
}
run();
