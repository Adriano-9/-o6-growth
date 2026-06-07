import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabase } from "@/app/offer-book/_lib/supabase";
import { computeScores, scoreTier } from "@/app/offer-book/_lib/scores";
import { OfferBookState } from "@/app/offer-book/_lib/types";
import { AiOutput, AiGenerateResponse } from "@/app/offer-book/_lib/ai-types";

export const maxDuration = 120;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? "" });

const SYSTEM_PROMPT = `Voce e um consultor estrategico senior especializado em clinicas medicas, estetica, odontologia, fisioterapia e escritorios de advocacia no Brasil. Seu trabalho e diagnosticar o negocio e entregar um plano cirurgico de crescimento comercial.

Contexto de mercado: ticket medio R$1.500-R$8.000, ciclo consultivo, dor principal e aquisicao e conversao de leads qualificados. Concorrencia local intensa. Decisao de compra emocional com racionalizacao posterior.

Regras inegociaveis:
- Use SEMPRE os dados reais declarados pelo cliente — nome da empresa, cidade, nicho especifico, numeros de conversao, tempo de resposta
- NUNCA use linguagem generica de SaaS ("transforme", "escale", "otimize" sem contexto)
- Cite os numeros exatos quando disponíveis ("seus 8% de conversao", "suas 30 leads/mes")
- Cada recomendacao deve ser especifica ao nicho E a cidade declarada
- O diagnostico critico deve identificar O UNICO maior gargalo, nao uma lista
- A oferta irresistivel deve ser reescrita em primeira pessoa do cliente ideal
- Retorne SOMENTE JSON valido. Sem markdown, sem texto fora do JSON.`;

function buildPrompt(state: OfferBookState): string {
  const scores = computeScores(state);
  const { cliente, icp, psicografia, oferta, concorrentes, diagnostico } = state;

  const globalScore = Math.round(
    scores.reduce((s, x) => s + x.value, 0) / scores.length,
  );

  const scoreLinesStr = scores
    .map(
      (s) =>
        `- ${s.label}: ${s.value}/100 (${
          scoreTier(s.value) === "low"
            ? "CRITICO"
            : scoreTier(s.value) === "mid"
              ? "ATENCAO"
              : "SAUDAVEL"
        }) — ${s.description}`,
    )
    .join("\n");

  const worstScores = [...scores].sort((a, b) => a.value - b.value).slice(0, 3);
  const worstStr = worstScores
    .map((s) => `${s.label} (${s.value}/100)`)
    .join(", ");

  const concorrentesStr =
    concorrentes.length > 0
      ? concorrentes
          .map(
            (c) =>
              `${c.nome}${c.posicionamento ? ` — posicionamento: "${c.posicionamento}"` : ""}${
                c.ofertaPrincipal ? ` — oferta: "${c.ofertaPrincipal}"` : ""
              }${c.ticketEstimado ? ` — ticket ~${c.ticketEstimado}` : ""}`,
          )
          .join("\n  ")
      : "Nenhum concorrente mapeado";

  const ticketStr =
    diagnostico.ticketMedio || cliente.ticketMedio || "não declarado";

  const leadsStr = diagnostico.leadsMes
    ? `${diagnostico.leadsMes} leads/mes`
    : "volume não declarado";

  const convStr = diagnostico.conversaoAtual || "nao declarada";

  return `DADOS DO CLIENTE
Empresa: ${cliente.empresa || "sem nome"}
Nicho: ${cliente.nicho || "nao declarado"}
Cidade/Estado: ${cliente.cidade || "?"}, ${cliente.estado || "?"}
Site: ${cliente.site || "sem site"}
Ticket medio: R$ ${ticketStr}
Fonte de leads declarada: ${cliente.fonteLeads || "nao declarada"}

DIAGNOSTICO OPERACIONAL
Leads/mes: ${leadsStr}
Conversao atual: ${convStr}
Tempo de resposta ao lead: ${diagnostico.tempoResposta || "nao declarado"}
Origem dos leads (detalhe): ${diagnostico.origemLeads || "nao declarado"}
CRM em uso: ${diagnostico.crm || "nao declarado"}
Equipe de vendas: ${diagnostico.vendedores || "nao declarado"}

ICP (Cliente Ideal)
Perfil: ${icp.profissao || "?"}, ${icp.idade || "?"}, renda ${icp.renda || "?"}
Momento de vida: ${icp.momentoVida || "?"}
Problema principal: ${icp.problemaPrincipal || "nao declarado"}
Objetivo principal: ${icp.objetivoPrincipal || "nao declarado"}

PSICOGRAFIA
Desejos/gatilhos: ${psicografia.desejos || "nao declarado"}
Medos antes de comprar: ${psicografia.medos || "nao declarado"}
Objecoes tipicas: ${psicografia.objecoes || "nao declarado"}
Frustracoes com o mercado: ${psicografia.frustracoes || "nao declarado"}

OFERTA
Produto/servico: ${oferta.produto || "nao declarado"}
Ticket do produto: ${oferta.ticket || "nao declarado"}
Transformacao prometida: ${oferta.transformacao || "nao declarado"}
Mecanismo unico: ${oferta.mecanismoUnico || "nao declarado"}
Diferencial: ${oferta.diferencial || "nao declarado"}
Garantia: ${oferta.garantia || "nao declarado"}
Prova social: ${oferta.prova || "nao declarado"}

CONCORRENTES MAPEADOS (${concorrentes.length} total)
  ${concorrentesStr}

SCORES CALCULADOS (0-100)
${scoreLinesStr}
Score global: ${globalScore}/100
Tres piores: ${worstStr}

INSTRUCAO
Gere exatamente este JSON preenchendo todos os campos com analise especifica para ${cliente.empresa || "esta empresa"} em ${cliente.nicho || "este nicho"} em ${cliente.cidade || "esta cidade"}:
{
  "sintese": {
    "posicionamento": "1-2 frases diagnosticando o posicionamento atual de ${cliente.empresa || "a empresa"} versus os ${concorrentes.length} concorrentes mapeados — o que os diferencia hoje e por que isso nao e suficiente para dominar ${cliente.cidade || "o mercado local"}",
    "diagnosticoCritico": "1-2 frases identificando O UNICO maior gargalo operacional — use os dados reais: ${leadsStr}, conversao ${convStr}, tempo de resposta ${diagnostico.tempoResposta || "nao declarado"}",
    "ofertaIrresistivel": "1-2 frases reescrevendo a oferta de ${oferta.produto || "o produto"} do ponto de vista do ICP — como ela elimina '${icp.problemaPrincipal || "o problema principal"}' de forma unica",
    "mensagemPrincipal": "1 frase na voz do cliente ideal (${icp.profissao || "cliente"} em ${cliente.cidade || "?"}) descrevendo o que ele sente ANTES de ser atendido — use os medos '${psicografia.medos || "nao declarados"}'"
  },
  "planoAcao": {
    "prioridades": [
      {"rank": 1, "area": "${worstScores[0]?.label ?? "Area critica"}", "titulo": "acao especifica com verbo imperativo referenciando o nicho ${cliente.nicho || "do cliente"}", "corpo": "por que esta acao agora — cite o dado real que justifica (ex: score ${worstScores[0]?.value ?? 0}/100)", "metrica": "KPI mensuravel com numero ou percentual especifico para este negocio", "prazo": "30 dias"},
      {"rank": 2, "area": "${worstScores[1]?.label ?? "Segunda area"}", "titulo": "acao especifica", "corpo": "contexto real com dados do cliente", "metrica": "KPI mensuravel", "prazo": "60 dias"},
      {"rank": 3, "area": "${worstScores[2]?.label ?? "Terceira area"}", "titulo": "acao especifica", "corpo": "contexto real", "metrica": "KPI mensuravel", "prazo": "90 dias"}
    ]
  },
  "roadmap": {
    "fases": [
      {"numero": 1, "titulo": "titulo da fase 1 especifico para ${cliente.empresa || "a empresa"}", "horizonte": "Mes 1-2", "foco": "tema central derivado do pior score (${worstScores[0]?.label ?? "area critica"})", "itens": ["entregavel concreto 1 no nicho ${cliente.nicho || "do cliente"}", "entregavel concreto 2", "entregavel concreto 3", "entregavel concreto 4"]},
      {"numero": 2, "titulo": "titulo da fase 2", "horizonte": "Mes 3-4", "foco": "tema central do segundo gargalo", "itens": ["entregavel 1", "entregavel 2", "entregavel 3", "entregavel 4"]},
      {"numero": 3, "titulo": "titulo da fase 3", "horizonte": "Mes 5-6", "foco": "consolidacao e previsibilidade", "itens": ["entregavel 1", "entregavel 2", "entregavel 3", "entregavel 4"]}
    ]
  },
  "strategic": {
    "curtoPrazo": {
      "horizonte": "0-30 dias",
      "objetivo": "objetivo mensuravel especifico para ${cliente.empresa || "a empresa"} no primeiro mes",
      "acoes": [
        {"acao": "acao especifica 1 no contexto de ${cliente.nicho || "o nicho"}", "impacto": "impacto esperado com numero", "responsavel": "cargo ou perfil responsavel"},
        {"acao": "acao especifica 2", "impacto": "impacto esperado", "responsavel": "cargo"},
        {"acao": "acao especifica 3", "impacto": "impacto esperado", "responsavel": "cargo"}
      ]
    },
    "medioPrazo": {
      "horizonte": "30-90 dias",
      "objetivo": "objetivo mensuravel para o trimestre",
      "acoes": [
        {"acao": "acao 1", "impacto": "impacto", "responsavel": "cargo"},
        {"acao": "acao 2", "impacto": "impacto", "responsavel": "cargo"},
        {"acao": "acao 3", "impacto": "impacto", "responsavel": "cargo"}
      ]
    },
    "longoPrazo": {
      "horizonte": "90-180 dias",
      "objetivo": "objetivo de posicionamento estrategico para ${cliente.empresa || "a empresa"} em ${cliente.cidade || "o mercado"}",
      "acoes": [
        {"acao": "acao 1", "impacto": "impacto", "responsavel": "cargo"},
        {"acao": "acao 2", "impacto": "impacto", "responsavel": "cargo"},
        {"acao": "acao 3", "impacto": "impacto", "responsavel": "cargo"}
      ]
    },
    "potencialReceita": "estimativa de receita potencial em 6 meses baseada em ${leadsStr} × ticket ${ticketStr} com a conversao alvo especifica",
    "principalGargalo": "nome do gargalo mais critico em 1 frase",
    "diferencial": "o que diferencia ${cliente.empresa || "a empresa"} de forma genuina dos ${concorrentes.length} concorrentes mapeados"
  },
  "insightsOcultos": {
    "medosOcultos": ["4-5 medos que o ICP (${icp.profissao || "cliente ideal"}) NAO declara mas tem antes de comprar de ${cliente.empresa || "a empresa"} — vao alem dos medos listados em '${psicografia.medos || "nao declarado"}'. Pense em medo de julgamento social, medo de admitir vulnerabilidade, medo de ser enganado por um nicho que ele nao entende. Cada item em 1 frase, na primeira pessoa do ICP."],
    "desejosOcultos": ["4-5 desejos que o ICP NAO admite publicamente mas sente — vao alem dos desejos declarados em '${psicografia.desejos || "nao declarado"}'. Pense em status, validacao, ser invejado, recuperar algo perdido, sentir-se especial. Cada item em 1 frase, na primeira pessoa."],
    "objecoesEmocionais": ["4-5 objecoes emocionais (NAO racionais como 'caro' ou 'falta tempo') que travam a compra. Pense em medo de arrependimento, medo do julgamento de familiares, vergonha do problema, sensacao de que nao merece. Cada item em 1 frase."],
    "crencasLimitantes": ["4-5 crencas limitantes que o ICP carrega sobre ${cliente.nicho || "este tipo de servico"} ou sobre si mesmo. Pense em 'isso nao funciona pra mim', 'ja tentei tudo', 'no meu caso e diferente', 'so resolve com cirurgia/processo dificil'. Cada item em 1 frase."],
    "padroesLinguagem": ["4-5 expressoes ou termos que ESTE ICP especificamente usa quando descreve o problema. Use o tom real do ${icp.profissao || "cliente"} em ${cliente.cidade || "?"} — gírias regionais, jargao do nicho, eufemismos. Cada item em 1 frase entre aspas."],
    "arquetiposDominantes": [
      {"nome": "nome do arquetipo (ex: Buscador, Cuidador Cansado, Realizador Frustrado)", "descricao": "1-2 frases descrevendo este arquetipo no contexto do nicho ${cliente.nicho || "do cliente"} e como ele se manifesta no comportamento de compra"},
      {"nome": "segundo arquetipo", "descricao": "1-2 frases"}
    ],
    "gatilhosCompra": [
      {"gatilho": "nome do gatilho psicologico (ex: Prova social local, Escassez de horario, Autoridade do especialista)", "quando": "momento exato ou cenario em que este gatilho funciona melhor para o ICP de ${cliente.empresa || "a empresa"}"},
      {"gatilho": "segundo gatilho", "quando": "contexto especifico"},
      {"gatilho": "terceiro gatilho", "quando": "contexto"},
      {"gatilho": "quarto gatilho", "quando": "contexto"}
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
  if (!o.strategic || typeof o.strategic !== "object") return false;
  const s = o.sintese as Record<string, unknown>;
  if (typeof s.posicionamento !== "string") return false;
  const pa = o.planoAcao as Record<string, unknown>;
  if (!Array.isArray(pa.prioridades)) return false;
  const rm = o.roadmap as Record<string, unknown>;
  if (!Array.isArray(rm.fases)) return false;
  return true;
}

function validateAiOutputLenient(raw: unknown): raw is AiOutput {
  if (!raw || typeof raw !== "object") return false;
  const o = raw as Record<string, unknown>;
  if (!o.sintese || typeof o.sintese !== "object") return false;
  if (!o.planoAcao || typeof o.planoAcao !== "object") return false;
  if (!o.roadmap || typeof o.roadmap !== "object") return false;
  const pa = o.planoAcao as Record<string, unknown>;
  if (!Array.isArray(pa.prioridades)) return false;
  const rm = o.roadmap as Record<string, unknown>;
  if (!Array.isArray(rm.fases)) return false;
  // strategic is optional in lenient mode — fill with defaults if missing
  if (!o.strategic) {
    (o as Record<string, unknown>).strategic = {
      curtoPrazo: { horizonte: "0-30 dias", objetivo: "", acoes: [] },
      medioPrazo: { horizonte: "30-90 dias", objetivo: "", acoes: [] },
      longoPrazo: { horizonte: "90-180 dias", objetivo: "", acoes: [] },
      potencialReceita: "",
      principalGargalo: "",
      diferencial: "",
    };
  }
  // insightsOcultos é opcional — caches antigos não têm. Preenche com defaults vazios.
  if (!o.insightsOcultos) {
    (o as Record<string, unknown>).insightsOcultos = {
      medosOcultos: [],
      desejosOcultos: [],
      objecoesEmocionais: [],
      crencasLimitantes: [],
      padroesLinguagem: [],
      arquetiposDominantes: [],
      gatilhosCompra: [],
    };
  }
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

  const sb = getSupabase();
  if (!sb) {
    return NextResponse.json({ error: "Supabase nao configurado" }, { status: 503 });
  }

  if (!force) {
    const { data: existing } = await sb
      .from("offer_books")
      .select("ai_output, ai_generated_at, ai_model")
      .eq("cliente_id", clienteId)
      .maybeSingle();

    if (existing?.ai_output) {
      const cached = existing.ai_output as AiOutput;
      if (validateAiOutput(cached) || validateAiOutputLenient(cached)) {
        const response: AiGenerateResponse = {
          ...cached,
          generatedAt:
            (existing.ai_generated_at as string) ?? new Date().toISOString(),
          tokensUsed: 0,
          model: (existing.ai_model as string) ?? "cached",
          cached: true,
        };
        return NextResponse.json(response);
      }
    }
  }

  const userPrompt = buildPrompt(state);

  try {
    const message = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 6144,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("Resposta do Claude sem bloco de texto");
    }
    const rawText = textBlock.text;

    const tokensUsed =
      (message.usage?.input_tokens ?? 0) + (message.usage?.output_tokens ?? 0);
    const generatedAt = new Date().toISOString();

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON nao encontrado na resposta do Claude");

    const parsed: unknown = JSON.parse(jsonMatch[0]);
    if (!validateAiOutputLenient(parsed)) {
      throw new Error("Estrutura JSON invalida — campos obrigatorios ausentes");
    }

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
