# Offer Book — memory

Decisões técnicas do módulo `/offer-book/*`. Newest on top. Cross-cutting em [`o6.md`](./o6.md).

---

## 2026-06-05 · Sprint 5 — 6 Scores + Strategic Engine (AI horizons)

### 2 novos scores em `_lib/scores.ts`
- **`potencialScore`**: ticket (R$500=10pts, R$5000+=50pts) + ICP fill ratio × 0.3 + leads/mês volume.
- **`eficienciaScore`**: campos de oferta (prova/garantia/diferencial) × 0.4 + concorrentes mapeados (10pts cada, max 30) + psicografia fields × 0.3.
- `ScoreKey` type expandido: `velocidade | oferta | aquisicao | conversao | potencial | eficiencia`.
- `computeScores()` retorna array de 6 `ScoreDef`.

### Novo tipo `AiStrategic` em `_lib/ai-types.ts`
```typescript
AiStrategic = {
  curtoPrazo: { horizonte: "0-30 dias"; objetivo; acoes: AiRecomendacao[] }
  medioPrazo: { horizonte: "30-90 dias"; objetivo; acoes: AiRecomendacao[] }
  longoPrazo: { horizonte: "90-180 dias"; objetivo; acoes: AiRecomendacao[] }
  potencialReceita: string
  principalGargalo: string
  diferencial: string
}
```
`AiOutput` expandido com `strategic: AiStrategic`.

### `/api/offer-book/generate` — criticamente corrigido e expandido
- **Bug crítico corrigido**: `thinking: { type: "adaptive" }` (tipo inválido) e `output_config: { effort: "medium" }` (parâmetro inexistente) removidos. Usava params que quebravam silenciosamente.
- **Bug crítico corrigido**: `getSupabase()` retornava `null` em server context (guard `typeof window === "undefined"` removido de `supabase.ts`).
- **`maxDuration = 120`** adicionado (Vercel timeout seguro para Opus 4.8).
- **`max_tokens` 2048 → 4096** para acomodar seção `strategic` adicional.
- **`validateAiOutputLenient()`**: fallback backward-compat — preenche `strategic` vazio se output cacheado antigo não tem a seção.
- **Prompt**: cita dados reais do cliente (`seus X% de conversão`, `suas Y leads/mês`), usa nome/cidade/nicho. Regra explícita: "NUNCA use linguagem genérica de SaaS".
- **`cache_control: { type: "ephemeral" }`** no system message — a SDK do Anthropic aceita nativamente, `@ts-expect-error` foi desnecessário e removido no build.

### `resumo/page.tsx` — expanded layout
- Grid de scores: `md:grid-cols-4` → `grid-cols-3 md:grid-cols-6`.
- `StrategicBlock` component: badge horizonte + objetivo + bullets de ações.
- "Engine Estratégico": 3 cards (Curto Prazo red, Médio Prazo amber, Longo Prazo cyan).
- "Potencial de Receita" + "Diferencial Genuíno" em grid 2-col.
- "Principal Gargalo (AI)" no bloco de Diagnóstico Consolidado.

### `plano-acao/page.tsx` + `print/page.tsx`
- Adicionadas entradas para `potencial` e `eficiencia` no record `actionByScore`.
- Sem elas, `actionByScore[score.key]` seria `undefined` para os 2 novos scores → runtime error.

### Paths tocados (Sprint 5)
- `app/offer-book/_lib/ai-types.ts` (expandido: AiStrategic, AiRecomendacao)
- `app/offer-book/_lib/scores.ts` (2 novos scores, ScoreKey expandido)
- `app/offer-book/_lib/supabase.ts` (bug crítico: server-side null fix)
- `app/api/offer-book/generate/route.ts` (bugs corrigidos + strategic section)
- `app/offer-book/resumo/page.tsx` (6-score grid + StrategicBlock UI)
- `app/offer-book/plano-acao/page.tsx` (2 entradas novas no actionByScore)
- `app/print/page.tsx` (idem)

---

## 2026-06-05 · Sprint 4 (v2) — AI Audit Engine unificado (resumo + plano-acao + roadmap)

### Implementado
- **Migration `007_offer_books_ai_output`** — 3 colunas em `offer_books`: `ai_output JSONB DEFAULT NULL`, `ai_generated_at TIMESTAMPTZ DEFAULT NULL`, `ai_model TEXT DEFAULT NULL`. Sem tabela nova; reutiliza JSONB existente.
- **`@anthropic-ai/sdk`** — instalado (npm). Substitui `fetch` direto usado em draft anterior.
- **`app/offer-book/_lib/ai-types.ts`** — tipos `AiSintese`, `AiPrioridade`, `AiFase`, `AiOutput`, `AiGenerateResponse`.
- **`app/api/offer-book/generate/route.ts`** — POST unificado:
  - Recebe `{clienteId, state: OfferBookState, force?}`
  - Cache: se `ai_output` existe em DB e `force=false` → retorna cached imediatamente
  - Cache MISS ou `force=true` → chama `claude-opus-4-8` com `thinking: {type: "adaptive"}` + `output_config: {effort: "medium"}` + system prompt cacheado (`cache_control: ephemeral`)
  - Parse JSON (regex `/\{[\s\S]*\}/` para extrair de possível markdown)
  - Valida shape: `sintese`, `planoAcao`, `roadmap` obrigatórios
  - UPDATE `offer_books` (não INSERT separado — reutiliza row existente)
  - Retorna `AiGenerateResponse` com `cached`, `generatedAt`, `tokensUsed`
- **`store.tsx`** — adicionados `aiOutput: AiOutput | null`, `aiGeneratedAt: string | null`, `setAiOutput()`. Hydration em `loadCliente` lê `ai_output`/`ai_generated_at` do row de `offer_books`. Reset de seleção limpa ambos.
- **`resumo/page.tsx`** — migrado de `/api/offer-book/sintese` para `/api/offer-book/generate`. 4 AICards leem `aiOutput.sintese.*`. Auto-fetch se `!aiOutput` na hydration. Botão "Atualizar" passa `force=true`.
- **`plano-acao/page.tsx`** — adicionado botão "Gerar com IA" / "Regenerar". Se `aiOutput.planoAcao.prioridades` → renderiza `PriorityAI`; else → `PriorityDeterministic` (determinístico intacto como fallback).
- **`roadmap/page.tsx`** — adicionado `"use client"` + `useOfferBook`. Botão "Gerar com IA". Se `aiOutput.roadmap.fases` → renderiza fases AI; else → fases estáticas (fallback intacto).

### Decisões de design
- **Uma chamada, três seções** — `generate` produz resumo + plano + roadmap de uma vez. Custo ~$0.03/geração em Opus 4.8.
- **Cache por DB** — `offer_books.ai_output` persiste. Próxima abertura do cliente hidrata do DB sem nova chamada.
- **Fallback determinístico** — plano-acao e roadmap continuam funcionando sem AI. Usuário pode usar sem `ANTHROPIC_API_KEY`.
- **`force=true` na regeneração** — o botão "Regenerar" bypassa o cache.
- **Markdown fence stripping** — regex `/\{[\s\S]*\}/` extrai JSON do response mesmo se Claude embrulhar em fence.
- **`agenda/page.tsx`** — bug pré-existente corrigido: `useSearchParams` wrapped em `<Suspense>` (Next.js 16 exige).

### Trade-offs aceitos
- **Sem streaming** — blocking request 10-60s dependendo da thinking. Skeleton durante. Considerar streaming no futuro se latência for reclamação.
- **`fetch` bloqueante no server** — `maxDuration` não definida nesta route; padrão Vercel Pro = 60s. Opus 4.8 com adaptive thinking pode exceder. Adicionar `export const maxDuration = 120` se necessário.
- **`// eslint-disable` em `useCallback` deps** — `JSON.stringify(state)` nas deps é workaround para `state` objeto complexo. Aceitável para este padrão de uso.

### Custo estimado
| Modelo | Input ~1.400tok | Output ~900tok | Por geração |
|---|---|---|---|
| claude-opus-4-8 | $0.007 | $0.023 | **~$0.030** |
Frente ao ticket médio R$2.500+, custo negligível.

### Paths tocados
- `app/offer-book/_lib/ai-types.ts` (novo)
- `app/api/offer-book/generate/route.ts` (novo)
- `app/offer-book/_lib/store.tsx` (+ aiOutput, setAiOutput, hydration)
- `app/offer-book/resumo/page.tsx` (URL migrada, usa store)
- `app/offer-book/plano-acao/page.tsx` (AI priorities + botão)
- `app/offer-book/roadmap/page.tsx` (client component + AI fases + botão)
- `app/agenda/page.tsx` (Suspense fix)
- `.env.local` (comentário atualizado)
- DB: migration `007_offer_books_ai_output` aplicada

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
