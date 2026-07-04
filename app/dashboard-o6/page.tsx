"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";

// ─────────────────────────────────────────────────────────────
// Shared bits
// ─────────────────────────────────────────────────────────────

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Counter({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: 1.2, bounce: 0 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) motionVal.set(value);
  }, [inView, value, motionVal]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplay(Math.round(v)));
    return () => unsub();
  }, [spring]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
}

function SectionLabel({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#888888]">
        {children}
      </div>
      {right}
    </div>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-[#222222] bg-[#111111] p-6 ${className}`}
    >
      {children}
    </div>
  );
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      {active && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      )}
      <span
        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
          active ? "bg-emerald-400" : "bg-[#444444]"
        }`}
      />
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Data types
// ─────────────────────────────────────────────────────────────

type DashboardData = {
  pipeline: {
    prospects: number;
    comDemo: number;
    diagnosticos: number;
    fechados: number;
  };
  clientesAtivos: number;
  intelligence: {
    ultimoBrief: string | null;
    scoreMedio: number | null;
    topOportunidades: { titulo: string; score: number }[];
  };
  fonte: "supabase" | "fallback";
};

// ─────────────────────────────────────────────────────────────
// Hardcoded data (no source yet)
// ─────────────────────────────────────────────────────────────

const META_MRR = 15000;
const META_CLIENTES = 10;

const financeiroMeses = [
  { mes: "Jan", receita: 0, custo: 180 },
  { mes: "Fev", receita: 800, custo: 220 },
  { mes: "Mar", receita: 800, custo: 240 },
  { mes: "Abr", receita: 2300, custo: 310 },
  { mes: "Mai", receita: 2300, custo: 340 },
  { mes: "Jun", receita: 4800, custo: 410 },
];

const roadmap = [
  {
    fase: "Fase 1",
    meses: "meses 1-3",
    clientes: "2 clientes",
    mrr: "R$3k MRR",
    status: "Validação",
    ativo: true,
  },
  {
    fase: "Fase 2",
    meses: "meses 4-6",
    clientes: "5 clientes",
    mrr: "R$7.5k MRR",
    status: "Tração",
    ativo: false,
  },
  {
    fase: "Fase 3",
    meses: "meses 7-12",
    clientes: "10 clientes",
    mrr: "R$15k MRR",
    status: "Escala",
    ativo: false,
  },
];

const cronJobs = [
  { nome: "Intelligence Brief diário", horario: "06:00", ativo: false },
  { nome: "Re-audit mensal de prospects", horario: "—", ativo: false },
  { nome: "Backup Supabase semanal", horario: "—", ativo: false },
];

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default function DashboardO6() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard-o6")
      .then((r) => r.json())
      .then((d: DashboardData) => setData(d))
      .catch(() =>
        setData({
          pipeline: { prospects: 0, comDemo: 0, diagnosticos: 0, fechados: 0 },
          clientesAtivos: 0,
          intelligence: { ultimoBrief: null, scoreMedio: null, topOportunidades: [] },
          fonte: "fallback",
        }),
      )
      .finally(() => setLoading(false));
  }, []);

  const mrrAtual = 0; // sem faturamento real ainda — hardcoded intencional
  const pctMeta = Math.min(100, Math.round((mrrAtual / META_MRR) * 100));
  const clientesAtivos = data?.clientesAtivos ?? 0;
  const pipeline = data?.pipeline ?? {
    prospects: 0,
    comDemo: 0,
    diagnosticos: 0,
    fechados: 0,
  };
  const intelligence = data?.intelligence;
  const maxFinanceiro = Math.max(...financeiroMeses.map((m) => m.receita), 1);

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white">
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-20">
        {/* Header */}
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#222222] pb-8">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Dashboard O6
              </h1>
              <span className="rounded-full border border-[#222222] bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#FF5722]">
                Interno · Executivo
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#888888]">
              {loading ? (
                "Carregando dados..."
              ) : (
                <>
                  <StatusDot active={data?.fonte === "supabase"} />
                  {data?.fonte === "supabase" ? "Conectado ao Supabase" : "Dados offline / fallback"}
                </>
              )}
            </div>
          </div>
        </Reveal>

        {/* ── 1. EXECUTIVO ── */}
        <div className="mt-16">
          <SectionLabel>Executivo</SectionLabel>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Reveal className="md:col-span-2">
              <Card>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#888888]">
                      MRR atual
                    </div>
                    <div className="mt-2 text-5xl font-bold tabular-nums text-[#FF5722] md:text-6xl">
                      <Counter value={mrrAtual} prefix="R$ " />
                    </div>
                  </div>
                  <div className="text-right text-sm text-[#888888]">
                    Meta: <span className="font-semibold text-white">R$ {META_MRR.toLocaleString("pt-BR")}</span>
                  </div>
                </div>
                <div className="mt-8">
                  <div className="mb-2 flex justify-between text-xs text-[#888888]">
                    <span>Progresso da meta</span>
                    <span className="font-semibold text-white">{pctMeta}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#1A1A1A]">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pctMeta}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full bg-[#FF5722]"
                    />
                  </div>
                </div>
              </Card>
            </Reveal>
            <Reveal delay={0.1}>
              <Card className="flex h-full flex-col justify-between">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#888888]">
                  Clientes ativos
                </div>
                <div className="mt-2 text-5xl font-bold tabular-nums md:text-6xl">
                  <Counter value={clientesAtivos} />
                  <span className="text-2xl text-[#888888]">/{META_CLIENTES}</span>
                </div>
                <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-[#1A1A1A]">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(clientesAtivos / META_CLIENTES) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-white"
                  />
                </div>
              </Card>
            </Reveal>
          </div>
        </div>

        {/* ── 2. PIPELINE ── */}
        <div className="mt-16">
          <SectionLabel>Pipeline</SectionLabel>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Prospects", value: pipeline.prospects },
              { label: "Com demo", value: pipeline.comDemo },
              { label: "Diagnósticos", value: pipeline.diagnosticos },
              { label: "Fechados", value: pipeline.fechados },
            ].map((item, i) => (
              <Reveal key={item.label} delay={i * 0.08}>
                <Card>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#888888]">
                    {item.label}
                  </div>
                  <div className="mt-3 text-3xl font-bold tabular-nums">
                    <Counter value={item.value} />
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>

          {/* Funil visual (triângulo invertido) */}
          <Reveal delay={0.2} className="mt-6">
            <Card>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#888888]">
                Funil de conversão
              </div>
              <div className="mx-auto flex max-w-2xl flex-col items-center gap-1.5 py-6">
                {[
                  { label: "Prospects", value: pipeline.prospects, width: 100 },
                  { label: "Com demo", value: pipeline.comDemo, width: 75 },
                  { label: "Diagnósticos", value: pipeline.diagnosticos, width: 50 },
                  { label: "Fechados", value: pipeline.fechados, width: 25 },
                ].map((stage, i) => (
                  <motion.div
                    key={stage.label}
                    initial={{ opacity: 0, scaleX: 0 }}
                    whileInView={{ opacity: 1, scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                    style={{ width: `${stage.width}%`, transformOrigin: "top" }}
                    className="flex items-center justify-between rounded-md bg-[#FF5722]/[0.08] px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-[#EDEDED]">{stage.label}</span>
                    <span className="font-bold tabular-nums text-[#FF5722]">{stage.value}</span>
                  </motion.div>
                ))}
              </div>
            </Card>
          </Reveal>
        </div>

        {/* ── 3. FINANCEIRO ── */}
        <div className="mt-16">
          <SectionLabel right={<span className="text-xs text-[#888888]">últimos 6 meses · hardcoded</span>}>
            Financeiro
          </SectionLabel>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {(() => {
              const receitaMes = financeiroMeses[financeiroMeses.length - 1].receita;
              const custoMes = financeiroMeses[financeiroMeses.length - 1].custo;
              const lucro = receitaMes - custoMes;
              return [
                { label: "Receita do mês", value: receitaMes },
                { label: "Custos de API", value: custoMes },
                { label: "Lucro líquido", value: lucro },
              ].map((item, i) => (
                <Reveal key={item.label} delay={i * 0.08}>
                  <Card>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#888888]">
                      {item.label}
                    </div>
                    <div className="mt-3 text-3xl font-bold tabular-nums">
                      <Counter value={item.value} prefix="R$ " />
                    </div>
                  </Card>
                </Reveal>
              ));
            })()}
          </div>

          <Reveal delay={0.25} className="mt-4">
            <Card>
              <div className="mb-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#888888]">
                Receita vs. custo · 6 meses
              </div>
              <div className="flex h-48 items-end justify-between gap-3">
                {financeiroMeses.map((m, i) => (
                  <div key={m.mes} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-40 w-full items-end justify-center gap-1">
                      <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: `${(m.receita / maxFinanceiro) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                        className="w-1/2 rounded-t bg-[#FF5722]"
                      />
                      <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: `${(m.custo / maxFinanceiro) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: i * 0.08 + 0.05, ease: [0.22, 1, 0.36, 1] }}
                        className="w-1/2 rounded-t bg-[#444444]"
                      />
                    </div>
                    <span className="text-[11px] text-[#888888]">{m.mes}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-6 text-xs text-[#888888]">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FF5722]" /> Receita
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#444444]" /> Custos API
                </span>
              </div>
            </Card>
          </Reveal>
        </div>

        {/* ── 4. INTELIGÊNCIA ── */}
        <div className="mt-16">
          <SectionLabel>Inteligência</SectionLabel>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Reveal>
              <Card className="h-full">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#888888]">
                  Último brief
                </div>
                <div className="mt-3 text-2xl font-bold">
                  {intelligence?.ultimoBrief
                    ? new Date(intelligence.ultimoBrief).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "Nenhum brief ainda"}
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-[#888888]">
                  Score médio das oportunidades:{" "}
                  <span className="font-bold text-white">
                    {intelligence?.scoreMedio != null ? `${intelligence.scoreMedio}/100` : "—"}
                  </span>
                </div>
                <div className="mt-6 flex items-center gap-2 border-t border-[#222222] pt-4 text-xs text-[#888888]">
                  <StatusDot active={false} />
                  Intelligence Engine (VPS) · inativo — aguardando SSH
                </div>
              </Card>
            </Reveal>
            <Reveal delay={0.1}>
              <Card className="h-full">
                <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#888888]">
                  Top 3 oportunidades da semana
                </div>
                {intelligence?.topOportunidades && intelligence.topOportunidades.length > 0 ? (
                  <ul className="space-y-3">
                    {intelligence.topOportunidades.map((op) => (
                      <li key={op.titulo} className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate text-[#EDEDED]">{op.titulo}</span>
                        <span className="shrink-0 font-bold tabular-nums text-[#FF5722]">
                          {op.score}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#888888]">
                    Nenhuma oportunidade registrada ainda — o Intelligence Engine ainda não rodou.
                  </p>
                )}
              </Card>
            </Reveal>
          </div>
        </div>

        {/* ── 5. OPERAÇÃO ── */}
        <div className="mt-16">
          <SectionLabel>Operação</SectionLabel>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Reveal>
              <Card className="h-full">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#888888]">
                    Hermes
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#888888]">
                    <StatusDot active={false} />
                    Inativo
                  </div>
                </div>
                <p className="mt-4 text-sm text-[#888888]">
                  Orquestrador ainda não implantado no VPS — scripts prontos, aguardando acesso SSH (ver skills/agents.md).
                </p>
              </Card>
            </Reveal>
            <Reveal delay={0.1}>
              <Card className="h-full">
                <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#888888]">
                  Cron jobs
                </div>
                <ul className="space-y-3">
                  {cronJobs.map((job) => (
                    <li key={job.nome} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2 text-[#EDEDED]">
                        <StatusDot active={job.ativo} />
                        {job.nome}
                      </span>
                      <span className="text-xs text-[#888888]">{job.horario}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 border-t border-[#222222] pt-4 text-xs text-[#888888]">
                  Últimos erros: nenhum registrado (sem execução ainda)
                </div>
              </Card>
            </Reveal>
          </div>
        </div>

        {/* ── 6. METAS (roadmap) ── */}
        <div className="mt-16">
          <SectionLabel>Metas</SectionLabel>
          <div className="relative">
            <div className="absolute left-0 right-0 top-[22px] hidden h-px bg-[#222222] md:block" />
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "left" }}
              className="absolute left-0 top-[22px] hidden h-px w-[16.66%] bg-[#FF5722] md:block"
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
              {roadmap.map((phase, i) => (
                <Reveal key={phase.fase} delay={i * 0.12}>
                  <div className="relative pt-0 md:pt-12">
                    <div
                      className={`absolute left-0 top-3 hidden h-3 w-3 -translate-x-1/2 rounded-full md:block ${
                        phase.ativo ? "bg-[#FF5722]" : "border border-[#888888] bg-[#0D0D0D]"
                      }`}
                    />
                    <Card>
                      <div className="text-sm font-bold uppercase tracking-[0.15em]">
                        {phase.fase}
                      </div>
                      <div className="mt-1 text-xs text-[#888888]">{phase.meses}</div>
                      <div className="mt-4 text-2xl font-bold">{phase.clientes}</div>
                      <div className="mt-1 text-sm text-[#888888]">{phase.mrr}</div>
                      <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest">
                        <span className={phase.ativo ? "text-[#FF5722]" : "text-[#888888]"}>
                          {phase.ativo ? "●" : "○"}
                        </span>
                        {phase.status}
                      </div>
                    </Card>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-[#222222] pt-8 text-center text-xs uppercase tracking-[0.2em] text-[#888888]">
          O6 Growth · Dashboard Executivo · Documento interno
        </div>
      </div>
    </main>
  );
}
