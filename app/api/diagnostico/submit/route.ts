import { NextRequest, NextResponse } from "next/server";
import { buildDiagnosisReport } from "@/app/_lib/diagnostico-completo/build-report";
import { formatFinalReport } from "@/app/_lib/diagnostico-completo/format-final-report";
import type { BuildDiagnosisReportInput } from "@/app/_lib/diagnostico-completo/build-report";

export const dynamic = "force-dynamic";

/**
 * POST /api/diagnostico/submit
 *
 * Recebe o payload do intake-form.html ({ clientContext, painEvidence,
 * interviewAnswers }) e roda buildDiagnosisReport() + formatFinalReport()
 * de verdade — mesma lógica usada em app/_lib/diagnostico-completo/__smoke__/
 * intake-server.mjs, só que como rota real de produção. Sem persistência:
 * o relatório é gerado e devolvido, nada é salvo em Supabase nesta versão.
 */
export async function POST(req: NextRequest) {
  let body: BuildDiagnosisReportInput;
  try {
    body = (await req.json()) as BuildDiagnosisReportInput;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body?.clientContext?.nomeNegocio) {
    return NextResponse.json(
      { error: "clientContext.nomeNegocio é obrigatório" },
      { status: 400 },
    );
  }
  if (!Array.isArray(body.painEvidence)) {
    return NextResponse.json(
      { error: "painEvidence deve ser um array" },
      { status: 400 },
    );
  }

  try {
    const report = buildDiagnosisReport(body);
    const markdown = formatFinalReport(report, body.clientContext.nomeNegocio);
    return NextResponse.json({ markdown, report });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("[diagnostico/submit]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
