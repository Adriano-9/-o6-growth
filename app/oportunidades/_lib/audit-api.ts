import { AuditResult } from "./audit-types";

export async function auditProspect(
  prospectId: string,
  auditUrl: string,
): Promise<AuditResult | null> {
  if (!auditUrl || !auditUrl.startsWith("http")) {
    throw new Error("URL inválida");
  }

  try {
    const res = await fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prospectId, auditUrl }),
    });

    if (!res.ok) {
      const error = (await res.json()) as { error?: string };
      throw new Error(error.error || `Audit failed: ${res.status}`);
    }

    return (await res.json()) as AuditResult;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("[auditProspect]", msg);
    throw err;
  }
}
