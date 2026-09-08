// The CompTIA section at /comptia — the revision the change checklist asks for.
//
// /course-prep is FROZEN as it is: same menu, same catalogue of sixteen course
// cards, same URLs. Nothing here touches it. This file exists so the new section
// can restructure freely without editing data the old pages still read.
//
// The COURSES are not duplicated — they are imported from course-prep.ts, which
// stays the single source of truth for code, exam, length, credits and copy. What
// changes here is only how they are GROUPED.

import { IT_COURSES, type ItCourse } from './course-prep';

export type ProgramKey = 'computer-technician' | 'networking-technician' | 'cybersecurity';

export interface Program {
  key: ProgramKey;   // doubles as the page slug: /comptia/<key>
  name: string;
  exam: string;      // the certifications this programme prepares for
  pathway: string;   // the order the exams are taken, shown on the programme page
  blurb: string;
  hero: string;      // hero image, one per programme, from public/img/comptia/
  flyer: string;     // programme information PDF, served from public/resources/
}

// Three programmes, not four. The checklist puts ITP 1000 and 1100 under Computer
// Technician with the pathway Tech+ → A+ Core 1 → A+ Core 2, so the separate
// Foundations track goes away here. The arithmetic confirms it: 4 + 6 + 6 is
// exactly the sixteen courses.
//
// The pathway is written out rather than derived from the course list, because the
// order the exams are taken is a curriculum decision, not something to infer.
export const COMPTIA_PROGRAMS: Program[] = [
  {
    key: 'computer-technician',
    name: 'Computer Technician',
    exam: 'CompTIA Tech+ · A+',
    pathway: 'Tech+ → A+ (Core 1) → A+ (Core 2)',
    blurb: 'Start here. Digital literacy and IT vocabulary first, then hardware, operating systems and support — preparation for the Tech+ and A+ exams.',
    hero: '/img/comptia/computer-technician.webp',
    flyer: '/resources/comptia/fei-computer-technician.pdf',
  },
  {
    key: 'networking-technician',
    name: 'Networking Technician',
    exam: 'Network+ · Server+ · Linux+ · Cloud+',
    pathway: 'Network+ → Server+ → Linux+ → Cloud+',
    blurb: 'Networking, servers, Linux and cloud administration — preparation across four CompTIA exams.',
    hero: '/img/comptia/networking-technician.webp',
    flyer: '/resources/comptia/fei-networking-technician.pdf',
  },
  {
    key: 'cybersecurity',
    name: 'Cybersecurity',
    exam: 'Security+ · PenTest+ · CySA+',
    pathway: 'Security+ → PenTest+ → CySA+',
    blurb: 'Security, penetration testing and security operations — preparation across three CompTIA exams.',
    hero: '/img/comptia/cybersecurity.webp',
    flyer: '/resources/comptia/fei-cybersecurity.pdf',
  },
];

// Foundations is not a programme here: its two courses open the Computer
// Technician track. Mapping at read time is what lets course-prep.ts keep its own
// grouping untouched.
const REGROUP: Record<string, ProgramKey> = {
  foundations: 'computer-technician',
  'computer-technician': 'computer-technician',
  'networking-technician': 'networking-technician',
  cybersecurity: 'cybersecurity',
};

export const programOf = (c: ItCourse): ProgramKey => REGROUP[c.group];

export const coursesOf = (key: ProgramKey): ItCourse[] =>
  IT_COURSES.filter((c) => programOf(c) === key);

export const programByKey = (key: string): Program | undefined =>
  COMPTIA_PROGRAMS.find((p) => p.key === key);

export { IT_COURSES, type ItCourse };
