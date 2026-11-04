import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { isExpressDiagnosisInput } from "@/app/_lib/diagnostico-express/fronts";
import { buildExpressReport, formatExpressReport } from "@/app/_lib/diagnostico-express/report";
import { DIAGNOSTICO_EXPRESS_VERSION } from "@/app/_lib/diagnostico-express/config";
import {
  completeDiagnosisOrder,
  upsertMercadoPagoOrder,
} from "@/app/_lib/diagnostico-express/orders";
import { qualifyDiagnosis } from "@/app/_lib/diagnostico-express/qualification";
import {
  isPaidMercadoPagoPayment,
  MercadoPagoConfigurationError,
  MercadoPagoRequestError,
  retrieveMercadoPagoPayment,
} from "@/app/_lib/diagnostico-express/mercadopago";
import { paymentMatchesReference } from "@/app/_lib/diagnostico-express/mercadopago-core";
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

function mpErrorResponse(error: unknown): NextResponse | null {
  const message = error instanceof Error ? error.message : "Erro desconhecido";
  if (error instanceof MercadoPagoConfigurationError) {
    return NextResponse.json({ error: message }, { status: 503 });
  }
  if (error instanceof MercadoPagoRequestError) {
    console.error("[diagnostico/submit] mercadopago", message);
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

  let payment;
  try {
    payment = await retrieveMercadoPagoPayment(body.paymentId);
  } catch (error) {
    return (
      mpErrorResponse(error) ??
      NextResponse.json({ error: "Falha ao validar o pagamento." }, { status: 500 })
    );
  }

  if (!paymentMatchesReference(payment, body.externalReference)) {
    return NextResponse.json(
      { error: "Este pagamento não corresponde à compra informada." },
      { status: 403 },
    );
  }

  if (!isPaidMercadoPagoPayment(payment)) {
    return NextResponse.json(
      { error: "Pagamento do Diagnóstico Express não confirmado." },
      { status: 402 },
    );
  }

  const checkoutId = `mp_${payment.id}`;

  try {
    const supabase = getSupabaseAdmin();

    const findExisting = async () => {
      const { data, error } = await supabase
        .from("diagnostico_express_runs")
        .select("id, status, approval_status, access_token")
        .eq("checkout_session_id", checkoutId)
        .maybeSingle();
      if (error) {
        throw new Error(`Falha ao consultar diagnóstico: ${error.message}`);
      }
      return data;
    };
    const alreadySubmitted = (existing: NonNullable<Awaited<ReturnType<typeof findExisting>>>) =>
      NextResponse.json({
        id: existing.id,
        status: existing.status,
        reviewStatus: existing.approval_status,
        accessToken: existing.access_token,
        alreadySubmitted: true,
      });

    const existing = await findExisting();
    if (existing) return alreadySubmitted(existing);

    const order = await upsertMercadoPagoOrder(payment);
    const report = buildExpressReport(body);
    const markdown = formatExpressReport(report);
    const qualification = qualifyDiagnosis(body, report);
    const runId = randomUUID();

    const { data: insertedRun, error: insertError } = await supabase
      .from("diagnostico_express_runs")
      .insert({
        id: runId,
        contact_name: body.contact.name.trim(),
        contact_email: body.contact.email.trim().toLowerCase(),
        contact_phone:
          body.contact.phone?.trim() || payment.payerPhone || null,
        business_name: body.business.name.trim(),
        segment: body.business.segment.trim(),
        input_json: body,
        report_json: report,
        report_markdown: markdown,
        consent: true,
        checkout_session_id: checkoutId,
        order_id: order.id,
        amount_paid: Math.round(payment.transactionAmount * 100),
        currency: payment.currencyId.toLowerCase(),
        qualification_score: qualification.score,
        qualification_json: qualification,
        recommended_offer: qualification.recommendedOffer,
        approval_status: "pending",
        method_version: DIAGNOSTICO_EXPRESS_VERSION,
        payment_gateway: "mercadopago",
      })
      .select("access_token")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        const winner = await findExisting();
        if (winner) return alreadySubmitted(winner);
      }
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
        amountPaid: Math.round(payment.transactionAmount * 100),
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
      accessToken: insertedRun?.access_token ?? null,
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
