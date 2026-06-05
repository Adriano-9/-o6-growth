"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  ClipboardList,
  FileText,
} from "lucide-react";
import { ScoreCard } from "../_components/ScoreCard";
import { computeScores, scoreTier, ScoreDef } from "../_lib/scores";
import { useOfferBook } from "../_lib/store";

function dash(v: string) {
  return v && v.trim().length > 0 ? v : "—";
}

const gargaloMessages: Record<string, string> = {
  velocidade:
    "Latência alta na resposta ao lead — pipeline esfria antes do primeiro contato.",
  oferta:
    "Oferta com construção incompleta — falta clareza de mecanismo único, garantia ou prova.",
  aquisicao:
    "Canais de aquisição pouco mapeados — dependência ou falta de visibilidade sobre origem dos leads.",
  conversao:
    "Conversão atual frágil ou não mensurada — diagnóstico cruzado com transformação prometida está incompleto.",
};

const oportunidadeMessages: Record<string, string> = {
  velocidade:
    "Implementar triagem e contato em < 1 minuto destrava o teto natural do funil.",
  oferta:
    "Reescrever a oferta em torno de mecanismo único e prova eleva ticket e conversão simultaneamente.",
  aquisicao:
    "Diversificar canais e instrumentar CRM corta dependência e melhora previsibilidade.",
  conversao:
    "Cruzar conversão por canal com transformação prometida revela gargalos invisíveis no pitch atual.",
};

function Section({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-brand-cyan">
          {icon}
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.14em] text-white">
            {title}
          </h2>
          <p className="text-xs text-zinc-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function ListItem({
  tag,
  body,
  tone,
}: {
  tag: string;
  body: string;
  tone: "warn" | "good" | "muted";
}) {
  const toneStyle =
    tone === "warn"
      ? "border-red-500/30 bg-red-500/5 text-red-200"
      : tone === "good"
        ? "border-emerald-400/30 bg-emerald-400/5 text-emerald-200"
        : "border-white/10 bg-white/[0.02] text-zinc-300";

  const tagStyle =
    tone === "warn"
      ? "bg-red-500/20 text-red-300"
      : tone === "good"
        ? "bg-emerald-400/20 text-emerald-200"
        : "bg-white/[0.06] text-zinc-300";

  return (
    <li className={`flex items-start gap-3 rounded-xl border p-4 ${toneStyle}`}>
      <span
        className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tagStyle}`}
      >
        {tag}
      </span>
      <p className="text-sm leading-relaxed">{body}</p>
    </li>
  );
}

export default function ResumoExecutivoPage() {
  const { state, hydrated } = useOfferBook();
  if (!hydrated) return null;

  const scores = computeScores(state);
  const { cliente, icp, oferta, diagnostico } = state;

  const sortedAsc = [...scores].sort((a, b) => a.value - b.value);
  const gargalos = sortedAsc.filter((s) => s.value < 60).slice(0, 3);
  const oportunidades = sortedAsc
    .filter((s) => s.value < 80)
    .slice(0, 3);

  const overall = Math.round(
    scores.reduce((sum, s) => sum + s.value, 0) / scores.length,
  );
  const overallTier = scoreTier(overall);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-10 flex items-start gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-brand-cyan">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-cyan">
            Resumo Executivo
          </div>
          <h1 className="mt-1 text-3xl font-black uppercase tracking-tight text-white">
            {dash(cliente.empresa)}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Síntese de gargalos, oportunidades e diagnóstico consolidado a
            partir da inteligência coletada.
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/60 to-zinc-950/60 p-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Health Score Global
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-5xl font-black tabular-nums text-white">
                {overall}
              </span>
              <span className="text-base text-zinc-500">/100</span>
              <span
                className={[
                  "rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider",
                  overallTier === "high"
                    ? "bg-emerald-400/20 text-emerald-200"
                    : overallTier === "mid"
                      ? "bg-amber-300/20 text-amber-200"
                      : "bg-red-500/20 text-red-200",
                ].join(" ")}
              >
                {overallTier === "high"
                  ? "Saudável"
                  : overallTier === "mid"
                    ? "Atenção"
                    : "Crítico"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {scores.map((s) => (
              <ScoreCard
                key={s.key}
                label={s.label}
                value={s.value}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Section
          title="Principais Gargalos"
          description="Áreas com score abaixo do limiar saudável."
          icon={<AlertTriangle className="h-4 w-4" />}
        >
          {gargalos.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Nenhum gargalo crítico identificado — todos os indicadores acima
              de 60.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {gargalos.map((g) => (
                <ListItem
                  key={g.key}
                  tag={`${g.label} · ${g.value}`}
                  body={gargaloMessages[g.key] ?? g.description}
                  tone="warn"
                />
              ))}
            </ul>
          )}
        </Section>

        <Section
          title="Principais Oportunidades"
          description="Maiores alavancas para destravar resultado no curto prazo."
          icon={<ArrowUpRight className="h-4 w-4" />}
        >
          {oportunidades.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Operação madura — oportunidades atuais são de refinamento, não
              de salto.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {oportunidades.map((o) => (
                <ListItem
                  key={o.key}
                  tag={o.label}
                  body={oportunidadeMessages[o.key] ?? o.description}
                  tone="good"
                />
              ))}
            </ul>
          )}
        </Section>

        <div className="lg:col-span-2">
          <Section
            title="Diagnóstico Consolidado"
            description="Leitura cruzada do estado atual do negócio."
            icon={<ClipboardList className="h-4 w-4" />}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Consolidated label="Empresa" value={cliente.empresa} />
              <Consolidated label="Nicho" value={cliente.nicho} />
              <Consolidated
                label="Problema do ICP"
                value={icp.problemaPrincipal}
              />
              <Consolidated
                label="Transformação prometida"
                value={oferta.transformacao}
              />
              <Consolidated
                label="Mecanismo Único"
                value={oferta.mecanismoUnico}
              />
              <Consolidated
                label="Tempo de Resposta atual"
                value={diagnostico.tempoResposta}
              />
              <Consolidated
                label="Origem dos Leads"
                value={diagnostico.origemLeads}
              />
              <Consolidated
                label="Conversão Atual"
                value={diagnostico.conversaoAtual}
              />
              <div className="md:col-span-2">
                <Consolidated
                  label="Síntese"
                  value={
                    buildSintese(scores, cliente.empresa) ||
                    "Preencha os módulos para gerar a síntese."
                  }
                />
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Consolidated({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </div>
      <div className="mt-1 text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap">
        {dash(value)}
      </div>
    </div>
  );
}

function buildSintese(scores: ScoreDef[], empresa: string): string {
  const meaningful = scores.filter((s) => s.value > 0);
  if (meaningful.length === 0) return "";

  const worst = [...meaningful].sort((a, b) => a.value - b.value)[0];
  const best = [...meaningful].sort((a, b) => b.value - a.value)[0];
  const empresaLabel = empresa.trim() || "A operação";

  return `${empresaLabel} apresenta seu maior ponto de fragilidade em ${worst.label} (${worst.value}/100), enquanto ${best.label} (${best.value}/100) é hoje o eixo mais consolidado. O movimento de maior alavancagem está em reduzir a distância entre o pior e o melhor indicador para abrir teto de receita sem aumentar volume de leads.`;
}
