"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, Reveal, SectionLabel, StatusDot } from "../_lib/ui";

type StageCount = { estagio: string; total: number; real: boolean };
type PipelineData = { stages: StageCount[]; fonte: "supabase" | "fallback" };

const FALLBACK: PipelineData = {
  stages: [
    { estagio: "Lead", total: 0, real: true },
    { estagio: "Diagnóstico", total: 0, real: true },
    { estagio: "Proposta", total: 0, real: true },
    { estagio: "Fechamento", total: 0, real: true },
    { estagio: "Onboarding", total: 0, real: false },
    { estagio: "Retainer", total: 0, real: false },
    { estagio: "Expansão", total: 0, real: false },
  ],
  fonte: "fallback",
};

export default function OsPipeline() {
  const [data, setData] = useState<PipelineData>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/os/pipeline")
      .then((r) => r.json())
      .then((d: PipelineData) => setData(d))
      .catch(() => setData(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const maxTotal = Math.max(...data.stages.map((s) => s.total), 1);

  return (
    <main className="px-6 py-10 md:px-10 md:py-14">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#222222] pb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Pipeline Comercial
              </h1>
              <p className="mt-1 text-sm text-[#888888]">
                Lead → Diagnóstico → Proposta → Fechamento → Onboarding → Retainer → Expansão
              </p>
            </div>
            <span className="flex items-center gap-2 text-xs text-[#888888]">
              {loading ? (
                "Carregando…"
              ) : (
                <>
                  <StatusDot active={data.fonte === "supabase"} />
                  {data.fonte === "supabase" ? "Conectado ao Supabase" : "Dados offline / fallback"}
                </>
              )}
            </span>
          </div>
        </Reveal>

        {/* Stage cards row */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {data.stages.map((stage, i) => (
            <Reveal key={stage.estagio} delay={i * 0.05}>
              <Card className="text-center">
                <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#888888]">
                  {stage.estagio}
                </div>
                <div className="mt-3 text-2xl font-bold tabular-nums">
                  {stage.total}
                </div>
                {!stage.real && (
                  <div className="mt-1 text-[9px] uppercase tracking-widest text-[#555555]">
                    sem dado
                  </div>
                )}
              </Card>
            </Reveal>
          ))}
        </div>

        {/* Horizontal funnel bars */}
        <div className="mt-12">
          <SectionLabel>Volume por estágio</SectionLabel>
          <Reveal>
            <Card>
              <div className="space-y-4">
                {data.stages.map((stage, i) => (
                  <div key={stage.estagio} className="flex items-center gap-4">
                    <div className="w-28 shrink-0 text-xs font-medium text-[#888888] sm:w-36">
                      {stage.estagio}
                    </div>
                    <div className="h-8 flex-1 overflow-hidden rounded-md bg-[#1A1A1A]">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(stage.total / maxTotal) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                        className={`h-full rounded-md ${
                          stage.real ? "bg-[#FF5722]" : "bg-[#333333]"
                        }`}
                      />
                    </div>
                    <div className="w-10 shrink-0 text-right text-sm font-bold tabular-nums">
                      {stage.total}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-6 border-t border-[#222222] pt-4 text-xs text-[#888888]">
                Onboarding, Retainer e Expansão ainda não têm coluna própria no schema —
                ficam em 0 até existir o módulo de pós-venda (ver gap G7 no CLAUDE.md).
              </p>
            </Card>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
