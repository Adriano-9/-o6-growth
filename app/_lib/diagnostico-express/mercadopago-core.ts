import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export type PaymentLike = {
  status: string;
  transactionAmount: number;
  currencyId: string;
  externalReference: string | null;
  metadata: Record<string, string>;
};

export function newExternalReference(product: string): string {
  return `${product}:${randomUUID()}`;
}

const EXTERNAL_REFERENCE_UUID =
  /^[a-z0-9_]+:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function isValidExternalReference(
  value: unknown,
  product: string,
): value is string {
  return (
    typeof value === "string" &&
    value.length <= 80 &&
    value.startsWith(`${product}:`) &&
    EXTERNAL_REFERENCE_UUID.test(value)
  );
}

export function isExpressPayment(
  payment: PaymentLike,
  product: string,
  priceCents: number,
): boolean {
  return (
    payment.status === "approved" &&
    payment.currencyId === "BRL" &&
    Math.round(payment.transactionAmount * 100) === priceCents &&
    isValidExternalReference(payment.externalReference, product) &&
    payment.metadata.produto === product
  );
}

export function paymentMatchesReference(
  payment: PaymentLike,
  externalReference: unknown,
): boolean {
  return (
    typeof externalReference === "string" &&
    payment.externalReference !== null &&
    externalReference === payment.externalReference
  );
}

export function resolveNotificationUrl(
  origin: string,
  override?: string,
): string | null {
  let url: URL;
  try {
    url = new URL(override?.trim() || origin);
  } catch {
    return null;
  }
  const host = url.hostname;
  const isLocal =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "[::1]" ||
    host.endsWith(".localhost");
  if (isLocal || url.protocol !== "https:") return null;
  return `${url.origin}/api/webhooks/mercadopago`;
}

export function parseSignatureHeader(
  header: string,
): { ts: string; v1: string } | null {
  const parts: Record<string, string> = {};
  for (const part of header.split(",")) {
    const index = part.indexOf("=");
    if (index <= 0) continue;
    parts[part.slice(0, index).trim()] = part.slice(index + 1).trim();
  }
  if (!parts.ts || !parts.v1) return null;
  return { ts: parts.ts, v1: parts.v1 };
}

export function verifyMercadoPagoSignature(input: {
  secret: string | undefined;
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string;
}): boolean {
  const { secret, xSignature, xRequestId, dataId } = input;
  if (!secret || !xSignature || !xRequestId) return false;

  const parsed = parseSignatureHeader(xSignature);
  if (!parsed || !/^[0-9a-fA-F]{64}$/.test(parsed.v1)) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${parsed.ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest();
  return timingSafeEqual(Buffer.from(parsed.v1, "hex"), expected);
}
