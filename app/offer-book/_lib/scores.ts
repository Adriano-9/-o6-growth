import { OfferBookState } from "./types";

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

const filled = (v: string) => v.trim().length > 0;

function fillRatio(values: string[]): number {
  if (values.length === 0) return 0;
  const f = values.filter(filled).length;
  return (f / values.length) * 100;
}

/**
 * Score de velocidade — deriva do tempo médio de resposta ao lead.
 */
export function velocidadeScore(state: OfferBookState): number {
  const raw = state.diagnostico.tempoResposta.trim().toLowerCase();
  if (!raw) return 0;

  if (/(imediat|instant|tempo\s*real|< ?\d?\s*seg|segundos?)/.test(raw)) {
    return 95;
  }

  const minMatch = raw.match(/(\d+)\s*min/);
  if (minMatch) {
    const m = parseInt(minMatch[1], 10);
    if (m <= 1) return 90;
    if (m <= 5) return 80;
    if (m <= 15) return 65;
    if (m <= 30) return 50;
    if (m <= 60) return 35;
    return 25;
  }

  const horaMatch = raw.match(/(\d+)\s*h(ora)?s?/);
  if (horaMatch) {
    const h = parseInt(horaMatch[1], 10);
    if (h <= 1) return 35;
    if (h <= 4) return 25;
    if (h <= 12) return 15;
    return 10;
  }

  if (/dia/.test(raw)) return 8;

  return 30;
}

/**
 * Score de oferta — completude dos 7 campos + densidade textual.
 */
export function ofertaScore(state: OfferBookState): number {
  const o = state.oferta;
  const fields = [
    o.produto,
    o.ticket,
    o.garantia,
    o.transformacao,
    o.diferencial,
    o.mecanismoUnico,
    o.prova,
  ];
  const base = fillRatio(fields);
  const richTextLen =
    o.transformacao.length + o.diferencial.length + o.mecanismoUnico.length;
  const richBonus = Math.min(15, Math.floor(richTextLen / 80));
  return clamp(base * 0.85 + richBonus);
}

/**
 * Score de aquisição — clareza das fontes de leads, CRM e equipe comercial.
 */
export function aquisicaoScore(state: OfferBookState): number {
  const d = state.diagnostico;
  const c = state.cliente;
  const fields = [c.fonteLeads, d.origemLeads, d.crm, d.vendedores];
  const base = fillRatio(fields);
  const hasMultiCanal =
    /[,/+\n]|\be\b/.test(d.origemLeads) || /[,/+\n]|\be\b/.test(c.fonteLeads);
  const bonus = hasMultiCanal ? 8 : 0;
  return clamp(base * 0.9 + bonus);
}

/**
 * Score de conversão — combina ticket médio, conversão atual declarada
 * e clareza do problema/transformação.
 */
export function conversaoScore(state: OfferBookState): number {
  const d = state.diagnostico;
  const c = state.cliente;
  const i = state.icp;
  const o = state.oferta;

  const fieldsFilled = fillRatio([
    d.conversaoAtual,
    d.ticketMedio || c.ticketMedio,
    i.problemaPrincipal,
    o.transformacao,
  ]);

  const pctMatch = d.conversaoAtual.match(/(\d+(?:[.,]\d+)?)\s*%/);
  let conversionBonus = 0;
  if (pctMatch) {
    const pct = parseFloat(pctMatch[1].replace(",", "."));
    if (pct >= 30) conversionBonus = 20;
    else if (pct >= 15) conversionBonus = 14;
    else if (pct >= 7) conversionBonus = 8;
    else if (pct > 0) conversionBonus = 4;
  }

  return clamp(fieldsFilled * 0.75 + conversionBonus);
}

/**
 * Score de potencial de crescimento — cruza ticket, volume de leads e
 * maturidade do ICP (quanto mais definido, maior o potencial de escalar).
 */
export function potencialScore(state: OfferBookState): number {
  const { cliente, icp, psicografia, diagnostico } = state;

  // Ticket médio normalizado (R$500 = 10pts, R$5000+ = 50pts)
  const ticketRaw = parseFloat(
    (diagnostico.ticketMedio || cliente.ticketMedio).replace(/\D/g, "") || "0",
  );
  let ticketPts = 0;
  if (ticketRaw >= 5000) ticketPts = 50;
  else if (ticketRaw >= 2000) ticketPts = 35;
  else if (ticketRaw >= 1000) ticketPts = 20;
  else if (ticketRaw >= 500) ticketPts = 10;

  // ICP bem definido (problema, objetivo, perfil) = mercado mensurável
  const icpFields = [
    icp.profissao,
    icp.problemaPrincipal,
    icp.objetivoPrincipal,
    psicografia.desejos,
    psicografia.objecoes,
  ];
  const icpPts = fillRatio(icpFields) * 0.3;

  // Volume de leads declarado
  const leads = parseInt(diagnostico.leadsMes.replace(/\D/g, "") || "0", 10);
  let leadsPts = 0;
  if (leads >= 100) leadsPts = 20;
  else if (leads >= 50) leadsPts = 15;
  else if (leads >= 20) leadsPts = 10;
  else if (leads > 0) leadsPts = 5;

  return clamp(ticketPts + icpPts + leadsPts);
}

/**
 * Score de eficiência comercial — cruza prova social, garantia e diferencial
 * com concorrentes mapeados. Empresa que conhece seus concorrentes e tem
 * prova sólida converte mais eficientemente.
 */
export function eficienciaScore(state: OfferBookState): number {
  const { oferta, concorrentes, psicografia } = state;

  // Prova + garantia robustas
  const ofertaPts = fillRatio([oferta.prova, oferta.garantia, oferta.diferencial]) * 0.4;

  // Concorrentes mapeados (mais mapeados = mais inteligência de mercado)
  const concorrPts = Math.min(30, concorrentes.length * 10);

  // Objeções e medos mapeados (quanto mais conhece o ICP, mais eficiente)
  const psicoFields = [psicografia.objecoes, psicografia.medos, psicografia.frustracoes];
  const psicoPts = fillRatio(psicoFields) * 0.3;

  return clamp(ofertaPts + concorrPts + psicoPts);
}

export type ScoreKey =
  | "velocidade"
  | "oferta"
  | "aquisicao"
  | "conversao"
  | "potencial"
  | "eficiencia";

export type ScoreDef = {
  key: ScoreKey;
  label: string;
  description: string;
  value: number;
};

export function computeScores(state: OfferBookState): ScoreDef[] {
  return [
    {
      key: "velocidade",
      label: "Velocidade",
      description: "Latência operacional na resposta ao lead.",
      value: velocidadeScore(state),
    },
    {
      key: "oferta",
      label: "Oferta",
      description: "Maturidade da construção e prova da oferta.",
      value: ofertaScore(state),
    },
    {
      key: "aquisicao",
      label: "Aquisição",
      description: "Clareza de canais, CRM e equipe comercial.",
      value: aquisicaoScore(state),
    },
    {
      key: "conversao",
      label: "Conversão",
      description: "Conversão atual cruzada com transformação prometida.",
      value: conversaoScore(state),
    },
    {
      key: "potencial",
      label: "Potencial",
      description: "Potencial de crescimento: ticket × volume × ICP definido.",
      value: potencialScore(state),
    },
    {
      key: "eficiencia",
      label: "Eficiência",
      description: "Prova social, garantia e inteligência competitiva.",
      value: eficienciaScore(state),
    },
  ];
}

export function scoreTier(value: number): "low" | "mid" | "high" {
  if (value >= 70) return "high";
  if (value >= 40) return "mid";
  return "low";
}
