import type { APIRoute } from 'astro';

// Sitemap index — points to the two child sitemaps (static pages + blog posts).
export const GET: APIRoute = ({ site }) => {
  const base = (site?.href ?? 'https://fei.edu/').replace(/\/$/, '');
  const lastmod = new Date().toISOString().slice(0, 10);
  const maps = ['sitemap-pages.xml', 'sitemap-blog.xml'];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${maps.map((m) => `  <sitemap><loc>${base}/${m}</loc><lastmod>${lastmod}</lastmod></sitemap>`).join('\n')}
</sitemapindex>
`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
