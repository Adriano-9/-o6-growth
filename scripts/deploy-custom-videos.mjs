/**
 * Deploy custom video diagnostic pages for 2 prospects.
 * Uses the same template as /api/prospects/video but with hand-tuned data.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

// ── Load .env.local ──
const envText = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2];
}

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
if (!VERCEL_TOKEN) throw new Error("VERCEL_TOKEN missing in .env.local");

// ── Vercel deploy helpers (copy of vercel-deploy.ts logic) ──
let cachedTeamId = null;
async function getTeamScope() {
  if (cachedTeamId) return cachedTeamId;
  if (process.env.VERCEL_TEAM_ID) {
    cachedTeamId = process.env.VERCEL_TEAM_ID;
    return cachedTeamId;
  }
  const r = await fetch("https://api.vercel.com/v2/user", {
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
  });
  const d = await r.json();
  cachedTeamId = d.user?.defaultTeamId;
  if (!cachedTeamId) throw new Error("no defaultTeamId");
  return cachedTeamId;
}

async function deployToVercel(projectName, html) {
  const teamId = await getTeamScope();
  const buf = Buffer.from(html, "utf-8");
  const sha1 = createHash("sha1").update(buf).digest("hex");
  const size = buf.byteLength;

  const u = await fetch(
    `https://api.vercel.com/v2/files?teamId=${teamId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/octet-stream",
        "x-vercel-digest": sha1,
      },
      body: buf,
    },
  );
  if (!u.ok && u.status !== 200 && u.status !== 409) {
    throw new Error(`upload ${u.status}: ${await u.text()}`);
  }

  const d = await fetch(
    `https://api.vercel.com/v13/deployments?teamId=${teamId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: projectName,
        files: [{ file: "index.html", sha: sha1, size }],
        projectSettings: { framework: null },
        target: "production",
      }),
    },
  );
  if (!d.ok) throw new Error(`deploy ${d.status}: ${await d.text()}`);
  const dep = await d.json();

  // disable SSO
  if (dep.projectId) {
    try {
      await fetch(
        `https://api.vercel.com/v9/projects/${dep.projectId}?teamId=${teamId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${VERCEL_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ssoProtection: null,
            passwordProtection: null,
          }),
        },
      );
    } catch (e) {
      console.warn("SSO disable failed:", e.message);
    }
  }

  // poll
  let state = dep.readyState ?? "INIT";
  let alias = dep.alias?.[0] ?? dep.automaticAliases?.[0];
  let url = dep.url;
  for (let i = 0; i < 20 && state !== "READY"; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const pr = await fetch(
      `https://api.vercel.com/v13/deployments/${dep.id}?teamId=${teamId}`,
      { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } },
    );
    const p = await pr.json();
    state = p.readyState ?? state;
    if (p.alias?.[0]) alias = p.alias[0];
    if (p.url) url = p.url;
    if (state === "READY") break;
    if (state === "ERROR" || state === "CANCELED")
      throw new Error(`Vercel ${state}`);
  }
  const chosen = state === "READY" && alias ? alias : url ?? alias;
  return chosen.startsWith("http") ? chosen : `https://${chosen}`;
}

// ── Template (mirror of buildAnimatedPage from video/route.ts) ──
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildPage({ title, nome, cidade, scoreBefore, scoreAfter, axes, problems, ctaUrl, tagline = "Diagnostico O6" }) {
  const scoresHtml = axes
    .map(
      (a) => `
      <div class="score-row">
        <span class="score-label">${escapeHtml(a.k)}</span>
        <div class="score-bar-bg">
          <div class="score-bar" style="--score: ${a.before}%; --target: ${a.after}%"></div>
        </div>
        <span class="score-val">${a.before}</span>
        <span class="score-arrow">→</span>
        <span class="score-val score-val-after">${a.after}</span>
      </div>`,
    )
    .join("\n");

  const problemsHtml = problems
    .map(
      (p, i) => `
      <div class="problem" style="animation-delay: ${2.5 + i * 0.4}s">
        <span class="badge badge-${p.priority.toLowerCase()}">${p.priority}</span>
        <span>${escapeHtml(p.text)}</span>
      </div>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
  :root {
    --accent: #00b4d8;
    --accent-light: #48cae4;
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

  .container { max-width: 600px; margin: 0 auto; padding: 40px 24px; }

  .header { text-align: center; animation: fadeInUp 0.8s ease-out both; margin-bottom: 48px; }
  .header .tag {
    display: inline-block; font-size: 11px; font-weight: 800;
    letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent);
    border: 1px solid var(--accent); padding: 6px 16px; margin-bottom: 20px;
  }
  .header h1 {
    font-size: 28px; font-weight: 900; line-height: 1.1;
    text-transform: uppercase; letter-spacing: -0.03em; margin-bottom: 8px;
  }
  .header .sub { font-size: 14px; color: var(--muted); }

  .compare {
    display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
    margin-bottom: 40px; animation: fadeInUp 0.8s ease-out 0.4s both;
  }
  .compare-card { background: var(--card); border: 1px solid #333; border-radius: 12px; padding: 24px; text-align: center; }
  .compare-card.after { border-color: var(--accent); }
  .compare-label {
    font-size: 10px; font-weight: 800; text-transform: uppercase;
    letter-spacing: 0.15em; color: var(--muted); margin-bottom: 12px;
  }
  .compare-score { font-size: 48px; font-weight: 900; letter-spacing: -0.04em; }
  .compare-card:not(.after) .compare-score { color: #e74c3c; }
  .compare-card.after .compare-score {
    color: var(--accent);
    animation: pulseScore 2s ease-in-out 3s 2;
  }
  .compare-unit { font-size: 12px; color: var(--muted); margin-top: 4px; }

  .scores { margin-bottom: 40px; animation: fadeInUp 0.8s ease-out 1.2s both; }
  .scores h2 {
    font-size: 14px; font-weight: 800; text-transform: uppercase;
    letter-spacing: 0.1em; color: var(--muted); margin-bottom: 16px;
  }
  .score-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 13px; }
  .score-label { width: 90px; font-weight: 700; flex-shrink: 0; }
  .score-bar-bg { flex: 1; height: 8px; background: #2a2a2a; border-radius: 4px; overflow: hidden; }
  .score-bar { height: 100%; border-radius: 4px; animation: growBar 4s ease-in-out 1.5s both; }
  .score-val { font-weight: 800; width: 28px; text-align: right; color: #e74c3c; }
  .score-val-after { color: var(--accent); }
  .score-arrow { color: var(--muted); font-size: 11px; }

  .problems { margin-bottom: 40px; }
  .problems h2 {
    font-size: 14px; font-weight: 800; text-transform: uppercase;
    letter-spacing: 0.1em; color: var(--muted); margin-bottom: 16px;
    animation: fadeInUp 0.8s ease-out 2s both;
  }
  .problem {
    display: flex; align-items: center; gap: 10px;
    background: var(--card); border: 1px solid #333; border-radius: 8px;
    padding: 12px 16px; margin-bottom: 8px; font-size: 13px;
    animation: slideRight 0.6s ease-out both;
  }
  .badge { font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 4px; flex-shrink: 0; }
  .badge-p1 { background: #e74c3c22; color: #e74c3c; border: 1px solid #e74c3c44; }
  .badge-p2 { background: #f39c1222; color: #f39c12; border: 1px solid #f39c1244; }
  .badge-p3 { background: #3498db22; color: #3498db; border: 1px solid #3498db44; }

  .cta { text-align: center; animation: fadeIn 1s ease-out 4s both; }
  .cta a {
    display: inline-block; background: var(--accent); color: #fff;
    font-size: 14px; font-weight: 800; text-transform: uppercase;
    letter-spacing: 0.1em; text-decoration: none;
    padding: 16px 40px; border-radius: 8px; transition: opacity 0.2s;
  }
  .cta a:hover { opacity: 0.85; }
  .cta p { font-size: 12px; color: var(--muted); margin-top: 12px; }

  .footer {
    text-align: center; margin-top: 60px; font-size: 10px;
    color: #555; letter-spacing: 0.1em; text-transform: uppercase;
    animation: fadeIn 1s ease-out 4.5s both;
  }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="tag">${escapeHtml(tagline)}</div>
    <h1>${escapeHtml(nome)}</h1>
    <p class="sub">${escapeHtml(cidade)}</p>
  </div>
  <div class="compare">
    <div class="compare-card">
      <div class="compare-label">Hoje</div>
      <div class="compare-score">${scoreBefore}</div>
      <div class="compare-unit">pontos / 100</div>
    </div>
    <div class="compare-card after">
      <div class="compare-label">Com O6 Growth</div>
      <div class="compare-score">${scoreAfter}</div>
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
  <div class="cta">
    <a href="${escapeHtml(ctaUrl)}">Ver demo do seu novo site</a>
    <p>Versao melhorada criada pela O6 Growth</p>
  </div>
  <div class="footer">Gerado por O6 Growth</div>
</div>
</body>
</html>`;
}

// ── 2 prospects to deploy ──
const PROSPECTS = [
  {
    project: "o6-video-clinica-florida",
    data: {
      title: "Clínica Flórida — Antes e Depois | O6 Growth",
      nome: "Clínica Flórida",
      cidade: "Estética em Salvador/Bahia",
      scoreBefore: 57,
      scoreAfter: 92,
      axes: [
        { k: "Trust", before: 20, after: 70 },
        { k: "Conversão", before: 80, after: 95 },
        { k: "Mobile", before: 50, after: 85 },
      ],
      problems: [
        { priority: "P2", text: "Falta página de contato/privacidade — afeta confiança" },
        { priority: "P3", text: "Velocidade de carregamento pode melhorar" },
        { priority: "P3", text: "Responsividade mobile precisa de ajustes" },
      ],
      ctaUrl: "https://o6-demo-clinica-florida.vercel.app",
    },
  },
  {
    project: "o6-video-nudik-clinica-de-estetica",
    data: {
      title: "Nudik Clínica de Estética — Antes e Depois | O6 Growth",
      nome: "Nudik Clínica de Estética",
      cidade: "Estética em Salvador/Bahia",
      scoreBefore: 51,
      scoreAfter: 90,
      axes: [
        { k: "Conversão", before: 30, after: 85 },
        { k: "UX", before: 50, after: 85 },
        { k: "Mobile", before: 50, after: 85 },
      ],
      problems: [
        { priority: "P1", text: 'Site sem botão de "Agendar Consulta" — visitante não sabe o próximo passo' },
        { priority: "P3", text: "Velocidade de carregamento pode melhorar" },
        { priority: "P3", text: "Responsividade mobile precisa de ajustes" },
      ],
      ctaUrl: "https://o6-demo-nudik-clinica-de-estetica.vercel.app",
    },
  },
];

// ── Run ──
const results = [];
for (const p of PROSPECTS) {
  console.log(`→ Building ${p.project}...`);
  const html = buildPage(p.data);
  console.log(`  HTML: ${(html.length / 1024).toFixed(1)} KB`);
  console.log(`→ Deploying ${p.project}...`);
  const url = await deployToVercel(p.project, html);
  console.log(`  ✓ ${url}`);
  results.push({ project: p.project, url });
}

console.log("\n=== RESULTS ===");
console.log(JSON.stringify(results, null, 2));
