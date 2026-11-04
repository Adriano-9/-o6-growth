import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, SupabaseAdminConfigurationError } from "@/app/_lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Primary: access_token (secure, gateway-agnostic)
  const accessToken = req.nextUrl.searchParams.get("token") ?? "";

  // Legacy: session_id (Stripe cs_*) — disabled
  const sessionId = req.nextUrl.searchParams.get("session_id") ?? "";

  if (!accessToken && !sessionId) {
    return NextResponse.json({ error: "token é obrigatório" }, { status: 400 });
  }

  try {
    const sb = getSupabaseAdmin();

    if (accessToken) {
      if (!/^[a-f0-9]{64}$/.test(accessToken)) {
        return NextResponse.json({ error: "Token inválido" }, { status: 400 });
      }

      const { data, error } = await sb
        .from("diagnostico_express_runs")
        .select("id, status, approval_status, report_json")
        .eq("access_token", accessToken)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return NextResponse.json(
          { submitted: false },
          { headers: { "Cache-Control": "no-store" } },
        );
      }

      return NextResponse.json(
        {
          submitted: true,
          id: data.id,
          status: data.status,
          reviewStatus: data.approval_status,
          ...(data.approval_status === "approved"
            ? { report: data.report_json }
            : {}),
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    // Legacy Stripe path
    if (sessionId.startsWith("cs_")) {
      return NextResponse.json(
        { error: "Stripe checkout desabilitado. Use o token de acesso." },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Parâmetro inválido" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    if (error instanceof SupabaseAdminConfigurationError) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    console.error("[diagnostico/result]", message);
    return NextResponse.json(
      { error: "Não foi possível consultar o diagnóstico." },
      { status: 500 },
    );
  }
}

export async function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
