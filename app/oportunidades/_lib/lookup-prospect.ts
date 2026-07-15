/**
 * Consulta única de prospect por nome de negócio — para o skill
 * outbound_sdr consultar dado real antes de gerar mensagem, em vez de
 * depender de input manual. NÃO é agente, NÃO orquestra nada: uma query
 * function testável isoladamente.
 *
 * Reusa getSupabase() (singleton) e os nomes de coluna reais já lidos em
 * produção por rowToProspect (app/oportunidades/_lib/types.ts) — nada de
 * nomes de coluna assumidos. Coluna do link de demo: `demo_url`
 * (migration 009). Score de auditoria: `audit_score` (migration 008).
 */
import { getSupabase } from "@/app/offer-book/_lib/supabase";

export type ProspectLookupResult =
  | { found: false; message: string }
  | {
      found: true;
      nome: string;
      telefone: string | null;
      demoUrl: string | null;
      demoDisponivel: boolean;
      /** Mensagem clara quando a demo ainda não foi gerada. */
      demoMessage: string | null;
      auditScore: number | null;
    };

/**
 * Busca um prospect pelo nome (case-insensitive, match parcial).
 * Retorna o primeiro match. Se houver mais de um, prioriza o mais
 * recentemente atualizado.
 */
export async function lookupProspectByName(
  businessName: string,
): Promise<ProspectLookupResult> {
  const term = businessName.trim();
  if (!term) {
    return { found: false, message: "Nome de negócio vazio — informe um nome para buscar." };
  }

  const sb = getSupabase();
  if (!sb) {
    return { found: false, message: "Supabase não configurado — não foi possível consultar." };
  }

  const { data, error } = await sb
    .from("prospects")
    .select("nome, telefone, demo_url, audit_score, updated_at")
    .ilike("nome", `%${term}%`)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("[lookup-prospect] query failed", error);
    return { found: false, message: `Erro ao consultar prospect: ${error.message}` };
  }

  if (!data || data.length === 0) {
    return { found: false, message: "Prospect não encontrado" };
  }

  const row = data[0] as Record<string, unknown>;
  const demoUrl = (row.demo_url as string | null) ?? null;
  const demoDisponivel = typeof demoUrl === "string" && demoUrl.trim().length > 0;

  return {
    found: true,
    nome: (row.nome as string) ?? term,
    telefone: (row.telefone as string | null) ?? null,
    demoUrl,
    demoDisponivel,
    demoMessage: demoDisponivel
      ? null
      : "Demo ainda não gerada para este prospect - rode o pipeline de audit primeiro",
    auditScore: row.audit_score != null ? Number(row.audit_score) : null,
  };
}
