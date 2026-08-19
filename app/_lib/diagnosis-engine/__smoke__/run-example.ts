/**
 * Smoke test standalone — roda o engine de verdade com respostas de
 * exemplo (fictícias, não são dados de nenhum caso real) e imprime o
 * resultado. Rodar com: npx tsx app/_lib/diagnosis-engine/__smoke__/run-example.ts
 */
import { CAPABILITIES } from "../capabilities";
import { computeDiagnosis } from "../engine";
import { getVertical } from "../verticals";
import type { Answer } from "../types";

const exampleAnswers: Answer[] = [
  { questionId: "aquisicao.origem_principal", value: "Instagram e indicação" },
  { questionId: "aquisicao.volume_mes", value: 12 },
  { questionId: "aquisicao.canais_ativos", value: "dois_ou_tres" },
  { questionId: "conversao.taxa_fechamento", value: 35 },
  { questionId: "conversao.objecao_principal", value: "preço da sessão" },
  { questionId: "conversao.tempo_decisao", value: 60 },
  { questionId: "entrega.tempo_execucao", value: "sessão de 1h" },
  { questionId: "entrega.capacidade_vs_demanda", value: "no_limite" },
  { questionId: "entrega.qualidade_percebida", value: "clientes elogiam o cuidado no atendimento" },
  { questionId: "retencao.taxa_recompra", value: 45 },
  { questionId: "retencao.motivo_churn", value: "mudança de cidade, na maioria dos casos" },
  { questionId: "retencao.tempo_relacionamento", value: 6 },
  { questionId: "oferta.clareza", value: "massagem terapêutica focada em dor crônica" },
  { questionId: "oferta.ticket_medio", value: 220 },
  { questionId: "oferta.diferencial_garantia", value: true },
  { questionId: "operacao.tempo_resposta", value: 20 },
  { questionId: "operacao.ferramenta_gestao", value: "whatsapp_apenas" },
  { questionId: "operacao.gargalo_principal", value: "agenda toda manual pelo WhatsApp" },
  { questionId: "capacidade.numero_pessoas", value: 1 },
  { questionId: "capacidade.dependencia_unica", value: true },
  { questionId: "capacidade.papeis_definidos", value: true },
  { questionId: "financeiro.margem_percebida", value: "apertada" },
  { questionId: "financeiro.sazonalidade", value: false },
  { questionId: "financeiro.previsibilidade_caixa", value: "chute_educado" },
];

const vertical = getVertical("solo-service");
const result = computeDiagnosis(CAPABILITIES, exampleAnswers, vertical);

console.log(JSON.stringify(result, null, 2));
