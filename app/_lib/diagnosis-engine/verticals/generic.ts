/**
 * Vertical fallback — sem overrides, sem extra questions. Usada quando
 * nenhuma vertical mais específica se aplica, ou como base de referência
 * para construir uma nova.
 */
import type { VerticalConfig } from "../types";

export const GENERIC_VERTICAL: VerticalConfig = {
  id: "generic",
  label: "Genérico (sem vertical específica)",
  description: "Configuração neutra — pesos iguais, sem terminologia customizada.",
  recommendations: {
    aquisicao: [
      { condition: "low", text: "TODO: recomendação real pendente de caso de uso — hoje só 1 canal de aquisição, considerar diversificar." },
      { condition: "mid", text: "TODO: recomendação real pendente de caso de uso — aquisição existe mas não é sistemática." },
      { condition: "high", text: "TODO: recomendação real pendente de caso de uso — aquisição madura, considerar escalar o canal principal." },
    ],
    conversao: [
      { condition: "low", text: "TODO: recomendação real pendente de caso de uso — investigar a objeção mais citada antes de qualquer ação de marketing." },
    ],
    entrega: [
      { condition: "low", text: "TODO: recomendação real pendente de caso de uso — capacidade parece não acompanhar a demanda." },
    ],
    retencao: [
      { condition: "low", text: "TODO: recomendação real pendente de caso de uso — taxa de recompra baixa, mapear motivo de churn." },
    ],
    oferta_precificacao: [
      { condition: "low", text: "TODO: recomendação real pendente de caso de uso — oferta pouco clara ou sem diferencial comunicado." },
    ],
    operacao_eficiencia: [
      { condition: "low", text: "TODO: recomendação real pendente de caso de uso — tempo de resposta alto, maior risco de perda de lead." },
    ],
    capacidade_time: [
      { condition: "low", text: "TODO: recomendação real pendente de caso de uso — negócio depende de uma única pessoa (bus factor crítico)." },
    ],
    saude_financeira: [
      { condition: "low", text: "TODO: recomendação real pendente de caso de uso — margem apertada ou nula, priorizar precificação antes de crescer aquisição." },
    ],
  },
};
