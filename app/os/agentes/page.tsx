"use client";

import { Reveal, SectionLabel, StatusDot, HealthBadge } from "../_lib/ui";

type Agent = {
  nome: string;
  motor: string;
  status: "ativo" | "inativo" | "manual";
  ultimaExecucao: string;
  modelo: string;
  health: "ok" | "degraded" | "down";
};

// Hardcoded — sem tabela agent_runs ainda (ver CLAUDE.md Sprint 8 pendente).
const agents: Agent[] = [
  {
    nome: "Intelligence Agent",
    motor: "Claude Chat",
    status: "manual",
    ultimaExecucao: "Sob demanda",
    modelo: "claude-opus-4-8",
    health: "ok",
  },
  {
    nome: "Sales Agent",
    motor: "Claude Code",
    status: "manual",
    ultimaExecucao: "Sob demanda",
    modelo: "claude-sonnet-4-6",
    health: "ok",
  },
  {
    nome: "Deploy Agent",
    motor: "Vercel",
    status: "ativo",
    ultimaExecucao: "A cada deploy",
    modelo: "—",
    health: "ok",
  },
  {
    nome: "Intelligence Engine",
    motor: "VPS · cron 6h",
    status: "inativo",
    ultimaExecucao: "Nunca executado",
    modelo: "claude-sonnet-4-6",
    health: "down",
  },
];

const statusMeta: Record<Agent["status"], { label: string; active: boolean }> = {
  ativo: { label: "Ativo", active: true },
  inativo: { label: "Inativo", active: false },
  manual: { label: "Manual", active: true },
};

export default function OsAgentes() {
  return (
    <main className="px-6 py-10 md:px-10 md:py-14">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="border-b border-[#222222] pb-8">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Agent Center
            </h1>
            <p className="mt-1 text-sm text-[#888888]">
              4 agentes de linha de frente · dados hardcoded até existir tabela agent_runs
            </p>
          </div>
        </Reveal>

        <div className="mt-10">
          <SectionLabel>Agentes</SectionLabel>
          <Reveal>
            <div className="overflow-hidden rounded-xl border border-[#222222]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#222222] bg-[#111111] text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-[#888888]">
                    <th className="px-5 py-4">Agent</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Última execução</th>
                    <th className="px-5 py-4">Modelo</th>
                    <th className="px-5 py-4">Health</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent, i) => (
                    <tr
                      key={agent.nome}
                      className={
                        i < agents.length - 1
                          ? "border-b border-[#1A1A1A] bg-[#0D0D0D]"
                          : "bg-[#0D0D0D]"
                      }
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-white">{agent.nome}</div>
                        <div className="text-xs text-[#888888]">{agent.motor}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-2 text-xs text-[#EDEDED]">
                          <StatusDot active={statusMeta[agent.status].active} />
                          {statusMeta[agent.status].label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-[#888888]">
                        {agent.ultimaExecucao}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-[#888888]">
                        {agent.modelo}
                      </td>
                      <td className="px-5 py-4">
                        <HealthBadge level={agent.health} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
          <p className="mt-4 text-xs text-[#888888]">
            Intelligence Agent e Sales Agent são acionados sob demanda pelo operador (sem
            scheduler ainda). Deploy Agent roda a cada push via Vercel. Intelligence Engine
            está pronto no código mas não implantado no VPS — ver{" "}
            <code className="rounded bg-white/5 px-1.5 py-0.5">scripts/vps-bootstrap-intelligence.sh</code>.
          </p>
        </div>
      </div>
    </main>
  );
}
