# 14 · Bootstrap Offer Book

## Propósito

Documentar o módulo Offer Book — coletor de inteligência comercial por cliente — e sua versão "própria" (o Offer Book da O6 sobre si mesma).

## Status: 🟢 Implementado

## Arquitetura

```
app/offer-book/
  _lib/store.tsx       OfferBookProvider · autosave debounced 600ms por slice
  _lib/supabase.ts      getSupabase() singleton — reusado em todo o projeto
  _lib/scores.ts        4 scores determinísticos (velocidade, oferta, aquisição, conversão)
  _components/          FormShell, Field, ScoreCard, Sidebar
  {clientes,icp,psicografia,concorrentes,oferta,diagnostico}/page.tsx
  {dashboard,resumo,plano-acao,roadmap,roi}/page.tsx
```

## Schema (`offer_books`, 1:1 com `clientes`)

JSONB para seções edit-heavy de baixa cardinalidade (1 row por cliente): `icp`, `psicografia`, `oferta`, `concorrentes`. Campos flat compartilhados (nicho, cidade) ficam em `clientes` diretamente. `ai_output` (JSONB) guarda o resultado da rota `generate` — síntese + plano de ação + roadmap + insights, cache 7 dias.

## Offer Book-Dashboard — versão "própria"

`app/offer-book-dashboard/page.tsx` é o Offer Book **da O6 sobre a O6** — não usa o fluxo de 10 páginas, é uma página estática (dados hardcoded, sem API) documentando: tese, posicionamento, esteira de produtos (Diagnóstico → Sprint → Retainer), avatar do ICP, roadmap de 3 fases, estatísticas de mercado, objeções tratadas.

**Por que hardcoded e não dinâmico:** este é o offer book institucional, não de um cliente — não há necessidade de CRUD, é documento de referência que muda por decisão estratégica, não por operação diária.

## Squad relacionado (não conflitante)

`squads/offer-book/` (agent `offer-architect`) usa **Value Equation de Hormozi** — método completamente diferente dos 4 scores determinísticos do módulo. Auditado explicitamente: **zero conflito**, são complementares. Sugestão registrada (não implementada): `/api/offer-book/value-equation` que lê `offer_books.oferta` e roda o offer-architect como segunda lente de análise.

## Checklist antes de mexer no Offer Book

- [ ] A seção é edit-heavy (→ JSONB) ou estruturada com queries (→ coluna própria)?
- [ ] Reusa `getSupabase()`, `computeScores()`, mappers existentes?
- [ ] Se mexer no cálculo de score, atualizou `plano-acao/page.tsx` E `print/page.tsx` (ambos consomem `actionByScore`)?
