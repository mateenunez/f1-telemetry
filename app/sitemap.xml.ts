import { type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const baseUrl = "https://f1telemetry.vercel.app/";
  const urls = [
    "",
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(
      (url) => `
    <url>
      <loc>${baseUrl}${url}</loc>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>
  `
    )
    .join("")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}