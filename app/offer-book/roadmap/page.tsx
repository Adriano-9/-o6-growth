"use client";

import { Map as MapIcon, CheckCircle2 } from "lucide-react";

type Phase = {
  number: 1 | 2 | 3;
  title: string;
  horizon: string;
  focus: string;
  items: string[];
  tone: "ignite" | "scale" | "lock";
};

const phases: Phase[] = [
  {
    number: 1,
    title: "Estancar a Hemorragia",
    horizon: "0 — 30 dias",
    focus: "Resposta ao lead, oferta e CRM no básico operacional.",
    items: [
      "Implementar contato ao lead em < 10 segundos.",
      "Reescrever a oferta em torno do mecanismo único + prova.",
      "Instrumentar CRM com origem do lead obrigatória.",
      "Roteamento por vendedor com SLA mensurado.",
    ],
    tone: "ignite",
  },
  {
    number: 2,
    title: "Otimizar e Escalar",
    horizon: "30 — 90 dias",
    focus: "Conversão por canal, processo comercial e diversificação.",
    items: [
      "Dashboard de conversão por canal × vendedor × etapa.",
      "Quebrar objeções principais em script e em materiais.",
      "Adicionar 2º e 3º canal de aquisição mensuráveis.",
      "Ciclo semanal de revisão de oferta + funil.",
    ],
    tone: "scale",
  },
  {
    number: 3,
    title: "Previsibilidade e Domínio",
    horizon: "90 — 180 dias",
    focus: "Sistema comercial autônomo, com telemetria de ROI em tempo real.",
    items: [
      "Forecast de pipeline com confiança estatística.",
      "Squad comercial com playbook por persona.",
      "Telemetria de ROI por campanha e por canal.",
      "Esteira de testes contínuos de oferta e mensagem.",
    ],
    tone: "lock",
  },
];

const toneRing: Record<Phase["tone"], string> = {
  ignite: "from-red-500/40 to-amber-300/40",
  scale: "from-amber-300/40 to-brand-cyan/40",
  lock: "from-brand-cyan/40 to-emerald-400/40",
};

const toneText: Record<Phase["tone"], string> = {
  ignite: "text-red-300",
  scale: "text-amber-200",
  lock: "text-emerald-200",
};

export default function RoadmapPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-10 flex items-start gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-brand-cyan">
          <MapIcon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-cyan">
            Roadmap
          </div>
          <h1 className="mt-1 text-3xl font-black uppercase tracking-tight text-white">
            Trilha de Execução
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-400">
            Fases sequenciais — cada uma destrava a próxima. Da estabilização
            operacional até a previsibilidade total do pipeline.
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute left-7 top-0 hidden h-full w-px bg-gradient-to-b from-red-500/30 via-brand-cyan/30 to-emerald-400/30 md:block" />

        <div className="flex flex-col gap-6">
          {phases.map((phase) => (
            <article
              key={phase.number}
              className="relative rounded-2xl border border-white/10 bg-zinc-900/40 p-6 md:pl-20"
            >
              <div
                className={[
                  "absolute -left-px top-6 hidden h-14 w-14 -translate-x-1/2 rounded-xl bg-gradient-to-br p-px md:block",
                  toneRing[phase.tone],
                ].join(" ")}
              >
                <div className="grid h-full w-full place-items-center rounded-[11px] bg-zinc-950">
                  <div className="text-center">
                    <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      Fase
                    </div>
                    <div className="-mt-0.5 text-xl font-black text-white tabular-nums">
                      {phase.number}
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:hidden mb-4 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                Fase {phase.number}
              </div>

              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="text-xl font-black uppercase tracking-tight text-white">
                  {phase.title}
                </h2>
                <span
                  className={`text-[11px] font-bold uppercase tracking-[0.18em] ${toneText[phase.tone]}`}
                >
                  {phase.horizon}
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-400">{phase.focus}</p>

              <ul className="mt-5 grid grid-cols-1 gap-2 md:grid-cols-2">
                {phase.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-sm text-zinc-200"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
