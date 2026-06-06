# Sprint Audit — Junho 2026

Data: 2026-06-05. Auditoria completa do codebase antes de Sprint 4/5/6. Read-only.

---

## 1. Features funcionando (confirmado)

| Módulo | Status | Observação |
|---|---|---|
| Offer Book — 12 páginas | ✅ | clientes, icp, psicografia, concorrentes, oferta, diagnostico, dashboard, resumo, plano-acao, roadmap, roi |
| AI Integration | ✅ | `/api/offer-book/generate` — claude-opus-4-8 — cache por DB — fallback determinístico |
| Supabase Persistence | ✅ | autosave 600ms debounce, multi-cliente, 3 rows (clientes + diagnosticos + offer_books) |
| CRM Kanban | ✅ | 7 etapas, drag-drop nativo HTML5, KPIs, drawer, "Converter para Cliente" |
| CRM → Offer Book glue | ✅ | `convertToCliente()` em `crm/_lib/api.ts` — cria cliente + diagnosticos + offer_books |
| Agenda Comercial | ✅ | Calendário semanal 5 dias, 12 slots fixos, MeetingDrawer, KPIs ocupação |
| Oportunidades | ✅ | Apify-powered capture, dedup tri-key, drawer create/edit/view |
| Clientes Dashboard | ✅ | Lista global com CRUD e navegação para Offer Book |
| Print / PDF | ✅ | `window.print()` + `@media print`, 9 seções |
| Audit API | ✅ | `/api/audit` — cheerio HTML parse + PSI opcional — persiste em `audits` table |

---

## 2. Features incompletas

| Feature | Estado | Gap |
|---|---|---|
| Sprint 6 CRM follow-up | ❌ Não iniciado | `proxima_acao`, `data_proxima_acao`, `responsavel`, `notas` não existem no schema |
| Sprint 6 CRM templates | ❌ Não iniciado | Sem sistema de templates WhatsApp/email por etapa |
| Sprint 6 Commercial Dashboard | ❌ Não iniciado | Sem conversão por etapa, sem weekly summary, sem receita por stage |
| Sprint 5 Strategic scores | ❌ Não iniciado | Só 4 scores (velocidade, oferta, aquisicao, conversao). Faltam: potencial de crescimento, eficiência |
| G1 Prospect → Lead glue | ❌ Não iniciado | ProspectDrawer não tem "Promover para CRM" |
| G2 Reunião → CRM advance | ❌ Não iniciado | MeetingDrawer salva "Realizada" mas não move lead no CRM |
| Audit Engine UI | ❌ Não iniciado | `/api/audit` existe mas `/audit` page não existe |
| Migrations repo | ⚠️ Parcial | Só `006_audits.sql` no repo. 001-005 e 007 aplicados no Supabase mas sem arquivo local |

---

## 3. Código duplicado / morto

| Símbolo | Locais | Ação |
|---|---|---|
| `formatDate()` | `crm/page.tsx:66`, `clientes-dashboard/page.tsx:~18`, `oportunidades/page.tsx:~170` | Extrair para `app/_lib/format.ts` (threshold atingido) |
| `BRL` Intl formatter | `crm/page.tsx:43`, `print/page.tsx`, `roi/page.tsx` | Mesmo destino |
| `generate` callback | `plano-acao/page.tsx:138` e `roadmap/page.tsx:150` | Idênticas — candidato a hook `useGenerateAI()` |
| `/api/places` (Serper) | `app/api/places/route.ts` | Legacy mantido intencionalmente, não é dead code real |
| `components/o6/*` | 4 arquivos (landing legada) | Orphans de landing legada — não tocar sem instrução |

---

## 4. Dívida técnica

| Item | Severidade | Detalhe |
|---|---|---|
| `thinking: { type: "adaptive" }` | **ALTA** | Parâmetro inválido na Anthropic API. Valor correto seria `{ type: "enabled", budget_tokens: N }`. O `as any` evita erro de compile mas a SDK pode ignorar ou rejeitar silenciosamente. |
| `output_config: { effort: "medium" }` | **ALTA** | Parâmetro não-existente na Anthropic API. Ignorado silenciosamente pela SDK. |
| `maxDuration` ausente | **ALTA** | `/api/offer-book/generate` não exporta `maxDuration`. Vercel Pro default = 60s. Opus 4.8 pode exceder. |
| `createClient` direto em `audit/route.ts` | **MÉDIA** | Viola regra "sempre `getSupabase()`". Linha 275 cria novo client em vez de reutilizar singleton. |
| Migrations sem arquivo local | **MÉDIA** | 001-005 e 007 aplicados no Supabase mas sem `.sql` no repo. Impossível reproducir schema do zero. |
| `set_updated_at` search_path | **BAIXA** | Advisor warning documentado. Migration `007_set_updated_at_secure` pendente. |
| RLS anon all | **BAIXA** | Intencional enquanto sem auth UI. Dívida formal documentada. |
| Scores só em português mas labels em keys inglesas | **BAIXA** | ScoreKey = "velocidade"\|"oferta"\|"aquisicao"\|"conversao" — consistente, não é problema real |

---

## 5. Riscos antes de prosseguir

1. **API chamada com params inválidos** — `thinking: { type: "adaptive" }` não é valor válido. A SDK Anthropic pode lançar erro 400 em certas versões. Deve ser fixado antes de usar em produção.

2. **Timeout em produção** — sem `maxDuration = 120`, a Vercel pode matar a route antes do Opus 4.8 terminar. Não afeta dev local.

3. **Migrations não versionadas no repo** — se o banco for resetado, não há como reproduzir. Mitigar: adicionar arquivos SQL das migrations conhecidas ao repo.

4. **G1-G4 gaps de funil** — o sistema funciona tecnicamente mas o operador faz copy-paste manual entre módulos. Sem glue, a taxa de conversão real = 0% sem intervenção manual.

5. **Audit Engine sem UI** — `/api/audit` funciona mas não há como acessá-lo pela interface. A feature está "shipada" só do lado servidor.
