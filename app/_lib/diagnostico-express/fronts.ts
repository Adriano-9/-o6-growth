export const EXPRESS_FRONTS = [
  {
    id: "posicionamento",
    label: "Marca e posicionamento",
    prompt: "Quem é seu público, por que escolhem você e como a marca aparece hoje?",
    checks: [
      { id: "publico", label: "O público prioritário está definido", action: "Definir um perfil de cliente prioritário antes de ampliar a comunicação." },
      { id: "diferencial", label: "Quem nunca ouviu falar da marca entende o diferencial em poucos segundos", action: "Reescrever o diferencial em uma frase que o cliente consiga comparar." },
      { id: "identidade", label: "Logo, cores e estilo são os mesmos em todos os canais e passam profissionalismo", action: "Padronizar identidade visual (logo, cores, fontes) em site, Instagram e Google." },
      { id: "narrativa", label: "Site, Instagram, Google e WhatsApp contam a mesma história", action: "Alinhar descrição, diferenciais e contatos em todos os canais públicos." },
      { id: "dono", label: "Existe alguém responsável por manter a marca consistente", action: "Definir quem aprova o que sai em nome da marca e com qual referência." },
    ],
  },
  {
    id: "oferta",
    label: "Oferta",
    prompt: "Quais serviços ou pacotes você quer vender e onde o cliente costuma hesitar?",
    checks: [
      { id: "servicos", label: "Serviços e limites estão explicados", action: "Descrever entregáveis, limites e para quem a oferta faz sentido." },
      { id: "valor", label: "A promessa e o valor percebido são claros", action: "Conectar a oferta ao problema real sem prometer resultado não comprovado." },
      { id: "preco", label: "Preço, faixa de investimento ou condição são explicados sem constrangimento", action: "Definir como e quando o investimento é apresentado, igual para toda a equipe." },
      { id: "duvidas", label: "Existe conteúdo que responde as dúvidas do cliente antes da conversa", action: "Reunir as 10 perguntas mais comuns e respondê-las no site e nos destaques." },
      { id: "compra", label: "O próximo passo para comprar ou agendar é simples", action: "Reduzir etapas e deixar explícito como iniciar a contratação." },
    ],
  },
  {
    id: "presenca",
    label: "Presença e busca",
    prompt: "Informe seus canais digitais e o que já percebeu sobre como o cliente encontra você.",
    checks: [
      { id: "busca", label: "Quem pesquisa o problema no Google encontra sua empresa sem digitar o nome", action: "Revisar títulos, páginas e Perfil da Empresa para as buscas do seu público; SEO não garante posição." },
      { id: "perfil_google", label: "O Perfil da Empresa no Google está completo, com fotos, horários e respostas", action: "Completar o Perfil da Empresa no Google e responder avaliações com regularidade." },
      { id: "paginas", label: "Cada serviço principal tem uma página própria, pensada para ser encontrada", action: "Criar uma página por serviço principal, com dúvidas e próximo passo." },
      { id: "mobile", label: "O site carrega rápido, funciona bem no celular e é seguro", action: "Revisar velocidade, navegação móvel e formulários antes de investir em tráfego." },
      { id: "ia", label: "A empresa aparece quando alguém pede indicação ao ChatGPT ou ao Gemini", action: "Organizar respostas claras e dados públicos consistentes; nenhuma ação garante citação em IA." },
    ],
  },
  {
    id: "aquisicao",
    label: "Conteúdo e aquisição",
    prompt: "Como você produz conteúdo hoje e de onde chegam os novos contatos?",
    checks: [
      { id: "rotina", label: "O conteúdo segue uma rotina planejada, não só quando sobra tempo", action: "Montar um calendário simples, com formatos e frequência que a equipe consegue manter." },
      { id: "descoberta", label: "O conteúdo é pensado para quem ainda não conhece a marca, não só para quem já segue", action: "Incluir pautas sobre as dores do público para atrair quem ainda não segue." },
      { id: "mensagem", label: "Cada conteúdo ou campanha tem uma oferta e uma ação principal", action: "Escolher uma mensagem e uma ação principal por peça ou campanha." },
      { id: "origem", label: "A origem de cada contato é registrada", action: "Registrar de onde veio cada oportunidade antes de ampliar canais." },
      { id: "metricas", label: "Os números do conteúdo e dos anúncios orientam o próximo teste", action: "Acompanhar mensalmente o que gerou conversa e repetir o que funcionou." },
    ],
  },
  {
    id: "conversao",
    label: "Conversão e reputação",
    prompt: "Como funciona o atendimento até a decisão e o que acontece com quem não fecha de primeira?",
    checks: [
      { id: "resposta", label: "Novos contatos recebem resposta rápida, com responsável definido", action: "Definir responsável e tempo de primeira resposta por canal." },
      { id: "followup", label: "Propostas e agendamentos têm acompanhamento", action: "Criar rotina de follow-up e confirmação sem depender da memória." },
      { id: "avaliacoes", label: "A empresa tem avaliações positivas e recentes no Google", action: "Pedir avaliação a clientes satisfeitos de forma rotineira e responder todas." },
      { id: "prova", label: "Há casos e depoimentos autorizados, dentro das regras da sua profissão", action: "Organizar provas autorizadas e verificáveis, respeitando o conselho da profissão e a LGPD." },
      { id: "retomada", label: "Conversas que esfriaram são retomadas com contexto", action: "Revisar semanalmente conversas paradas e retomar com uma mensagem útil." },
    ],
  },
] as const;

export const TEAM_SIZES = ["individual", "2_5", "6_15", "16_50", "50_mais"] as const;
export const MARKETING_BUDGETS = ["nao_invisto", "ate_1k", "1k_3k", "3k_10k", "acima_10k"] as const;
export const TEAM_SIZE_LABELS: Record<(typeof TEAM_SIZES)[number], string> = {
  individual: "Só eu", "2_5": "2 a 5 pessoas", "6_15": "6 a 15 pessoas", "16_50": "16 a 50 pessoas", "50_mais": "Mais de 50 pessoas",
};
export const MARKETING_BUDGET_LABELS: Record<(typeof MARKETING_BUDGETS)[number], string> = {
  nao_invisto: "Ainda não invisto", ate_1k: "Até R$ 1.000/mês", "1k_3k": "R$ 1.000 a R$ 3.000/mês", "3k_10k": "R$ 3.000 a R$ 10.000/mês", acima_10k: "Acima de R$ 10.000/mês",
};
export const EXPRESS_CHECK_COUNT = EXPRESS_FRONTS.reduce((sum, front) => sum + front.checks.length, 0);

export type FrontId = (typeof EXPRESS_FRONTS)[number]["id"];
export type CheckAnswer = "sim" | "parcial" | "nao" | "nao_sei";
export type FrontInput = { context: string; checks: Record<string, CheckAnswer> };
export type ExpressDiagnosisInput = {
  paymentId: string;
  externalReference: string;
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
    teamSize?: (typeof TEAM_SIZES)[number];
    marketingBudget?: (typeof MARKETING_BUDGETS)[number];
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
      typeof input.paymentId !== "string" || !/^\d{1,20}$/.test(input.paymentId) ||
      typeof input.externalReference !== "string" || input.externalReference.length > 80 ||
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
  if (business.teamSize !== undefined && !(TEAM_SIZES as readonly string[]).includes(String(business.teamSize))) return false;
  if (business.marketingBudget !== undefined && !(MARKETING_BUDGETS as readonly string[]).includes(String(business.marketingBudget))) return false;
  for (const key of ["monthlyContacts", "monthlyConversions", "averageTicket"] as const) {
    const number = business[key];
    if (number !== undefined && (typeof number !== "number" || !Number.isFinite(number) || number < 0 || number > 10_000_000)) return false;
  }
  return true;
}
