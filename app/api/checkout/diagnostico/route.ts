import { NextResponse } from "next/server";

// Oferta de R$800 pausada desde set/2026 — não criar sessão no Stripe.
// Reativar quando decidido pelo Adriano.

export async function POST() {
  return NextResponse.json(
    { error: "Oferta indisponível" },
    { status: 410 },
  );
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
