# CompTIA Website Revision — Change Checklist

> Conteúdo **literal** do PDF `FEI_CompTIA_Change_Checklist.pdf` (Brantheo LLC), com o
> estado de execução marcado por nós. O texto dos itens é o do documento; as linhas
> em *itálico recuado* são as notas do próprio PDF. Tudo que vem depois de `↳` é
> anotação nossa, não faz parte do original.
>
> Escopo: **`/comptia`**. `/course-prep` está congelado como estava e não é tocado
> por nenhum item desta lista.
>
> Legenda: `[x]` feito · `[~]` parcial · `[ ]` pendente

Consolidated punch list for fei.edu/course-prep · One-pager for the web/dev team

Florida Education Institute · CompTIA Authorized Partner · fei.edu/course-prep

---

## 1 · HEADER NAVIGATION

- [x] Replace "Course Prep · CompTIA" menu with a **CompTIA** dropdown showing exactly 3 items.
- [x] Menu items: **Computer Technician**, **Networking Technician**, **Cybersecurity**.
- [x] Remove all individual courses from the main menu.
- [x] Each item links directly to its program page.

↳ Implementado como um segundo modo do `SiteHeader` (`comptia`), separado do `mega`
antigo. O menu só aparece nas páginas `/comptia` — a nav do site ao vivo continua
intocada até o go-live.

---

## 2 · BUILD 3 PROGRAM PAGES

- [x] Each page needs: name, short description, certification pathway, course list (linked), flyer download.

| Program | Courses | Certification Pathway |
|---|---|---|
| Computer Technician | ITP 1000, 1100, 1200, 1300 | Tech+ → A+ (Core 1) → A+ (Core 2) |
| Networking Technician | ITP 2100–2600 (6 courses) | Network+ → Server+ → Linux+ → Cloud+ |
| Cybersecurity | ITP 3100–3600 (6 courses) | Security+ → PenTest+ → CySA+ |

↳ As três páginas existem em `/comptia/<key>` e o agrupamento bate com a tabela
(4 + 6 + 6 = 16). A lista de cursos passou de bullets para os mesmos cards do
catálogo de `/course-prep`, com código, duração, créditos, exame e descrição.

---

## 3 · MAIN LANDING PAGE

- [x] Headline: **"What do you want to study?"**
- [x] 3 visual cards (one per program), each with "Explore Program →".
- [x] Flow: Overview → Courses → Certification Pathway → Download Flyer → Request Info.

↳ A ordem dos blocos da página de programa segue exatamente esse fluxo (antes o
pathway vinha antes dos cursos).

---

## 4 · DOWNLOADABLE FLYERS

- [ ] One PDF per program + a "Download Program Information" section on each page.
  - *3 flyers already drafted and delivered — swap placeholder logo/colors for FEI's real brand assets before publishing.*

↳ A seção e os botões já estão nas três páginas, apontando para
`/resources/comptia/fei-<programa>.pdf`. **Faltam os três arquivos** — o item só
fecha quando os PDFs com a marca real da FEI forem enviados.

---

## 5 · CONFIRMED GRAMMAR FIX

- [x] ~~"...Computer Technician andNetwork Technician certificates."~~
- [x] → **"...Computer Technician and Networking Technician pathways."**
  - *Verify in-browser and on mobile — fetch didn't reproduce the missing space, may be a CSS/rendering bug, not just a text typo.*

↳ Não era CSS. É o Astro removendo o espaço em branco imediatamente antes de uma tag
de abertura quando ela abre em nova linha no fonte (`and\n<strong>` → `and<strong>`).
Reproduzido localmente; corrigido movendo o `and` para a mesma linha da tag. Só havia
3 ocorrências no site inteiro.

---

## 6 · SITE-WIDE COPY CLEANUP

- [ ] Spelling, missing spaces, punctuation, capitalization.
- [ ] Course titles, course codes, CompTIA certification names.
- [ ] Button label consistency across pages.
  - *Only ITP 1100 + the course list page were reviewable so far (see #9) — apply this same pass once remaining pages are built.*

↳ Depende do #8. Agora que as 20 páginas de `/comptia` existem, é a próxima passada.

---

## 7 · TERMINOLOGY STANDARDIZATION

- [x] **Program / Pathway** = the overall track.
- [x] **Course** = a single FEI course (e.g., "ITP 1100").
- [x] **CompTIA Certification** = the exam credential — never implied as automatically awarded.
- [x] Use "prepares students for the exam," never "students receive the certification."
- [~] Replace "certificate(s)" site-wide where it implies FEI issues the credential.

↳ O último item fica em parcial de propósito: **a FEI emite, sim, um certificado
acadêmico próprio** (ITC-1000 Computer Technician Certificate, ITC-2000 Networking
Technician Certificate, ITC-4000 Cloud and Systems Administration Certificate — os
códigos vêm dos planos de curso do Eduardo). Onde "certificate" se refere ao
credencial da FEI o termo está correto e deve ficar. O que não pode existir é
"certificate" usado como sinônimo da certificação CompTIA. A varredura final entra
junto do #6.

---

## 8 · MISSING COURSE PAGES

- [x] ~~Only ITP 1100 has a real page today.~~
- [x] ~~Other 15 courses link back to the list page ("Course page in progress").~~
- [x] Build individual pages so program pages can link out, per the brief.

↳ Os 16 cursos têm página própria em `/comptia/<slug>`, com o conteúdo real dos
planos de curso do Eduardo: descrição do curso, quem pode entrar, pré-requisito,
formato, learning outcomes e a sequência semana a semana. Elas rodam o mesmo
vocabulário visual (`ib-*`) da página do ITP 1100 — uma página gerada tem que pesar
o mesmo que a feita à mão, senão a página de programa está linkando para stub.
Não existe mais "Course page in progress" na seção nova.

---

## ⚠ DIVERGÊNCIA ENCONTRADA — checklist × planos de curso

Não está no PDF; apareceu ao ler os 16 planos do Eduardo. Os planos definem
**quatro** certificados acadêmicos da FEI, não três:

| Certificado | Cursos |
|---|---|
| ITC-1000 Computer Technician | ITP 1000, 1100, 1200, 1300 |
| ITC-2000 **Network** Technician | ITP 2100, 2200, 2300 |
| ITC-3000 Cybersecurity | ITP 3100–3600 |
| ITC-4000 **Cloud and Systems Administration** | ITP 2400, 2500, 2600 |

O checklist junta ITP 2100–2600 num único "Networking Technician". Os planos separam
2400–2600 num certificado próprio (ITC-4000). **O site segue o checklist** — é a
instrução mais recente e é a que o cliente aprovou — mas a FEI precisa decidir qual
das duas estruturas é a oficial, porque a diferença aparece no diploma que o aluno
recebe, não só no menu. Some-se a isso o "Network" × "Networking" já listado abaixo.

---

## ⚠ DECISIONS NEEDED FROM FEI BEFORE FINAL BUILD

- [~] **Naming:** "Networking Technician" (used 3×) vs. "Network Technician" (used in the grammar-fix example + live site) — pick one and apply everywhere.
  - ↳ Adotamos **"Networking Technician"** em toda a seção `/comptia`. Falta o de acordo formal da FEI. Atenção: os planos de curso do Eduardo escrevem "Network Technician Certificate" no código ITC-2000 — a divergência é real e precisa ser resolvida na fonte.
- [x] **ITP 1100 A vs. B:** two live versions exist with different copy — version B already has the required certification-disclaimer language, version A doesn't. Which is canonical?
  - ↳ Resolvido: **B é o conteúdo canônico**. A página oficial roda o corpo do B (`Itp1100Body`), com o hero fotográfico do A. A `-b` continua existindo só dentro de `/course-prep`, que está congelado.
- [ ] **Prerequisites:** does Cybersecurity also require the Computer Technician foundations courses, or only Networking Technician?
  - ↳ Em aberto — **não afirmamos nada nas páginas** enquanto não vier a resposta. Os planos de curso trazem o pré-requisito de cada curso individualmente; o que falta é a regra de entrada do programa.
- [ ] **Redirect:** what happens to the old "Foundations (CompTIA Tech+)" nav label/URL?
  - ↳ Em aberto. Hoje `/course-prep` continua no ar exatamente como estava, com o grupo Foundations. Em `/comptia` o Foundations deixou de ser trilha e virou a entrada do Computer Technician (ITP 1000 e 1100), conforme a tabela do item 2. No go-live isso vira um redirect de `/course-prep*` para `/comptia*`.
- [~] **Exam codes:** add official CompTIA exam codes for A+, Network+, Server+, Linux+, Cloud+, Security+, PenTest+, CySA+? Only Tech+'s code (FC0-U71) was confirmed from the live site.
  - ↳ Os códigos **já estão nos dados de curso** e aparecem em cada card e página de curso: Tech+ FC0-U71 · A+ 220-1201 / 220-1202 · Network+ N10-009 · Server+ SK0-005 · Linux+ XK0-006 · Cloud+ CV0-004 · Security+ SY0-701 · PenTest+ PT0-003 · CySA+ CS0-004. Falta a FEI confirmar que são as versões vigentes.

---

*Prepared from a review of fei.edu/course-prep and the two live ITP 1100 pages. No live-site edits were made — this is a planning checklist for your team to action.*
