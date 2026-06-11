# Oportunidades — memory

Decisões técnicas do módulo `/oportunidades`. Newest on top. Cross-cutting em [`o6.md`](./o6.md).

## 2026-06-10 · Voice DNA opt-in no opener WhatsApp
- **Contexto**: `/api/prospects/pipeline` gerava abordagem com tom único (consultor especialista). Squad `copy/` instalado trouxe 24 copywriters como agents `.md`.
- **Decisão**: criado `app/_lib/copywriters.ts` com 4 voice cards destilados (dan-kennedy, eugene-schwartz, gary-halbert, jon-benson). Param `copywriter?: string` no POST body do pipeline injeta `VOZ DE REFERÊNCIA: ...` antes das INSTRUÇÕES OBRIGATÓRIAS no prompt.
- **Trade-off**: ler `.md` completo de 1k+ linhas em cada cold start serverless seria caro. Voice cards são uma síntese; quem quiser regenerar abordagem com refinamento maior pode rodar o agent fora do pipeline.
- **Próximo**: expor seletor de copywriter no ProspectDrawer (opcional, default sem voice). Auditar empiricamente se voice cards mudam taxa de resposta vs. baseline.

## 2026-06-10 · Vídeo animado para prospects (deploy Vercel)
- **Contexto**: prospects audited tinham `demo_url` (HTML deployed). Próximo gancho de conversão: vídeo curto antes/depois.
- **Decisão**: `POST /api/prospects/video` constrói HTML CSS-animated com scores antes/depois + bars animadas, deploya em projeto Vercel próprio (`o6-video-{slug}`), cacheia 7 dias. Reuse de `app/_lib/vercel-deploy.ts` (extraído do demo route).
- **Migration 010_prospects_video**: colunas `video_url`, `video_generated_at`, `video_provider` na tabela `prospects`. Aplicada via Supabase MCP.
- **UI**: botão "Gerar Vídeo" (rosa/pink) no ProspectDrawer, 4ª na grid `sm:grid-cols-4` (Auditar · Abordagem · Demo · Vídeo).
- **Telegram**: notificação `🎬 Vídeo gerado para [nome]: [url]` após sucesso.

---

## 2026-06-08 · Sprint 7 — Demo Site Generator (Claude HTML + Vercel Deploy)

### Implementado
- **Migration `009_demo_url.sql`**: colunas `demo_url TEXT` e `demo_generated_at TIMESTAMPTZ` em `prospects` + índice parcial.
- **`/api/prospects/demo/route.ts`** (POST `{ prospect_id }`):
  - Claude `claude-sonnet-4-6` gera HTML landing page completa (8k tokens) para a clínica com base em nome, categoria, cidade, telefone e `audit_json.recommendations`.
  - Deploy via Vercel API: upload do arquivo (`POST /v2/files`, header `x-vercel-digest`=SHA256) + criação de deployment (`POST /v13/deployments`, projeto `o6-demo-{slug}`).
  - Persiste `demo_url`, `demo_generated_at`, `status = "Demo Gerada"`. Fail-soft em persist.
  - Requer `VERCEL_TOKEN` em `.env.local` (pessoal, full account). Sem token → 502 claro.
- **`/api/prospects/pipeline/route.ts`** atualizado:
  - Aceita `skipDemo?: boolean` (default false).
  - Após gerar abertura, chama `/api/prospects/demo` se `VERCEL_TOKEN` presente.
  - Se demo OK: appenda URL ao final da abertura WhatsApp (`"\n\nAh, e montamos uma versão melhorada do site de vocês como demonstração: {url} — o que você acha?"`).
  - Status: `"Demo Gerada"` se demo OK, `"Auditado"` se não.
  - Resposta incluiu `demoUrl` (nullable).
- **`Prospect` type** + `rowToProspect` mapper: campos `demoUrl` / `demoGeneratedAt` adicionados.
- **`ProspectInput` Omit** atualizado para excluir os 2 novos campos server-managed.
- **`ProspectDrawer.tsx`**: estado `demoUrl` / `generatingDemo` / `demoError`. Botão "Gerar Demo" (3ª col em grid sm:3-col). Panel "Demo Site" com link + "Ver Demo" button (ExternalLink). Hidrata `initial.demoUrl` no useEffect.

### Decisões de design
- **Fallback sem v0 API** — v0.dev não tem API pública. Usar Claude diretamente produz HTML de alta qualidade em ~10s. Sem dependência extra.
- **Vercel static deployment** — HTML único via `/v2/files` (SHA256) + `/v13/deployments`. Deploy de arquivo estático fica ready em ~3-5s. Sem framework (Next, Vite etc.) = zero build time.
- **Project name**: `o6-demo-{slug28}` — slug normalizado, sem acentos, max 28 chars. Vercel limita project names a 52 chars.
- **Fail-soft no pipeline** — se VERCEL_TOKEN ausente ou deploy falhar, pipeline retorna `demoUrl: null` e continua. Operador recebe abertura mesmo sem demo.
- **maxDuration = 120** nos dois routes — HTML generation (~10s) + file upload + deploy polling caberiam em 120s com folga.
- **`claude-sonnet-4-6`** para HTML (modelo atual da sessão), mantendo `claude-opus-4-8` para `/api/offer-book/generate` (legado Sprint 4).

### ENV necessário
- `VERCEL_TOKEN` — obter em vercel.com/account/tokens, scope Full Account, server-side only.

### Trade-offs aceitos
- Deploy por prospect = projeto novo no Vercel. Não há reutilização de projeto. Poderia ser `o6-demos` com aliases por prospect, mas requereria lógica extra de alias management.
- HTML gerado não tem backend — formulário de contato é decorativo. Aceitável para demo/prospecção.
- Sem polling de status de deploy — retornamos o URL do deploy imediatamente. Para estático, Vercel fica ready em <5s, então o URL já funciona quando o usuário clica.

---

## 2026-06-04 · Sprint 3 — Substituição Serper → Apify Google Maps Scraper

### Implementado
- `/api/apify-search/route.ts` — POST chama Apify actor `compass~crawler-google-places` via `run-sync-get-dataset-items`. `maxDuration = 300` para Vercel Pro+. Timeout no Apify de 280s.
- Deduplicação tri-chave em `batchCreateProspects`: `google_place_id` (primário) + `site` (>5 chars) + `telefone`. Também deduplica dentro do próprio batch recebido.
- Campo `endereco TEXT NOT NULL DEFAULT ''` adicionado via migration `004_prospects_add_endereco`. Armazena endereço completo do Apify; cidade/estado continuam com campos próprios.
- `PlaceResult`, `Prospect`, `ProspectInput` atualizados com `endereco`. Mappers `rowToProspect`/`prospectToRow` também.
- `CaptureModal.tsx` — endpoint migrado `/api/places` → `/api/apify-search`. Removi labels "req Serper". Limite máximo reduzido de 200 → 100 (Apify leva ~2min pra 100, 200 aproxima do timeout de 280s). Hint de erro atualizado para `APIFY_TOKEN`.
- `.env.local` — adicionada `APIFY_TOKEN=` (vazio, server-side only).

### Decisões de design
- **`run-sync-get-dataset-items`** — endpoint síncrono do Apify, uma única request HTTP que retorna o array de items diretamente. Mais simples que o fluxo start→poll→fetch.
- **Apify retorna `city` e `state` diretamente** — não precisa de regex de parsing. Mantive o fallback regex para quando esses campos forem nulos.
- **Limite 100 no modal** — Apify `compass/crawler-google-places` leva ~1-2 min para 100 places. Manter 200 arriscaria timeout (280s). Se precisar de mais, fazer múltiplas buscas.
- **`endereco` não exposto no ProspectDrawer** — campo é preenchido automaticamente via scraping. Usuário não precisa editar. Drawer cria prospects com `endereco: ''` (default DB) e não sobrescreve o existente quando não editar.
- **Dedup site**: threshold `> 5 chars` evita falso positivo em sites vazios (`""`). Não filtra por regex de URL — se o campo vier como lixo, o insert passa mas é tolerável.
- **Serper legado mantido** — `/api/places` permanece intacto. Não removido para não quebrar histórico nem qualquer integração futura que queira usar a Serper route.

### Actor Apify
- Actor ID: `compass~crawler-google-places` (username~actorname)
- Input key: `searchStringsArray`, `maxCrawledPlacesPerSearch`, `language: "pt"`, `countryCode: "br"`
- Output campos usados: `title`, `phone`, `website`, `categoryName`, `address`, `city`, `state`, `totalScore`, `reviewsCount`, `placeId`, `permanentlyClosed`, `temporarilyClosed`

### Trade-offs aceitos
- **Sem fallback para Serper se Apify falhar**. Apify é o provider principal agora; Serper route permanece mas não é fallback automático.
- **Sem progress durante busca Apify** — actor roda server-side em uma request síncrona; cliente vê "Buscando..." sem progresso até retornar. Importação ainda tem progress via `onProgress`.
- **Custo Apify** — actor gratuito tem créditos mensais; paid plans por uso. Monitorar.

---

## 2026-06-04 · Sprint 2 — Captura automática via Serper.dev

### Implementado
- `/api/places/route.ts` — POST agora chama Serper Maps API real. Paginação `num: 20` por página, até 200 totais (10 páginas). Stop-early quando Serper retorna < 20 numa página.
- `batchCreateProspects(inputs, onProgress)` em `_lib/api.ts` — dedup via `google_place_id` antes do INSERT. Chunks de 50 rows (limite de payload Supabase). Callback de progresso opcional.
- `CaptureModal.tsx` — máquina de estados explícita: `idle → searching → preview → importing → done | error`. Sem libs de state — `useState<Phase>`.
- `.env.local` — adicionada `SERPER_API_KEY=` (vazio, server-side only, sem `NEXT_PUBLIC_`).

### Decisões de design
- **Buscar primeiro, importar depois**. UX em 2 etapas — usuário vê o preview e decide. Evita "importei 200 lixos sem ver".
- **Quantidade fixa em opções [20, 50, 100, 200]**. Custo da busca (= número de requests Serper) aparece no select: "100 empresas (5 req Serper)". Free tier tem 2.500/mês.
- **Instagram = string vazia**. Serper Maps não retorna Instagram. Campo preenchido manualmente depois ou enriquecido em Sprint futura.
- **Dedup em batch, não por row**. Uma única query `IN (placeIds)` antes do INSERT — `O(1)` request em vez de `O(n)`.
- **`gl: 'br'` + `hl: 'pt-br'`** na request Serper — força resultados Brasil/português, evita lixo internacional.
- **Erro UX humano**. Se faltar `SERPER_API_KEY`, modal mostra exatamente onde adicionar + link Serper. Sem "Error 503" cru.

### Parse de endereço
Serper retorna `address` como string única ("Rua X, 123 - Bairro, Salvador - BA, 40000-000, Brazil"). Regex `/,\s*([^,]+?)\s*-\s*([A-Z]{2})\s*(?:,|$)/` extrai cidade + UF. Fallback procura último segmento com 2 letras maiúsculas. Quando falha, cidade/estado ficam vazios — UI já aceita.

### Trade-offs aceitos
- **Sem retry/backoff em Serper**. Free tier tem rate limit alto; paid também. Se falhar, usuário re-clica. Adicionar backoff se virar problema.
- **Sem cache local de busca**. Mesmo nicho+cidade duas vezes = 2 requests. OK porque busca é caro (5 req pra 100), usuário não repete por acidente.
- **Sem streaming de progresso server→client durante busca**. Cliente vê apenas "Buscando..." sem porcentagem porque Serper retorna resultados em batch por página, não stream. Importação sim tem progress via `onProgress` callback.
- **`batchCreateProspects` insere o que dá, reporta o que falhou**. Não faz rollback em caso de erro parcial. Aceitável — duplicatas são dedupadas, erros são reportados no UI ("X importados, Y já existiam, Z erros").

### Verificação ao fechar a Sprint
Sem `SERPER_API_KEY` ainda configurada — não rodei os 3 testes (50/100/200). Infraestrutura validada:
- `/api/places` POST sem key → `503 { error, setup }` ✓
- `/oportunidades` GET → 200 ✓
- Modal abre com 3 campos (Nicho, Cidade, Quantidade) ✓
- Submeter sem key → estado `error` com mensagem explicativa ✓

Quando a key for adicionada ao `.env.local`, basta reiniciar o servidor e rodar as 3 capturas (Estética/Salvador/50, Estética/Salvador/100, Estética/Salvador/200) — a infraestrutura está pronta.

### Paths tocados
- `app/api/places/route.ts` (stub → implementação real)
- `app/oportunidades/_lib/api.ts` (+ `batchCreateProspects`, `BatchImportResult`)
- `app/oportunidades/_components/CaptureModal.tsx` (novo)
- `app/oportunidades/page.tsx` (removido `ImportModal` inline, plugado `CaptureModal`)
- `.env.local` (+ `SERPER_API_KEY=`)

---

## 2026-06-03 · Sprint 1 — Fundação do módulo

### Implementado
- Migration `004_prospects` — schema completo com `google_place_id` e `instagram` já incluídos para evitar migration futura.
- Status enum (6): `Novo | Auditado | Demo Gerada | Contato Enviado | Reunião | Fechado` (CHECK constraint).
- `types.ts` + `api.ts` + `layout.tsx` + 3 componentes (`StatusBadge`, `RatingBadge`, `ProspectDrawer`) + `page.tsx`.
- Filtros client-side: busca texto + status + cidade + categoria + ordenação. Limpar com 1 botão.
- KPI strip × 5 tiles. Tabela com 8 colunas + ações 👁 ✏️ 🗑.
- Drawer 3 modos (create/edit/view).
- Stub `/api/places` tipado para preparar Sprint 2.

### Decisões importantes
- **Módulo isolado**. Zero arquivo de `/crm`, `/offer-book` ou `/clientes-dashboard` modificado. Topbar próprio com nav para os 4 módulos.
- **Reuso de primitives**. `getSupabase()` (singleton do Offer Book). Padrão de `rowToX / XToRow` do CRM. Tier colors da escala `scoreTier`.
- **`status` separado de `stage` do CRM**. Prospect é pré-lead. Promoção manual para CRM é Sprint 3.
- **Cidade/categoria dinâmicas**. Filtros populados a partir das rows existentes (`listCidades`, `listCategorias`) — sem hardcode.

### Trade-offs aceitos
- Filtros 100% client-side. < 5k rows é OK. Quando ultrapassar, server-side via `ProspectFilters` já está pronto na assinatura de `listProspects`.
- Sem paginação. Mesma justificativa.
- Sem promoção `prospect → cliente`/`crm_lead`. Sprint 3.
