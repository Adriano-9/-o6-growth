/**
 * Servidor de teste mínimo — expõe POST /generate-report que chama as
 * funções REAIS buildDiagnosisReport() + formatFinalReport() (sem
 * duplicar a lógica em JS inline no intake-form.html). Só para validação
 * local; não faz parte do app Next.js, não é rota de produção.
 *
 * Rodar: npx tsx app/_lib/diagnostico-completo/__smoke__/intake-server.mjs
 */
import { createServer } from "node:http";
import { buildDiagnosisReport } from "../build-report.ts";
import { formatFinalReport } from "../format-final-report.ts";

const PORT = 4174;

const server = createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== "POST" || req.url !== "/generate-report") {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "not found" }));
    return;
  }

  let body = "";
  for await (const chunk of req) body += chunk;

  try {
    const input = JSON.parse(body);
    const report = buildDiagnosisReport(input);
    const markdown = formatFinalReport(report, input.clientContext.nomeNegocio);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ markdown, report }));
  } catch (err) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: String(err) }));
  }
});

server.listen(PORT, () => {
  console.log(`[intake-server] rodando em http://localhost:${PORT}`);
});
