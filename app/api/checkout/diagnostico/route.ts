import { NextRequest, NextResponse } from "next/server";
import {
  createDiagnosisPreference,
  MercadoPagoConfigurationError,
  MercadoPagoRequestError,
} from "@/app/_lib/diagnostico-express/mercadopago";

// Stripe imports kept for future reactivation:
// import {
//   createDiagnosisCheckout,
//   StripeConfigurationError,
//   StripeRequestError,
// } from "@/app/_lib/diagnostico-express/stripe";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const preference = await createDiagnosisPreference(req.nextUrl.origin);

    // Use sandbox URL in test mode, production URL otherwise
    const isSandbox = (process.env.MERCADOPAGO_ACCESS_TOKEN ?? "").startsWith(
      "TEST-",
    );
    const url = isSandbox ? preference.sandboxInitPoint : preference.initPoint;

    return NextResponse.json({
      url,
      sessionId: `mp_${preference.id}`,
      provider: "mercadopago",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    if (error instanceof MercadoPagoConfigurationError) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    console.error("[checkout/diagnostico]", message);
    return NextResponse.json(
      { error: message },
      { status: error instanceof MercadoPagoRequestError ? 502 : 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
