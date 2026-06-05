import { getSupabase } from "@/app/offer-book/_lib/supabase";
import {
  Lead,
  LeadInput,
  Stage,
  leadToRow,
  rowToLead,
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

export async function createLead(input: LeadInput): Promise<Lead | null> {
  const sb = getSupabase();
  if (!sb) return null;

  // place at the end of the target column
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
  return rowToLead(data as Record<string, unknown>);
}

export async function updateLead(
  id: string,
  patch: Partial<LeadInput> & { sortOrder?: number },
): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb
    .from("crm_leads")
    .update(leadToRow(patch))
    .eq("id", id);
  if (error) console.error("[crm] updateLead failed", error);
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
): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;

  // Recompute sort order for the destination column after insertion
  const destOthers = allLeads
    .filter((l) => l.stage === toStage && l.id !== id)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  destOthers.splice(toIndex, 0, {
    ...allLeads.find((l) => l.id === id)!,
    stage: toStage,
  });

  // Renumber 0..n-1
  const updates = destOthers.map((l, idx) => ({
    id: l.id,
    sort_order: idx,
    stage: toStage,
  }));

  // Batch updates: Supabase JS doesn't expose multi-update via PK list cleanly,
  // so we issue parallel updates. Fine for typical kanban sizes.
  await Promise.all(
    updates.map((u) =>
      sb
        .from("crm_leads")
        .update({ sort_order: u.sort_order, stage: u.stage })
        .eq("id", u.id),
    ),
  );
}

// ─────────────────────────────────────────────────────────────
// Funnel glue — converter Lead Fechado em Cliente
// ─────────────────────────────────────────────────────────────

export async function convertToCliente(lead: Lead): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;

  // Se já tem cliente vinculado, só retorna o id existente
  if (lead.clienteId) return lead.clienteId;

  // INSERT em clientes
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

  // Criar rows vazias em diagnosticos e offer_books (espelha createCliente do store)
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

  // UPDATE lead.cliente_id
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
