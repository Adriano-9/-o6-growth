/**
 * Conector GitHub — primeira integração real com a API REST do GitHub
 * no projeto (até aqui, todo git era feito via CLI local do Claude Code,
 * nunca via API). Sem GITHUB_TOKEN configurado hoje — reporta
 * "not_configured" honestamente em vez de fingir conexão.
 */
import { logConnector } from "../logger";
import type { Connector, ConnectorHealth } from "../types";

const GITHUB_API = "https://api.github.com";
const REPO = "Adriano-9/-o6-growth"; // ver docs/bootstrap/20_BOOTSTRAP_DEPLOY.md

export const githubConnector: Connector = {
  id: "github",
  name: "GitHub",
  category: "vcs",

  getRequiredConfig() {
    return ["GITHUB_TOKEN"];
  },

  isConfigured() {
    return Boolean(process.env.GITHUB_TOKEN);
  },

  async checkHealth(): Promise<ConnectorHealth> {
    const checkedAt = new Date().toISOString();

    if (!this.isConfigured()) {
      logConnector("github", "warn", "GITHUB_TOKEN ausente — repositório usado hoje só via git CLI local");
      return {
        status: "not_configured",
        message: "GITHUB_TOKEN não configurado. Hoje o repositório é operado via git CLI local (push/commit manual pelo Claude Code), não via API.",
        checkedAt,
      };
    }

    const token = process.env.GITHUB_TOKEN;
    const start = Date.now();
    try {
      const res = await fetch(`${GITHUB_API}/repos/${REPO}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
        signal: AbortSignal.timeout(8000),
      });
      const latencyMs = Date.now() - start;

      if (!res.ok) {
        logConnector("github", "error", "repo lookup falhou", { status: res.status });
        return { status: "degraded", message: `HTTP ${res.status}`, checkedAt, latencyMs };
      }

      logConnector("github", "info", "health check ok", { latencyMs });
      return { status: "connected", message: "ok", checkedAt, latencyMs };
    } catch (err) {
      const message = err instanceof Error ? err.message : "erro desconhecido";
      logConnector("github", "error", "health check falhou (exceção)", { message });
      return { status: "degraded", message, checkedAt, latencyMs: Date.now() - start };
    }
  },
};
