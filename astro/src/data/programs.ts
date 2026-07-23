// Program catalog — drives the home grid and (later) the program detail pages.
export const CAT_LABELS: Record<string, string> = {
  health: 'Healthcare',
  culinary: 'Culinary Arts',
  trades: 'Skilled Trades',
  business: 'Business',
};

export const ICONS: Record<string, string> = {
  stethoscope: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v5a4 4 0 0 0 8 0V3"/><path d="M6 3H4M14 3h2M10 16v2a4 4 0 0 0 8 0v-2"/><circle cx="18" cy="14" r="2"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
  pill: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="8" rx="4"/><path d="M12 8v8"/></svg>',
  building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01M10 21v-3h4v3"/></svg>',
  chef: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 14a4 4 0 0 1-1-7.9A4 4 0 0 1 12 4a4 4 0 0 1 7 2.1A4 4 0 0 1 18 14"/><path d="M7 14h10v4a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z"/></svg>',
  cake: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16v-6a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3z"/><path d="M12 8V4M9 6l3-2 3 2M4 15c2 1 3 1 4 0s3-1 4 0 3 1 4 0"/></svg>',
  wrench: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.4-.4-2.4z"/></svg>',
  briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/></svg>',
};

export interface Program {
  slug: string;
  cat: keyof typeof CAT_LABELS;
  tag: string;
  icon: keyof typeof ICONS;
  title: string;
  desc: string;
}

export const PROGRAMS: Program[] = [
  { slug: 'medical-assistant', cat: 'health', tag: 'Diploma', icon: 'stethoscope', title: 'Medical Assistant', desc: 'Clinical and administrative skills for physician offices, clinics, and urgent cares.' },
  { slug: 'medical-billing-coding', cat: 'health', tag: 'Diploma', icon: 'file', title: 'Medical Billing & Coding', desc: 'Manage claims, medical coding, and records that keep healthcare running.' },
  { slug: 'pharmacy-technician', cat: 'health', tag: 'Diploma', icon: 'pill', title: 'Pharmacy Technician', desc: 'Support pharmacists in dispensing medication and caring for patients.' },
  { slug: 'medical-office-administrator', cat: 'health', tag: 'A.A.S.', icon: 'building', title: 'Medical Office Administrator', desc: 'An associate degree in the business and operations of modern healthcare.' },
  { slug: 'culinary-arts', cat: 'culinary', tag: 'Diploma', icon: 'chef', title: 'Culinary Arts', desc: 'Professional cooking technique, kitchen leadership, and real-service experience.' },
  { slug: 'culinary-hospitality-management', cat: 'culinary', tag: 'A.A.S.', icon: 'building', title: 'Culinary & Hospitality Management', desc: 'Professional cooking paired with restaurant and hospitality leadership.' },
  { slug: 'pastry-baking-arts', cat: 'culinary', tag: 'Diploma', icon: 'cake', title: 'Pastry & Baking Arts', desc: 'Artisan breads, desserts, and pastry craft, from fundamentals to finesse.' },
  { slug: 'pastry-baking-management', cat: 'culinary', tag: 'A.A.S.', icon: 'cake', title: 'Pastry & Baking Management', desc: 'Pastry craft plus the business skills to run a bakery or pastry program.' },
  { slug: 'hvac', cat: 'trades', tag: 'Diploma', icon: 'wrench', title: 'HVAC / R', desc: 'Air conditioning, heating, and refrigeration systems South Florida depends on.' },
  { slug: 'business-management', cat: 'business', tag: 'Diploma', icon: 'briefcase', title: 'Business Management', desc: 'Foundations of management, operations, and leadership to run and grow a business.' },
  { slug: 'business-administration', cat: 'business', tag: 'A.A.S.', icon: 'briefcase', title: 'Business Administration', desc: 'A deeper foundation in business leadership, management, and entrepreneurship.' },
];

// Relate a blog post to programs via TAGS: tag a post with a program's slug and
// that course shows as related. Fallback (while posts are untagged): match a
// program slug inside the post slug.
export function relatedPrograms(
  post: { slug: string; tags: { slug: string }[] },
  limit = 3,
): Program[] {
  const tagSlugs = new Set(post.tags.map((t) => t.slug));
  const byTag = PROGRAMS.filter((p) => tagSlugs.has(p.slug));
  if (byTag.length) return byTag.slice(0, limit);
  return PROGRAMS.filter((p) => post.slug.includes(p.slug)).slice(0, limit);
}
