import "server-only";

import {
  DIAGNOSTICO_EXPRESS_PRICE_CENTS,
  DIAGNOSTICO_EXPRESS_PRODUCT,
  DIAGNOSTICO_EXPRESS_VERSION,
} from "./config";

type StripeCustomerDetails = {
  email: string | null;
  phone: string | null;
};

export type DiagnosisCheckoutSession = {
  id: string;
  url: string | null;
  status: "open" | "complete" | "expired" | null;
  paymentStatus: "paid" | "unpaid" | "no_payment_required";
  amountTotal: number;
  currency: string;
  paymentIntentId: string | null;
  customerDetails: StripeCustomerDetails;
  metadata: Record<string, string>;
};

export class StripeConfigurationError extends Error {}
export class StripeRequestError extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function parseSession(value: unknown): DiagnosisCheckoutSession {
  if (!isRecord(value) || typeof value.id !== "string") {
    throw new StripeRequestError("Resposta inválida do Stripe.");
  }

  const customer = isRecord(value.customer_details) ? value.customer_details : {};
  const metadataSource = isRecord(value.metadata) ? value.metadata : {};
  const metadata = Object.fromEntries(
    Object.entries(metadataSource).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
  const paymentStatus = value.payment_status;
  if (
    paymentStatus !== "paid" &&
    paymentStatus !== "unpaid" &&
    paymentStatus !== "no_payment_required"
  ) {
    throw new StripeRequestError("Status de pagamento inválido no Stripe.");
  }

  const status = value.status;
  return {
    id: value.id,
    url: optionalString(value.url),
    status:
      status === "open" || status === "complete" || status === "expired"
        ? status
        : null,
    paymentStatus,
    amountTotal:
      typeof value.amount_total === "number" ? value.amount_total : 0,
    currency:
      typeof value.currency === "string" ? value.currency.toLowerCase() : "brl",
    paymentIntentId: optionalString(value.payment_intent),
    customerDetails: {
      email: optionalString(customer.email),
      phone: optionalString(customer.phone),
    },
    metadata,
  };
}

function stripeSecret(): string {
  const value = process.env.STRIPE_SECRET_KEY;
  if (!value) {
    throw new StripeConfigurationError(
      "Checkout indisponível: STRIPE_SECRET_KEY não configurada.",
    );
  }
  return value;
}

async function parseStripeError(response: Response): Promise<string> {
  try {
    const value: unknown = await response.json();
    if (
      isRecord(value) &&
      isRecord(value.error) &&
      typeof value.error.message === "string"
    ) {
      return value.error.message;
    }
  } catch {
    // A mensagem pública abaixo evita vazar o corpo bruto da resposta.
  }
  return `Stripe respondeu com status ${response.status}.`;
}

export async function createDiagnosisCheckout(
  origin: string,
): Promise<DiagnosisCheckoutSession> {
  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set(
    "success_url",
    `${origin}/produto/diagnostico?session_id={CHECKOUT_SESSION_ID}#intake`,
  );
  form.set("cancel_url", `${origin}/produto/diagnostico?checkout=cancelado`);
  form.set("locale", "pt-BR");
  form.set("customer_creation", "always");
  form.set("phone_number_collection[enabled]", "true");
  form.set("automatic_payment_methods[enabled]", "true");
  form.set("metadata[produto]", DIAGNOSTICO_EXPRESS_PRODUCT);
  form.set("metadata[versao]", DIAGNOSTICO_EXPRESS_VERSION);
  form.set("line_items[0][price_data][currency]", "brl");
  form.set(
    "line_items[0][price_data][unit_amount]",
    String(DIAGNOSTICO_EXPRESS_PRICE_CENTS),
  );
  form.set(
    "line_items[0][price_data][product_data][name]",
    "Diagnóstico Express O6",
  );
  form.set(
    "line_items[0][price_data][product_data][description]",
    "Diagnóstico das cinco frentes comerciais, com notas, prioridades e revisão humana antes da entrega.",
  );
  form.set("line_items[0][quantity]", "1");

  let response: Response;
  try {
    response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecret()}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha de rede";
    throw new StripeRequestError(`Não foi possível acessar o Stripe: ${message}`);
  }

  if (!response.ok) {
    throw new StripeRequestError(await parseStripeError(response));
  }
  return parseSession(await response.json());
}

export async function retrieveDiagnosisCheckout(
  sessionId: string,
): Promise<DiagnosisCheckoutSession> {
  if (!/^cs_(test_|live_)?[A-Za-z0-9]+$/.test(sessionId)) {
    throw new StripeRequestError("Identificador de checkout inválido.");
  }

  let response: Response;
  try {
    response = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      { headers: { Authorization: `Bearer ${stripeSecret()}` } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha de rede";
    throw new StripeRequestError(`Não foi possível validar o pagamento: ${message}`);
  }

  if (!response.ok) {
    throw new StripeRequestError(await parseStripeError(response));
  }
  return parseSession(await response.json());
}

export function isPaidDiagnosisCheckout(
  session: DiagnosisCheckoutSession,
): boolean {
  return (
    session.paymentStatus === "paid" &&
    session.amountTotal === DIAGNOSTICO_EXPRESS_PRICE_CENTS &&
    session.currency === "brl" &&
    session.metadata.produto === DIAGNOSTICO_EXPRESS_PRODUCT
  );
}
