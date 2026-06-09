import { NextRequest, NextResponse } from "next/server";
import { notifyTelegram } from "@/app/_lib/telegram";

/**
 * POST /api/telegram/send
 * Body: { text: string }
 *
 * Manual endpoint for testing Telegram notifications.
 */
export async function POST(req: NextRequest) {
  let body: { text?: string };
  try {
    body = (await req.json()) as { text?: string };
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body.text || typeof body.text !== "string") {
    return NextResponse.json(
      { error: "Campo 'text' é obrigatório" },
      { status: 400 },
    );
  }

  const result = await notifyTelegram(body.text);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
