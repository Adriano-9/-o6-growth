/**
 * Camada de integração O6 — contrato único que todo conector implementa.
 *
 * Por que existe: Hermes (VPS) e o Dashboard OS precisam de uma forma
 * consistente de perguntar "esse serviço está vivo?" e "essa ação
 * funcionou?" para qualquer integração — Supabase, Telegram, GitHub,
 * ou qualquer uma futura. Sem essa interface, cada rota reinventa seu
 * próprio formato de erro/log, o que já aconteceu no projeto antes
 * (ver AGENTS.md — regras de erro por rota, aplicadas ad-hoc).
 *
 * Regra de honestidade (herdada de docs/bootstrap/01_SYSTEM_PROMPT_O6.md):
 * um conector sem credencial real NUNCA reporta "connected" — ele
 * reporta "not_configured" ou "not_available", com o motivo explícito.
 */

export type ConnectorStatus =
  | "connected" // credenciais presentes, health check passou
  | "degraded" // credenciais presentes, mas health check falhou ou está lento
  | "not_configured" // credenciais ausentes — o conector existe, falta configurar
  | "not_available"; // não existe API server-side para este serviço (ex.: Claude Code, Codex)

export type ConnectorCategory =
  | "data" // Supabase
  | "notification" // Telegram
  | "vcs" // GitHub
  | "agent" // Claude Code, Codex
  | "mcp" // Higgsfield, 21st.dev
  | "dashboard"; // Dashboard OS (consumidor, não provedor)

export interface ConnectorHealth {
  status: ConnectorStatus;
  message: string;
  checkedAt: string; // ISO timestamp
  latencyMs?: number;
}

export interface ConnectorLogEntry {
  timestamp: string;
  connector: string;
  level: "info" | "warn" | "error";
  message: string;
  meta?: Record<string, unknown>;
}

/**
 * Contrato único de conector. Toda integração — real ou "não disponível"
 * — implementa esta interface. Isso é o que torna Hermes um orquestrador
 * central possível: ele não precisa saber os detalhes de cada serviço,
 * só chamar `.checkHealth()` e `.getConfig()` de forma uniforme.
 */
export interface Connector {
  readonly id: string;
  readonly name: string;
  readonly category: ConnectorCategory;

  /** Verifica se o conector está configurado E funcionando. Nunca lança — sempre retorna um ConnectorHealth. */
  checkHealth(): Promise<ConnectorHealth>;

  /** Retorna quais variáveis de ambiente/credenciais este conector espera, sem vazar valores. */
  getRequiredConfig(): string[];

  /** true se as credenciais mínimas estão presentes (não significa que o serviço está no ar — ver checkHealth). */
  isConfigured(): boolean;
}

/** Erro tipado para qualquer falha de conector — nunca deixamos escapar erro genérico sem contexto. */
export class ConnectorError extends Error {
  constructor(
    public readonly connectorId: string,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(`[${connectorId}] ${message}`);
    this.name = "ConnectorError";
  }
}
