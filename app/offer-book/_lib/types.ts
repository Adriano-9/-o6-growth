export type Cliente = {
  empresa: string;
  site: string;
  instagram: string;
  nicho: string;
  cidade: string;
  estado: string;
  ticketMedio: string;
  fonteLeads: string;
};

export type ICP = {
  idade: string;
  sexo: string;
  renda: string;
  profissao: string;
  momentoVida: string;
  objetivoPrincipal: string;
  problemaPrincipal: string;
};

export type Psicografia = {
  desejos: string;
  medos: string;
  objecoes: string;
  frustracoes: string;
  sonhos: string;
  crencas: string;
};

export type Concorrente = {
  id: string;
  nome: string;
  site: string;
  instagram: string;
  posicionamento: string;
  ofertaPrincipal: string;
  ticketEstimado: string;
};

export type Oferta = {
  produto: string;
  ticket: string;
  garantia: string;
  transformacao: string;
  diferencial: string;
  mecanismoUnico: string;
  prova: string;
};

export type Diagnostico = {
  tempoResposta: string;
  origemLeads: string;
  crm: string;
  vendedores: string;
  ticketMedio: string;
  conversaoAtual: string;
  leadsMes: string;
};

export type OfferBookState = {
  cliente: Cliente;
  icp: ICP;
  psicografia: Psicografia;
  concorrentes: Concorrente[];
  oferta: Oferta;
  diagnostico: Diagnostico;
};

export const emptyCliente: Cliente = {
  empresa: "",
  site: "",
  instagram: "",
  nicho: "",
  cidade: "",
  estado: "",
  ticketMedio: "",
  fonteLeads: "",
};

export const emptyICP: ICP = {
  idade: "",
  sexo: "",
  renda: "",
  profissao: "",
  momentoVida: "",
  objetivoPrincipal: "",
  problemaPrincipal: "",
};

export const emptyPsicografia: Psicografia = {
  desejos: "",
  medos: "",
  objecoes: "",
  frustracoes: "",
  sonhos: "",
  crencas: "",
};

export const emptyOferta: Oferta = {
  produto: "",
  ticket: "",
  garantia: "",
  transformacao: "",
  diferencial: "",
  mecanismoUnico: "",
  prova: "",
};

export const emptyDiagnostico: Diagnostico = {
  tempoResposta: "",
  origemLeads: "",
  crm: "",
  vendedores: "",
  ticketMedio: "",
  conversaoAtual: "",
  leadsMes: "",
};

export const emptyConcorrente = (): Concorrente => ({
  id:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2),
  nome: "",
  site: "",
  instagram: "",
  posicionamento: "",
  ofertaPrincipal: "",
  ticketEstimado: "",
});

export const emptyState: OfferBookState = {
  cliente: emptyCliente,
  icp: emptyICP,
  psicografia: emptyPsicografia,
  concorrentes: [],
  oferta: emptyOferta,
  diagnostico: emptyDiagnostico,
};
