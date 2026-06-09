<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# AGENTS.md — O6 Growth

Guia compacto para qualquer agente (Codex, swarm worker, contributor humano) que abrir este repositório pela primeira vez. Para detalhes profundos consulte [`CLAUDE.md`](./CLAUDE.md) e [`memory/*`](./memory).

## Project overview

**O6 Growth OS** é um sistema operacional comercial para serviços profissionais brasileiros (clínicas de estética, odontologia, fisioterapia, advocacia). O sistema integra:

- **Offer Book** — coleta de inteligência comercial (cliente, ICP, psicografia, oferta, concorrentes, diagnóstico) com síntese gerada por IA
- **Oportunidades** — prospecção fria via Apify Google Maps scraper + auditoria de site + Claude WhatsApp opener + demo HTML deployado em Vercel
- **CRM** — Kanban de 7 etapas com follow-up automation e dashboard comercial
- **Agenda** — calendário comercial semanal (slot management, prep Cal.com/GCal/Meet)
- **Print** — exportação PDF do Offer Book via `window.print()`

O sistema é dirigido por uma seqüência de **agentes Claude** que se compõem (audit → opener → demo → outreach → diagnóstico → onboarding). Veja [`skills/agents.md`](./skills/agents.md) e a seção *Agent Swarm Architecture* em CLAUDE.md.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | **Next.js 16** (App Router + Turbopack) |
| Runtime / lang | Node 22, **TypeScript 5 strict** |
| UI | React 19, **Tailwind 4** (`@theme` em `app/globals.css`), shadcn/ui, framer-motion, lucide-react |
| Database | **Supabase** (Postgres + RLS anon-all) |
| AI | **Anthropic Claude API** via `fetch` direto (sem SDK para rotas de I/O simples; `@anthropic-ai/sdk` apenas em `/api/offer-book/generate`) |
| Scrapers | Apify (`compass/crawler-google-places`), cheerio (HTML local), Google PageSpeed Insights |
| Deploy estático de demos | Vercel API (`/v2/files` + `/v13/deployments`) — northstar account, **sempre passar `?teamId=...`** |
| Print/PDF | `window.print()` + `@media print` CSS, zero deps |

## ⛔ What Codex (and any agent) MUST NOT touch

Sem aprovação explícita do humano dono:

1. **Tabelas em produção** — `clientes`, `diagnosticos`, `offer_books`, `crm_leads`, `crm_stage_history`, `crm_message_templates`, `prospects`, `audits`, `meetings`, `offer_book_sintese`. Adicionar colunas exige **migration nomeada** (ver Database rules abaixo). Nunca `DROP`/`ALTER` colunas existentes sem migration que documente o motivo.
2. **Rotas commitadas e funcionais**:
   - `app/crm/**` — Kanban, drawer, dashboard, templates
   - `app/offer-book/**` — 10 páginas, store, IA generate/sintese
   - `app/agenda/**` — slots, drawer, integration prep
   - `app/oportunidades/**` — captura, drawer, audit/abordagem/demo
3. **Auth**. Não introduzir tela de login, NextAuth, Clerk, Supabase Auth UI etc. RLS está `anon all` por **decisão de design** até que o humano decida ativar auth.
4. **Sidebar do Offer Book** (`app/offer-book/_components/Sidebar.tsx`). Adicionar item OK; reordenar/renomear sem motivo NÃO.
5. **`/print` route** (`app/print/page.tsx`). Não instalar `@react-pdf/renderer`, `jsPDF`, `puppeteer` etc. `window.print()` é a decisão.
6. **State manager global**. Não introduzir Redux, Zustand, Jotai. Cada módulo gerencia próprio state; cross-module é via Supabase.
7. **Modelo Claude**. NÃO trocar `claude-sonnet-4-20250514` por OpenAI, Gemini, ou outro Claude sem aprovação. Exceção legada: `/api/offer-book/generate` usa `claude-opus-4-8` por decisão Sprint 4.
8. **`next.config.ts`**. `turbopack.root` está pinado por causa de lockfile órfão em `C:\Users\Didico\package-lock.json`. Não remover.
9. **`.env.local`**. Não commitar. Não logar valores de keys.

## How to create new API routes

Padrão canônico: [`app/api/prospects/pipeline/route.ts`](./app/api/prospects/pipeline/route.ts) (audit + Claude WhatsApp + persist + fail-soft).

Estrutura mínima:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Vercel timeout (server actions blocantes)
export const maxDuration = 120;  // <= 300 em Pro+

// 1. Types — input + saída tipada
type Input = { prospect_id: string; force?: boolean };

// 2. Handler — sempre POST, GET retorna 405
export async function POST(req: NextRequest) {
  // 2.1. Parse body com try/catch
  let body: Input;
  try { body = (await req.json()) as Input; }
  catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }

  // 2.2. Validar required
  if (!body.prospect_id) {
    return NextResponse.json({ error: "prospect_id é obrigatório" }, { status: 400 });
  }

  // 2.3. Validar env vars
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY não configurada" }, { status: 503 });
  }

  // 2.4. Inicializar Supabase
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );

  // 2.5. Cache-by-default: se já tem resultado e !force, retornar do DB
  // ...

  // 2.6. Chamar Claude / serviço externo com try/catch específico
  try { /* ... */ }
  catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("[route-name]", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  // 2.7. Persistir com fail-soft (retorna resultado mesmo se INSERT falhar)
  const { error: updErr } = await sb.from("table").update({ /* ... */ });
  if (updErr) console.error("[route-name] update failed", updErr);

  // 2.8. Response sempre JSON
  return NextResponse.json({ /* ... */ });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
```

**Regras de erro:**
- Auth/config faltando → `503`
- Input ruim → `400`
- Recurso não encontrado → `404`
- Falha externa (Claude/Vercel/Apify) → `502` com causa real (use `err.cause` pra unwrap undici)
- Falha interna inesperada → `500`

**Logs:** sempre prefixe com `[route-name]` pra grep fácil.

## How to create new pages

Padrão canônico: [`app/oportunidades/page.tsx`](./app/oportunidades/page.tsx) (lista + filtros + drawer + KPIs).

Estrutura:

```
app/<module>/
  _lib/              # types, api, store — privates (Next 16 trata `_` como private)
    types.ts         # types + `rowToX`/`xToRow` mappers
    api.ts           # CRUD via getSupabase() singleton
  _components/       # primitives específicos do módulo
    XDrawer.tsx
    XBadge.tsx
  layout.tsx         # topbar/nav (sem importar Sidebar de outro módulo)
  page.tsx           # entry: hidratação + KPIs + filtros + tabela + drawer
```

Regras:
- **Sempre `"use client"` no topo** se o page usa hooks/state
- **`if (!hydrated) return null`** quando store async precisar carregar antes
- Importar `getSupabase()` de `app/offer-book/_lib/supabase.ts` — não criar `createClient` novo
- Reusar `getSupabase()`, `scoreTier()`, `formatDate` quando existirem
- Para client components com `useSearchParams`, **wrap em `<Suspense>`** (Next 16 build falha sem isso — ver `app/agenda/page.tsx`)

## Database rules

1. **Toda mudança de schema passa por migration nomeada** `supabase/migrations/NNN_descricao_snake.sql`. Sequência: olhar a maior numeração existente (atual: `008`) e usar a próxima.

2. **Aplicar via Supabase MCP** com `mcp__b3bed439…__apply_migration` quando possível. Se Zod do MCP falhar, usar `execute_sql` mas **continuar criando o arquivo `.sql`** em `supabase/migrations/` pra histórico.

3. **Estilo SQL:**
   - `create table if not exists` ou `add column if not exists` quando possível (idempotente)
   - Sempre `enable row level security` + policy `anon all` para tabelas novas (alinhar com RLS atual)
   - Trigger `set_updated_at` em tabelas que têm `updated_at`
   - Índices: `(cliente_id, created_at desc)` para cache lookups; índice parcial `WHERE col IS NOT NULL` para colunas sparse

4. **Não criar tabela auth** ou referenciar `auth.users` — RLS está `anon all` por design.

5. **JSONB > tabelas normalizadas** para dados edit-heavy de baixa cardinalidade (1 row por cliente). Ex.: `offer_books.icp`, `offer_books.psicografia`, `audit_json`.

## AI rules

1. **Modelo padrão para integrações novas: `claude-sonnet-4-20250514`**. Para integrações existentes:
   - `/api/offer-book/generate` → `claude-opus-4-8` (Sprint 4 legacy)
   - `/api/prospects/demo` → `claude-sonnet-4-6` (HTML generation)
   - `/api/prospects/pipeline` → `claude-sonnet-4-20250514`
   - `/api/offer-book/sintese` → `claude-sonnet-4-20250514`

2. **Nunca OpenAI, Gemini, ou qualquer outro provider** sem aprovação explícita.

3. **Chamada direta via `fetch`** para `https://api.anthropic.com/v1/messages` em rotas simples. SDK `@anthropic-ai/sdk` apenas onde já está (generate route). Header obrigatório: `anthropic-version: 2023-06-01`.

4. **Cache 7 dias** para outputs caros (sintese, plano-acao, roadmap, audit, demo). Query `created_at >= now() - interval '7 days'` + `force=true` no body para regerar.

5. **Prompts em pt-BR** — toda copy de UI e prompts pra Claude usam português brasileiro.

6. **Restrições obrigatórias no prompt** para JSON output:
   - "Responda APENAS com o JSON. Sem markdown. Sem comentários."
   - Strip de fences ` ```json ... ``` ` antes de parse (modelos às vezes envolvem)
   - Validar estrutura com guard function antes de aceitar

7. **`max_tokens` adequado:**
   - Opener WhatsApp (3-4 linhas): `600`
   - Síntese estratégica (4 campos): `2048`
   - Engine completo (sintese + plano + roadmap + insights): `6144`
   - HTML landing page: `20000`

8. **`maxDuration` adequado** (export const na route):
   - Audit-only: `60`
   - Audit + Claude: `120`
   - Demo (audit + Claude HTML + Vercel deploy + poll READY): `120`

## Code style

- **TypeScript strict on**. `noImplicitAny`, `strictNullChecks` etc. Não desabilitar.
- **Nunca `any`**. Use `unknown` + type guard, ou `Record<string, unknown>` para JSON.
- **Type guards para responses de API externa** — não confie em `as Type` cego.
- **Try/catch específico** por boundary (uma chamada de rede = um catch). Mensagem de erro deve ter causa real (use `err.cause` pra unwrap undici).
- **Sem `console.log` órfão em produção** — apenas `console.error` para falhas, `console.warn` para fallbacks que importam, `console.log` com prefixo `[route-name]` durante debug ativo.
- **Imports relativos curtos** dentro do módulo (`./_lib/types`); cross-module via `@/app/...` (alias em `tsconfig.json`).
- **Sem emojis em código** salvo pedido explícito do humano.
- **Tailwind utility classes** + `globals.css` para tokens — sem CSS modules, sem styled-components, sem emotion.
- **`framer-motion` para toda animação** interativa (entrada/saída de drawer, hover de card). CSS `transition`/`@keyframes` OK para hover simples e shimmer.

## Commit rules

1. **Prefixos** (Conventional Commits):
   - `feat(<scope>):` nova funcionalidade
   - `fix(<scope>):` correção de bug
   - `refactor(<scope>):` reorganização sem mudar comportamento
   - `docs:` documentação (CLAUDE.md, memory, AGENTS.md, README)
   - `chore:` build, deps, configs
   - `perf:` otimização

2. **Scope** = módulo: `feat(crm): ...`, `fix(prospects/demo): ...`, `refactor(offer-book): ...`

3. **Mensagem:**
   - Linha 1: ≤ 70 chars, imperativo, descritivo
   - Linha em branco
   - Body: explicar **por que**, não só o que. Incluir verification quando aplicável (HTTP probes, tsc, SQL count).

4. **Um task por commit.** Não misturar feature nova com refactor não-relacionado.

5. **Co-Authored-By footer:** mantém `Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>` se a contribuição veio de assistant Claude. Codex deve incluir seu próprio footer equivalente.

6. **Não commitar sem rodar `npx tsc --noEmit -p .`** primeiro. Type-check é gate.

7. **Não push para `main` sem teste end-to-end** pelo menos via curl/probe. Mudança que toca UI exige screenshot ou eval via preview.

## Quick reference

| Ação | Lugar |
|---|---|
| Adicionar coluna | `supabase/migrations/NNN_*.sql` |
| Nova rota API | `app/api/<scope>/<name>/route.ts` |
| Novo page no módulo | `app/<module>/<page>/page.tsx` + atualizar `Sidebar.tsx` se módulo tem |
| Nova síntese AI | `claude-sonnet-4-20250514` via fetch direto, cache em coluna JSONB |
| Memory entry | `memory/<modulo>.md` (newest on top, header `## YYYY-MM-DD · título`) |
| Lição aprendida cross-cutting | `CLAUDE.md` → Lições aprendidas |

## When stuck

1. Ler `CLAUDE.md` por inteiro
2. Ler `memory/<modulo>.md` correspondente
3. Procurar padrão em rota/page existente similar
4. Se ainda não claro, **pare e pergunte** ao humano dono. Não invente schema, não invente API contract.
