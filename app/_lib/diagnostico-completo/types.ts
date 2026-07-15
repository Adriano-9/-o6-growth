/**
 * Tipos de domínio do Diagnóstico Completo O6 — espelham os conceitos já
 * definidos em docs/playbooks/diagnostico-completo.md. Não existe workflow
 * de código para este processo ainda (ele roda 100% manual, ver seção 10
 * do playbook) — este arquivo é só o vocabulário tipado que um futuro
 * workflow usaria, sem lógica nenhuma.
 */

/**
 * Contexto do cliente/negócio sendo diagnosticado — dados coletados via
 * entrevista, nunca via acesso a sistemas (playbook seção 4).
 */
export type ClientContext = {
  nomeNegocio: string;
  segmento: string;
  canaisAtendimento: string[]; // ex.: ["WhatsApp", "Instagram Direct"]
  ticketMedio?: number;
  volumeMensalAproximado?: number;
  percentualRecompraEstimado?: number;
};

/**
 * Evidência real e medida de uma dor — corresponde ao campo pain_evidence
 * da skill offerbook-generator. Nunca fabricada: se não há medição real,
 * a dor é tratada como "declarada" em vez de "evidenciada" (playbook
 * seções 2 e 5, regra de honestidade).
 */
export type PainEvidence = {
  canal: string; // ex.: "WhatsApp"
  descricao: string; // ex.: "tempo de resposta medido"
  valorMedido: string; // ex.: "1h12min" — texto livre, não normalizado aqui
  dataMedicao: string; // ISO date do teste manual
  fonte: "teste_manual" | "declarado_entrevista";
};

/** Classificação de tempo de resposta — thresholds do playbook seção 7. */
export type ClassificacaoTempoResposta = "excelente" | "aceitavel" | "critico";

/** Severidade de gap — critério do playbook seção 7. */
export type SeveridadeGap = "alta" | "media" | "baixa";

/**
 * Um gap priorizado dentro do relatório — estrutura fato/custo/caminho
 * do playbook seção 6. impactoFinanceiroEstimado só deve ser preenchido
 * quando houver dois números reais para multiplicar (regra de honestidade
 * do playbook) — ausência aqui deve virar o texto "impacto não
 * quantificável com os dados coletados" na camada de apresentação, não
 * neste tipo.
 */
export type DiagnosisGap = {
  titulo: string;
  oQueEstaAcontecendo: string;
  fonte: PainEvidence | "declarado_entrevista";
  impactoFinanceiroEstimado?: number; // R$/mês — omitir se não quantificável
  oQueResolveria: string;
  severidade: SeveridadeGap;
};

/**
 * Relatório final do Diagnóstico Completo — espelha a estrutura de 7
 * blocos do playbook seção 8 (referência: Proposta_Carol_O6, arquivo
 * original fora deste repo).
 */
export type DiagnosisReport = {
  cliente: ClientContext;
  dataGeracao: string; // ISO date
  resumoExecutivo: string;
  comoFoiFeito: string;
  // Até 3 gaps (playbook seção 6). Menos de 3 é permitido quando não há
  // evidência suficiente — nunca preencher com gap inventado.
  gaps: DiagnosisGap[];
  scoreTempoRespostaPorCanal: Array<{
    canal: string;
    tempoMedidoMinutos?: number;
    classificacao: ClassificacaoTempoResposta;
  }>;
  proximosPassosRecomendados: ServiceRecommendation[];
  validadeProposta?: string;
};

/**
 * Catálogo de serviço recomendado no relatório — playbook seção 9.
 * escopo é opcional/undefined deliberadamente: o Sprint (R$4.800) não
 * tem escopo definido ainda e não deve ser inventado aqui.
 */
export type ServiceRecommendation = {
  servico: "site_simples" | "site_completo" | "manutencao_mensal" | "sprint";
  preco: number;
  escopoDefinido: boolean;
  escopo?: string; // undefined quando escopoDefinido === false (ex.: Sprint hoje)
};
