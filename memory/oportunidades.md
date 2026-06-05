# Oportunidades — memory

Decisões técnicas do módulo `/oportunidades`. Newest on top. Cross-cutting em [`o6.md`](./o6.md).

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
