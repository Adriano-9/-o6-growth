import { NextResponse } from "next/server";
import { getAllConnectorsHealth } from "@/app/_lib/integrations/registry";
import { getRecentLogs } from "@/app/_lib/integrations/logger";

export const dynamic = "force-dynamic";

/**
 * GET /api/integrations/status
 *
 * Fonte única de status de toda a camada de integração — consumida
 * pelo Dashboard OS (Mission Control). Retorna o estado real de cada
 * conector (nunca inflado) + os últimos logs persistidos.
 */
export async function GET() {
  try {
    const [connectors, logs] = await Promise.all([
      getAllConnectorsHealth(),
      getRecentLogs(30),
    ]);

    const summary = {
      total: connectors.length,
      connected: connectors.filter((c) => c.health.status === "connected").length,
      degraded: connectors.filter((c) => c.health.status === "degraded").length,
      notConfigured: connectors.filter((c) => c.health.status === "not_configured").length,
      notAvailable: connectors.filter((c) => c.health.status === "not_available").length,
    };

    return NextResponse.json({ summary, connectors, logs });
  } catch (err) {
    const message = err instanceof Error ? err.message : "erro desconhecido";
    console.error("[api/integrations/status]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
