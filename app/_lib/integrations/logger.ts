/**
 * Logger centralizado para a camada de integração.
 *
 * Todo conector loga pelo mesmo formato — facilita grep no Vercel e
 * consumo futuro pelo Hermes/Dashboard OS.
 *
 * Persistência real: grava em `connector_logs` (Supabase). Funções
 * serverless (Vercel) não compartilham memória entre invocações — um
 * buffer em RAM sozinho se perderia a cada cold start e mentiria pro
 * Dashboard sobre ter histórico. O buffer em memória aqui é só um
 * fallback imediato para quando o insert no Supabase falha (fail-soft,
 * nunca quebra o fluxo do conector por causa de log).
 *
 * Migration: supabase/migrations/013_connector_logs.sql
 */
import { getSupabase } from "@/app/offer-book/_lib/supabase";
import type { ConnectorLogEntry } from "./types";

const MAX_MEMORY_BUFFER = 200;
const memoryBuffer: ConnectorLogEntry[] = [];

export function logConnector(
  connector: string,
  level: ConnectorLogEntry["level"],
  message: string,
  meta?: Record<string, unknown>,
): void {
  const entry: ConnectorLogEntry = {
    timestamp: new Date().toISOString(),
    connector,
    level,
    message,
    meta,
  };

  memoryBuffer.push(entry);
  if (memoryBuffer.length > MAX_MEMORY_BUFFER) memoryBuffer.shift();

  const prefix = `[${connector}]`;
  if (level === "error") console.error(prefix, message, meta ?? "");
  else if (level === "warn") console.warn(prefix, message, meta ?? "");
  else console.log(prefix, message, meta ?? "");

  // Fire-and-forget — nunca deixa falha de log quebrar o conector.
  persistLog(entry).catch(() => {
    /* já logado no console acima; silencioso aqui de propósito */
  });
}

async function persistLog(entry: ConnectorLogEntry): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.from("connector_logs").insert({
    connector_id: entry.connector,
    level: entry.level,
    message: entry.message,
    meta: entry.meta ?? null,
  });
  if (error) {
    // Não usa logConnector aqui (evita recursão) — console direto.
    console.warn("[integrations/logger] persist falhou", error.message);
  }
}

/**
 * Últimos N logs — tenta Supabase primeiro (histórico real entre
 * invocações), cai pro buffer em memória se a tabela ainda não existir
 * ou a query falhar.
 */
export async function getRecentLogs(limit = 50): Promise<ConnectorLogEntry[]> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from("connector_logs")
      .select("created_at, connector_id, level, message, meta")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (!error && data) {
      return data.map((row) => ({
        timestamp: row.created_at as string,
        connector: row.connector_id as string,
        level: row.level as ConnectorLogEntry["level"],
        message: row.message as string,
        meta: (row.meta as Record<string, unknown>) ?? undefined,
      }));
    }
  }
  return memoryBuffer.slice(-limit).reverse();
}
