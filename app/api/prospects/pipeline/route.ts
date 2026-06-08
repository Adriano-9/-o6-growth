import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Claude precisa de até ~30s + audit interno ~30s
export const maxDuration = 120;

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type PipelineInput = { prospect_id: string; force?: boolean; skipDemo?: boolean };

type Recommendation = {
  priority: "P1" | "P2" | "P3";
  title: string;
  description: string;
  impact_brl?: number;
};

type AuditResult = {
  prospectId: string;
  auditUrl: string;
  seoScore: number;
  performanceScore: number;
  uxScore: number;
  trustScore: number;
  conversionScore: number;
  mobileScore: number;
  contentScore: number;
  overallScore: number;
  psiDesktopScore?: number;
  psiMobileScore?: number;
  recommendations: Recommendation[];
};

type ProspectRow = {
  id: string;
  nome: string;
  site: string;
  cidade: string;
  estado: string;
  categoria: string;
  telefone: string;
  google_rating: number | null;
  google_reviews: number | null;
  audit_score: number | null;
  audit_json: AuditResult | null;
  abertura_whatsapp: string | null;
  demo_url: string | null;
};

// ─────────────────────────────────────────────────────────────
// Build WhatsApp opener prompt
// ─────────────────────────────────────────────────────────────

function buildOpenerPrompt(p: ProspectRow, audit: AuditResult): string {
  const cidade = p.cidade || "sua cidade";
  const categoria = p.categoria || "seu segmento";

  const weakest = [
    { key: "SEO", value: audit.seoScore },
    { key: "UX", value: audit.uxScore },
    { key: "Trust", value: audit.trustScore },
    { key: "Conversão", value: audit.conversionScore },
    { key: "Performance", value: audit.performanceScore },
    { key: "Mobile", value: audit.mobileScore },
    { key: "Conteúdo", value: audit.contentScore },
  ]
    .sort((a, b) => a.value - b.value)
    .slice(0, 2);

  const topRecs = audit.recommendations.slice(0, 3).map((r) => `- [${r.priority}] ${r.title}: ${r.description}`).join("\n");

  return `Você está gerando uma mensagem de PRIMEIRO CONTATO no WhatsApp para um prospect comercial brasileiro.

PROSPECT
Nome do negócio: ${p.nome}
Categoria: ${categoria}
Cidade: ${cidade}${p.estado ? "/" + p.estado : ""}
Site: ${p.site}
Avaliação Google: ${p.google_rating ?? "—"} (${p.google_reviews ?? 0} reviews)

AUDITORIA DO SITE (0-100, quanto mais alto, melhor)
- SEO: ${audit.seoScore}
- Performance: ${audit.performanceScore}
- UX: ${audit.uxScore}
- Trust: ${audit.trustScore}
- Conversão: ${audit.conversionScore}
- Mobile: ${audit.mobileScore}
- Conteúdo: ${audit.contentScore}
- Score geral: ${audit.overallScore}

PIORES EIXOS (mencione no opener):
${weakest.map((w) => `- ${w.key}: ${w.value}/100`).join("\n")}

PRINCIPAIS PROBLEMAS ENCONTRADOS:
${topRecs || "(nenhuma recomendação P1 ainda)"}

INSTRUÇÕES OBRIGATÓRIAS
1. 3 a 4 linhas. Casual, pt-BR, sem corporativês.
2. Comece chamando o negócio pelo nome (ou pelo dono se aparente).
3. Cite UM problema concreto encontrado no site (cite o eixo pior por valor).
4. Termine com uma pergunta aberta — convite ao diálogo, não pitch direto.
5. Tom: consultor especialista, não vendedor. Curiosidade > urgência.
6. Sem emoji. Sem "olá" formal. Use "oi" se for usar saudação.
7. NÃO mencione o número do score (apenas o sintoma).
8. NÃO ofereça preço, plano, demo ou agenda.

Responda APENAS com a mensagem em texto puro. Sem aspas. Sem prefácio. Sem markdown.`;
}

// ─────────────────────────────────────────────────────────────
// Claude call
// ─────────────────────────────────────────────────────────────

async function generateOpener(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY não configurada");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Claude ${res.status}: ${txt.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; text: string }>;
  };
  const text = data.content?.[0]?.text?.trim() ?? "";
  if (!text) throw new Error("Claude retornou resposta vazia");

  // Strip eventual markdown fences ou aspas que o modelo possa adicionar
  return text
    .replace(/^```(?:markdown|text)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .replace(/^["']|["']$/g, "")
    .trim();
}

// ─────────────────────────────────────────────────────────────
// POST /api/prospects/pipeline
// ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: PipelineInput;
  try {
    body = (await req.json()) as PipelineInput;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { prospect_id, force = false, skipDemo = false } = body;
  if (!prospect_id) {
    return NextResponse.json(
      { error: "prospect_id é obrigatório" },
      { status: 400 },
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Supabase não configurado" },
      { status: 503 },
    );
  }

  const sb = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  const { data: rowRaw, error: readErr } = await sb
    .from("prospects")
    .select(
      "id, nome, site, cidade, estado, categoria, telefone, google_rating, google_reviews, audit_score, audit_json, abertura_whatsapp, demo_url",
    )
    .eq("id", prospect_id)
    .maybeSingle();

  if (readErr || !rowRaw) {
    return NextResponse.json(
      { error: "Prospect não encontrado" },
      { status: 404 },
    );
  }
  const prospect = rowRaw as ProspectRow;

  if (!prospect.site || !prospect.site.startsWith("http")) {
    // Tenta normalizar adicionando https
    if (prospect.site && !prospect.site.startsWith("http")) {
      prospect.site = "https://" + prospect.site;
    } else {
      return NextResponse.json(
        { error: "Prospect não tem site para auditar" },
        { status: 400 },
      );
    }
  }

  // ─── Cache: se já tem abordagem e force=false, devolve sem regerar
  if (!force && prospect.abertura_whatsapp && prospect.audit_json) {
    return NextResponse.json({
      audit: prospect.audit_json,
      auditScore: prospect.audit_score,
      abertura: prospect.abertura_whatsapp,
      demoUrl: prospect.demo_url ?? null,
      cached: true,
    });
  }

  // ─── 1. Audit via rota existente
  const origin = req.nextUrl.origin;
  let audit: AuditResult;
  try {
    const auditRes = await fetch(`${origin}/api/audit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prospectId: prospect.id, auditUrl: prospect.site }),
    });

    if (!auditRes.ok) {
      const err = (await auditRes.json().catch(() => ({}))) as { error?: string };
      throw new Error(err.error || `Audit ${auditRes.status}`);
    }
    audit = (await auditRes.json()) as AuditResult;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro no audit";
    console.error("[prospects/pipeline] audit failed", msg);
    return NextResponse.json({ error: `Audit falhou: ${msg}` }, { status: 502 });
  }

  // ─── 2. Claude gera abertura
  let abertura: string;
  try {
    const prompt = buildOpenerPrompt(prospect, audit);
    abertura = await generateOpener(prompt);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro no Claude";
    console.error("[prospects/pipeline] opener failed", msg);
    return NextResponse.json(
      { error: `Geração de mensagem falhou: ${msg}` },
      { status: 502 },
    );
  }

  // ─── 3. Demo site generation (fail-soft — pipeline continua sem demo se falhar)
  let demoUrl: string | null = null;
  if (!skipDemo && process.env.VERCEL_TOKEN) {
    try {
      const demoRes = await fetch(`${origin}/api/prospects/demo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospect_id: prospect.id }),
      });
      if (demoRes.ok) {
        const demoData = (await demoRes.json()) as { url?: string };
        demoUrl = demoData.url ?? null;
      } else {
        const demoErr = (await demoRes.json().catch(() => ({}))) as { error?: string };
        console.warn("[prospects/pipeline] demo skipped:", demoErr.error);
      }
    } catch (err) {
      console.warn("[prospects/pipeline] demo failed (non-fatal):", err);
    }
  }

  // ─── 4. Append demo URL to abertura if available
  if (demoUrl) {
    abertura =
      abertura +
      `\n\nAh, e montamos uma versão melhorada do site de vocês como demonstração: ${demoUrl} — o que você acha?`;
  }

  // ─── 5. Persiste tudo no prospect
  const updatePayload: Record<string, unknown> = {
    audit_score: audit.overallScore,
    audit_json: audit,
    abertura_whatsapp: abertura,
    abordagem_gerada_em: new Date().toISOString(),
    status: demoUrl ? "Demo Gerada" : "Auditado",
  };

  const { error: updErr } = await sb
    .from("prospects")
    .update(updatePayload)
    .eq("id", prospect.id);

  if (updErr) {
    console.error("[prospects/pipeline] update failed", updErr);
    // Fail-soft: devolve a resposta mesmo se persist falhou
  }

  return NextResponse.json({
    audit,
    auditScore: audit.overallScore,
    abertura,
    demoUrl,
    cached: false,
  });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
