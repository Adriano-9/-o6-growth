import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/offer-book/_lib/supabase";
import { createLead } from "@/app/crm/_lib/api";
import { emptyLeadInput } from "@/app/crm/_lib/types";
import { createMeeting } from "@/app/agenda/_lib/api";
import {
  emptyMeetingInput,
  rowToMeeting,
} from "@/app/agenda/_lib/types";
import { isSlotAvailable } from "@/app/agenda/_lib/slots";
import {
  formatSlotLabel,
  isConfiguredSlot,
  O6_TIMEZONE,
  slotEndISO,
} from "../_lib/availability";

type BookingInput = {
  nome: string;
  telefone: string;
  email?: string | null;
  empresa?: string | null;
  resumo?: string | null;
  pontos?: number | null;
  startsAt: string;
};

function authorized(req: NextRequest): boolean {
  const secret = process.env.O6_WEBHOOK_SECRET;
  return Boolean(secret && req.headers.get("x-o6-secret") === secret);
}

function validBody(value: unknown): value is BookingInput {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.nome === "string" &&
    v.nome.trim().length > 0 &&
    typeof v.telefone === "string" &&
    v.telefone.trim().length > 0 &&
    typeof v.startsAt === "string" &&
    v.startsAt.trim().length > 0 &&
    (v.email === undefined || v.email === null || typeof v.email === "string") &&
    (v.empresa === undefined ||
      v.empresa === null ||
      typeof v.empresa === "string") &&
    (v.resumo === undefined ||
      v.resumo === null ||
      typeof v.resumo === "string") &&
    (v.pontos === undefined ||
      v.pontos === null ||
      (typeof v.pontos === "number" && Number.isFinite(v.pontos)))
  );
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!validBody(body)) {
    return NextResponse.json(
      {
        error:
          "Payload inválido — esperado nome, telefone e startsAt; email, empresa, resumo e pontos são opcionais.",
      },
      { status: 400 },
    );
  }

  const startsAt = new Date(body.startsAt);
  if (
    Number.isNaN(startsAt.getTime()) ||
    startsAt.getTime() <= Date.now() ||
    !isConfiguredSlot(startsAt)
  ) {
    return NextResponse.json(
      { error: "Horário inválido ou fora da disponibilidade comercial" },
      { status: 400 },
    );
  }

  const endsAt = new Date(slotEndISO(startsAt.toISOString()));
  const sb = getSupabase();
  if (!sb) {
    return NextResponse.json(
      { error: "Supabase não configurado" },
      { status: 503 },
    );
  }

  const windowStart = new Date(startsAt.getTime() - 60 * 60 * 1000).toISOString();
  const windowEnd = new Date(endsAt.getTime() + 60 * 60 * 1000).toISOString();

  const { data: rows, error: meetingsErr } = await sb
    .from("meetings")
    .select("*")
    .gte("starts_at", windowStart)
    .lte("starts_at", windowEnd);

  if (meetingsErr) {
    console.error("[agenda/book] meetings read failed", meetingsErr);
    return NextResponse.json(
      { error: "Falha ao verificar disponibilidade" },
      { status: 502 },
    );
  }

  const meetings = (rows ?? []).map((row) =>
    rowToMeeting(row as Record<string, unknown>),
  );

  if (!isSlotAvailable(startsAt, endsAt, meetings)) {
    return NextResponse.json(
      { error: "Este horário acabou de ficar indisponível" },
      { status: 409 },
    );
  }

  const score = Math.max(
    0,
    Math.min(100, Math.round(body.pontos ?? 0)),
  );
  const empresa = body.empresa?.trim() ?? "";
  const resumo = body.resumo?.trim() ?? "";

  const lead = await createLead({
    ...emptyLeadInput("Diagnóstico Agendado"),
    empresa,
    nome: body.nome.trim(),
    whatsapp: body.telefone.trim(),
    email: body.email?.trim() ?? "",
    score,
    notas: resumo,
    proximaAcao: "Realizar reunião de diagnóstico",
    dataProximaAcao: startsAt.toISOString(),
    origem: "gptmaker_sofia_agendamento",
  });

  if (!lead) {
    return NextResponse.json(
      { error: "Falha ao criar ou atualizar lead" },
      { status: 502 },
    );
  }

  const meetingInput = {
    ...emptyMeetingInput(startsAt.toISOString()),
    crmLeadId: lead.id,
    titulo: `Diagnóstico — ${empresa || body.nome.trim()}`,
    contatoNome: body.nome.trim(),
    contatoEmail: body.email?.trim() ?? "",
    contatoWhatsapp: body.telefone.trim(),
    notes: resumo,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    status: "Agendada" as const,
  };

  const meeting = await createMeeting(meetingInput);
  if (!meeting) {
    return NextResponse.json(
      {
        error:
          "Lead salvo, mas a reunião não foi criada. Verifique a Agenda O6 antes de confirmar ao lead.",
        leadId: lead.id,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    leadId: lead.id,
    meetingId: meeting.id,
    startsAt: meeting.startsAt,
    endsAt: meeting.endsAt,
    label: formatSlotLabel(meeting.startsAt),
    timezone: O6_TIMEZONE,
    status: meeting.status,
  });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
