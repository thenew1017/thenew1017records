import { createAPIFileRoute } from "@tanstack/react-start/api";
import { supabase } from "@/integrations/supabase/client";

export const APIRoute = createAPIFileRoute("/api/sitemap.xml")({
  GET: async ({ request }) => {
    const baseUrl = "https://www.thenew1017records.us";
    
    // Fetch dynamic content
    const { data: artists } = await supabase.from("artists").select("name").eq("is_public", true);
    const { data: releases } = await supabase.from("releases").select("title").eq("is_public", true);
    
    // Build sitemap URLs
    const urls = [
      { loc: `${baseUrl}/`, priority: "1.0", changefreq: "daily" },
      { loc: `${baseUrl}/about-1017`, priority: "0.8", changefreq: "monthly" },
    ];

    if (artists) {
      for (const artist of artists) {
        const slug = artist.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        urls.push({ loc: `${baseUrl}/artist/${slug}`, priority: "0.9", changefreq: "weekly" });
      }
    }

    if (releases) {
      for (const release of releases) {
        const slug = release.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        urls.push({ loc: `${baseUrl}/release/${slug}`, priority: "0.9", changefreq: "weekly" });
      }
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  },
});
