import type {
  ContentArchitecture,
  ExperienceLane,
  HybridBriefingInput,
  ProjectLevel,
  RoutingDecision,
} from "./types";

function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

export function classifyBriefing(input: HybridBriefingInput): RoutingDecision {
  const hasApplicationLogic =
    input.needsLogin ||
    input.hasPrivateData ||
    input.needsScheduling ||
    input.needsDashboard ||
    input.hasBusinessRules;

  let level: ProjectLevel;
  let levelReason: string;

  if (hasApplicationLogic) {
    level = "N4";
    levelReason =
      "Há lógica operacional, dados privados, autenticação, agendamento, dashboard ou regras de negócio.";
  } else if (input.routesCount <= 1 && input.motionMode === "cinematico") {
    level = "N2";
    levelReason =
      "É uma página única com experiência cinematográfica e scroll-scrub.";
  } else if (input.routesCount <= 1) {
    level = "N1";
    levelReason =
      "É uma página única sem requisitos de aplicação e motion leve é suficiente.";
  } else {
    level = "N3";
    levelReason =
      "O projeto exige múltiplas páginas/rotas sem lógica de aplicação completa.";
  }

  let lane: ExperienceLane;
  let laneReason: string;
  if (input.motionMode === "3d_interativo") {
    lane = "C";
    laneReason = "O visitante precisa manipular uma experiência 3D em tempo real.";
  } else if (input.motionMode === "cinematico") {
    lane = "B";
    laneReason = "A direção aprovada depende de vídeo hero e/ou scroll-scrub.";
  } else {
    lane = "A";
    laneReason = "Motion 2D e transições leves atendem o objetivo.";
  }

  let architecture: ContentArchitecture;
  let architectureReason: string;
  if (level === "N4") {
    architecture = "aplicacao";
    architectureReason =
      "Há fluxo operacional e regras de negócio; deve ser tratado como aplicação.";
  } else if (
    level === "N3" &&
    input.clientNeedsEditing &&
    input.contentFrequency !== "raro"
  ) {
    architecture = "cms_supabase";
    architectureReason =
      "O cliente precisa editar conteúdo estruturado com frequência, justificando CMS simples.";
  } else {
    architecture = "codigo_direto";
    architectureReason =
      "O conteúdo muda pouco ou não exige autonomia de edição; CMS adicionaria complexidade sem ganho real.";
  }

  const priceReference: Record<ProjectLevel, string> = {
    N1: "R$ 800–1.500",
    N2: "R$ 1.500–2.500 + mídia aprovada",
    N3: "R$ 2.500–3.500",
    N4: "R$ 4.500–15.000 conforme escopo",
  };

  const levelLabel: Record<ProjectLevel, string> = {
    N1: "LP simples",
    N2: "LP cinematográfica",
    N3: "Site institucional multipágina",
    N4: "Sistema / dashboard",
  };

  const laneLabel: Record<ExperienceLane, string> = {
    A: "Motion 2D / GSAP + Lenis",
    B: "Vídeo cinematográfico / scroll-scrub",
    C: "3D interativo / Spline ou R3F",
  };

  const architectureLabel: Record<ContentArchitecture, string> = {
    codigo_direto: "Código direto",
    cms_supabase: "CMS Supabase simples",
    aplicacao: "Aplicação com dados e regras de negócio",
  };

  const openDecisions: string[] = [];
  if (isBlank(input.mainGoal)) openDecisions.push("Objetivo principal do projeto");
  if (isBlank(input.primaryCta)) openDecisions.push("CTA principal");
  if (isBlank(input.vibe)) openDecisions.push("Direção estética / vibe");
  if (isBlank(input.existingAssets)) openDecisions.push("Inventário de ativos existentes");
  if (lane === "B" && isBlank(input.journey)) {
    openDecisions.push("Jornada cinematográfica e quantidade de capítulos");
  }
  if (input.clientNeedsEditing && isBlank(input.editableFields)) {
    openDecisions.push("Campos que o cliente poderá editar");
  }
  if (hasApplicationLogic && isBlank(input.businessRules)) {
    openDecisions.push("Regras de negócio e critérios de aceite");
  }
  if (isBlank(input.publishDestination)) {
    openDecisions.push("Destino de publicação");
  }

  return {
    level,
    levelLabel: levelLabel[level],
    levelReason,
    lane,
    laneLabel: laneLabel[lane],
    laneReason,
    architecture,
    architectureLabel: architectureLabel[architecture],
    architectureReason,
    priceReference: priceReference[level],
    sceneReference:
      lane === "B"
        ? "N2 MVP: 3–4 cenas. Produção final: 7–8 cenas, mediante aprovação."
        : null,
    openDecisions,
  };
}
