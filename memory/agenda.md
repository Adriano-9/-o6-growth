# Agenda Comercial — memory

Decisões técnicas do módulo `/agenda`. Newest on top. Cross-cutting em [`o6.md`](./o6.md).

---

## 2026-06-04 · Sprint inicial — calendário semanal

### Implementado
- Migration `005_meetings` — tabela com 3 FKs opcionais (prospect/cliente/crm_lead) + campos de integração reservados.
- `_lib/types.ts` — `Meeting`, `MeetingStatus` (5 enums), constantes `SLOT_DURATION_MIN=30` e `SLOT_BUFFER_MIN=10`, mapa `AVAILABILITY` com horários por dia.
- `_lib/slots.ts` — `generateWeekSlots()`, `startOfWeek()`, `isSlotAvailable()` com checagem de buffer, helpers de range para query Supabase.
- `_lib/api.ts` — CRUD básico + `listLinkOptions()` que agrega prospect/lead/cliente para o dropdown de vínculo.
- 4 componentes: `WeekNav`, `CalendarGrid`, `MeetingDrawer`, `StatusBadge`.
- `page.tsx` — KPI strip (5 tiles) + WeekNav + CalendarGrid.

### Horários (Sprint 1)

```ts
AVAILABILITY: Record<number, number[]> = {
  1: [11, 14],         // Segunda
  2: [10, 11, 14],     // Terça
  3: [11, 14],         // Quarta
  4: [10, 11, 14],     // Quinta
  5: [11, 14],         // Sexta
};
```

12 slots por semana. Slots fora dessa grade não aparecem (não há "agendar fora do horário" no v1).

### Decisões de design
- **Hardcoded em TS, não em DB.** Mudar agenda comercial = editar `_lib/types.ts`, sem migration. Quando houver multi-usuário, mover para tabela `availability` com FK pra `users`.
- **3 FKs opcionais (prospect_id / cliente_id / crm_lead_id).** Reunião pode estar atrelada a qualquer fase do funil. UI permite só uma escolha (radio implícito via `linkChoice` no drawer).
- **Buffer = checagem no client.** `isSlotAvailable()` valida 10 min antes/depois antes de criar. Não há constraint SQL — overhead de range exclusion não justifica pro volume atual.
- **Status `Cancelada` libera buffer.** `isSlotAvailable` ignora reuniões canceladas — slot volta a estar livre.
- **Drawer com 3 grupos no select de vínculo.** `optgroup` HTML nativo (Prospects / Leads CRM / Clientes). Sem typeahead — só carregar 100 mais recentes de cada.

### Integration prep (NÃO implementado — apenas estrutura)

Colunas reservadas em `meetings`:
| Coluna | Para |
|---|---|
| `cal_event_id` | Cal.com event ID |
| `google_event_id` | Google Calendar event ID |
| `meet_link` | Google Meet URL |
| `fathom_recording_id` | Fathom recording ID |
| `fathom_summary` | Fathom AI summary (texto) |

TODOs marcados em `_lib/api.ts` nos pontos de `createMeeting`, `updateMeeting`, `deleteMeeting` — onde a sincronização externa deve ser injetada na Sprint de integrações.

### Trade-offs aceitos
- **Sem timezone explícito.** Usa horário local do browser. Quando o time crescer geograficamente, adicionar `timezone text` em `meetings` e converter no display.
- **Sem detecção de double-booking server-side.** Client checa via `isSlotAvailable`. Se 2 abas tentarem agendar o mesmo slot simultaneamente, ganha o último write. Aceitável pro volume; resolver com `unique constraint` ou advisory lock quando virar problema.
- **`listLinkOptions` limita a 100 por tabela.** 300 total no dropdown é o máximo. Com cardinalidade maior, adicionar typeahead com filtro server-side.
- **Slot tem duração fixa de 30 min na grade visual.** Reunião pode ter `durationMin` diferente (15/45/60/90/120), mas a célula no calendário sempre representa um slot de 30 min. Reuniões longas não "esticam" visualmente — limitação aceita do layout em grid simples.

### Verificação ao fechar
- Migration aplicada em Supabase com sucesso.
- 4 KPIs computados client-side a partir de `meetings`.
- Topbar adicionado em `/agenda`, `/crm`, `/oportunidades` — link Agenda visível em todos os módulos.
- `/agenda` GET → 200 (verificar no preview).

### Paths tocados
- `app/agenda/_lib/{types,slots,api}.ts`
- `app/agenda/_components/{WeekNav,CalendarGrid,MeetingDrawer,StatusBadge}.tsx`
- `app/agenda/{layout,page}.tsx`
- `app/oportunidades/layout.tsx` (+ link Agenda)
- `app/crm/layout.tsx` (+ link Agenda + Oportunidades)
- `CLAUDE.md` (registro do módulo + memory file)

---

## Próximos passos (não desta Sprint)

1. **Integração Cal.com** — webhook `event.created` cria meeting local; reverso = chamada à API Cal.com em `createMeeting`.
2. **Integração Google Calendar** — sync bidirecional + `meet_link` automático.
3. **Integração Fathom** — webhook após reunião adiciona `fathom_recording_id` e `fathom_summary` ao meeting.
4. **Multi-usuário** — `users` table + `meetings.owner_id` FK + `availability` table por user.
5. **Notificações** — reminder 24h antes via WhatsApp (vincular com prospect.whatsapp ou crm_lead.whatsapp).
