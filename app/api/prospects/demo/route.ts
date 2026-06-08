import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

export const maxDuration = 120;

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type DemoInput = { prospect_id: string };

type Recommendation = {
  priority: "P1" | "P2" | "P3";
  title: string;
  description: string;
  impact_brl?: number;
};

type AuditJson = {
  seoScore: number;
  performanceScore: number;
  uxScore: number;
  trustScore: number;
  conversionScore: number;
  mobileScore: number;
  contentScore: number;
  overallScore: number;
  recommendations: Recommendation[];
};

type ProspectRow = {
  id: string;
  nome: string;
  site: string | null;
  cidade: string | null;
  estado: string | null;
  categoria: string | null;
  telefone: string | null;
  audit_json: AuditJson | null;
  audit_score: number | null;
  demo_url: string | null;
};

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 28);
}

// ─────────────────────────────────────────────────────────────
// Claude — generate HTML landing page
// ─────────────────────────────────────────────────────────────

function buildHtmlPrompt(p: ProspectRow): string {
  const categoria = p.categoria || "clínica de saúde";
  const cidade = p.cidade ? `${p.cidade}${p.estado ? "/" + p.estado : ""}` : "Brasil";
  const telefone = p.telefone || "";
  const whatsappNumber = telefone.replace(/\D/g, "");

  const problems = p.audit_json?.recommendations
    ?.slice(0, 5)
    ?.map((r) => `- [${r.priority}] ${r.title}: ${r.description}`)
    ?.join("\n") ?? "";

  const weakAxes = p.audit_json
    ? [
        { k: "SEO", v: p.audit_json.seoScore },
        { k: "Conversão", v: p.audit_json.conversionScore },
        { k: "Trust", v: p.audit_json.trustScore },
        { k: "Mobile", v: p.audit_json.mobileScore },
      ]
        .sort((a, b) => a.v - b.v)
        .slice(0, 2)
        .map((x) => x.k)
        .join(", ")
    : "";

  return `Você é um web designer especializado em clínicas de saúde e estética no Brasil.
Gere uma landing page HTML completa, moderna e de alta conversão para a seguinte clínica:

CLÍNICA
Nome: ${p.nome}
Segmento: ${categoria}
Cidade: ${cidade}
Telefone/WhatsApp: ${telefone}
Site original: ${p.site || "(sem site ativo)"}

${p.audit_json ? `PROBLEMAS IDENTIFICADOS NO SITE ATUAL (corrija nesta versão):
${problems}
Eixos mais fracos: ${weakAxes}` : ""}

REQUISITOS OBRIGATÓRIOS:
1. HTML completo, auto-contido, arquivo único — CSS APENAS inline no <style>
2. ZERO JavaScript — NÃO inclua nenhuma tag <script>. Nenhuma. A página deve funcionar sem JS.
3. ZERO dependências externas — sem Google Fonts, sem CDNs, sem @import de URLs externas, sem imagens de URL externa
4. Tipografia: font-family: system-ui, -apple-system, 'Segoe UI', sans-serif — apenas fontes do sistema
5. Mobile first (viewport meta, flexbox/grid responsivo, mínimo 375px)
6. Tema profissional claro com acentos modernos (não genérico, não branco simples)
7. Seções: Hero (nome + tagline + CTA), Serviços (3-4 cards), Diferenciais, Contato + WhatsApp, Footer
8. Botão WhatsApp flutuante ${whatsappNumber ? `linkando para https://wa.me/55${whatsappNumber}` : "(placeholder wa.me/55XX)"}
9. CTA principal: "Agendar Consulta" ou "Marcar Avaliação" — tom consultivo, não agressivo
10. Copy em pt-BR, tom profissional e acolhedor, específico para o segmento
11. Animações suaves apenas via CSS transitions e @keyframes — NENHUM JavaScript
12. Formulário de contato simples (nome, telefone, mensagem) — estético, sem backend, apenas HTML
13. Schema.org LocalBusiness em JSON-LD no <head>
14. Meta tags Open Graph para redes sociais
15. Imagens: usar gradientes CSS, ícones SVG inline ou emojis — sem imagens externas

DESIGN DIRECTION:
- Paleta: branco/cinza claro de fundo, um acento forte (azul petróleo, verde-esmeralda ou violeta, conforme o segmento)
- Tipografia bold e clean para headlines, regular para body
- Cards com sombra sutil, border-radius generoso (12-16px)
- Hero com gradiente suave ou padrão geométrico CSS
- Não genérico: personalize a copy para ${p.nome} em ${categoria}

CRÍTICO: A resposta deve ser HTML puro estático. NÃO use <script>. NÃO use @import de fontes externas. NÃO use src= com URLs externas.
Responda APENAS com o código HTML completo. Sem explicações. Sem markdown. Comece com <!DOCTYPE html>.`;
}

/**
 * Pull a complete HTML document out of whatever Claude returns. Handles:
 *  - raw HTML starting with <!DOCTYPE
 *  - HTML wrapped in ```html ... ``` (or just ``` ... ```)
 *  - HTML preceded/followed by explanation text ("Aqui está…")
 *  - HTML missing the DOCTYPE but starting at <html>
 *  - Markdown fences without language hint
 *
 * Strategy:
 *  1. Try to find a fenced code block first — that's the most reliable
 *     boundary when Claude adds prose.
 *  2. If no fence, find the FIRST `<!doctype` or `<html` and the LAST
 *     `</html>` and slice between them.
 *  3. If we still don't have a full document, wrap whatever HTML-looking
 *     content survives in a minimal shell so the deploy still produces
 *     something showable instead of crashing.
 *
 * Returns `{ html, source }` where `source` describes which branch fired
 * — used for debug logging.
 */
function extractHtmlFromResponse(
  raw: string,
): { html: string; source: string } {
  const trimmed = raw.trim();

  // Branch 1: fenced block ```html ... ```  /  ``` ... ```
  const fenceMatch = trimmed.match(
    /```(?:html|HTML)?\s*\n([\s\S]*?)\n```/,
  );
  if (fenceMatch && fenceMatch[1]) {
    const inner = fenceMatch[1].trim();
    if (inner.length > 50) {
      return { html: inner, source: "fenced" };
    }
  }

  // Branch 2: slice from the first DOCTYPE / <html> to the end.
  // We DON'T require a closing </html> — if Claude truncated mid-document
  // we'd rather salvage the partial HTML and append the missing closers
  // than fall through to the wrap fallback (which would nest the doc).
  const lowered = trimmed.toLowerCase();
  const doctypeIdx = lowered.indexOf("<!doctype");
  const htmlOpenIdx = lowered.indexOf("<html");
  const htmlCloseIdx = lowered.lastIndexOf("</html>");

  const startIdx =
    doctypeIdx >= 0
      ? doctypeIdx
      : htmlOpenIdx >= 0
        ? htmlOpenIdx
        : -1;

  if (startIdx >= 0) {
    // Prefer slicing through </html> if present; otherwise take everything
    // from startIdx to end of response.
    const endIdx =
      htmlCloseIdx > startIdx ? htmlCloseIdx + "</html>".length : trimmed.length;
    let sliced = trimmed.slice(startIdx, endIdx).trim();

    // Strip trailing markdown fence if the slice ended mid-fence
    // (e.g. truncated before the closing ```)
    sliced = sliced.replace(/\s*```\s*$/g, "").trim();

    // Auto-close common tags if truncation chopped them off
    const sLower = sliced.toLowerCase();
    if (!sLower.includes("</body>")) sliced += "\n</body>";
    if (!sLower.includes("</html>")) sliced += "\n</html>";

    // Ensure DOCTYPE prefix even if we sliced from <html>
    const hasDoctype = sliced.slice(0, 16).toLowerCase().startsWith("<!doctype");
    return {
      html: hasDoctype ? sliced : `<!DOCTYPE html>\n${sliced}`,
      source: hasDoctype
        ? htmlCloseIdx > startIdx
          ? "sliced-doctype"
          : "sliced-doctype-truncated"
        : htmlCloseIdx > startIdx
          ? "sliced-html"
          : "sliced-html-truncated",
    };
  }

  // Branch 3: we have SOME content but no proper boundaries — wrap it
  // so the deploy still produces a viewable page instead of erroring.
  const bodyCandidate = trimmed
    .replace(/```(?:html|HTML)?\s*/g, "")
    .replace(/```/g, "")
    .trim();

  if (bodyCandidate.length > 50) {
    const wrapped = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Demo — Pré-visualização</title>
<style>body{font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:900px;margin:0 auto;padding:24px;color:#1a1a1a;line-height:1.6}</style>
</head>
<body>
${bodyCandidate}
</body>
</html>`;
    return { html: wrapped, source: "wrapped-fallback" };
  }

  return { html: "", source: "empty" };
}

async function generateHtml(p: ProspectRow): Promise<string> {
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
      model: "claude-sonnet-4-6",
      // 12k > 8k so a moderately rich landing page (hero+services+
      // diferenciais+contato+footer with inline CSS) doesn't get
      // truncated mid-document. Truncation loses the closing </html>
      // and forces the extractor into a less reliable branch.
      max_tokens: 12000,
      messages: [{ role: "user", content: buildHtmlPrompt(p) }],
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Claude ${res.status}: ${txt.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; text: string }>;
    stop_reason?: string;
    usage?: { input_tokens?: number; output_tokens?: number };
  };
  const rawText = data.content?.[0]?.text ?? "";

  // ─── DIAGNOSTIC LOG: dump the raw response BEFORE any processing.
  // This is what the user asked for — when extraction fails we need to
  // see exactly what Claude returned (prose? markdown? truncated?).
  console.log("[prospects/demo] === Claude raw response ===");
  console.log(
    "[prospects/demo] stop_reason:",
    data.stop_reason,
    "| usage:",
    JSON.stringify(data.usage),
    "| length:",
    rawText.length,
  );
  console.log(
    "[prospects/demo] head (first 600):",
    rawText.slice(0, 600),
  );
  console.log(
    "[prospects/demo] tail (last 300):",
    rawText.slice(-300),
  );
  console.log("[prospects/demo] === end raw ===");

  if (!rawText.trim()) {
    throw new Error(
      `Claude retornou resposta vazia (stop_reason=${data.stop_reason ?? "?"})`,
    );
  }

  // ─── Robust extraction
  let { html, source } = extractHtmlFromResponse(rawText);

  if (!html) {
    throw new Error(
      `Claude não retornou nada extraível como HTML. stop_reason=${data.stop_reason ?? "?"}. ` +
        `Primeiros 200 chars: "${rawText.slice(0, 200).replace(/\s+/g, " ")}"`,
    );
  }

  // ─── Safety net: strip any <script> tags Claude may have generated
  const scriptCount = (html.match(/<script[\s\S]*?<\/script>/gi) ?? []).length;
  if (scriptCount > 0) {
    console.warn(
      `[prospects/demo] removendo ${scriptCount} <script>(s) gerado(s) por Claude`,
    );
    html = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  }

  // ─── Safety net: strip Google Fonts @import lines
  const importCount = (html.match(/@import\s+url\([^)]+google[^)]+\)/gi) ?? [])
    .length;
  if (importCount > 0) {
    console.warn(
      `[prospects/demo] removendo ${importCount} Google Fonts @import gerado(s)`,
    );
    html = html.replace(/@import\s+url\([^)]+google[^)]+\)[^;]*;?/gi, "");
  }

  // ─── Final structural check (post-extraction).
  // We don't throw here anymore — extractHtmlFromResponse already wraps
  // as a last resort. We just log so future failures are diagnosable.
  const lower = html.toLowerCase();
  const hasDoctype = lower.startsWith("<!doctype");
  const hasHtml = lower.includes("<html");
  const hasHead = lower.includes("<head");
  const hasBody = lower.includes("<body");

  console.log("[prospects/demo] extraction result:", {
    source,
    bytes: Buffer.byteLength(html, "utf-8"),
    hasDoctype,
    hasHtml,
    hasHead,
    hasBody,
    scriptTagsRemoved: scriptCount,
    googleImportsRemoved: importCount,
  });

  if (!hasHtml || !hasBody) {
    // Last-resort wrap — should be unreachable since extractHtmlFromResponse
    // wraps too, but defensive.
    console.warn(
      "[prospects/demo] HTML ainda incompleto após extração — wrapping em shell minimal",
    );
    html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Demo — ${p.nome}</title>
<style>body{font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:900px;margin:0 auto;padding:24px;color:#1a1a1a;line-height:1.6}</style>
</head>
<body>
${html}
</body>
</html>`;
  }

  return html;
}

// ─────────────────────────────────────────────────────────────
// Vercel — upload + deploy static HTML
// ─────────────────────────────────────────────────────────────

/**
 * Wraps fetch to surface undici-level errors ("fetch failed") with their
 * underlying `cause`. Native Node fetch hides the real network/DNS/TLS
 * reason in `err.cause`; without unwrapping it, all transport failures
 * collapse to the useless string "fetch failed".
 */
async function debugFetch(
  label: string,
  url: string,
  init: RequestInit,
): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (err) {
    const e = err as Error & { cause?: unknown };
    const cause = e.cause as
      | { code?: string; message?: string; errno?: string }
      | undefined;
    const causeStr = cause
      ? ` [cause: ${cause.code ?? cause.errno ?? "?"} ${cause.message ?? ""}]`
      : "";
    throw new Error(`${label} fetch failed → ${e.message}${causeStr}`);
  }
}

/**
 * Northstar (new Vercel platform) accounts can only operate inside a team
 * scope. Every API call must include ?teamId=... or it fails. We detect
 * the team id once via /v2/user and cache it for the process lifetime.
 *
 * Allow override via VERCEL_TEAM_ID env var for users who already know
 * their team id (saves one API call per cold start).
 */
let cachedTeamId: string | null = null;

async function getTeamScope(token: string): Promise<string> {
  if (cachedTeamId) return cachedTeamId;
  if (process.env.VERCEL_TEAM_ID) {
    cachedTeamId = process.env.VERCEL_TEAM_ID;
    return cachedTeamId;
  }
  const res = await debugFetch("Vercel /v2/user", "https://api.vercel.com/v2/user", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `Vercel /v2/user ${res.status}: ${txt.slice(0, 200)} (token inválido?)`,
    );
  }
  const data = (await res.json()) as {
    user?: { defaultTeamId?: string };
  };
  const teamId = data.user?.defaultTeamId;
  if (!teamId) {
    throw new Error(
      "Conta Vercel sem defaultTeamId — set VERCEL_TEAM_ID em .env.local",
    );
  }
  cachedTeamId = teamId;
  return teamId;
}

async function deployToVercel(
  projectName: string,
  htmlContent: string,
): Promise<string> {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error("VERCEL_TOKEN não configurado");

  const teamId = await getTeamScope(token);

  const buf = Buffer.from(htmlContent, "utf-8");
  // Vercel CLI digest convention is SHA1; SHA256 also works as long as the
  // header digest matches the files[].sha in the deployment call.
  const sha1 = createHash("sha1").update(buf).digest("hex");
  const size = buf.byteLength;

  // 1. Upload file — scoped to team for northstar accounts
  const uploadRes = await debugFetch(
    "Vercel /v2/files",
    `https://api.vercel.com/v2/files?teamId=${teamId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/octet-stream",
        "x-vercel-digest": sha1,
        // NOTE: undici sets Content-Length automatically from the Buffer
        // body. Setting it manually used to cause sporadic
        // "ERR_HTTP_INVALID_HEADER_VALUE" in some Node 22 builds.
      },
      body: buf,
    },
  );

  if (!uploadRes.ok && uploadRes.status !== 200 && uploadRes.status !== 409) {
    const txt = await uploadRes.text().catch(() => "");
    throw new Error(
      `Vercel file upload ${uploadRes.status}: ${txt.slice(0, 300)}`,
    );
  }

  // 2. Create deployment — also scoped to team
  const deployBody = {
    name: projectName,
    files: [{ file: "index.html", sha: sha1, size }],
    projectSettings: { framework: null },
    target: "production",
  };

  const deployRes = await debugFetch(
    "Vercel /v13/deployments",
    `https://api.vercel.com/v13/deployments?teamId=${teamId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(deployBody),
    },
  );

  if (!deployRes.ok) {
    const txt = await deployRes.text().catch(() => "");
    throw new Error(
      `Vercel deploy ${deployRes.status}: ${txt.slice(0, 400)}`,
    );
  }

  const deploy = (await deployRes.json()) as {
    url?: string;
    alias?: string[];
    automaticAliases?: string[];
    readyState?: string;
    projectId?: string;
  };

  // Prefer alias (subdomain) over the deployment-specific URL — it's the
  // stable address; the per-deployment .vercel.app URL changes on every
  // redeploy.
  const url =
    deploy.alias?.[0] ?? deploy.automaticAliases?.[0] ?? deploy.url;
  if (!url) throw new Error("Vercel não retornou URL do deploy");

  // 3. Disable SSO protection so prospects (no Vercel account) can open
  //    the URL. New Hobby-team projects ship with ssoProtection enabled
  //    by default; without this PATCH, the deploy returns HTTP 401
  //    "Authentication Required" to anonymous visitors.
  if (deploy.projectId) {
    try {
      await debugFetch(
        "Vercel project PATCH",
        `https://api.vercel.com/v9/projects/${deploy.projectId}?teamId=${teamId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ssoProtection: null,
            passwordProtection: null,
          }),
        },
      );
    } catch (err) {
      // Fail-soft: the deploy itself succeeded. SSO disable is a polish
      // step; log and continue so we still return the URL.
      console.error(
        "[prospects/demo] SSO disable failed (deploy still ok):",
        err instanceof Error ? err.message : err,
      );
    }
  }

  return url.startsWith("http") ? url : `https://${url}`;
}

// ─────────────────────────────────────────────────────────────
// POST /api/prospects/demo
// ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: DemoInput;
  try {
    body = (await req.json()) as DemoInput;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { prospect_id } = body;
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
      "id, nome, site, cidade, estado, categoria, telefone, audit_json, audit_score, demo_url",
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

  // ─── 1. Generate HTML via Claude
  let html: string;
  try {
    html = await generateHtml(prospect);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao gerar HTML";
    console.error("[prospects/demo] html generation failed", msg);
    return NextResponse.json(
      { error: `Geração do demo falhou: ${msg}` },
      { status: 502 },
    );
  }

  // ─── 2. Deploy to Vercel
  const slug = toSlug(prospect.nome);
  const projectName = `o6-demo-${slug}`;
  let demoUrl: string;
  try {
    demoUrl = await deployToVercel(projectName, html);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro no deploy";
    console.error("[prospects/demo] deploy failed", msg);
    return NextResponse.json(
      { error: `Deploy falhou: ${msg}` },
      { status: 502 },
    );
  }

  // ─── 3. Persist demo_url + update status
  const { error: updErr } = await sb
    .from("prospects")
    .update({
      demo_url: demoUrl,
      demo_generated_at: new Date().toISOString(),
      status: "Demo Gerada",
    })
    .eq("id", prospect.id);

  if (updErr) {
    console.error("[prospects/demo] update failed", updErr);
    // Fail-soft: return URL even if persist failed
  }

  return NextResponse.json({ url: demoUrl, projectName });
}

/**
 * Smoke test: `GET /api/prospects/demo?test=1` deploys a minimal hardcoded
 * HTML to Vercel and returns the URL. Skips Claude entirely so we can
 * isolate Vercel/network problems from generation problems.
 *
 * Use `?test=1&dry=1` to just resolve the team scope without deploying.
 */
export async function GET(req: NextRequest) {
  const test = req.nextUrl.searchParams.get("test");
  if (!test) {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "VERCEL_TOKEN não configurado" },
      { status: 503 },
    );
  }

  // dry: only validate the token + resolve team scope
  if (req.nextUrl.searchParams.get("dry")) {
    try {
      const teamId = await getTeamScope(token);
      return NextResponse.json({ ok: true, teamId });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: msg }, { status: 502 });
    }
  }

  const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>O6 Smoke Test</title>
<style>body{font-family:system-ui;display:grid;place-items:center;min-height:100vh;margin:0;background:#0a0a0a;color:#fff}</style>
</head><body><div><h1>O6 Demo deploy ok ✓</h1><p>${new Date().toISOString()}</p></div></body></html>`;

  try {
    const url = await deployToVercel(
      `o6-demo-smoke-${Date.now().toString(36)}`,
      html,
    );
    return NextResponse.json({ ok: true, url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[prospects/demo] smoke test failed:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
