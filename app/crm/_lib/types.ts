export const STAGES = [
  "Novo Lead",
  "Contato Feito",
  "Diagnóstico Agendado",
  "Diagnóstico Entregue",
  "Proposta",
  "Fechado",
  "Perdido",
] as const;

export type Stage = (typeof STAGES)[number];

export type Lead = {
  id: string;
  clienteId: string | null;
  empresa: string;
  nome: string;
  whatsapp: string;
  email: string;
  nicho: string;
  cidade: string;
  score: number;
  stage: Stage;
  valor: number;
  sortOrder: number;
  data: string;
  createdAt: string;
  updatedAt: string;
};

export type LeadInput = Omit<
  Lead,
  "id" | "createdAt" | "updatedAt" | "sortOrder"
> & {
  sortOrder?: number;
};

export const emptyLeadInput = (stage: Stage = "Novo Lead"): LeadInput => ({
  clienteId: null,
  empresa: "",
  nome: "",
  whatsapp: "",
  email: "",
  nicho: "",
  cidade: "",
  score: 0,
  stage,
  valor: 0,
  data: new Date().toISOString(),
});

export function rowToLead(r: Record<string, unknown>): Lead {
  return {
    id: r.id as string,
    clienteId: (r.cliente_id as string | null) ?? null,
    empresa: (r.empresa as string) ?? "",
    nome: (r.nome as string) ?? "",
    whatsapp: (r.whatsapp as string) ?? "",
    email: (r.email as string) ?? "",
    nicho: (r.nicho as string) ?? "",
    cidade: (r.cidade as string) ?? "",
    score: Number(r.score ?? 0),
    stage: (r.stage as Stage) ?? "Novo Lead",
    valor: Number(r.valor ?? 0),
    sortOrder: Number(r.sort_order ?? 0),
    data: (r.data as string) ?? "",
    createdAt: (r.created_at as string) ?? "",
    updatedAt: (r.updated_at as string) ?? "",
  };
}

export function leadToRow(l: Partial<LeadInput> & { sortOrder?: number }) {
  const row: Record<string, unknown> = {};
  if (l.clienteId !== undefined) row.cliente_id = l.clienteId;
  if (l.empresa !== undefined) row.empresa = l.empresa;
  if (l.nome !== undefined) row.nome = l.nome;
  if (l.whatsapp !== undefined) row.whatsapp = l.whatsapp;
  if (l.email !== undefined) row.email = l.email;
  if (l.nicho !== undefined) row.nicho = l.nicho;
  if (l.cidade !== undefined) row.cidade = l.cidade;
  if (l.score !== undefined) row.score = l.score;
  if (l.stage !== undefined) row.stage = l.stage;
  if (l.valor !== undefined) row.valor = l.valor;
  if (l.sortOrder !== undefined) row.sort_order = l.sortOrder;
  if (l.data !== undefined) row.data = l.data;
  return row;
}
