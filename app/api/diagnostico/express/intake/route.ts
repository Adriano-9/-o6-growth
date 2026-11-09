import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { buildDiagnosisReport } from "@/app/_lib/diagnostico-completo/build-report";
import { formatFinalReport } from "@/app/_lib/diagnostico-completo/format-final-report";
import type { PainEvidence } from "@/app/_lib/diagnostico-completo/types";
import { notifyTelegram } from "@/app/_lib/telegram";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/diagnostico/express/intake
 *
 * MVP do Diagnóstico Express (pagamento por link do Mercado Pago, conferido
 * à mão pelo Adriano). Recebe o formulário pós-pagamento, gera o rascunho
 * automático do relatório (uso interno, nunca mostrado ao cliente), grava em
 * diagnostico_express_runs (RLS: só INSERT público) e avisa no Telegram.
 */

type Intake = {
  nome: string;
  email: string;
  whatsapp: string;
  negocio: string;
  segmento: string;
  cidade?: string;
  instagram?: string;
  site?: string;
  canais: string[];
  tempoResposta: string;
  retomada: string;
  maiorDificuldade: string;
  operacaoMp?: string;
  consentimento: boolean;
};

const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function parse(body: unknown): Intake | string {
  if (!body || typeof body !== "object") return "Formulário inválido.";
  const b = body as Record<string, unknown>;
  const data: Intake = {
    nome: str(b.nome, 120),
    email: str(b.email, 160),
    whatsapp: str(b.whatsapp, 40),
    negocio: str(b.negocio, 160),
    segmento: str(b.segmento, 80),
    cidade: str(b.cidade, 80),
    instagram: str(b.instagram, 120),
    site: str(b.site, 200),
    canais: Array.isArray(b.canais) ? b.canais.map((c) => str(c, 40)).filter(Boolean).slice(0, 8) : [],
    tempoResposta: str(b.tempoResposta, 80),
    retomada: str(b.retomada, 120),
    maiorDificuldade: str(b.maiorDificuldade, 1500),
    operacaoMp: str(b.operacaoMp, 60),
    consentimento: b.consentimento === true,
  };
  if (!data.nome || !data.email || !data.whatsapp || !data.negocio || !data.segmento) return "Preencha nome, e-mail, WhatsApp, negócio e segmento.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return "E-mail inválido.";
  if (data.whatsapp.replace(/\D/g, "").length < 10) return "WhatsApp inválido. Use DDD + número.";
  if (!data.consentimento) return "É preciso autorizar o uso dos dados para fazer o diagnóstico.";
  return data;
}

export async function POST(req: NextRequest) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = parse(raw);
  if (typeof parsed === "string") return NextResponse.json({ error: parsed }, { status: 400 });
  const d = parsed;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ error: "Supabase não configurado" }, { status: 503 });

  // Rascunho automático (interno). Falha aqui não impede o registro.
  let reportJson: unknown = {};
  let reportMarkdown = "";
  try {
    const today = new Date().toISOString().slice(0, 10);
    const painEvidence: PainEvidence[] = [
      { canal: "WhatsApp", descricao: "tempo de resposta declarado", valorMedido: d.tempoResposta || "não informado", dataMedicao: today, fonte: "declarado_entrevista" },
    ];
    const report = buildDiagnosisReport({
      clientContext: { nomeNegocio: d.negocio, segmento: d.segmento, canaisAtendimento: d.canais.length ? d.canais : ["WhatsApp"] },
      painEvidence,
      interviewAnswers: { retomada: d.retomada, maior_dificuldade: d.maiorDificuldade, instagram: d.instagram ?? "", site: d.site ?? "" },
    });
    reportJson = report;
    reportMarkdown = formatFinalReport(report, d.negocio);
  } catch (err) {
    console.error("[express/intake] rascunho falhou", err instanceof Error ? err.message : err);
  }

  const sb = createClient(url, key, { auth: { persistSession: false } });
  const { error: insErr } = await sb.from("diagnostico_express_runs").insert({
    contact_name: d.nome,
    contact_email: d.email,
    contact_phone: d.whatsapp,
    business_name: d.negocio,
    segment: d.segmento,
    input_json: { ...d, payment_mode: "link_manual" },
    report_json: reportJson,
    report_markdown: reportMarkdown,
    status: "submitted",
    consent: true,
    payment_gateway: "mercadopago",
    method_version: "diagnostico-express-mvp-v1",
  });
  if (insErr) {
    console.error("[express/intake] insert falhou", insErr.message);
    return NextResponse.json({ error: "Não conseguimos registrar agora. Tente de novo ou fale no WhatsApp." }, { status: 502 });
  }

  const msg = [
    "Novo Diagnóstico Express",
    "",
    `Negócio: ${d.negocio} (${d.segmento}${d.cidade ? `, ${d.cidade}` : ""})`,
    `Contato: ${d.nome} · ${d.whatsapp} · ${d.email}`,
    d.instagram ? `Instagram: ${d.instagram}` : "",
    d.site ? `Site: ${d.site}` : "",
    `Operação Mercado Pago: ${d.operacaoMp || "não informada"}`,
    "",
    `Primeira resposta: ${d.tempoResposta || "-"}`,
    `Retomada: ${d.retomada || "-"}`,
    `Maior dificuldade: ${d.maiorDificuldade || "-"}`,
    "",
    "Confira o pagamento no Mercado Pago antes de entregar. Prazo: até 48h úteis.",
  ].filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n");
  await notifyTelegram(msg.slice(0, 3900));

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
