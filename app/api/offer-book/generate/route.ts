import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { computeScores, scoreTier } from "@/app/offer-book/_lib/scores";
import { OfferBookState } from "@/app/offer-book/_lib/types";
import { AiOutput, AiGenerateResponse } from "@/app/offer-book/_lib/ai-types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? "" });

const SYSTEM_PROMPT = `Voce e um consultor de crescimento comercial senior especializado em clinicas medicas, estetica, odontologia, fisioterapia e escritorios de advocacia no Brasil.
Ticket medio: R$1.500-R$8.000. Ciclo consultivo. Dor principal: aquisicao e conversao de leads qualificados.
Analise os dados do Offer Book e gere um diagnostico executivo personalizado.
Regras: use os dados reais do cliente; nunca use linguagem generica de SaaS; seja especifico ao nicho e cidade; cite os numeros reais declarados.
Retorne SOMENTE JSON valido sem markdown, sem texto fora do JSON.`;

function buildPrompt(state: OfferBookState): string {
  const scores = computeScores(state);
  const { cliente, icp, psicografia, oferta, concorrentes, diagnostico } = state;

  const global = Math.round(scores.reduce((s, x) => s + x.value, 0) / scores.length);

  const scoreLines = scores
    .map(
      (s) =>
        `- ${s.label}: ${s.value}/100 (${scoreTier(s.value) === "low" ? "Critico" : scoreTier(s.value) === "mid" ? "Atencao" : "Saudavel"})`,
    )
    .join("\n");

  const concorrentesStr =
    concorrentes.length > 0
      ? concorrentes
          .map(
            (c) =>
              `${c.nome}: ${c.posicionamento || c.ofertaPrincipal || "sem info"} (ticket ~${c.ticketEstimado || "?"})`,
          )
          .join(" | ")
      : "Nenhum mapeado";

  return `CLIENTE: ${cliente.empresa || "sem nome"}
Nicho: ${cliente.nicho || "-"} | Cidade: ${cliente.cidade || "-"}, ${cliente.estado || "-"} | Ticket medio: R$ ${cliente.ticketMedio || "-"}
Fonte de leads: ${cliente.fonteLeads || "-"}

DIAGNOSTICO:
Leads/mes: ${diagnostico.leadsMes || "-"} | Conversao atual: ${diagnostico.conversaoAtual || "-"}
Tempo resposta ao lead: ${diagnostico.tempoResposta || "-"}
Origem dos leads: ${diagnostico.origemLeads || "-"}
CRM: ${diagnostico.crm || "-"} | Vendedores: ${diagnostico.vendedores || "-"}

ICP:
Perfil: ${icp.profissao || "-"}, ${icp.idade || "-"}, renda ${icp.renda || "-"}
Problema principal: ${icp.problemaPrincipal || "-"}
Objetivo principal: ${icp.objetivoPrincipal || "-"}

PSICOGRAFIA:
Medos: ${psicografia.medos || "-"}
Objecoes: ${psicografia.objecoes || "-"}
Desejos/Gatilhos: ${psicografia.desejos || "-"}

OFERTA:
Produto: ${oferta.produto || "-"}
Transformacao prometida: ${oferta.transformacao || "-"}
Mecanismo unico: ${oferta.mecanismoUnico || "-"}
Garantia: ${oferta.garantia || "-"} | Prova: ${oferta.prova || "-"}
Diferenciais: ${oferta.diferencial || "-"}

CONCORRENTES: ${concorrentesStr}

SCORES (0-100):
${scoreLines}
Score global: ${global}/100

Gere exatamente este JSON:
{
  "sintese": {
    "posicionamento": "1-2 frases sobre o posicionamento atual de ${cliente.empresa || "a empresa"} e o que precisa mudar — especifico ao nicho e cidade",
    "diagnosticoCritico": "1-2 frases sobre o principal gargalo operacional detectado pelos scores — use os dados reais declarados",
    "ofertaIrresistivel": "1-2 frases sobre como a oferta precisa ser reposicionada para este ICP especifico",
    "mensagemPrincipal": "1 frase na voz do cliente ideal descrevendo o que ele sente antes de ser atendido — use os medos e objecoes reais"
  },
  "planoAcao": {
    "prioridades": [
      {"rank": 1, "area": "nome do score mais fraco", "titulo": "acao especifica em linguagem do nicho do cliente", "corpo": "contexto real com dados do cliente — por que esta acao agora", "metrica": "KPI mensuravel com numero ou percentual", "prazo": "30 dias"},
      {"rank": 2, "area": "nome do segundo score mais fraco", "titulo": "acao especifica", "corpo": "contexto real", "metrica": "KPI mensuravel", "prazo": "60 dias"},
      {"rank": 3, "area": "nome do terceiro score mais fraco", "titulo": "acao especifica", "corpo": "contexto real", "metrica": "KPI mensuravel", "prazo": "90 dias"}
    ]
  },
  "roadmap": {
    "fases": [
      {"numero": 1, "titulo": "titulo da fase para ${cliente.empresa || "a empresa"}", "horizonte": "Mes 1-2", "foco": "tema central desta fase", "itens": ["entregavel especifico 1", "entregavel especifico 2", "entregavel especifico 3"]},
      {"numero": 2, "titulo": "titulo da segunda fase", "horizonte": "Mes 3-4", "foco": "tema central", "itens": ["entregavel 1", "entregavel 2", "entregavel 3"]},
      {"numero": 3, "titulo": "titulo da terceira fase", "horizonte": "Mes 5-6", "foco": "tema central", "itens": ["entregavel 1", "entregavel 2", "entregavel 3"]}
    ]
  }
}`;
}

function validateAiOutput(raw: unknown): raw is AiOutput {
  if (!raw || typeof raw !== "object") return false;
  const o = raw as Record<string, unknown>;
  if (!o.sintese || typeof o.sintese !== "object") return false;
  if (!o.planoAcao || typeof o.planoAcao !== "object") return false;
  if (!o.roadmap || typeof o.roadmap !== "object") return false;
  const s = o.sintese as Record<string, unknown>;
  if (typeof s.posicionamento !== "string") return false;
  const pa = o.planoAcao as Record<string, unknown>;
  if (!Array.isArray(pa.prioridades)) return false;
  const rm = o.roadmap as Record<string, unknown>;
  if (!Array.isArray(rm.fases)) return false;
  return true;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY nao configurada em .env.local" },
      { status: 503 },
    );
  }

  let body: { clienteId?: string; state?: OfferBookState; force?: boolean };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 });
  }

  const { clienteId, state, force = false } = body;
  if (!clienteId || !state) {
    return NextResponse.json(
      { error: "clienteId e state sao obrigatorios" },
      { status: 400 },
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const sb = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  // Return cached output if available and not forcing regeneration
  if (!force) {
    const { data: existing } = await sb
      .from("offer_books")
      .select("ai_output, ai_generated_at, ai_model")
      .eq("cliente_id", clienteId)
      .maybeSingle();

    if (existing?.ai_output) {
      const cached = existing.ai_output as AiOutput;
      if (validateAiOutput(cached)) {
        const response: AiGenerateResponse = {
          ...cached,
          generatedAt: (existing.ai_generated_at as string) ?? new Date().toISOString(),
          tokensUsed: 0,
          model: (existing.ai_model as string) ?? "cached",
          cached: true,
        };
        return NextResponse.json(response);
      }
    }
  }

  // Generate with Claude
  const userPrompt = buildPrompt(state);

  let rawText: string;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any = {
      model: "claude-opus-4-8",
      max_tokens: 2048,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userPrompt }],
    };

    const message = await anthropic.messages.create(params);

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("Resposta do Claude sem bloco de texto");
    }
    rawText = textBlock.text;

    // Persist token usage
    const tokensUsed =
      (message.usage?.input_tokens ?? 0) + (message.usage?.output_tokens ?? 0);
    const generatedAt = new Date().toISOString();

    // Parse JSON (Claude may wrap in markdown fences)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON nao encontrado na resposta do Claude");

    const parsed: unknown = JSON.parse(jsonMatch[0]);
    if (!validateAiOutput(parsed)) {
      throw new Error("Estrutura JSON invalida — campos obrigatorios ausentes");
    }

    // Persist to Supabase
    const { error: updateErr } = await sb
      .from("offer_books")
      .update({
        ai_output: parsed,
        ai_generated_at: generatedAt,
        ai_model: "claude-opus-4-8",
      })
      .eq("cliente_id", clienteId);

    if (updateErr) {
      console.error("[offer-book/generate] Supabase update failed:", updateErr);
    }

    const response: AiGenerateResponse = {
      ...(parsed as AiOutput),
      generatedAt,
      tokensUsed,
      model: "claude-opus-4-8",
      cached: false,
    };
    return NextResponse.json(response);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("[offer-book/generate]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
