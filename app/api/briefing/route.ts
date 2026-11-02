import { NextRequest, NextResponse } from "next/server";
import { createLead } from "@/app/crm/_lib/api";
import { emptyLeadInput } from "@/app/crm/_lib/types";
import { notifyTelegram } from "@/app/_lib/telegram";

type Submission = {
  kind: "contact" | "briefing";
  email: string;
  service: string;
  name?: string;
  business?: string;
  objective?: string;
  reference?: string;
  deadline?: string;
  attribution?: Record<string, string>;
};

const attributionKeys = ["page", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSubmission(value: unknown): value is Submission {
  if (!isRecord(value)) return false;
  const attribution = value.attribution;
  if (
    (value.kind !== "contact" && value.kind !== "briefing") ||
    typeof value.email !== "string" ||
    !value.email.trim() ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim()) ||
    typeof value.service !== "string" ||
    !value.service.trim() ||
    !["name", "business", "objective", "reference", "deadline"].every(
      (key) => value[key] === undefined || typeof value[key] === "string",
    ) ||
    (attribution !== undefined &&
      (!isRecord(attribution) ||
        !attributionKeys.every((key) => attribution[key] === undefined || typeof attribution[key] === "string")))
  ) return false;
  return value.kind === "contact" || (
    typeof value.name === "string" && Boolean(value.name.trim()) &&
    typeof value.business === "string" && Boolean(value.business.trim()) &&
    typeof value.objective === "string" && Boolean(value.objective.trim())
  );
}

function clean(value: string | undefined, max: number): string {
  return (value ?? "").trim().slice(0, max);
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  if (!isSubmission(body)) {
    return NextResponse.json({ error: "Preencha os campos obrigatórios com dados válidos." }, { status: 400 });
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("[briefing] Supabase não configurado");
    return NextResponse.json({ error: "Serviço indisponível no momento." }, { status: 503 });
  }

  const email = clean(body.email, 254).toLowerCase();
  const service = clean(body.service, 120);
  const attribution = attributionKeys
    .map((key) => [key, clean(body.attribution?.[key], 120)] as const)
    .filter(([, value]) => value);
  const notes = [
    body.kind === "briefing" ? "Briefing de projeto pelo site O6" : "Solicitação de conversa pelo site O6 (contato inicial)",
    `Interesse: ${service}`,
    ...(body.kind === "briefing" ? [
      `Objetivo: ${clean(body.objective, 2000)}`,
      `Referências: ${clean(body.reference, 1000) || "Não informado"}`,
      `Prazo desejado: ${clean(body.deadline, 200) || "Não informado"}`,
    ] : []),
    ...attribution.map(([key, value]) => `${key}: ${value}`),
  ].join("\n");

  let lead;
  try {
    lead = await createLead({
      ...emptyLeadInput("Novo Lead"),
      email,
      nome: clean(body.name, 120),
      empresa: clean(body.business, 160),
      notas: notes,
      origem: body.kind === "briefing" ? "site_o6_briefing" : "site_o6_contato",
    });
  } catch (error) {
    console.error("[briefing] createLead failed", error);
    return NextResponse.json({ error: "Não conseguimos registrar sua solicitação. Tente novamente." }, { status: 502 });
  }
  if (!lead) {
    console.error("[briefing] createLead retornou null");
    return NextResponse.json({ error: "Não conseguimos registrar sua solicitação. Tente novamente." }, { status: 502 });
  }

  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    const notice = [
      `<b>${body.kind === "briefing" ? "Novo briefing" : "Novo contato"} O6</b>`,
      `Interesse: ${escapeHtml(service)}`,
      `Nome: ${escapeHtml(clean(body.name, 120) || "Não informado")}`,
      `Negócio: ${escapeHtml(clean(body.business, 160) || "Não informado")}`,
      `E-mail: ${escapeHtml(email)}`,
      `Origem: ${escapeHtml(attribution.map(([key, value]) => `${key}=${value}`).join(" | ") || "site O6")}`,
      "Detalhes no CRM.",
    ].join("\n");
    const notification = await notifyTelegram(notice);
    if (!notification.ok) console.warn("[briefing] Lead salvo, mas notificação não enviada");
  }

  return NextResponse.json({ id: lead.id }, { status: 201 });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
