import { getSupabase } from "@/app/offer-book/_lib/supabase";
import {
  Prospect,
  ProspectInput,
  ProspectStatus,
  prospectToRow,
  rowToProspect,
} from "./types";

export type ProspectFilters = {
  status?: ProspectStatus | "Todos";
  cidade?: string;
  categoria?: string;
  search?: string;
  orderBy?: "google_rating" | "google_reviews" | "created_at";
};

export async function listProspects(
  filters: ProspectFilters = {},
): Promise<Prospect[]> {
  const sb = getSupabase();
  if (!sb) return [];

  let query = sb.from("prospects").select("*");

  if (filters.status && filters.status !== "Todos") {
    query = query.eq("status", filters.status);
  }
  if (filters.cidade) {
    query = query.eq("cidade", filters.cidade);
  }
  if (filters.categoria) {
    query = query.eq("categoria", filters.categoria);
  }

  const orderCol = filters.orderBy ?? "updated_at";
  query = query.order(orderCol, { ascending: false });

  const { data, error } = await query;
  if (error || !data) {
    console.error("[oportunidades] listProspects failed", error);
    return [];
  }

  let results = (data as Record<string, unknown>[]).map(rowToProspect);

  // client-side text search (runs after fetch — ok for < 5k rows)
  if (filters.search) {
    const term = filters.search.toLowerCase();
    results = results.filter(
      (p) =>
        p.nome.toLowerCase().includes(term) ||
        p.site.toLowerCase().includes(term) ||
        p.cidade.toLowerCase().includes(term) ||
        p.categoria.toLowerCase().includes(term),
    );
  }

  return results;
}

export async function createProspect(
  input: ProspectInput,
): Promise<Prospect | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from("prospects")
    .insert(prospectToRow(input))
    .select("*")
    .single();

  if (error || !data) {
    console.error("[oportunidades] createProspect failed", error);
    return null;
  }
  return rowToProspect(data as Record<string, unknown>);
}

export async function updateProspect(
  id: string,
  patch: Partial<ProspectInput>,
): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb
    .from("prospects")
    .update(prospectToRow(patch))
    .eq("id", id);
  if (error) console.error("[oportunidades] updateProspect failed", error);
}

export async function updateStatus(
  id: string,
  status: ProspectStatus,
): Promise<void> {
  return updateProspect(id, { status });
}

export async function deleteProspect(id: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.from("prospects").delete().eq("id", id);
  if (error) console.error("[oportunidades] deleteProspect failed", error);
}

// Returns unique cidade values for filter dropdown
export async function listCidades(): Promise<string[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("prospects")
    .select("cidade")
    .order("cidade", { ascending: true });
  if (!data) return [];
  const unique = [
    ...new Set(
      (data as { cidade: string }[])
        .map((r) => r.cidade)
        .filter(Boolean),
    ),
  ];
  return unique;
}

// Returns unique categoria values for filter dropdown
export async function listCategorias(): Promise<string[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("prospects")
    .select("categoria")
    .order("categoria", { ascending: true });
  if (!data) return [];
  const unique = [
    ...new Set(
      (data as { categoria: string }[])
        .map((r) => r.categoria)
        .filter(Boolean),
    ),
  ];
  return unique;
}

// ─────────────────────────────────────────────────────────────
// Batch import with deduplication via google_place_id, site, telefone
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// Funnel glue — promoção para CRM
// ─────────────────────────────────────────────────────────────

export async function promoteToCRM(prospect: Prospect): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;

  // INSERT em crm_leads com dados do prospect
  const { data: inserted, error: insertErr } = await sb
    .from("crm_leads")
    .insert({
      empresa: prospect.nome,
      whatsapp: prospect.telefone,
      email: "",                       // prospect não tem email; campo livre no CRM
      nicho: prospect.categoria,
      cidade: prospect.cidade,
      score: 0,                        // operador preenche depois
      stage: "Novo Lead",
      valor: 0,
      data: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insertErr || !inserted) {
    console.error("[oportunidades] promoteToCRM insert failed", insertErr);
    return null;
  }

  // UPDATE prospect.status para sinalizar promoção
  await sb
    .from("prospects")
    .update({ status: "Contato Enviado" })
    .eq("id", prospect.id);

  return inserted.id as string;
}

export type BatchImportResult = {
  imported: number;
  skipped: number;
  errors: number;
};

export async function batchCreateProspects(
  inputs: ProspectInput[],
  onProgress?: (done: number, total: number) => void,
): Promise<BatchImportResult> {
  const sb = getSupabase();
  if (!sb || inputs.length === 0) {
    return { imported: 0, skipped: 0, errors: 0 };
  }

  // 1. Collect candidate keys for deduplication
  const placeIds = inputs.map((i) => i.googlePlaceId).filter((v): v is string => Boolean(v));
  const sites = inputs.map((i) => i.site).filter((v): v is string => v.length > 5);
  const phones = inputs.map((i) => i.telefone).filter((v): v is string => Boolean(v));

  // 2. Query all three keys in parallel
  const [byPlaceId, bySite, byPhone] = await Promise.all([
    placeIds.length > 0
      ? sb.from("prospects").select("google_place_id").in("google_place_id", placeIds)
      : Promise.resolve({ data: [] }),
    sites.length > 0
      ? sb.from("prospects").select("site").in("site", sites)
      : Promise.resolve({ data: [] }),
    phones.length > 0
      ? sb.from("prospects").select("telefone").in("telefone", phones)
      : Promise.resolve({ data: [] }),
  ]);

  const existingPlaceIds = new Set(
    ((byPlaceId.data ?? []) as { google_place_id: string }[]).map((r) => r.google_place_id),
  );
  const existingSites = new Set(
    ((bySite.data ?? []) as { site: string }[]).map((r) => r.site),
  );
  const existingPhones = new Set(
    ((byPhone.data ?? []) as { telefone: string }[]).map((r) => r.telefone),
  );

  // 3. Filter out DB duplicates AND deduplicate within the incoming batch
  const seenPlaceIds = new Set<string>();
  const seenSites = new Set<string>();
  const seenPhones = new Set<string>();

  const toInsert = inputs.filter((i) => {
    if (i.googlePlaceId && (existingPlaceIds.has(i.googlePlaceId) || seenPlaceIds.has(i.googlePlaceId))) return false;
    if (i.site && i.site.length > 5 && (existingSites.has(i.site) || seenSites.has(i.site))) return false;
    if (i.telefone && (existingPhones.has(i.telefone) || seenPhones.has(i.telefone))) return false;

    if (i.googlePlaceId) seenPlaceIds.add(i.googlePlaceId);
    if (i.site && i.site.length > 5) seenSites.add(i.site);
    if (i.telefone) seenPhones.add(i.telefone);
    return true;
  });

  const skipped = inputs.length - toInsert.length;

  if (toInsert.length === 0) {
    return { imported: 0, skipped, errors: 0 };
  }

  // 4. Insert in chunks of 50 (Supabase payload limit safety)
  const CHUNK = 50;
  let imported = 0;
  let errors = 0;

  for (let i = 0; i < toInsert.length; i += CHUNK) {
    const chunk = toInsert.slice(i, i + CHUNK);
    const { error } = await sb
      .from("prospects")
      .insert(chunk.map(prospectToRow));

    if (error) {
      console.error("[oportunidades] batchCreate chunk error", error);
      errors += chunk.length;
    } else {
      imported += chunk.length;
    }

    onProgress?.(Math.min(i + CHUNK, toInsert.length), toInsert.length);
  }

  return { imported, skipped, errors };
}
