import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { isExpressDiagnosisInput } from "@/app/_lib/diagnostico-express/fronts";
import { buildExpressReport, formatExpressReport } from "@/app/_lib/diagnostico-express/report";
import { DIAGNOSTICO_EXPRESS_VERSION } from "@/app/_lib/diagnostico-express/config";
import {
  completeDiagnosisOrder,
  upsertDiagnosisOrder,
} from "@/app/_lib/diagnostico-express/orders";
import { qualifyDiagnosis } from "@/app/_lib/diagnostico-express/qualification";
import {
  isPaidDiagnosisCheckout,
  retrieveDiagnosisCheckout,
  StripeConfigurationError,
  StripeRequestError,
} from "@/app/_lib/diagnostico-express/stripe";
import {
  formatDiagnosisPending,
  notifyTelegram,
} from "@/app/_lib/telegram";
import {
  getSupabaseAdmin,
  SupabaseAdminConfigurationError,
} from "@/app/_lib/supabase-admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function stripeErrorResponse(error: unknown): NextResponse | null {
  const message = error instanceof Error ? error.message : "Erro desconhecido";
  if (error instanceof StripeConfigurationError) {
    return NextResponse.json({ error: message }, { status: 503 });
  }
  if (error instanceof StripeRequestError) {
    console.error("[diagnostico/submit] stripe", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
  return null;
}

export async function POST(req: NextRequest) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!isExpressDiagnosisInput(raw)) {
    return NextResponse.json(
      {
        error:
          "Preencha pagamento, contato, negócio, as cinco frentes e consentimento.",
      },
      { status: 400 },
    );
  }
  const body = raw;

  let checkout;
  try {
    checkout = await retrieveDiagnosisCheckout(body.checkoutSessionId);
  } catch (error) {
    return (
      stripeErrorResponse(error) ??
      NextResponse.json({ error: "Falha ao validar o pagamento." }, { status: 500 })
    );
  }

  if (!isPaidDiagnosisCheckout(checkout)) {
    return NextResponse.json(
      { error: "Pagamento do Diagnóstico Express não confirmado." },
      { status: 402 },
    );
  }

  const paidEmail = checkout.customerDetails.email?.trim().toLowerCase();
  if (paidEmail && paidEmail !== body.contact.email.trim().toLowerCase()) {
    return NextResponse.json(
      { error: "Use o mesmo e-mail informado no pagamento." },
      { status: 400 },
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: existing, error: lookupError } = await supabase
      .from("diagnostico_express_runs")
      .select("id, status, approval_status")
      .eq("checkout_session_id", checkout.id)
      .maybeSingle();

    if (lookupError) {
      throw new Error(`Falha ao consultar diagnóstico: ${lookupError.message}`);
    }
    if (existing) {
      return NextResponse.json({
        id: existing.id,
        status: existing.status,
        reviewStatus: existing.approval_status,
        alreadySubmitted: true,
      });
    }

    const order = await upsertDiagnosisOrder(checkout);
    const report = buildExpressReport(body);
    const markdown = formatExpressReport(report);
    const qualification = qualifyDiagnosis(body, report);
    const runId = randomUUID();

    const { error: insertError } = await supabase
      .from("diagnostico_express_runs")
      .insert({
        id: runId,
        contact_name: body.contact.name.trim(),
        contact_email: body.contact.email.trim().toLowerCase(),
        contact_phone:
          body.contact.phone?.trim() || checkout.customerDetails.phone || null,
        business_name: body.business.name.trim(),
        segment: body.business.segment.trim(),
        input_json: body,
        report_json: report,
        report_markdown: markdown,
        consent: true,
        checkout_session_id: checkout.id,
        order_id: order.id,
        amount_paid: checkout.amountTotal,
        currency: checkout.currency,
        qualification_score: qualification.score,
        qualification_json: qualification,
        recommended_offer: qualification.recommendedOffer,
        approval_status: "pending",
        method_version: DIAGNOSTICO_EXPRESS_VERSION,
      });

    if (insertError) {
      throw new Error(`Não foi possível salvar o diagnóstico: ${insertError.message}`);
    }
    await completeDiagnosisOrder(order.id, runId);

    const telegram = await notifyTelegram(
      formatDiagnosisPending({
        businessName: body.business.name,
        contactName: body.contact.name,
        segment: body.business.segment,
        score: qualification.score,
        recommendedOffer: qualification.recommendedOffer,
        amountPaid: checkout.amountTotal,
      }),
      {
        inlineKeyboard: [
          [
            { text: "Aprovar para CRM", callbackData: `diag:approve:${runId}` },
            { text: "Rejeitar", callbackData: `diag:reject:${runId}` },
          ],
        ],
      },
    );

    if (telegram.ok) {
      const { error: telegramUpdateError } = await supabase
        .from("diagnostico_express_runs")
        .update({ telegram_message_id: telegram.messageId })
        .eq("id", runId);
      if (telegramUpdateError) {
        console.warn(
          "[diagnostico/submit] telegram message id not persisted",
          telegramUpdateError.message,
        );
      }
    }

    return NextResponse.json({
      id: runId,
      status: "submitted",
      reviewStatus: "pending",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    if (error instanceof SupabaseAdminConfigurationError) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    console.error("[diagnostico/submit]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
