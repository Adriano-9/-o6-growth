// TODO: confirmar se este é o número em que a Sofia atende
export const WHATSAPP_O6 = "5571994054891";

export function whatsappUrl(mensagem: string) {
  return `https://wa.me/${WHATSAPP_O6}?text=${encodeURIComponent(mensagem)}`;
}
