"use client";

import { useCallback, useState } from "react";
import { CheckCircle2, Loader2, Map as MapIcon, RefreshCw, Sparkles } from "lucide-react";
import { useOfferBook } from "../_lib/store";
import { AiFase, AiGenerateResponse } from "../_lib/ai-types";

type StaticPhase = {
  number: 1 | 2 | 3;
  title: string;
  horizon: string;
  focus: string;
  items: string[];
  tone: "ignite" | "scale" | "lock";
};

const staticPhases: StaticPhase[] = [
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

const toneRing: Record<StaticPhase["tone"], string> = {
  ignite: "from-red-500/40 to-amber-300/40",
  scale: "from-amber-300/40 to-brand-cyan/40",
  lock: "from-brand-cyan/40 to-emerald-400/40",
};

const toneText: Record<StaticPhase["tone"], string> = {
  ignite: "text-red-300",
  scale: "text-amber-200",
  lock: "text-emerald-200",
};

const aiRing = [
  "from-red-500/40 to-amber-300/40",
  "from-amber-300/40 to-brand-cyan/40",
  "from-brand-cyan/40 to-emerald-400/40",
];
const aiText = ["text-red-300", "text-amber-200", "text-emerald-200"];

function PhaseCard({
  number,
  title,
  horizon,
  focus,
  items,
  ring,
  textColor,
}: {
  number: number;
  title: string;
  horizon: string;
  focus: string;
  items: string[];
  ring: string;
  textColor: string;
}) {
  return (
    <article className="relative rounded-2xl border border-white/10 bg-zinc-900/40 p-6 md:pl-20">
      <div
        className={[
          "absolute -left-px top-6 hidden h-14 w-14 -translate-x-1/2 rounded-xl bg-gradient-to-br p-px md:block",
          ring,
        ].join(" ")}
      >
        <div className="grid h-full w-full place-items-center rounded-[11px] bg-zinc-950">
          <div className="text-center">
            <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Fase
            </div>
            <div className="-mt-0.5 text-xl font-black text-white tabular-nums">
              {number}
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden mb-4 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-300">
        Fase {number}
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-xl font-black uppercase tracking-tight text-white">
          {title}
        </h2>
        <span className={`text-[11px] font-bold uppercase tracking-[0.18em] ${textColor}`}>
          {horizon}
        </span>
      </div>
      <p className="mt-1 text-sm text-zinc-400">{focus}</p>

      <ul className="mt-5 grid grid-cols-1 gap-2 md:grid-cols-2">
        {items.map((item) => (
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
  );
}

export default function RoadmapPage() {
  const { state, hydrated, currentClienteId, aiOutput, aiGeneratedAt, setAiOutput } =
    useOfferBook();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (force = true) => {
      if (!currentClienteId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/offer-book/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clienteId: currentClienteId, state, force }),
        });
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(err.error || `Erro ${res.status}`);
        }
        const data = (await res.json()) as AiGenerateResponse;
        setAiOutput(data, data.generatedAt);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentClienteId, setAiOutput, JSON.stringify(state)],
  );

  if (!hydrated) return null;

  const aiFases: AiFase[] | undefined = aiOutput?.roadmap.fases;

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-10 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
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
              {aiFases
                ? `Gerado por Claude AI${aiGeneratedAt ? ` · ${new Date(aiGeneratedAt).toLocaleDateString("pt-BR")}` : ""}.`
                : "Fases sequenciais — cada uma destrava a próxima. Da estabilização operacional até a previsibilidade total do pipeline."}
            </p>
          </div>
        </div>

        {!!currentClienteId && (
          <button
            type="button"
            onClick={() => void generate(true)}
            disabled={loading}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-brand-cyan transition hover:bg-brand-cyan/20 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : aiFases ? (
              <RefreshCw className="h-3 w-3" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            {aiFases ? "Regenerar" : "Gerar com IA"}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          <span className="font-bold">Falha ao gerar:</span> {error}
        </div>
      )}

      {loading && (
        <div className="mb-6 flex items-center justify-center gap-2 rounded-xl border border-brand-cyan/20 bg-brand-cyan/[0.04] p-6 text-sm text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin text-brand-cyan" />
          Claude está gerando o roadmap personalizado…
        </div>
      )}

      <div className="relative">
        <div className="pointer-events-none absolute left-7 top-0 hidden h-full w-px bg-gradient-to-b from-red-500/30 via-brand-cyan/30 to-emerald-400/30 md:block" />

        <div className="flex flex-col gap-6">
          {aiFases
            ? aiFases.map((fase, i) => (
                <PhaseCard
                  key={fase.numero}
                  number={fase.numero}
                  title={fase.titulo}
                  horizon={fase.horizonte}
                  focus={fase.foco}
                  items={fase.itens}
                  ring={aiRing[i] ?? aiRing[2]}
                  textColor={aiText[i] ?? aiText[2]}
                />
              ))
            : staticPhases.map((phase) => (
                <PhaseCard
                  key={phase.number}
                  number={phase.number}
                  title={phase.title}
                  horizon={phase.horizon}
                  focus={phase.focus}
                  items={phase.items}
                  ring={toneRing[phase.tone]}
                  textColor={toneText[phase.tone]}
                />
              ))}
        </div>
      </div>
    </div>
  );
}
