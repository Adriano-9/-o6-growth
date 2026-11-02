export const EXPRESS_FRONTS = [
  {
    id: "posicionamento",
    label: "Posicionamento e mercado",
    prompt: "Quem é seu público, qual nicho você prioriza e por que escolhem sua empresa?",
    checks: [
      { id: "publico", label: "O público prioritário está definido", action: "Definir um perfil de cliente prioritário antes de ampliar a comunicação." },
      { id: "diferencial", label: "O diferencial é claro para quem compra", action: "Reescrever o diferencial em termos que o cliente consiga comparar." },
      { id: "autoridade", label: "Há provas verificáveis de experiência ou autoridade", action: "Organizar provas reais de experiência, respeitando permissões e privacidade." },
    ],
  },
  {
    id: "oferta",
    label: "Oferta",
    prompt: "Quais serviços ou pacotes você quer vender e onde o cliente costuma hesitar?",
    checks: [
      { id: "servicos", label: "Serviços e limites estão explicados", action: "Descrever entregáveis, limites e para quem a oferta faz sentido." },
      { id: "valor", label: "A promessa e o valor percebido são claros", action: "Conectar a oferta ao problema real sem prometer resultado não comprovado." },
      { id: "compra", label: "O próximo passo para comprar ou agendar é simples", action: "Reduzir etapas e deixar explícito como iniciar a contratação." },
    ],
  },
  {
    id: "presenca",
    label: "Presença digital",
    prompt: "Informe seus canais digitais e o que já percebeu sobre clareza, mobile e confiança.",
    checks: [
      { id: "clareza", label: "Site, redes e Google explicam a mesma oferta", action: "Alinhar descrição, contatos e oferta nos canais públicos." },
      { id: "mobile", label: "A experiência funciona bem no celular e é segura", action: "Revisar navegação móvel, formulários e segurança antes de investir em tráfego." },
      { id: "busca", label: "Páginas respondem dúvidas e podem ser encontradas", action: "Revisar títulos, conteúdo útil e respostas claras; SEO, AEO e GEO não garantem exposição." },
    ],
  },
  {
    id: "aquisicao",
    label: "Aquisição e comunicação",
    prompt: "De onde chegam oportunidades hoje? Como conteúdo, anúncios ou indicações viram contatos?",
    checks: [
      { id: "origem", label: "A origem dos contatos é registrada", action: "Registrar a origem de cada oportunidade antes de ampliar canais." },
      { id: "mensagem", label: "Conteúdo e campanhas comunicam uma oferta específica", action: "Escolher uma mensagem e uma ação principal por campanha." },
      { id: "ponte", label: "Indicações e audiência têm um caminho para conversar", action: "Criar um próximo passo claro para quem chega por indicação ou conteúdo." },
    ],
  },
  {
    id: "conversao",
    label: "Conversão e relacionamento",
    prompt: "Como funciona o atendimento até a decisão e o que acontece com quem não fecha de primeira?",
    checks: [
      { id: "resposta", label: "Novos contatos recebem resposta com responsável definido", action: "Definir responsável e tempo de primeira resposta por canal." },
      { id: "followup", label: "Propostas e agendamentos têm acompanhamento", action: "Criar rotina de follow-up e confirmação sem depender da memória." },
      { id: "prova", label: "Há prova social e recuperação de oportunidades", action: "Organizar depoimentos autorizados e retomar conversas abertas com contexto." },
    ],
  },
] as const;

export type FrontId = (typeof EXPRESS_FRONTS)[number]["id"];
export type CheckAnswer = "sim" | "parcial" | "nao" | "nao_sei";
export type FrontInput = { context: string; checks: Record<string, CheckAnswer> };
export type ExpressDiagnosisInput = {
  checkoutSessionId: string;
  contact: { name: string; email: string; phone?: string };
  consent: true;
  business: {
    name: string;
    segment: string;
    siteUrl?: string;
    googleUrl?: string;
    instagramUrl?: string;
    monthlyContacts?: number;
    monthlyConversions?: number;
    averageTicket?: number;
  };
  fronts: Record<FrontId, FrontInput>;
};

export function isExpressDiagnosisInput(value: unknown): value is ExpressDiagnosisInput {
  const isRecord = (item: unknown): item is Record<string, unknown> =>
    typeof item === "object" && item !== null && !Array.isArray(item);
  if (!isRecord(value)) return false;
  const input = value as Record<string, unknown>;
  if (!isRecord(input.contact) || !isRecord(input.business) || !isRecord(input.fronts)) return false;
  const contact = input.contact;
  const business = input.business;
  const fronts = input.fronts;
  if (input.consent !== true ||
      typeof input.checkoutSessionId !== "string" || !input.checkoutSessionId.startsWith("cs_") ||
      typeof contact.name !== "string" || contact.name.trim().length < 2 ||
      typeof contact.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email) ||
      typeof business.name !== "string" || business.name.trim().length < 2 ||
      typeof business.segment !== "string" || business.segment.trim().length < 2 ||
      (contact.phone !== undefined && typeof contact.phone !== "string")) return false;
  for (const front of EXPRESS_FRONTS) {
    const answer = fronts[front.id];
    if (!isRecord(answer) || typeof answer.context !== "string" || answer.context.trim().length < 8 ||
        answer.context.length > 2000 || !isRecord(answer.checks)) return false;
    const checks = answer.checks;
    if (!front.checks.every((check) => ["sim", "parcial", "nao", "nao_sei"].includes(String(checks[check.id])))) return false;
  }
  for (const key of ["siteUrl", "googleUrl", "instagramUrl"] as const) {
    const url = business[key];
    if (url !== undefined && (typeof url !== "string" || url.length > 500 ||
        (url.trim() !== "" && !/^https?:\/\//i.test(url)))) return false;
  }
  for (const key of ["monthlyContacts", "monthlyConversions", "averageTicket"] as const) {
    const number = business[key];
    if (number !== undefined && (typeof number !== "number" || !Number.isFinite(number) || number < 0 || number > 10_000_000)) return false;
  }
  return true;
}
