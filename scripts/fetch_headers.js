async function run() {
  const url = "https://thenew1017records.vercel.app";
  console.log(`Fetching headers for: ${url}`);
  try {
    const res = await fetch(url);
    console.log("Status:", res.status);
    console.log("Headers:");
    for (const [key, value] of res.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
