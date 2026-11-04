import { NextRequest, NextResponse } from "next/server";
import {
  isPaidMercadoPagoPayment,
  retrieveMercadoPagoPayment,
  verifyWebhookSignature,
} from "@/app/_lib/diagnostico-express/mercadopago";
import { getSupabaseAdmin } from "@/app/_lib/supabase-admin";
import { notifyTelegram } from "@/app/_lib/telegram";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook Mercado Pago não configurado" },
      { status: 503 },
    );
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!isRecord(payload)) {
    return NextResponse.json({ received: true });
  }

  // Only handle payment notifications
  const action = payload.action;
  const type = payload.type;
  if (type !== "payment" && action !== "payment.created" && action !== "payment.updated") {
    return NextResponse.json({ received: true });
  }

  const dataObj = isRecord(payload.data) ? payload.data : {};
  const paymentId = typeof dataObj.id === "string"
    ? dataObj.id
    : typeof dataObj.id === "number"
      ? String(dataObj.id)
      : null;

  if (!paymentId) {
    return NextResponse.json({ received: true });
  }

  // Verify signature
  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");
  if (!verifyWebhookSignature(xSignature, xRequestId, paymentId)) {
    console.warn("[webhooks/mercadopago] signature verification failed");
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  try {
    const payment = await retrieveMercadoPagoPayment(paymentId);

    if (!isPaidMercadoPagoPayment(payment)) {
      return NextResponse.json({ received: true, status: payment.status });
    }

    // Upsert order
    const supabase = getSupabaseAdmin();
    const { error: upsertError } = await supabase
      .from("diagnostico_express_orders")
      .upsert(
        {
          checkout_session_id: `mp_${paymentId}`,
          payment_intent_id: null,
          customer_email: payment.payerEmail,
          customer_phone: payment.payerPhone,
          amount_total: Math.round(payment.transactionAmount * 100),
          currency: payment.currencyId.toLowerCase(),
          payment_status: "paid",
          metadata_json: payment.metadata,
          payment_provider: "mercadopago",
          mp_payment_id: paymentId,
          mp_preference_id: payment.externalReference,
        },
        { onConflict: "checkout_session_id" },
      );

    if (upsertError) {
      console.error("[webhooks/mercadopago] upsert failed", upsertError.message);
    }

    void notifyTelegram(
      `<b>Pagamento Mercado Pago confirmado</b>\n\nValor: <b>R$ ${payment.transactionAmount.toFixed(2).replace(".", ",")}</b>\nE-mail: ${payment.payerEmail ?? "não informado"}\nAguardando preenchimento do intake.`,
    );

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[webhooks/mercadopago]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
