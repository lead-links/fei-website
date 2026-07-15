import type { APIRoute } from 'astro';
import { PROGRAMS } from '../data/programs';
import { PAGE_ES, PROGRAM_ES } from '../i18n/routes';

// English static pages + program pages. Keep this list in sync when adding pages.
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

// Spanish pages (localized slugs). Blog is English-only, so it is not included.
const ES_PATHS = [
  ...Object.values(PAGE_ES).map((p) => p.replace(/^\//, '')),
  ...Object.values(PROGRAM_ES).map((slug) => `es/programas/${slug}`),
];

export const GET: APIRoute = ({ site }) => {
  const base = (site?.href ?? 'https://fei.edu/').replace(/\/$/, '');
  const paths = [
    ...STATIC_PATHS,
    ...PROGRAMS.map((p) => `programs/${p.slug}`),
    ...ES_PATHS,
  ];
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
