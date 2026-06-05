"use client";

import { ListChecks, Zap } from "lucide-react";
import { computeScores, scoreTier, ScoreKey } from "../_lib/scores";
import { useOfferBook } from "../_lib/store";

const actionByScore: Record<
  ScoreKey,
  { title: string; body: string; metric: string }
> = {
  velocidade: {
    title: "Implementar contato em até 10 segundos.",
    body:
      "Triagem automática + roteamento direto ao vendedor reduz a latência da resposta ao lead para o teto operacional do mercado.",
    metric: "Meta: < 10s · SLA por lead",
  },
  oferta: {
    title: "Revisar posicionamento e oferta.",
    body:
      "Reescrever a oferta em torno de mecanismo único + prova + garantia eleva ticket e conversão sem aumentar volume.",
    metric: "Meta: clareza em 1 frase + 3 provas",
  },
  aquisicao: {
    title: "Revisar canais de entrada.",
    body:
      "Mapear origem real dos leads, instrumentar CRM e diversificar canais corta dependência e melhora previsibilidade de pipeline.",
    metric: "Meta: 3 canais mensuráveis ativos",
  },
  conversao: {
    title: "Revisar processo comercial.",
    body:
      "Cruzar conversão por canal com transformação prometida, redesenhar pitch e quebrar objeções no script.",
    metric: "Meta: +50% sobre conversão atual",
  },
};

function Priority({
  rank,
  scoreLabel,
  scoreValue,
  action,
}: {
  rank: 1 | 2 | 3;
  scoreLabel: string;
  scoreValue: number;
  action: { title: string; body: string; metric: string };
}) {
  const tier = scoreTier(scoreValue);
  const accent =
    tier === "low"
      ? "border-red-500/30 bg-red-500/[0.04]"
      : tier === "mid"
        ? "border-amber-300/30 bg-amber-300/[0.04]"
        : "border-emerald-400/30 bg-emerald-400/[0.04]";
  const dot =
    tier === "low"
      ? "bg-red-400"
      : tier === "mid"
        ? "bg-amber-300"
        : "bg-emerald-400";

  return (
    <div className={`rounded-2xl border ${accent} p-6`}>
      <div className="flex items-start gap-5">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-white/10 bg-zinc-950/60">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            P
          </div>
          <div className="-mt-1 text-2xl font-black text-white tabular-nums">
            {rank}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-300">
              {scoreLabel}
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
              Score {scoreValue}/100
            </span>
          </div>

          <h3 className="mt-2 text-lg font-bold text-white">{action.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            {action.body}
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
            <Zap className="h-3 w-3 text-brand-cyan" />
            {action.metric}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlanoDeAcaoPage() {
  const { state, hydrated } = useOfferBook();
  if (!hydrated) return null;

  const scores = computeScores(state);
  const sorted = [...scores].sort((a, b) => a.value - b.value);
  const top3 = sorted.slice(0, 3);
  const allHealthy = sorted.every((s) => s.value >= 60);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-10 flex items-start gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-brand-cyan">
          <ListChecks className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-cyan">
            Plano de Ação
          </div>
          <h1 className="mt-1 text-3xl font-black uppercase tracking-tight text-white">
            Próximos 3 Movimentos
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-400">
            Prioridades geradas automaticamente a partir dos scores do
            diagnóstico. Quanto menor o score, mais alto fica na fila.
          </p>
        </div>
      </div>

      {allHealthy ? (
        <div className="mb-6 rounded-xl border border-emerald-400/30 bg-emerald-400/[0.04] p-4 text-sm text-emerald-200">
          Todos os indicadores estão acima de 60. Plano de ação focado em
          consolidação e refinamento.
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        {top3.map((s, idx) => (
          <Priority
            key={s.key}
            rank={(idx + 1) as 1 | 2 | 3}
            scoreLabel={s.label}
            scoreValue={s.value}
            action={actionByScore[s.key]}
          />
        ))}
      </div>

      <p className="mt-8 text-xs text-zinc-500">
        Plano recalculado a cada atualização dos módulos do Offer Book — sem
        IA, lógica determinística sobre os scores 0-100.
      </p>
    </div>
  );
}
