/**
 * Conector Telegram — envelope formal em torno do helper já existente
 * (app/_lib/telegram.ts). Não duplica notifyTelegram() — só adiciona
 * health check (getMe da Bot API) + interface uniforme.
 */
import { logConnector } from "../logger";
import type { Connector, ConnectorHealth } from "../types";

const TELEGRAM_API = "https://api.telegram.org";

export const telegramConnector: Connector = {
  id: "telegram",
  name: "Telegram Bot",
  category: "notification",

  getRequiredConfig() {
    return ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"];
  },

  isConfigured() {
    return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
  },

  async checkHealth(): Promise<ConnectorHealth> {
    const checkedAt = new Date().toISOString();

    if (!this.isConfigured()) {
      logConnector("telegram", "warn", "credenciais ausentes");
      return {
        status: "not_configured",
        message: "TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID não configuradas",
        checkedAt,
      };
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const start = Date.now();
    try {
      const res = await fetch(`${TELEGRAM_API}/bot${token}/getMe`, {
        signal: AbortSignal.timeout(8000),
      });
      const latencyMs = Date.now() - start;
      const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;

      if (!res.ok || !data?.ok) {
        logConnector("telegram", "error", "getMe falhou", { status: res.status });
        return { status: "degraded", message: `HTTP ${res.status}`, checkedAt, latencyMs };
      }

      logConnector("telegram", "info", "health check ok", { latencyMs });
      return { status: "connected", message: "ok", checkedAt, latencyMs };
    } catch (err) {
      const message = err instanceof Error ? err.message : "erro desconhecido";
      logConnector("telegram", "error", "health check falhou (exceção)", { message });
      return { status: "degraded", message, checkedAt, latencyMs: Date.now() - start };
    }
  },
};
