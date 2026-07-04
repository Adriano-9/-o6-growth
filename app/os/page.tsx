"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, FolderKanban, Bot, Activity } from "lucide-react";
import { Card, Counter, Reveal, SectionLabel, HealthBadge, StatusDot } from "./_lib/ui";

type SummaryData = {
  mrr: number;
  clientesAtivos: number;
  projetosAtivos: number;
  agentesAtivos: number;
  health: "ok" | "degraded" | "down";
  fonte: "supabase" | "fallback";
};

const FALLBACK: SummaryData = {
  mrr: 0,
  clientesAtivos: 0,
  projetosAtivos: 0,
  agentesAtivos: 0,
  health: "down",
  fonte: "fallback",
};

export default function OsDashboard() {
  const [data, setData] = useState<SummaryData>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/os/summary")
      .then((r) => r.json())
      .then((d: SummaryData) => setData(d))
      .catch(() => setData(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "MRR", value: data.mrr, prefix: "R$ ", icon: TrendingUp },
    { label: "Clientes ativos", value: data.clientesAtivos, icon: Users },
    { label: "Projetos ativos", value: data.projetosAtivos, icon: FolderKanban },
    { label: "Agentes ativos", value: data.agentesAtivos, suffix: "/4", icon: Bot },
  ];

  return (
    <main className="px-6 py-10 md:px-10 md:py-14">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#222222] pb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Mission Control
              </h1>
              <p className="mt-1 text-sm text-[#888888]">
                Painel operacional do O6 Growth OS
              </p>
            </div>
            <div className="flex items-center gap-3">
              {loading ? (
                <span className="text-xs text-[#888888]">Carregando…</span>
              ) : (
                <span className="flex items-center gap-2 text-xs text-[#888888]">
                  <StatusDot active={data.fonte === "supabase"} />
                  {data.fonte === "supabase" ? "Conectado ao Supabase" : "Dados offline / fallback"}
                </span>
              )}
            </div>
          </div>
        </Reveal>

        {/* Status cards */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, i) => (
            <Reveal key={card.label} delay={i * 0.08}>
              <Card>
                <div className="flex items-start justify-between">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#888888]">
                    {card.label}
                  </div>
                  <card.icon className="h-4 w-4 text-[#FF5722]" strokeWidth={1.75} />
                </div>
                <div className="mt-4 text-3xl font-bold tabular-nums md:text-4xl">
                  <Counter value={card.value} prefix={card.prefix} suffix={card.suffix} />
                </div>
              </Card>
            </Reveal>
          ))}
        </div>

        {/* Health do sistema */}
        <div className="mt-12">
          <SectionLabel>Health do sistema</SectionLabel>
          <Reveal>
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-[#FF5722]" strokeWidth={1.75} />
                  <div>
                    <div className="text-sm font-semibold">Status geral do sistema</div>
                    <div className="text-xs text-[#888888]">
                      Supabase, Vercel e agentes de linha de frente
                    </div>
                  </div>
                </div>
                <HealthBadge level={data.health} />
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 border-t border-[#222222] pt-6 sm:grid-cols-3">
                {[
                  { label: "Supabase", ok: data.fonte === "supabase" },
                  { label: "Vercel (deploy)", ok: true },
                  { label: "Hermes (VPS)", ok: false },
                ].map((svc) => (
                  <div
                    key={svc.label}
                    className="flex items-center justify-between rounded-lg border border-[#222222] bg-white/[0.02] px-4 py-3 text-sm"
                  >
                    <span className="text-[#EDEDED]">{svc.label}</span>
                    <StatusDot active={svc.ok} />
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>
        </div>

        {/* Quick nav hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-12 border-t border-[#222222] pt-6 text-center text-xs uppercase tracking-[0.2em] text-[#555555]"
        >
          O6 Growth OS · Manual Operacional v1 · Fase 1
        </motion.div>
      </div>
    </main>
  );
}
