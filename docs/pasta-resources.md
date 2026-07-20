# Pasta de materiais de apoio (`resources`)

## O que é

`astro/public/resources/` é uma pasta para colocar materiais de apoio (imagens, PDFs, docs) que precisam ficar **acessíveis publicamente** no site — diferente da pasta `docs/` na raiz do repositório, que é só para material interno/fonte e nunca vai pro site no ar.

Qualquer arquivo colocado ali fica disponível em:

```
https://fei.edu/resources/<nome-do-arquivo>
```

Sem precisar de build, config ou deploy especial — é servido do jeito que está, igual já acontece com `astro/public/pdf/` e `astro/public/img/`.

## Como adicionar arquivos

Este é um repositório git local na máquina — não tem upload nem interface web. Para adicionar um arquivo:

1. Copie ou arraste o arquivo direto para a pasta:
   ```
   /Volumes/Workspace/Projects/FEI/Website/astro/public/resources/
   ```
2. Depois, no terminal, na raiz do repositório:
   ```bash
   cd /Volumes/Workspace/Projects/FEI/Website
   git add astro/public/resources/
   git commit -m "adiciona materiais de apoio"
   git push origin main
   ```
3. O deploy é automático ao dar `git push` (EasyPanel + Docker/nginx). Depois de alguns minutos o arquivo já responde na URL pública.

## Dica

Se quiser confirmar que um arquivo específico ficou acessível antes de anunciar o link pra alguém, é só abrir `https://fei.edu/resources/<nome-do-arquivo>` no navegador.
