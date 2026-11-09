import { whatsappUrl } from "@/app/_lib/contato";

// Link de pagamento do Mercado Pago (R$ 197), criado no painel do MP.
// Enquanto não estiver configurado, o botão cai no WhatsApp para não perder a venda.
export const EXPRESS_PAYMENT_URL =
  process.env.NEXT_PUBLIC_MP_EXPRESS_URL || whatsappUrl("Olá, quero contratar o Diagnóstico Express de R$ 197.");

export const EXPRESS_HAS_PAYMENT_LINK = Boolean(process.env.NEXT_PUBLIC_MP_EXPRESS_URL);

export const EXPRESS_PRICE = "R$ 197";
export const EXPRESS_DEADLINE = "até 48h úteis";
