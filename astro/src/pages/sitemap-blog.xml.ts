import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Blog posts, pulled from the WordPress-backed content collection at build time.
export const GET: APIRoute = async ({ site }) => {
  const base = (site?.href ?? 'https://fei.edu/').replace(/\/$/, '');
  const posts = await getCollection('blog');
  const urls = posts
    .map((post) => {
      const loc = `${base}/blog/${post.data.slug}`;
      const stamp = post.data.modified || post.data.date;
      const lastmod = stamp ? `<lastmod>${new Date(stamp).toISOString()}</lastmod>` : '';
      return `  <url><loc>${loc}</loc>${lastmod}</url>`;
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
