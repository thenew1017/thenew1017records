async function run() {
  const fnId = "ce100b2e1491eec7c02c8e85bb247faf9783607db84e7b578014b1f0736a19d8";
  const url = `http://localhost:5173/_serverFn/${fnId}`;
  
  console.log(`Calling local server function on: ${url}`);
  try {
    const res = await fetch(url, {
      method: "GET"
    });
    
    console.log("Status:", res.status);
    console.log("Headers:", Object.fromEntries(res.headers.entries()));
    const text = await res.text();
    console.log("Response text (first 1000 chars):", text.substring(0, 1000));
  } catch (err) {
    console.error("Error calling local server function:", err);
  }
}

run();
