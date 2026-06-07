export type AiSintese = {
  posicionamento: string;
  diagnosticoCritico: string;
  ofertaIrresistivel: string;
  mensagemPrincipal: string;
};

export type AiPrioridade = {
  rank: 1 | 2 | 3;
  area: string;
  titulo: string;
  corpo: string;
  metrica: string;
  prazo: string;
};

export type AiFase = {
  numero: 1 | 2 | 3;
  titulo: string;
  horizonte: string;
  foco: string;
  itens: string[];
};

export type AiRecomendacao = {
  acao: string;
  impacto: string;
  responsavel: string;
};

export type AiStrategic = {
  curtoPrazo: {
    horizonte: "0-30 dias";
    objetivo: string;
    acoes: AiRecomendacao[];
  };
  medioPrazo: {
    horizonte: "30-90 dias";
    objetivo: string;
    acoes: AiRecomendacao[];
  };
  longoPrazo: {
    horizonte: "90-180 dias";
    objetivo: string;
    acoes: AiRecomendacao[];
  };
  potencialReceita: string;
  principalGargalo: string;
  diferencial: string;
};

export type AiArquetipo = {
  nome: string;
  descricao: string;
};

export type AiGatilho = {
  gatilho: string;
  quando: string;
};

export type AiInsightsOcultos = {
  medosOcultos: string[];
  desejosOcultos: string[];
  objecoesEmocionais: string[];
  crencasLimitantes: string[];
  padroesLinguagem: string[];
  arquetiposDominantes: AiArquetipo[];
  gatilhosCompra: AiGatilho[];
};

export type AiOutput = {
  sintese: AiSintese;
  planoAcao: { prioridades: AiPrioridade[] };
  roadmap: { fases: AiFase[] };
  strategic: AiStrategic;
  insightsOcultos: AiInsightsOcultos;
};

export type AiGenerateResponse = AiOutput & {
  generatedAt: string;
  tokensUsed: number;
  model: string;
  cached: boolean;
};
