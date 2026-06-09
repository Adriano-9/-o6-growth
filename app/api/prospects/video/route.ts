import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { deployToVercel, toSlug } from "@/app/_lib/vercel-deploy";
import { notifyTelegram } from "@/app/_lib/telegram";

export const maxDuration = 120;

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type VideoInput = { prospect_id: string; force?: boolean };

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
  audit_json: AuditJson | null;
  audit_score: number | null;
  demo_url: string | null;
  video_url: string | null;
  video_generated_at: string | null;
};

// ─────────────────────────────────────────────────────────────
// Niche theming
// ─────────────────────────────────────────────────────────────

function getNicheTheme(categoria: string | null): {
  accent: string;
  accentLight: string;
  tagline: string;
} {
  const cat = (categoria ?? "").toLowerCase();
  if (
    cat.includes("advog") ||
    cat.includes("direito") ||
    cat.includes("jurídic")
  ) {
    return {
      accent: "#1a5276",
      accentLight: "#d4e6f1",
      tagline: "Autoridade que protege",
    };
  }
  if (
    cat.includes("saúde") ||
    cat.includes("clínica") ||
    cat.includes("médic") ||
    cat.includes("odonto") ||
    cat.includes("estétic") ||
    cat.includes("fisio") ||
    cat.includes("dermat")
  ) {
    return {
      accent: "#117a65",
      accentLight: "#d1f2eb",
      tagline: "Cuidado que transforma",
    };
  }
  return {
    accent: "#00b4d8",
    accentLight: "#caf0f8",
    tagline: "Sua presença online merece mais",
  };
}

// ─────────────────────────────────────────────────────────────
// Build animated HTML page
// ─────────────────────────────────────────────────────────────

function buildAnimatedPage(p: ProspectRow): string {
  const theme = getNicheTheme(p.categoria);
  const audit = p.audit_json;
  const overallScore = audit?.overallScore ?? 0;
  const cidade = p.cidade
    ? `${p.cidade}${p.estado ? "/" + p.estado : ""}`
    : "";

  const topProblems = (audit?.recommendations ?? []).slice(0, 3);

  const weakAxes = audit
    ? [
        { k: "SEO", v: audit.seoScore },
        { k: "Performance", v: audit.performanceScore },
        { k: "UX", v: audit.uxScore },
        { k: "Trust", v: audit.trustScore },
        { k: "Conversao", v: audit.conversionScore },
        { k: "Mobile", v: audit.mobileScore },
        { k: "Conteudo", v: audit.contentScore },
      ]
        .sort((a, b) => a.v - b.v)
        .slice(0, 3)
    : [];

  const projectedScore = Math.min(95, overallScore + 35);

  const problemsHtml = topProblems
    .map(
      (r, i) => `
      <div class="problem" style="animation-delay: ${2.5 + i * 0.4}s">
        <span class="badge badge-${r.priority.toLowerCase()}">${r.priority}</span>
        <span>${escapeHtml(r.title)}</span>
      </div>`,
    )
    .join("\n");

  const scoresHtml = weakAxes
    .map(
      (a) => `
      <div class="score-row">
        <span class="score-label">${a.k}</span>
        <div class="score-bar-bg">
          <div class="score-bar" style="--score: ${a.v}%; --target: ${Math.min(95, a.v + 30)}%"></div>
        </div>
        <span class="score-val">${a.v}</span>
        <span class="score-arrow">→</span>
        <span class="score-val score-val-after">${Math.min(95, a.v + 30)}</span>
      </div>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(p.nome)} — Antes e Depois | O6 Growth</title>
<style>
  :root {
    --accent: ${theme.accent};
    --accent-light: ${theme.accentLight};
    --bg: #0d0d0d;
    --card: #1a1a1a;
    --text: #f0f0f0;
    --muted: #888;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* ── Animations ── */
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideRight {
    from { opacity: 0; transform: translateX(-40px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes growBar {
    0% { width: 0; }
    40% { width: var(--score); background: #e74c3c; }
    60% { width: var(--score); background: #e74c3c; }
    100% { width: var(--target); background: var(--accent); }
  }
  @keyframes pulseScore {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.15); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 40px 24px;
  }

  /* ── Header ── */
  .header {
    text-align: center;
    animation: fadeInUp 0.8s ease-out both;
    margin-bottom: 48px;
  }
  .header .tag {
    display: inline-block;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--accent);
    border: 1px solid var(--accent);
    padding: 6px 16px;
    margin-bottom: 20px;
  }
  .header h1 {
    font-size: 28px;
    font-weight: 900;
    line-height: 1.1;
    text-transform: uppercase;
    letter-spacing: -0.03em;
    margin-bottom: 8px;
  }
  .header .sub {
    font-size: 14px;
    color: var(--muted);
  }

  /* ── Score comparison ── */
  .compare {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 40px;
    animation: fadeInUp 0.8s ease-out 0.4s both;
  }
  .compare-card {
    background: var(--card);
    border: 1px solid #333;
    border-radius: 12px;
    padding: 24px;
    text-align: center;
  }
  .compare-card.after {
    border-color: var(--accent);
  }
  .compare-label {
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--muted);
    margin-bottom: 12px;
  }
  .compare-score {
    font-size: 48px;
    font-weight: 900;
    letter-spacing: -0.04em;
  }
  .compare-card:not(.after) .compare-score { color: #e74c3c; }
  .compare-card.after .compare-score {
    color: var(--accent);
    animation: pulseScore 2s ease-in-out 3s 2;
  }
  .compare-unit {
    font-size: 12px;
    color: var(--muted);
    margin-top: 4px;
  }

  /* ── Score bars ── */
  .scores {
    margin-bottom: 40px;
    animation: fadeInUp 0.8s ease-out 1.2s both;
  }
  .scores h2 {
    font-size: 14px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--muted);
    margin-bottom: 16px;
  }
  .score-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    font-size: 13px;
  }
  .score-label {
    width: 90px;
    font-weight: 700;
    flex-shrink: 0;
  }
  .score-bar-bg {
    flex: 1;
    height: 8px;
    background: #2a2a2a;
    border-radius: 4px;
    overflow: hidden;
  }
  .score-bar {
    height: 100%;
    border-radius: 4px;
    animation: growBar 4s ease-in-out 1.5s both;
  }
  .score-val {
    font-weight: 800;
    width: 28px;
    text-align: right;
    color: #e74c3c;
  }
  .score-val-after { color: var(--accent); }
  .score-arrow { color: var(--muted); font-size: 11px; }

  /* ── Problems ── */
  .problems {
    margin-bottom: 40px;
  }
  .problems h2 {
    font-size: 14px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--muted);
    margin-bottom: 16px;
    animation: fadeInUp 0.8s ease-out 2s both;
  }
  .problem {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--card);
    border: 1px solid #333;
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 8px;
    font-size: 13px;
    animation: slideRight 0.6s ease-out both;
  }
  .badge {
    font-size: 10px;
    font-weight: 800;
    padding: 3px 8px;
    border-radius: 4px;
    flex-shrink: 0;
  }
  .badge-p1 { background: #e74c3c22; color: #e74c3c; border: 1px solid #e74c3c44; }
  .badge-p2 { background: #f39c1222; color: #f39c12; border: 1px solid #f39c1244; }
  .badge-p3 { background: #3498db22; color: #3498db; border: 1px solid #3498db44; }

  /* ── CTA ── */
  .cta {
    text-align: center;
    animation: fadeIn 1s ease-out 4s both;
  }
  .cta a {
    display: inline-block;
    background: var(--accent);
    color: #fff;
    font-size: 14px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    text-decoration: none;
    padding: 16px 40px;
    border-radius: 8px;
    transition: opacity 0.2s;
  }
  .cta a:hover { opacity: 0.85; }
  .cta p {
    font-size: 12px;
    color: var(--muted);
    margin-top: 12px;
  }

  /* ── Footer ── */
  .footer {
    text-align: center;
    margin-top: 60px;
    font-size: 10px;
    color: #555;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    animation: fadeIn 1s ease-out 4.5s both;
  }
</style>
</head>
<body>
<div class="container">

  <div class="header">
    <div class="tag">${escapeHtml(theme.tagline)}</div>
    <h1>${escapeHtml(p.nome)}</h1>
    <p class="sub">${escapeHtml(p.categoria ?? "Negócio")} ${cidade ? `em ${escapeHtml(cidade)}` : ""}</p>
  </div>

  <div class="compare">
    <div class="compare-card">
      <div class="compare-label">Hoje</div>
      <div class="compare-score">${overallScore}</div>
      <div class="compare-unit">pontos / 100</div>
    </div>
    <div class="compare-card after">
      <div class="compare-label">Com O6 Growth</div>
      <div class="compare-score">${projectedScore}</div>
      <div class="compare-unit">pontos / 100</div>
    </div>
  </div>

  <div class="scores">
    <h2>Evolucao por eixo</h2>
    ${scoresHtml}
  </div>

  <div class="problems">
    <h2>Problemas encontrados</h2>
    ${problemsHtml}
  </div>

  ${
    p.demo_url
      ? `<div class="cta">
    <a href="${escapeHtml(p.demo_url)}">Ver demo do seu novo site</a>
    <p>Versao melhorada criada pela O6 Growth</p>
  </div>`
      : ""
  }

  <div class="footer">Gerado por O6 Growth</div>

</div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─────────────────────────────────────────────────────────────
// POST /api/prospects/video
// ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: VideoInput;
  try {
    body = (await req.json()) as VideoInput;
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 });
  }

  const { prospect_id, force = false } = body;
  if (!prospect_id) {
    return NextResponse.json(
      { error: "prospect_id e obrigatorio" },
      { status: 400 },
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Supabase nao configurado" },
      { status: 503 },
    );
  }

  const vercelToken = process.env.VERCEL_TOKEN;
  if (!vercelToken) {
    return NextResponse.json(
      { error: "VERCEL_TOKEN nao configurado" },
      { status: 503 },
    );
  }

  const sb = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  const { data: rowRaw, error: readErr } = await sb
    .from("prospects")
    .select(
      "id, nome, site, cidade, estado, categoria, audit_json, audit_score, demo_url, video_url, video_generated_at",
    )
    .eq("id", prospect_id)
    .maybeSingle();

  if (readErr || !rowRaw) {
    return NextResponse.json(
      { error: "Prospect nao encontrado" },
      { status: 404 },
    );
  }

  const prospect = rowRaw as ProspectRow;

  // Guard: must have audit first
  if (!prospect.audit_json) {
    return NextResponse.json(
      { error: "Prospect sem auditoria — execute o pipeline primeiro" },
      { status: 400 },
    );
  }

  // Cache: 7 days
  if (!force && prospect.video_url && prospect.video_generated_at) {
    const cutoff = Date.now() - 7 * 86400 * 1000;
    if (new Date(prospect.video_generated_at).getTime() > cutoff) {
      return NextResponse.json({
        url: prospect.video_url,
        provider: "fallback-css",
        cached: true,
        generatedAt: prospect.video_generated_at,
      });
    }
  }

  // Build and deploy
  const html = buildAnimatedPage(prospect);
  const slug = toSlug(prospect.nome);
  let videoUrl: string;
  try {
    videoUrl = await deployToVercel(`o6-video-${slug}`, html);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro no deploy";
    console.error("[prospects/video] deploy failed", msg);
    return NextResponse.json(
      { error: `Deploy falhou: ${msg}` },
      { status: 502 },
    );
  }

  // Persist (fail-soft)
  const now = new Date().toISOString();
  const { error: updErr } = await sb
    .from("prospects")
    .update({
      video_url: videoUrl,
      video_generated_at: now,
      video_provider: "fallback-css",
    })
    .eq("id", prospect.id);

  if (updErr) {
    console.error("[prospects/video] persist failed", updErr);
  }

  // Telegram (fire-and-forget)
  notifyTelegram(
    `<b>Video gerado</b>\n\nProspect: <b>${prospect.nome}</b>\nURL: ${videoUrl}`,
  );

  return NextResponse.json({
    url: videoUrl,
    provider: "fallback-css",
    durationSeconds: 15,
    cached: false,
    generatedAt: now,
  });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
