/**
 * Teste com os DADOS REAIS já medidos (Carol — Jhun + Empório):
 * - Empório: tempo de resposta WhatsApp medido em 2h11min, sem alternativa oferecida
 * - Jhun: mensagem no WhatsApp >20min sem resposta até o momento do registro
 * Rodar com: npx tsx app/_lib/diagnostico-completo/__smoke__/run-real-case.ts
 */
import { buildDiagnosisReport } from "../build-report";
import type { PainEvidence } from "../types";

const emporioEvidence: PainEvidence[] = [
  {
    canal: "WhatsApp",
    descricao: "tempo de resposta medido — respondeu, mas sem oferecer alternativa ao pedido",
    valorMedido: "2h11min",
    dataMedicao: "2026-07-06",
    fonte: "teste_manual",
  },
];

const jhunEvidence: PainEvidence[] = [
  {
    canal: "WhatsApp",
    descricao: "tempo de resposta medido",
    valorMedido: ">20min, sem resposta até o momento",
    dataMedicao: "2026-07-06",
    fonte: "teste_manual",
  },
];

const emporioReport = buildDiagnosisReport({
  clientContext: {
    nomeNegocio: "Empório",
    segmento: "comércio local / empório",
    canaisAtendimento: ["WhatsApp"],
  },
  painEvidence: emporioEvidence,
});

const jhunReport = buildDiagnosisReport({
  clientContext: {
    nomeNegocio: "Jhun",
    segmento: "não classificado",
    canaisAtendimento: ["WhatsApp"],
  },
  painEvidence: jhunEvidence,
});

console.log("=== EMPÓRIO ===");
console.log(JSON.stringify(emporioReport, null, 2));
console.log("\n=== JHUN ===");
console.log(JSON.stringify(jhunReport, null, 2));
