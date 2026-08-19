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
  "referrer": "https://www.google.com/",
  "ip": "203.0.113.10",
  "utm_source": "facebook",
  "utm_medium": "paid",
  "utm_campaign": "",
  "utm_content": "",
  "utm_term": "",
  "utm_id": "",
  "gclid": "",
  "fbclid": "TEST_FBCLID_999"
}
```

*(payload real capturado do formulário em execução; IP trocado por um de documentação)*

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
| `referrer` | string | sim | referrer externo do último toque rastreado |
| `ip` | string | sim | IP do cliente via `api.ipify.org`; `""` se a chamada falhar |
| `utm_source` … `utm_id` | string | sim | 6 UTMs |
| `gclid` | string | sim | click ID do Google Ads |
| `fbclid` | string | sim | click ID do Meta |
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
  "referrer": "https://www.google.com/",
  "ip": "203.0.113.10",
  "utm_source": "", "utm_medium": "", "utm_campaign": "",
  "utm_content": "", "utm_term": "", "utm_id": "",
  "gclid": "Cj0KCQ...", "fbclid": ""
}
```

**Etapa 2 — `stage: "full"`**: payload idêntico ao lead padrão (seção 1), **mais** `stage: "full"` e o mesmo `preRegId`.

## 4. Regras de atribuição (importantes para ler os dados)

- **Último toque, atômico.** Qualquer um dos 8 parâmetros (`utm_*`, `gclid`, `fbclid`) na URL conta como um novo toque de aquisição e **reconstrói o conjunto inteiro**; os ausentes viram `""`. Isso impede misturar `gclid` de um clique com UTMs de outra campanha.
- **`gclid` sozinho é um toque válido.** O auto-tagging do Google Ads não põe UTM nenhuma. Antes desta mudança esses cliques eram descartados por completo.
- **`fbclid` também aparece em tráfego orgânico** — o Facebook anexa esse parâmetro a qualquer link compartilhado, não só a anúncios. Portanto `fbclid` preenchido **não** significa necessariamente clique pago; cruze com `utm_medium` antes de concluir.
- O `referrer` é atualizado junto com o toque, mas nunca sobrescrito por vazio.

## 5. Atenção ao gravar na planilha

O node do Google Sheets casa valores pelo **nome exato do cabeçalho** (case-sensitive). Cabeçalho ausente → valor descartado em silêncio; case diferente → erro *"Missing columns"* e a linha inteira falha. Antes de ativar, criar as colunas **`gclid`** e **`fbclid`** com esse exato nome minúsculo.
