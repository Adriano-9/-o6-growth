/**
 * Shared Vercel static-site deploy helper.
 * Extracted from app/api/prospects/demo/route.ts for reuse
 * in video and other HTML deploy routes.
 */

import { createHash } from "crypto";

// ── Debug fetch with cause unwrapping ──

export async function debugFetch(
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

// ── Team scope resolution (cached per process) ──

let cachedTeamId: string | null = null;

export async function getTeamScope(token: string): Promise<string> {
  if (cachedTeamId) return cachedTeamId;
  if (process.env.VERCEL_TEAM_ID) {
    cachedTeamId = process.env.VERCEL_TEAM_ID;
    return cachedTeamId;
  }
  const res = await debugFetch(
    "Vercel /v2/user",
    "https://api.vercel.com/v2/user",
    { headers: { Authorization: `Bearer ${token}` } },
  );
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

// ── Deploy HTML to Vercel ──

export async function deployToVercel(
  projectName: string,
  htmlContent: string,
): Promise<string> {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error("VERCEL_TOKEN não configurado");

  const teamId = await getTeamScope(token);

  const buf = Buffer.from(htmlContent, "utf-8");
  const sha1 = createHash("sha1").update(buf).digest("hex");
  const size = buf.byteLength;

  // 1. Upload file
  const uploadRes = await debugFetch(
    "Vercel /v2/files",
    `https://api.vercel.com/v2/files?teamId=${teamId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/octet-stream",
        "x-vercel-digest": sha1,
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

  // 2. Create deployment
  const deployRes = await debugFetch(
    "Vercel /v13/deployments",
    `https://api.vercel.com/v13/deployments?teamId=${teamId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
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

  if (!deployRes.ok) {
    const txt = await deployRes.text().catch(() => "");
    throw new Error(
      `Vercel deploy ${deployRes.status}: ${txt.slice(0, 400)}`,
    );
  }

  const deploy = (await deployRes.json()) as {
    id?: string;
    url?: string;
    alias?: string[];
    aliasAssigned?: boolean | number | null;
    automaticAliases?: string[];
    readyState?: string;
    projectId?: string;
  };

  console.log(`[vercel-deploy] ${projectName} created:`, {
    id: deploy.id,
    url: deploy.url,
    readyState: deploy.readyState,
  });

  // 3. Disable SSO protection
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
      console.error(
        "[vercel-deploy] SSO disable failed (deploy still ok):",
        err instanceof Error ? err.message : err,
      );
    }
  }

  // 4. Poll until READY
  let finalState = deploy.readyState ?? "INITIALIZING";
  let finalAlias = deploy.alias?.[0] ?? deploy.automaticAliases?.[0];
  let finalUrl = deploy.url;

  if (deploy.id && finalState !== "READY") {
    const maxAttempts = 15;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await new Promise((r) => setTimeout(r, 2000));

      const pollRes = await debugFetch(
        `Vercel poll #${attempt}`,
        `https://api.vercel.com/v13/deployments/${deploy.id}?teamId=${teamId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (!pollRes.ok) {
        const txt = await pollRes.text().catch(() => "");
        console.warn(
          `[vercel-deploy] poll #${attempt} ${pollRes.status}: ${txt.slice(0, 200)}`,
        );
        continue;
      }

      const poll = (await pollRes.json()) as {
        readyState?: string;
        url?: string;
        alias?: string[];
        aliasAssigned?: boolean | number | null;
      };

      finalState = poll.readyState ?? finalState;
      if (poll.alias?.[0]) finalAlias = poll.alias[0];
      if (poll.url) finalUrl = poll.url;

      if (finalState === "READY") break;
      if (finalState === "ERROR" || finalState === "CANCELED") {
        throw new Error(`Vercel deployment ${finalState} (id=${deploy.id})`);
      }
    }
  }

  if (finalState !== "READY") {
    console.warn(
      `[vercel-deploy] ${deploy.id} still ${finalState} after 30s — returning URL anyway`,
    );
  }

  const chosen =
    finalState === "READY" && finalAlias ? finalAlias : finalUrl ?? finalAlias;
  if (!chosen) throw new Error("Vercel não retornou URL do deploy");

  return chosen.startsWith("http") ? chosen : `https://${chosen}`;
}

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 28);
}
