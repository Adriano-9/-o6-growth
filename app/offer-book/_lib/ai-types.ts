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

export type AiOutput = {
  sintese: AiSintese;
  planoAcao: { prioridades: AiPrioridade[] };
  roadmap: { fases: AiFase[] };
};

export type AiGenerateResponse = AiOutput & {
  generatedAt: string;
  tokensUsed: number;
  model: string;
  cached: boolean;
};
