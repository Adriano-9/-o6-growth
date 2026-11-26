import { EXPRESS_CHECK_COUNT, EXPRESS_FRONTS, type ExpressDiagnosisInput, type FrontId } from "./fronts";

export type ExpressFrontResult = {
  id: FrontId;
  label: string;
  score: number | null;
  basis: string;
  gaps: string[];
  recommendation: string;
};

export type ExpressReport = {
  version: "five-fronts-v1";
  businessName: string;
  generatedAt: string;
  summary: string;
  fronts: ExpressFrontResult[];
  priorities: Array<{ front: string; action: string; reason: string }>;
  nextStep: string;
  method: string;
  /** Serviço O6 que resolve cada frente fraca. Sugestão para a revisão humana, não promessa. */
  suggestions?: Array<{ front: string; service: string; why: string }>;
};

// Qual serviço da O6 responde a cada frente quando ela fica fraca (nota até 3).
const SERVICE_BY_FRONT: Record<FrontId, { service: string; why: string }> = {
  posicionamento: { service: "Fundação estratégica e de marca", why: "Público, diferencial e identidade ainda não estão claros nem consistentes." },
  oferta: { service: "Fundação estratégica e de marca (oferta)", why: "A oferta e o próximo passo ainda geram dúvida antes da conversa." },
  presenca: { service: "Site ou landing page", why: "O cliente tem dificuldade de encontrar e entender a empresa na busca e no celular." },
  aquisicao: { service: "Kit O6 Conteúdo Próprio", why: "Falta rotina e direção de conteúdo; o kit organiza isso para a própria equipe produzir." },
  conversao: { service: "Sistema O6 (atendimento e retomada)", why: "Contatos esfriam por falta de resposta, acompanhamento ou prova." },
};

const VALUE = { sim: 5, parcial: 3, nao: 1 } as const;

export function buildExpressReport(input: ExpressDiagnosisInput): ExpressReport {
  const fronts: ExpressFrontResult[] = EXPRESS_FRONTS.map((front) => {
    const answer = input.fronts[front.id];
    const known = front.checks.filter((check) => answer.checks[check.id] !== "nao_sei");
    const score = known.length === 0 ? null : Math.round(
      known.reduce((sum, check) => sum + VALUE[answer.checks[check.id] as keyof typeof VALUE], 0) / known.length * 10,
    ) / 10;
    const gaps = front.checks.filter((check) => answer.checks[check.id] === "nao" || answer.checks[check.id] === "parcial");
    const firstGap = gaps.find((check) => answer.checks[check.id] === "nao") ?? gaps[0];
    return {
      id: front.id,
      label: front.label,
      score,
      basis: `${known.length} de ${front.checks.length} verificações respondidas; dados declarados pelo comprador, ainda não auditados pela O6.`,
      gaps: gaps.map((check) => check.label),
      recommendation: firstGap?.action ?? "Confirmar as respostas com evidências e manter o que já funciona.",
    };
  });
  const ranked = [...fronts].sort((a, b) => (a.score ?? -1) - (b.score ?? -1));
  const priorities = ranked.slice(0, 3).map((front) => ({
    front: front.label,
    action: front.score === null ? "Coletar evidências antes de definir uma correção." : front.recommendation,
    reason: front.score === null ? "Informação insuficiente para atribuir nota." : `Leitura declarada: ${front.score}/5.`,
  }));
  const suggestions = ranked
    .filter((front) => front.score !== null && front.score <= 3)
    .slice(0, 2)
    .map((front) => ({ front: front.label, ...SERVICE_BY_FRONT[front.id] }));
  return {
    version: "five-fronts-v1",
    businessName: input.business.name.trim(),
    generatedAt: new Date().toISOString(),
    summary: `Leitura inicial das cinco frentes comerciais de ${input.business.name.trim()}: como a empresa é encontrada, percebida e escolhida. As notas abaixo refletem somente as respostas fornecidas e aguardam revisão da O6.`,
    fronts,
    priorities,
    nextStep: "A O6 revisa as respostas e os links, valida a prioridade e só então indica uma solução específica ou uma call estratégica. Um site é apenas uma possibilidade.",
    method: `Autodeclaração estruturada em ${EXPRESS_CHECK_COUNT} verificações e cinco relatos de contexto. Sem auditoria automática dos links, cálculo de impacto financeiro ou promessa de resultado.`,
    suggestions,
  };
}

export function formatExpressReport(report: ExpressReport): string {
  const lines = [`# Diagnóstico Express O6 — ${report.businessName}`, "", report.summary, "", `*Método: ${report.method}*`, "", "## Cinco frentes"];
  for (const front of report.fronts) {
    lines.push("", `### ${front.label} — ${front.score === null ? "sem nota" : `${front.score}/5`}`, front.basis);
    if (front.gaps.length) lines.push(`Pontos a verificar: ${front.gaps.join("; ")}.`);
    lines.push(`Ação prática: ${front.recommendation}`);
  }
  lines.push("", "## Três prioridades");
  report.priorities.forEach((item, index) => lines.push(`${index + 1}. **${item.front}:** ${item.action} ${item.reason}`));
  if (report.suggestions?.length) {
    lines.push("", "## Serviço sugerido (para revisão)");
    report.suggestions.forEach((item) => lines.push(`- **${item.front}:** ${item.service}. ${item.why}`));
  }
  lines.push("", "## Próximo passo", report.nextStep, "", "*Rascunho para revisão humana. Não enviar como diagnóstico final antes da aprovação da O6.*");
  return lines.join("\n");
}
