import json, re

d = json.load(open('/tmp/courses.json'))

def q(s):
    return "'" + (s or '').replace('\\', '\\\\').replace("'", "\\'") + "'"

DRAFT_PREFIX = re.compile(r'^(Working (?:prerequisite|recommendation)|Approved rule|Placeholder)\s*:\s*', re.I)
INTERNAL = re.compile(r'(?<=[.!?])\s*FEI must[^.]*\.', re.I)
# Cross-references to the teaching plan's own numbered sections mean nothing on a
# web page. Cut the smallest span that carries one: a trailing clause after a
# semicolon or comma when there is one, otherwise the whole sentence — cutting the
# sentence outright would take a qualifier like "this is not automatically an FEI
# admission requirement" with it, which the student needs to read.
XREF_CLAUSE = re.compile(r'\s*[;,][^;,.!?]*\bin Section \d+[^.!?]*(?=[.!?])', re.I)
XREF_SENT = re.compile(r'[^.!?]*\bin Section \d+[^.!?]*[.!?]\s*', re.I)

def student_facing(s):
    """Strip the plans' internal drafting artifacts from text that goes on a public
    page: the "Working prerequisite:" label, and sentences addressed to FEI staff
    about processes FEI still has to adopt. Nothing else is reworded — the rest is
    the plan's own language."""
    s = DRAFT_PREFIX.sub('', s or '')
    s = INTERNAL.sub('', s)
    s = XREF_SENT.sub('', XREF_CLAUSE.sub('', s))
    s = re.sub(r'\s+', ' ', s).strip()
    return s[:1].upper() + s[1:] if s else s

def drop_placeholder(mods):
    # unfilled template rows read like "[Additional week(s)] / [Enter topic...]"
    return [m for m in mods if not m['label'].startswith('[') and not m['topic'].startswith('[')]

hdr = '''// Course content for the /comptia section, lifted from the sixteen FEI Week 3
// Course Teaching Plans (Eduardo, Working Draft v1) in material/.
//
// GENERATED, then committed — regenerate with the extractor rather than editing by
// hand, or the next pass will silently overwrite the edit. The wording is the
// plans' own, so the site says exactly what the academic documents say.
//
// WHAT IS DELIBERATELY NOT HERE: the plans' "Pathway and Career Relevance" panels
// name job titles (junior systems administrator, server support technician...).
// The plans themselves say FEI must not promise employment or a job title, and the
// project brief says this section is positioned as exam preparation, never as
// entry-level job training. Those paragraphs stay out of the rendered pages; the
// field is kept below only as source reference.
//
// WORKING DRAFT — nothing here ships before Ramon validates the language.

export interface CourseModule {
  label: string;   // 'Week 3', 'Weeks 1-2', 'Post-Course Transition'
  topic: string;
  detail: string;
}

export interface CoursePlan {
  code: string;
  planTitle: string;    // the official title as written in the teaching plan
  overview: string;     // section 2 — student-facing description
  careerNote: string;   // section 2 — pathway/career panel. NOT rendered, see above.
  entry: string;        // section 3 — entry baseline
  prereq: string;       // section 3 — required prerequisite
  alignment: string;    // section 1 — certification alignment
  delivery: string;     // section 1 — delivery format
  length: string;       // section 1 — course length
  credits: string;      // section 1 — credit value
  certPrograms: string; // section 1 — FEI certificate program(s) the course belongs to
  outcomes: string[];   // section 4 — measurable learning outcomes
  modules: CourseModule[]; // section 5 — module/topic sequence
}

export const COURSE_PLANS: Record<string, CoursePlan> = {
'''

body = []
for code, c in d.items():
    mods = drop_placeholder(c['modules'])
    m_lines = ',\n'.join(
        f"      {{ label: {q(m['label'])}, topic: {q(m['topic'])}, detail: {q(m['detail'])} }}"
        for m in mods)
    o_lines = ',\n'.join(f"      {q(o)}" for o in c['outcomes'])
    body.append(f"""  {q(code)}: {{
    code: {q(code)},
    planTitle: {q(c['title'])},
    overview: {q(c['overview'])},
    careerNote: {q(c['pathway'])},
    entry: {q(student_facing(c['entry']))},
    prereq: {q(student_facing(c['prereq']))},
    alignment: {q(c['alignment'])},
    delivery: {q(c['delivery'])},
    length: {q(c['length'])},
    credits: {q(c['credits'])},
    certPrograms: {q(c['certPrograms'])},
    outcomes: [
{o_lines},
    ],
    modules: [
{m_lines},
    ],
  }}""")

out = hdr + ',\n'.join(body) + """,
};

export const planFor = (code: string): CoursePlan | undefined => COURSE_PLANS[code];
"""
open('/Volumes/Workspace/Projects/FEI/Website/astro/src/data/comptia-courses.ts','w').write(out)
print('wrote', len(out), 'bytes,', len(d), 'courses')
