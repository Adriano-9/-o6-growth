/**
 * O6 Intelligence Diagnosis Engine — única lógica de scoring.
 *
 * Regra estrutural do projeto: nunca duplicar este engine por indústria.
 * Toda variação de negócio entra via VerticalConfig (pergunta/peso/
 * recomendação/terminologia) — este arquivo não conhece nenhum setor.
 */
import {
  scoreDurationMinutes,
  scoreNumber,
  scorePercent,
  scoreBoolean,
  scoreEnum,
  scoreText,
  clamp,
} from "./helpers";
import type {
  Answer,
  Capability,
  CapabilityId,
  CapabilityResult,
  DiagnosisResult,
  Question,
  Tier,
  VerticalConfig,
} from "./types";

export function scoreTier(value: number): Tier {
  if (value >= 70) return "high";
  if (value >= 40) return "mid";
  return "low";
}

function applyOverride(question: Question, vertical: VerticalConfig): Question {
  const override = vertical.questionOverrides?.[question.id];
  if (!override) return question;
  return { ...question, ...override };
}

/**
 * Resolve as perguntas efetivas de uma capability para uma vertical:
 * perguntas universais (com overrides aplicados) + extraQuestions da
 * vertical que pertencem a essa capability.
 */
function resolveQuestions(capability: Capability, vertical: VerticalConfig): Question[] {
  const base = capability.questions.map((q) => applyOverride(q, vertical));
  const extra = (vertical.extraQuestions ?? []).filter((q) => q.capabilityId === capability.id);
  return [...base, ...extra];
}

function scoreQuestion(question: Question, answer: Answer | undefined): number {
  if (!answer) return 0;
  const { value } = answer;

  switch (question.type) {
    case "number":
      return typeof value === "number" ? scoreNumber(value, inferMax(question)) : 0;
    case "percent":
      return typeof value === "number" ? scorePercent(value) : 0;
    case "duration_minutes":
      return typeof value === "number"
        ? scoreDurationMinutes(value, question.durationBuckets)
        : 0;
    case "boolean":
      return typeof value === "boolean" ? scoreBoolean(value, question.invertBoolean) : 0;
    case "enum":
      return typeof value === "string" && question.enumScores
        ? scoreEnum(value, question.enumScores)
        : 0;
    case "text":
      return typeof value === "string" ? scoreText(value) : 0;
    default:
      return 0;
  }
}

/**
 * Perguntas "number" sem enumScores/buckets precisam de um teto razoável
 * pra normalizar — usa 100 como default conservador quando a pergunta não
 * declarar um contexto melhor (ex.: volume de leads, número de pessoas).
 * Vertical pode sobrescrever via questionOverrides.weight não resolve teto;
 * mantido simples de propósito — perguntas number tendem a ser plausíveis
 * o bastante para o clamp em scoreNumber não distorcer o resultado.
 */
function inferMax(question: Question): number {
  if (question.id.includes("volume")) return 50;
  if (question.id.includes("numero_pessoas")) return 10;
  if (question.id.includes("tempo_relacionamento")) return 24;
  if (question.id.includes("ticket_medio")) return 3000;
  return 100;
}

export function scoreCapability(
  capability: Capability,
  answers: Answer[],
  vertical: VerticalConfig,
): CapabilityResult {
  const questions = resolveQuestions(capability, vertical);
  const answerMap = new Map(answers.map((a) => [a.questionId, a]));

  const totalWeight = questions.reduce((sum, q) => sum + q.weight, 0) || 1;
  const weightedScore = questions.reduce((sum, q) => {
    const questionScore = scoreQuestion(q, answerMap.get(q.id));
    return sum + questionScore * (q.weight / totalWeight);
  }, 0);

  const score = clamp(weightedScore);
  const tier = scoreTier(score);
  const recommendations = (vertical.recommendations[capability.id] ?? [])
    .filter((r) => r.condition === tier)
    .map((r) => r.text);

  return {
    capabilityId: capability.id,
    label: capability.label,
    score,
    tier,
    recommendations,
  };
}

export function computeDiagnosis(
  capabilities: Capability[],
  answers: Answer[],
  vertical: VerticalConfig,
): DiagnosisResult {
  const results = capabilities.map((c) => scoreCapability(c, answers, vertical));

  const weights: Partial<Record<CapabilityId, number>> = vertical.capabilityWeights ?? {};
  const totalWeight = results.reduce((sum, r) => sum + (weights[r.capabilityId] ?? 1), 0) || 1;
  const overallScore = clamp(
    results.reduce((sum, r) => sum + r.score * ((weights[r.capabilityId] ?? 1) / totalWeight), 0),
  );

  return {
    verticalId: vertical.id,
    capabilities: results,
    overallScore,
    generatedAt: new Date().toISOString(),
  };
}
