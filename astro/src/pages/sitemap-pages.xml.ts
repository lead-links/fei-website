import type { APIRoute } from 'astro';
import { PROGRAMS } from '../data/programs';

// Static pages + program pages. Keep this list in sync when adding top-level pages.
const STATIC_PATHS = [
  '', // home
  'about',
  'admissions',
  'apply',
  'employers',
  'financial-aid',
  'support',
  'blog',
  'legal/privacy',
  'legal/terms',
];

export const GET: APIRoute = ({ site }) => {
  const base = (site?.href ?? 'https://fei.edu/').replace(/\/$/, '');
  const paths = [...STATIC_PATHS, ...PROGRAMS.map((p) => `programs/${p.slug}`)];
  const urls = paths
    .map((p) => `  <url><loc>${base}/${p}</loc></url>`)
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
