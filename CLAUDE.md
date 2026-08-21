# FEI Website — instruções do projeto

Site institucional da Florida Education Institute. Stack real: Astro em `astro/`, build estático servido por nginx via Docker/EasyPanel. **O repositório git fica na raiz do projeto (`/Volumes/Workspace/Projects/FEI/Website`), não em `astro/`** — sempre commitar/pushar a partir da raiz.

## ⛔ Regra absoluta: o push é sempre do usuário

**NUNCA executar `git push`.** Sem exceção, sem "só dessa vez", mesmo que o usuário peça algo que pareça implicar publicação ("deixa no ar", "publica isso", "faz o deploy") — nesses casos, commitar, explicar o que falta e **entregar o comando para ele rodar**.

Motivo: `git push origin main` dispara o webhook do EasyPanel e **publica em produção na hora**. Quem decide o momento de ir ao ar é o usuário, sempre.

O que eu faço: commitar ao fechar cada etapa verificada e sugerir o comando:

```bash
cd /Volumes/Workspace/Projects/FEI/Website && git push origin main
```

## Deploy

- Docker multi-stage (Node build → nginx serve), auto-deploy no `git push origin main` via EasyPanel. Domínio: `https://fei.edu` (atrás de Cloudflare).
- **Webhook de auto-deploy do EasyPanel**: `http://91.108.126.13:3000/api/deploy/f383ef7bdcba4fdb55a3e438c6d40c8d4dc0acdb4ddcc558`, registrado como GitHub webhook do repo (evento `push`) — é isso que dispara o build/deploy no EasyPanel a cada `git push origin main`. Se o auto-deploy parar de funcionar, conferir primeiro em Settings → Webhooks do repo se ele continua lá e com "Recent Deliveries" sem erro.
- `git push` é **sempre** do usuário (ver regra absoluta no topo) — eu só commito e sugiro o comando, ao fechar cada etapa de ajuste. **Um commit por página alterada** — nunca agrupar mudanças de páginas diferentes no mesmo commit.
- **Gotcha de cache:** `astro/public/site.js` é copiado como arquivo estático puro (sem hash), então o Cloudflare pode servir uma versão em cache por até 4h mesmo depois de um deploy novo. Isso já foi corrigido: `BaseLayout.astro` calcula um hash MD5 do conteúdo em build-time e injeta como query string (`/site.js?v=<hash>`), forçando cache-miss sempre que o conteúdo muda. Se algum dia "o código está certo mas o usuário não vê a mudança", suspeitar de cache antes de re-investigar o código (`curl https://fei.edu/<arquivo> | grep <trecho novo>` vs. o arquivo local).
- Antes de qualquer edição em `nginx.conf`: **sempre validar com `nginx -t`** antes de considerar a mudança pronta (rodar em um container/binário local; já houve um incidente de site inteiro fora do ar por um bucket hash pequeno demais). Rotina usada nesta sessão:
  ```bash
  cat > /tmp/nginx-test.conf <<'EOF'
  worker_processes 1;
  events { worker_connections 1024; }
  http {
  EOF
  cat nginx.conf >> /tmp/nginx-test.conf
  echo "}" >> /tmp/nginx-test.conf
  nginx -t -c /tmp/nginx-test.conf
  rm -f /tmp/nginx-test.conf
  ```

## `astro/public/site.js`

Espelhado byte-a-byte em `astro/src/scripts/site.js` — **sempre editar um e copiar pro outro** (`cp astro/public/site.js astro/src/scripts/site.js`) antes de commitar.

## Pasta `astro/public/resources/`

Materiais de apoio (imagens, PDFs, docs) que precisam ficar **acessíveis publicamente**, ao contrário de `docs/` na raiz (que é só material interno/fonte, nunca vai pro build). Qualquer arquivo ali fica em `https://fei.edu/resources/<caminho>` sem config nenhuma. Ver `docs/pasta-resources.md` para o workflow completo de como adicionar arquivos.

---

## Quando eu pedir para atualizar/revisar o conteúdo de uma página

Fluxo página-a-página. **Editar direto na página oficial (sem página "B")**; o commit por página é o ponto de restauração caso algo precise voltar. **Inglês primeiro; o espanhol só depois de aprovado.**

1. **Editar direto a página oficial (inglês)** `/<slug>` com o conteúdo novo — sem criar página `-b`. Verificar com build (`npm run build`) + preview antes de dizer que está pronto.
2. **Commitar a alteração (inglês) em seguida** — é o checkpoint de restauração (nada vai pro ar até o `git push`, que é manual). Se o usuário não aprovar, o git restaura o estado anterior.
3. **Não mexer no espanhol ainda.** Revisar/iterar na própria página até o usuário **aprovar explicitamente**.
4. **Só após a aprovação:** traduzir o conteúdo para o espanhol no gêmeo `/es/...` (usar `astro/src/i18n/routes.ts` — `PAGE_ES`, `PROGRAM_ES`, labels ES — como fonte dos slugs/rótulos) e commitar.
5. **Um commit por página** — nunca juntar páginas diferentes no mesmo commit; a alteração em inglês e a tradução ES *da mesma página* são commits separados (a ES vem depois da aprovação).

Regras que continuam valendo: repo na raiz, `site.js` espelhado em `public/` + `src/scripts/`, `git push` sempre manual pelo usuário.

## Quando eu pedir para "atualizar os redirecionamentos"

1. **Ler a planilha de redirects** (Google Sheets, fileId `1hfXLFtT2olqb2mUUEa79347oBPuq0fUDLGzsJe1q-To`, via `read_file_content`). Colunas: `URL | Requests | Last request | Referral | Redirect to | Status | Language`.
   - **Posso editar a planilha quando o usuário pedir explicitamente** (preencher sugestões na coluna E, marcar `Suggest`/`OK` na F, idioma na G) — fazer direto quando houver ferramenta de escrita disponível na sessão. **Se a conexão do Google Drive expuser só ferramentas de leitura** (`read_file_content`, `search_files`, sem escrita em células), entregar os valores prontos para o usuário colar. Nunca alterar a planilha sem pedido explícito.
2. **Encontrar linhas pendentes**: coluna "Redirect to" (E) preenchida mas Status ≠ `OK` (inclui `Suggest`, em branco, ou qualquer coisa que não seja `OK`). Ignorar linhas com destino `N/A` (marcado explicitamente como "sem redirect").
3. **Se a coluna "Redirect to" estiver em branco**: sugerir a rota baseado no slug da URL antiga, comparando com o padrão já usado em linhas análogas já resolvidas na própria planilha (ex: `hvacr-es`, `pba-es`, `ma-es` → páginas de programa correspondentes). Considerar sempre as páginas em espanhol (`/es/...`) quando a URL de origem for `/es/...` — usar o mapa de rotas EN⇄ES em `astro/src/i18n/routes.ts` (`PAGE_ES`, `PROGRAM_ES`) como fonte de verdade dos slugs certos.
   - Lixo/irrelevante (conteúdo de demo do tema WooCommerce/Flatsome, arquivos de autor do WordPress, paths incompletos sem sinal nenhum) → não implementar, sugerir `N/A`.
4. **Implementar em `nginx.conf`**: bloco `map $uri $fei_redirect { ... }`. Cada URL antiga entra com e sem barra final. Alfabetizar as chaves. Para lotes grandes, mesclar via script Python (ler o bloco atual, adicionar as novas entradas, reordenar, reescrever) em vez de editar manualmente — evita erro de posição/duplicata. **Sempre validar com `nginx -t`** (ver seção Deploy) antes de commitar.
5. Commitar com mensagem descrevendo o lote (quantas linhas, de onde vieram) e sugerir o comando de push.

## Quando eu perguntar sobre o webhook / n8n

Dois workflows n8n (conectado via MCP, server id `c256d96b-...`), ambos com webhook público:

### 1. Rastreador de 404 — workflow `GJXJJGomFvT9YyoU` (`fei.edu - 404`)
- Webhook: `https://flow.leadlinks.com.br/webhook/fei-404` (POST form-urlencoded: `path`, `ref`).
- Fluxo: Webhook → Parse → Buscar linha (Google Sheets, gid=0) → Montar linha (incrementa contagem) → append-or-update.
- Grava na **mesma planilha dos redirects** (fileId acima), aba referenciada por gid=0 — por isso "URL / Requests / Last request / Referral" são preenchidos automaticamente pelo tracker, e "Redirect to / Status / Language" são as colunas que eu/o usuário preenchemos manualmente por cima.
- Site dispara via beacon em `404.html` (raiz) + `astro/src/pages/404.astro`.

### 2. Endpoint do formulário / lead — workflow `zEJDNwGIT01KXudh` (`BT | Form Leads from Website`)

⚠️ **Está em OUTRA instância n8n** — server MCP `a6a66fd6-...`, não o `c256d96b-...` do 404. O workflow antigo `rXdzybJQQ3rE6FY7` (`fei.edu - Form submit`, path `fei-lead`, Google Sheets + Power Automate) **não recebe mais o form do site** — continua ativo em `flow.leadlinks.app`, mas é legado.

- Webhook: `https://flow.fei.edu/webhook/lead-conversion` (POST JSON, produção). Ligado ao form real (`astro/public/site.js`, `LEAD_WEBHOOK_URL`). **Contrato do payload em `docs/lead-webhook-payload.md`**. Não usar `/webhook-test/`: só responde com o editor "escutando" e aceita 1 request.
- **Webhook de erro**: `https://flow.fei.edu/webhook/error` (workflow `y7bOOfv78y0pOqFY`, `BT | Website Form Failed`). O `site.js` manda toda submissão que falha, com status HTTP, corpo da resposta do n8n, payload completo e contexto da página. É a primeira coisa a olhar quando o cliente reportar erro no form.
- **Modelo de rascunho/publicação**: mudanças via MCP ficam só no draft até `publish_workflow`. `get_workflow_details` retorna `activeVersion.sameAsDraft` — **conferir esse campo**, já houve draft correto parado sem publicar enquanto produção rodava a versão quebrada.
- Fluxo: Webhook → `Is Real Lead?` (descarta e-mails com `leadlinks` ou `test@`) → `Pre-Registration Only?` → `Save Pre-Registration` (`crmMode: none`) ou `Save Lead and Create in CRM` (`crmMode: send`) → **`Respond`** → `Needs Zoho Id?` → `Confirm Zoho Id` (`crmMode: confirm`, roda depois do Respond pro visitante não esperar o Zoho).
- Toda a lógica real mora no sub-workflow **`BT | Lead Intake`** (`rObGnzx0Vo3bdHxB`), chamado com `waitForSubWorkflow: true`. O node **`Normalize Lead`** é a única fonte de verdade — todo campo novo entra ali primeiro. Grava na **data table `BT | Leads`** (`QVGPewEoH6kGhQ8H`), não em planilha, e cria o lead no **Zoho CRM**.
- **Armadilha estrutural (já causou incidente):** o webhook usa `responseMode: responseNode`, então a resposta HTTP só existe se o node `Respond` for alcançado. O `Respond` fica **depois** da gravação. Se qualquer node entre a gravação e ele falhar (a maioria está com `onError` padrão = parar), o visitante vê *"we couldn't send your request"* **com o lead já salvo** — e reenvia, duplicando. Diagnóstico rápido: **corpo vazio no 200 = `Respond` não foi alcançado**; corpo com `{"success":true,...}` = cadeia inteira OK.
- **Como testar:** `test@leadlinks.app` e `rafael@leadlinks.app` são **descartados** pelo `Is Real Lead?` — servem para checar que o endpoint responde, mas **não exercitam gravação nem CRM** (voltam 200 com corpo vazio). Para testar o fluxo completo até o Zoho, usar `testlead@test.com` (passa no filtro de propósito: é `testlead@`, não `test@`) — e lembrar de limpar o lead no Zoho depois.
- **Limitação da instância `a6a66fd6`:** `search_executions` **não está exposto** nela, e não há ferramenta MCP para ler linhas de data table. Então não dá para auditar execução nem conferir a linha gravada pelo MCP — a verificação prática é o corpo da resposta do webhook (ver armadilha acima) e o webhook de erro.
