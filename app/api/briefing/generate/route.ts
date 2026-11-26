import { NextRequest, NextResponse } from "next/server";
import { classifyBriefing } from "@/app/briefing/_lib/router";
import { notifyTelegram } from "@/app/_lib/telegram";
import { createLead } from "@/app/crm/_lib/api";
import { emptyLeadInput } from "@/app/crm/_lib/types";
import type {
  BriefingAIOutput,
  BriefingReceipt,
  HybridBriefingInput,
  HybridBriefingResult,
} from "@/app/briefing/_lib/types";

export const maxDuration = 60;

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function isBoolean(v: unknown): v is boolean {
  return typeof v === "boolean";
}

function isValidInput(body: unknown): body is HybridBriefingInput {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    isString(b.contactName) &&
    b.contactName.trim().length >= 2 &&
    isString(b.contactWhatsapp) &&
    b.contactWhatsapp.replace(/\D/g, "").length >= 10 &&
    isString(b.projectName) &&
    isString(b.companyName) &&
    (b.projectMode === "novo" || b.projectMode === "reforma") &&
    isString(b.currentUrl) &&
    isString(b.mainGoal) &&
    isString(b.primaryCta) &&
    typeof b.routesCount === "number" &&
    Number.isFinite(b.routesCount) &&
    b.routesCount >= 1 &&
    isString(b.contentTypes) &&
    (b.contentFrequency === "raro" ||
      b.contentFrequency === "mensal" ||
      b.contentFrequency === "semanal") &&
    isBoolean(b.clientNeedsEditing) &&
    isString(b.editableFields) &&
    (b.motionMode === "leve" ||
      b.motionMode === "cinematico" ||
      b.motionMode === "3d_interativo") &&
    isBoolean(b.needsLogin) &&
    isBoolean(b.hasPrivateData) &&
    isBoolean(b.needsScheduling) &&
    isBoolean(b.needsDashboard) &&
    isBoolean(b.hasBusinessRules) &&
    isString(b.businessRules) &&
    isString(b.existingAssets) &&
    isString(b.vibe) &&
    (b.creativeFreedom === "baixa" ||
      b.creativeFreedom === "media" ||
      b.creativeFreedom === "alta") &&
    isString(b.journey) &&
    isString(b.publishDestination) &&
    isString(b.integrations) &&
    isString(b.constraints)
  );
}

function fallbackAI(input: HybridBriefingInput): BriefingAIOutput {
  const scopeIncluded = [
    "Arquitetura de informação e escopo coerentes com o nível recomendado",
    "Direção visual e experiência alinhadas ao objetivo principal",
    "Implementação, QA responsivo e preparação para deploy",
  ];
  if (input.motionMode === "cinematico") {
    scopeIncluded.push("Planejamento de cenas e mídia cinematográfica após aprovação");
  }
  if (input.clientNeedsEditing) {
    scopeIncluded.push("Definição explícita dos campos que precisam de autonomia de edição");
  }

  const missingAssets =
    input.existingAssets.trim().length > 0
      ? []
      : ["Logo/identidade", "Textos-base", "Fotos/vídeos", "Referências visuais"];

  return {
    executiveSummary:
      "Briefing estruturado a partir das respostas humanas e da régua técnica O6. A etapa de IA está indisponível; a classificação técnica permanece válida.",
    scopeIncluded,
    exclusions: [
      "Mídia paga antes de aprovação da direção",
      "Funcionalidades não declaradas no briefing",
      "CMS ou aplicação quando não houver necessidade operacional",
    ],
    missingAssets,
    approvalGates: [
      "Aprovar escopo, nível e lane",
      "Aprovar conceito e direção de arte",
      "Aprovar mídia cara antes da geração final",
      "Executar QA antes do deploy",
    ],
    risks: input.constraints.trim() ? [input.constraints.trim()] : [],
    recommendedNextStep: "Resolver decisões abertas e aprovar o escopo antes da produção.",
  };
}

function isAIOutput(value: unknown): value is BriefingAIOutput {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  const arrays = [
    v.scopeIncluded,
    v.exclusions,
    v.missingAssets,
    v.approvalGates,
    v.risks,
  ];
  return (
    isString(v.executiveSummary) &&
    arrays.every(
      (item) => Array.isArray(item) && item.every((entry) => isString(entry)),
    ) &&
    isString(v.recommendedNextStep)
  );
}

function buildMarkdown(
  input: HybridBriefingInput,
  ai: BriefingAIOutput,
  routing: ReturnType<typeof classifyBriefing>,
): string {
  const list = (items: string[]) =>
    items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "- Nenhum";
  return `# Briefing Híbrido O6 — ${input.projectName || input.companyName || "Projeto"}

## Resumo
${ai.executiveSummary}

## Decisão técnica
- Nível: ${routing.level} — ${routing.levelLabel}
- Motivo: ${routing.levelReason}
- Lane: ${routing.lane} — ${routing.laneLabel}
- Arquitetura: ${routing.architectureLabel}
- Faixa de referência: ${routing.priceReference}
${routing.sceneReference ? `- Cenas: ${routing.sceneReference}` : ""}

## Objetivo e conversão
- Empresa: ${input.companyName || "A confirmar"}
- Projeto: ${input.projectName || "A confirmar"}
- Tipo: ${input.projectMode === "novo" ? "Site novo" : "Reforma"}
- Objetivo principal: ${input.mainGoal || "A confirmar"}
- CTA principal: ${input.primaryCta || "A confirmar"}
- Páginas/rotas: ${input.routesCount}

## Conteúdo e autonomia
- Conteúdos: ${input.contentTypes || "A confirmar"}
- Frequência de atualização: ${input.contentFrequency}
- Cliente precisa editar: ${input.clientNeedsEditing ? "Sim" : "Não"}
- Campos editáveis: ${input.editableFields || "Nenhum definido"}

## Experiência
- Motion: ${input.motionMode}
- Vibe: ${input.vibe || "A confirmar"}
- Liberdade criativa: ${input.creativeFreedom}
- Jornada: ${input.journey || "A confirmar"}

## Regras e integrações
- Login: ${input.needsLogin ? "Sim" : "Não"}
- Dados privados: ${input.hasPrivateData ? "Sim" : "Não"}
- Agendamento: ${input.needsScheduling ? "Sim" : "Não"}
- Dashboard: ${input.needsDashboard ? "Sim" : "Não"}
- Regras de negócio: ${input.hasBusinessRules ? input.businessRules || "Sim, detalhar" : "Não"}
- Integrações: ${input.integrations || "Nenhuma definida"}
- Publicação: ${input.publishDestination || "A confirmar"}

## Ativos existentes
${input.existingAssets || "Nenhum ativo informado."}

## Escopo incluído
${list(ai.scopeIncluded)}

## Exclusões
${list(ai.exclusions)}

## Ativos faltantes
${list(ai.missingAssets)}

## Gates de aprovação
${list(ai.approvalGates)}

## Riscos / restrições
${list(ai.risks)}

## Decisões abertas
${list(routing.openDecisions)}

## Próximo passo
${ai.recommendedNextStep}
`;
}

async function generateWithClaude(
  input: HybridBriefingInput,
  routing: ReturnType<typeof classifyBriefing>,
): Promise<BriefingAIOutput | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const prompt = `Você é o arquiteto de briefing da O6 Growth. Transforme a triagem abaixo em um briefing de execução, sem inventar informações e sem alterar a classificação técnica determinística.

CLASSIFICAÇÃO
${JSON.stringify(routing, null, 2)}

ENTRADA HUMANA
${JSON.stringify(input, null, 2)}

REGRAS
1. Não invente métricas, ativos, resultados, depoimentos, integrações ou funcionalidades.
2. Diferencie claramente o que está incluído, excluído e ainda aberto.
3. Se faltarem ativos, liste apenas os que realmente seriam necessários para este escopo.
4. Gates obrigatórios: escopo/nível; conceito/direção; mídia paga quando houver; QA/deploy.
5. Seja conciso e operacional em português brasileiro.
6. Responda APENAS com JSON válido, sem markdown e sem comentários, exatamente com:
{
  "executiveSummary": "string",
  "scopeIncluded": ["string"],
  "exclusions": ["string"],
  "missingAssets": ["string"],
  "approvalGates": ["string"],
  "risks": ["string"],
  "recommendedNextStep": "string"
}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) {
      console.error("[briefing/generate] Claude failed", res.status);
      return null;
    }

    const data = (await res.json()) as {
      content?: Array<{ type?: string; text?: string }>;
    };
    const raw = data.content?.find((c) => c.type === "text")?.text?.trim();
    if (!raw) return null;
    const clean = raw
      .replace(/^\`\`\`json\s*/i, "")
      .replace(/\`\`\`\s*$/i, "")
      .trim();
    const parsed: unknown = JSON.parse(clean);
    return isAIOutput(parsed) ? parsed : null;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("[briefing/generate]", msg);
    return null;
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!isValidInput(body)) {
    return NextResponse.json(
      { error: "Briefing inválido ou incompleto" },
      { status: 400 },
    );
  }

  const routing = classifyBriefing(body);
  const generated = await generateWithClaude(body, routing);
  const ai = generated ?? fallbackAI(body);
  const result: HybridBriefingResult = {
    routing,
    ai,
    markdown: buildMarkdown(body, ai, routing),
    aiGenerated: generated !== null,
  };

  // A classificação, a faixa de preço e o briefing completo vão só para a O6.
  // O cliente recebe apenas a confirmação de envio.
  const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const digits = body.contactWhatsapp.replace(/\D/g, "");
  const header = [
    "<b>Novo briefing de projeto</b>",
    `${escape(body.contactName.trim())} · ${escape(body.companyName.trim() || "empresa não informada")}`,
    `WhatsApp: https://wa.me/${digits.startsWith("55") ? digits : `55${digits}`}`,
    `Projeto: ${escape(body.projectName.trim() || "sem nome")}`,
    `Nível ${routing.level} (${escape(routing.levelLabel)}) · Lane ${routing.lane} · ${escape(routing.architectureLabel)}`,
    `Faixa interna: ${escape(routing.priceReference)}`,
    result.aiGenerated ? "Síntese por IA" : "Síntese de fallback (sem IA)",
    "",
  ].join("\n");
  const markdown = escape(result.markdown);
  const telegram = await notifyTelegram(header + "<pre>" + markdown.slice(0, 3400 - header.length) + "</pre>");
  if (!telegram.ok) console.error("[briefing/generate] telegram failed", telegram.error);

  // Mesmo padrão de /api/briefing: o briefing também vira lead no CRM, para não depender só do Telegram.
  let saved = false;
  try {
    const lead = await createLead({
      ...emptyLeadInput("Novo Lead"),
      nome: body.contactName.trim().slice(0, 120),
      whatsapp: digits.slice(0, 20),
      empresa: body.companyName.trim().slice(0, 160),
      notas: result.markdown.slice(0, 8000),
      origem: "site_o6_briefing",
    });
    saved = Boolean(lead);
  } catch (error) {
    console.error("[briefing/generate] createLead failed", error);
  }
  if (!saved && !telegram.ok) {
    return NextResponse.json({ error: "Não conseguimos registrar seu briefing. Tente novamente ou fale pelo WhatsApp." }, { status: 502 });
  }

  const receipt: BriefingReceipt = { ok: true, notified: telegram.ok };
  return NextResponse.json(receipt);
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
