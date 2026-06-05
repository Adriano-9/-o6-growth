"use client";

import { Activity, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { AuditResult } from "../_lib/audit-types";

type Props = {
  audit: AuditResult | null;
  loading?: boolean;
  error?: string;
};

function ScoreRing({ value, label }: { value: number; label: string }) {
  const color =
    value >= 70
      ? "text-emerald-400"
      : value >= 50
        ? "text-amber-300"
        : "text-red-400";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </div>
    </div>
  );
}

function RecommendationCard({
  priority,
  title,
  description,
  impact,
}: {
  priority: "P1" | "P2" | "P3";
  title: string;
  description: string;
  impact?: number;
}) {
  const iconClass =
    priority === "P1"
      ? "text-red-400"
      : priority === "P2"
        ? "text-amber-300"
        : "text-zinc-400";

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
      <div className="flex items-start gap-2">
        <AlertCircle className={`h-4 w-4 shrink-0 mt-0.5 ${iconClass}`} />
        <div className="flex-1">
          <div className="text-xs font-bold text-white">{title}</div>
          <p className="mt-1 text-[11px] text-zinc-400">{description}</p>
          {impact && (
            <div className="mt-2 text-[10px] font-semibold text-brand-cyan">
              💰 Impacto estimado: R$ {impact.toLocaleString("pt-BR")}
            </div>
          )}
        </div>
        <span
          className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
            priority === "P1"
              ? "bg-red-500/20 text-red-300"
              : priority === "P2"
                ? "bg-amber-300/20 text-amber-200"
                : "bg-zinc-500/20 text-zinc-300"
          }`}
        >
          {priority}
        </span>
      </div>
    </div>
  );
}

export function AuditPanel({ audit, loading, error }: Props) {
  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 flex items-center justify-center gap-3">
        <Loader2 className="h-4 w-4 animate-spin text-brand-cyan" />
        <span className="text-sm text-zinc-400">Auditando site...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-400 mt-0.5" />
          <div className="text-sm text-red-200">{error}</div>
        </div>
      </div>
    );
  }

  if (!audit) {
    return null;
  }

  const p1Recommendations = audit.recommendations.filter((r) => r.priority === "P1");
  const p2Recommendations = audit.recommendations.filter((r) => r.priority === "P2");
  const p3Recommendations = audit.recommendations.filter((r) => r.priority === "P3");

  return (
    <div className="space-y-4 rounded-xl border border-brand-cyan/20 bg-brand-cyan/[0.04] p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-brand-cyan" />
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-cyan">
            Auditoria de Site
          </div>
          <div className="text-xs text-zinc-400">{audit.auditUrl}</div>
        </div>
      </div>

      {/* 7 Scores Grid */}
      <div className="grid grid-cols-4 gap-3">
        <ScoreRing value={audit.seoScore} label="SEO" />
        <ScoreRing value={audit.performanceScore} label="Performance" />
        <ScoreRing value={audit.uxScore} label="UX" />
        <ScoreRing value={audit.trustScore} label="Trust" />
        <ScoreRing value={audit.conversionScore} label="Conversão" />
        <ScoreRing value={audit.mobileScore} label="Mobile" />
        <ScoreRing value={audit.contentScore} label="Conteúdo" />
        <div className="rounded-lg border border-brand-cyan/30 bg-brand-cyan/[0.1] p-2 flex flex-col items-center justify-center">
          <div className="text-2xl font-black text-brand-cyan">{audit.overallScore}</div>
          <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-brand-cyan">
            Geral
          </div>
        </div>
      </div>

      {/* Recomendações */}
      {audit.recommendations.length > 0 && (
        <div className="space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
            Plano de Ação ({p1Recommendations.length} P1 · {p2Recommendations.length} P2 · {p3Recommendations.length} P3)
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {audit.recommendations.map((rec, idx) => (
              <RecommendationCard
                key={idx}
                priority={rec.priority}
                title={rec.title}
                description={rec.description}
                impact={rec.impact_brl}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
