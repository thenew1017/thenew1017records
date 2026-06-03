async function run() {
  const fnId = "92f7e60f409d34cc47ae723d5542505f313433a3ff005851d79b2f761a026725";
  const url = `https://thenew1017records.vercel.app/_serverFn/${fnId}`;
  
  console.log(`Calling getPublicSettings GET on: ${url}`);
  try {
    const res = await fetch(url, {
      method: "GET"
    });
    
    console.log("Status:", res.status);
    console.log("Headers:", Object.fromEntries(res.headers.entries()));
    const text = await res.text();
    console.log("Response text (first 1000 chars):", text.substring(0, 1000));
  } catch (err) {
    console.error("Error calling server function:", err);
  }
}

run();
