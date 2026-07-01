import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

/**
 * POST /api/checkout/diagnostico
 *
 * Cria uma Stripe Checkout Session para o produto Diagnóstico O6 (R$ 800).
 *
 * Variáveis necessárias em .env.local:
 *   STRIPE_SECRET_KEY=sk_test_...     (ou sk_live_... em produção)
 *   STRIPE_DIAGNOSTICO_PRICE_ID=price_... (opcional — se ausente, usa price_data inline)
 *
 * Comportamento sem chaves: retorna 503 com mensagem clara.
 */
export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "Checkout indisponível: STRIPE_SECRET_KEY não configurada" },
      { status: 503 },
    );
  }

  const origin = req.nextUrl.origin;
  const priceId = process.env.STRIPE_DIAGNOSTICO_PRICE_ID;

  // Build the line_items: prefer price_id (configured product) over inline price_data
  const lineItem = priceId
    ? { price: priceId, quantity: 1 }
    : {
        price_data: {
          currency: "brl",
          unit_amount: 80000, // R$ 800,00 em centavos
          product_data: {
            name: "Diagnóstico O6 Growth",
            description:
              "Análise completa do funil de captação da sua clínica. Vídeo personalizado + plano de ação em 5 dias úteis.",
          },
        },
        quantity: 1,
      };

  // Stripe Checkout Session via raw fetch (sem SDK pra rota simples)
  const formBody = new URLSearchParams();
  formBody.append("mode", "payment");
  formBody.append("success_url", `${origin}/obrigado?tipo=diagnostico&session_id={CHECKOUT_SESSION_ID}`);
  formBody.append("cancel_url", `${origin}/produto/diagnostico`);
  formBody.append("locale", "pt-BR");
  formBody.append("billing_address_collection", "required");
  formBody.append("phone_number_collection[enabled]", "true");
  formBody.append("payment_method_types[0]", "card");
  formBody.append("metadata[produto]", "diagnostico");
  formBody.append("metadata[origin]", origin);

  if (priceId) {
    formBody.append("line_items[0][price]", priceId);
    formBody.append("line_items[0][quantity]", "1");
  } else {
    const pd = (lineItem as { price_data: { currency: string; unit_amount: number; product_data: { name: string; description: string } }; quantity: number }).price_data;
    formBody.append("line_items[0][price_data][currency]", pd.currency);
    formBody.append("line_items[0][price_data][unit_amount]", String(pd.unit_amount));
    formBody.append("line_items[0][price_data][product_data][name]", pd.product_data.name);
    formBody.append("line_items[0][price_data][product_data][description]", pd.product_data.description);
    formBody.append("line_items[0][quantity]", "1");
  }

  try {
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody.toString(),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("[checkout/diagnostico] stripe failed", res.status, txt.slice(0, 400));
      return NextResponse.json(
        { error: `Stripe ${res.status}: ${txt.slice(0, 200)}` },
        { status: 502 },
      );
    }

    const data = (await res.json()) as { url?: string; id?: string };
    if (!data.url) {
      return NextResponse.json({ error: "Stripe não retornou URL de checkout" }, { status: 502 });
    }

    return NextResponse.json({ url: data.url, sessionId: data.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("[checkout/diagnostico] error", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
