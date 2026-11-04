import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  isExpressPayment,
  isValidExternalReference,
  newExternalReference,
  parseSignatureHeader,
  paymentMatchesReference,
  verifyMercadoPagoSignature,
} from "../../app/_lib/diagnostico-express/mercadopago-core.ts";
import {
  EXPRESS_FRONTS,
  isExpressDiagnosisInput,
} from "../../app/_lib/diagnostico-express/fronts.ts";

const PRODUCT = "diagnostico_express";
const PRICE = 19_700;
const SECRET = "segredo-de-teste";

function sign({ id, requestId, ts, secret = SECRET }) {
  const manifest = `id:${id};request-id:${requestId};ts:${ts};`;
  const v1 = createHmac("sha256", secret).update(manifest).digest("hex");
  return `ts=${ts},v1=${v1}`;
}

function payment(overrides = {}) {
  return {
    status: "approved",
    transactionAmount: 197,
    currencyId: "BRL",
    externalReference: newExternalReference(PRODUCT),
    metadata: { produto: PRODUCT },
    ...overrides,
  };
}

test("assinatura valida e aceita", () => {
  const header = sign({ id: "123", requestId: "req-1", ts: "1700000000" });
  assert.equal(
    verifyMercadoPagoSignature({ secret: SECRET, xSignature: header, xRequestId: "req-1", dataId: "123" }),
    true,
  );
});

test("assinatura rejeita id, request-id, ts ou segredo diferentes", () => {
  const header = sign({ id: "123", requestId: "req-1", ts: "1700000000" });
  const base = { secret: SECRET, xSignature: header, xRequestId: "req-1", dataId: "123" };
  assert.equal(verifyMercadoPagoSignature({ ...base, dataId: "124" }), false);
  assert.equal(verifyMercadoPagoSignature({ ...base, xRequestId: "req-2" }), false);
  assert.equal(verifyMercadoPagoSignature({ ...base, secret: "outro" }), false);
  assert.equal(
    verifyMercadoPagoSignature({ ...base, xSignature: header.replace("ts=1700000000", "ts=1700000001") }),
    false,
  );
});

test("assinatura malformada nunca lanca excecao", () => {
  const base = { secret: SECRET, xRequestId: "req-1", dataId: "123" };
  const cases = [
    null,
    "",
    "lixo",
    "ts=1,v1=",
    "ts=1,v1=abc",
    "ts=1,v1=zz" + "0".repeat(62),
    "ts=1,v1=" + "0".repeat(63),
    "ts=1,v1=" + "0".repeat(65),
    "v1=" + "0".repeat(64),
    "ts=1",
  ];
  for (const xSignature of cases) {
    assert.doesNotThrow(() => verifyMercadoPagoSignature({ ...base, xSignature }));
    assert.equal(verifyMercadoPagoSignature({ ...base, xSignature }), false);
  }
});

test("assinatura sem segredo ou sem cabecalhos falha fechada", () => {
  const header = sign({ id: "123", requestId: "req-1", ts: "1" });
  assert.equal(verifyMercadoPagoSignature({ secret: undefined, xSignature: header, xRequestId: "req-1", dataId: "123" }), false);
  assert.equal(verifyMercadoPagoSignature({ secret: SECRET, xSignature: header, xRequestId: null, dataId: "123" }), false);
  assert.equal(verifyMercadoPagoSignature({ secret: SECRET, xSignature: null, xRequestId: "req-1", dataId: "123" }), false);
});

test("parseSignatureHeader le ts e v1", () => {
  assert.deepEqual(parseSignatureHeader("ts=10, v1=abc"), { ts: "10", v1: "abc" });
  assert.equal(parseSignatureHeader("v1=abc"), null);
});

test("pagamento Express valido", () => {
  assert.equal(isExpressPayment(payment(), PRODUCT, PRICE), true);
});

test("pagamento rejeitado: valor, moeda, status, produto, referencia", () => {
  assert.equal(isExpressPayment(payment({ transactionAmount: 196.99 }), PRODUCT, PRICE), false);
  assert.equal(isExpressPayment(payment({ transactionAmount: 1970 }), PRODUCT, PRICE), false);
  assert.equal(isExpressPayment(payment({ currencyId: "USD" }), PRODUCT, PRICE), false);
  assert.equal(isExpressPayment(payment({ status: "pending" }), PRODUCT, PRICE), false);
  assert.equal(isExpressPayment(payment({ status: "refunded" }), PRODUCT, PRICE), false);
  assert.equal(isExpressPayment(payment({ metadata: { produto: "outro" } }), PRODUCT, PRICE), false);
  assert.equal(isExpressPayment(payment({ metadata: {} }), PRODUCT, PRICE), false);
  assert.equal(isExpressPayment(payment({ externalReference: null }), PRODUCT, PRICE), false);
  assert.equal(isExpressPayment(payment({ externalReference: "diagnostico_express:1730000000000" }), PRODUCT, PRICE), false);
  assert.equal(isExpressPayment(payment({ externalReference: newExternalReference("sprint") }), PRODUCT, PRICE), false);
});

test("tolera ponto flutuante equivalente a R$197,00", () => {
  assert.equal(isExpressPayment(payment({ transactionAmount: 197.0000001 }), PRODUCT, PRICE), true);
});

test("referencia externa e unica e valida", () => {
  const a = newExternalReference(PRODUCT);
  const b = newExternalReference(PRODUCT);
  assert.notEqual(a, b);
  assert.equal(isValidExternalReference(a, PRODUCT), true);
  assert.equal(isValidExternalReference(`${PRODUCT}:1`, PRODUCT), false);
  assert.equal(isValidExternalReference(undefined, PRODUCT), false);
});

test("associacao pagamento x compra exige referencia identica", () => {
  const p = payment();
  assert.equal(paymentMatchesReference(p, p.externalReference), true);
  assert.equal(paymentMatchesReference(p, newExternalReference(PRODUCT)), false);
  assert.equal(paymentMatchesReference(p, ""), false);
  assert.equal(paymentMatchesReference(p, undefined), false);
  assert.equal(paymentMatchesReference(payment({ externalReference: null }), null), false);
});

function validInput(overrides = {}) {
  const fronts = Object.fromEntries(
    EXPRESS_FRONTS.map((front) => [
      front.id,
      {
        context: "Contexto com mais de oito caracteres",
        checks: Object.fromEntries(front.checks.map((check) => [check.id, "parcial"])),
      },
    ]),
  );
  return {
    paymentId: "123456789",
    externalReference: newExternalReference(PRODUCT),
    contact: { name: "Maria Silva", email: "maria@clinica.com.br", phone: "11999999999" },
    consent: true,
    business: { name: "Clinica Aurora", segment: "Estetica" },
    fronts,
    ...overrides,
  };
}

test("guard de entrada aceita o payload do fluxo Mercado Pago", () => {
  assert.equal(isExpressDiagnosisInput(validInput()), true);
});

test("guard de entrada rejeita pagamento ausente, invalido ou formato Stripe legado", () => {
  assert.equal(isExpressDiagnosisInput(validInput({ paymentId: "" })), false);
  assert.equal(isExpressDiagnosisInput(validInput({ paymentId: "12ab" })), false);
  assert.equal(isExpressDiagnosisInput(validInput({ paymentId: undefined })), false);
  assert.equal(isExpressDiagnosisInput(validInput({ externalReference: undefined })), false);
  assert.equal(isExpressDiagnosisInput(validInput({ externalReference: "x".repeat(81) })), false);
  const legacy = validInput();
  delete legacy.paymentId;
  delete legacy.externalReference;
  legacy.checkoutSessionId = "cs_test_123";
  assert.equal(isExpressDiagnosisInput(legacy), false);
});

test("guard de entrada continua exigindo consentimento e e-mail valido", () => {
  assert.equal(isExpressDiagnosisInput(validInput({ consent: false })), false);
  assert.equal(
    isExpressDiagnosisInput(validInput({ contact: { name: "Maria", email: "invalido" } })),
    false,
  );
});
