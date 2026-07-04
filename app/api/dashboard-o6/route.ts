import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type DashboardData = {
  pipeline: {
    prospects: number;
    comDemo: number;
    diagnosticos: number;
    fechados: number;
  };
  clientesAtivos: number;
  intelligence: {
    ultimoBrief: string | null;
    scoreMedio: number | null;
    topOportunidades: { titulo: string; score: number }[];
  };
  fonte: "supabase" | "fallback";
};

const FALLBACK: DashboardData = {
  pipeline: { prospects: 0, comDemo: 0, diagnosticos: 0, fechados: 0 },
  clientesAtivos: 0,
  intelligence: { ultimoBrief: null, scoreMedio: null, topOportunidades: [] },
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

    const [prospectsRes, leadsRes, intelRes] = await Promise.all([
      sb.from("prospects").select("id, status, demo_url"),
      sb.from("crm_leads").select("id, stage, cliente_id"),
      sb
        .from("market_intelligence")
        .select("title, opportunity, opportunity_score, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    if (prospectsRes.error) console.error("[dashboard-o6] prospects query failed", prospectsRes.error);
    if (leadsRes.error) console.error("[dashboard-o6] crm_leads query failed", leadsRes.error);
    if (intelRes.error) console.error("[dashboard-o6] market_intelligence query failed", intelRes.error);

    const prospects = prospectsRes.data ?? [];
    const leads = leadsRes.data ?? [];
    const intel = intelRes.data ?? [];

    const comDemo = prospects.filter((p) => !!p.demo_url).length;
    const diagnosticos = leads.filter((l) =>
      ["Diagnóstico Agendado", "Diagnóstico Entregue", "Proposta", "Fechado"].includes(
        l.stage as string,
      ),
    ).length;
    const fechados = leads.filter((l) => l.stage === "Fechado").length;
    const clientesAtivos = new Set(
      leads.filter((l) => l.cliente_id).map((l) => l.cliente_id),
    ).size;

    const scores = intel
      .map((i) => i.opportunity_score)
      .filter((s): s is number => typeof s === "number");
    const scoreMedio =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : null;

    const topOportunidades = intel
      .filter((i) => typeof i.opportunity_score === "number")
      .sort((a, b) => (b.opportunity_score ?? 0) - (a.opportunity_score ?? 0))
      .slice(0, 3)
      .map((i) => ({
        titulo: (i.title as string) || (i.opportunity as string) || "Sem título",
        score: i.opportunity_score as number,
      }));

    const ultimoBrief = intel[0]?.created_at ?? null;

    const data: DashboardData = {
      pipeline: {
        prospects: prospects.length,
        comDemo,
        diagnosticos,
        fechados,
      },
      clientesAtivos,
      intelligence: {
        ultimoBrief,
        scoreMedio,
        topOportunidades,
      },
      fonte:
        prospectsRes.error && leadsRes.error && intelRes.error
          ? "fallback"
          : "supabase",
    };

    return NextResponse.json(data);
  } catch (err) {
    console.error("[dashboard-o6] fetch failed, using fallback", err);
    return NextResponse.json(FALLBACK);
  }
}
