# Offer Book — memory

Decisões técnicas do módulo `/offer-book/*`. Newest on top. Cross-cutting em [`o6.md`](./o6.md).

---

## 2026-06-03 · v1.3 commercial fechada (Supabase + multi-cliente + PDF)

### Multi-cliente
- Cliente atual é tracked via `localStorage["o6.offer-book.current"]` = UUID.
- Hydration: on mount lê current id → fetch nested `clientes(*, diagnosticos(*), offer_books(*))`.
- `OfferBookProvider` (`app/offer-book/_lib/store.tsx`) expõe `createCliente`, `selectCliente`, `deleteCliente`, `listClientes`.
- Cliente novo cria 3 rows em transação implícita: clientes + diagnosticos + offer_books (FK cascade).

### Autosave
- Debounce **600 ms** por slice (`cliente`, `diagnostico`, `offer_book`). Timers separados pra não trampar entre formulários.
- Save flow: user setter → `setState(...)` → `scheduleSave(key, fn)` → após debounce → `setSyncing(true)` → upsert Supabase → `setSyncing(false)`.
- Indicador "Salvando..." na Sidebar via `syncing` flag.
- Hydration NÃO triggera save (writes só pela rota dos setters).

### Schema (migrations 001 e 002)
- `clientes` — 8 colunas flat + timestamps.
- `diagnosticos` — 1:1 FK `cliente_id unique on delete cascade`, 7 colunas (inclui `leads_mes` adicionada na 002 pro ROI ter persistência).
- `offer_books` — 1:1 FK unique, JSONB pra `icp`/`psicografia`/`oferta` (objetos) e `concorrentes` (array). Decisão JSONB porque essas seções são edit-heavy e shape pode mudar sem migration.
- Trigger `set_updated_at` em todas. Índices em `updated_at desc` pra listing.

### 11 sub-rotas
`clientes` · `icp` · `psicografia` · `concorrentes` · `oferta` · `diagnostico` · `dashboard` · `resumo` · `plano-acao` · `roadmap` · `roi`. Hub em `/offer-book` (`page.tsx`).

### Scores determinísticos (`_lib/scores.ts`)
- 4 indicadores 0-100: **Velocidade** (parse tempoResposta), **Oferta** (completude + densidade), **Aquisição** (multi-canal bonus), **Conversão** (% × completude).
- Tier: `low` <40, `mid` 40-69, `high` ≥70.
- Plano de Ação = 3 piores scores ordenados ascendente, mensagem por tipo de score.
- ROI: `convPotencial = min(50%, max(conv×2, conv+10pp))`. Receita atual/potencial/ganho.

### Print route `/print`
- Rota **fora** de `/offer-book` pra escapar do layout com sidebar.
- `app/print/{layout,page}.tsx` reusa `OfferBookProvider` (mesma current cliente id).
- `useEffect` dispara `window.print()` 800 ms após hydration.
- CSS `@page A4 margin 16mm` + `@media print { .print-toolbar { display: none } }`.
- 9 seções na ordem: Cliente → ICP → Psicografia → Concorrentes → Oferta → Diagnóstico → Plano de Ação → Roadmap → ROI.
- Botão "Gerar Offer Book" na Sidebar (`Printer` ícone) abre em nova aba.

### Mappers (`_lib/store.tsx`)
- `clienteToRow` / `rowToCliente` — camelCase ↔ snake_case (`ticketMedio` ↔ `ticket_medio` etc).
- `diagnosticoToRow` / `rowToDiagnostico` — idem, inclui `leadsMes`.
- `rowToOfferBookSlices` — desempacota JSONB com fallback pra `emptyState.X` (proteção contra schema drift).
- Padrão: reuse em qualquer nova tabela do OS.

### Primitives extraíveis
- `FormShell` + `Field` em `_components/FormShell.tsx` — usado por todas as 5 rotas de form.
- `ScoreCard` em `_components/ScoreCard.tsx` — anel SVG, tier-colored. Reusado em Dashboard e Resumo Executivo.
- `Sidebar` em `_components/Sidebar.tsx` — pílula de cliente atual + nav + botão "Gerar Offer Book".

### Trade-offs aceitos
- JSONB pra ICP/Psicografia/Oferta vs. colunas flat: aceitamos por velocity (sem migration toda vez que mudar campo) ao custo de queries menos diretas. OK porque nunca filtramos por campos dentro do JSONB.
- Single current cliente per browser (não por aba): se o usuário abrir 2 abas e editar clientes diferentes, eles brigam. Aceitável pro uso atual; resolver com Broadcast Channel se virar incômodo.
- `concorrentes` como JSONB array em vez de tabela `concorrentes(offer_book_id, ...)`: aceito porque cardinalidade é baixa (3-10 por cliente) e nunca queremos joinar entre clientes.

---

## 2026-06-03 · v1.2 commercial features (Plano + Roadmap + ROI)

- `plano-acao/page.tsx`: P1/P2/P3 derivados dos 3 piores scores. Tier color por score. Mapa `actionByScore` define title + body + meta por tipo.
- `roadmap/page.tsx`: 3 fases estáticas (Estancar Hemorragia 0-30d · Otimizar e Escalar 30-90d · Previsibilidade e Domínio 90-180d). Bullets fixos por fase.
- `roi/page.tsx`: 3 inputs (leads, ticket, conversão) → 3 cards (Receita Atual, Potencial, Ganho). Inputs ligados ao store de diagnostico pra persistência.

---

## 2026-06-03 · v1.1 (Diagnostic + Dashboard scores + Resumo)

- Adicionado `diagnostico` ao state com 6 campos iniciais (+1 depois: leads_mes).
- Dashboard ganhou bloco "Indicadores" no topo (4 ScoreCards), abaixo do header.
- `resumo/page.tsx`: Health Score Global (média) + scores individuais + Gargalos (scores <60) + Oportunidades (scores <80) + Diagnóstico Consolidado.

---

## 2026-06-03 · v1.0 inicial

- Estrutura básica criada: layout com Sidebar, OfferBookProvider, 8 sub-rotas, hub.
- LocalStorage-only persistence (substituído na v1.3 por Supabase).
- 5 formulários (Cliente, ICP, Psicografia, Concorrentes multi, Oferta) + Dashboard read-only.
