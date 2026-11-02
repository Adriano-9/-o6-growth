import { NextRequest, NextResponse } from "next/server";
import {
  createDiagnosisCheckout,
  StripeConfigurationError,
  StripeRequestError,
} from "@/app/_lib/diagnostico-express/stripe";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const session = await createDiagnosisCheckout(req.nextUrl.origin);
    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe não retornou a URL de pagamento." },
        { status: 502 },
      );
    }
    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    if (error instanceof StripeConfigurationError) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    console.error("[checkout/diagnostico]", message);
    return NextResponse.json(
      { error: message },
      { status: error instanceof StripeRequestError ? 502 : 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
