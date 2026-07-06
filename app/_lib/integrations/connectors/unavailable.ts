/**
 * Conectores "registrados mas não conectáveis" — Claude Code, Codex,
 * Higgsfield e 21st.dev não têm API server-side chamável a partir do
 * runtime Next.js hoje. Documentar isso como `not_available` (não
 * `not_configured`) é a diferença entre "falta configurar uma chave"
 * e "esse serviço não é uma integração de runtime, é uma ferramenta
 * de desenvolvimento ou um connector exclusivo do claude.ai".
 *
 * Ver docs/bootstrap/05_BOOTSTRAP_CODEX.md, 07_BOOTSTRAP_HIGGSFIELD.md,
 * 08_BOOTSTRAP_21DEV.md para o raciocínio completo de cada um.
 *
 * Por que registrar mesmo sem poder conectar: o Dashboard OS e o
 * Hermes precisam de uma lista completa e honesta de "capacidades da
 * plataforma" — inclusive as que não são chamáveis agora — para que
 * ninguém pergunte "cadê o conector de Codex?" sem resposta.
 */
import { logConnector } from "../logger";
import type { Connector, ConnectorCategory, ConnectorHealth } from "../types";

function makeUnavailableConnector(
  id: string,
  name: string,
  category: ConnectorCategory,
  reason: string,
): Connector {
  return {
    id,
    name,
    category,
    getRequiredConfig: () => [],
    isConfigured: () => false,
    async checkHealth(): Promise<ConnectorHealth> {
      const checkedAt = new Date().toISOString();
      logConnector(id, "info", "checkHealth chamado em conector not_available", { reason });
      return { status: "not_available", message: reason, checkedAt };
    },
  };
}

export const claudeCodeConnector = makeUnavailableConnector(
  "claude-code",
  "Claude Code",
  "agent",
  "Claude Code é o próprio agente executando esta sessão — não existe uma API externa para 'conectar com ele mesmo' a partir do runtime da aplicação.",
);

export const codexConnector = makeUnavailableConnector(
  "codex",
  "Codex",
  "agent",
  "Codex nunca foi instalado ou executado neste repositório. AGENTS.md define convenções para quando ele for ativado, mas não há endpoint ou credencial hoje.",
);

export const higgsfieldConnector = makeUnavailableConnector(
  "higgsfield-mcp",
  "MCP Higgsfield",
  "mcp",
  "Higgsfield só existe como MCP connector OAuth do claude.ai (Claude Chat). Não há API key própria para chamar a partir de uma rota server-side do Next.js.",
);

export const dev21Connector = makeUnavailableConnector(
  "21dev-mcp",
  "MCP 21st.dev",
  "mcp",
  "21st.dev nunca foi autorizado com sucesso nesta conta — aparece como MCP pendente de autenticação, sem credencial disponível para uso programático.",
);
