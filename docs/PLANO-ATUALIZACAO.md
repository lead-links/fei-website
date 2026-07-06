# Plano de Atualização — FEI (Site Institucional + Landing Pages)

**Data:** 05/07/2026
**Base:** pesquisa multi-agente (18 agentes) sobre 4 sites de referência (PMI, Purdue Global, ECPI, CIAT), o staging WordPress na Hostinger e as 11 landing pages atuais em `lp.fei.edu`. Dados brutos em [`docs/pesquisa/`](pesquisa/).

---

## 1. Diagnóstico

### 1.1 Staging WordPress (Hostinger) — base técnica **aprovada, manter**

| Item | Situação |
|---|---|
| Tema | **Lead Links Theme v2.0.1** (child do Kadence 1.5.1) ✅ |
| Builder | **Gutenberg + Kadence Blocks Free/PRO** (sem Elementor/Divi — leve e moderno) ✅ |
| Plugins úteis | Kadence Theme Kit Pro, Creative Kit, Starter Templates, WP SMTP, WordPress MCP |
| Plugins inativos | GiveWP, LiteSpeed Cache, **Polylang** (útil p/ EN/ES), Events Calendar |
| Conteúdo | Starter template de **igreja** ("Hope for Tomorrow") — 100% placeholder, nada a preservar |
| Já iniciado | Páginas reais: *About FEI* (id 1624), *Programs* (1573), *Medical Assistant* (1574) |
| Formulários | Kadence Blocks PRO tem **Advanced Form** — sem necessidade de plugin extra |

**Limpeza necessária:** remover páginas de doação/eventos do template (GiveWP inativo, duplicatas `-2`), página *About* antiga (id 880), footer com endereço falso de NY, links sociais `#`, publicar Privacy Policy (em rascunho).

### 1.2 Landing pages atuais (`lp.fei.edu`) — padrão bom, execução com erros graves

O esqueleto é consistente e vendedor, mas a clonagem manual gerou **13 problemas documentados** ([padrao-lp.json](pesquisa/padrao-lp.json)), destaques:

1. **Textos de programa errado**: LP de Pharmacy Tech com "Why Study Culinary Arts with FEI"; LP de Medical Assistant com CTA "Is Culinary Arts Training Right for You?"; Medical Office Administrator com hero inteiro clonado de Medical Assistant.
2. **Dados conflitantes**: Medical Assistant promete "46 Weeks*" no hero e 36 semanas nos detalhes.
3. **Erros de merge**: "Become a Business Management…", "Business Program Program".
4. **Mesmos 6 depoimentos genéricos nas 11 LPs**, inclusive de curso errado.
5. **Formulário abaixo da dobra em todas as LPs** — principal perda de conversão.
6. **Zero mensuração**: sem thank-you page, sem UTM, sem evento de conversão.
7. Privacy Policy quebrada (HVAC), BLS com períodos inconsistentes (2022–2032 vs 2024–2034).

### 1.3 Referências (PMI, Purdue Global, ECPI, CIAT) — o que adotar

- **Header com telefone clicável + dupla de CTAs** ("Request Info" / "Apply Now") em todas as páginas — padrão unânime.
- **Hero de roteamento na home** (explorar programas), formulário completo no fim da página; nas LPs o formulário sobe pro hero.
- **"Program at a Glance"** com 4 fatos iconografados no topo das páginas de programa (ECPI/PMI).
- **Urgência por datas de início** visíveis (CIAT/PMI).
- **Prova social com fonte**: nota Google agregada, depoimentos com foto+nome+programa, logos de empregadores locais (CIAT).
- **Transparência**: preço, horários, idiomas, acreditação (COE) e licenciamento (FCIE) com selos e links.
- **Diferencial FEI**: nenhuma das 4 gigantes pode dizer *"you'll never be a number"* — turmas pequenas e atendimento humano são a mensagem central.

---

## 2. Padrões definidos

### 2.1 Template canônico de Landing Page (16 blocos)

| # | Bloco | Obrig. | Resumo |
|---|---|---|---|
| 1 | `header` | ✅ | Logo + tel rastreado 786-706-8721 + chat + selo 4.3★ |
| 2 | `hero` | ✅ | "{Credencial} em {Programa} in as Little as {N} Weeks*" + ficha rápida (Campus/Duração/Credencial/Formato). **Desktop: formulário na coluna direita** |
| 3 | `abas-navegacao` | ⬜ | Âncoras Overview / Details / Careers / Testimonials |
| 4 | `formulario` | ✅ | Âncora única `#fei-form`, logo após o hero (mobile) |
| 5 | `overview` | ✅ | "Supportive Training That Fits Your Life" + CTA |
| 6 | `por-que-esta-carreira` | ✅ | 4 cards com ícone + dado BLS 2024–2034 |
| 7 | `cta-intermediario` | ✅ | 4 bullets (Career Prospects, Start Dates, Tuition, Funding) — máx. 2–3× |
| 8 | `carreiras` | ✅ | 5–7 cargos de entrada + crescimento BLS com fonte |
| 9 | `curriculo` | ✅ | 7–9 competências + benefícios FEI |
| 10 | `externship-formato` | ⬜ | Só saúde (externship) / formatos híbridos |
| 11 | `certificacoes-acreditacao` | ✅ | COE sempre; EPA/R-410A (HVAC), FL Board of Pharmacy (Pharm Tech) |
| 12 | `por-que-a-fei` | ✅ | 5 razões numeradas, parametrizadas |
| 13 | `depoimentos` | ✅ | 6 avaliações **do programa/categoria** (biblioteca etiquetada) |
| 14 | `cta-final-qualificacao` | ✅ | "Is {Programa} Training Right for You?" + tel + botão |
| 15 | `disclaimers` | ✅ | "*When completed in normal program time", fonte BLS, taxas |
| 16 | `rodape` | ✅ | Endereço, copyright, Privacy Policy funcional, link fei.edu |

**Formulário:** First Name, Last Name, Email, Phone (tel, máscara US), Zip (5 díg.), Program of Interest (**pré-selecionado**), checkbox TCPA obrigatório desmarcado. Texto TCPA idêntico caractere a caractere em todas + linha "Call us for information: 305-384-1542". Pós-envio → **thank-you page** com evento de conversão.
**CTA primário:** "Get Program Details Now!" → sempre `#fei-form`. Mobile: botão sticky.
**Telefones:** 786-706-8721 = admissões/rastreado (header, hero, CTA final); 305-384-1542 = fixo no consentimento; evoluir para DNI por canal.

**Regra de ouro:** *nenhum* texto com nome de programa hardcoded — tudo renderizado de uma fonte de dados por programa (`{nome}, {credencial}, {duracao}, {campus}, {formato}, {certificacoes}, {cargos}, {dado_bls}`). Isso elimina a classe inteira de erros de clonagem.

### 2.2 Blueprint da Home (12 blocos)

Header (tel + Request Info + Apply Now) → Hero de roteamento com foto real → Faixa de 4 stats → Grade de áreas (Saúde/Culinária/HVAC/Negócios) → Vitrine de programas com próxima turma → "Por que a FEI" (3 diferenciais) → Depoimentos + nota Google → Empregadores de Miami → Financiamento → FAQ acordeão → Matrícula em 3 passos → Formulário multi-etapas.

### 2.3 Blueprint de Página de Programa (14 blocos)

Hero (nome + credencial + próxima turma + CTA) → Programa em Resumo (4 ícones) → "O que faz esse profissional?" → Currículo (resumo + grade expansível) → Prática/externship → Carreiras com BLS → Horários/formato/idiomas → Custo e financiamento → Próximas turmas → Depoimento do programa → Acreditação/licenciamento → Requisitos + como aplicar → FAQ → Formulário.

### 2.4 Navegação

Programas (mega-menu por área) · Admissões · Financiamento · Serviços de Carreira · Sobre a FEI. Header utilitário: telefone + Request Info + Apply Now (+ seletor EN/ES na fase bilíngue). Footer 4 colunas + disclaimers de licenciamento.

---

## 3. Fases do plano

> Convenção de aceite: cada fase só fecha após **QA adversarial** (agente revisor independente tenta refutar a entrega) + aprovação sua.

### Fase 0 — Fundação & limpeza do WordPress *(0,5 dia)*
- Inventário final e remoção das páginas/artefatos do template de igreja (doações, eventos, duplicatas, About antiga id 880).
- Global styles no Kadence: paleta, tipografia, botões, header/footer builder com a identidade FEI.
- Criar estrutura de páginas-alvo (vazias/rascunho) e thank-you page.
- Decidir/ativar: LiteSpeed (performance) e Polylang (se bilíngue já na fase 1).
- **Entrega:** WP limpo com design tokens aplicados.

### Fase 1 — Design System FEI no Kadence *(1 dia)*
- Definir direção visual final (referências + identidade FEI; ver Decisão D2).
- Construir a biblioteca de **padrões reutilizáveis Kadence**: hero, faixa de stats, card de programa, card com ícone, bloco CTA 4-bullets, depoimento, FAQ acordeão, seção de formulário (Advanced Form), bloco de acreditação.
- **Entrega:** página-showcase interna com todos os blocos, aprovada por você antes de escalar.

### Fase 2 — Template mestre de LP + piloto *(1 dia)*
- Montar o template com os 16 blocos canônicos + **fonte de dados por programa** (arquivo estruturado `docs/programas.json` com os 11 programas: duração, credencial, campus, formato, certificações, cargos, BLS, depoimentos etiquetados).
- ⚠️ Depende da **Decisão D3** (dados oficiais de duração/credencial por programa — hoje há conflitos tipo 46 vs 36 semanas).
- Construir a **LP piloto (Medical Assistant)** completa e revisada.
- **Entrega:** piloto aprovada = padrão congelado.

### Fase 3 — Produção das 11 LPs *(1 dia, fan-out paralelo)*
- Workflow: para cada programa → instanciar template com dados → **QA adversarial automático por LP** com checklist fixo: busca por nomes de outros programas no HTML, duração/credencial vs fonte de dados, links tel:/âncoras/Privacy, gramática da headline, texto TCPA idêntico, depoimentos da categoria certa.
- Corrige por construção os 13 problemas do diagnóstico.
- **Entrega:** 11 LPs publicadas em rascunho para sua revisão.

### Fase 4 — Site institucional *(2 dias)*
- Home (12 blocos), hub de Programas, **páginas de programa** (14 blocos, mesmos dados da Fase 2), About FEI, Admissões, Financiamento, Serviços de Carreira, Contato, Consumer Information/Disclosures.
- Menu, footer, 404, SEO on-page (titles, metas, schema `EducationalOrganization`/`Course`).
- **Entrega:** site navegável completo no staging.

### Fase 5 — Conversão & mensuração *(0,5 dia)*
- GTM + GA4 + Meta Pixel; evento de conversão na thank-you page; UTMs preservadas em campos ocultos do formulário; validação de envio (SMTP já ativo); botão WhatsApp; base para DNI/call tracking.
- **Entrega:** lead de teste rastreado ponta a ponta (form → thank-you → evento → e-mail).

### Fase 6 — QA final multi-agente & go-live *(0,5 dia)*
- Workflow de auditoria: links quebrados, mobile (375px), acessibilidade, performance (ativar LiteSpeed), consistência cross-LP (varredura por textos clonados), compliance (TCPA, disclaimers, Privacy).
- Checklist de publicação: DNS/domínios (`fei.edu`, `lp.fei.edu`), redirects 301 das URLs antigas (`/index.php/...` → novas), backup.
- **Entrega:** relatório de QA + site no ar.

### Fase 7 (opcional) — Bilíngue ES + conteúdo contínuo
- Espanhol via Polylang (decisivo em Miami), blog/notícias, quiz de carreira e calculadora (táticas PMI/Purdue para uma fase posterior — melhor poucos blocos bem mantidos).

---

## 4. Matriz de IA por etapa (gestão no auto mode)

Eu (modelo principal da sessão) atuo como **orquestrador**: disparo workflows/subagentes com o modelo certo por tarefa via `model`/`effort`, e nada é publicado sem passar por verificação adversarial.

| Etapa | Tarefa | Modelo | Por quê |
|---|---|---|---|
| Todas | Orquestração, decisões, síntese, contato com você | **Fable 5 / Opus 4.8** (sessão) | Julgamento e contexto completo |
| F0 | Inventário e deleção de páginas template, uploads de mídia | **Haiku 4.5** | Mecânico, alto volume, baixo risco |
| F0–F1 | Direção visual, design tokens, biblioteca de blocos | **Fable 5 / Opus 4.8** | Gosto e consistência de design |
| F1–F2 | Implementação dos blocos/template no WP (via MCP) | **Sonnet 5** | Melhor custo×velocidade em produção de código/blocos |
| F2 | Normalização dos dados dos 11 programas (`programas.json`) | **Haiku 4.5** extrai → **Opus** valida | Extração barata + validação forte (é a fonte de verdade) |
| F3 | Instanciar 11 LPs (fan-out paralelo) | **Sonnet 5** (1 agente/LP) | Produção em escala com template fixo |
| F3, F6 | QA adversarial (checklist anti-clonagem, compliance) | **Fable 5 / Opus 4.8** | Verificação exige o modelo mais forte; é o que impede repetir os erros atuais |
| F4 | Páginas institucionais | **Sonnet 5** produz → **Opus** revisa | Volume com revisão |
| F4 | Copywriting sensível (headlines, claims, disclaimers) | **Fable 5 / Opus 4.8** | Risco de compliance educacional (COE/FCIE/BLS) |
| F5 | Configuração GTM/GA4/pixel, campos UTM | **Sonnet 5** | Técnico e bem especificado |
| F6 | Varreduras (links, mobile, a11y, textos clonados) | **Haiku 4.5** varre → **Opus** julga | Barato para cobrir tudo, forte para decidir |

**Regras do auto mode:** (1) tarefa mecânica nunca usa modelo caro; (2) nada vai a `publish` sem QA adversarial de modelo forte; (3) fan-outs rodam em paralelo com verificação por item; (4) dados de programa só entram no site a partir da fonte única validada.

---

## 5. Decisões pendentes (suas)

| # | Decisão | Recomendação |
|---|---|---|
| **D1** | Onde as LPs vivem: dentro do mesmo WordPress (template sem menu, URLs limpas, domínio `lp.fei.edu` apontado) ou projeto separado? | Mesmo WP — um só design system, formulário e tracking |
| **D2** | Direção visual: seguir a identidade atual da FEI (azul institucional do fei.edu) ou evoluir a paleta? | Evoluir mantendo reconhecimento — apresento 2 opções na Fase 1 |
| **D3** | **Fonte oficial dos dados por programa** (duração, credencial, preço se público, datas de turma) — catálogo FEI? | Necessário antes da Fase 2; hoje há conflitos (46 vs 36 semanas) |
| **D4** | Bilíngue EN/ES já no lançamento ou Fase 7? | Fase 7, para não atrasar o go-live |
| **D5** | Depoimentos: temos avaliações reais por programa (Google/registros internos)? | Necessário para a biblioteca etiquetada da Fase 2 |

---

## 6. Riscos e salvaguardas

- **Compliance educacional** (COE, FCIE, BLS, TCPA): claims só com fonte; disclaimers padronizados; texto TCPA imutável. Revisão final humana recomendada.
- **Perda de leads na virada**: manter LPs antigas no ar até as novas estarem rastreadas; redirects 301 mapeados; teste de formulário antes do switch.
- **Dados errados de programa**: bloqueio — nada da Fase 2 em diante sem D3 resolvida.
- **Conteúdo placeholder vazando**: varredura automática por "lorem", "church", nomes de outros programas antes de qualquer publish.
