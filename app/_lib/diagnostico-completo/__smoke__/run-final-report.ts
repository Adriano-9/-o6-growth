/**
 * Testa formatFinalReport() com o mesmo caso real usado em
 * run-real-case.ts (Empório 2h11min respondido / Jhun >20min sem
 * resposta) — agora indo até o markdown final.
 * Rodar com: npx tsx app/_lib/diagnostico-completo/__smoke__/run-final-report.ts
 */
import { buildDiagnosisReport } from "../build-report";
import { formatFinalReport } from "../format-final-report";
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

console.log("=== EMPÓRIO — MARKDOWN FINAL ===\n");
console.log(formatFinalReport(emporioReport, "Empório"));
console.log("\n\n=== JHUN — MARKDOWN FINAL ===\n");
console.log(formatFinalReport(jhunReport, "Jhun"));
