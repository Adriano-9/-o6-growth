// Uso: node --env-file=.env.local scripts/qa-mp-webhook.mjs [baseUrl]
// Testa o webhook /api/webhooks/mercadopago sem criar pagamento: so a camada de assinatura.
import { createHmac } from "node:crypto";

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
if (!secret) {
  console.error("MERCADOPAGO_WEBHOOK_SECRET ausente. Rode com --env-file=.env.local");
  process.exit(2);
}

const url = `${base}/api/webhooks/mercadopago`;
const payload = (id) => JSON.stringify({ type: "payment", action: "payment.updated", data: { id: String(id) } });

function signed({ id, requestId, key = secret, ts = String(Date.now()) }) {
  const manifest = `id:${id};request-id:${requestId};ts:${ts};`;
  return `ts=${ts},v1=${createHmac("sha256", key).update(manifest).digest("hex")}`;
}

async function post({ query = "", headers = {}, body }) {
  const res = await fetch(`${url}${query}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body,
  });
  return res.status;
}

const results = [];
async function check(name, expect, run) {
  let status;
  try {
    status = await run();
  } catch (error) {
    results.push({ name, ok: false, detail: `erro de rede: ${error.message}` });
    return;
  }
  const ok = typeof expect === "function" ? expect(status) : status === expect;
  results.push({ name, ok, detail: `status ${status}` });
}

const FAKE_ID = "1";
const rid = "qa-request-1";

await check("sem x-signature -> 401", 401, () =>
  post({ query: `?data.id=${FAKE_ID}`, headers: { "x-request-id": rid }, body: payload(FAKE_ID) }));

await check("assinatura malformada -> 401 (nunca 500)", 401, () =>
  post({ query: `?data.id=${FAKE_ID}`, headers: { "x-request-id": rid, "x-signature": "ts=1,v1=zz" }, body: payload(FAKE_ID) }));

await check("assinatura com segredo errado -> 401", 401, () =>
  post({
    query: `?data.id=${FAKE_ID}`,
    headers: { "x-request-id": rid, "x-signature": signed({ id: FAKE_ID, requestId: rid, key: "segredo-errado" }) },
    body: payload(FAKE_ID),
  }));

await check("data.id da query diferente do corpo -> 400", 400, () =>
  post({
    query: "?data.id=2",
    headers: { "x-request-id": rid, "x-signature": signed({ id: "2", requestId: rid }) },
    body: payload(FAKE_ID),
  }));

await check("assinatura valida passa da barreira (qualquer status exceto 401/400)", (s) => s !== 401 && s !== 400, () =>
  post({
    query: `?data.id=${FAKE_ID}`,
    headers: { "x-request-id": rid, "x-signature": signed({ id: FAKE_ID, requestId: rid }) },
    body: payload(FAKE_ID),
  }));

await check("evento que nao e pagamento -> 200", 200, () =>
  post({ body: JSON.stringify({ type: "topic_merchant_order_wh", data: { id: "9" } }) }));

await check("GET -> 405", 405, async () => (await fetch(url)).status);

let failed = 0;
for (const r of results) {
  if (!r.ok) failed += 1;
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}  (${r.detail})`);
}
console.log(failed === 0 ? "\nTodos os checks passaram." : `\n${failed} check(s) falharam.`);
process.exit(failed === 0 ? 0 : 1);
