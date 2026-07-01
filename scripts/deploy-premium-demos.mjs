/**
 * Deploy 2 premium standalone HTML demos to Vercel as new projects.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const envText = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2];
}

const TOKEN = process.env.VERCEL_TOKEN;
if (!TOKEN) throw new Error("VERCEL_TOKEN missing");

let cachedTeam = null;
async function team() {
  if (cachedTeam) return cachedTeam;
  if (process.env.VERCEL_TEAM_ID) {
    cachedTeam = process.env.VERCEL_TEAM_ID;
    return cachedTeam;
  }
  const r = await fetch("https://api.vercel.com/v2/user", {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const d = await r.json();
  cachedTeam = d.user?.defaultTeamId;
  if (!cachedTeam) throw new Error("no defaultTeamId");
  return cachedTeam;
}

async function deploy(name, html) {
  const t = await team();
  const buf = Buffer.from(html, "utf-8");
  const sha = createHash("sha1").update(buf).digest("hex");
  const size = buf.byteLength;

  const u = await fetch(`https://api.vercel.com/v2/files?teamId=${t}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/octet-stream",
      "x-vercel-digest": sha,
    },
    body: buf,
  });
  if (!u.ok && u.status !== 200 && u.status !== 409)
    throw new Error(`upload ${u.status}: ${await u.text()}`);

  const d = await fetch(`https://api.vercel.com/v13/deployments?teamId=${t}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      files: [{ file: "index.html", sha, size }],
      projectSettings: { framework: null },
      target: "production",
    }),
  });
  if (!d.ok) throw new Error(`deploy ${d.status}: ${await d.text()}`);
  const dep = await d.json();

  if (dep.projectId) {
    try {
      await fetch(
        `https://api.vercel.com/v9/projects/${dep.projectId}?teamId=${t}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ssoProtection: null,
            passwordProtection: null,
          }),
        },
      );
    } catch (e) {
      console.warn("sso disable warn:", e.message);
    }
  }

  let state = dep.readyState ?? "INIT";
  let alias = dep.alias?.[0] ?? dep.automaticAliases?.[0];
  let url = dep.url;
  for (let i = 0; i < 25 && state !== "READY"; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const pr = await fetch(
      `https://api.vercel.com/v13/deployments/${dep.id}?teamId=${t}`,
      { headers: { Authorization: `Bearer ${TOKEN}` } },
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

const targets = [
  {
    name: "o6-demo-jhun-bistro-premium",
    file: "../public/demos/jhun-bistro-premium.html",
  },
  {
    name: "o6-demo-emporio-premium",
    file: "../public/demos/emporio-dos-graos-premium.html",
  },
];

const results = [];
for (const t of targets) {
  const html = readFileSync(new URL(t.file, import.meta.url), "utf-8");
  console.log(`→ Deploying ${t.name} (${(html.length / 1024).toFixed(1)} KB)...`);
  const url = await deploy(t.name, html);
  console.log(`  ✓ ${url}`);
  results.push({ name: t.name, url });
}

console.log("\n=== DEPLOYED ===");
console.log(JSON.stringify(results, null, 2));
