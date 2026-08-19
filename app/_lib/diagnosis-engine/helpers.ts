/**
 * Helpers de normalização de resposta 0-100 — extraídos e generalizados a
 * partir de app/offer-book/_lib/scores.ts (clamp/filled/fillRatio já
 * existiam ali presos ao schema do Offer Book; aqui viram utilidades
 * puras reutilizáveis por qualquer capability/vertical).
 */
import type { DurationBucket } from "./types";

export const clamp = (n: number): number => Math.max(0, Math.min(100, Math.round(n)));

export const filled = (v: unknown): boolean =>
  typeof v === "string" ? v.trim().length > 0 : v !== undefined && v !== null;

export function fillRatio(values: unknown[]): number {
  if (values.length === 0) return 0;
  const f = values.filter(filled).length;
  return (f / values.length) * 100;
}

/**
 * Mesmo bucketing usado historicamente em velocidadeScore() — generalizado
 * para qualquer pergunta duration_minutes (não só tempo de resposta a lead).
 */
export const DEFAULT_DURATION_BUCKETS: DurationBucket[] = [
  { maxMinutes: 1, score: 95 },
  { maxMinutes: 5, score: 85 },
  { maxMinutes: 15, score: 70 },
  { maxMinutes: 30, score: 55 },
  { maxMinutes: 60, score: 40 },
  { maxMinutes: 240, score: 25 },
  { maxMinutes: 1440, score: 12 },
];

export function scoreDurationMinutes(
  minutes: number,
  buckets: DurationBucket[] = DEFAULT_DURATION_BUCKETS,
): number {
  if (!Number.isFinite(minutes) || minutes < 0) return 0;
  const sorted = [...buckets].sort((a, b) => a.maxMinutes - b.maxMinutes);
  const hit = sorted.find((b) => minutes <= b.maxMinutes);
  return clamp(hit ? hit.score : sorted[sorted.length - 1].score * 0.6);
}

export function scoreNumber(value: number, max: number): number {
  if (!Number.isFinite(value) || max <= 0) return 0;
  return clamp((value / max) * 100);
}

export function scorePercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return clamp(value);
}

export function scoreBoolean(value: boolean, invert = false): number {
  const truthy = invert ? !value : value;
  return truthy ? 100 : 0;
}

export function scoreEnum(value: string, enumScores: Record<string, number>): number {
  const score = enumScores[value];
  return typeof score === "number" ? clamp(score) : 0;
}

export function scoreText(value: string): number {
  return filled(value) ? clamp(40 + Math.min(60, Math.floor(value.trim().length / 4))) : 0;
}
