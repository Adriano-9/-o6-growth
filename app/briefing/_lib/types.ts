export type ProjectMode = "novo" | "reforma";
export type ContentFrequency = "raro" | "mensal" | "semanal";
export type MotionMode = "leve" | "cinematico" | "3d_interativo";
export type CreativeFreedom = "baixa" | "media" | "alta";
export type ProjectLevel = "N1" | "N2" | "N3" | "N4";
export type ExperienceLane = "A" | "B" | "C";
export type ContentArchitecture = "codigo_direto" | "cms_supabase" | "aplicacao";

export type HybridBriefingInput = {
  projectName: string;
  companyName: string;
  projectMode: ProjectMode;
  currentUrl: string;
  mainGoal: string;
  primaryCta: string;
  routesCount: number;
  contentTypes: string;
  contentFrequency: ContentFrequency;
  clientNeedsEditing: boolean;
  editableFields: string;
  motionMode: MotionMode;
  needsLogin: boolean;
  hasPrivateData: boolean;
  needsScheduling: boolean;
  needsDashboard: boolean;
  hasBusinessRules: boolean;
  businessRules: string;
  existingAssets: string;
  vibe: string;
  creativeFreedom: CreativeFreedom;
  journey: string;
  publishDestination: string;
  integrations: string;
  constraints: string;
};

export type RoutingDecision = {
  level: ProjectLevel;
  levelLabel: string;
  levelReason: string;
  lane: ExperienceLane;
  laneLabel: string;
  laneReason: string;
  architecture: ContentArchitecture;
  architectureLabel: string;
  architectureReason: string;
  priceReference: string;
  sceneReference: string | null;
  openDecisions: string[];
};

export type BriefingAIOutput = {
  executiveSummary: string;
  scopeIncluded: string[];
  exclusions: string[];
  missingAssets: string[];
  approvalGates: string[];
  risks: string[];
  recommendedNextStep: string;
};

export type HybridBriefingResult = {
  routing: RoutingDecision;
  ai: BriefingAIOutput;
  markdown: string;
  aiGenerated: boolean;
};
