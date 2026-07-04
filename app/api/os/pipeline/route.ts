import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// O6 OS pipeline stages (Manual Operacional v1):
//   Lead → Diagnóstico → Proposta → Fechamento → Onboarding → Retainer → Expansão
//
// Mapping from existing schema (app/crm/_lib/types.ts STAGES + prospects.status):
//   Lead        = prospects (status != Fechado) + crm_leads.stage in [Novo Lead, Contato Feito]
//   Diagnóstico = crm_leads.stage in [Diagnóstico Agendado, Diagnóstico Entregue]
//   Proposta    = crm_leads.stage = Proposta
//   Fechamento  = crm_leads.stage = Fechado
//   Onboarding, Retainer, Expansão = sem coluna própria ainda no schema atual.
//     Ficam em 0 até existir uma tabela/coluna de pós-venda (ver CLAUDE.md G7).

type StageCount = { estagio: string; total: number; real: boolean };

const FALLBACK: { stages: StageCount[]; fonte: "supabase" | "fallback" } = {
  stages: [
    { estagio: "Lead", total: 0, real: true },
    { estagio: "Diagnóstico", total: 0, real: true },
    { estagio: "Proposta", total: 0, real: true },
    { estagio: "Fechamento", total: 0, real: true },
    { estagio: "Onboarding", total: 0, real: false },
    { estagio: "Retainer", total: 0, real: false },
    { estagio: "Expansão", total: 0, real: false },
  ],
  fonte: "fallback",
};

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(FALLBACK);
  }

  try {
    const sb = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    const [prospectsRes, leadsRes] = await Promise.all([
      sb.from("prospects").select("id, status"),
      sb.from("crm_leads").select("id, stage"),
    ]);

    if (prospectsRes.error) console.error("[os/pipeline] prospects query failed", prospectsRes.error);
    if (leadsRes.error) console.error("[os/pipeline] crm_leads query failed", leadsRes.error);

    if (prospectsRes.error && leadsRes.error) {
      return NextResponse.json(FALLBACK);
    }

    const prospects = prospectsRes.data ?? [];
    const leads = leadsRes.data ?? [];

    const leadStage = leads.filter((l) =>
      ["Novo Lead", "Contato Feito"].includes(l.stage as string),
    ).length;
    const prospectsAsLead = prospects.filter((p) => p.status !== "Fechado").length;

    const diagnostico = leads.filter((l) =>
      ["Diagnóstico Agendado", "Diagnóstico Entregue"].includes(l.stage as string),
    ).length;
    const proposta = leads.filter((l) => l.stage === "Proposta").length;
    const fechamento = leads.filter((l) => l.stage === "Fechado").length;

    const stages: StageCount[] = [
      { estagio: "Lead", total: leadStage + prospectsAsLead, real: true },
      { estagio: "Diagnóstico", total: diagnostico, real: true },
      { estagio: "Proposta", total: proposta, real: true },
      { estagio: "Fechamento", total: fechamento, real: true },
      { estagio: "Onboarding", total: 0, real: false },
      { estagio: "Retainer", total: 0, real: false },
      { estagio: "Expansão", total: 0, real: false },
    ];

    return NextResponse.json({ stages, fonte: "supabase" as const });
  } catch (err) {
    console.error("[os/pipeline] fetch failed, using fallback", err);
    return NextResponse.json(FALLBACK);
  }
}
