import { getSupabase } from "@/app/offer-book/_lib/supabase";
import {
  Lead,
  LeadInput,
  MessageTemplate,
  Stage,
  StageHistoryEntry,
  STAGES,
  leadToRow,
  rowToLead,
  rowToStageHistory,
} from "./types";

export type ClienteOption = {
  id: string;
  empresa: string;
};

export async function listLeads(): Promise<Lead[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("crm_leads")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error || !data) {
    console.error("[crm] listLeads failed", error);
    return [];
  }
  return (data as Record<string, unknown>[]).map(rowToLead);
}

// Same digits-only normalization already used elsewhere for phone numbers
// (see whatsappNumber in app/api/prospects/demo/route.ts) — crm_leads has
// no enforced whatsapp format (free text from the CRM UI), so "(71)
// 99999-9999", "71999999999" and "+55 71 99999-9999" all need to compare
// equal.
function normalizePhone(v: string): string {
  return v.replace(/\D/g, "");
}

// Only fields that were actually merge-able and correspond 1:1 to
// `leadToRow`'s outbound mapping (see below) — deliberately does NOT touch
// `whatsapp` itself (the two numbers already matched under normalization,
// keep whichever format was already stored) or `sortOrder` (a merge
// shouldn't move the card's position in its column).
//
// Stage only ever moves forward: a webhook re-firing "Novo Lead" after a
// human already advanced the card to "Proposta" must not regress the
// pipeline. "Forward" = later index in STAGES — this puts "Perdido" as
// the highest rank (last in the array), so an explicit "Perdido" always
// wins even over "Fechado". If that's not the intended semantics for
// Perdido specifically, this is the one line to revisit.
function buildMergePatch(input: LeadInput, currentStage: Stage) {
  const partial: Partial<LeadInput> = {
    score: input.score,
    valor: input.valor,
  };
  if (input.empresa) partial.empresa = input.empresa;
  if (input.nome) partial.nome = input.nome;
  if (input.email) partial.email = input.email;
  if (input.nicho) partial.nicho = input.nicho;
  if (input.cidade) partial.cidade = input.cidade;
  if (input.responsavel) partial.responsavel = input.responsavel;
  if (input.proximaAcao) partial.proximaAcao = input.proximaAcao;
  if (input.dataProximaAcao) partial.dataProximaAcao = input.dataProximaAcao;
  if (input.notas) partial.notas = input.notas;
  if (input.statusPagamento) partial.statusPagamento = input.statusPagamento;
  if (input.origem) partial.origem = input.origem;
  if (input.clienteId) partial.clienteId = input.clienteId;
  if (STAGES.indexOf(input.stage) > STAGES.indexOf(currentStage)) {
    partial.stage = input.stage;
  }
  return leadToRow(partial);
}

export async function createLead(input: LeadInput): Promise<Lead | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const normalizedPhone = input.whatsapp ? normalizePhone(input.whatsapp) : "";

  if (normalizedPhone) {
    // No normalized/indexed whatsapp column exists yet, so this is a
    // full-table scan-and-compare in JS rather than a DB-side match.
    // Fine at this app's current scale (small-business CRM); revisit with
    // a generated normalized column + index if crm_leads ever grows large.
    const { data: candidates, error: lookupErr } = await sb
      .from("crm_leads")
      .select("id, whatsapp, stage");
    if (lookupErr) {
      console.error("[crm] createLead dedup lookup failed", lookupErr);
    }
    const existing = (
      candidates as { id: string; whatsapp: string; stage: Stage }[] | null
    )?.find((r) => normalizePhone(r.whatsapp || "") === normalizedPhone);

    if (existing) {
      const patch = buildMergePatch(input, existing.stage);
      const { data, error } = await sb
        .from("crm_leads")
        .update(patch)
        .eq("id", existing.id)
        .select("*")
        .single();
      if (error || !data) {
        console.error("[crm] createLead merge-update failed", error);
        return null;
      }

      const lead = rowToLead(data as Record<string, unknown>);

      if (patch.stage && patch.stage !== existing.stage) {
        await sb.from("crm_stage_history").insert({
          lead_id: lead.id,
          stage_from: existing.stage,
          stage_to: lead.stage,
        });
      }

      return lead;
    }
  }

  // No existing lead with this whatsapp (or no whatsapp provided) — original insert path, unchanged.
  const { data: maxRows } = await sb
    .from("crm_leads")
    .select("sort_order")
    .eq("stage", input.stage)
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextOrder =
    Array.isArray(maxRows) && maxRows.length > 0
      ? Number((maxRows[0] as { sort_order: number }).sort_order) + 1
      : 0;

  const { data, error } = await sb
    .from("crm_leads")
    .insert({ ...leadToRow(input), sort_order: nextOrder })
    .select("*")
    .single();
  if (error || !data) {
    console.error("[crm] createLead failed", error);
    return null;
  }

  const lead = rowToLead(data as Record<string, unknown>);

  // Log initial stage
  await sb.from("crm_stage_history").insert({
    lead_id: lead.id,
    stage_from: "",
    stage_to: lead.stage,
  });

  return lead;
}

export async function updateLead(
  id: string,
  patch: Partial<LeadInput> & { sortOrder?: number },
  prevStage?: Stage,
): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb
    .from("crm_leads")
    .update(leadToRow(patch))
    .eq("id", id);
  if (error) {
    console.error("[crm] updateLead failed", error);
    return;
  }

  // Log stage change if it changed
  if (prevStage && patch.stage && prevStage !== patch.stage) {
    await sb.from("crm_stage_history").insert({
      lead_id: id,
      stage_from: prevStage,
      stage_to: patch.stage,
    });
  }
}

export async function deleteLead(id: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.from("crm_leads").delete().eq("id", id);
  if (error) console.error("[crm] deleteLead failed", error);
}

export async function moveLead(
  id: string,
  toStage: Stage,
  toIndex: number,
  allLeads: Lead[],
  fromStage?: Stage,
): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;

  const destOthers = allLeads
    .filter((l) => l.stage === toStage && l.id !== id)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  destOthers.splice(toIndex, 0, {
    ...allLeads.find((l) => l.id === id)!,
    stage: toStage,
  });

  const updates = destOthers.map((l, idx) => ({
    id: l.id,
    sort_order: idx,
    stage: toStage,
  }));

  await Promise.all(
    updates.map((u) =>
      sb
        .from("crm_leads")
        .update({ sort_order: u.sort_order, stage: u.stage })
        .eq("id", u.id),
    ),
  );

  // Log stage change
  if (fromStage && fromStage !== toStage) {
    await sb.from("crm_stage_history").insert({
      lead_id: id,
      stage_from: fromStage,
      stage_to: toStage,
    });
  }
}

export async function listStageHistory(
  leadId: string,
): Promise<StageHistoryEntry[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("crm_stage_history")
    .select("*")
    .eq("lead_id", leadId)
    .order("changed_at", { ascending: true });
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map(rowToStageHistory);
}

/**
 * Fetch every stage transition in the last `days` days (default 7).
 * Used by the commercial dashboard's weekly activity summary —
 * "leads contacted this week", "meetings scheduled", "proposals sent".
 */
export async function listStageHistorySince(
  days = 7,
): Promise<StageHistoryEntry[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await sb
    .from("crm_stage_history")
    .select("*")
    .gte("changed_at", cutoff)
    .order("changed_at", { ascending: false });
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map(rowToStageHistory);
}

// ─────────────────────────────────────────────────────────────
// Funnel glue — converter Lead Fechado em Cliente
// ─────────────────────────────────────────────────────────────

export async function convertToCliente(lead: Lead): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;

  if (lead.clienteId) return lead.clienteId;

  const { data: inserted, error: insertErr } = await sb
    .from("clientes")
    .insert({
      empresa: lead.empresa,
      nicho: lead.nicho,
      cidade: lead.cidade,
      ticket_medio: lead.valor > 0 ? String(lead.valor) : "",
      fonte_leads: "CRM",
    })
    .select("id")
    .single();

  if (insertErr || !inserted) {
    console.error("[crm] convertToCliente insert failed", insertErr);
    return null;
  }

  const clienteId = inserted.id as string;

  await Promise.all([
    sb.from("diagnosticos").insert({ cliente_id: clienteId }),
    sb.from("offer_books").insert({
      cliente_id: clienteId,
      icp: {},
      psicografia: {},
      oferta: {},
      concorrentes: [],
    }),
  ]);

  await sb
    .from("crm_leads")
    .update({ cliente_id: clienteId })
    .eq("id", lead.id);

  return clienteId;
}

export async function listClienteOptions(): Promise<ClienteOption[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("clientes")
    .select("id, empresa")
    .order("updated_at", { ascending: false });
  if (error || !data) return [];
  return (data as { id: string; empresa: string }[]).map((r) => ({
    id: r.id,
    empresa: r.empresa || "Sem nome",
  }));
}

// ─────────────────────────────────────────────────────────────
// Message templates
// ─────────────────────────────────────────────────────────────

export async function listMessageTemplates(
  stage: string,
): Promise<MessageTemplate[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("crm_message_templates")
    .select("*")
    .eq("stage", stage)
    .order("tipo", { ascending: true });
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map((r) => ({
    id: r.id as string,
    stage: r.stage as string,
    tipo: r.tipo as "whatsapp" | "email",
    titulo: (r.titulo as string) ?? "",
    conteudo: (r.conteudo as string) ?? "",
    isDefault: Boolean(r.is_default),
  }));
}

export async function upsertMessageTemplate(
  t: Omit<MessageTemplate, "id"> & { id?: string },
): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const row = {
    stage: t.stage,
    tipo: t.tipo,
    titulo: t.titulo,
    conteudo: t.conteudo,
    is_default: t.isDefault,
  };
  if (t.id) {
    await sb.from("crm_message_templates").update(row).eq("id", t.id);
  } else {
    await sb.from("crm_message_templates").insert(row);
  }
}

export async function deleteMessageTemplate(id: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from("crm_message_templates").delete().eq("id", id);
}
