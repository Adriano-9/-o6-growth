/**
 * Conector Supabase — envelope formal em torno do singleton já existente
 * (app/offer-book/_lib/supabase.ts). Não duplica o client — só adiciona
 * health check + interface uniforme.
 */
import { getSupabase } from "@/app/offer-book/_lib/supabase";
import { logConnector } from "../logger";
import type { Connector, ConnectorHealth } from "../types";

export const supabaseConnector: Connector = {
  id: "supabase",
  name: "Supabase",
  category: "data",

  getRequiredConfig() {
    return ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];
  },

  isConfigured() {
    return Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
  },

  async checkHealth(): Promise<ConnectorHealth> {
    const checkedAt = new Date().toISOString();

    if (!this.isConfigured()) {
      logConnector("supabase", "warn", "credenciais ausentes");
      return {
        status: "not_configured",
        message: "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY não configuradas",
        checkedAt,
      };
    }

    const sb = getSupabase();
    if (!sb) {
      return { status: "not_configured", message: "cliente não inicializado", checkedAt };
    }

    const start = Date.now();
    try {
      // Query mínima e barata só para confirmar conectividade real —
      // não conta linhas, só verifica se o servidor responde.
      const { error } = await sb.from("clientes").select("id").limit(1);
      const latencyMs = Date.now() - start;

      if (error) {
        logConnector("supabase", "error", "health check falhou", { error: error.message });
        return { status: "degraded", message: error.message, checkedAt, latencyMs };
      }

      logConnector("supabase", "info", "health check ok", { latencyMs });
      return { status: "connected", message: "ok", checkedAt, latencyMs };
    } catch (err) {
      const message = err instanceof Error ? err.message : "erro desconhecido";
      logConnector("supabase", "error", "health check falhou (exceção)", { message });
      return { status: "degraded", message, checkedAt, latencyMs: Date.now() - start };
    }
  },
};
