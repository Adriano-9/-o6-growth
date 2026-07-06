# 18 · Bootstrap Pipelines

## Propósito

Consolidar os pipelines reais do sistema — sequências de agentes/etapas com estado — distinguindo de "só uma rota de API".

## Definição de pipeline nesta arquitetura

Um pipeline é uma sequência de **≥ 2 etapas com estado persistido entre elas**, onde cada etapa pode ser re-executada independentemente (idempotência) e o estado vive em uma tabela, não em memória do processo.

## Pipeline 1 — Prospecção → Cliente (🟡 parcial, trigger humano em cada salto)

```
Apify Search → prospects
     │
     ▼ [audit]
     │
     ▼ [opener] ──► [demo] (mesma chamada, fail-soft)
     │
     ▼ (humano: WhatsApp manual)
     │
     ▼ (humano: promove pra CRM)
crm_leads (7 stages)
     │
     ▼ (humano: fecha negócio)
clientes → offer_books
```

Arquivo: `/api/prospects/pipeline/route.ts` — a única etapa que já é de fato "pipeline" (2+ agentes numa chamada só, com cache e fail-soft): audit → opener → demo.

## Pipeline 2 — Intelligence Brief (🟡 pronto, execução real pendente)

```
collect_news() → analyze() por artigo → save (Supabase) → send (Telegram)
                        │
                        └─ score >= 80 → gerar_offer_book_mini() [novo, não executado ainda]
```

Arquivo: `/opt/o6-intelligence/main.py` — roda no VPS via cron (não confirmado ativo).

## Pipeline 3 — O6 OS Pipeline Comercial (🟡 4 de 7 estágios reais)

```
Lead ──► Diagnóstico ──► Proposta ──► Fechamento ──► Onboarding ──► Retainer ──► Expansão
 │            │              │             │              │             │            │
 └────────────┴──────────────┴─────────────┘              └─────────────┴────────────┘
   derivado de prospects + crm_leads (🟢)      sem coluna própria ainda — 0 hardcoded (🔴)
```

Rota: `/api/os/pipeline` — mapeia dados reais para os 4 primeiros estágios, marca os 3 últimos como "sem dado" (não finge dado real).

## Padrão de idempotência usado em todos os pipelines reais

```typescript
if (!force && cached_result_exists) return cached_result; // cache 7 dias
// senão, regenera e persiste
```

## Padrão de fail-soft entre etapas

```typescript
try {
  demoResult = await callDemoAgent();
} catch {
  console.warn("[pipeline] demo failed (non-fatal)");
  demoResult = null; // pipeline continua sem travar
}
```

Usado em `/api/prospects/pipeline` — se o `demo` falhar, o `opener` ainda é entregue.

## Checklist antes de criar um pipeline novo

- [ ] Cada etapa pode rodar sozinha (testável isoladamente)?
- [ ] O estado entre etapas vive em Supabase, não em variável de processo?
- [ ] Uma etapa falhando quebra o pipeline inteiro, ou é fail-soft onde faz sentido?
- [ ] Existe `force` para re-rodar sem depender de cache?
