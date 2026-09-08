# CompTIA Website Revision: Change Checklist

**Consolidated punch list for fei.edu/course-prep · One-pager for the web/dev team**

Florida Education Institute · CompTIA Authorized Partner · fei.edu/course-prep

> This is the checklist as delivered, item for item, with the current status of each
> one marked. Lines in *italics* are the notes from the original document. Text after
> a `→` is our progress note.
>
> The revised section is being built at **fei.edu/comptia**. The existing
> **fei.edu/course-prep** pages are frozen exactly as they are, nothing on this list
> changes them, and the whole revised section is hidden from search engines and from
> the live site menu until FEI approves it.
>
> Status: `[x]` complete · `[~]` partial · `[ ]` open

---

## 1 · HEADER NAVIGATION

- [x] Replace "Course Prep · CompTIA" menu with a **CompTIA** dropdown showing exactly 3 items.
- [x] Menu items: **Computer Technician**, **Networking Technician**, **Cybersecurity**.
- [x] Remove all individual courses from the main menu.
- [x] Each item links directly to its program page.

→ The CompTIA dropdown appears only inside the revised section. The live site
navigation is unchanged until launch.

---

## 2 · BUILD 3 PROGRAM PAGES

- [x] Each page needs: name, short description, certification pathway, course list (linked), flyer download.

| Program | Courses | Certification Pathway |
|---|---|---|
| Computer Technician | ITP 1000, 1100, 1200, 1300 | Tech+ → A+ (Core 1) → A+ (Core 2) |
| Networking Technician | ITP 2100 to 2600 (6 courses) | Network+ → Server+ → Linux+ → Cloud+ |
| Cybersecurity | ITP 3100 to 3600 (6 courses) | Security+ → PenTest+ → CySA+ |

→ All three pages are built and the course groupings match the table above
(4 + 6 + 6 = 16 courses). Each program page opens with an overview, then lists its
courses as cards showing the course code, length, credits, the exam it prepares for
and a short description. Every card links to that course's own page. The
certification pathway is shown as a numbered sequence, and each step names the
courses that prepare for that exam.

---

## 3 · MAIN LANDING PAGE

- [x] Headline: **"What do you want to study?"**
- [x] 3 visual cards (one per program), each with "Explore Program →".
- [x] Flow: Overview → Courses → Certification Pathway → Download Flyer → Request Info.

→ The program pages follow that order exactly.

---

## 4 · DOWNLOADABLE FLYERS

- [ ] One PDF per program + a "Download Program Information" section on each page.
  - *3 flyers already drafted and delivered, swap placeholder logo/colors for FEI's real brand assets before publishing.*

→ The section and the download buttons are in place on all three program pages,
already pointing at where each PDF will live. **The three files are still needed.**
This item closes once the flyers with FEI's real brand assets are supplied.

---

## 5 · CONFIRMED GRAMMAR FIX

- [x] ~~"...Computer Technician andNetwork Technician certificates."~~
- [x] → **"...Computer Technician and Networking Technician pathways."**
  - *Verify in-browser and on mobile. Fetch didn't reproduce the missing space, may be a CSS/rendering bug, not just a text typo.*

→ Confirmed and fixed. It was not a typo and not a styling problem: the missing space
was introduced when the page was generated, because the word "and" and the bolded
words after it were written on separate lines in the source. Reproduced, corrected,
and checked on desktop and mobile. Only three places on the entire site were
affected.

---

## 6 · SITE-WIDE COPY CLEANUP

- [ ] Spelling, missing spaces, punctuation, capitalization.
- [ ] Course titles, course codes, CompTIA certification names.
- [ ] Button label consistency across pages.
  - *Only ITP 1100 + the course list page were reviewable so far (see #9), apply this same pass once remaining pages are built.*

→ This depended on item 8. All twenty pages in the revised section now exist, so this
review pass is the next step.

---

## 7 · TERMINOLOGY STANDARDIZATION

- [x] **Program / Pathway** = the overall track.
- [x] **Course** = a single FEI course (e.g., "ITP 1100").
- [x] **CompTIA Certification** = the exam credential, never implied as automatically awarded.
- [x] Use "prepares students for the exam," never "students receive the certification."
- [~] Replace "certificate(s)" site-wide where it implies FEI issues the credential.

→ The last item is marked partial on purpose. **FEI does award its own academic
certificate**. The course plans name them ITC-1000 Computer Technician, ITC-2000
Network Technician, ITC-3000 Cybersecurity and ITC-4000 Cloud and Systems
Administration. Where "certificate" refers to FEI's own credential the word is
correct and should stay. What must never appear is "certificate" used as a synonym
for the CompTIA certification. The final sweep runs together with item 6.

A related point worth stating plainly on the pages, and now stated on every one of
them: completing a course earns FEI academic credit toward an FEI credential; the
CompTIA certification is earned only by passing the external exam at a testing
center. The course prepares the student for it. It does not replace it, and
finishing it does not award it.

---

## 8 · MISSING COURSE PAGES

- [x] ~~Only ITP 1100 has a real page today.~~
- [x] ~~Other 15 courses link back to the list page ("Course page in progress").~~
- [x] Build individual pages so program pages can link out, per the brief.

→ All sixteen courses now have their own page, and "Course page in progress" no
longer appears anywhere in the revised section.

The content comes from the sixteen Course Teaching Plans supplied by Eduardo, so each
page says what the academic documents say. Every course page carries:

- **Overview**: the student-facing course description.
- **Who this course is for**: the entry expectations and the prerequisite.
- **Format and schedule**: length, credits, platform and live session pattern.
- **What you will be able to do**: the course's learning outcomes.
- **Week by week**: the topic sequence from the first week to exam readiness.
- **Course completion vs. certification**: the distinction above, plus the exam and
  version the course is aligned to.
- **Where it fits**: the rest of the program, with the current course marked.

Two things were deliberately left off these pages:

1. **Job titles.** The course plans include a career-relevance note listing roles such
   as junior systems administrator and server support technician. The plans themselves
   state that FEI must not promise employment or a job title, and the project brief
   positions this section as exam preparation rather than job training. That material
   stays out.
2. **Internal drafting language.** The plans are working documents and contain notes
   addressed to FEI staff: "working prerequisite", conditions that depend on policies
   FEI has yet to adopt, and references to the plans' own numbered sections. None of
   that appears on the pages.

---

## ⚠ DISCREPANCY FOUND: checklist vs. course plans

This is not in the checklist. It surfaced while working through the sixteen course
plans, and it needs an FEI decision.

The plans define **four** FEI academic certificates, not three:

| FEI certificate | Courses |
|---|---|
| ITC-1000 Computer Technician | ITP 1000, 1100, 1200, 1300 |
| ITC-2000 **Network** Technician | ITP 2100, 2200, 2300 |
| ITC-3000 Cybersecurity | ITP 3100 to 3600 |
| ITC-4000 **Cloud and Systems Administration** | ITP 2400, 2500, 2600 |

The checklist groups ITP 2100 to 2600 into a single "Networking Technician" program. The
course plans separate ITP 2400 to 2600 into a certificate of their own.

**The site follows the checklist**, as the more recent instruction. But this is not a
navigation detail. It changes which credential a student is enrolled in and what
their certificate says. FEI needs to confirm which structure is official. The naming
question below ("Network" vs. "Networking") is part of the same decision.

---

## ⚠ DECISIONS NEEDED FROM FEI BEFORE FINAL BUILD

- [~] **Naming:** "Networking Technician" (used 3×) vs. "Network Technician" (used in the grammar-fix example + live site), pick one and apply everywhere.
  - → **"Networking Technician"** is used throughout the revised section. FEI still needs to confirm it. Note that the course plans use "Network Technician Certificate" for ITC-2000, so the inconsistency also exists in the source documents and should be settled there too.
- [x] **ITP 1100 A vs. B:** two live versions exist with different copy. Version B already has the required certification-disclaimer language, version A doesn't. Which is canonical?
  - → Settled: **version B is canonical.** The official page uses B's content with A's photographic hero. Version A remains only inside the frozen course-prep pages.
- [ ] **Prerequisites:** does Cybersecurity also require the Computer Technician foundations courses, or only Networking Technician?
  - → Open. Nothing is asserted on the pages until FEI answers. Each course page states its own prerequisite from the course plan; what is missing is the entry rule for the program as a whole.
- [ ] **Redirect:** what happens to the old "Foundations (CompTIA Tech+)" nav label/URL?
  - → Open. The existing course-prep pages are still live and unchanged, Foundations included. In the revised section Foundations is no longer a separate track. Its two courses (ITP 1000 and ITP 1100) open the Computer Technician program, as the table in item 2 specifies. At launch this becomes a redirect from the old pages to the new ones.
- [~] **Exam codes:** add official CompTIA exam codes for A+, Network+, Server+, Linux+, Cloud+, Security+, PenTest+, CySA+? Only Tech+'s code (FC0-U71) was confirmed from the live site.
  - → The codes are already shown on every course card and course page: Tech+ FC0-U71 · A+ 220-1201 / 220-1202 · Network+ N10-009 · Server+ SK0-005 · Linux+ XK0-006 · Cloud+ CV0-004 · Security+ SY0-701 · PenTest+ PT0-003 · CySA+ CS0-004. FEI needs to confirm these are the current versions.

---

## Status summary

| Item | Status |
|---|---|
| 1 · Header navigation | Complete |
| 2 · Three program pages | Complete |
| 3 · Main landing page | Complete |
| 4 · Downloadable flyers | Waiting on the three PDFs |
| 5 · Grammar fix | Complete |
| 6 · Site-wide copy cleanup | Next, was waiting on item 8 |
| 7 · Terminology | Complete, final sweep with item 6 |
| 8 · Missing course pages | Complete |

Open decisions for FEI: the three/four certificate structure, "Network" vs.
"Networking", the Cybersecurity prerequisite rule, the redirect for the old
Foundations pages, and confirmation of the exam code versions.

---

*Prepared from a review of fei.edu/course-prep and the two live ITP 1100 pages. No live-site edits were made. This is a planning checklist for your team to action.*
