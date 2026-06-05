// ─────────────────────────────────────────────────────────────
// Configuração de disponibilidade
// ─────────────────────────────────────────────────────────────

/** Duração de cada reunião em minutos */
export const SLOT_DURATION_MIN = 30;

/** Buffer entre reuniões consecutivas em minutos */
export const SLOT_BUFFER_MIN = 10;

/**
 * Horários de início disponíveis por dia da semana.
 * Chaves: 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sab.
 * Valores: hora local (24h) em que um slot pode começar.
 *
 * Editar aqui = mudar a agenda comercial sem migration.
 */
export const AVAILABILITY: Record<number, number[]> = {
  1: [11, 14],         // Segunda
  2: [10, 11, 14],     // Terça
  3: [11, 14],         // Quarta
  4: [10, 11, 14],     // Quinta
  5: [11, 14],         // Sexta
};

export const WEEKDAY_LABELS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
] as const;

export const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

// ─────────────────────────────────────────────────────────────
// Status
// ─────────────────────────────────────────────────────────────

export const MEETING_STATUS = [
  "Agendada",
  "Confirmada",
  "Realizada",
  "Cancelada",
  "No-show",
] as const;

export type MeetingStatus = (typeof MEETING_STATUS)[number];

// ─────────────────────────────────────────────────────────────
// Domain types
// ─────────────────────────────────────────────────────────────

export type Meeting = {
  id: string;
  prospectId: string | null;
  clienteId: string | null;
  crmLeadId: string | null;

  titulo: string;
  contatoNome: string;
  contatoEmail: string;
  contatoWhatsapp: string;
  notes: string;

  startsAt: string;       // ISO
  endsAt: string;         // ISO
  durationMin: number;

  status: MeetingStatus;

  // Integration fields — vazios até Sprint futura
  calEventId: string | null;
  googleEventId: string | null;
  meetLink: string | null;
  fathomRecordingId: string | null;
  fathomSummary: string | null;

  createdAt: string;
  updatedAt: string;
};

export type MeetingInput = Omit<Meeting, "id" | "createdAt" | "updatedAt">;

export const emptyMeetingInput = (startsAt: string): MeetingInput => {
  const start = new Date(startsAt);
  const end = new Date(start.getTime() + SLOT_DURATION_MIN * 60 * 1000);
  return {
    prospectId: null,
    clienteId: null,
    crmLeadId: null,
    titulo: "",
    contatoNome: "",
    contatoEmail: "",
    contatoWhatsapp: "",
    notes: "",
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
    durationMin: SLOT_DURATION_MIN,
    status: "Agendada",
    calEventId: null,
    googleEventId: null,
    meetLink: null,
    fathomRecordingId: null,
    fathomSummary: null,
  };
};

// ─────────────────────────────────────────────────────────────
// Mappers
// ─────────────────────────────────────────────────────────────

export function rowToMeeting(r: Record<string, unknown>): Meeting {
  return {
    id: r.id as string,
    prospectId: (r.prospect_id as string | null) ?? null,
    clienteId: (r.cliente_id as string | null) ?? null,
    crmLeadId: (r.crm_lead_id as string | null) ?? null,
    titulo: (r.titulo as string) ?? "",
    contatoNome: (r.contato_nome as string) ?? "",
    contatoEmail: (r.contato_email as string) ?? "",
    contatoWhatsapp: (r.contato_whatsapp as string) ?? "",
    notes: (r.notes as string) ?? "",
    startsAt: (r.starts_at as string) ?? "",
    endsAt: (r.ends_at as string) ?? "",
    durationMin: Number(r.duration_min ?? SLOT_DURATION_MIN),
    status: (r.status as MeetingStatus) ?? "Agendada",
    calEventId: (r.cal_event_id as string | null) ?? null,
    googleEventId: (r.google_event_id as string | null) ?? null,
    meetLink: (r.meet_link as string | null) ?? null,
    fathomRecordingId: (r.fathom_recording_id as string | null) ?? null,
    fathomSummary: (r.fathom_summary as string | null) ?? null,
    createdAt: (r.created_at as string) ?? "",
    updatedAt: (r.updated_at as string) ?? "",
  };
}

export function meetingToRow(
  m: Partial<MeetingInput>,
): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (m.prospectId !== undefined) row.prospect_id = m.prospectId;
  if (m.clienteId !== undefined) row.cliente_id = m.clienteId;
  if (m.crmLeadId !== undefined) row.crm_lead_id = m.crmLeadId;
  if (m.titulo !== undefined) row.titulo = m.titulo;
  if (m.contatoNome !== undefined) row.contato_nome = m.contatoNome;
  if (m.contatoEmail !== undefined) row.contato_email = m.contatoEmail;
  if (m.contatoWhatsapp !== undefined) row.contato_whatsapp = m.contatoWhatsapp;
  if (m.notes !== undefined) row.notes = m.notes;
  if (m.startsAt !== undefined) row.starts_at = m.startsAt;
  if (m.endsAt !== undefined) row.ends_at = m.endsAt;
  if (m.durationMin !== undefined) row.duration_min = m.durationMin;
  if (m.status !== undefined) row.status = m.status;
  if (m.calEventId !== undefined) row.cal_event_id = m.calEventId;
  if (m.googleEventId !== undefined) row.google_event_id = m.googleEventId;
  if (m.meetLink !== undefined) row.meet_link = m.meetLink;
  if (m.fathomRecordingId !== undefined) row.fathom_recording_id = m.fathomRecordingId;
  if (m.fathomSummary !== undefined) row.fathom_summary = m.fathomSummary;
  return row;
}
