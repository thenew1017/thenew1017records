import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vveslmalxlprmlfcdjae.supabase.co";
const SUPABASE_KEY = "sb_publishable_jjJ_rgamG9H9cTmsq176qA__qlPZSE6";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testCall(url, method, headers, body = null) {
  console.log(`\n--- Calling ${method} on ${url} ---`);
  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    });
    console.log("Status:", res.status);
    console.log("Content-Type:", res.headers.get("content-type"));
    const text = await res.text();
    console.log("Response (first 500 chars):", text.substring(0, 500));
  } catch (err) {
    console.error("Failed:", err.message);
  }
}

async function run() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "armyking1428@gmail.com",
    password: "4*nk%Dw6$KkwBp"
  });
  
  if (error) {
    console.error("Sign in failed:", error.message);
    process.exit(1);
  }
  
  const token = data.session.access_token;
  console.log("Authenticated! Token acquired.");
  
  const checkIsAdminId = "a6f4e90d72158e3bd67f13498b26aee25c2e16500297b2df3ce0cf5f72470301";
  const url = `https://thenew1017records.vercel.app/_serverFn/${checkIsAdminId}`;
  
  // Test 1: GET without Accept header
  await testCall(url, "GET", {
    "Authorization": `Bearer ${token}`
  });
  
  // Test 2: GET with Accept: application/json
  await testCall(url, "GET", {
    "Authorization": `Bearer ${token}`,
    "Accept": "application/json"
  });
  
  // Test 3: POST with JSON body
  await testCall(url, "POST", {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  }, {});
}
run();
