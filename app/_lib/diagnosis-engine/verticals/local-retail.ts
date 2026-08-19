/**
 * Vertical: comércio/varejo local (referência de caso real: Empório).
 * Template configurável — nenhum dado real do negócio foi inserido, só a
 * estrutura típica desse modelo (fluxo físico de clientes importa mais
 * que "conversão" no sentido de venda consultiva).
 */
import type { Question, VerticalConfig } from "../types";

const FLUXO_DIARIO_QUESTION: Question = {
  id: "local_retail.fluxo_diario",
  capabilityId: "aquisicao",
  type: "number",
  label: "Quantas pessoas entram na loja/estabelecimento por dia, em média?",
  placeholder: "Ex.: 60",
  weight: 0.3,
};

export const LOCAL_RETAIL_VERTICAL: VerticalConfig = {
  id: "local-retail",
  label: "Comércio/varejo local (ex.: mercearia, empório, loja de bairro)",
  description:
    "Fluxo físico de clientes e giro de produto pesam mais que conversão consultiva. Entrega = experiência de compra na loja.",
  capabilityWeights: {
    aquisicao: 1.3,
    entrega: 1.3,
    conversao: 0.8,
    retencao: 1.1,
    oferta_precificacao: 1,
    operacao_eficiencia: 1,
    capacidade_time: 0.9,
    saude_financeira: 1,
  },
  extraQuestions: [FLUXO_DIARIO_QUESTION],
  questionOverrides: {
    "conversao.taxa_fechamento": {
      label: "De quem entra na loja, qual % efetivamente compra algo?",
    },
    "entrega.tempo_execucao": {
      label: "Como é a experiência de compra — atendimento rápido, tem fila, é self-service?",
    },
  },
  terminology: {
    cliente: "cliente",
    equipe: "equipe de loja",
  },
  recommendations: {
    aquisicao: [
      { condition: "low", text: "TODO: recomendação real pendente do caso — fluxo de loja baixo pode indicar visibilidade/localização, não necessariamente marketing digital." },
    ],
    entrega: [
      { condition: "low", text: "TODO: recomendação real pendente do caso — experiência de compra ruim (fila, demora) derruba recompra mais que preço em varejo local." },
    ],
  },
};
