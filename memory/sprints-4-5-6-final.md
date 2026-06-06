# Sprints 4, 5 e 6 — Relatório Final

**Data**: 2026-06-05  
**Build status**: ✅ `npm run build` passa sem erros TypeScript (26 rotas)

---

## Sprint 4 — AI Offer Book (Audit Engine Unificado)

### O que foi feito
- Rota unificada `POST /api/offer-book/generate` — uma chamada Claude gera `sintese + planoAcao + roadmap`.
- Migration `007_offer_books_ai_output`: 3 colunas em `offer_books` (`ai_output JSONB`, `ai_generated_at`, `ai_model`).
- `store.tsx` expandido: `aiOutput`, `aiGeneratedAt`, `setAiOutput()`, hydration do DB.
- `resumo/page.tsx` migrado de rota legada `/sintese` para `/generate`.
- `plano-acao/page.tsx` e `roadmap/page.tsx`: botão "Gerar com IA" / "Regenerar"; fallback determinístico intacto.

### Bugs corrigidos durante o sprint
| Bug | Impacto | Fix |
|---|---|---|
| `thinking: { type: "adaptive" }` (param inválido) | Chamada API falharia silenciosamente | Removido |
| `output_config: { effort: "medium" }` (inexistente) | Idem | Removido |
| `getSupabase()` retornava `null` em server | Todas as API routes falhavam em ler/gravar DB | Removido guard `typeof window` |
| `@ts-expect-error` em `cache_control` | SDK já aceita nativamente; TypeScript strict bloqueava build | Removido |
| `maxDuration` ausente | Vercel cortaria a request depois de 60s | `export const maxDuration = 120` |

---

## Sprint 5 — Strategic Engine (6 Scores + Horizontes AI)

### O que foi feito
- 2 novos scores: `potencialScore` (ticket + ICP + leads) e `eficienciaScore` (oferta + concorrentes + psicografia).
- `AiStrategic` type: 3 horizontes (0-30d, 30-90d, 90-180d) com objetivo + ações + responsável + impacto.
- `generate/route.ts`: prompt reescrito para usar dados reais do cliente; max_tokens 2048 → 4096; `validateAiOutputLenient()` para backward-compat.
- `resumo/page.tsx`: grid 4-col → 3/6-col; seção "Engine Estratégico" com 3 blocos de horizonte; cards "Potencial de Receita" e "Diferencial Genuíno".
- `plano-acao/page.tsx` e `print/page.tsx`: entradas `potencial`/`eficiencia` no `actionByScore`.

---

## Sprint 6 — Commercial Automation (CRM)

### O que foi feito
- Migration `008_crm_followup`: 5 colunas novas em `crm_leads` + tabelas `crm_stage_history` + `crm_message_templates`.
- Types expandidos: `StatusPagamento`, `StageHistoryEntry`, `MessageTemplate`, novos campos em `Lead`/`LeadInput`.
- API expandida: `listStageHistory`, `listMessageTemplates`, `upsertMessageTemplate`, `deleteMessageTemplate`; `createLead`/`updateLead`/`moveLead` agora logam em `crm_stage_history`.
- `crm/page.tsx` reescrito com:
  - **Overdue indicators**: pulsing red dot no card + contador de overdue por coluna.
  - **Drawer com 4 tabs** (Dados · Follow-up · Templates · Histórico) em modo edição.
  - **Templates**: 14 defaults hardcoded (7 stages × WhatsApp + Email) com variáveis `{nome}` / `{empresa}`; DB overrides via `crm_message_templates`; Copy-to-clipboard com feedback visual.
  - **Commercial Dashboard**: toggle Kanban ↔ Dashboard; 4 KPIs (Receita Realizada, Pipeline Potencial, Novos 7d, Follow-ups Vencidos); funil horizontal por stage; taxas de conversão por etapa tier-coloridas; receita potencial por etapa.
  - **Funnel glue G3**: Lead Fechado → "Converter para Cliente" CTA → `convertToCliente()` → redireciona para Offer Book.

---

## O que NÃO foi implementado (e porquê)

| Item | Motivo |
|---|---|
| G4: Score sync CRM ↔ Offer Book | Depende de G3 (cliente vinculado) que foi implementado. Infraestrutura pronta; lógica de display fica para Sprint 7. |
| G5: Cal.com OAuth | Requer conta Cal.com + OAuth flow — externa ao escopo de código. TODOs em `agenda/_lib/api.ts` L73-76. |
| G6: Resend / WhatsApp notifications | Requer API keys externas. Templates prontos no CRM como base para as mensagens. |
| G7: Campos `data_contrato`/`data_cobranca` | `status_pagamento` foi implementado como versão simplificada. Migração de campos de datas seria Sprint 7. |

---

## Riscos e dívida técnica gerada

| Risco | Severidade | Mitigação |
|---|---|---|
| Prompt "usa dados reais" aumenta tokens de output — Opus 4.8 com max_tokens=4096 pode ficar caro em escala | Baixo (ticket médio R$2.500+) | Monitorar tokensUsed retornado pela API |
| `crm_stage_history` cresce indefinidamente sem purge | Baixo imediato | Adicionar `TRUNCATE ... WHERE changed_at < now() - interval '1 year'` como cron futuro |
| Templates defaults hardcoded em código — mudança requer deploy | Baixo | DB templates sobrescrevem defaults; default = zero state sem configuração |
| `dataProximaAcao` stored como ISO string client-side, timezone do browser | Aceitável | Todos os datetimes no sistema são em UTC via Supabase; o input `datetime-local` converte para ISO antes de persistir |

---

## Arquivos modificados/criados nestes 3 sprints

```
supabase/migrations/
  007_offer_books_ai_output.sql    (Sprint 4)
  008_crm_followup.sql             (Sprint 6)

app/offer-book/_lib/
  ai-types.ts                      (Sprint 4: AiOutput; Sprint 5: +AiStrategic)
  scores.ts                        (Sprint 5: +potencial, +eficiencia)
  supabase.ts                      (Sprint 4 fix: server-side null bug)
  store.tsx                        (Sprint 4: +aiOutput, setAiOutput, hydration)

app/api/offer-book/
  generate/route.ts                (Sprint 4 + Sprint 5: rewrite, bug fixes, strategic)

app/offer-book/
  resumo/page.tsx                  (Sprint 4: route migration; Sprint 5: 6-score grid + StrategicBlock)
  plano-acao/page.tsx              (Sprint 4: AI priorities; Sprint 5: +potencial/eficiencia entries)
  roadmap/page.tsx                 (Sprint 4: client component + AI fases)

app/print/page.tsx                 (Sprint 5: +potencial/eficiencia entries)

app/crm/_lib/
  types.ts                         (Sprint 6: StatusPagamento, StageHistoryEntry, MessageTemplate)
  api.ts                           (Sprint 6: history logging + template CRUD + convertToCliente)

app/crm/page.tsx                   (Sprint 6: full rewrite — tabs, templates, dashboard, overdue)

app/agenda/page.tsx                (colateral Sprint 4: Suspense fix)

memory/
  sprint-audit-junho-2026.md       (STEP 1: full audit)
  offer-book.md                    (Sprint 4 + Sprint 5 appended)
  crm.md                           (Sprint 6 appended)
  sprints-4-5-6-final.md           (este arquivo)
```
