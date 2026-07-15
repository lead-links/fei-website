import { defineConfig } from 'astro/config';

// Static output (default). build.format:'file' keeps clean .html URLs.
// Bilingual routing is manual: English at the root, Spanish under /es/ with
// localized slugs (see src/i18n/routes.ts). Each /es page is a real file, so we
// don't use Astro's i18n fallback (it would generate conflicting /es routes).
export default defineConfig({
  site: 'https://fei.edu',
  build: { format: 'file' },
});
