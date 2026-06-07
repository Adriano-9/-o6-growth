"use client";

import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Copy,
  DollarSign,
  Handshake,
  LayoutDashboard,
  Loader2,
  Mail,
  MessageSquare,
  Plus,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  ClienteOption,
  convertToCliente,
  createLead,
  deleteLead,
  listClienteOptions,
  listLeads,
  listMessageTemplates,
  listStageHistory,
  listStageHistorySince,
  moveLead,
  updateLead,
  upsertMessageTemplate,
} from "./_lib/api";
import {
  emptyLeadInput,
  Lead,
  LeadInput,
  MessageTemplate,
  STAGES,
  Stage,
  StatusPagamento,
  StageHistoryEntry,
} from "./_lib/types";

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

function formatDate(iso: string): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function formatDateFull(iso: string): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function isOverdue(lead: Lead): boolean {
  if (!lead.dataProximaAcao) return false;
  if (lead.stage === "Fechado" || lead.stage === "Perdido") return false;
  return new Date(lead.dataProximaAcao) < new Date();
}

const stageTone: Record<Stage, string> = {
  "Novo Lead": "border-zinc-500/40 text-zinc-300",
  "Contato Feito": "border-sky-400/40 text-sky-300",
  "Diagnóstico Agendado": "border-amber-300/40 text-amber-200",
  "Diagnóstico Entregue": "border-brand-cyan/40 text-brand-cyan",
  Proposta: "border-orange-400/40 text-orange-300",
  Fechado: "border-emerald-400/40 text-emerald-300",
  Perdido: "border-red-500/40 text-red-300",
};

const statusPagamentoBadge: Record<StatusPagamento, string> = {
  pendente: "bg-zinc-500/15 text-zinc-300",
  cobrado: "bg-amber-300/15 text-amber-200",
  pago: "bg-emerald-400/15 text-emerald-200",
  cancelado: "bg-red-500/15 text-red-200",
};

function scoreTone(value: number): string {
  if (value >= 70) return "bg-emerald-400/15 text-emerald-200";
  if (value >= 40) return "bg-amber-300/15 text-amber-200";
  return "bg-red-500/15 text-red-200";
}

// ─────────────────────────────────────────────────────────────
// Default message templates
// ─────────────────────────────────────────────────────────────

const DEFAULT_TEMPLATES: Record<Stage, { whatsapp: string; email: string }> = {
  "Novo Lead": {
    whatsapp:
      "Olá {nome}! Vi que você se interessou pela {empresa}. Tenho uma disponibilidade hoje para uma conversa de 15 minutos — quando você tem tempo?",
    email:
      "Olá {nome},\n\nObrigado pelo interesse na {empresa}.\n\nGostaria de entender melhor sua situação e mostrar como podemos ajudar. Quando teria 15 minutos esta semana?\n\nAtenciosamente",
  },
  "Contato Feito": {
    whatsapp:
      "Oi {nome}, tudo bem? Só passando para confirmar se você teve tempo de pensar na nossa conversa. Posso tirar qualquer dúvida que tiver!",
    email:
      "Olá {nome},\n\nDando seguimento ao nosso contato anterior. Gostaria de entender se você teve a oportunidade de avaliar a proposta.\n\nEstou à disposição para esclarecer qualquer ponto.",
  },
  "Diagnóstico Agendado": {
    whatsapp:
      "Oi {nome}! Só confirmando nossa reunião de diagnóstico amanhã. Estarei preparado para apresentar as oportunidades que identificamos para o seu negócio.",
    email:
      "Olá {nome},\n\nConfirmando nossa reunião de diagnóstico agendada. Vou trazer uma análise personalizada com as principais oportunidades identificadas para a {empresa}.\n\nAté lá!",
  },
  "Diagnóstico Entregue": {
    whatsapp:
      "Oi {nome}, como ficou para você o diagnóstico que apresentei? Tenho algumas ideias complementares que gostaria de compartilhar.",
    email:
      "Olá {nome},\n\nQueria saber se o diagnóstico apresentado faz sentido para você e se ficou alguma dúvida.\n\nEstou disponível para uma conversa de alinhamento quando quiser.",
  },
  Proposta: {
    whatsapp:
      "Oi {nome}! Passando para verificar se você teve a oportunidade de analisar a proposta. Posso ajustar algum ponto ou esclarecer dúvidas?",
    email:
      "Olá {nome},\n\nEnvio esta mensagem para dar seguimento à proposta apresentada.\n\nCaso tenha dúvidas ou queira ajustar algum ponto, estou à disposição para conversarmos.\n\nAguardo seu retorno.",
  },
  Fechado: {
    whatsapp:
      "Oi {nome}, seja bem-vindo(a)! Estou muito feliz com a parceria. Vou enviar as informações para começarmos ainda hoje.",
    email:
      "Olá {nome},\n\nÉ com satisfação que confirmo o início da nossa parceria!\n\nEm breve você receberá todos os detalhes para darmos início ao trabalho.\n\nObrigado pela confiança.",
  },
  Perdido: {
    whatsapp:
      "Oi {nome}, tudo bem? Entendo que não deu certo desta vez. Se no futuro surgir uma necessidade, conte comigo. Sucesso!",
    email:
      "Olá {nome},\n\nAgradeço pelo tempo dedicado ao nosso processo. Mesmo que agora não seja o momento ideal, fica à vontade para retornar quando precisar.\n\nMuito sucesso!",
  },
};

// ─────────────────────────────────────────────────────────────
// KPI tile
// ─────────────────────────────────────────────────────────────

function KPITile({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: "good" | "info";
}) {
  const cls =
    accent === "good"
      ? "border-emerald-400/30 bg-emerald-400/[0.04]"
      : accent === "info"
        ? "border-brand-cyan/30 bg-brand-cyan/[0.04]"
        : "border-white/10 bg-zinc-900/40";
  return (
    <div className={`rounded-xl border ${cls} p-4`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
          {label}
        </span>
        <span className="grid h-7 w-7 place-items-center rounded-md border border-white/10 bg-white/[0.03] text-brand-cyan">
          {icon}
        </span>
      </div>
      <div className="mt-2 text-2xl font-black tabular-nums text-white">
        {value}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Lead card
// ─────────────────────────────────────────────────────────────

function LeadCard({
  lead,
  onOpen,
  onDragStart,
  onDragEnd,
  dragging,
}: {
  lead: Lead;
  onOpen: () => void;
  onDragStart: (e: React.DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
  dragging: boolean;
}) {
  const overdue = isOverdue(lead);
  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      className={[
        "cursor-grab rounded-lg border border-white/10 bg-zinc-900/70 p-3 transition active:cursor-grabbing",
        dragging ? "opacity-40" : "hover:border-brand-cyan/40 hover:bg-zinc-900",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex items-center gap-2">
          {overdue && (
            <span
              className="shrink-0 h-2 w-2 rounded-full bg-red-400 animate-pulse"
              title="Follow-up vencido"
            />
          )}
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-white">
              {lead.empresa || "Sem empresa"}
            </div>
            <div className="truncate text-xs text-zinc-400">
              {lead.nome || "—"}
            </div>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold tabular-nums ${scoreTone(lead.score)}`}
        >
          {lead.score}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-400">
        {lead.nicho ? <span>{lead.nicho}</span> : null}
        {lead.cidade ? <span>· {lead.cidade}</span> : null}
      </div>

      {lead.proximaAcao && (
        <div className={`mt-2 text-[10px] truncate ${overdue ? "text-red-300" : "text-zinc-500"}`}>
          {overdue ? "⚠ " : "→ "}{lead.proximaAcao}
          {lead.dataProximaAcao
            ? ` · ${formatDate(lead.dataProximaAcao)}`
            : ""}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500">
        <div className="flex items-center gap-2">
          {lead.whatsapp ? <span>{lead.whatsapp}</span> : null}
        </div>
        <span className="tabular-nums">{formatDate(lead.data)}</span>
      </div>

      {lead.valor > 0 ? (
        <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
          {BRL.format(lead.valor)}
        </div>
      ) : null}
    </article>
  );
}

// ─────────────────────────────────────────────────────────────
// Kanban column
// ─────────────────────────────────────────────────────────────

function KanbanColumn({
  stage,
  leads,
  onCreate,
  onOpen,
  onDragStart,
  onDragEnd,
  onDrop,
  draggingId,
  isDragOver,
  onDragOver,
  onDragLeave,
}: {
  stage: Stage;
  leads: Lead[];
  onCreate: (stage: Stage) => void;
  onOpen: (lead: Lead) => void;
  onDragStart: (lead: Lead, e: React.DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
  onDrop: (stage: Stage) => void;
  draggingId: string | null;
  isDragOver: boolean;
  onDragOver: (stage: Stage, e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
}) {
  const overdueCount = leads.filter(isOverdue).length;
  return (
    <section className="flex w-72 shrink-0 flex-col">
      <header className="mb-3 flex items-center justify-between rounded-t-lg border-b border-white/10 px-1 pb-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex h-5 items-center rounded-md border bg-white/[0.02] px-2 text-[10px] font-bold uppercase tracking-wider ${stageTone[stage]}`}
          >
            {stage}
          </span>
          <span className="text-[11px] font-semibold tabular-nums text-zinc-500">
            {leads.length}
          </span>
          {overdueCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500/20 px-1 text-[9px] font-bold text-red-300">
              {overdueCount}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onCreate(stage)}
          title="Novo lead nesta etapa"
          className="grid h-6 w-6 place-items-center rounded-md border border-white/10 text-zinc-400 transition hover:border-brand-cyan/40 hover:bg-brand-cyan/10 hover:text-brand-cyan"
        >
          <Plus className="h-3 w-3" />
        </button>
      </header>

      <div
        onDragOver={(e) => onDragOver(stage, e)}
        onDragLeave={onDragLeave}
        onDrop={() => onDrop(stage)}
        className={[
          "flex min-h-[200px] flex-1 flex-col gap-2 rounded-lg border p-2 transition",
          isDragOver
            ? "border-brand-cyan/50 bg-brand-cyan/[0.04]"
            : "border-dashed border-white/[0.08] bg-white/[0.01]",
        ].join(" ")}
      >
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onOpen={() => onOpen(lead)}
            onDragStart={(e) => onDragStart(lead, e)}
            onDragEnd={onDragEnd}
            dragging={draggingId === lead.id}
          />
        ))}

        {leads.length === 0 ? (
          <button
            type="button"
            onClick={() => onCreate(stage)}
            className="grid h-20 place-items-center rounded-md border border-dashed border-white/10 text-[11px] text-zinc-500 transition hover:border-brand-cyan/40 hover:text-brand-cyan"
          >
            + Novo lead
          </button>
        ) : null}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Commercial Dashboard
// ─────────────────────────────────────────────────────────────

function CommercialDashboard({
  leads,
  weeklyHistory,
  onOpenLead,
}: {
  leads: Lead[];
  weeklyHistory: StageHistoryEntry[];
  onOpenLead: (lead: Lead) => void;
}) {
  const byStage = useMemo(() => {
    const out: Record<Stage, Lead[]> = {} as Record<Stage, Lead[]>;
    STAGES.forEach((s) => (out[s] = []));
    leads.forEach((l) => out[l.stage]?.push(l));
    return out;
  }, [leads]);

  // ─── Weekly activity: stage transitions in the last 7 days ──────────
  const weeklyActivity = useMemo(() => {
    const contatadosThisWeek = weeklyHistory.filter(
      (h) => h.stageTo === "Contato Feito",
    ).length;
    const reunioesAgendadas = weeklyHistory.filter(
      (h) => h.stageTo === "Diagnóstico Agendado",
    ).length;
    const propostasEnviadas = weeklyHistory.filter(
      (h) => h.stageTo === "Proposta",
    ).length;
    const fechamentos = weeklyHistory.filter(
      (h) => h.stageTo === "Fechado",
    ).length;
    return {
      contatadosThisWeek,
      reunioesAgendadas,
      propostasEnviadas,
      fechamentos,
    };
  }, [weeklyHistory]);

  // ─── Overdue follow-ups list sorted by urgency (most overdue first) ──
  const overdueLeads = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return leads
      .filter(
        (l) =>
          l.dataProximaAcao &&
          new Date(l.dataProximaAcao) < today &&
          l.stage !== "Fechado" &&
          l.stage !== "Perdido",
      )
      .sort((a, b) => {
        const da = new Date(a.dataProximaAcao!).getTime();
        const db = new Date(b.dataProximaAcao!).getTime();
        return da - db; // older first = more urgent
      });
  }, [leads]);

  function daysOverdue(dateStr: string): number {
    const due = new Date(dateStr);
    due.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  }

  const conversions = useMemo(() => {
    return STAGES.slice(0, -1).map((stage, i) => {
      const current = byStage[stage].length;
      const next = byStage[STAGES[i + 1]].length;
      const rate = current > 0 ? Math.round((next / current) * 100) : 0;
      return { from: stage, to: STAGES[i + 1], rate, current, next };
    });
  }, [byStage]);

  const potencialPorStage = useMemo(() => {
    return STAGES.map((s) => {
      const ls = byStage[s];
      const total = ls.reduce((sum, l) => sum + l.valor, 0);
      return { stage: s, count: ls.length, total };
    });
  }, [byStage]);

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisWeek = leads.filter(
    (l) => l.createdAt && new Date(l.createdAt) >= weekAgo,
  );
  const overdueAll = leads.filter(isOverdue);
  const receita = byStage["Fechado"].reduce((s, l) => s + l.valor, 0);
  const pipeline = leads
    .filter((l) => l.stage !== "Perdido" && l.stage !== "Fechado")
    .reduce((s, l) => s + l.valor, 0);

  const maxCount = Math.max(1, ...STAGES.map((s) => byStage[s].length));

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/[0.04] p-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Receita Realizada
          </div>
          <div className="mt-1 text-2xl font-black text-white">
            {BRL.format(receita)}
          </div>
        </div>
        <div className="rounded-xl border border-brand-cyan/30 bg-brand-cyan/[0.04] p-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Pipeline Potencial
          </div>
          <div className="mt-1 text-2xl font-black text-white">
            {BRL.format(pipeline)}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-zinc-900/40 p-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Novos (7 dias)
          </div>
          <div className="mt-1 text-2xl font-black text-white">
            {thisWeek.length}
          </div>
        </div>
        <div className="rounded-xl border border-red-500/30 bg-red-500/[0.04] p-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Follow-ups Vencidos
          </div>
          <div className="mt-1 text-2xl font-black text-white">
            {overdueAll.length}
          </div>
        </div>
      </div>

      {/* Weekly activity summary — stage transitions in last 7 days */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6">
        <div className="mb-5 flex items-center gap-3">
          <Activity className="h-5 w-5 text-brand-cyan" />
          <h2 className="text-sm font-black uppercase tracking-[0.14em] text-white">
            Atividade da Semana
          </h2>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            últimos 7 dias
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Leads Contatados
            </div>
            <div className="mt-1 text-2xl font-black tabular-nums text-white">
              {weeklyActivity.contatadosThisWeek}
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Reuniões Agendadas
            </div>
            <div className="mt-1 text-2xl font-black tabular-nums text-white">
              {weeklyActivity.reunioesAgendadas}
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Propostas Enviadas
            </div>
            <div className="mt-1 text-2xl font-black tabular-nums text-white">
              {weeklyActivity.propostasEnviadas}
            </div>
          </div>
          <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/[0.04] p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Fechamentos
            </div>
            <div className="mt-1 text-2xl font-black tabular-nums text-white">
              {weeklyActivity.fechamentos}
            </div>
          </div>
        </div>
      </div>

      {/* Funnel visualization */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6">
        <div className="mb-5 flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-brand-cyan" />
          <h2 className="text-sm font-black uppercase tracking-[0.14em] text-white">
            Funil de Conversão
          </h2>
        </div>
        <div className="space-y-2">
          {STAGES.map((stage) => {
            const count = byStage[stage].length;
            const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
            return (
              <div key={stage} className="flex items-center gap-3">
                <div className="w-40 shrink-0 text-[11px] text-zinc-400 truncate">
                  {stage}
                </div>
                <div className="flex-1 rounded-full bg-white/[0.04] h-5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-cyan/60 to-brand-cyan/30 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="w-8 text-right text-[11px] font-bold text-white tabular-nums">
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conversion rates */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6">
        <div className="mb-5 flex items-center gap-3">
          <ClipboardList className="h-5 w-5 text-brand-cyan" />
          <h2 className="text-sm font-black uppercase tracking-[0.14em] text-white">
            Taxa de Conversão por Etapa
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {conversions.slice(0, 6).map((c) => {
            const tier =
              c.rate >= 50
                ? "text-emerald-300 bg-emerald-400/10 border-emerald-400/20"
                : c.rate >= 25
                  ? "text-amber-200 bg-amber-300/10 border-amber-300/20"
                  : "text-red-300 bg-red-500/10 border-red-500/20";
            return (
              <div
                key={`${c.from}-${c.to}`}
                className={`rounded-xl border p-3 ${tier}`}
              >
                <div className="text-[9px] font-semibold uppercase tracking-[0.12em] opacity-60">
                  {c.from} → {c.to}
                </div>
                <div className="mt-1 text-2xl font-black tabular-nums">
                  {c.rate}%
                </div>
                <div className="text-[10px] opacity-60">
                  {c.next}/{c.current} leads
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Revenue by stage */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6">
        <div className="mb-5 flex items-center gap-3">
          <DollarSign className="h-5 w-5 text-brand-cyan" />
          <h2 className="text-sm font-black uppercase tracking-[0.14em] text-white">
            Receita Potencial por Etapa
          </h2>
        </div>
        <div className="space-y-2">
          {potencialPorStage
            .filter((p) => p.count > 0)
            .map((p) => (
              <div
                key={p.stage}
                className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex h-5 items-center rounded-md border bg-white/[0.02] px-2 text-[10px] font-bold uppercase tracking-wider ${stageTone[p.stage as Stage]}`}
                  >
                    {p.stage}
                  </span>
                  <span className="text-xs text-zinc-500">{p.count} leads</span>
                </div>
                <span className="text-sm font-bold text-white">
                  {p.total > 0 ? BRL.format(p.total) : "—"}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Próximos Follow-ups Vencidos — sorted by urgency */}
      <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-6">
        <div className="mb-5 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <h2 className="text-sm font-black uppercase tracking-[0.14em] text-white">
            Próximos Follow-ups Vencidos
          </h2>
          <span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            {overdueLeads.length} pendentes
          </span>
        </div>
        {overdueLeads.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Nenhum follow-up vencido. Pipeline em dia.
          </p>
        ) : (
          <div className="space-y-2">
            {overdueLeads.slice(0, 10).map((lead) => {
              const dias = daysOverdue(lead.dataProximaAcao!);
              const urgencyTone =
                dias >= 7
                  ? "border-red-500/40 bg-red-500/[0.06]"
                  : dias >= 3
                    ? "border-amber-300/30 bg-amber-300/[0.04]"
                    : "border-white/10 bg-white/[0.02]";
              const badgeTone =
                dias >= 7
                  ? "bg-red-500/30 text-red-200"
                  : dias >= 3
                    ? "bg-amber-300/20 text-amber-200"
                    : "bg-white/[0.06] text-zinc-300";
              return (
                <button
                  key={lead.id}
                  type="button"
                  onClick={() => onOpenLead(lead)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition hover:bg-white/[0.05] ${urgencyTone}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-bold text-white">
                        {lead.empresa || lead.nome || "Sem nome"}
                      </span>
                      <span
                        className={`inline-flex h-5 items-center rounded-md border bg-white/[0.02] px-2 text-[9px] font-bold uppercase tracking-wider ${stageTone[lead.stage]}`}
                      >
                        {lead.stage}
                      </span>
                    </div>
                    {lead.proximaAcao ? (
                      <div className="mt-0.5 truncate text-xs text-zinc-400">
                        {lead.proximaAcao}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider tabular-nums ${badgeTone}`}
                    >
                      {dias === 0 ? "Hoje" : `${dias}d`}
                    </span>
                    <span className="text-[10px] text-zinc-500 tabular-nums">
                      {formatDate(lead.dataProximaAcao!)}
                    </span>
                  </div>
                </button>
              );
            })}
            {overdueLeads.length > 10 && (
              <p className="pt-1 text-center text-[11px] text-zinc-500">
                + {overdueLeads.length - 10} outros vencidos…
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Lead drawer
// ─────────────────────────────────────────────────────────────

type DrawerState =
  | { mode: "closed" }
  | { mode: "create"; input: LeadInput }
  | { mode: "edit"; input: LeadInput; id: string };

type DrawerTab = "dados" | "followup" | "templates" | "historico";

function DrawerField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20"
      />
    </label>
  );
}

function TemplateCard({
  template,
  lead,
  onSave,
}: {
  template: { tipo: "whatsapp" | "email"; conteudo: string };
  lead: LeadInput;
  onSave?: (updated: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(template.conteudo);
  const [copied, setCopied] = useState(false);

  const resolved = text
    .replace(/{nome}/g, lead.nome || "contato")
    .replace(/{empresa}/g, lead.empresa || "empresa");

  function handleCopy() {
    void navigator.clipboard.writeText(resolved);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {template.tipo === "whatsapp" ? (
            <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Mail className="h-3.5 w-3.5 text-brand-cyan" />
          )}
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
            {template.tipo === "whatsapp" ? "WhatsApp" : "E-mail"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setEditing(!editing)}
            className="rounded-md border border-white/10 px-2 py-1 text-[9px] font-bold uppercase text-zinc-400 hover:text-white"
          >
            {editing ? "Cancelar" : "Editar"}
          </button>
          {editing && onSave && (
            <button
              type="button"
              onClick={() => {
                onSave(text);
                setEditing(false);
              }}
              className="rounded-md border border-brand-cyan/30 bg-brand-cyan/10 px-2 py-1 text-[9px] font-bold uppercase text-brand-cyan hover:bg-brand-cyan/20"
            >
              Salvar
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2 text-xs text-white outline-none focus:border-brand-cyan/60"
        />
      ) : (
        <p className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-300">
          {resolved}
        </p>
      )}

      <button
        type="button"
        onClick={handleCopy}
        className="mt-3 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-300 transition hover:bg-white/[0.08]"
      >
        <Copy className="h-3 w-3" />
        {copied ? "Copiado!" : "Copiar"}
      </button>
    </div>
  );
}

function LeadDrawer({
  drawer,
  onClose,
  onSubmit,
  onDelete,
  clientes,
  onConverted,
}: {
  drawer: DrawerState;
  onClose: () => void;
  onSubmit: (input: LeadInput, id?: string, prevStage?: Stage) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  clientes: ClienteOption[];
  onConverted: () => void;
}) {
  const router = useRouter();
  const initial = drawer.mode === "closed" ? null : drawer.input;
  const [input, setInput] = useState<LeadInput | null>(initial);
  const [converting, setConverting] = useState(false);
  const [tab, setTab] = useState<DrawerTab>("dados");
  const [history, setHistory] = useState<StageHistoryEntry[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const drawerLeadId =
    drawer.mode === "edit" ? drawer.id : undefined;
  const drawerMode = drawer.mode;

  useEffect(() => {
    if (drawerMode === "closed") {
      setInput(null);
      setTab("dados");
    }
    // Non-closed: state is initialized via useState on mount (key={drawerKey} forces remount)
  }, [drawerMode]);

  useEffect(() => {
    if (tab === "historico" && drawerLeadId) {
      setLoadingHistory(true);
      listStageHistory(drawerLeadId).then((h) => {
        setHistory(h);
        setLoadingHistory(false);
      });
    }
    if (tab === "templates" && input?.stage) {
      listMessageTemplates(input.stage).then((ts) => setTemplates(ts));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, drawerLeadId]);

  if (drawer.mode === "closed" || !input) return null;
  const isEdit = drawer.mode === "edit";

  function patch(p: Partial<LeadInput>) {
    setInput((curr) => (curr ? { ...curr, ...p } : curr));
  }

  async function handleConvert() {
    if (drawer.mode !== "edit") return;
    setConverting(true);
    try {
      const lead = {
        id: drawer.id,
        clienteId: input!.clienteId,
        empresa: input!.empresa,
        nome: input!.nome,
        whatsapp: input!.whatsapp,
        email: input!.email,
        nicho: input!.nicho,
        cidade: input!.cidade,
        score: input!.score,
        stage: input!.stage,
        valor: input!.valor,
        sortOrder: 0,
        data: input!.data,
        responsavel: input!.responsavel,
        proximaAcao: input!.proximaAcao,
        dataProximaAcao: input!.dataProximaAcao,
        notas: input!.notas,
        statusPagamento: input!.statusPagamento,
        createdAt: "",
        updatedAt: "",
      };
      const clienteId = await convertToCliente(lead);
      onConverted();
      onClose();
      if (clienteId) {
        try {
          window.localStorage.setItem("o6.offer-book.current", clienteId);
        } catch {
          /* ignore */
        }
        router.push("/offer-book/clientes");
      }
    } finally {
      setConverting(false);
    }
  }

  const tabBtnCls = (t: DrawerTab) =>
    `px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition ${
      tab === t
        ? "bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30"
        : "text-zinc-400 hover:text-white"
    }`;

  const defaultTemplates = DEFAULT_TEMPLATES[input.stage] ?? {
    whatsapp: "",
    email: "",
  };

  const resolvedTemplates = {
    whatsapp:
      templates.find((t) => t.tipo === "whatsapp")?.conteudo ??
      defaultTemplates.whatsapp,
    email:
      templates.find((t) => t.tipo === "email")?.conteudo ??
      defaultTemplates.email,
  };

  async function handleSaveTemplate(tipo: "whatsapp" | "email", conteudo: string) {
    const existing = templates.find((t) => t.tipo === tipo);
    await upsertMessageTemplate({
      id: existing?.id,
      stage: input!.stage,
      tipo,
      titulo: tipo === "whatsapp" ? "WhatsApp" : "E-mail",
      conteudo,
      isDefault: false,
    });
    const updated = await listMessageTemplates(input!.stage);
    setTemplates(updated);
  }

  const prevStage =
    drawer.mode === "edit"
      ? (drawer.input.stage)
      : undefined;

  return (
    <div className="fixed inset-0 z-30 flex">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="flex-1 bg-black/60 backdrop-blur-sm"
      />
      <aside className="flex h-full w-full max-w-md flex-col border-l border-white/10 bg-zinc-950 shadow-2xl">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-cyan">
              {isEdit ? "Editar Lead" : "Novo Lead"}
            </div>
            <h2 className="mt-0.5 text-base font-black uppercase tracking-tight text-white">
              {input.empresa || "Sem nome"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md border border-white/10 text-zinc-400 transition hover:border-white/20 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Tabs — only in edit mode */}
        {isEdit && (
          <div className="flex gap-1 border-b border-white/10 px-5 py-2">
            <button type="button" className={tabBtnCls("dados")} onClick={() => setTab("dados")}>
              Dados
            </button>
            <button type="button" className={tabBtnCls("followup")} onClick={() => setTab("followup")}>
              Follow-up
            </button>
            <button type="button" className={tabBtnCls("templates")} onClick={() => setTab("templates")}>
              Templates
            </button>
            <button type="button" className={tabBtnCls("historico")} onClick={() => setTab("historico")}>
              Histórico
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {/* ─ Tab: Dados ─ */}
          {(tab === "dados" || !isEdit) && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit(input, isEdit ? drawer.id : undefined, prevStage);
              }}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DrawerField
                  label="Empresa"
                  value={input.empresa}
                  onChange={(v) => patch({ empresa: v })}
                  placeholder="Razão social ou marca"
                />
                <DrawerField
                  label="Nome"
                  value={input.nome}
                  onChange={(v) => patch({ nome: v })}
                  placeholder="Contato"
                />
                <DrawerField
                  label="WhatsApp"
                  value={input.whatsapp}
                  onChange={(v) => patch({ whatsapp: v })}
                  placeholder="(11) 99999-0000"
                />
                <DrawerField
                  label="E-mail"
                  value={input.email}
                  onChange={(v) => patch({ email: v })}
                  placeholder="contato@empresa.com"
                  type="email"
                />
                <DrawerField
                  label="Nicho"
                  value={input.nicho}
                  onChange={(v) => patch({ nicho: v })}
                />
                <DrawerField
                  label="Cidade"
                  value={input.cidade}
                  onChange={(v) => patch({ cidade: v })}
                />
                <label className="flex flex-col gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                    Score (0-100)
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={input.score}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      const n = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                      patch({ score: n });
                    }}
                    className="rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                    Valor da proposta (R$)
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={input.valor}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      patch({ valor: Number(e.target.value) || 0 })
                    }
                    className="rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20"
                  />
                </label>
                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                    Etapa
                  </span>
                  <select
                    value={input.stage}
                    onChange={(e) => patch({ stage: e.target.value as Stage })}
                    className="rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                    Cliente vinculado (opcional)
                  </span>
                  <select
                    value={input.clienteId ?? ""}
                    onChange={(e) => patch({ clienteId: e.target.value || null })}
                    className="rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20"
                  >
                    <option value="">— Nenhum —</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>{c.empresa}</option>
                    ))}
                  </select>
                </label>
              </div>

              {isEdit && input.stage === "Fechado" && !input.clienteId && (
                <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/[0.05] p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    <div className="flex-1">
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">
                        Lead Fechado — Próxima etapa
                      </div>
                      <p className="mt-1 text-xs text-zinc-400">
                        Crie o cliente, vincule este lead e abra o Offer Book para onboarding.
                      </p>
                      <button
                        type="button"
                        onClick={handleConvert}
                        disabled={converting}
                        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-400/15 px-3 py-2 text-xs font-bold uppercase tracking-wider text-emerald-200 transition hover:bg-emerald-400/25 disabled:opacity-40"
                      >
                        {converting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Users className="h-3.5 w-3.5" />
                        )}
                        Converter para Cliente
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isEdit && input.clienteId && (
                <div className="rounded-xl border border-brand-cyan/30 bg-brand-cyan/[0.04] p-3 text-xs text-zinc-300">
                  ✓ Cliente vinculado.{" "}
                  <a
                    href="/clientes-dashboard"
                    className="font-bold text-brand-cyan hover:underline"
                  >
                    Ver no Dashboard
                  </a>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                {isEdit ? (
                  <button
                    type="button"
                    onClick={() => onDelete(drawer.id)}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold uppercase tracking-wider text-red-300 transition hover:bg-red-500/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Excluir
                  </button>
                ) : (
                  <span />
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-300 transition hover:bg-white/[0.04]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg border border-brand-cyan/40 bg-brand-cyan/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-cyan transition hover:bg-brand-cyan/25"
                  >
                    {isEdit ? "Salvar" : "Criar lead"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ─ Tab: Follow-up ─ */}
          {tab === "followup" && isEdit && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit(input, drawer.id, prevStage);
              }}
            >
              <DrawerField
                label="Responsável"
                value={input.responsavel}
                onChange={(v) => patch({ responsavel: v })}
                placeholder="Nome do responsável"
              />
              <label className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                  Próxima Ação
                </span>
                <textarea
                  value={input.proximaAcao}
                  onChange={(e) => patch({ proximaAcao: e.target.value })}
                  placeholder="O que precisa acontecer antes do próximo estágio?"
                  rows={3}
                  className="rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20 resize-none"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                  Data da Próxima Ação
                </span>
                <input
                  type="datetime-local"
                  value={
                    input.dataProximaAcao
                      ? input.dataProximaAcao.slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    patch({
                      dataProximaAcao: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : null,
                    })
                  }
                  className="rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                  Notas
                </span>
                <textarea
                  value={input.notas}
                  onChange={(e) => patch({ notas: e.target.value })}
                  placeholder="Observações, contexto, objeções..."
                  rows={4}
                  className="rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20 resize-none"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                  Status Pagamento
                </span>
                <select
                  value={input.statusPagamento}
                  onChange={(e) =>
                    patch({ statusPagamento: e.target.value as StatusPagamento })
                  }
                  className="rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20"
                >
                  <option value="pendente">Pendente</option>
                  <option value="cobrado">Cobrado</option>
                  <option value="pago">Pago</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </label>

              {isOverdue({ ...input, id: "", createdAt: "", updatedAt: "", sortOrder: 0 }) && (
                <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/[0.06] p-3">
                  <Bell className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-300" />
                  <p className="text-xs text-red-300">
                    Follow-up vencido desde{" "}
                    {formatDateFull(input.dataProximaAcao ?? "")}
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="rounded-lg border border-brand-cyan/40 bg-brand-cyan/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-cyan transition hover:bg-brand-cyan/25"
                >
                  Salvar Follow-up
                </button>
              </div>
            </form>
          )}

          {/* ─ Tab: Templates ─ */}
          {tab === "templates" && isEdit && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-500">
                Templates para a etapa{" "}
                <strong className="text-zinc-300">{input.stage}</strong>.
                Edite e salve para personalizar. Clique em Copiar para usar.
              </p>
              <TemplateCard
                template={{ tipo: "whatsapp", conteudo: resolvedTemplates.whatsapp }}
                lead={input}
                onSave={(t) => handleSaveTemplate("whatsapp", t)}
              />
              <TemplateCard
                template={{ tipo: "email", conteudo: resolvedTemplates.email }}
                lead={input}
                onSave={(t) => handleSaveTemplate("email", t)}
              />
            </div>
          )}

          {/* ─ Tab: Histórico ─ */}
          {tab === "historico" && isEdit && (
            <div>
              {loadingHistory ? (
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando histórico…
                </div>
              ) : history.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  Nenhuma mudança de etapa registrada ainda.
                </p>
              ) : (
                <ol className="space-y-3">
                  {history.map((h) => (
                    <li
                      key={h.id}
                      className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3"
                    >
                      <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-cyan" />
                      <div>
                        <div className="text-xs text-zinc-300">
                          {h.stageFrom
                            ? `${h.stageFrom} → ${h.stageTo}`
                            : `Criado em ${h.stageTo}`}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {formatDateFull(h.changedAt)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

type ViewMode = "kanban" | "dashboard";

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [drawer, setDrawer] = useState<DrawerState>({ mode: "closed" });
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<Stage | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [weeklyHistory, setWeeklyHistory] = useState<StageHistoryEntry[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [ls, cs, wh] = await Promise.all([
        listLeads(),
        listClienteOptions(),
        listStageHistorySince(7),
      ]);
      setLeads(ls);
      setClientes(cs);
      setWeeklyHistory(wh);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const [drawerKey, setDrawerKey] = useState(0);

  const openCreate = useCallback((stage: Stage) => {
    setDrawer({ mode: "create", input: emptyLeadInput(stage) });
    setDrawerKey((k) => k + 1);
  }, []);

  const openEdit = useCallback((lead: Lead) => {
    setDrawer({
      mode: "edit",
      id: lead.id,
      input: {
        clienteId: lead.clienteId,
        empresa: lead.empresa,
        nome: lead.nome,
        whatsapp: lead.whatsapp,
        email: lead.email,
        nicho: lead.nicho,
        cidade: lead.cidade,
        score: lead.score,
        stage: lead.stage,
        valor: lead.valor,
        data: lead.data,
        responsavel: lead.responsavel,
        proximaAcao: lead.proximaAcao,
        dataProximaAcao: lead.dataProximaAcao,
        notas: lead.notas,
        statusPagamento: lead.statusPagamento,
      },
    });
    setDrawerKey((k) => k + 1);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawer({ mode: "closed" });
  }, []);

  const handleSubmit = useCallback(
    async (input: LeadInput, id?: string, prevStage?: Stage) => {
      if (id) {
        await updateLead(id, input, prevStage);
      } else {
        await createLead(input);
      }
      closeDrawer();
      await refresh();
    },
    [closeDrawer, refresh],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm("Excluir este lead? A ação não pode ser desfeita.")) {
        return;
      }
      await deleteLead(id);
      closeDrawer();
      await refresh();
    },
    [closeDrawer, refresh],
  );

  const handleDragStart = useCallback(
    (lead: Lead, e: React.DragEvent<HTMLElement>) => {
      setDraggingId(lead.id);
      e.dataTransfer.effectAllowed = "move";
      try {
        e.dataTransfer.setData("text/plain", lead.id);
      } catch {
        /* ignore */
      }
    },
    [],
  );

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setOverStage(null);
  }, []);

  const handleDragOver = useCallback(
    (stage: Stage, e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setOverStage(stage);
    },
    [],
  );

  const handleDragLeave = useCallback(() => {
    setOverStage(null);
  }, []);

  const handleDrop = useCallback(
    async (stage: Stage) => {
      const id = draggingId;
      setDraggingId(null);
      setOverStage(null);
      if (!id) return;
      const lead = leads.find((l) => l.id === id);
      if (!lead) return;

      const others = leads.filter((l) => l.id !== id);
      const inCol = others
        .filter((l) => l.stage === stage)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      const moved: Lead = { ...lead, stage, sortOrder: inCol.length };
      setLeads([...others, moved]);

      await moveLead(id, stage, inCol.length, [...others, moved], lead.stage);
      await refresh();
    },
    [draggingId, leads, refresh],
  );

  const kpis = useMemo(() => {
    const count = (predicate: (l: Lead) => boolean) =>
      leads.filter(predicate).length;
    return {
      leads: leads.length,
      diagnosticos: count(
        (l) =>
          l.stage === "Diagnóstico Agendado" ||
          l.stage === "Diagnóstico Entregue",
      ),
      propostas: count((l) => l.stage === "Proposta"),
      fechamentos: count((l) => l.stage === "Fechado"),
      receita: leads
        .filter((l) => l.stage === "Fechado")
        .reduce((sum, l) => sum + l.valor, 0),
    };
  }, [leads]);

  const grouped: Record<Stage, Lead[]> = useMemo(() => {
    const out = {} as Record<Stage, Lead[]>;
    STAGES.forEach((s) => (out[s] = []));
    leads.forEach((l) => {
      if (out[l.stage]) out[l.stage].push(l);
    });
    STAGES.forEach((s) => out[s].sort((a, b) => a.sortOrder - b.sortOrder));
    return out;
  }, [leads]);

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-cyan">
            O6 / CRM
          </div>
          <h1 className="mt-1 text-3xl font-black uppercase tracking-tight text-white">
            Pipeline Comercial
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-400">
            {viewMode === "kanban"
              ? "Kanban com 7 etapas. Arraste cards entre colunas — dados persistem no Supabase."
              : "Dashboard comercial — conversão por etapa, receita e follow-ups."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-white/10 overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider transition ${
                viewMode === "kanban"
                  ? "bg-white/[0.08] text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <ClipboardList className="h-3.5 w-3.5" />
              Kanban
            </button>
            <button
              type="button"
              onClick={() => setViewMode("dashboard")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider transition ${
                viewMode === "dashboard"
                  ? "bg-white/[0.08] text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </button>
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-200 transition hover:bg-white/[0.08] disabled:opacity-40"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>

          {viewMode === "kanban" && (
            <button
              type="button"
              onClick={() => openCreate("Novo Lead")}
              className="inline-flex items-center gap-2 rounded-lg border border-brand-cyan/40 bg-brand-cyan/15 px-3 py-2 text-xs font-bold uppercase tracking-wider text-brand-cyan transition hover:bg-brand-cyan/25"
            >
              <Plus className="h-4 w-4" />
              Novo Lead
            </button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <KPITile
          label="Leads"
          value={String(kpis.leads)}
          icon={<Users className="h-4 w-4" />}
        />
        <KPITile
          label="Diagnósticos"
          value={String(kpis.diagnosticos)}
          icon={<ClipboardCheck className="h-4 w-4" />}
          accent="info"
        />
        <KPITile
          label="Propostas"
          value={String(kpis.propostas)}
          icon={<Handshake className="h-4 w-4" />}
          accent="info"
        />
        <KPITile
          label="Fechamentos"
          value={String(kpis.fechamentos)}
          icon={<CheckCircle2 className="h-4 w-4" />}
          accent="good"
        />
        <KPITile
          label="Receita"
          value={BRL.format(kpis.receita)}
          icon={<DollarSign className="h-4 w-4" />}
          accent="good"
        />
      </div>

      {/* Main content */}
      {viewMode === "kanban" ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4">
            {STAGES.map((stage) => (
              <KanbanColumn
                key={stage}
                stage={stage}
                leads={grouped[stage]}
                onCreate={openCreate}
                onOpen={openEdit}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
                draggingId={draggingId}
                isDragOver={overStage === stage}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              />
            ))}
          </div>
        </div>
      ) : (
        <CommercialDashboard
          leads={leads}
          weeklyHistory={weeklyHistory}
          onOpenLead={openEdit}
        />
      )}

      <LeadDrawer
        key={drawerKey}
        drawer={drawer}
        onClose={closeDrawer}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        clientes={clientes}
        onConverted={refresh}
      />
    </div>
  );
}
