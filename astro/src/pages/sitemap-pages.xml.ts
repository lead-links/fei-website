import type { APIRoute } from 'astro';
import { PROGRAMS } from '../data/programs';
import { PAGE_ES, PROGRAM_ES } from '../i18n/routes';

// English static pages. Keep in sync when adding pages. `net-price-calculator`
// is intentionally excluded — it's noindex (third-party iframe wrapper).
const STATIC_PATHS = [
  '', // home
  'programs',
  'about',
  'admissions',
  'apply',
  'employers',
  'financial-aid',
  'support',
  'blog',
  'legal/privacy',
  'legal/terms',
  'consumer-information',
];

// A logical page = one EN URL and (usually) its ES counterpart, cross-linked via
// hreflang. Blog is EN-only, so its `es` is null (no alternate emitted).
interface Pair { en: string; es: string | null }

export const GET: APIRoute = ({ site }) => {
  const base = (site?.href ?? 'https://fei.edu/').replace(/\/$/, '');
  const lastmod = new Date().toISOString().slice(0, 10);

  const pairs: Pair[] = [
    // Static pages — ES counterpart looked up in the route map (blog has none).
    ...STATIC_PATHS.map((p): Pair => {
      const es = PAGE_ES[p === '' ? '/' : `/${p}`];
      return { en: p, es: es ? es.replace(/^\//, '') : null };
    }),
    // Program pages — EN slug ↔ localized ES slug.
    ...PROGRAMS.map((p): Pair => ({
      en: `programs/${p.slug}`,
      es: `es/programas/${PROGRAM_ES[p.slug]}`,
    })),
  ];

  // Shared hreflang alternates block for an EN/ES pair (x-default → EN).
  const alts = (enHref: string, esHref: string | null) => {
    const links = [`<xhtml:link rel="alternate" hreflang="en" href="${enHref}"/>`];
    if (esHref) links.push(`<xhtml:link rel="alternate" hreflang="es" href="${esHref}"/>`);
    links.push(`<xhtml:link rel="alternate" hreflang="x-default" href="${enHref}"/>`);
    return links.join('');
  };

  const urls: string[] = [];
  for (const { en, es } of pairs) {
    const enHref = `${base}/${en}`;
    const esHref = es ? `${base}/${es}` : null;
    const altBlock = alts(enHref, esHref);
    urls.push(`  <url><loc>${enHref}</loc><lastmod>${lastmod}</lastmod>${altBlock}</url>`);
    if (esHref) {
      urls.push(`  <url><loc>${esHref}</loc><lastmod>${lastmod}</lastmod>${altBlock}</url>`);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
