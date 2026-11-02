import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, SupabaseAdminConfigurationError } from "@/app/_lib/supabase-admin";
import { isPaidDiagnosisCheckout, retrieveDiagnosisCheckout, StripeConfigurationError, StripeRequestError } from "@/app/_lib/diagnostico-express/stripe";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id") ?? "";
  if (!sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Sessão inválida" }, { status: 400 });
  }
  try {
    const checkout = await retrieveDiagnosisCheckout(sessionId);
    if (!isPaidDiagnosisCheckout(checkout)) {
      return NextResponse.json({ error: "Pagamento não confirmado" }, { status: 402 });
    }
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.from("diagnostico_express_runs")
      .select("id, status, approval_status, report_json")
      .eq("checkout_session_id", checkout.id).maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ submitted: false }, { headers: { "Cache-Control": "no-store" } });
    return NextResponse.json({
      submitted: true,
      id: data.id,
      status: data.status,
      reviewStatus: data.approval_status,
      ...(data.approval_status === "approved" ? { report: data.report_json } : {}),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    if (error instanceof StripeConfigurationError || error instanceof SupabaseAdminConfigurationError) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    console.error("[diagnostico/result]", message);
    return NextResponse.json({ error: "Não foi possível consultar o diagnóstico." }, { status: error instanceof StripeRequestError ? 502 : 500 });
  }
}

export async function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
