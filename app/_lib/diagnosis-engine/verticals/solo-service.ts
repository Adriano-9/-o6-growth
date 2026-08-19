/**
 * Vertical: prestador de serviço solo (referência de caso real: Patricia
 * Abreu, massoterapeuta). Template configurável — nenhum dado real do
 * negócio dela foi inserido aqui, só a estrutura de peso/terminologia
 * típica desse tipo de operação (1 pessoa, capacidade é o teto de receita).
 */
import type { VerticalConfig } from "../types";

export const SOLO_SERVICE_VERTICAL: VerticalConfig = {
  id: "solo-service",
  label: "Serviço local solo (ex.: massoterapia, estética individual)",
  description:
    "Prestador único, capacidade de agenda é o principal teto de receita. Dependência de 1 pessoa pesa mais no score geral.",
  capabilityWeights: {
    capacidade_time: 1.6,
    entrega: 1.3,
    aquisicao: 0.9,
    conversao: 0.9,
    retencao: 1.2,
    oferta_precificacao: 1,
    operacao_eficiencia: 0.9,
    saude_financeira: 1,
  },
  questionOverrides: {
    "capacidade.numero_pessoas": {
      label: "Quantas pessoas atendem hoje (você + eventuais ajudantes)?",
    },
    "entrega.capacidade_vs_demanda": {
      label: "Sua agenda está cheia, no limite, equilibrada ou com vagas sobrando?",
    },
  },
  terminology: {
    cliente: "cliente/paciente",
    equipe: "você (+ eventual apoio)",
  },
  recommendations: {
    capacidade_time: [
      { condition: "low", text: "TODO: recomendação real pendente do caso — negócio 100% dependente de 1 pessoa; mapear o que travaria se ela precisasse parar por 1 semana." },
    ],
    entrega: [
      { condition: "low", text: "TODO: recomendação real pendente do caso — agenda sobrecarregada limita crescimento; considerar preço/triagem antes de mais aquisição." },
    ],
    retencao: [
      { condition: "low", text: "TODO: recomendação real pendente do caso — recorrência baixa em serviço de bem-estar geralmente indica falta de plano de continuidade (pacote/assinatura)." },
    ],
  },
};
