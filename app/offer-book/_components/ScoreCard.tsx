"use client";

import { scoreTier } from "../_lib/scores";

type Tone = "low" | "mid" | "high";

const ring: Record<Tone, string> = {
  low: "stroke-red-400/80",
  mid: "stroke-amber-300/80",
  high: "stroke-emerald-400/80",
};

const dot: Record<Tone, string> = {
  low: "bg-red-400",
  mid: "bg-amber-300",
  high: "bg-emerald-400",
};

const label: Record<Tone, string> = {
  low: "Crítico",
  mid: "Atenção",
  high: "Saudável",
};

type Props = {
  label: string;
  description?: string;
  value: number;
};

export function ScoreCard({ label: title, description, value }: Props) {
  const tier = scoreTier(value);
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Score de {title}
          </div>
          <div className="mt-1 text-3xl font-black text-white tabular-nums">
            {value}
            <span className="text-base text-zinc-500">/100</span>
          </div>
        </div>

        <div className="relative h-20 w-20 shrink-0">
          <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
            <circle
              cx="40"
              cy="40"
              r={radius}
              strokeWidth="6"
              className="fill-none stroke-white/[0.06]"
            />
            <circle
              cx="40"
              cy="40"
              r={radius}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={`fill-none transition-all duration-700 ${ring[tier]}`}
            />
          </svg>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${dot[tier]}`} />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
          {label[tier]}
        </span>
      </div>

      {description ? (
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">
          {description}
        </p>
      ) : null}
    </div>
  );
}
