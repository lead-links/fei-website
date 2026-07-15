// EN ⇄ ES route map (localized slugs). English lives at the root; Spanish under
// /es/ with translated slugs. The Blog is English-only (no /es/blog).
// This module is the single source of truth for hreflang, the language switcher,
// nav/footer links, and the sitemap.

export type Lang = 'en' | 'es';

// Static pages: EN path -> ES path
export const PAGE_ES: Record<string, string> = {
  '/': '/es',
  '/about': '/es/sobre',
  '/admissions': '/es/admisiones',
  '/apply': '/es/inscripcion',
  '/employers': '/es/empleadores',
  '/financial-aid': '/es/ayuda-financiera',
  '/support': '/es/apoyo',
  '/legal/privacy': '/es/legal/privacidad',
  '/legal/terms': '/es/legal/terminos',
  '/consumer-information': '/es/informacion-al-consumidor',
};

// Program slug: EN -> ES.  EN: /programs/<en>   ES: /es/programas/<es>
export const PROGRAM_ES: Record<string, string> = {
  'medical-assistant': 'asistente-medico',
  'medical-billing-coding': 'facturacion-y-codificacion-medica',
  'pharmacy-technician': 'tecnico-de-farmacia',
  'medical-office-administrator': 'administrador-de-oficina-medica',
  'culinary-arts': 'artes-culinarias',
  'culinary-hospitality-management': 'gestion-culinaria-y-hospitalidad',
  'pastry-baking-arts': 'reposteria-y-panaderia',
  'pastry-baking-management': 'gestion-de-reposteria-y-panaderia',
  'hvac': 'climatizacion-y-refrigeracion',
  'business-management': 'gestion-empresarial',
  'business-administration': 'administracion-de-empresas',
};

// Program display names in Spanish (keyed by EN slug) — footer + form dropdown.
export const PROGRAM_TITLE_ES: Record<string, string> = {
  'medical-assistant': 'Asistente Médico',
  'medical-billing-coding': 'Facturación y Codificación Médica',
  'pharmacy-technician': 'Técnico de Farmacia',
  'medical-office-administrator': 'Administrador de Oficina Médica',
  'culinary-arts': 'Artes Culinarias',
  'culinary-hospitality-management': 'Gestión Culinaria y Hospitalidad',
  'pastry-baking-arts': 'Repostería y Panadería',
  'pastry-baking-management': 'Gestión de Repostería y Panadería',
  'hvac': 'Climatización y Refrigeración (HVAC/R)',
  'business-management': 'Gestión Empresarial',
  'business-administration': 'Administración de Empresas',
};

// Short program descriptions in Spanish (home cards), keyed by EN slug.
export const PROGRAM_DESC_ES: Record<string, string> = {
  'medical-assistant': 'Habilidades clínicas y administrativas para consultorios médicos, clínicas y atención de urgencias.',
  'medical-billing-coding': 'Gestiona reclamaciones, codificación médica y registros que mantienen la salud en marcha.',
  'pharmacy-technician': 'Apoya a los farmacéuticos en la dispensación de medicamentos y el cuidado de los pacientes.',
  'medical-office-administrator': 'Un grado asociado en la administración y las operaciones de la salud moderna.',
  'culinary-arts': 'Técnica de cocina profesional, liderazgo de cocina y experiencia de servicio real.',
  'culinary-hospitality-management': 'Cocina profesional junto con liderazgo en restaurantes y hospitalidad.',
  'pastry-baking-arts': 'Panes artesanales, postres y repostería, desde los fundamentos hasta el detalle.',
  'pastry-baking-management': 'Repostería más las habilidades de negocio para dirigir una panadería o repostería.',
  'hvac': 'Sistemas de aire acondicionado, calefacción y refrigeración de los que depende el sur de la Florida.',
  'business-management': 'Fundamentos de administración, operaciones y liderazgo para dirigir y hacer crecer un negocio.',
  'business-administration': 'Una base más profunda en liderazgo empresarial, gestión y emprendimiento.',
};

export const CAT_LABELS_ES: Record<string, string> = {
  health: 'Salud',
  culinary: 'Artes Culinarias',
  trades: 'Oficios Especializados',
  business: 'Negocios',
};

export const PAGE_EN: Record<string, string> = Object.fromEntries(
  Object.entries(PAGE_ES).map(([en, es]) => [es, en]),
);
export const PROGRAM_EN: Record<string, string> = Object.fromEntries(
  Object.entries(PROGRAM_ES).map(([en, es]) => [es, en]),
);

// Localize an EN path for the given language (used for nav/footer links).
// Unmapped paths (e.g. /blog) stay as-is so the Blog links to its English page.
export function href(enPath: string, lang: Lang): string {
  if (lang === 'en') return enPath;
  return PAGE_ES[enPath] ?? enPath;
}

// Localize a program page link by its EN slug.
export function programHref(enSlug: string, lang: Lang): string {
  return lang === 'es' ? `/es/programas/${PROGRAM_ES[enSlug] ?? enSlug}` : `/programs/${enSlug}`;
}

function normalize(pathname: string): string {
  let p = pathname.replace(/index\.html$/, '').replace(/\.html$/, '');
  if (p.length > 1) p = p.replace(/\/$/, '');
  return p || '/';
}

// For the language switcher + hreflang: given any pathname, return its EN and ES
// equivalents. Blog pages have no ES version, so ES falls back to the /es home.
export function locales(pathname: string): { en: string; es: string; isEs: boolean } {
  const p = normalize(pathname);
  const isEs = p === '/es' || p.startsWith('/es/');

  if (!isEs) {
    if (p.startsWith('/blog')) return { en: p, es: '/es', isEs };
    const prog = p.match(/^\/programs\/(.+)$/);
    if (prog) {
      const es = PROGRAM_ES[prog[1]];
      return { en: p, es: es ? `/es/programas/${es}` : '/es', isEs };
    }
    return { en: p, es: PAGE_ES[p] ?? '/es', isEs };
  }

  const prog = p.match(/^\/es\/programas\/(.+)$/);
  if (prog) {
    const en = PROGRAM_EN[prog[1]];
    return { en: en ? `/programs/${en}` : '/', es: p, isEs };
  }
  return { en: PAGE_EN[p] ?? '/', es: p, isEs };
}
