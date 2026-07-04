import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type SummaryData = {
  mrr: number;
  clientesAtivos: number;
  projetosAtivos: number;
  agentesAtivos: number;
  health: "ok" | "degraded" | "down";
  fonte: "supabase" | "fallback";
};

const FALLBACK: SummaryData = {
  mrr: 0,
  clientesAtivos: 0,
  projetosAtivos: 0,
  agentesAtivos: 0,
  health: "down",
  fonte: "fallback",
};

// Agentes ativos hoje: Sales Agent (Claude Code) e Deploy Agent (Vercel)
// são acionados manualmente e contam como "ativos". Intelligence Agent e
// Intelligence Engine (VPS) ainda não têm execução automática — ver /os/agentes.
const AGENTES_ATIVOS_HARDCODED = 2;

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

    const [clientesRes, leadsRes] = await Promise.all([
      sb.from("clientes").select("id"),
      sb.from("crm_leads").select("id, cliente_id"),
    ]);

    if (clientesRes.error) console.error("[os/summary] clientes query failed", clientesRes.error);
    if (leadsRes.error) console.error("[os/summary] crm_leads query failed", leadsRes.error);

    const bothFailed = !!clientesRes.error && !!leadsRes.error;
    if (bothFailed) {
      return NextResponse.json(FALLBACK);
    }

    const clientes = clientesRes.data ?? [];
    const leads = leadsRes.data ?? [];
    const clientesAtivos = new Set(
      leads.filter((l) => l.cliente_id).map((l) => l.cliente_id),
    ).size;

    const data: SummaryData = {
      mrr: 0, // sem billing real ainda — hardcoded intencional
      clientesAtivos,
      projetosAtivos: clientes.length,
      agentesAtivos: AGENTES_ATIVOS_HARDCODED,
      health: "ok",
      fonte: "supabase",
    };

    return NextResponse.json(data);
  } catch (err) {
    console.error("[os/summary] fetch failed, using fallback", err);
    return NextResponse.json(FALLBACK);
  }
}
