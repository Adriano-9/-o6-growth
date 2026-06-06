"use client";

import { useCallback, useState } from "react";
import { ListChecks, Loader2, RefreshCw, Sparkles, Zap } from "lucide-react";
import { computeScores, scoreTier, ScoreKey } from "../_lib/scores";
import { useOfferBook } from "../_lib/store";
import { AiGenerateResponse, AiPrioridade } from "../_lib/ai-types";

const actionByScore: Record<
  ScoreKey,
  { title: string; body: string; metric: string }
> = {
  velocidade: {
    title: "Implementar contato em até 10 segundos.",
    body: "Triagem automática + roteamento direto ao vendedor reduz a latência da resposta ao lead para o teto operacional do mercado.",
    metric: "Meta: < 10s · SLA por lead",
  },
  oferta: {
    title: "Revisar posicionamento e oferta.",
    body: "Reescrever a oferta em torno de mecanismo único + prova + garantia eleva ticket e conversão sem aumentar volume.",
    metric: "Meta: clareza em 1 frase + 3 provas",
  },
  aquisicao: {
    title: "Revisar canais de entrada.",
    body: "Mapear origem real dos leads, instrumentar CRM e diversificar canais corta dependência e melhora previsibilidade de pipeline.",
    metric: "Meta: 3 canais mensuráveis ativos",
  },
  conversao: {
    title: "Revisar processo comercial.",
    body: "Cruzar conversão por canal com transformação prometida, redesenhar pitch e quebrar objeções no script.",
    metric: "Meta: +50% sobre conversão atual",
  },
  potencial: {
    title: "Ampliar potencial de crescimento.",
    body: "Definir ICP com precisão, mapear volume de leads e ajustar ticket médio para maximizar o teto de escala.",
    metric: "Meta: ICP completo + ticket definido",
  },
  eficiencia: {
    title: "Aumentar eficiência comercial.",
    body: "Adicionar prova social, garantia robusta e mapear concorrentes para converter mais com o mesmo volume de leads.",
    metric: "Meta: 3+ concorrentes mapeados + prova documentada",
  },
};

function PriorityDeterministic({
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

function PriorityAI({ p }: { p: AiPrioridade }) {
  return (
    <div className="rounded-2xl border border-brand-cyan/20 bg-brand-cyan/[0.03] p-6">
      <div className="flex items-start gap-5">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-brand-cyan/20 bg-zinc-950/60">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            P
          </div>
          <div className="-mt-1 text-2xl font-black text-white tabular-nums">
            {p.rank}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-brand-cyan/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-cyan">
              {p.area}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              {p.prazo}
            </span>
          </div>

          <h3 className="mt-2 text-lg font-bold text-white">{p.titulo}</h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">{p.corpo}</p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-brand-cyan/20 bg-brand-cyan/[0.06] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-cyan">
            <Zap className="h-3 w-3" />
            {p.metrica}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlanoDeAcaoPage() {
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

  const scores = computeScores(state);
  const sorted = [...scores].sort((a, b) => a.value - b.value);
  const top3 = sorted.slice(0, 3);
  const allHealthy = sorted.every((s) => s.value >= 60);
  const aiPrioridades = aiOutput?.planoAcao.prioridades;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-10 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
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
              {aiPrioridades
                ? `Gerado por Claude AI${aiGeneratedAt ? ` · ${new Date(aiGeneratedAt).toLocaleDateString("pt-BR")}` : ""}.`
                : "Prioridades calculadas automaticamente a partir dos scores."}
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
            ) : aiPrioridades ? (
              <RefreshCw className="h-3 w-3" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            {aiPrioridades ? "Regenerar" : "Gerar com IA"}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          <span className="font-bold">Falha ao gerar:</span> {error}
        </div>
      )}

      {allHealthy && !aiPrioridades && (
        <div className="mb-6 rounded-xl border border-emerald-400/30 bg-emerald-400/[0.04] p-4 text-sm text-emerald-200">
          Todos os indicadores estão acima de 60. Plano de ação focado em
          consolidação e refinamento.
        </div>
      )}

      {loading && (
        <div className="mb-6 flex items-center justify-center gap-2 rounded-xl border border-brand-cyan/20 bg-brand-cyan/[0.04] p-6 text-sm text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin text-brand-cyan" />
          Claude está gerando o plano de ação personalizado…
        </div>
      )}

      <div className="flex flex-col gap-4">
        {aiPrioridades
          ? aiPrioridades.map((p) => <PriorityAI key={p.rank} p={p} />)
          : top3.map((s, idx) => (
              <PriorityDeterministic
                key={s.key}
                rank={(idx + 1) as 1 | 2 | 3}
                scoreLabel={s.label}
                scoreValue={s.value}
                action={actionByScore[s.key]}
              />
            ))}
      </div>
    </div>
  );
}
