# FEI Website — instruções do projeto

Site institucional da Florida Education Institute. Stack real: Astro em `astro/`, build estático servido por nginx via Docker/EasyPanel. **O repositório git fica na raiz do projeto (`/Volumes/Workspace/Projects/FEI/Website`), não em `astro/`** — sempre commitar/pushar a partir da raiz.

## Deploy

- Docker multi-stage (Node build → nginx serve), auto-deploy no `git push origin main` via EasyPanel. Domínio: `https://fei.edu` (atrás de Cloudflare).
- `git push` é sempre manual pelo usuário — eu só commito e sugiro o comando (padrão do projeto: commitar ao fechar cada etapa de ajuste). **Um commit por página alterada** — nunca agrupar mudanças de páginas diferentes no mesmo commit.
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
   - **Eu não tenho ferramenta de escrita nessa planilha** — só leitura. Depois de implementar, sempre pedir pro usuário marcar a coluna Status como `OK` nas linhas processadas (eu não consigo fazer isso sozinho).
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

### 2. Endpoint do formulário / lead — workflow `rXdzybJQQ3rE6FY7` (`fei.edu - Form submit`)
- Webhook: `https://flow.leadlinks.app/webhook/fei-lead` (POST JSON). Já ligado ao form real do site (`astro/public/site.js`, `LEAD_WEBHOOK_URL`) — modal Apply e página `/apply` fazem POST de verdade aqui.
- **Usa modelo de rascunho/publicação do n8n** — mudanças feitas via MCP ficam só no draft até eu chamar `publish_workflow`. **Sempre publicar depois de editar**, e sempre pedir confirmação ao usuário antes de publicar (webhook recebe leads reais em produção).
- Fluxo: Webhook → **Normalizar** (node de código, única fonte de verdade — todo campo novo entra aqui primeiro, nunca direto num node de destino) → em paralelo: (a) Enviar ao Power Automate (CRM, **node DESATIVADO de propósito até o go-live** — nunca habilitar sem confirmação explícita do usuário) → Responder 200; (b) Salvar na Planilha (Google Sheets, append).
- **Planilha de leads**: "[FEI] Website Leads" (fileId `1chX80_0E38-7HRl6iDaku85J3uU-ISs8Ku_AI5Gd4Js`), aba `Leads`. Colunas atuais (nomes exatos, case-sensitive): `Date, FirstName, LastName, Phone, mx_Zip, EmailAddress, mx_Program_of_Interest, mx_Program_type, mx_Program_Language, mx_Primary_Language, mx_Classroom_Preference, mx_Delivery_Method, mx_Virtual_Assistant_URL, Source, SourceReferrerURL, utm_source, utm_medium, utm_campaign, utm_content, utm_term, utm_id, ip, smsMarketing, smsTransactional`.
- **Campos e onde nascem:**
  - `SourceReferrerURL`: `document.referrer` capturado no frontend, persistido em `localStorage` (`fei_referrer`) no primeiro acesso — nunca sobrescrito depois (diferente das UTMs, que sobrescrevem sempre que vêm preenchidas na URL, porque `document.referrer` muda a cada navegação interna).
  - `ip`: o **navegador** busca seu próprio IP público via fetch pra `api.ipify.org` no carregamento da página (fire-and-forget, nunca bloqueia o submit) e manda como campo `ip` no payload. O node Normalizar prioriza esse valor do cliente, com fallback pro IP extraído dos headers do Webhook (`x-forwarded-for`/`x-real-ip`) se o cliente não mandou nada.
  - `smsMarketing`/`smsTransactional`: dos checkboxes do form (`smsMarketingConsent`/`smsTransactionalConsent`), boolean.
  - `mx_Virtual_Assistant_URL`: constante fixa (`DEFAULT_VA_URL`) dentro do Normalizar, usada como fallback — não é dado do usuário.
- **Armadilhas conhecidas do node do Google Sheets:**
  1. O append casa valores pelo **nome exato do cabeçalho já existente na aba** (case-sensitive), não por posição. Cabeçalho ausente → valor descartado silenciosamente. Cabeçalho existe mas com case diferente (ex: node configurado "IP", cabeçalho real "ip") → n8n lança erro *"Missing columns"* e a linha inteira falha. Antes de adicionar qualquer campo novo: confirmar o nome EXATO do cabeçalho na planilha (via `read_file_content`) antes de configurar o node.
  2. **Editar o workflow direto pela UI do n8n já reverteu/apagou configurações feitas via MCP várias vezes** (trocar nome da aba resetou o mapeamento de colunas; o node do Power Automate já foi reativado e o "Wait" removido sem eu ter mexido). Antes de assumir "meu campo não está chegando", rodar `get_workflow_details` de novo pra confirmar que a config ainda está lá — não confiar que uma mudança de uma sessão anterior sobreviveu intacta.
- Testar mudanças com uma chamada real de curl pro webhook (dado de teste, fácil de identificar) e conferir a execução via `search_executions`/`get_execution`, e a linha resultante lendo a planilha — nunca assumir sucesso só pelo HTTP 200 do webhook (a resposta ao usuário roda em paralelo com o Sheets/CRM, pode "ter sucesso" mesmo se uma branch falhar).
