import { NextRequest, NextResponse } from "next/server";
import {
  isPaidMercadoPagoPayment,
  MercadoPagoConfigurationError,
  MercadoPagoRequestError,
  retrieveMercadoPagoPayment,
} from "@/app/_lib/diagnostico-express/mercadopago";

// Stripe imports kept for future reactivation:
// import {
//   isPaidDiagnosisCheckout,
//   retrieveDiagnosisCheckout,
//   StripeConfigurationError,
//   StripeRequestError,
// } from "@/app/_lib/diagnostico-express/stripe";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Mercado Pago returns payment_id + status + preference_id as query params
  const paymentId = req.nextUrl.searchParams.get("payment_id") ?? "";
  const mpStatus = req.nextUrl.searchParams.get("status") ?? "";

  // Legacy Stripe support (session_id starting with cs_)
  const sessionId = req.nextUrl.searchParams.get("session_id") ?? "";
  if (sessionId.startsWith("cs_")) {
    return NextResponse.json(
      { error: "Stripe checkout desabilitado. Use Mercado Pago." },
      { status: 400 },
    );
  }

  if (!paymentId) {
    return NextResponse.json(
      { error: "payment_id é obrigatório" },
      { status: 400 },
    );
  }

  try {
    const payment = await retrieveMercadoPagoPayment(paymentId);
    const paid = isPaidMercadoPagoPayment(payment);

    return NextResponse.json({
      paid,
      email: payment.payerEmail,
      phone: payment.payerPhone,
      amountTotal: Math.round(payment.transactionAmount * 100),
      currency: payment.currencyId.toLowerCase(),
      paymentId: String(payment.id),
      status: payment.status,
      mpStatus,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    if (error instanceof MercadoPagoConfigurationError) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    console.error("[checkout/diagnostico/verify]", message);
    return NextResponse.json(
      { error: message },
      { status: error instanceof MercadoPagoRequestError ? 502 : 500 },
    );
  }
}

export async function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
