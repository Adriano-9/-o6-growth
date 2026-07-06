# 13 · Bootstrap CRM

## Propósito

Documentar a arquitetura real do CRM — Kanban comercial interno da O6 (não é produto vendido a clientes).

## Status: 🟢 Implementado

## Arquitetura

```
app/crm/
  _lib/types.ts     STAGES (7 etapas) + Lead + LeadInput + mappers
  _lib/api.ts        CRUD + moveLead (recalcula sort_order) + stage history automático
  layout.tsx          nav do módulo
  page.tsx            Kanban + drawer + KPIs + dashboard de conversão (toggle)
```

## Schema (`crm_leads`)

| Coluna | Tipo | Notas |
|---|---|---|
| `stage` | enum-like (CHECK constraint) | `Novo Lead → Contato Feito → Diagnóstico Agendado → Diagnóstico Entregue → Proposta → Fechado / Perdido` |
| `score` | int 0-100 | manual, pode divergir do score automático do Offer Book se cliente vinculado |
| `cliente_id` | uuid nullable | FK opcional para `clientes` — presente = lead virou cliente |
| `status_pagamento` | enum | `pendente / cobrado / pago / cancelado` |
| `sort_order` | int | recalculado a cada `moveLead()` |

Tabela auxiliar `crm_stage_history` — log automático de toda mudança de stage, sem o caller precisar lembrar (transparente em `createLead`/`updateLead`/`moveLead`).

## 7 estágios (STAGES canônicos)

```
Novo Lead → Contato Feito → Diagnóstico Agendado → Diagnóstico Entregue → Proposta → Fechado → Perdido
```

Este é o pipeline **interno operacional**. O `/os/pipeline` (ver `15_BOOTSTRAP_DASHBOARD.md`) usa um mapeamento diferente de 7 estágios (Lead → Diagnóstico → Proposta → Fechamento → Onboarding → Retainer → Expansão) — os 4 primeiros são derivados destes STAGES + `prospects.status`; os 3 últimos (pós-venda) não têm coluna própria ainda.

## Padrões reutilizáveis

- `DEFAULT_TEMPLATES` hardcoded — templates de mensagem funcionam no estado zero sem dados em DB; `crm_message_templates` sobrepõe quando customizado.
- Dashboard comercial é toggle no header, não rota separada — compartilha o mesmo state de leads do Kanban, sem fetch extra.

## Funnel glue (regra obrigatória do projeto)

Toda página com estado terminal precisa de CTA para a próxima etapa do funil (ver `CLAUDE.md` regra #11). No CRM: `Lead Fechado` → botão "Converter em Cliente" → cria `clientes` + atualiza `crm_leads.cliente_id`.

## Checklist antes de mexer no CRM

- [ ] A mudança de stage está sendo logada em `crm_stage_history` automaticamente?
- [ ] Se adicionar campo novo, existe migration nomeada?
- [ ] O funnel glue (CTA pra próxima etapa) continua funcionando após a mudança?
