/**
 * O6 Intelligence Diagnosis Engine — modelo de dados.
 *
 * Núcleo agnóstico de indústria, organizado por capacidades de negócio
 * (aquisição, conversão, entrega, retenção...). Verticais (massoterapia,
 * varejo local, etc.) só sobrescrevem pergunta/peso/recomendação/
 * terminologia via VerticalConfig — nunca criam lógica própria de
 * scoring. Ver app/_lib/diagnosis-engine/engine.ts para a única
 * implementação de scoreCapability/computeDiagnosis.
 */

export type AnswerType =
  | "number"
  | "percent"
  | "duration_minutes"
  | "boolean"
  | "enum"
  | "text";

export type CapabilityId =
  | "aquisicao"
  | "conversao"
  | "entrega"
  | "retencao"
  | "oferta_precificacao"
  | "operacao_eficiencia"
  | "capacidade_time"
  | "saude_financeira";

export type EnumScoreMap = Record<string, number>;

export type Question = {
  /** Estável entre verticais — overrides e respostas referenciam por id. */
  id: string;
  capabilityId: CapabilityId;
  type: AnswerType;
  label: string;
  placeholder?: string;
  /** Peso relativo dentro da capability — não precisa somar 1, o engine normaliza. */
  weight: number;
  /** Obrigatório quando type === "enum": score 0-100 por opção escolhida. */
  enumScores?: EnumScoreMap;
  /** Buckets custom para type === "duration_minutes" — se ausente, usa DEFAULT_DURATION_BUCKETS. */
  durationBuckets?: DurationBucket[];
  /**
   * Só para type === "boolean". Quando true, inverte a pontuação — usado
   * para perguntas onde `true` é a resposta ruim (ex.: "o negócio para se
   * essa pessoa faltar?"). Default: false (true = 100, false = 0).
   */
  invertBoolean?: boolean;
};

export type DurationBucket = { maxMinutes: number; score: number };

export type Capability = {
  id: CapabilityId;
  label: string;
  description: string;
  questions: Question[];
};

export type Answer = {
  questionId: string;
  value: string | number | boolean;
};

export type QuestionOverride = Partial<
  Pick<Question, "label" | "placeholder" | "weight" | "enumScores" | "durationBuckets" | "invertBoolean">
>;

export type Tier = "low" | "mid" | "high";

export type RecommendationRule = {
  condition: Tier;
  text: string;
};

export type VerticalConfig = {
  id: string;
  label: string;
  description: string;
  /** Override de peso por capability no cálculo do score geral. Default: peso igual entre todas. */
  capabilityWeights?: Partial<Record<CapabilityId, number>>;
  /** Overrides pontuais de pergunta, indexados por Question.id. */
  questionOverrides?: Record<string, QuestionOverride>;
  /** Perguntas adicionais específicas da vertical — somam, nunca substituem as universais. */
  extraQuestions?: Question[];
  recommendations: Partial<Record<CapabilityId, RecommendationRule[]>>;
  /** Mapeamento de termos (ex.: {"cliente": "paciente"}) — consumido pela UI futura, não pelo engine. */
  terminology?: Record<string, string>;
};

export type CapabilityResult = {
  capabilityId: CapabilityId;
  label: string;
  score: number;
  tier: Tier;
  recommendations: string[];
};

export type DiagnosisResult = {
  verticalId: string;
  capabilities: CapabilityResult[];
  overallScore: number;
  generatedAt: string;
};
