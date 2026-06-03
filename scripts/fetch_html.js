async function fetchUrl(url) {
  console.log(`Fetching from: ${url}`);
  try {
    const res = await fetch(url + "?t=" + Date.now(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    console.log("Status:", res.status);
    console.log("Headers:", Object.fromEntries(res.headers.entries()));
    const html = await res.text();
    console.log("HTML length:", html.length);
    console.log("Contains 'Pooh':", html.includes("Pooh") || html.includes("pooh"));
    console.log("Contains 'Gucci':", html.includes("Gucci") || html.includes("gucci"));
    console.log("Contains 'ssr-error-log':", html.includes("ssr-error-log"));
    const errorIdx = html.indexOf('id="ssr-error-log"');
    if (errorIdx !== -1) {
      console.log("Excerpt around ssr-error-log:", html.substring(errorIdx - 100, errorIdx + 500));
    }
  } catch (err) {
    console.error("Fetch error for " + url + ":", err);
  }
}

async function run() {
  await fetchUrl("https://thenew1017records.vercel.app");
  console.log("\n=========================\n");
  await fetchUrl("https://thenew1017records.in");
}

run();
