import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { upsertDiagnosisOrder } from "@/app/_lib/diagnostico-express/orders";
import {
  isPaidDiagnosisCheckout,
  retrieveDiagnosisCheckout,
} from "@/app/_lib/diagnostico-express/stripe";
import { notifyTelegram } from "@/app/_lib/telegram";

export const dynamic = "force-dynamic";

function checkoutIdFromEvent(event: Stripe.Event): string | null {
  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded" &&
    event.type !== "checkout.session.expired"
  ) {
    return null;
  }
  return event.data.object.id;
}

export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    return NextResponse.json(
      { error: "Webhook Stripe não configurado" },
      { status: 503 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Assinatura ausente" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = await new Stripe(secretKey).webhooks.constructEventAsync(
      await req.text(),
      signature,
      webhookSecret,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Assinatura inválida";
    console.warn("[webhooks/stripe] signature rejected", message);
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  const sessionId = checkoutIdFromEvent(event);
  if (!sessionId) return NextResponse.json({ received: true });

  try {
    const checkout = await retrieveDiagnosisCheckout(sessionId);
    await upsertDiagnosisOrder(checkout);
    if (isPaidDiagnosisCheckout(checkout)) {
      void notifyTelegram(
        `<b>Pagamento do Diagnóstico Express confirmado</b>\n\nValor: <b>R$ 197,00</b>\nAguardando preenchimento do intake.`,
      );
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[webhooks/stripe]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
