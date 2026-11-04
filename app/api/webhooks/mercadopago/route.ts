import { NextRequest, NextResponse } from "next/server";
import {
  isPaidMercadoPagoPayment,
  retrieveMercadoPagoPayment,
  verifyWebhookSignature,
} from "@/app/_lib/diagnostico-express/mercadopago";
import { recordMercadoPagoPayment } from "@/app/_lib/diagnostico-express/orders";
import { notifyTelegram } from "@/app/_lib/telegram";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asId(value: unknown): string | null {
  if (typeof value === "string" && /^\d{1,20}$/.test(value)) return value;
  if (typeof value === "number" && Number.isSafeInteger(value) && value > 0) {
    return String(value);
  }
  return null;
}

export async function POST(req: NextRequest) {
  if (!process.env.MERCADOPAGO_WEBHOOK_SECRET) {
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

  const isPaymentEvent =
    payload.type === "payment" ||
    payload.action === "payment.created" ||
    payload.action === "payment.updated";
  if (!isPaymentEvent) {
    return NextResponse.json({ received: true });
  }

  const bodyId = asId(isRecord(payload.data) ? payload.data.id : null);
  const queryRaw = req.nextUrl.searchParams.get("data.id");
  const queryId = queryRaw === null ? null : asId(queryRaw);
  if (queryRaw !== null && queryId === null) {
    return NextResponse.json({ error: "data.id inválido" }, { status: 400 });
  }
  if (bodyId && queryId && bodyId !== queryId) {
    return NextResponse.json({ error: "data.id divergente" }, { status: 400 });
  }
  const paymentId = queryId ?? bodyId;
  if (!paymentId) {
    return NextResponse.json({ received: true });
  }

  const signatureOk = verifyWebhookSignature(
    req.headers.get("x-signature"),
    req.headers.get("x-request-id"),
    paymentId,
  );
  if (!signatureOk) {
    console.warn("[webhooks/mercadopago] assinatura inválida");
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
  }

  try {
    const payment = await retrieveMercadoPagoPayment(paymentId);

    if (payment.status !== "approved") {
      return NextResponse.json({ received: true, status: payment.status });
    }
    if (!isPaidMercadoPagoPayment(payment)) {
      console.warn(
        "[webhooks/mercadopago] pagamento aprovado fora do Diagnóstico Express, ignorado",
        paymentId,
      );
      return NextResponse.json({ received: true, ignored: "not_express" });
    }

    const { newlyPaid } = await recordMercadoPagoPayment(payment);

    if (newlyPaid) {
      void notifyTelegram(
        `<b>Pagamento Mercado Pago confirmado</b>\n\nValor: <b>R$ ${payment.transactionAmount.toFixed(2).replace(".", ",")}</b>\nE-mail: ${payment.payerEmail ?? "não informado"}\nAguardando preenchimento do intake.`,
      );
    }

    return NextResponse.json({ received: true, duplicate: !newlyPaid });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[webhooks/mercadopago]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
