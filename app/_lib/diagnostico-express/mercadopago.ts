import "server-only";

import {
  DIAGNOSTICO_EXPRESS_PRICE_CENTS,
  DIAGNOSTICO_EXPRESS_PRODUCT,
  DIAGNOSTICO_EXPRESS_VERSION,
} from "./config";
import {
  isExpressPayment,
  newExternalReference,
  resolveNotificationUrl,
  verifyMercadoPagoSignature,
} from "./mercadopago-core";

export type MercadoPagoPreference = {
  id: string;
  externalReference: string;
  initPoint: string;
  sandboxInitPoint: string;
};

export type MercadoPagoPayment = {
  id: number;
  status: string;
  statusDetail: string;
  transactionAmount: number;
  currencyId: string;
  payerEmail: string | null;
  payerPhone: string | null;
  externalReference: string | null;
  metadata: Record<string, string>;
};

export class MercadoPagoConfigurationError extends Error {}
export class MercadoPagoRequestError extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function mpAccessToken(): string {
  const value = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!value) {
    throw new MercadoPagoConfigurationError(
      "Checkout indisponível: MERCADOPAGO_ACCESS_TOKEN não configurada.",
    );
  }
  return value;
}

export async function createDiagnosisPreference(
  origin: string,
): Promise<MercadoPagoPreference> {
  const externalReference = newExternalReference(DIAGNOSTICO_EXPRESS_PRODUCT);
  const notificationUrl = resolveNotificationUrl(
    origin,
    process.env.MERCADOPAGO_NOTIFICATION_BASE_URL,
  );
  if (!notificationUrl) {
    console.warn(
      "[mercadopago] notification_url omitida: origem local ou sem https. Defina MERCADOPAGO_NOTIFICATION_BASE_URL (tunel https) para testar webhook.",
    );
  }
  const body = {
    ...(notificationUrl ? { notification_url: notificationUrl } : {}),
    items: [
      {
        title: "Diagnóstico Express O6",
        description:
          "Diagnóstico das cinco frentes comerciais, com notas, prioridades e revisão humana antes da entrega.",
        quantity: 1,
        unit_price: DIAGNOSTICO_EXPRESS_PRICE_CENTS / 100,
        currency_id: "BRL",
      },
    ],
    back_urls: {
      success: `${origin}/produto/diagnostico?mp_status=approved`,
      failure: `${origin}/produto/diagnostico?mp_status=failure`,
      pending: `${origin}/produto/diagnostico?mp_status=pending`,
    },
    auto_return: "approved",
    external_reference: externalReference,
    metadata: {
      produto: DIAGNOSTICO_EXPRESS_PRODUCT,
      versao: DIAGNOSTICO_EXPRESS_VERSION,
    },
    payment_methods: {
      excluded_payment_types: [{ id: "ticket" }],
    },
    statement_descriptor: "O6 DIAGNOSTICO",
  };

  let response: Response;
  try {
    response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${mpAccessToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha de rede";
    throw new MercadoPagoRequestError(
      `Não foi possível acessar o Mercado Pago: ${message}`,
    );
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new MercadoPagoRequestError(
      `Mercado Pago respondeu com status ${response.status}: ${text.slice(0, 200)}`,
    );
  }

  const data: unknown = await response.json();
  if (
    !isRecord(data) ||
    typeof data.id !== "string" ||
    typeof data.init_point !== "string"
  ) {
    throw new MercadoPagoRequestError(
      "Resposta inválida do Mercado Pago ao criar preferência.",
    );
  }

  return {
    id: data.id,
    externalReference,
    initPoint: data.init_point,
    sandboxInitPoint:
      typeof data.sandbox_init_point === "string"
        ? data.sandbox_init_point
        : data.init_point,
  };
}

export async function retrieveMercadoPagoPayment(
  paymentId: string,
): Promise<MercadoPagoPayment> {
  if (!/^\d+$/.test(paymentId)) {
    throw new MercadoPagoRequestError("Identificador de pagamento inválido.");
  }

  let response: Response;
  try {
    response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: { Authorization: `Bearer ${mpAccessToken()}` },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha de rede";
    throw new MercadoPagoRequestError(
      `Não foi possível validar o pagamento: ${message}`,
    );
  }

  if (!response.ok) {
    throw new MercadoPagoRequestError(
      `Mercado Pago respondeu com status ${response.status}.`,
    );
  }

  const data: unknown = await response.json();
  if (!isRecord(data) || typeof data.id !== "number") {
    throw new MercadoPagoRequestError("Resposta inválida do Mercado Pago.");
  }

  const payer = isRecord(data.payer) ? data.payer : {};
  const phone = isRecord(payer.phone) ? payer.phone : {};
  const metadataRaw = isRecord(data.metadata) ? data.metadata : {};

  return {
    id: data.id,
    status: typeof data.status === "string" ? data.status : "unknown",
    statusDetail:
      typeof data.status_detail === "string" ? data.status_detail : "",
    transactionAmount:
      typeof data.transaction_amount === "number"
        ? data.transaction_amount
        : 0,
    currencyId:
      typeof data.currency_id === "string"
        ? data.currency_id.toUpperCase()
        : "BRL",
    payerEmail:
      typeof payer.email === "string" && payer.email.length > 0
        ? payer.email
        : null,
    payerPhone:
      typeof phone.number === "string" && phone.number.length > 0
        ? `${typeof phone.area_code === "string" ? phone.area_code : ""}${phone.number}`
        : null,
    externalReference:
      typeof data.external_reference === "string"
        ? data.external_reference
        : null,
    metadata: Object.fromEntries(
      Object.entries(metadataRaw).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    ),
  };
}

export function isPaidMercadoPagoPayment(
  payment: MercadoPagoPayment,
): boolean {
  return isExpressPayment(
    payment,
    DIAGNOSTICO_EXPRESS_PRODUCT,
    DIAGNOSTICO_EXPRESS_PRICE_CENTS,
  );
}

export function verifyWebhookSignature(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string,
): boolean {
  return verifyMercadoPagoSignature({
    secret: process.env.MERCADOPAGO_WEBHOOK_SECRET,
    xSignature,
    xRequestId,
    dataId,
  });
}
