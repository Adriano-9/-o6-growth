import { NextRequest, NextResponse } from "next/server";
import { createLead } from "@/app/crm/_lib/api";
import { emptyLeadInput } from "@/app/crm/_lib/types";
import {
  answerTelegramCallback,
  editTelegramMessage,
  formatDiagnosisPending,
} from "@/app/_lib/telegram";
import { getSupabaseAdmin } from "@/app/_lib/supabase-admin";

export const dynamic = "force-dynamic";

type DiagnosisAction = "approve" | "reject";

type TelegramCallback = {
  id: string;
  data: string;
  from: { id: number; username?: string };
  message: { message_id: number; chat: { id: number } };
};

type DiagnosisRunRow = {
  id: string;
  approval_status: "pending" | "approved" | "rejected";
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  business_name: string;
  segment: string;
  qualification_score: number | null;
  recommended_offer: string | null;
  report_json: unknown;
  amount_paid: number | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readCallback(value: unknown): TelegramCallback | null {
  if (!isRecord(value) || !isRecord(value.callback_query)) return null;
  const callback = value.callback_query;
  if (
    typeof callback.id !== "string" ||
    typeof callback.data !== "string" ||
    !isRecord(callback.from) ||
    typeof callback.from.id !== "number" ||
    !isRecord(callback.message) ||
    typeof callback.message.message_id !== "number" ||
    !isRecord(callback.message.chat) ||
    typeof callback.message.chat.id !== "number"
  ) {
    return null;
  }
  return {
    id: callback.id,
    data: callback.data,
    from: {
      id: callback.from.id,
      username:
        typeof callback.from.username === "string"
          ? callback.from.username
          : undefined,
    },
    message: {
      message_id: callback.message.message_id,
      chat: { id: callback.message.chat.id },
    },
  };
}

function parseAction(data: string): { action: DiagnosisAction; id: string } | null {
  const match = data.match(
    /^diag:(approve|reject):([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i,
  );
  if (!match) return null;
  return { action: match[1] as DiagnosisAction, id: match[2] };
}

function reportSummary(value: unknown): string {
  return isRecord(value) && typeof value.resumoExecutivo === "string"
    ? value.resumoExecutivo
    : "Resumo indisponível.";
}

function decisionMessage(row: DiagnosisRunRow, decision: string): string {
  return `${formatDiagnosisPending({
    businessName: row.business_name,
    contactName: row.contact_name,
    segment: row.segment,
    score: row.qualification_score ?? 0,
    recommendedOffer: row.recommended_offer ?? "revisao_manual",
    amountPaid: row.amount_paid ?? 0,
  })}\n\n<b>Decisão:</b> ${decision}`;
}

export async function POST(req: NextRequest) {
  const expectedSecret = process.env.O6_WEBHOOK_SECRET;
  const expectedChatId = process.env.TELEGRAM_CHAT_ID;
  if (!expectedSecret || !expectedChatId) {
    return NextResponse.json(
      { error: "Webhook Telegram não configurado" },
      { status: 503 },
    );
  }
  if (req.headers.get("x-telegram-bot-api-secret-token") !== expectedSecret) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const callback = readCallback(payload);
  if (!callback) return NextResponse.json({ received: true });
  if (String(callback.message.chat.id) !== expectedChatId) {
    return NextResponse.json({ error: "Chat não autorizado" }, { status: 403 });
  }

  const parsed = parseAction(callback.data);
  if (!parsed) {
    await answerTelegramCallback(callback.id, "Ação inválida.");
    return NextResponse.json({ received: true });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("diagnostico_express_runs")
      .select(
        "id, approval_status, contact_name, contact_email, contact_phone, business_name, segment, qualification_score, recommended_offer, report_json, amount_paid",
      )
      .eq("id", parsed.id)
      .single();
    if (error || !data) {
      await answerTelegramCallback(callback.id, "Diagnóstico não encontrado.");
      return NextResponse.json({ error: "Diagnóstico não encontrado" }, { status: 404 });
    }
    const row = data as DiagnosisRunRow;

    if (row.approval_status !== "pending") {
      await answerTelegramCallback(
        callback.id,
        `Diagnóstico já está ${row.approval_status}.`,
      );
      return NextResponse.json({ received: true });
    }

    const approvedBy = callback.from.username
      ? `@${callback.from.username}`
      : String(callback.from.id);

    if (parsed.action === "reject") {
      const { error: rejectError } = await supabase
        .from("diagnostico_express_runs")
        .update({
          approval_status: "rejected",
          approved_at: new Date().toISOString(),
          approved_by: approvedBy,
        })
        .eq("id", row.id)
        .eq("approval_status", "pending");
      if (rejectError) throw rejectError;

      await Promise.all([
        answerTelegramCallback(callback.id, "Diagnóstico rejeitado."),
        editTelegramMessage(
          String(callback.message.chat.id),
          callback.message.message_id,
          decisionMessage(row, `Rejeitado por ${approvedBy}.`),
        ),
      ]);
      return NextResponse.json({ received: true, decision: "rejected" });
    }

    const lead = await createLead({
      ...emptyLeadInput("Diagnóstico Entregue"),
      empresa: row.business_name,
      nome: row.contact_name,
      whatsapp: row.contact_phone ?? "",
      email: row.contact_email,
      nicho: row.segment,
      score: row.qualification_score ?? 0,
      valor: (row.amount_paid ?? 0) / 100,
      responsavel: "Adriano",
      proximaAcao: `Revisar ${row.recommended_offer ?? "recomendação"} e agendar conversa`,
      notas: `Comprador do Diagnóstico Express. ${reportSummary(row.report_json)}`,
      statusPagamento: "pago",
      origem: "diagnostico_express",
    });
    if (!lead) throw new Error("Não foi possível promover o comprador ao CRM.");

    const { error: approveError } = await supabase
      .from("diagnostico_express_runs")
      .update({
        approval_status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: approvedBy,
        crm_lead_id: lead.id,
      })
      .eq("id", row.id)
      .eq("approval_status", "pending");
    if (approveError) throw approveError;

    await Promise.all([
      answerTelegramCallback(callback.id, "Aprovado e promovido ao CRM."),
      editTelegramMessage(
        String(callback.message.chat.id),
        callback.message.message_id,
        decisionMessage(row, `Aprovado por ${approvedBy}. Lead criado no CRM.`),
      ),
    ]);
    return NextResponse.json({ received: true, decision: "approved" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[telegram/webhook]", message);
    await answerTelegramCallback(callback.id, "Falha ao processar. Tente novamente.");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
