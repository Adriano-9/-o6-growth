import { getSupabase } from "@/app/offer-book/_lib/supabase";
import {
  Meeting,
  MeetingInput,
  MeetingStatus,
  meetingToRow,
  rowToMeeting,
} from "./types";
import { weekRange } from "./slots";

// ─────────────────────────────────────────────────────────────
// Reads
// ─────────────────────────────────────────────────────────────

export async function listMeetingsForWeek(
  weekStart: Date,
): Promise<Meeting[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const { fromISO, toISO } = weekRange(weekStart);
  const { data, error } = await sb
    .from("meetings")
    .select("*")
    .gte("starts_at", fromISO)
    .lt("starts_at", toISO)
    .order("starts_at", { ascending: true });

  if (error || !data) {
    console.error("[agenda] listMeetingsForWeek failed", error);
    return [];
  }
  return (data as Record<string, unknown>[]).map(rowToMeeting);
}

export async function listAllMeetings(): Promise<Meeting[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from("meetings")
    .select("*")
    .order("starts_at", { ascending: false });

  if (error || !data) {
    console.error("[agenda] listAllMeetings failed", error);
    return [];
  }
  return (data as Record<string, unknown>[]).map(rowToMeeting);
}

// ─────────────────────────────────────────────────────────────
// Writes
// ─────────────────────────────────────────────────────────────

export async function createMeeting(
  input: MeetingInput,
): Promise<Meeting | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from("meetings")
    .insert(meetingToRow(input))
    .select("*")
    .single();

  if (error || !data) {
    console.error("[agenda] createMeeting failed", error);
    return null;
  }

  // TODO Cal.com/Google Calendar integration:
  // - Após INSERT bem-sucedido, chamar API Cal.com pra criar event
  // - Persistir cal_event_id retornado via updateMeeting
  // - Similar pro Google Calendar (google_event_id + meet_link)

  return rowToMeeting(data as Record<string, unknown>);
}

export async function updateMeeting(
  id: string,
  patch: Partial<MeetingInput>,
): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb
    .from("meetings")
    .update(meetingToRow(patch))
    .eq("id", id);
  if (error) console.error("[agenda] updateMeeting failed", error);

  // TODO Cal.com/Google Calendar:
  // - Se cal_event_id existir, replicar mudança via API externa
}

export async function updateStatus(
  id: string,
  status: MeetingStatus,
): Promise<void> {
  return updateMeeting(id, { status });
}

export async function deleteMeeting(id: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.from("meetings").delete().eq("id", id);
  if (error) console.error("[agenda] deleteMeeting failed", error);

  // TODO Cal.com/Google Calendar:
  // - Se cal_event_id existir, cancelar event externo antes do DELETE local
}

// ─────────────────────────────────────────────────────────────
// Dropdown options para vincular meeting
// ─────────────────────────────────────────────────────────────

export type LinkOption = {
  id: string;
  label: string;
  group: "Prospect" | "Lead" | "Cliente";
};

export async function listLinkOptions(): Promise<LinkOption[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const [prospects, leads, clientes] = await Promise.all([
    sb
      .from("prospects")
      .select("id, nome")
      .order("updated_at", { ascending: false })
      .limit(100),
    sb
      .from("crm_leads")
      .select("id, empresa, nome")
      .order("updated_at", { ascending: false })
      .limit(100),
    sb
      .from("clientes")
      .select("id, empresa")
      .order("updated_at", { ascending: false })
      .limit(100),
  ]);

  const out: LinkOption[] = [];

  (prospects.data ?? []).forEach((r) => {
    const row = r as { id: string; nome: string };
    out.push({ id: row.id, label: row.nome || "Prospect sem nome", group: "Prospect" });
  });
  (leads.data ?? []).forEach((r) => {
    const row = r as { id: string; empresa: string; nome: string };
    const label = [row.empresa, row.nome].filter(Boolean).join(" · ") || "Lead sem nome";
    out.push({ id: row.id, label, group: "Lead" });
  });
  (clientes.data ?? []).forEach((r) => {
    const row = r as { id: string; empresa: string };
    out.push({ id: row.id, label: row.empresa || "Cliente sem nome", group: "Cliente" });
  });

  return out;
}
