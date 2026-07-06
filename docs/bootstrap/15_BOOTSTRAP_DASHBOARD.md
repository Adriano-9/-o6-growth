# 15 · Bootstrap Dashboard

## Propósito

Documentar os **três** dashboards que existem hoje (sim, três — não consolidados, decisão consciente registrada abaixo) e o Mission Control (`/os`).

## Status: 🟢 Implementado (Fase 1 do `/os`)

## Os 3 dashboards e por que não foram unificados

| Dashboard | Rota | Propósito | Por que separado |
|---|---|---|---|
| Dashboard Executivo | `/dashboard-o6` | MRR, pipeline, financeiro, inteligência, operação, metas — visão do negócio inteiro | Primeiro dashboard construído, cobre o negócio todo |
| Offer Book Dashboard | `/offer-book-dashboard` | Offer Book institucional da própria O6 (estático) | Documento de referência, não operacional |
| Mission Control | `/os` | Painel operacional dentro do "sistema operacional" O6 — 4 cards + health | Construído depois, como Fase 1 de uma constituição formal (Manual Operacional v1) |

**Decisão registrada:** não consolidar os três em um só — cada um serve um momento de uso diferente (revisão executiva mensal vs. referência institucional vs. operação diária). Se isso mudar, a decisão precisa ser revertida explicitamente aqui, não silenciosamente.

## Mission Control (`/os`) — Fase 1

```
app/os/
  _lib/ui.tsx          Reveal, Counter, Card, StatusDot, HealthBadge (compartilhado nas 4 rotas)
  layout.tsx            sidebar com 8 itens (4 nativos /os/*, 4 apontam pra rotas legadas)
  page.tsx               Mission Control — MRR, clientes ativos, projetos ativos, agentes ativos, health
  pipeline/page.tsx      7 estágios (Lead→Diagnóstico→Proposta→Fechamento→Onboarding→Retainer→Expansão)
  agentes/page.tsx        tabela de 4 agentes (hardcoded — sem tabela agent_runs ainda)
  hermes/page.tsx         CPU/RAM/Disco (indisponível — sem SSH), cron jobs, logs
```

## Padrão de fail-soft honesto (regra aplicada em todas as rotas de API do dashboard)

```typescript
// app/api/os/summary/route.ts e app/api/os/pipeline/route.ts
if (queryRes.error) console.error("[rota] query falhou", queryRes.error);
// ...
fonte: todasAsQueriesFalharam ? "fallback" : "supabase"
```

**Por que isso importa:** numa sessão real, o Supabase teve timeout de rede. Sem essa checagem, a UI reportaria "conectado" com zeros falsos. Com ela, reporta "Dados offline / fallback" honestamente — o usuário sabe que o número não é real, não é confundido com "zero clientes de verdade".

## Sidebar do `/os` — itens não implementados apontam para rotas reais existentes

`Clientes → /clientes-dashboard`, `Projetos → /offer-book`, `Financeiro → /dashboard-o6`, `Knowledge → /offer-book-dashboard`. Todos os 4 retornam HTTP 200 em produção (auditado, não assumido). Isso evita o anti-padrão de link morto — mas também significa que navegar por esses itens **sai visualmente do tema Mission Control** (cada um tem seu próprio design system aplicado no momento em que foi construído). Não é bug, é trade-off documentado.

## Bug corrigido nesta linha do tempo (documentado para não repetir)

`translate="no"` foi adicionado nos labels da sidebar do `/os` porque o Chrome/Edge, ao traduzir a página pt-BR, traduzia literalmente "Pipeline" → "Gasoduto" (tradução de dicionário do termo em inglês). O código-fonte nunca teve esse texto — era comportamento do navegador. Lição: microcopy técnico em inglês dentro de página pt-BR precisa de blindagem contra auto-tradução.

## Checklist antes de criar um 4º dashboard

- [ ] Realmente precisa ser um dashboard novo, ou é uma seção que cabe em um dos 3 existentes?
- [ ] Se novo, qual momento de uso ele serve que os outros 3 não servem?
- [ ] Segue o padrão fail-soft (erro real checado, nunca mascarado)?
