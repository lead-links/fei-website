# Contrato do webhook de leads — `lead-conversion`

**Endpoint:** `POST https://flow.fei.edu/webhook/lead-conversion`
**Content-Type:** `application/json`
**Origem:** `astro/public/site.js` (espelhado em `astro/src/scripts/site.js`)

O site sempre envia **todas as chaves**, usando `""` (string vazia) para o que não tem valor — nunca omite campo e nunca envia `null`. Assim o mapeamento no n8n pode ser fixo, sem checagem de existência.

---

## 1. Lead padrão (modal Apply e página `/apply`)

É o caso que responde pela maioria dos leads.

```json
{
  "firstName": "Teste",
  "lastName": "Silva",
  "email": "teste@exemplo.com",
  "phone": "+17866658310",
  "zip": "33144",
  "program": "Medical Assistant",
  "programType": "",
  "smsMarketingConsent": true,
  "smsTransactionalConsent": true,
  "referrer": "https://fei.edu/apply?utm_source=facebook&utm_medium=cpc",
  "documentReferrer": "",
  "ip": "203.0.113.10",
  "fbc": "fb.1.1755558467.IwAR3xY...",
  "fbp": "fb.1.1755558467.1098765432",
  "utm_source": "facebook",
  "utm_medium": "cpc",
  "utm_campaign": "",
  "utm_content": "",
  "utm_term": "",
  "utm_id": "",
  "utm_platform": "instagram",
  "gclid": "",
  "gbraid": "",
  "wbraid": "",
  "fbclid": "TEST_FBCLID_999",
  "msclkid": "",
  "ttclid": "",
  "li_fat_id": "",
  "twclid": "",
  "sccid": "",
  "epik": "",
  "irclickid": ""
}
```

*(payload real capturado do formulário em execução; IP e ids trocados por valores de documentação)*

## 2. Campos

| Campo | Tipo | Sempre presente | Observações |
|---|---|---|---|
| `firstName`, `lastName` | string | sim | obrigatórios no form |
| `email` | string | sim | validado no cliente |
| `phone` | string | sim | **E.164** (`+1XXXXXXXXXX`), normalizado pelo intl-tel-input; travado em US |
| `zip` | string | sim | obrigatório |
| `program` | string | sim | título do programa em **inglês** (identificador estável), mesmo em páginas ES |
| `programType` | string | sim | `Diploma`, `Associate Degree` ou `CompTIA Course Prep`; `""` fora de páginas de programa |
| `smsMarketingConsent` | boolean | sim | checkbox TCPA — **guardar como prova de consentimento** |
| `smsTransactionalConsent` | boolean | sim | idem |
| `referrer` | string | sim | página de destino (landing) do último toque rastreado — sempre um URL `fei.edu`, persiste durante a navegação interna |
| `documentReferrer` | string | sim | `document.referrer` **externo** capturado junto com o toque (`""` se a origem for o próprio site); é o campo pra classificar orgânico/social/AI, já que `referrer` é sempre fei.edu |
| `ip` | string | sim | IP do cliente via `api.ipify.org`; `""` se a chamada falhar |
| `fbc` | string | sim | cookie `_fbc` do Pixel do Meta (click id + timestamp), lido no momento do submit — usado pelo n8n pra casar com a Conversions API |
| `fbp` | string | sim | cookie `_fbp` do Pixel do Meta (id de navegador), mesmo uso que `fbc` |
| `utm_source` … `utm_platform` | string | sim | 7 UTMs (inclui `utm_platform`) |
| `gclid` | string | sim | click ID do Google Ads |
| `gbraid` | string | sim | click ID do Google Ads emitido em vez do `gclid` no fluxo **app→web** (cookies de terceiro bloqueados) |
| `wbraid` | string | sim | click ID do Google Ads emitido em vez do `gclid` no fluxo **web** com ITP/Safari |
| `fbclid` | string | sim | click ID do Meta |
| `msclkid` | string | sim | click ID do Microsoft/Bing Ads — canal ainda não ativo, capturado por padrão |
| `ttclid` | string | sim | click ID do TikTok Ads — canal ainda não ativo |
| `li_fat_id` | string | sim | click ID do LinkedIn Ads — canal ainda não ativo |
| `twclid` | string | sim | click ID do X (Twitter) Ads — canal ainda não ativo |
| `sccid` | string | sim | click ID do Snapchat Ads — canal ainda não ativo |
| `epik` | string | sim | click ID do Pinterest Ads — canal ainda não ativo |
| `irclickid` | string | sim | click ID da rede de afiliados Impact Radius — canal ainda não ativo |
| `stage` | string | **não** | só no fluxo de 2 etapas — `"pre"` ou `"full"` |
| `preRegId` | string | **não** | só no fluxo de 2 etapas |

## 3. Fluxo de 2 etapas (landing pages)

A LP captura em duas fases. **As duas chamadas vão para o mesmo endpoint** e carregam o mesmo `preRegId` — o n8n deve fazer *upsert* pelo `preRegId`, não criar dois leads.

**Etapa 1 — `stage: "pre"`** (ainda sem zip/programa/consentimentos):

```json
{
  "stage": "pre",
  "preRegId": "lp-1a2b3c4d5e",
  "firstName": "Teste",
  "lastName": "Silva",
  "email": "teste@exemplo.com",
  "phone": "+17866658310",
  "program": "Medical Assistant",
  "programType": "Diploma",
  "referrer": "https://fei.edu/programs/medical-assistant-b",
  "documentReferrer": "https://www.google.com/",
  "ip": "203.0.113.10",
  "fbc": "", "fbp": "fb.1.1755558467.1098765432",
  "utm_source": "", "utm_medium": "", "utm_campaign": "",
  "utm_content": "", "utm_term": "", "utm_id": "", "utm_platform": "",
  "gclid": "Cj0KCQ...", "gbraid": "", "wbraid": "", "fbclid": "",
  "msclkid": "", "ttclid": "", "li_fat_id": "", "twclid": "", "sccid": "", "epik": "", "irclickid": ""
}
```

**Etapa 2 — `stage: "full"`**: payload idêntico ao lead padrão (seção 1), **mais** `stage: "full"` e o mesmo `preRegId`.

## 4. Regras de atribuição (importantes para ler os dados)

- **Último toque, atômico.** Qualquer um dos parâmetros de toque (`utm_*` + os 11 click ids) na URL conta como um novo toque de aquisição e **reconstrói o conjunto inteiro**; os ausentes viram `""`. Isso impede misturar `gclid` de um clique com UTMs de outra campanha.
- **`gclid` sozinho é um toque válido.** O auto-tagging do Google Ads não põe UTM nenhuma. Antes desta mudança esses cliques eram descartados por completo. O mesmo vale pra `gbraid`/`wbraid`.
- **`gbraid`/`wbraid` nunca aparecem junto com `gclid`** — são alternativas mutuamente exclusivas que o próprio Google escolhe emitir conforme o navegador bloqueia ou não cookies de terceiro no clique.
- **`fbclid` também aparece em tráfego orgânico** — o Facebook anexa esse parâmetro a qualquer link compartilhado, não só a anúncios. Portanto `fbclid` preenchido **não** significa necessariamente clique pago; cruze com `utm_medium` antes de concluir.
- **`fbc`/`fbp` não seguem a lógica de toque** — são lidos direto dos cookies do Pixel a cada submit (não ficam em `fei_utms`), porque servem só para casar com a Conversions API, não para atribuição de campanha.
- **`msclkid`, `ttclid`, `li_fat_id`, `twclid`, `sccid`, `epik`, `irclickid`** vêm sempre vazios hoje — nenhum desses canais está ativo. Ficam capturados por padrão pra quando (se) a FEI ligar anúncio numa dessas plataformas, sem precisar mexer no `site.js` de novo.
- O `referrer` é atualizado junto com o toque, mas nunca sobrescrito por vazio; `documentReferrer` idem.

## 5. Atenção ao gravar na planilha

O node do Google Sheets casa valores pelo **nome exato do cabeçalho** (case-sensitive). Cabeçalho ausente → valor descartado em silêncio; case diferente → erro *"Missing columns"* e a linha inteira falha. Antes de ativar campos novos, criar as colunas com esse exato nome minúsculo: `gclid`, `gbraid`, `wbraid`, `fbclid`, `fbc`, `fbp`, `msclkid`, `ttclid`, `li_fat_id`, `twclid`, `sccid`, `epik`, `irclickid`, `documentReferrer`, `utm_platform`.
