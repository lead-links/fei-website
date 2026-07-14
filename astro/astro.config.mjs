import { defineConfig } from 'astro/config';

// Static output (default). build.format:'file' keeps clean .html URLs.
// i18n: English at the root (unprefixed), Spanish ALWAYS under /es/.
// Until real ES translations exist, /es/* falls back to the English content
// (rewrite = same URL, EN content) so the /es routes already resolve.
export default defineConfig({
  site: 'https://fei.edu',
  build: { format: 'file' },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: {
      prefixDefaultLocale: false, // en → /about   ·   es → /es/about
    },
    fallback: { es: 'en' },
    fallbackType: 'rewrite',
  },
});
