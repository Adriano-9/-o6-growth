@AGENTS.md

# O6 Growth OS

Sistema operacional comercial para serviços profissionais. Offer Book coleta inteligência, Diagnostic mede gargalos, ROI projeta receita, CRM operacionaliza pipeline, PDF Generator entrega ao cliente.

## Verticais prioritários

Clínicas · Estética · Odontologia · Fisioterapia · Advogados. Toda copy, exemplo de placeholder e default de oferta deve refletir esse universo (ticket alto, ciclo consultivo, dor de aquisição/conversão, ROI mensurável). Em dúvida sobre tom: pense em um dono de clínica de estética que vende R$ 2.500 ticket médio.

## Stack

- **Next.js 16** (App Router + Turbopack) — **breaking** vs. training data; consulte `node_modules/next/dist/docs/` antes de tocar routing/data fetching
- **React 19** · **TypeScript 5** (strict) · **Tailwind 4** (`@theme` em `app/globals.css`)
- **shadcn/ui** — componentes base para UI nova. Instalar via `npx shadcn@latest add <component>`. Customizar com tokens do design system, nunca sobrescrever com CSS externo.
- **Supabase JS** — única fonte de verdade para dados de cliente
- `framer-motion` (animações — obrigatório para qualquer motion), `lucide-react` (todos os ícones)

## Module Map

| Módulo | Status | Rota | Função |
|---|---|---|---|
| O6 Growth OS | 🎯 Umbrella | — | Marca/conceito que agrega os 7 módulos abaixo. Não é uma rota — é o todo. |
| Offer Book | ✅ Shipped | `/offer-book/*` | Coletor de inteligência comercial (Cliente, ICP, Psicografia, Concorrentes, Oferta, Diagnóstico, Dashboard, Resumo, Plano de Ação, Roadmap, ROI) |
| Website Audit Engine | 📋 Planned | `/audit` (futuro) | Performance + SEO técnico + UX do site do cliente |
| ROI Engine | ✅ Shipped (embed) | `/offer-book/roi` | Cálculo determinístico. Promover a produto standalone em iteração futura. |
| CRM | ✅ Shipped | `/crm` | Kanban 7 etapas + drag-drop nativo + KPIs (Leads/Diagnósticos/Propostas/Fechamentos/Receita) |
| Dashboard | ✅ Shipped | `/clientes-dashboard`, `/offer-book/dashboard` | Lista global e síntese por cliente |
| PDF Generator | ✅ Shipped | `/print` | `window.print()` + `@media print` CSS, zero deps |
| Oportunidades | ✅ Shipped | `/oportunidades` | Prospecção fria + captura Google Maps (**Apify `compass/crawler-google-places`** — Serper.dev mantido como legacy) + dedup tri-chave (`google_place_id` + `site` + `telefone`) |
| Agenda Comercial | ✅ Shipped | `/agenda` | Calendário semanal, slots por dia, buffer 10min, vínculo prospect/lead/cliente |
| SEO Engine | 📋 Planned | `/seo` (futuro) | Análise técnica + conteúdo + autoridade |

## Estrutura do repositório

```
app/
  layout.tsx                 root layout (Geist fonts, html/body)
  globals.css                Tailwind 4 @theme tokens (brand-orange/cyan/graphite/offwhite)
  page.tsx                   landing page legada (light theme, NÃO confundir com OS)
  offer-book/
    _lib/                    types · store (OfferBookProvider) · supabase singleton · scores
    _components/             FormShell · Field · ScoreCard · Sidebar
    {clientes,icp,psicografia,concorrentes,oferta,diagnostico}/page.tsx
    {dashboard,resumo,plano-acao,roadmap,roi}/page.tsx
    layout.tsx               sidebar persistente + provider
  clientes-dashboard/page.tsx  lista global · view/edit/delete
  print/{layout,page}.tsx    PDF export route (sem sidebar)
  crm/
    _lib/                    types (STAGES, Lead) · api (CRUD + moveLead)
    layout.tsx · page.tsx    Kanban 7 colunas + drawer + KPIs
  oportunidades/
    _lib/                    types (PROSPECT_STATUS, Prospect, PlaceResult) · api (CRUD + batchCreateProspects com dedup tri-chave)
    _components/             StatusBadge · RatingBadge · ProspectDrawer · CaptureModal
    layout.tsx · page.tsx    Tabela + KPIs + filtros + drawer + CaptureModal Apify
  agenda/
    _lib/                    types (AVAILABILITY, SLOT_DURATION_MIN=30, SLOT_BUFFER_MIN=10) · slots (generateWeekSlots) · api (CRUD + listLinkOptions)
    _components/             StatusBadge · WeekNav · CalendarGrid · MeetingDrawer
    layout.tsx · page.tsx    Calendário semanal 5 colunas + KPIs ocupação
  api/
    places/route.ts          POST Serper.dev (LEGACY, mantido sem remover)
    apify-search/route.ts    POST Apify compass/crawler-google-places (ATIVO) · maxDuration: 300
components/o6/               landing page legada — NÃO usar para o OS
                             (4 arquivos órfãos: O6AuthorityEngine, O6Method, O6OfferBook, O6RevenueEngine)
```

## Supabase

- Projeto: **O6 growth** · `wphrwidjokimfjfvyaym` · region `us-west-2` · status `ACTIVE_HEALTHY`
- Env (`.env.local`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Tabelas: `clientes`, `diagnosticos` (1:1 FK), `offer_books` (1:1 FK, JSONB para icp/psicografia/oferta/concorrentes), `crm_leads` (FK opcional para `clientes`), `prospects` (com `endereco` + `google_place_id` único), `meetings` (3 FKs opcionais para prospect/lead/cliente + colunas reservadas Cal.com/Google Calendar/Google Meet/Fathom)
- RLS habilitado, policies `anon all` em todas as 6 tabelas — intencional enquanto não há auth UI. Apertar quando entrar auth. **Supabase advisor flagou: documentar como dívida de segurança formal.**
- Função `set_updated_at` tem `search_path` mutável → advisor warning. Plano: migration `007_set_updated_at_secure` (`set search_path = ''`).
- Migrations aplicadas (em ordem cronológica):
  1. `001_init_offer_book_schema` — 3 tabelas + trigger `set_updated_at` + RLS
  2. `002_diagnostico_add_leads_mes` — coluna leads/mês
  3. `003_crm_leads` — Kanban com CHECK constraint de stage + score 0..100
  4. `004_prospects` — captura fria + 6 status + `google_place_id`
  5. `005_meetings` — calendário comercial + FKs triplas opcionais
  6. `004_prospects_add_endereco` — **nome fora de sequência (deveria ser 006)**; adiciona `endereco TEXT NOT NULL DEFAULT ''` para Apify scraping

## Regras

1. **Não duplicar componentes.** Antes de criar um novo form, ScoreCard, badge ou sidebar — leia o catálogo abaixo. Se 80% do comportamento existe, estenda; não fork.
2. **Não quebrar layout existente.** Pages do Offer Book usam o mesmo `FormShell` + Tailwind grid. Sidebar mantém ordem. Adicionar item à navegação é OK; reordenar/renomear sem motivo NÃO.
3. **Sempre reutilizar.** Padrão: `_lib/` para lógica, `_components/` para UI primitives, ambos prefixados com `_` (Next.js trata como private). Importar via `@/app/offer-book/_lib/...` (alias `@/*` em `tsconfig.json`).
4. **Migrations antes de schema.** Toda mudança de DDL passa por `mcp__b3bed439…__apply_migration` com nome `NNN_descricao_snake`. Nunca `execute_sql` para DDL. Nunca alterar coluna existente sem migration nomeada.
5. **Sempre Supabase.** `localStorage` só para preferência de UI (ex.: `currentClienteId`). Dados de cliente/lead/score vivem em Supabase. Reuse `getSupabase()` (`app/offer-book/_lib/supabase.ts`) — não crie outro `createClient` em lugar nenhum.
6. **Plan Mode antes de tarefas grandes.** Critério mínimo: novo módulo, nova migration, ≥ 3 arquivos novos, ou refactor cross-module. Use `EnterPlanMode`, escreva ao plan file, saia com `ExitPlanMode` para aprovação.
7. **Subagents em tarefas complexas.** `Explore` para localizar código; `Plan` para validar implementação; `general-purpose` para multi-step com escrita. Prompt do agent sempre auto-contido (paths, contexto, escopo, formato de resposta).
8. **Convenções implícitas.** TypeScript strict on. Tailwind + shadcn/ui — sem CSS modules, sem styled-components. Copy de UI em **pt-BR**. Sem emojis em código salvo pedido explícito. Imports relativos curtos; cross-module via `@/app/...`.
9. **Magic MCP primeiro.** Antes de criar qualquer componente de UI novo, consultar `mcp__magic__21st_magic_component_builder`. Se não cobrir, buscar padrões em 21st.dev. Partir do zero só como último recurso.
10. **Framer Motion para todo motion.** Qualquer animação, transição, entrada/saída de elemento usa `framer-motion`. Não usar CSS `transition`/`animation` para comportamentos interativos.
11. **Funnel glue obrigatório.** Toda página com estado terminal (Status="Reunião", Stage="Fechado", reunião="Realizada") **DEVE** ter botão CTA pra próxima etapa do funil. Não deixar usuário em dead end. Tabela de glue canônica:

    | Origem | Botão | Destino | SQL |
    |---|---|---|---|
    | Prospect status=Reunião | "Agendar Reunião" | `/agenda?prospectId=X` | UPDATE prospect.status |
    | Prospect (qualquer status) | "Promover para CRM" | `/crm` | INSERT crm_leads + UPDATE prospect |
    | CRM Lead stage=Fechado | "Converter para Cliente" | `/offer-book/clientes` | INSERT clientes + UPDATE crm_leads.cliente_id |
    | Meeting status=Realizada | "Registrar follow-up" | depende do vínculo | UPDATE prospect/lead |
    | Offer Book ROI | "Gerar PDF + log no CRM" | `/print` (new tab) + INSERT log | window.open + INSERT |
    | Cliente sem Offer Book completo | barra de % + "Continuar" | `/offer-book/{próxima rota vazia}` | nenhum |

12. **Nunca fork mappers.** Se 2 routes precisam parsear o mesmo dado (ex: `parseAddress` em `/api/places` e `/api/apify-search`), extrair para `app/_lib/parse.ts` na 2ª duplicação — não esperar a 4ª.

13. **Encoding em arquivos novos.** Bash heredocs no Windows às vezes geram UTF-8 com BOM ou substituem `─` por `â”€`. **Sempre validar visualmente** o início do arquivo após criar via Bash. Preferir `Write` tool quando o conteúdo tem caracteres especiais.

## UI/Component Workflow

**Sequência obrigatória antes de criar qualquer UI nova:**

```
Plan → Magic MCP → Build → Review → Update CLAUDE.md
```

| Etapa | O que fazer |
|---|---|
| **Plan** | Defina layout, interações e dados antes de abrir qualquer arquivo |
| **Magic MCP** | `mcp__magic__21st_magic_component_builder` — consultar primeiro, sempre |
| **Build** | Tailwind + shadcn + Framer Motion; Dark Glassmorphism; Bento Grid |
| **Review** | Validar em 375px (mobile first) e dark theme antes de declarar pronto |
| **Update CLAUDE.md** | Registrar anti-padrões, decisões ou aprendizados desta tarefa |

### Sempre
- **Magic MCP** antes de qualquer componente novo
- **21st.dev patterns** antes de partir do zero
- **Framer Motion** para toda animação — sem CSS `transition` para interações
- **shadcn/ui** como base, Tailwind + design tokens para customização
- **Mobile First** — 375px é breakpoint primário
- **Dark Glassmorphism** — `rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur`
- **Bento Grid** — `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`

### Nunca
- Criar componentes sem consultar Magic MCP primeiro
- Gerar landing pages genéricas com hero vago e copy SaaS placeholder
- Usar copy como “Transforme seu negócio”, “Solução completa”, “Plataforma inovadora”
- CSS `transition`/`animation` para qualquer motion que pode ser Framer Motion

## Design System

### Tokens (`app/globals.css`)

| Token | Hex | Uso |
|---|---|---|
| `brand-orange` | `#FF5722` | Logo O6, accents quentes, alertas conversão |
| `brand-cyan` | `#00E5FF` | Primary CTAs, links ativos, ícones de seção |
| `brand-graphite` | `#121212` | Texto em tema light (landing) |
| `brand-offwhite` | `#F8F9FA` | Background landing |

**Superfícies dark (todo o OS):** `bg-zinc-950` (canvas) · `bg-zinc-900/40` (cards com glass) · `border-white/10` (separadores) · `bg-white/[0.04]` (hover state). Para badges tier-colored: `emerald-400` (saudável, ≥70), `amber-300` (atenção, 40-69), `red-400/500` (crítico, <40) — sempre com alpha `/15`-`/30` no bg e `/30`-`/40` no border.

### Tipografia

- Family: **Geist Sans** (`var(--font-geist-sans)`), declarada em `app/layout.tsx`
- Titles: `font-black uppercase tracking-tight` (weight 900, kern -0.05em). Para titles grandes use `text-3xl` ou `text-5xl`.
- Body: default 400 zinc-100/300/400 conforme hierarquia
- Labels micro: `text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500`
- Mono: Geist Mono raramente — só para valores tabulares específicos. Para números prefira `tabular-nums`.

### 6 pilares

- **Dark** — tema escuro forçado em todo o OS. Landing legada (`app/page.tsx`, `components/o6/*`) é light e fica isolada.
- **SaaS Premium** — densidade alta, sem decoração gratuita. Anéis SVG (`ScoreCard`), pills tier-colored, micro-labels em uppercase 0.18em tracking.
- **Bento Grid** — `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4` é o padrão. Cards grandes ocupam `col-span-2`.
- **Glassmorphism** — `rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur` é a fórmula. Não inventar outras.
- **Mobile First** — sidebar `hidden md:flex` (768px+); breakpoints relevantes 768/1024/1280. Sempre testar em 375 antes de assumir desktop.
- **Conversão** — CTA primário: `border border-brand-cyan/40 bg-brand-cyan/15 text-brand-cyan font-bold uppercase tracking-wider hover:bg-brand-cyan/25`. Secundário: `border-white/10 bg-white/[0.04]`. Destrutivo: `border-red-500/30 bg-red-500/10 text-red-300`.

## Catálogo de primitives reutilizáveis

### UI components

| Componente | Path | Quando usar |
|---|---|---|
| `FormShell` | `app/offer-book/_components/FormShell.tsx` | Wrapper de página-formulário com title/icon/grid 2-col |
| `Field` | `app/offer-book/_components/FormShell.tsx` | Input/textarea com label uppercase + foco cyan. Aceita `textarea`, `full`, `type`, `rows` |
| `ScoreCard` | `app/offer-book/_components/ScoreCard.tsx` | Card com anel SVG + tier (low/mid/high) — para qualquer score 0-100 |
| `Sidebar` | `app/offer-book/_components/Sidebar.tsx` | Sidebar persistente do Offer Book com pílula de cliente atual + botão "Gerar Offer Book" |

### State & Supabase

| Símbolo | Path | Função |
|---|---|---|
| `OfferBookProvider` · `useOfferBook` | `app/offer-book/_lib/store.tsx` | Context multi-cliente: state, hydration, autosave debounced 600ms por slice, `createCliente`/`selectCliente`/`deleteCliente`/`listClientes` |
| `getSupabase()` | `app/offer-book/_lib/supabase.ts` | Singleton lazy client. **Reuse em CRM, futuro Audit, futuro SEO** — não chame `createClient` em outro lugar |
| `clienteToRow` · `rowToCliente` · `diagnosticoToRow` · `rowToDiagnostico` · `rowToOfferBookSlices` | `app/offer-book/_lib/store.tsx` | Mappers camelCase ↔ snake_case. Padrão a seguir em qualquer nova tabela. |

### Domínio / cálculo

| Símbolo | Path | Função |
|---|---|---|
| `computeScores(state)` · `scoreTier(value)` | `app/offer-book/_lib/scores.ts` | 4 scores determinísticos 0-100; tier `low`/`mid`/`high` |
| `velocidadeScore` · `ofertaScore` · `aquisicaoScore` · `conversaoScore` | mesma | Granulares se precisar pontuar isolado |
| `STAGES` · `Stage` · `Lead` · `LeadInput` | `app/crm/_lib/types.ts` | 7 etapas canônicas do pipeline + tipo do lead |
| CRM CRUD (`listLeads`, `createLead`, `updateLead`, `deleteLead`, `moveLead`) | `app/crm/_lib/api.ts` | Toda persistência do Kanban. `moveLead` recalcula `sort_order`. |

### Candidatos a extração (regra atualizada: **2ª duplicação se cross-module**, 4ª se intra-module)

- **`formatDate`** — **3 cópias confirmadas** (`clientes-dashboard:18`, `crm:60`, `oportunidades:170`) — atingiu threshold cross-module. Extrair para `app/_lib/format.ts`.
- `BRL` formatter (`Intl.NumberFormat pt-BR currency`) — em `/print`, `/roi`, `/crm` (3 cópias).
- `parseNumber` / `parsePercent` / `targetConversion` — em `roi/page.tsx` e `print/page.tsx` (2 cópias).
- `parseAddress` / `parseAddressFallback` — **forks divergentes** entre `/api/places` e `/api/apify-search`. Já é dívida — consolidar em `app/_lib/address.ts`.
- `actionByScore` (mensagens por score) — em `plano-acao/page.tsx` e `print/page.tsx` (já maduro para `_lib/recommendations.ts`).

## Lições aprendidas (append-only)

### 2026-06-10 · Sprint 9 — Squads AIOX + copywriters + vídeo + refactor
- **Contexto**: Sessão grande — instalou 5 squads externos (`copy` 24 agents, `deep-research` 5, `offer-book` 1, `design-extractor` 1, `data-analysis` 1) em `squads/`, criou `squads/INDEX.json` como registry. Disco C: estava com 0.1GB livre — limpou npm-cache + .next + Temp pra liberar 4.6GB e baixar Chromium do puppeteer.
- **Decisão arquitetural — squads como diretório irmão de skills**: `squads/` é um diretório novo para agents externos importados (formato AIOX), enquanto `skills/` mantém playbooks O6-nativos. Registry centralizado em `squads/INDEX.json`. Squads são **referência humana** + fonte para destilação em código.
- **Padrão estabelecido — voice library**: agents `.md` em `squads/copy/agents/` têm 1k+ linhas cada. Em runtime serverless é caro ler. Padrão: destilar voice DNA em `app/_lib/copywriters.ts` como mapa tipado (`Record<CopywriterId, VoiceCard>`). Atualmente: dan-kennedy, eugene-schwartz, gary-halbert, jon-benson.
- **Pipeline opener agora aceita `copywriter?: string`**: `/api/prospects/pipeline` ganhou param opt-in que injeta `VOZ DE REFERÊNCIA: ...` antes das INSTRUÇÕES OBRIGATÓRIAS. Sem param = tom genérico (default).
- **Refactor demo route → -266 linhas**: `app/api/prospects/demo/route.ts` tinha cópia local de `debugFetch + getTeamScope + deployToVercel + toSlug`. Migrado para importar de `app/_lib/vercel-deploy.ts` (já compartilhado com video route). De 791 para 525 linhas.
- **Squad `offer-book` ZERO conflito com módulo**: audit confirmou que squad usa Value Equation (Hormozi) enquanto `app/offer-book/*` usa 4 scores próprios. Complementares — sugestão futura: `/api/offer-book/value-equation` que lê `offer_books.oferta` e roda offer-architect.
- **HTMLs DSPC em `skills/dspc/`**: 5 playbooks (Mapa DSPC, Abridor de Conversa, Banco de Dores Caras, Checklist Demo Comprável, Card Copiloto). Apenas docs por enquanto — extração do Banco de Dores pro prompt do opener fica pra próxima.
- **Sprint anterior (2026-06-09)** — vídeo, Telegram, LPs `/saude` `/advocacia`, governança: documentado em commits `c04c300`, `a4790d5`, `faa9727`, `ade1c5b`.
- **Migration 010_prospects_video aplicada**: colunas `video_url`, `video_generated_at`, `video_provider` em prospects.



### 2026-06-05 · Sprint 6 — CRM Commercial Automation
- **Contexto**: CRM tinha Kanban funcional mas sem mecanismo de follow-up, sem histórico de progresso e sem dashboard de conversão.
- **Padrão de templates com fallback hardcoded**: `DEFAULT_TEMPLATES` em `page.tsx` garante que templates funcionam no estado zero sem dados em DB. `crm_message_templates` overrides o default quando o usuário customiza. Zero config inicial.
- **Commercial Dashboard**: toggle no header, não rota separada. Kanban e dashboard compartilham o mesmo state de leads. Sem fetch extra.
- **Stage History log automático**: `createLead`, `updateLead` e `moveLead` inserem em `crm_stage_history` sem o caller precisar lembrar. Transparente.
- **Anti-padrão evitado**: TypeScript strict + Next.js 16 não aceitam `drawer.mode === "closed"` dentro de `else` de `if (drawerMode === "closed")` — o tipo já foi narrowed. Simplificar o `useEffect` para tratar só o close case; o `key={drawerKey}` no parent já força remount nos outros casos.
- **Fix `@ts-expect-error`**: SDK Anthropic aceita `cache_control` nativamente; o directive ficou stale e quebrava build com TypeScript strict. Sempre verificar se `@ts-expect-error` ainda é necessário após atualização de SDK.

### 2026-06-05 · Sprint 5 — Strategic Engine (6 Scores + Horizontes AI)
- **Contexto**: 4 scores eram suficientes para diagnóstico mas não capturavam potencial de crescimento e eficiência comercial.
- **Decisão**: 2 novos scores (`potencial`, `eficiencia`) + seção `strategic` na AI com 3 horizontes (0-30d, 30-90d, 90-180d). Mesma chamada Claude, campos extras no JSON.
- **Regra de prompt crítica**: "Use SEMPRE os dados reais declarados" — sem essa instrução, Claude gerava copy genérico de SaaS. O prompt deve citar `{clienteNome}`, `{conversao}%`, `{leadsMes}` leads/mês explicitamente.
- **Backward-compat**: `validateAiOutputLenient()` preenche `strategic: {}` em outputs cacheados antigos que não têm a seção. Nunca forçar regeneração por schema drift.
- **Anti-padrão**: Adicionar score novo sem adicionar entrada em `actionByScore` → `undefined` lookup → runtime error silencioso. Sempre adicionar nos dois lugares simultaneamente (`plano-acao/page.tsx` E `print/page.tsx`).

### 2026-06-05 · Sprint 4 — AI Audit Engine unificado
- **Contexto**: Resumo, plano-acao e roadmap tinham templates hardcoded sem dados do cliente. Roadmap era 100% estático igual para todos.
- **Decisão**: Rota unificada `POST /api/offer-book/generate` (claude-opus-4-8, adaptive thinking) gera as 3 seções em uma chamada ~$0.03. Persiste em `offer_books.ai_output` JSONB (migration 007).
- **Padrão estabelecido**: Cache-by-default (`force=false` serve DB), `force=true` regenera. Fallback determinístico intacto se `ai_output = null` — sistema funciona sem API key.
- **Anti-padrão evitado**: 3 routes separadas = 3× custo + 3× latência. Uma call, três seções.
- **Fix colateral**: `useSearchParams` em `agenda/page.tsx` sem `<Suspense>` quebrava `next build` no Next.js 16. Corrigido.

### 2026-06-04 · Apify > Serper para Brasil
- **Contexto**: Sprint 2 implementou Serper.dev Maps (`/api/places`). Sprint 3 migrou para Apify (`/api/apify-search`).
- **Por quê**: Serper retornava lixo regional, sem `city`/`state` estruturados, sem `endereco` completo. Apify Actor `compass/crawler-google-places` retorna campos prontos.
- **Decisão**: Apify primary, Serper mantido como legacy para histórico.

### 2026-06-04 · Module isolation excessiva = funnel quebrado
- **Contexto**: Cada módulo (Oportunidades, CRM, Agenda, Offer Book) é tecnicamente isolado — bom para manutenibilidade.
- **Problema**: Operador faz copy-paste manual entre módulos porque NENHUMA fronteira tem botão de promoção. Funnel rate de conversão real próximo de 0% sem operador heroico.
- **Decisão**: Adicionada regra #11 (Funnel glue obrigatório). Toda página com estado terminal precisa de CTA pra próxima etapa.

### 2026-06-04 · Buffer SQL trigger search_path
- **Contexto**: Função `set_updated_at` foi criada sem `set search_path = ''`. Supabase advisor flagou todas as tabelas que a usam.
- **Decisão**: Não é crítico em prod sem usuários atacantes (RLS anon all já assume confiança), mas vai numa migration `007_set_updated_at_secure` quando entrar auth ou antes do go-live formal.

### 2026-06-04 · Dedup tri-chave em batch insert
- **Contexto**: Importar 100 prospects do Apify, alguns já existem no DB.
- **Padrão estabelecido**: dedup por `google_place_id` (primário) + `site` (>5 chars) + `telefone`. Tanto em-batch quanto contra o DB. Chunks de 50 por INSERT Supabase.
- **Reaproveitar** em qualquer batch import futuro (CSV upload, outro scraper).

### 2026-06-04 · Subagent strategy
- **Contexto**: Pedi 2 Explore subagents em paralelo (integration audit + funnel trace). Custo: ~2 min. Valor: descoberta de dead-ends que eu não tinha mapeado em 1 hora de auditoria solo.
- **Padrão**: para auditoria/recon, sempre subagent Explore. Para implementação de modulo conhecido, eu mesmo executo.

### 2026-06-04 · Apify timing constraints
- **Contexto**: Apify `compass/crawler-google-places` leva ~1-2 min para 100 places. Vercel Pro+ timeout = 300s.
- **Decisão**: Limite no modal reduzido de 200 → 100. Múltiplas buscas se precisar de mais.

### 2026-06-03 · JSONB > tabelas normalizadas para edit-heavy data
- **Contexto**: ICP, Psicografia, Oferta, Concorrentes mudam de forma com frequência.
- **Decisão**: JSONB em `offer_books` para essas 4 seções. Migrations apenas para campos flat compartilhados entre clientes.
- **Trade-off**: queries não-indexadas — aceitável porque cardinalidade é baixa (1 row por cliente).

## Memória permanente (`memory/`)

Decisões técnicas vivem em `memory/*.md`, **uma por escopo**:

| Arquivo | Escopo |
|---|---|
| [`memory/o6.md`](memory/o6.md) | Cross-cutting OS (stack, design system, Supabase, não-objetivos) |
| [`memory/offer-book.md`](memory/offer-book.md) | Decisões do módulo `/offer-book/*` e `/print` |
| [`memory/audit-engine.md`](memory/audit-engine.md) | Website Audit Engine — charter + perguntas em aberto (planned) |
| [`memory/crm.md`](memory/crm.md) | CRM, schema `crm_leads`, DnD, KPIs |
| [`memory/oportunidades.md`](memory/oportunidades.md) | Prospecção fria, schema `prospects`, **Apify (Sprint 3) substituiu Serper (Sprint 2 legacy)**, dedup tri-chave |
| [`memory/agenda.md`](memory/agenda.md) | Agenda comercial, schema `meetings`, slots, integration prep |
| [`memory/xrun.md`](memory/xrun.md) | XRun — placeholder, escopo indefinido |

**Regra de atualização** (obrigatória, não opcional):

1. **Gatilho** — ao final de qualquer tarefa que se qualifica como "importante": novo módulo, nova migration, nova rota, refactor cross-module, mudança de schema, decisão de trade-off, ou qualquer coisa que cruzaria os critérios de Plan Mode.
2. **Escopo do update** — toque só o(s) arquivo(s) de memory cujo módulo foi afetado. Cross-cutting → `o6.md` também.
3. **Formato** — append no topo (newest first), header `## YYYY-MM-DD · título curto`, bullets categorizados (Contexto / Decisão / Trade-off / Paths tocados quando aplicável).
4. **Não reescrever histórico** — entradas antigas só são editadas se a decisão foi **revertida**; nesse caso, marcar com `~~strikethrough~~` e abrir nova entrada explicando a reversão.
5. **Antes de implementar algo grande, leia o memory file relevante.** Evita refazer decisão já tomada ou repetir erro já documentado.

## Skills reutilizáveis (`skills/`)

Playbooks por módulo. Ler **antes** de iniciar uma tarefa que se encaixe no escopo da skill — ela documenta a sequência canônica, primitives obrigatórios e anti-padrões.

| Skill | Arquivo | Quando usar |
|---|---|---|
| `/o6-offerbook` | [`skills/o6-offerbook.md`](skills/o6-offerbook.md) | Construir um Offer Book completo (10 passos: Cliente → ICP → Psicografia → Concorrentes → Oferta → Diagnóstico → Plano de Ação → Roadmap → ROI → PDF) |
| `/o6-audit` | [`skills/o6-audit.md`](skills/o6-audit.md) | Auditar empresa-alvo (URL externa) em 7 eixos (SEO/UX/Conversão/Trust/Velocidade/Oferta/Lead Capture) e gerar pacote de prospecção: score, potencial comercial, impacto $, plano de ação, cold email/WhatsApp/LinkedIn |
| `/o6-landing` | [`skills/o6-landing.md`](skills/o6-landing.md) | Construir landing page de alta conversão em 7 seções (Hero → Proof → Oferta → ROI → Cases → FAQ → CTA) com Dark Glassmorphism + Bento Grid + Framer Motion |
| `agents` | [`skills/agents.md`](skills/agents.md) | Construir um agente novo (route Claude + Supabase + opcional Vercel). Padrão I/O, prompt rules, persist fail-soft, pricing/niche definitions |
| `video` | [`skills/video.md`](skills/video.md) | Gerar vídeo de demo do prospect (Higgsfield planejado, fallback CSS animado em Vercel) — **placeholder** até API disponível |

Para registrar como slash command nativo no Claude Code, copie/symlink para `.claude/commands/o6-offerbook.md`. Hoje o arquivo é apenas referência discoverável via CLAUDE.md.

## Design System Reference

[`design.md`](design.md) — tokens visuais (Modern Noir / Dark Minimalist) importados do xrun-projeto. Complementa os tokens em `app/globals.css`.

## AIOX Agent Squad (importado do xrun-projeto)

12 agentes especializados disponíveis em 3 formatos (`.github/agents/`, `.claude/skills/AIOX/`, `.codex/`):

| Agente | Papel |
|---|---|
| `aiox-master` | Orquestrador do squad — delega e coordena |
| `analyst` | Análise de dados e métricas |
| `architect` | Arquitetura de sistema |
| `data-engineer` | Pipelines e modelagem de dados |
| `dev` | Desenvolvimento e implementação |
| `devops` | Infra, CI/CD, deploy |
| `pm` | Gestão de projeto |
| `po` | Product ownership e backlog |
| `qa` | Qualidade e testes |
| `sm` | Scrum master e facilitação |
| `squad-creator` | Bootstrap de squads novos |
| `ux-design-expert` | UX/UI design |

**Skills extras** em `.claude/skills/`: `architect-first`, `checklist-runner`, `coderabbit-review`, `mcp-builder`, `skill-creator`, `synapse`, `tech-search`.

## Agent Swarm Architecture

O6 está estruturado como uma **cadeia composta de agentes Claude** que se alimentam via tabelas Supabase. Cada agente é uma rota `app/api/<scope>/<name>/route.ts`; o padrão canônico está em [`skills/agents.md`](skills/agents.md).

### Catálogo de agentes (planejados + em produção)

| Agente | Status | Input | Output | Persistência |
|---|---|---|---|---|
| **audit** | ✅ Produção | `prospectId` + `auditUrl` | 7 scores + recomendações | `audits` table + `prospects.audit_score`/`audit_json` |
| **opener** | ✅ Produção | `prospectId` (lê audit) | Mensagem WhatsApp 3-4 linhas | `prospects.abertura_whatsapp` + `abordagem_gerada_em` |
| **demo** | ✅ Produção | `prospectId` (lê audit + categoria) | HTML landing page deployada na Vercel | `prospects.demo_url` + `demo_generated_at` |
| **sintese** | ✅ Produção | `clienteId` + state Offer Book completo | 4 campos estratégicos (posicionamento, diagnóstico crítico, oferta irresistível, mensagem principal) | `offer_book_sintese` table (cache 7d) |
| **generate** (engine) | ✅ Produção | `clienteId` + state | Síntese + plano de ação (3 prioridades) + roadmap (3 fases) + insights ocultos (7 categorias) + strategic engine (3 horizontes) | `offer_books.ai_output` JSONB |
| **video** | 📋 Planejado | `prospectId` (lê demo URL + audit) | Vídeo 15s ou página animada antes/depois | `prospects.video_url` (a criar) |
| **outreach-wpp** | 📋 Planejado | `prospectId` + número WhatsApp aprovado | Disparo da mensagem + log | `prospects.outreach_sent_at` (a criar) |
| **outreach-email** | 📋 Planejado | `clienteId` + lista de contatos | Email via Resend + tracking | nova tabela `outreach_log` |
| **proposta** | 📋 Planejado | `clienteId` (lê Offer Book + scores) | Proposta PDF/email com pricing por nicho | nova tabela `propostas` |
| **onboarding** | 📋 Planejado | `clienteId` (após "Fechado" no CRM) | Checklist + agendamento kickoff + setup pixels | atualiza `crm_leads` + cria `meetings` |

### Padrão de orquestração

```
Apify Search          (rota /api/apify-search)
        │ insere em
        ▼
   prospects ─────────────────────────────────┐
        │                                       │
        ▼                                       ▼
   [audit]                              [outreach-email] (planejado)
        │ grava em audits + prospects           │
        ▼                                       ▼
   [opener] ───┐                          (lê audit)
        │      │
        ▼      ▼
   prospects  [demo]
   .abertura  │ grava demo_url
              ▼
              [video] (planejado)
              │ grava video_url
              ▼
   ───── PROSPECT pronto para outreach ─────
                                    │
                                    ▼ (humano dispara via UI ProspectDrawer)
                                  WhatsApp
                                    │
                                    ▼ (responde + agenda)
                                CRM Lead ─────► [diagnostico] (Offer Book)
                                                  │
                                                  ▼
                                              [generate] / [sintese]
                                                  │
                                                  ▼ (cliente fecha)
                                              [proposta] (planejado)
                                                  │
                                                  ▼
                                              [onboarding] (planejado)
```

### Como agentes se comunicam (regra)

1. **Via Supabase, nunca via fila/queue/Redis.** Cada agente lê o estado dele de uma tabela e escreve o próximo estado em coluna pré-acordada. Outro agente faz polling/trigger quando precisa.
2. **Nada de webhooks Vercel→Vercel** entre rotas O6. Internamente, uma rota pode chamar outra via `fetch(`${req.nextUrl.origin}/api/...)` quando precisar (ex.: pipeline → audit), mas o caso normal é o caller original orquestrar.
3. **Estado é a tabela**. Não há "agente A guarda contexto pra agente B" — agente B sempre relê de `prospects` ou tabela cache.
4. **Idempotência**. Toda rota agente deve aceitar `force?: boolean` e cachear por 7 dias. Re-rodar sem `force` retorna cached. Re-rodar com `force=true` regera.
5. **Trigger humano por enquanto**. Até o cron/watcher de Sprint 8 sair, agentes são disparados por clique no UI (ProspectDrawer "Gerar Abordagem", "Gerar Demo", etc.) ou por uma orquestradora `pipeline` que chama vários em série. Nenhum agente roda sozinho.
6. **Custo controlado**. Toda chamada Claude paga é cacheada. Toda regeneração explícita pelo usuário é log'd com timestamp pra audit financeiro futuro.

### Sprint 8 (pendente) — orquestração assíncrona

Quando habilitarmos:
- **`cron` no Vercel** ou **Supabase Edge Functions scheduled** disparam agentes que dependem de tempo (re-audit mensal, video após 24h do demo, etc.)
- **`agent_runs` table** com `agent_name`, `entity_id`, `status`, `started_at`, `finished_at`, `error`, `output_ref` — log único de todas execuções
- **Idempotency key** em todo POST agente: `<agent>:<entity>:<YYYYMMDD>` para evitar duplicar execução por race

Até lá, todos os disparos são síncronos vindo do humano operador.

## Working agreements

- **Bias para ação.** Auto Mode é o default. Faça a escolha razoável e siga; o usuário redireciona se necessário. Pause só quando estiver genuinamente bloqueado (input que só ele tem) ou quando o pedido cruzar os critérios de Plan Mode acima.
- **TaskCreate** quando o trabalho cruza ≥ 3 passos distintos. Atualize status conforme avança — não deixe `in_progress` órfão.
- **AskUserQuestion** apenas para decisão que só o usuário pode tomar (target Supabase, conteúdo de copy, schema com trade-off). Nunca para "posso prosseguir?".
- **Verificação ao final.** Mudança de UI → screenshot via `mcp__Claude_Preview__preview_screenshot`. Mudança de schema/data → `mcp__b3bed439…__execute_sql` mostrando a linha esperada.
- **Sem code review automático** salvo pedido. Commits feitos apenas quando pedidos explicitamente.
- **MCP discipline.** Antes de Supabase MCP, sempre `list_projects` / `list_tables` se houver dúvida. Migrations idempotentes quando viável (`if not exists`).
- **Update CLAUDE.md após toda tarefa.** Se a tarefa revelou um anti-padrão, uma decisão de trade-off, um gap de integração ou um padrão reaproveitável — registrar aqui (seção Lições aprendidas) e no memory file correspondente antes de considerar a tarefa concluída.

## Comandos rápidos

```bash
npm run dev      # Next 16 + Turbopack na :3000
npm run build    # Production build
npm run lint     # ESLint 9
```

**URLs locais:**
- `/` — landing legada (light theme, isolada do OS)
- `/clientes-dashboard` — lista global de clientes (CRUD)
- `/offer-book` — hub do Offer Book
- `/offer-book/{clientes,icp,psicografia,concorrentes,oferta,diagnostico,dashboard,resumo,plano-acao,roadmap,roi}`
- `/crm` — Kanban comercial
- `/print` — exportação PDF (auto-dispara `window.print()`)

## Gaps de integração que bloqueiam receita

Auditoria de 2026-06-05. Rankeados por impacto em receita × velocidade de implementação.

### Quebras no fluxo Prospect → Cliente Pagando

O sistema tem 5 silos isolados (Oportunidades · CRM · Agenda · Offer Book · Print). Nenhum faz handoff automático para o próximo. Resultado: operador faz copy-paste manual entre módulos.

| # | Gap | Impacto | Esforço | Dependências |
|---|---|---|---|---|
| G1 | **Prospect → Lead** não tem botão "Promover para CRM" | Alto — leads se perdem entre módulos | 1 dia | nenhuma |
| G2 | **Reunião Realizada → Lead avança no CRM** não é automático | Alto — funil desalinhado com realidade | 1 dia | nenhuma |
| G3 | **Lead Fechado → Cliente criado no Offer Book** não é automático | Alto — entrega nunca começa sem intervenção | 1 dia | nenhuma |
| G4 | **Score CRM (manual)** ≠ **Score Offer Book (automático)** | Médio — priorização de vendas distorcida | 0.5 dia | G3 (precisa de cliente vinculado) |
| G5 | **Cal.com / Google Calendar** não integrado | Médio — agendamento sai do sistema, link manual | 3 dias | conta Cal.com + OAuth |
| G6 | **Notificação WhatsApp/Email** pós-agendamento não existe | Médio — no-show aumenta sem confirmação | 2 dias | Twilio ou Resend |
| G7 | **Pós-venda inexistente** (contrato, cobrança, entrega) | Alto em escala — receita "teórica" ≠ "realizada" | 3 dias | schema novo |
| G8 | **Webhook / n8n** para automação de fluxo não existe | Baixo imediato, alto em escala | 2 dias | G1-G3 primeiro |

### Integrações externas: wired vs. stubbed vs. missing

| Serviço | Status | Arquivo | Próximo passo |
|---|---|---|---|
| **Supabase** | ✅ Wired | `_lib/supabase.ts` | — |
| **Apify** | ✅ Wired | `api/apify-search/route.ts` | — |
| **Serper.dev** | ⚠️ Legacy | `api/places/route.ts` | Remover quando estável |
| **Cal.com** | 🔲 Stubbed | `agenda/_lib/api.ts` TODOs L73-76 | OAuth + webhook endpoint |
| **Google Calendar** | 🔲 Stubbed | `agenda/_lib/api.ts` TODOs L93-95 | OAuth + service account |
| **Google Meet** | 🔲 Stubbed | coluna `meet_link` em `meetings` | Depende Google Calendar |
| **Fathom** | 🔲 Stubbed | colunas `fathom_*` em `meetings` | Webhook pós-reunião |
| **Email (Resend/SendGrid)** | ❌ Missing | — | Instalar SDK + API key |
| **WhatsApp (Twilio/Zapi)** | ❌ Missing | — | API key + template aprovado |
| **n8n / Zapier** | ❌ Missing | — | Webhook endpoint + conta |
| **Stripe / MercadoPago** | ❌ Missing | — | Novo módulo Faturamento |
| **Analytics (PostHog)** | ❌ Missing | — | SDK client-side |

## Roadmap — Próximos 14 dias

### Semana 1 (Dias 1–7) — Conectar os silos internos (zero dependências externas)

**Dia 1–2 · G1: Botão "Promover para CRM" em Oportunidades**
- `ProspectDrawer` ganha botão "Converter em Lead"
- Pre-preenche Lead com dados do Prospect (empresa, nome, telefone, cidade, nicho)
- UPDATE `prospects.status = 'Reunião'` + INSERT `crm_leads`
- Navega para `/crm` após criação
- Migration: adicionar coluna `promoted_to_lead_id UUID` em `prospects`

**Dia 2–3 · G2: Reunião Realizada → CRM avança automaticamente**
- Em `MeetingDrawer`, ao salvar `status = 'Realizada'`:
  - Se `crmLeadId` vinculado E lead em stage `'Diagnóstico Agendado'` → move para `'Diagnóstico Entregue'`
  - Toast de confirmação: "Lead avançado para Diagnóstico Entregue"
- Se `status = 'No-show'`: adicionar badge visual no card do CRM

**Dia 3–4 · G3: Lead Fechado → Auto-criar Cliente no Offer Book**
- Ao mover lead para stage `'Fechado'`: modal de confirmação "Converter em Cliente?"
- Cria `clientes` row com dados do lead (empresa, nicho, cidade)
- UPDATE `crm_leads.cliente_id` com o novo ID
- Redireciona para `/offer-book/clientes?clienteId=X`

**Dia 4–5 · G4: Score sync CRM ↔ Offer Book**
- Se lead tem `cliente_id`, buscar `computeScores()` do cliente vinculado
- Exibir no card do kanban: score automático sobrepõe o manual
- Sem remover campo manual — mostrar ambos se divergem >15 pts

**Dia 5–7 · G7 (MVP): Campos pós-venda no Lead**
- Migration: `data_contrato`, `data_cobranca`, `status_pagamento` (enum: `pendente/cobrado/pago/cancelado`) em `crm_leads`
- Quando stage = `'Fechado'`: sidebar direita mostra esses campos
- KPI novo: "Receita Realizada" (soma de `valor` onde `status_pagamento = 'pago'`)

### Semana 2 (Dias 8–14) — Integrações externas de alto impacto

**Dia 8–10 · G5: Cal.com integration**
- Estrutura já reservada: `cal_event_id` em `meetings`
- TODOs marcados em `app/agenda/_lib/api.ts` L73-76
- Flow: `createMeeting` → POST Cal.com API → persistir `cal_event_id`
- `deleteMeeting` → DELETE Cal.com event via ID
- ENV: `CAL_API_KEY`, `CAL_EVENT_TYPE_ID`

**Dia 10–12 · G6: Notificações por email (Resend)**
- Instalar `resend` SDK
- Trigger: `createMeeting` → email de confirmação para `contatoEmail`
- Template: data, hora, link Google Meet (se disponível), nome do responsável
- ENV: `RESEND_API_KEY`, `FROM_EMAIL`
- Não bloquear o flow — fire-and-forget com try/catch

**Dia 12–14 · G6 (extension): WhatsApp reminder 24h antes**
- Cron job (Vercel Cron ou n8n) — busca meetings com `starts_at` em 24-28h com status `Agendada`/`Confirmada`
- POST para Zapi ou Twilio com `contatoWhatsapp` + mensagem template
- Se falhar: log em nova coluna `reminder_sent_at`, não retentar mais de 1x
- ENV: `WHATSAPP_API_KEY`, `WHATSAPP_INSTANCE_ID`

### Critério de sucesso (DoD para cada item)
- G1: Prospect com status `Reunião` tem `promoted_to_lead_id` preenchido. Lead existe no CRM com dados corretos.
- G2: Reunião salva como `Realizada` → lead muda de stage automaticamente (verificar via Supabase `execute_sql`).
- G3: Lead `Fechado` → `clientes` row existe → `crm_leads.cliente_id` preenchido.
- G4: Card de lead com `cliente_id` mostra score do Offer Book, não o manual.
- G5: Meeting criada → `cal_event_id` preenchido → evento visível no Cal.com.
- G6: Email enviado (verificar via Resend dashboard) em < 5s após `createMeeting`.

## Não-objetivos atuais

- **Sem auth UI.** RLS está `anon all` por escolha. Não adicione tela de login sem alinhar.
- **Sem IA na lógica de scoring.** Todos os 4 scores e a sugestão de Plano de Ação são determinísticos. Manter assim até ROI de IA estar mapeado.
- **Sem lib de PDF.** `/print` usa `window.print()`. Não instale `@react-pdf/renderer`, `jsPDF`, `puppeteer` etc. sem necessidade comprovada.
- **Sem state manager global** (Redux/Zustand/Jotai). Cada módulo gerencia próprio state local; cross-module é via Supabase.
- **Sem CSS-in-JS.** Tailwind utility classes + `globals.css` para tokens. Não introduzir styled-components, emotion, vanilla-extract.
