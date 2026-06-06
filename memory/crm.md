# CRM — memory

Decisões técnicas do módulo `/crm`. Newest on top. Cross-cutting em [`o6.md`](./o6.md).

---

## 2026-06-05 · Sprint 6 — Follow-up Engine + Message Templates + Commercial Dashboard

### Migration `008_crm_followup` (aplicada)
Altera `crm_leads`, adiciona 2 novas tabelas:
- **`crm_leads` novos campos**: `responsavel TEXT DEFAULT ''`, `proxima_acao TEXT DEFAULT ''`, `data_proxima_acao TIMESTAMPTZ`, `notas TEXT DEFAULT ''`, `status_pagamento TEXT CHECK (pendente|cobrado|pago|cancelado) DEFAULT 'pendente'`
- **`crm_stage_history`**: `id UUID PK`, `lead_id FK→crm_leads ON DELETE CASCADE`, `stage_from TEXT`, `stage_to TEXT`, `changed_at TIMESTAMPTZ`. Índices em `lead_id` e `changed_at DESC`. RLS anon all.
- **`crm_message_templates`**: `id UUID PK`, `stage TEXT`, `tipo TEXT CHECK (whatsapp|email)`, `titulo TEXT`, `conteudo TEXT`, `is_default BOOLEAN`. Índice em `(stage, tipo)`. RLS anon all.

### Follow-up Engine
- Overdue detection: `isOverdue(lead)` → `dataProximaAcao` < now E stage não é Fechado/Perdido.
- Overdue badge: pulsing red dot no lead card. Contador de overdue por coluna (badge vermelho no header da coluna).
- Drawer tab "Follow-up": responsavel, proxima_acao, data_proxima_acao (datetime-local), notas, status_pagamento.

### Stage History
- `createLead` → INSERT em `crm_stage_history` com `stage_from=''`, `stage_to=lead.stage`.
- `updateLead(id, patch, prevStage?)` → se stage mudou, INSERT em history.
- `moveLead(id, toStage, ..., fromStage?)` → se stage mudou, INSERT em history.
- Drawer tab "Histórico" mostra timeline ordenada por `changed_at ASC`.
- `listStageHistory(leadId)` em `_lib/api.ts`.

### Message Templates
- Default templates hardcoded em TypeScript (`DEFAULT_TEMPLATES` em `crm/page.tsx`) — 7 stages × 2 tipos = 14 templates. Zero dependência de DB no estado zero.
- DB overrides via `crm_message_templates`: se existe registro para `(stage, tipo)`, sobrescreve o default.
- `TemplateCard` component: exibe resolvido (substitui `{nome}` / `{empresa}`), modo edição inline, botão "Copiar" com feedback "Copiado!".
- `upsertMessageTemplate()` — INSERT ou UPDATE by `id`.
- Tab "Templates" no drawer carrega templates do DB ao abrir.

### Commercial Dashboard (view toggle Kanban ↔ Dashboard)
- Toggle com ícones `ClipboardList` e `LayoutDashboard`.
- **4 KPIs**: Receita Realizada, Pipeline Potencial, Novos (7 dias), Follow-ups Vencidos.
- **Funil de conversão**: barra horizontal para cada stage, width proporcional ao máximo.
- **Taxas de conversão por etapa**: grid 6 cards (stages adjacentes), cor por tier (≥50% verde, ≥25% âmbar, <25% vermelho).
- **Receita potencial por etapa**: tabela `(stage, count, total valor)` — só linhas não-zeradas.
- Tudo computed via `useMemo` client-side — nenhuma query extra.

### Tabs no Drawer (edit mode only)
4 tabs: **Dados** (form original) · **Follow-up** (campos novos) · **Templates** (WhatsApp + email) · **Histórico** (timeline).
- Cada tab tem seu próprio `<form onSubmit>` chamando o mesmo `handleSubmit`.
- Lazy-load: histórico e templates só buscam do DB quando o tab é aberto.

### Funnel Glue — Lead Fechado → Cliente
- Quando `stage === "Fechado"` e sem `clienteId`, CTA "Converter para Cliente" aparece na aba Dados.
- `convertToCliente(lead)` em `_lib/api.ts`: cria `clientes` + `diagnosticos` + `offer_books` rows, UPDATE `crm_leads.cliente_id`. Retorna `clienteId`.
- Redireciona para `/offer-book/clientes` com `localStorage["o6.offer-book.current"]` pré-setado.

### TypeScript fix no useEffect do Drawer
- Depois que `key={drawerKey}` foi implementado (monta componente fresh a cada abertura), o useEffect que sincronizava `input` com `drawer.input` ficou redundante.
- TypeScript TS5 strict narrow: `else` branch após `if (drawerMode === "closed")` → `drawer.mode` não pode ser `"closed"`, então `drawer.mode === "closed"` nesse branch é type error.
- Solução: simplificar o effect para só tratar o close case; useState initializer cuida da inicialização na montagem.

### Trade-offs
- Templates só suportam 2 variáveis (`{nome}`, `{empresa}`) agora. Extensível adicionando substitutions no `resolved` sem migração.
- Score sync CRM ↔ Offer Book (G4) não implementado neste sprint — considerado Sprint 7. Infraestrutura está pronta (campo `clienteId` + `computeScores` importável).
- `status_pagamento` visível no drawer mas sem KPI dedicado na view Kanban. KPI "Receita Realizada" usa stage=Fechado como proxy.

---

## 2026-06-03 · v1.0 inicial (Kanban + DnD + KPIs)

### 7 etapas canônicas
`Novo Lead` · `Contato Feito` · `Diagnóstico Agendado` · `Diagnóstico Entregue` · `Proposta` · `Fechado` · `Perdido`. Definidas como `STAGES` (`app/crm/_lib/types.ts`) e como CHECK constraint no Postgres (`migration 003_crm_leads`). **Manter os dois em sync.**

### Schema `crm_leads` (migration 003)
- `id uuid pk`
- `cliente_id uuid` → `clientes(id) ON DELETE SET NULL` — vínculo **opcional**. Lead sem cliente ainda é válido (pré-onboarding).
- 6 campos texto: `empresa`, `nome`, `whatsapp`, `email`, `nicho`, `cidade`
- `score int CHECK (0..100)` — manual no card; sync futura com Offer Book quando linked.
- `stage text CHECK in (7 stages)`
- `valor numeric` — usado pelo KPI Receita.
- `sort_order int` — posição dentro da coluna.
- `data timestamptz` — data de referência do lead (não necessariamente created_at).
- `created_at`, `updated_at` + trigger `set_updated_at`.
- Indexes: `(stage, sort_order)`, `cliente_id`, `updated_at desc`.
- RLS anon all (padrão O6).

### Drag-and-drop: **HTML5 nativo, zero deps**
- `draggable` no card + `onDragStart/End` + `onDragOver/Leave/Drop` nas colunas.
- Sem react-dnd, sem dnd-kit, sem framer-motion. Decisão consciente: gestos drag funcionam, não precisamos de tooling.
- **Optimistic update**: state local atualiza antes do roundtrip Supabase. Refresh ao final pra reconciliar.
- `moveLead` em `_lib/api.ts` recalcula `sort_order` 0..n-1 na coluna destino e dispara `Promise.all` de updates paralelos.
- Drop zone highlighta com `border-brand-cyan/50` durante hover (state `overStage`).

### KPIs (computed client-side via `useMemo`)
- **Leads** = count(*)
- **Diagnósticos** = count em `Diagnóstico Agendado | Entregue`
- **Propostas** = count em `Proposta`
- **Fechamentos** = count em `Fechado` (accent verde)
- **Receita** = `sum(valor) where stage='Fechado'`, formato BRL

### Layout isolado
- `app/crm/layout.tsx` tem topbar próprio (Clientes · Offer Book · CRM como pílulas) — **não usa** a Sidebar do Offer Book.
- Motivo: largura máxima da página vai a 1600px pro Kanban respirar, sidebar fixa quebraria scroll horizontal.
- Header sticky com blur. Mantém mesma estética (logo O6, zinc-950, brand-cyan ativo).

### Drawer lateral
- Modal lateral direito 100vh, backdrop `bg-black/60 backdrop-blur-sm`.
- Estado controlado: `DrawerState = { mode: 'closed' } | { mode: 'create', input } | { mode: 'edit', input, id }`.
- Input form gerenciado por `useState` interno ao componente (não no state da página), sincronizado via `useEffect` quando `drawer.mode` muda.
- `drawerKey` no parent força remount em edge cases. Provavelmente redundante mas inofensivo.

### Vínculo com cliente
- Dropdown "Cliente vinculado (opcional)" puxa de `listClienteOptions()` (`app/crm/_lib/api.ts`) — `select id, empresa from clientes order by updated_at desc`.
- Quando linked: lead conhece o cliente, mas não puxa scores automaticamente (decisão futura: sync de score quando lead linked).

### Reuso e isolamento
- `getSupabase()` importado de `@/app/offer-book/_lib/supabase.ts` — único client. **Não duplicar.**
- Tudo mais é local em `app/crm/_lib/*`: types, api, helpers.
- Zero arquivo do Offer Book foi modificado.

### Trade-offs aceitos
- DnD nativo HTML5 não tem touch suporte nativo bom em mobile. Aceito por enquanto: target user faz pipeline em desktop. Mobile = read-only via cards (não dragueia).
- `Promise.all` de updates em `moveLead` em vez de batch RPC: simples, OK pra <100 cards por coluna. Migrar pra RPC SQL function se virar gargalo.
- Score manual no card sem auto-sync com Offer Book: decisão consciente — score do CRM é "quente o lead está agora", não o health score do offer book.
- Receita só conta `Fechado` (não Proposta). Decisão: KPI mostra dinheiro real, não pipeline. Adicionar segundo KPI "Pipeline" se precisar.

### Verificação feita
- INSERT via drawer → confirmado em `crm_leads` com 9 campos.
- UPDATE de stage via drawer → confirmado, KPI Receita recalculou (R$ 8.500 em Fechado).
- Drag-drop sintético não testou via harness (DataTransfer limitação headless), mas o path de UPDATE é o mesmo do drawer e foi validado.
