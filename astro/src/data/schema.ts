// Structured data (schema.org / JSON-LD) — single source of truth.
// Emitted via BaseLayout's `jsonLd` prop. NAP/social values mirror SiteFooter.astro
// (the human-facing source of truth); keep them in sync if the footer changes.

const SITE = 'https://fei.edu';
const ORG_ID = `${SITE}/#organization`;
const WEBSITE_ID = `${SITE}/#website`;

// The institution. Referenced by @id from Course.provider, WebSite.publisher, etc.
export const ORG = {
  '@context': 'https://schema.org',
  '@type': ['CollegeOrUniversity', 'EducationalOrganization'],
  '@id': ORG_ID,
  name: 'Florida Education Institute',
  alternateName: 'FEI',
  url: `${SITE}/`,
  logo: `${SITE}/fei-logo.png`,
  image: `${SITE}/fei-logo.png`,
  telephone: '+1-305-444-1515',
  email: 'admissions@fei.edu',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '5818 SW 8th Street',
    addressLocality: 'Miami',
    addressRegion: 'FL',
    postalCode: '33144',
    addressCountry: 'US',
  },
  areaServed: 'Miami, Florida',
  sameAs: [
    'https://www.facebook.com/FEIMiami',
    'https://www.instagram.com/feimiami/',
    'https://x.com/FEIMiami',
  ],
  // Institutional accreditation (Council on Occupational Education).
  accreditation: {
    '@type': 'Organization',
    name: 'Council on Occupational Education',
    alternateName: 'COE',
    url: 'https://council.org/',
  },
} as const;

// Site-level WebSite node with the blog searchbox (SearchAction → /blog/search).
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE}/`,
    name: 'Florida Education Institute',
    publisher: { '@id': ORG_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE}/blog/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// A program → Course, with the institution as provider (by @id reference).
export function courseSchema(opts: { name: string; description: string; url: string; lang?: 'en' | 'es' }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    inLanguage: opts.lang === 'es' ? 'es' : 'en',
    provider: {
      '@type': 'CollegeOrUniversity',
      '@id': ORG_ID,
      name: 'Florida Education Institute',
      sameAs: `${SITE}/`,
    },
  };
}

// Homepage FAQ accordion → FAQPage. `faqs` is the existing [{q,a}] array.
export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

// Breadcrumb trail. `items` is ordered [{name, url}] from home → current page.
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export { SITE };
