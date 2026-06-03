const urls = [
  "https://vveslmalxlprmlfcdjae.supabase.co/storage/v1/object/public/media/artists/1780201068222-qb8ro0.jpg",
  "https://vveslmalxlprmlfcdjae.supabase.co/storage/v1/object/public/media/artists/1780201892926-ccv50c.jpg",
  "https://vveslmalxlprmlfcdjae.supabase.co/storage/v1/object/public/media/artists/1780202248219-uzogfc.jpg",
  "https://vveslmalxlprmlfcdjae.supabase.co/storage/v1/object/public/media/artists/1780202606543-ph0cr8.jpg",
  "https://vveslmalxlprmlfcdjae.supabase.co/storage/v1/object/public/media/artists/1780202947573-z9yj0f.jpg",
  "https://vveslmalxlprmlfcdjae.supabase.co/storage/v1/object/public/media/founder/spotlight-1780301297380.jpg",
  "https://vveslmalxlprmlfcdjae.supabase.co/storage/v1/object/public/media/homepage/showcase-1780227229087.png"
];

async function run() {
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      console.log(`URL: ${url}`);
      console.log(`Status: ${res.status} ${res.statusText}`);
    } catch (err) {
      console.error(`Error fetching ${url}:`, err.message);
    }
  }
}

run();
