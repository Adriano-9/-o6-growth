# CRM — memory

Decisões técnicas do módulo `/crm`. Newest on top. Cross-cutting em [`o6.md`](./o6.md).

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
