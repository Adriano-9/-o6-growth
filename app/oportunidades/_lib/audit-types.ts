export type Recommendation = {
  priority: "P1" | "P2" | "P3";
  title: string;
  description: string;
  impact_brl?: number;
};

export type AuditResult = {
  prospectId: string;
  auditUrl: string;
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
  recommendations: Recommendation[];
};

export type Audit = AuditResult & {
  id: string;
  createdAt: string;
  updatedAt: string;
};
