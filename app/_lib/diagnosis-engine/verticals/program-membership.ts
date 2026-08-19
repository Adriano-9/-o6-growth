/**
 * Vertical hipotética: programa/curso/assinatura recorrente.
 *
 * AVISO: esta é uma HIPÓTESE não confirmada para o caso real "Xseries" —
 * não há informação de negócio disponível sobre a Xseries nesta sessão.
 * O nome "Xseries" sugere um produto estruturado em série/módulos
 * (curso, programa de treinamento, ou assinatura), mas isso não foi
 * verificado com o operador. Antes de usar esta vertical para o caso
 * real, confirmar o modelo de negócio e renomear/ajustar se necessário.
 */
import type { VerticalConfig } from "../types";

export const PROGRAM_MEMBERSHIP_VERTICAL: VerticalConfig = {
  id: "program-membership",
  label: "Programa/curso/assinatura recorrente (HIPÓTESE — confirmar antes de usar em caso real)",
  description:
    "Modelo de negócio com entrega estruturada em módulos/período e receita recorrente — retenção pesa mais que aquisição pontual.",
  capabilityWeights: {
    retencao: 1.6,
    entrega: 1.2,
    conversao: 1.1,
    aquisicao: 1,
    oferta_precificacao: 1,
    operacao_eficiencia: 0.9,
    capacidade_time: 0.9,
    saude_financeira: 1.1,
  },
  questionOverrides: {
    "retencao.taxa_recompra": {
      label: "Qual % dos alunos/membros renova ou permanece ativo além do primeiro ciclo?",
    },
    "entrega.tempo_execucao": {
      label: "Quanto tempo dura o programa/curso do início ao fim?",
    },
  },
  terminology: {
    cliente: "aluno/membro",
  },
  recommendations: {
    retencao: [
      { condition: "low", text: "TODO: recomendação real pendente do caso — em modelo recorrente, churn alto no primeiro ciclo geralmente indica problema de onboarding, não de conteúdo." },
    ],
  },
};
