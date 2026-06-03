async function run() {
  const url = "https://thenew1017records-dd69doaqh-thenew1017-s-projects.vercel.app";
  console.log(`Fetching HTML from: ${url}`);
  try {
    const res = await fetch(url);
    console.log("Status:", res.status);
    const html = await res.text();
    console.log("HTML (first 2000 chars):");
    console.log(html.substring(0, 2000));
  } catch (err) {
    console.error("Error:", err.message);
  }
}
run();
