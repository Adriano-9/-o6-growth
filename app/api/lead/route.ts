import { NextRequest, NextResponse } from "next/server";
import { createLead } from "@/app/crm/_lib/api";
import { emptyLeadInput } from "@/app/crm/_lib/types";

// ─────────────────────────────────────────────────────────────
// POST /api/lead
//
// Webhook de entrada para leads qualificados vindos de um agente
// externo (GPTMaker/Sofia). Camada HTTP fina em cima de createLead()
// (app/crm/_lib/api.ts) — a mesma função usada pelo Kanban do CRM e
// pelo formulário do site (O6Footer.tsx). Não duplica persistência:
// se createLead() ganhar dedup/upsert por telefone no futuro, este
// endpoint herda automaticamente.
// ─────────────────────────────────────────────────────────────

type SofiaLeadInput = {
  nome: string;
  telefone: string;
  email: string | null;
  pontos: number;
  resumo: string;
};

function isValidInput(body: unknown): body is SofiaLeadInput {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.nome === "string" &&
    b.nome.trim().length > 0 &&
    typeof b.telefone === "string" &&
    b.telefone.trim().length > 0 &&
    (b.email === null || typeof b.email === "string") &&
    typeof b.pontos === "number" &&
    Number.isFinite(b.pontos) &&
    typeof b.resumo === "string"
  );
}

export async function POST(req: NextRequest) {
  const secret = process.env.O6_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "O6_WEBHOOK_SECRET não configurada" },
      { status: 503 },
    );
  }

  const provided = req.headers.get("x-o6-secret");
  if (provided !== secret) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!isValidInput(body)) {
    return NextResponse.json(
      {
        error:
          "Payload inválido — esperado { nome: string, telefone: string, email: string|null, pontos: number, resumo: string }",
      },
      { status: 400 },
    );
  }

  const score = Math.max(0, Math.min(100, Math.round(body.pontos)));

  const lead = await createLead({
    ...emptyLeadInput("Novo Lead"),
    nome: body.nome.trim(),
    whatsapp: body.telefone.trim(),
    email: body.email?.trim() ?? "",
    score,
    notas: body.resumo,
    origem: "gptmaker_sofia",
  });

  if (!lead) {
    console.error("[lead] createLead retornou null — insert falhou");
    return NextResponse.json(
      { error: "Falha ao criar lead" },
      { status: 502 },
    );
  }

  return NextResponse.json({ lead }, { status: 200 });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
