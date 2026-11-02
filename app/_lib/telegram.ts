/**
 * Telegram Bot notification helper.
 *
 * ENV vars required:
 *   TELEGRAM_BOT_TOKEN  — from @BotFather
 *   TELEGRAM_CHAT_ID    — target chat/group/channel ID
 *
 * Usage:
 *   import { notifyTelegram } from "@/app/_lib/telegram";
 *   await notifyTelegram("Nova demo gerada para Clínica X");
 *
 * Fire-and-forget safe — never throws, logs errors to console.
 */

const TELEGRAM_API = "https://api.telegram.org";

export type TelegramResult =
  | { ok: true; messageId: number }
  | { ok: false; error: string };

export type TelegramInlineButton = {
  text: string;
  callbackData: string;
};

/**
 * Send a plain-text message via Telegram Bot API.
 * Returns result object — never throws.
 */
export async function notifyTelegram(
  text: string,
  options?: {
    parseMode?: "HTML" | "MarkdownV2";
    inlineKeyboard?: TelegramInlineButton[][];
  },
): Promise<TelegramResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    const missing = [
      !token && "TELEGRAM_BOT_TOKEN",
      !chatId && "TELEGRAM_CHAT_ID",
    ]
      .filter(Boolean)
      .join(", ");
    console.warn(`[telegram] skipped — missing env: ${missing}`);
    return { ok: false, error: `Missing env: ${missing}` };
  }

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options?.parseMode ?? "HTML",
        disable_web_page_preview: true,
        ...(options?.inlineKeyboard
          ? {
              reply_markup: {
                inline_keyboard: options.inlineKeyboard.map((row) =>
                  row.map((button) => ({
                    text: button.text,
                    callback_data: button.callbackData,
                  })),
                ),
              },
            }
          : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[telegram] API error ${res.status}: ${body}`);
      return { ok: false, error: `API ${res.status}: ${body}` };
    }

    const data: unknown = await res.json();
    if (
      typeof data !== "object" ||
      data === null ||
      !("result" in data) ||
      typeof data.result !== "object" ||
      data.result === null ||
      !("message_id" in data.result) ||
      typeof data.result.message_id !== "number"
    ) {
      return { ok: false, error: "Telegram retornou resposta inválida." };
    }
    return { ok: true, messageId: data.result.message_id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error(`[telegram] fetch failed: ${msg}`);
    return { ok: false, error: msg };
  }
}

export async function answerTelegramCallback(
  callbackQueryId: string,
  text: string,
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return false;
  try {
    const response = await fetch(
      `${TELEGRAM_API}/bot${token}/answerCallbackQuery`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
      },
    );
    return response.ok;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[telegram] callback answer failed", message);
    return false;
  }
}

export async function editTelegramMessage(
  chatId: string,
  messageId: number,
  text: string,
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return false;
  try {
    const response = await fetch(`${TELEGRAM_API}/bot${token}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: { inline_keyboard: [] },
      }),
    });
    return response.ok;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[telegram] edit message failed", message);
    return false;
  }
}

// ── Pre-built notification templates ──

export function formatNewProspects(count: number, query: string): string {
  return [
    `<b>Novos prospects capturados</b>`,
    ``,
    `Quantidade: <b>${count}</b>`,
    `Busca: ${escapeHtml(query)}`,
    ``,
    `Acesse /oportunidades para ver detalhes.`,
  ].join("\n");
}

export function formatDemoGenerated(
  prospectName: string,
  demoUrl: string,
): string {
  return [
    `<b>Demo gerada</b>`,
    ``,
    `Prospect: <b>${escapeHtml(prospectName)}</b>`,
    `URL: ${escapeHtml(demoUrl)}`,
    ``,
    `Pronta para enviar ao prospect.`,
  ].join("\n");
}

export function formatMeetingCreated(
  contactName: string,
  date: string,
  time: string,
): string {
  return [
    `<b>Reunião agendada</b>`,
    ``,
    `Contato: <b>${escapeHtml(contactName)}</b>`,
    `Data: ${escapeHtml(date)}`,
    `Horário: ${escapeHtml(time)}`,
  ].join("\n");
}

export function formatAuditCompleted(
  prospectName: string,
  score: number,
): string {
  return [
    `<b>Auditoria concluída</b>`,
    ``,
    `Prospect: <b>${escapeHtml(prospectName)}</b>`,
    `Score: <b>${score}/100</b>`,
    ``,
    `Acesse /oportunidades para gerar abordagem.`,
  ].join("\n");
}

export function formatPipelineComplete(
  prospectName: string,
  auditScore: number,
): string {
  return [
    `<b>Pipeline completo</b>`,
    ``,
    `Prospect: <b>${escapeHtml(prospectName)}</b>`,
    `Audit score: <b>${auditScore}/100</b>`,
    `Abordagem WhatsApp gerada.`,
    ``,
    `Pronto para contato.`,
  ].join("\n");
}

export function formatDiagnosisPending(input: {
  businessName: string;
  contactName: string;
  segment: string;
  score: number;
  recommendedOffer: string;
  amountPaid: number;
}): string {
  const amount = (input.amountPaid / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  return [
    `<b>Diagnóstico Express aguardando aprovação</b>`,
    ``,
    `Negócio: <b>${escapeHtml(input.businessName)}</b>`,
    `Contato: ${escapeHtml(input.contactName)}`,
    `Segmento: ${escapeHtml(input.segment)}`,
    `Pagamento: <b>${escapeHtml(amount)}</b>`,
    `Score interno: <b>${input.score}/100</b>`,
    `Caminho sugerido: ${escapeHtml(input.recommendedOffer)}`,
    ``,
    `Aprovar promove o comprador ao CRM. Nenhuma mensagem será enviada automaticamente.`,
  ].join("\n");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
