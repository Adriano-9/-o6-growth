"use client";

import { Cpu, HardDrive, MemoryStick } from "lucide-react";
import { Card, Reveal, SectionLabel, StatusDot, HealthBadge } from "../_lib/ui";

const cronJobs = [
  { nome: "Intelligence Brief diário", horario: "06:00", ativo: false },
  { nome: "Re-audit mensal de prospects", horario: "—", ativo: false },
  { nome: "Backup Supabase semanal", horario: "—", ativo: false },
];

const logs = [
  { ts: "—", nivel: "info", msg: "Intelligence Engine ainda não foi implantado no VPS." },
  { ts: "—", nivel: "info", msg: "Nenhuma execução de cron registrada até o momento." },
];

export default function OsHermes() {
  return (
    <main className="px-6 py-10 md:px-10 md:py-14">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#222222] pb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Hermes Monitor
              </h1>
              <p className="mt-1 text-sm text-[#888888]">
                VPS 147.182.135.206 · Intelligence Engine
              </p>
            </div>
            <HealthBadge level="down" />
          </div>
        </Reveal>

        {/* CPU / RAM / Disco */}
        <div className="mt-10">
          <SectionLabel right={<span className="text-xs text-[#888888]">sem acesso SSH — hardcoded</span>}>
            Recursos do servidor
          </SectionLabel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: "CPU", value: "—", icon: Cpu },
              { label: "RAM", value: "—", icon: MemoryStick },
              { label: "Disco", value: "—", icon: HardDrive },
            ].map((res, i) => (
              <Reveal key={res.label} delay={i * 0.08}>
                <Card>
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#888888]">
                      {res.label}
                    </div>
                    <res.icon className="h-4 w-4 text-[#FF5722]" strokeWidth={1.75} />
                  </div>
                  <div className="mt-4 text-3xl font-bold text-[#555555]">{res.value}</div>
                  <div className="mt-1 text-xs text-[#555555]">
                    Indisponível — sem conexão SSH ativa
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Cron jobs */}
        <div className="mt-12">
          <SectionLabel>Cron jobs</SectionLabel>
          <Reveal>
            <Card>
              <ul className="space-y-3">
                {cronJobs.map((job) => (
                  <li
                    key={job.nome}
                    className="flex items-center justify-between gap-3 border-b border-[#1A1A1A] pb-3 text-sm last:border-0 last:pb-0"
                  >
                    <span className="flex items-center gap-2 text-[#EDEDED]">
                      <StatusDot active={job.ativo} />
                      {job.nome}
                    </span>
                    <span className="text-xs text-[#888888]">{job.horario}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
        </div>

        {/* Logs */}
        <div className="mt-12">
          <SectionLabel>Logs do Intelligence Engine</SectionLabel>
          <Reveal>
            <Card className="font-mono text-xs">
              <div className="space-y-2">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-3 text-[#888888]">
                    <span className="shrink-0 text-[#555555]">{log.ts}</span>
                    <span className="shrink-0 uppercase text-[#666666]">[{log.nivel}]</span>
                    <span>{log.msg}</span>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>
          <p className="mt-4 text-xs text-[#888888]">
            Bootstrap pronto em{" "}
            <code className="rounded bg-white/5 px-1.5 py-0.5">
              scripts/vps-bootstrap-intelligence.sh
            </code>{" "}
            — falta acesso SSH ao VPS (147.182.135.206) para implantar e passar a reportar
            dados reais aqui.
          </p>
        </div>
      </div>
    </main>
  );
}
