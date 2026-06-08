export const PROSPECT_STATUS = [
  "Novo",
  "Auditado",
  "Demo Gerada",
  "Contato Enviado",
  "Reunião",
  "Fechado",
] as const;

export type ProspectStatus = (typeof PROSPECT_STATUS)[number];

// AuditResult duplicado aqui só pra evitar import circular (Drawer está em _components).
// Mantém compat com app/oportunidades/_lib/audit-types.ts.
export type ProspectAuditJson = {
  prospectId?: string;
  auditUrl?: string;
  seoScore: number;
  performanceScore: number;
  uxScore: number;
  trustScore: number;
  conversionScore: number;
  mobileScore: number;
  contentScore: number;
  overallScore: number;
  psiDesktopScore?: number;
  psiMobileScore?: number;
  recommendations: Array<{
    priority: "P1" | "P2" | "P3";
    title: string;
    description: string;
    impact_brl?: number;
  }>;
};

export type Prospect = {
  id: string;
  nome: string;
  site: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  instagram: string;
  googleRating: number | null;
  googleReviews: number | null;
  categoria: string;
  googlePlaceId: string | null;
  status: ProspectStatus;
  createdAt: string;
  updatedAt: string;
  // Pipeline columns (migration 008) — opcionais; nullables quando não auditado
  auditScore: number | null;
  auditJson: ProspectAuditJson | null;
  aberturaWhatsapp: string | null;
  abordagemGeradaEm: string | null;
  // Demo site columns (migration 009)
  demoUrl: string | null;
  demoGeneratedAt: string | null;
};

// Campos puramente server-managed (audit, AI, demo, timestamps) NÃO fazem parte do input.
export type ProspectInput = Omit<
  Prospect,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "auditScore"
  | "auditJson"
  | "aberturaWhatsapp"
  | "abordagemGeradaEm"
  | "demoUrl"
  | "demoGeneratedAt"
>;

export const emptyProspectInput = (): ProspectInput => ({
  nome: "",
  site: "",
  telefone: "",
  endereco: "",
  cidade: "",
  estado: "",
  instagram: "",
  googleRating: null,
  googleReviews: null,
  categoria: "",
  googlePlaceId: null,
  status: "Novo",
});

export function rowToProspect(r: Record<string, unknown>): Prospect {
  return {
    id: r.id as string,
    nome: (r.nome as string) ?? "",
    site: (r.site as string) ?? "",
    telefone: (r.telefone as string) ?? "",
    endereco: (r.endereco as string) ?? "",
    cidade: (r.cidade as string) ?? "",
    estado: (r.estado as string) ?? "",
    instagram: (r.instagram as string) ?? "",
    googleRating:
      r.google_rating != null ? Number(r.google_rating) : null,
    googleReviews:
      r.google_reviews != null ? Number(r.google_reviews) : null,
    categoria: (r.categoria as string) ?? "",
    googlePlaceId: (r.google_place_id as string | null) ?? null,
    status: (r.status as ProspectStatus) ?? "Novo",
    createdAt: (r.created_at as string) ?? "",
    updatedAt: (r.updated_at as string) ?? "",
    auditScore: r.audit_score != null ? Number(r.audit_score) : null,
    auditJson: (r.audit_json as ProspectAuditJson | null) ?? null,
    aberturaWhatsapp: (r.abertura_whatsapp as string | null) ?? null,
    abordagemGeradaEm: (r.abordagem_gerada_em as string | null) ?? null,
    demoUrl: (r.demo_url as string | null) ?? null,
    demoGeneratedAt: (r.demo_generated_at as string | null) ?? null,
  };
}

export function prospectToRow(
  p: Partial<ProspectInput>,
): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (p.nome !== undefined) row.nome = p.nome;
  if (p.site !== undefined) row.site = p.site;
  if (p.telefone !== undefined) row.telefone = p.telefone;
  if (p.endereco !== undefined) row.endereco = p.endereco;
  if (p.cidade !== undefined) row.cidade = p.cidade;
  if (p.estado !== undefined) row.estado = p.estado;
  if (p.instagram !== undefined) row.instagram = p.instagram;
  if (p.googleRating !== undefined) row.google_rating = p.googleRating;
  if (p.googleReviews !== undefined) row.google_reviews = p.googleReviews;
  if (p.categoria !== undefined) row.categoria = p.categoria;
  if (p.googlePlaceId !== undefined) row.google_place_id = p.googlePlaceId;
  if (p.status !== undefined) row.status = p.status;
  return row;
}

// Tipo de retorno de /api/apify-search (e legado /api/places)
export type PlaceResult = {
  nome: string;
  site: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  instagram: string;
  googleRating: number | null;
  googleReviews: number | null;
  categoria: string;
  googlePlaceId: string;
};
