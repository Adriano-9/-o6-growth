# Finalização O6 Growth — Junho 2026

Pacote de finalização do sistema executado em sessão única. Newest on top.

---

## Sprint 7 — Demo Site Generator (2026-06-08)

| # | Tarefa | Status |
|---|---|---|
| 1 | Migration `009_demo_url` (`demo_url`, `demo_generated_at`) | ✅ Aplicado via Supabase MCP |
| 2 | `POST /api/prospects/demo` — Claude HTML + Vercel deploy | ✅ Criado |
| 3 | Pipeline atualizado — demo step + demo URL na abertura | ✅ |
| 4 | Types + mapper `rowToProspect` com `demoUrl`/`demoGeneratedAt` | ✅ |
| 5 | `ProspectDrawer` — botão "Gerar Demo" + panel Demo Site + link | ✅ |
| 6 | `.env.local` — placeholder `VERCEL_TOKEN=` documentado | ✅ |

**Pendente para ativar**: setar `VERCEL_TOKEN` no `.env.local` (obter em vercel.com/account/tokens).

---

## Status final por tarefa

| # | Tarefa | Status | Commit |
|---|---|---|---|
| 1 | Fix ROI parse bug (`roi/page.tsx`) | ✅ Já estava resolvido em commit anterior | `cd32211` (background) + cobertura em `ab1a11a` |
| 2 | Verify Apify→Supabase save + row count | ✅ Verificado em produção (10 → 13 prospects depois de busca "dentista Salvador") | — |
| 3 | Prospect pipeline (audit + Claude WhatsApp + UI) | ✅ Migration 008 + `/api/prospects/pipeline` + UI no ProspectDrawer | `ab1a11a` |
| 4 | CRM dashboard — weekly activity + overdue follow-ups | ✅ `listStageHistorySince` + 2 novas seções em `CommercialDashboard` | `6372580` |
| 5 | Fix Turbopack warning | ✅ `turbopack.root` já pinado em commit anterior | `e0269b6` |

---

## Detalhe técnico das mudanças

### Task 1 — ROI parse bug (já resolvido em background)
- `parseNumber` usa regex `/\d[\d.,]*/` para extrair só o primeiro número.
- `parsePercent` segue mesmo padrão.
- Guards `LEADS_MAX = 10_000`, `TICKET_MAX = 100_000`, `convN > 0 && <= 1`.
- Helper `toDisplayVal()` mantém o input limpo quando o cliente cola texto descritivo.
- Flag `valid = leadsN > 0 && ticketN > 0 && convN > 0` controla se MetricCards exibem `"—"` ou valores.
- `setLeads/setTicket/setConversao` sanitizam input no write usando `replace(/[^\d.,]/g, "")`.

### Task 2 — Apify save verificação
- Save logic já existia no commit `cd32211` (linhas 167-262 de `app/api/apify-search/route.ts`):
  - Tri-key dedup (`google_place_id` + `site` >5ch + `telefone`)
  - Query parallelo de dedup
  - Filtro intra-batch + DB
  - Chunks de 50 rows
  - Return `{ imported, skipped, errors }`
- Teste live: `POST /api/apify-search { query:"dentista", cidade:"Salvador", limit:5 }`
  - Resposta: `imported: 3, skipped: 2 (intra-batch dups: 2 com mesmo site `espacoredoma.com.br`), errors: 0`
  - DB prospects count: 10 → 13 ✅

### Task 3 — Prospect pipeline (novo)
- **Migration `008_prospects_pipeline.sql`**: adiciona `audit_score int`, `audit_json jsonb`, `abertura_whatsapp text`, `abordagem_gerada_em timestamptz` + 2 índices parciais.
- **`/api/prospects/pipeline/route.ts`** (POST):
  - Cache-by-default; `force=true` regenera tudo.
  - Audit fail-fast (502 com causa); Claude fail-fast (502 com causa).
  - Persiste audit_score + audit_json + abertura + timestamp.
  - Marca `status = "Auditado"` no sucesso.
  - Fail-soft em persistência (devolve abordagem mesmo se UPDATE falha).
  - `maxDuration: 120`.
  - Modelo Claude: `claude-sonnet-4-20250514` (não OpenAI, conforme especificação).
- **Prompt de abertura** (em pt-BR, no route):
  - 3-4 linhas, casual.
  - Começa pelo nome do negócio.
  - Cita problema concreto do pior eixo (sem expor o número do score).
  - Termina com pergunta aberta. Sem pitch.
- **Types em `oportunidades/_lib/types.ts`**:
  - `Prospect` ganha `auditScore`, `auditJson`, `aberturaWhatsapp`, `abordagemGeradaEm`.
  - `ProspectInput` agora explicitamente `Omit` esses 4 campos (server-managed).
  - `rowToProspect` mapper atualizado.
- **UI em `ProspectDrawer.tsx`**:
  - Botão "Gerar Abordagem" ao lado de "Auditar Site" em grid 2-col.
  - Hidrata cache da abordagem ao abrir o drawer (se prospect já tem opener gerado).
  - Loading skeleton, error banner, score badge tier-colored, Copy-to-clipboard com feedback 1.5s.
  - Botão muda de "Gerar Abordagem" para "Regerar Abordagem" se já existe cache.
- **Teste live** contra prospect com site (Espaço Redoma Odontologia, espacoredoma.com.br):
  - Audit rodou e gravou: overall_score 56/100, 3 recomendações em DB.
  - Claude step falhou com "ANTHROPIC_API_KEY não configurada" (esperado — key não está no `.env.local` desse ambiente). Pipeline está 100% wired; só precisa da key.

### Task 4 — CRM dashboard expansions
- **Nova helper `listStageHistorySince(days=7)`** em `crm/_lib/api.ts`:
  - Query única em `crm_stage_history` com `changed_at >= now() - days`.
- **CRMPage** hidrata `weeklyHistory: StageHistoryEntry[]` no `refresh()`.
- **`CommercialDashboard`** ganha 2 props (`weeklyHistory`, `onOpenLead`) e 2 seções:
  - **"Atividade da Semana"** (abaixo dos KPIs, acima do funil): 4 tiles contando transições `stageTo` nos últimos 7 dias para "Contato Feito", "Diagnóstico Agendado", "Proposta", "Fechado".
  - **"Próximos Follow-ups Vencidos"** (final do dashboard): lista de leads com `dataProximaAcao < hoje`, excluindo Fechado/Perdido, ordenados ASC por due date (mais vencidos primeiro). Tiering visual: 0-2d neutro, 3-6d amber, 7+d red. Cap em 10 rows com overflow "+ N outros vencidos…". Cada row é clicável → abre o lead drawer.

### Task 5 — Turbopack workspace root
- Já pinado em commit `e0269b6` (sessão anterior):
  ```ts
  turbopack: { root: path.resolve(__dirname) }
  ```
- Root cause: lockfile órfão em `C:\Users\Didico\package-lock.json` que o Next 16 estava inferindo como workspace root.

---

## Estado da base no fim da sessão

```sql
select count(*)::int as total from public.prospects;
-- 13 prospects
```

| Tabela | Migrations cumulativas |
|---|---|
| `prospects` | 004, 004_endereco, 008 |
| `audits` | 006 |
| `offer_books` | 001, ai_output/ai_generated_at colunas |
| `offer_book_sintese` | 007 (cache 7d) |
| `crm_leads` | 003 + Sprint 6 follow-up fields |
| `crm_stage_history` | Sprint 6 |
| `crm_message_templates` | Sprint 6 |
| `meetings` | 005 |
| `clientes` + `diagnosticos` | 001 |

---

## Decisões de design relevantes

- **Pipeline = 1 endpoint, não 2.** Não criar `/api/prospects/audit` separado e `/api/prospects/opener` separado. O usuário sempre quer os dois juntos (auditar pra justificar a abordagem). Cache atômico em `prospects.audit_json + abertura_whatsapp + abordagem_gerada_em`.
- **Server-managed fields fora do `ProspectInput`.** Evita que `CaptureModal` / `batchCreate` / form manual precisem enviar `null` para essas colunas. `Omit` explícito no tipo.
- **Score do audit é um INT na coluna principal**, JSON completo num campo separado. Permite filtrar/ordenar prospects por audit_score sem deserializar JSONB.
- **Stage history como fonte de verdade pro weekly summary.** Não dá pra confiar em `updated_at` do lead porque qualquer edit reseta. `crm_stage_history` é insert-only e exato.
- **Lista de overdue trunca em 10** com footer "+ N outros". Operador comercial mira a fila quente; lista infinita é distração.
- **Modelo Claude consistente** em todas as integrações de AI desta finalização: `claude-sonnet-4-20250514`. O `/api/offer-book/generate` mantém o `claude-opus-4-8` legado (decisão da Sprint 4).
- **Fail-soft no persist final** do pipeline. Se o INSERT/UPDATE falha (e.g., RLS, network), o usuário ainda recebe a abordagem gerada — não desperdiça a chamada paga ao Claude.

---

## O que falhou / pendente fora do escopo da sessão

- **Claude opener via `/api/prospects/pipeline`** retorna 502 sem `ANTHROPIC_API_KEY`. Esperado nesse ambiente. Para colocar em produção: setar `ANTHROPIC_API_KEY=sk-ant-...` no `.env.local` e reiniciar.
- Apify busca "Salvador" retornou prospects de **Recife** (quirk do actor: aceitou "Salvador" como sobrenome no nome de algumas clínicas, não como localização). Sem fix nesta sessão; consideração futura: passar `searchPlaceLocation` ao actor em vez de só `searchStringsArray`.
- Os 3 prospects importados na sessão têm `endereco` de Recife, não Salvador — fica como dado real para teste de pipeline (1 deles foi auditado com sucesso).

---

## Git log da sessão de finalização

```
6372580 feat(crm): dashboard — weekly activity + sorted overdue follow-ups
ab1a11a feat(prospects): pipeline route — audit + Claude WhatsApp opener + cache
```

(commits anteriores `cd32211`, `e0269b6` já tinham resolvido Tasks 1, 5 e parte do contexto.)
