/**
 * Registry central de conectores — ponto único que Hermes e o Dashboard
 * OS consultam para saber "quais integrações existem e qual o estado
 * de cada uma". Isso é o que torna Hermes um orquestrador possível: ele
 * não precisa importar 8 módulos diferentes, só `getAllConnectors()`.
 */
import { supabaseConnector } from "./connectors/supabase";
import { telegramConnector } from "./connectors/telegram";
import { githubConnector } from "./connectors/github";
import {
  claudeCodeConnector,
  codexConnector,
  higgsfieldConnector,
  dev21Connector,
} from "./connectors/unavailable";
import type { Connector, ConnectorHealth } from "./types";

/**
 * Ordem de registro reflete a ordem pedida na integração: Claude Code,
 * Codex, GitHub, Supabase, Telegram, MCP Higgsfield, MCP 21.dev.
 * "Dashboard OS" não entra aqui — ele é o consumidor deste registry,
 * não um conector (não existe API de si mesmo para conectar).
 */
const CONNECTORS: Connector[] = [
  claudeCodeConnector,
  codexConnector,
  githubConnector,
  supabaseConnector,
  telegramConnector,
  higgsfieldConnector,
  dev21Connector,
];

export function getAllConnectors(): Connector[] {
  return CONNECTORS;
}

export function getConnector(id: string): Connector | undefined {
  return CONNECTORS.find((c) => c.id === id);
}

export interface ConnectorSnapshot {
  id: string;
  name: string;
  category: string;
  requiredConfig: string[];
  health: ConnectorHealth;
}

/**
 * Roda checkHealth() de todos os conectores em paralelo. Cada um é
 * fail-soft internamente (nunca lança) — mesmo assim, envolvemos em
 * try/catch por segurança extra: um conector com bug não pode derrubar
 * a consulta dos outros 7.
 */
export async function getAllConnectorsHealth(): Promise<ConnectorSnapshot[]> {
  const results = await Promise.all(
    CONNECTORS.map(async (connector) => {
      let health: ConnectorHealth;
      try {
        health = await connector.checkHealth();
      } catch (err) {
        health = {
          status: "degraded",
          message: err instanceof Error ? err.message : "erro desconhecido no checkHealth",
          checkedAt: new Date().toISOString(),
        };
      }
      return {
        id: connector.id,
        name: connector.name,
        category: connector.category,
        requiredConfig: connector.getRequiredConfig(),
        health,
      };
    }),
  );
  return results;
}
