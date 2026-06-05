"use client";

import { useMemo } from "react";
import { ArrowUpRight, Calculator, TrendingUp, Wallet } from "lucide-react";
import { useOfferBook } from "../_lib/store";

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

function parseNumber(input: string): number {
  if (!input) return 0;
  const cleaned = input
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function parsePercent(input: string): number {
  if (!input) return 0;
  const cleaned = input.replace(/[^\d,.-]/g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n > 1 ? n / 100 : n;
}

/**
 * Conversão potencial = max(conv × 2, conv + 0.10), capada em 50%.
 * Determinística, sem IA. Mostrada de forma transparente na UI.
 */
function targetConversion(current: number): number {
  if (current <= 0) return 0;
  const doubled = current * 2;
  const plusTen = current + 0.1;
  return Math.min(0.5, Math.max(doubled, plusTen));
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
};

function NumField({ label, value, onChange, placeholder, hint }: FieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
        {label}
      </span>
      <input
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20"
      />
      {hint ? <span className="text-[11px] text-zinc-500">{hint}</span> : null}
    </label>
  );
}

function MetricCard({
  label,
  value,
  tone,
  icon,
  hint,
}: {
  label: string;
  value: string;
  tone: "neutral" | "good" | "accent";
  icon: React.ReactNode;
  hint?: string;
}) {
  const toneClass =
    tone === "good"
      ? "border-emerald-400/30 bg-emerald-400/[0.05]"
      : tone === "accent"
        ? "border-brand-cyan/30 bg-brand-cyan/[0.05]"
        : "border-white/10 bg-zinc-900/40";

  const iconClass =
    tone === "good"
      ? "text-emerald-300"
      : tone === "accent"
        ? "text-brand-cyan"
        : "text-zinc-300";

  return (
    <div className={`rounded-2xl border ${toneClass} p-6`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
          {label}
        </span>
        <span className={`grid h-8 w-8 place-items-center rounded-md border border-white/10 bg-white/[0.04] ${iconClass}`}>
          {icon}
        </span>
      </div>
      <div className="mt-4 text-4xl font-black tabular-nums text-white">
        {value}
      </div>
      {hint ? (
        <p className="mt-2 text-xs leading-relaxed text-zinc-400">{hint}</p>
      ) : null}
    </div>
  );
}

export default function ROIPage() {
  const { state, setDiagnostico, hydrated } = useOfferBook();
  const d = state.diagnostico;

  const leads = d.leadsMes;
  const ticket = d.ticketMedio || state.cliente.ticketMedio;
  const conversao = d.conversaoAtual;

  const setLeads = (v: string) => setDiagnostico({ ...d, leadsMes: v });
  const setTicket = (v: string) => setDiagnostico({ ...d, ticketMedio: v });
  const setConversao = (v: string) =>
    setDiagnostico({ ...d, conversaoAtual: v });

  const leadsN = parseNumber(leads);
  const ticketN = parseNumber(ticket);
  const convN = parsePercent(conversao);
  const targetN = targetConversion(convN);

  const receitaAtual = useMemo(
    () => leadsN * convN * ticketN,
    [leadsN, convN, ticketN],
  );
  const receitaPotencial = useMemo(
    () => leadsN * targetN * ticketN,
    [leadsN, targetN, ticketN],
  );
  const ganho = Math.max(0, receitaPotencial - receitaAtual);
  const ganhoPct =
    receitaAtual > 0 ? Math.round((ganho / receitaAtual) * 100) : 0;

  if (!hydrated) return null;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-10 flex items-start gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-brand-cyan">
          <Calculator className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-cyan">
            ROI Potencial
          </div>
          <h1 className="mt-1 text-3xl font-black uppercase tracking-tight text-white">
            Receita Atual vs. Potencial
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-400">
            Cálculo determinístico — sem IA. Conversão potencial limitada em
            50% e definida como o maior valor entre dobrar a atual ou somar
            10 pontos percentuais.
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-white/10 bg-zinc-900/40 p-6">
        <h2 className="text-sm font-black uppercase tracking-[0.14em] text-white">
          Premissas
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Valores pré-preenchidos com o que está no Diagnóstico. Edite à
          vontade — o cálculo é local.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
          <NumField
            label="Leads por mês"
            value={leads}
            onChange={setLeads}
            placeholder="Ex.: 200"
          />
          <NumField
            label="Ticket médio"
            value={ticket}
            onChange={setTicket}
            placeholder="Ex.: 2500"
            hint="Em R$ — sem moeda."
          />
          <NumField
            label="Conversão atual"
            value={conversao}
            onChange={setConversao}
            placeholder="Ex.: 12%"
            hint={
              convN > 0
                ? `Potencial calculada: ${(targetN * 100).toFixed(0)}%`
                : "Aceita formato 12 ou 12%."
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <MetricCard
          label="Receita Atual"
          value={BRL.format(receitaAtual)}
          tone="neutral"
          icon={<Wallet className="h-4 w-4" />}
          hint={
            leadsN && convN && ticketN
              ? `${leadsN} leads × ${(convN * 100).toFixed(1)}% × ${BRL.format(ticketN)}`
              : "Preencha os três campos acima."
          }
        />
        <MetricCard
          label="Receita Potencial"
          value={BRL.format(receitaPotencial)}
          tone="accent"
          icon={<TrendingUp className="h-4 w-4" />}
          hint={
            leadsN && convN && ticketN
              ? `${leadsN} leads × ${(targetN * 100).toFixed(0)}% × ${BRL.format(ticketN)}`
              : "—"
          }
        />
        <MetricCard
          label="Ganho Estimado"
          value={BRL.format(ganho)}
          tone="good"
          icon={<ArrowUpRight className="h-4 w-4" />}
          hint={
            ganho > 0
              ? `+${ganhoPct}% sobre a receita atual.`
              : "Sem ganho calculável com os dados atuais."
          }
        />
      </div>
    </div>
  );
}
