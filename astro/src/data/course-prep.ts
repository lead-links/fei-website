// Single source of truth for FEI's CompTIA "Course Prep" (IT) section.
// This section is IN APPROVAL — its pages are noindex and use their own mega menu
// (the live site nav is untouched until Ramon signs off on the language). All copy
// here is a working DRAFT framed as CompTIA "course prep" (exam preparation), never
// as job/entry-level training — nothing final ships before Ramon's validation.

// Menu grouping label — pending Ramon ("Course Prep" vs "Continuing Education").
// Edit here only; it drives the mega menu and section headings.
export const COURSE_PREP_LABEL = 'Course Prep';

export type ItGroupKey = 'foundations' | 'computer-technician' | 'networking-technician' | 'cybersecurity';

export interface ItGroup {
  key: ItGroupKey;
  name: string;
  exam: string;   // certification(s) this track prepares for
  blurb: string;
}

export interface ItCourse {
  code: string;   // 'ITP 1100'
  slug: string;   // 'itp-1100-tech-fundamentals'
  title: string;
  exam: string;   // exam-prep target for display
  weeks: number;
  credits: number;
  group: ItGroupKey;
  description: string; // catalog one-liner, course-prep framed
  built?: boolean;     // true when a full course page exists (the sample)
}

export const IT_GROUPS: ItGroup[] = [
  { key: 'foundations', name: 'Foundations', exam: 'CompTIA Tech+', blurb: 'Start here — the digital-literacy base and IT vocabulary before certificate prep.' },
  { key: 'computer-technician', name: 'Computer Technician', exam: 'CompTIA A+', blurb: 'Hardware, operating systems and support — prep for CompTIA A+ (Core 1 & Core 2).' },
  { key: 'networking-technician', name: 'Networking Technician', exam: 'Network+ · Server+ · Linux+ · Cloud+', blurb: 'Networking, servers, Linux and cloud administration — prep across four CompTIA exams.' },
  { key: 'cybersecurity', name: 'Cybersecurity', exam: 'Security+ · PenTest+ · CySA+', blurb: 'Security, penetration testing and security operations — prep across three CompTIA exams.' },
];

export const IT_COURSES: ItCourse[] = [
  { code: 'ITP 1000', slug: 'itp-1000-computer-fundamentals', title: 'Computer Fundamentals & Digital Literacy', exam: 'Foundation for CompTIA Tech+', weeks: 4, credits: 4, group: 'foundations', description: 'Hands-on introduction to Windows 11, file management, Microsoft 365 and digital safety — the digital-literacy base before Tech+ prep.' },
  { code: 'ITP 1100', slug: 'itp-1100-tech-fundamentals', title: 'Tech+ Fundamentals', exam: 'CompTIA Tech+ (FC0-U71)', weeks: 4, credits: 4, group: 'foundations', built: true, description: 'Beginner course preparing you for the CompTIA Tech+ exam across its six domains — IT concepts, infrastructure, applications, software development, data and security.' },
  { code: 'ITP 1200', slug: 'itp-1200-computer-hardware-support', title: 'Computer Hardware & Support', exam: 'CompTIA A+ Core 1 (220-1201)', weeks: 4, credits: 4, group: 'computer-technician', description: 'First A+ course — mobile devices, networking, hardware, printers and virtualization/cloud fundamentals, aligned to A+ Core 1.' },
  { code: 'ITP 1300', slug: 'itp-1300-operating-systems-support', title: 'Operating Systems & Software Support', exam: 'CompTIA A+ Core 2 (220-1202)', weeks: 4, credits: 4, group: 'computer-technician', description: 'Completes A+ prep — operating systems, security, software troubleshooting and operational procedures for A+ Core 2.' },
  { code: 'ITP 2100', slug: 'itp-2100-networking-fundamentals-i', title: 'Networking Fundamentals I', exam: 'CompTIA Network+ (N10-009)', weeks: 4, credits: 4, group: 'networking-technician', description: 'First half of Network+ prep — networking concepts and network implementation with guided virtual-network practice.' },
  { code: 'ITP 2200', slug: 'itp-2200-networking-fundamentals-ii', title: 'Networking Fundamentals II', exam: 'CompTIA Network+ (N10-009)', weeks: 4, credits: 4, group: 'networking-technician', description: 'Second Network+ course — network operations, security and troubleshooting to complete Network+ prep.' },
  { code: 'ITP 2300', slug: 'itp-2300-server-administration', title: 'Server Administration Fundamentals', exam: 'CompTIA Server+ (SK0-005)', weeks: 6, credits: 4, group: 'networking-technician', description: 'Install, configure, secure and troubleshoot servers in physical and virtual environments — prep for CompTIA Server+.' },
  { code: 'ITP 2400', slug: 'itp-2400-linux-administration-i', title: 'Linux Systems Administration I', exam: 'CompTIA Linux+ (XK0-006)', weeks: 4, credits: 4, group: 'networking-technician', description: 'First half of Linux+ prep — Linux system management, foundational services and user management in guided virtual labs.' },
  { code: 'ITP 2500', slug: 'itp-2500-linux-administration-ii', title: 'Linux Systems Administration II', exam: 'CompTIA Linux+ (XK0-006)', weeks: 4, credits: 4, group: 'networking-technician', description: 'Completes Linux+ prep — containers, security, automation, scripting, monitoring and troubleshooting.' },
  { code: 'ITP 2600', slug: 'itp-2600-cloud-infrastructure', title: 'Cloud Infrastructure Administration', exam: 'CompTIA Cloud+ (CV0-004)', weeks: 6, credits: 6, group: 'networking-technician', description: 'Cloud architecture, deployment, operations, security and DevOps fundamentals on vendor-neutral labs — prep for CompTIA Cloud+.' },
  { code: 'ITP 3100', slug: 'itp-3100-security-fundamentals-i', title: 'Security Fundamentals I: Threats, Risk & Architecture', exam: 'CompTIA Security+ (SY0-701)', weeks: 4, credits: 4, group: 'cybersecurity', description: 'First Security+ course — security concepts, threats and vulnerabilities, mitigations and enterprise security architecture.' },
  { code: 'ITP 3200', slug: 'itp-3200-security-fundamentals-ii', title: 'Security Fundamentals II: Operations, Governance & Exam Readiness', exam: 'CompTIA Security+ (SY0-701)', weeks: 4, credits: 4, group: 'cybersecurity', description: 'Completes Security+ prep — security operations, identity and access, incident response and governance/risk/compliance.' },
  { code: 'ITP 3300', slug: 'itp-3300-penetration-testing-i', title: 'Penetration Testing I: Assessment, Recon & Vulnerability Analysis', exam: 'CompTIA PenTest+ (PT0-003)', weeks: 4, credits: 4, group: 'cybersecurity', description: 'First PenTest+ course — authorized assessment planning, reconnaissance, enumeration and vulnerability analysis in approved labs.' },
  { code: 'ITP 3400', slug: 'itp-3400-penetration-testing-ii', title: 'Penetration Testing II: Controlled Exploitation, Post-Exploitation & Reporting', exam: 'CompTIA PenTest+ (PT0-003)', weeks: 4, credits: 4, group: 'cybersecurity', description: 'Completes PenTest+ prep — controlled exploitation, post-exploitation, lateral movement and professional reporting.' },
  { code: 'ITP 3500', slug: 'itp-3500-cybersecurity-operations', title: 'Cybersecurity Operations & Vulnerability Management', exam: 'CompTIA CySA+ (CS0-004)', weeks: 6, credits: 6, group: 'cybersecurity', description: 'First CySA+ course — security operations and vulnerability management via log/alert analysis, threat intelligence and risk-based remediation.' },
  { code: 'ITP 3600', slug: 'itp-3600-incident-response', title: 'Incident Response, Reporting & CySA+ Readiness', exam: 'CompTIA CySA+ (CS0-004)', weeks: 6, credits: 6, group: 'cybersecurity', description: 'Completes CySA+ prep — structured incident response, evidence handling, containment/recovery and stakeholder reporting.' },
];

export const coursesByGroup = (key: ItGroupKey): ItCourse[] => IT_COURSES.filter((c) => c.group === key);
