import { NextRequest, NextResponse } from "next/server";
import {
  isPaidDiagnosisCheckout,
  retrieveDiagnosisCheckout,
  StripeConfigurationError,
  StripeRequestError,
} from "@/app/_lib/diagnostico-express/stripe";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id") ?? "";
  if (!sessionId) {
    return NextResponse.json(
      { error: "session_id é obrigatório" },
      { status: 400 },
    );
  }

  try {
    const session = await retrieveDiagnosisCheckout(sessionId);
    return NextResponse.json({
      paid: isPaidDiagnosisCheckout(session),
      email: session.customerDetails.email,
      phone: session.customerDetails.phone,
      amountTotal: session.amountTotal,
      currency: session.currency,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    if (error instanceof StripeConfigurationError) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    console.error("[checkout/diagnostico/verify]", message);
    return NextResponse.json(
      { error: message },
      { status: error instanceof StripeRequestError ? 502 : 500 },
    );
  }
}

export async function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
