import type { ExpressDiagnosisInput } from "./fronts";
import type { ExpressReport } from "./report";

export type DiagnosisQualification = {
  score: number;
  band: "prioridade_alta" | "prioridade_media" | "nutrir";
  recommendedOffer: "revisao_manual";
  reasons: string[];
  metrics: {
    monthlyContacts: number | null;
    monthlyConversions: number | null;
    declaredConversionRate: number | null;
    averageTicket: number | null;
  };
};

function positiveNumber(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function segmentFit(segment: string): "primary" | "secondary" | "other" {
  const normalized = segment.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (/odonto|dent|estet|dermato|clinica|medic/.test(normalized)) return "primary";
  if (/fisio|reabilit|saude|advoc/.test(normalized)) return "secondary";
  return "other";
}

export function qualifyDiagnosis(
  input: ExpressDiagnosisInput,
  report: ExpressReport,
): DiagnosisQualification {
  let score = 25; // Pagamento confirmado: sinal explícito de intenção.
  const reasons = ["Comprou o Diagnóstico Express."];
  const contacts = positiveNumber(input.business.monthlyContacts);
  const conversions = positiveNumber(input.business.monthlyConversions);
  const ticket = positiveNumber(input.business.averageTicket);
  const rate = contacts && conversions ? conversions / contacts : null;
  const weakFronts = report.fronts.filter((front) => front.score !== null && front.score <= 2.5);

  if (weakFronts.length >= 2) {
    score += 20;
    reasons.push("Duas ou mais frentes com baixa maturidade declarada.");
  } else if (weakFronts.length === 1) {
    score += 12;
    reasons.push("Uma frente com baixa maturidade declarada.");
  }

  if (contacts !== null && contacts >= 50) {
    score += 15;
    reasons.push("Recebe pelo menos 50 contatos por mês.");
  } else if (contacts !== null && contacts >= 20) {
    score += 10;
    reasons.push("Recebe pelo menos 20 contatos por mês.");
  }

  if (rate !== null && rate < 0.1) {
    score += 15;
    reasons.push("Conversão declarada abaixo de 10%.");
  } else if (rate !== null && rate < 0.2) {
    score += 10;
    reasons.push("Conversão declarada abaixo de 20%.");
  }

  if (ticket !== null && ticket >= 1_000) {
    score += 15;
    reasons.push("Ticket médio declarado a partir de R$1.000.");
  } else if (ticket !== null && ticket >= 500) {
    score += 10;
    reasons.push("Ticket médio declarado a partir de R$500.");
  }

  const followUp = input.fronts.conversao.checks.followup;
  if (followUp === "nao") {
    score += 10;
    reasons.push("Não possui processo definido de confirmação ou follow-up.");
  } else if (followUp === "parcial") {
    score += 5;
    reasons.push("Follow-up declarado como parcial.");
  }

  const fit = segmentFit(input.business.segment);
  if (fit === "primary") {
    score += 10;
    reasons.push("Segmento aderente ao ICP primário.");
  } else if (fit === "secondary") {
    score += 5;
    reasons.push("Segmento aderente ao ICP secundário.");
  }

  const finalScore = Math.min(100, score);
  return {
    score: finalScore,
    band:
      finalScore >= 75
        ? "prioridade_alta"
        : finalScore >= 50
          ? "prioridade_media"
          : "nutrir",
    recommendedOffer: "revisao_manual",
    reasons,
    metrics: {
      monthlyContacts: contacts,
      monthlyConversions: conversions,
      declaredConversionRate: rate,
      averageTicket: ticket,
    },
  };
}
