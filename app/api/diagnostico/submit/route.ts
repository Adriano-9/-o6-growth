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

  // Accept either paymentId (MP) or checkoutSessionId (legacy Stripe)
  const paymentId = (body as Record<string, unknown>).paymentId as string | undefined;
  const checkoutSessionId = body.checkoutSessionId;

  if (!paymentId && !checkoutSessionId) {
    return NextResponse.json(
      { error: "paymentId ou checkoutSessionId é obrigatório." },
      { status: 400 },
    );
  }

  // Mercado Pago flow
  if (paymentId) {
    let payment;
    try {
      payment = await retrieveMercadoPagoPayment(paymentId);
    } catch (error) {
      return (
        mpErrorResponse(error) ??
        NextResponse.json({ error: "Falha ao validar o pagamento." }, { status: 500 })
      );
    }

    if (!isPaidMercadoPagoPayment(payment)) {
      return NextResponse.json(
        { error: "Pagamento do Diagnóstico Express não confirmado." },
        { status: 402 },
      );
    }

    const checkoutId = `mp_${paymentId}`;

    try {
      const supabase = getSupabaseAdmin();

      // Dedup: check if already submitted for this payment
      const { data: existing, error: lookupError } = await supabase
        .from("diagnostico_express_runs")
        .select("id, status, approval_status, access_token")
        .eq("checkout_session_id", checkoutId)
        .maybeSingle();

      if (lookupError) {
        throw new Error(`Falha ao consultar diagnóstico: ${lookupError.message}`);
      }
      if (existing) {
        return NextResponse.json({
          id: existing.id,
          status: existing.status,
          reviewStatus: existing.approval_status,
          accessToken: existing.access_token,
          alreadySubmitted: true,
        });
      }

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

  // Legacy Stripe flow — kept but non-functional without STRIPE_SECRET_KEY
  return NextResponse.json(
    { error: "Stripe checkout desabilitado. Use Mercado Pago." },
    { status: 400 },
  );
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
