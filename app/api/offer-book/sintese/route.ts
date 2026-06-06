import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type ScoreInput = { key: string; label: string; value: number };

type SinteseInput = {
  clienteId: string;
  cliente: {
    empresa: string;
    nicho: string;
    cidade: string;
    estado: string;
    ticketMedio: string;
    fonteLeads: string;
    site: string;
    instagram: string;
  };
  icp: {
    idade: string;
    sexo: string;
    renda: string;
    profissao: string;
    momentoVida: string;
    objetivoPrincipal: string;
    problemaPrincipal: string;
  };
  psicografia: {
    desejos: string;
    medos: string;
    objecoes: string;
    frustracoes: string;
    sonhos: string;
    crencas: string;
  };
  oferta: {
    produto: string;
    ticket: string;
    garantia: string;
    transformacao: string;
    diferencial: string;
    mecanismoUnico: string;
    prova: string;
  };
  concorrentes: Array<{
    nome: string;
    posicionamento: string;
    ofertaPrincipal: string;
    ticketEstimado: string;
  }>;
  diagnostico: {
    tempoResposta: string;
    origemLeads: string;
    crm: string;
    vendedores: string;
    ticketMedio: string;
    conversaoAtual: string;
    leadsMes: string;
  };
  scores: ScoreInput[];
};

type SinteseFields = {
  posicionamento: string;
  diagnosticoCritico: string;
  ofertaIrresistivel: string;
  mensagemPrincipal: string;
};

const CACHE_TTL_DAYS = 7;

// Required for Vercel — Claude calls take 5-30s
export const maxDuration = 60;

// ─────────────────────────────────────────────────────────────
// Prompt builder — pt-BR, usa valores literais (sem placeholder)
// ─────────────────────────────────────────────────────────────

function valOr(v: string | undefined | null): string {
  return v && v.trim().length > 0 ? v.trim() : "(não informado)";
}

function buildPrompt(d: SinteseInput): string {
  const concorrentesText =
    d.concorrentes.length > 0
      ? d.concorrentes
          .map(
            (c, i) =>
              `  ${i + 1}. ${valOr(c.nome)} — Posicionamento: ${valOr(c.posicionamento)} — Oferta: ${valOr(c.ofertaPrincipal)} — Ticket: ${valOr(c.ticketEstimado)}`,
          )
          .join("\n")
      : "  (nenhum concorrente mapeado)";

  const scoresText = d.scores
    .map((s) => `  - ${s.label}: ${s.value}/100`)
    .join("\n");

  return `Você é um consultor sênior em estratégia comercial para serviços profissionais brasileiros (clínicas de estética, odontologia, fisioterapia, advocacia). Sua tarefa é gerar uma SÍNTESE ESTRATÉGICA de alta qualidade a partir dos dados de inteligência comercial deste cliente.

═══════════════════════════════════════════════════════════════
DADOS DA EMPRESA
═══════════════════════════════════════════════════════════════
Empresa: ${valOr(d.cliente.empresa)}
Nicho: ${valOr(d.cliente.nicho)}
Localização: ${valOr(d.cliente.cidade)}/${valOr(d.cliente.estado)}
Site: ${valOr(d.cliente.site)}
Instagram: ${valOr(d.cliente.instagram)}
Ticket médio atual: ${valOr(d.cliente.ticketMedio)}
Fonte atual de leads: ${valOr(d.cliente.fonteLeads)}

═══════════════════════════════════════════════════════════════
ICP (PERFIL DO CLIENTE IDEAL)
═══════════════════════════════════════════════════════════════
Idade: ${valOr(d.icp.idade)}
Sexo: ${valOr(d.icp.sexo)}
Renda: ${valOr(d.icp.renda)}
Profissão: ${valOr(d.icp.profissao)}
Momento de vida: ${valOr(d.icp.momentoVida)}
Objetivo principal: ${valOr(d.icp.objetivoPrincipal)}
Problema principal: ${valOr(d.icp.problemaPrincipal)}

═══════════════════════════════════════════════════════════════
PSICOGRAFIA DO ICP (mapa interno)
═══════════════════════════════════════════════════════════════
Desejos: ${valOr(d.psicografia.desejos)}
Medos: ${valOr(d.psicografia.medos)}
Objeções: ${valOr(d.psicografia.objecoes)}
Frustrações: ${valOr(d.psicografia.frustracoes)}
Sonhos: ${valOr(d.psicografia.sonhos)}
Crenças: ${valOr(d.psicografia.crencas)}

═══════════════════════════════════════════════════════════════
OFERTA ATUAL
═══════════════════════════════════════════════════════════════
Produto: ${valOr(d.oferta.produto)}
Ticket: ${valOr(d.oferta.ticket)}
Garantia: ${valOr(d.oferta.garantia)}
Transformação prometida: ${valOr(d.oferta.transformacao)}
Diferencial: ${valOr(d.oferta.diferencial)}
Mecanismo único: ${valOr(d.oferta.mecanismoUnico)}
Prova/cases: ${valOr(d.oferta.prova)}

═══════════════════════════════════════════════════════════════
CONCORRENTES
═══════════════════════════════════════════════════════════════
${concorrentesText}

═══════════════════════════════════════════════════════════════
DIAGNÓSTICO OPERACIONAL DO PIPELINE
═══════════════════════════════════════════════════════════════
Tempo de resposta ao lead: ${valOr(d.diagnostico.tempoResposta)}
Origem dos leads: ${valOr(d.diagnostico.origemLeads)}
CRM utilizado: ${valOr(d.diagnostico.crm)}
Número de vendedores: ${valOr(d.diagnostico.vendedores)}
Ticket médio: ${valOr(d.diagnostico.ticketMedio)}
Conversão atual: ${valOr(d.diagnostico.conversaoAtual)}
Leads por mês: ${valOr(d.diagnostico.leadsMes)}

═══════════════════════════════════════════════════════════════
SCORES CALCULADOS (0-100, mais alto = melhor)
═══════════════════════════════════════════════════════════════
${scoresText}

═══════════════════════════════════════════════════════════════
TAREFA
═══════════════════════════════════════════════════════════════

Gere uma resposta em JSON PURO (sem markdown, sem \`\`\`json, sem texto antes ou depois) com EXATAMENTE estas 4 chaves:

{
  "posicionamento": "...",
  "diagnosticoCritico": "...",
  "ofertaIrresistivel": "...",
  "mensagemPrincipal": "..."
}

REGRAS DE CADA CAMPO:

1. "posicionamento" (2-3 frases):
   O que torna ESTE negócio único no seu mercado.
   Use os dados de oferta, diferencial, mecanismo único e o gap dos concorrentes.
   Seja específico — cite o nicho, a transformação real e o que ninguém mais oferece.
   NÃO use clichês como "transforme seu negócio", "solução completa", "referência no mercado".

2. "diagnosticoCritico" (3-4 frases):
   O que está REALMENTE travando o crescimento agora, baseado nos dados.
   Use os scores mais baixos, os campos vazios e o diagnóstico operacional.
   Seja direto, sem eufemismo. Aponte o gargalo PRINCIPAL e a consequência financeira/operacional concreta.
   Se conversão é baixa, diga o número. Se tempo de resposta é alto, diga quanto está perdendo.

3. "ofertaIrresistivel" (3-5 frases):
   Reescreva a oferta como o COMPRADOR quer ouvir, na linguagem do ICP.
   Traga os desejos e sonhos (da Psicografia), ataque os medos e objeções listados.
   Mostre a transformação concreta e a garantia.
   NÃO venda o produto — venda o RESULTADO e o estado emocional final.
   Use "você" e linguagem direta com o ICP.

4. "mensagemPrincipal" (1 frase, em primeira pessoa do ICP):
   O que o prospect ideal diria ao ler a oferta e pensar "isso sou EU".
   Seja visceral, específico ao problema/desejo do ICP listado.
   Comece com "Eu..." ou "Quero..." ou similar.
   Use a linguagem do mundo real do ICP — não a corporativa.

RESTRIÇÕES:
- Linguagem: pt-BR, tom consultivo e direto.
- Use os DADOS LITERAIS fornecidos. NÃO invente fatos sobre a empresa.
- Se um campo está "(não informado)", trabalhe com o que TEM — não fabrique.
- Sem markdown, sem aspas extras, sem comentários.
- Responda APENAS com o objeto JSON.`;
}

// ─────────────────────────────────────────────────────────────
// Claude API call
// ─────────────────────────────────────────────────────────────

async function callClaude(prompt: string): Promise<SinteseFields> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY não configurada. Adicione em .env.local (obter em https://console.anthropic.com/settings/keys).",
    );
  }

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
    const text = await res.text().catch(() => "");
    throw new Error(`Claude API ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; text: string }>;
  };

  const raw = data.content?.[0]?.text?.trim() ?? "";
  if (!raw) {
    throw new Error("Claude retornou resposta vazia");
  }

  // Strip markdown fences se Claude embrulhar apesar das instruções
  const jsonText = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonText) as Record<string, unknown>;
  } catch {
    throw new Error(
      `Claude não retornou JSON válido. Primeiros 300 chars: ${raw.slice(0, 300)}`,
    );
  }

  const fields: SinteseFields = {
    posicionamento: String(parsed.posicionamento ?? "").trim(),
    diagnosticoCritico: String(parsed.diagnosticoCritico ?? "").trim(),
    ofertaIrresistivel: String(parsed.ofertaIrresistivel ?? "").trim(),
    mensagemPrincipal: String(parsed.mensagemPrincipal ?? "").trim(),
  };

  for (const [k, v] of Object.entries(fields)) {
    if (!v) {
      throw new Error(`Campo "${k}" veio vazio na resposta do Claude`);
    }
  }

  return fields;
}

// ─────────────────────────────────────────────────────────────
// POST /api/offer-book/sintese
// ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: SinteseInput;
  try {
    body = (await req.json()) as SinteseInput;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body.clienteId) {
    return NextResponse.json(
      { error: "clienteId é obrigatório" },
      { status: 400 },
    );
  }

  // Check cache — se row < 7 dias, retornar sem chamar Claude
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  );

  const cacheCutoff = new Date(
    Date.now() - CACHE_TTL_DAYS * 86400 * 1000,
  ).toISOString();

  const { data: cached, error: cacheErr } = await sb
    .from("offer_book_sintese")
    .select(
      "posicionamento, diagnostico_critico, oferta_irresistivel, mensagem_principal, created_at",
    )
    .eq("cliente_id", body.clienteId)
    .gte("created_at", cacheCutoff)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (cacheErr) {
    console.error("[api/sintese] cache read error", cacheErr);
    // Não falhar — segue para gerar nova
  }

  if (cached) {
    return NextResponse.json({
      posicionamento: cached.posicionamento,
      diagnosticoCritico: cached.diagnostico_critico,
      ofertaIrresistivel: cached.oferta_irresistivel,
      mensagemPrincipal: cached.mensagem_principal,
      cached: true,
      generatedAt: cached.created_at,
    });
  }

  // Cache miss — chamar Claude
  let result: SinteseFields;
  try {
    const prompt = buildPrompt(body);
    result = await callClaude(prompt);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao chamar Claude";
    console.error("[api/sintese] Claude error:", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  // Persistir nova síntese
  const { error: insertErr } = await sb.from("offer_book_sintese").insert({
    cliente_id: body.clienteId,
    posicionamento: result.posicionamento,
    diagnostico_critico: result.diagnosticoCritico,
    oferta_irresistivel: result.ofertaIrresistivel,
    mensagem_principal: result.mensagemPrincipal,
  });

  if (insertErr) {
    console.error("[api/sintese] insert error", insertErr);
    // Retornar resultado mesmo se cache falhou — fail-soft
  }

  return NextResponse.json({
    ...result,
    cached: false,
    generatedAt: new Date().toISOString(),
  });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
