"use client";

import { useEffect, useMemo } from "react";
import { useOfferBook } from "@/app/offer-book/_lib/store";
import { computeScores, scoreTier } from "@/app/offer-book/_lib/scores";

function dash(v: string | undefined | null): string {
  return v && v.toString().trim().length > 0 ? v : "—";
}

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

function targetConversion(current: number): number {
  if (current <= 0) return 0;
  return Math.min(0.5, Math.max(current * 2, current + 0.1));
}

const actionByScore: Record<
  string,
  { title: string; body: string }
> = {
  velocidade: {
    title: "Implementar contato em até 10 segundos.",
    body:
      "Triagem automática + roteamento direto ao vendedor reduz a latência da resposta ao lead para o teto operacional do mercado.",
  },
  oferta: {
    title: "Revisar posicionamento e oferta.",
    body:
      "Reescrever a oferta em torno de mecanismo único + prova + garantia eleva ticket e conversão sem aumentar volume.",
  },
  aquisicao: {
    title: "Revisar canais de entrada.",
    body:
      "Mapear origem real dos leads, instrumentar CRM e diversificar canais corta dependência e melhora previsibilidade de pipeline.",
  },
  conversao: {
    title: "Revisar processo comercial.",
    body:
      "Cruzar conversão por canal com transformação prometida, redesenhar pitch e quebrar objeções no script.",
  },
  potencial: {
    title: "Ampliar potencial de crescimento.",
    body:
      "Definir ICP com precisão, mapear volume de leads e ajustar ticket médio para maximizar o teto de escala.",
  },
  eficiencia: {
    title: "Aumentar eficiência comercial.",
    body:
      "Adicionar prova social, garantia robusta e mapear concorrentes para converter mais com o mesmo volume de leads.",
  },
};

const phases = [
  {
    n: 1,
    title: "Estancar a Hemorragia",
    horizon: "0 — 30 dias",
    focus: "Resposta ao lead, oferta e CRM no básico operacional.",
    items: [
      "Implementar contato ao lead em < 10 segundos.",
      "Reescrever a oferta em torno do mecanismo único + prova.",
      "Instrumentar CRM com origem do lead obrigatória.",
      "Roteamento por vendedor com SLA mensurado.",
    ],
  },
  {
    n: 2,
    title: "Otimizar e Escalar",
    horizon: "30 — 90 dias",
    focus: "Conversão por canal, processo comercial e diversificação.",
    items: [
      "Dashboard de conversão por canal × vendedor × etapa.",
      "Quebrar objeções principais em script e em materiais.",
      "Adicionar 2º e 3º canal de aquisição mensuráveis.",
      "Ciclo semanal de revisão de oferta + funil.",
    ],
  },
  {
    n: 3,
    title: "Previsibilidade e Domínio",
    horizon: "90 — 180 dias",
    focus: "Sistema comercial autônomo, com telemetria de ROI em tempo real.",
    items: [
      "Forecast de pipeline com confiança estatística.",
      "Squad comercial com playbook por persona.",
      "Telemetria de ROI por campanha e por canal.",
      "Esteira de testes contínuos de oferta e mensagem.",
    ],
  },
];

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="break-inside-avoid mb-10 rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
      <div className="mb-5 flex items-baseline gap-3 border-b border-white/10 pb-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-cyan">
          {number}
        </span>
        <h2 className="text-lg font-black uppercase tracking-tight text-white">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </div>
      <div className="text-sm text-zinc-100">{dash(value)}</div>
    </div>
  );
}

function Block({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
      <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </div>
      <div className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
        {dash(value)}
      </div>
    </div>
  );
}

export default function PrintPage() {
  const { state, hydrated, currentClienteId } = useOfferBook();

  useEffect(() => {
    if (!hydrated || !currentClienteId) return;
    const t = setTimeout(() => {
      try {
        window.print();
      } catch {
        /* ignore */
      }
    }, 800);
    return () => clearTimeout(t);
  }, [hydrated, currentClienteId]);

  const scores = useMemo(() => computeScores(state), [state]);
  const overall = Math.round(
    scores.reduce((sum, s) => sum + s.value, 0) / scores.length,
  );
  const priorities = useMemo(
    () => [...scores].sort((a, b) => a.value - b.value).slice(0, 3),
    [scores],
  );

  const { cliente, icp, psicografia, oferta, concorrentes, diagnostico } = state;

  const leadsN = parseNumber(diagnostico.leadsMes);
  const ticketN = parseNumber(
    diagnostico.ticketMedio || cliente.ticketMedio,
  );
  const convN = parsePercent(diagnostico.conversaoAtual);
  const targetN = targetConversion(convN);
  const receitaAtual = leadsN * convN * ticketN;
  const receitaPotencial = leadsN * targetN * ticketN;
  const ganho = Math.max(0, receitaPotencial - receitaAtual);

  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-zinc-400">
        Carregando offer book…
      </div>
    );
  }

  if (!currentClienteId) {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-center text-sm text-zinc-400">
        Nenhum cliente selecionado. Abra um cliente no Dashboard antes de
        gerar o Offer Book.
      </div>
    );
  }

  const today = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <>
      <style>{`
        @page { size: A4; margin: 16mm; }
        @media print {
          .print-toolbar { display: none !important; }
          html, body { background: #09090b !important; }
        }
      `}</style>

      <div className="print-toolbar sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-zinc-950/95 px-6 py-3 backdrop-blur">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-cyan">
          O6 Offer Book · {cliente.empresa || "Sem nome"}
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md border border-brand-cyan/40 bg-brand-cyan/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-cyan transition hover:bg-brand-cyan/25"
        >
          Imprimir / Salvar PDF
        </button>
      </div>

      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <header className="mb-12 border-b border-white/10 pb-8">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-brand-orange text-sm font-black text-black">
              O6
            </span>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Offer Book · Inteligência Comercial
            </div>
          </div>
          <h1 className="mt-8 text-5xl font-black uppercase tracking-tight text-white">
            {dash(cliente.empresa)}
          </h1>
          <p className="mt-3 text-base text-zinc-400">
            {dash(cliente.nicho)} ·{" "}
            {[cliente.cidade, cliente.estado].filter(Boolean).join("/") || "—"}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Health Score
              </div>
              <div className="mt-0.5 text-2xl font-black tabular-nums text-white">
                {overall}
                <span className="text-sm text-zinc-500">/100</span>
              </div>
            </div>
            {scores.map((s) => {
              const tier = scoreTier(s.value);
              const color =
                tier === "high"
                  ? "text-emerald-300"
                  : tier === "mid"
                    ? "text-amber-200"
                    : "text-red-300";
              return (
                <div
                  key={s.key}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    {s.label}
                  </div>
                  <div
                    className={`mt-0.5 text-2xl font-black tabular-nums ${color}`}
                  >
                    {s.value}
                    <span className="text-sm text-zinc-500">/100</span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-6 text-xs text-zinc-500">Gerado em {today}.</p>
        </header>

        <Section number="01" title="Cliente">
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
            <Stat label="Empresa" value={cliente.empresa} />
            <Stat label="Nicho" value={cliente.nicho} />
            <Stat label="Site" value={cliente.site} />
            <Stat label="Instagram" value={cliente.instagram} />
            <Stat
              label="Localização"
              value={
                [cliente.cidade, cliente.estado].filter(Boolean).join(" / ")
              }
            />
            <Stat label="Ticket Médio" value={cliente.ticketMedio} />
            <div className="col-span-2 md:col-span-3">
              <Block
                label="Fonte de Leads Atual"
                value={cliente.fonteLeads}
              />
            </div>
          </div>
        </Section>

        <Section number="02" title="ICP">
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            <Stat label="Idade" value={icp.idade} />
            <Stat label="Sexo" value={icp.sexo} />
            <Stat label="Renda" value={icp.renda} />
            <Stat label="Profissão" value={icp.profissao} />
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3">
            <Block label="Momento de Vida" value={icp.momentoVida} />
            <Block label="Objetivo Principal" value={icp.objetivoPrincipal} />
            <Block label="Problema Principal" value={icp.problemaPrincipal} />
          </div>
        </Section>

        <Section number="03" title="Psicografia">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Block label="Desejos" value={psicografia.desejos} />
            <Block label="Medos" value={psicografia.medos} />
            <Block label="Objeções" value={psicografia.objecoes} />
            <Block label="Frustrações" value={psicografia.frustracoes} />
            <Block label="Sonhos" value={psicografia.sonhos} />
            <Block label="Crenças" value={psicografia.crencas} />
          </div>
        </Section>

        <Section number="04" title="Concorrentes">
          {concorrentes.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Nenhum concorrente mapeado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    <th className="py-2 pr-4 font-semibold">Nome</th>
                    <th className="py-2 pr-4 font-semibold">Posicionamento</th>
                    <th className="py-2 pr-4 font-semibold">
                      Oferta Principal
                    </th>
                    <th className="py-2 pr-4 font-semibold">Ticket</th>
                    <th className="py-2 font-semibold">Canais</th>
                  </tr>
                </thead>
                <tbody>
                  {concorrentes.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-white/[0.06] last:border-0"
                    >
                      <td className="py-3 pr-4 font-semibold text-white">
                        {dash(c.nome)}
                      </td>
                      <td className="py-3 pr-4 text-zinc-300">
                        {dash(c.posicionamento)}
                      </td>
                      <td className="py-3 pr-4 text-zinc-300">
                        {dash(c.ofertaPrincipal)}
                      </td>
                      <td className="py-3 pr-4 text-zinc-300">
                        {dash(c.ticketEstimado)}
                      </td>
                      <td className="py-3 text-zinc-400">
                        <div className="flex flex-col gap-0.5 text-xs">
                          <span>{dash(c.site)}</span>
                          <span className="text-zinc-500">
                            {dash(c.instagram)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        <Section number="05" title="Oferta">
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
            <Stat label="Produto" value={oferta.produto} />
            <Stat label="Ticket" value={oferta.ticket} />
            <Stat label="Garantia" value={oferta.garantia} />
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3">
            <Block label="Transformação" value={oferta.transformacao} />
            <Block label="Diferencial" value={oferta.diferencial} />
            <Block label="Mecanismo Único" value={oferta.mecanismoUnico} />
            <Block label="Prova" value={oferta.prova} />
          </div>
        </Section>

        <Section number="06" title="Diagnóstico">
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
            <Stat
              label="Tempo de Resposta"
              value={diagnostico.tempoResposta}
            />
            <Stat label="Origem dos Leads" value={diagnostico.origemLeads} />
            <Stat label="CRM" value={diagnostico.crm} />
            <Stat label="Vendedores" value={diagnostico.vendedores} />
            <Stat label="Ticket Médio" value={diagnostico.ticketMedio} />
            <Stat
              label="Conversão Atual"
              value={diagnostico.conversaoAtual}
            />
            <Stat label="Leads por Mês" value={diagnostico.leadsMes} />
          </div>
        </Section>

        <Section number="07" title="Plano de Ação">
          <ol className="flex flex-col gap-4">
            {priorities.map((p, idx) => {
              const action = actionByScore[p.key];
              const tier = scoreTier(p.value);
              const dot =
                tier === "high"
                  ? "bg-emerald-400"
                  : tier === "mid"
                    ? "bg-amber-300"
                    : "bg-red-400";
              return (
                <li
                  key={p.key}
                  className="break-inside-avoid rounded-xl border border-white/10 bg-white/[0.02] p-5"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-zinc-950/60 text-sm font-black tabular-nums text-white">
                      P{idx + 1}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                      {p.label} · Score {p.value}/100
                    </div>
                  </div>
                  <h3 className="mt-2 text-base font-bold text-white">
                    {action?.title ?? p.description}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                    {action?.body ?? p.description}
                  </p>
                </li>
              );
            })}
          </ol>
        </Section>

        <Section number="08" title="Roadmap">
          <div className="flex flex-col gap-4">
            {phases.map((phase) => (
              <article
                key={phase.n}
                className="break-inside-avoid rounded-xl border border-white/10 bg-white/[0.02] p-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="text-base font-black uppercase tracking-tight text-white">
                    Fase {phase.n} · {phase.title}
                  </h3>
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-cyan">
                    {phase.horizon}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-400">{phase.focus}</p>
                <ul className="mt-3 grid grid-cols-1 gap-1.5 md:grid-cols-2">
                  {phase.items.map((item) => (
                    <li
                      key={item}
                      className="text-sm text-zinc-200 before:mr-2 before:text-brand-cyan before:content-['•']"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Section>

        <Section number="09" title="ROI Potencial">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Stat label="Leads por Mês" value={diagnostico.leadsMes} />
            <Stat
              label="Ticket Médio"
              value={diagnostico.ticketMedio || cliente.ticketMedio}
            />
            <Stat label="Conversão Atual" value={diagnostico.conversaoAtual} />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Receita Atual
              </div>
              <div className="mt-1 text-2xl font-black tabular-nums text-white">
                {BRL.format(receitaAtual)}
              </div>
              <div className="mt-1 text-[11px] text-zinc-500">
                {leadsN && convN && ticketN
                  ? `${leadsN} × ${(convN * 100).toFixed(1)}% × ${BRL.format(ticketN)}`
                  : "Faltam dados."}
              </div>
            </div>
            <div className="rounded-xl border border-brand-cyan/30 bg-brand-cyan/[0.05] p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                Receita Potencial
              </div>
              <div className="mt-1 text-2xl font-black tabular-nums text-white">
                {BRL.format(receitaPotencial)}
              </div>
              <div className="mt-1 text-[11px] text-zinc-400">
                {leadsN && convN && ticketN
                  ? `${leadsN} × ${(targetN * 100).toFixed(0)}% × ${BRL.format(ticketN)}`
                  : "—"}
              </div>
            </div>
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/[0.05] p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                Ganho Estimado
              </div>
              <div className="mt-1 text-2xl font-black tabular-nums text-white">
                {BRL.format(ganho)}
              </div>
              <div className="mt-1 text-[11px] text-emerald-200/80">
                {receitaAtual > 0
                  ? `+${Math.round((ganho / receitaAtual) * 100)}% sobre atual.`
                  : "—"}
              </div>
            </div>
          </div>
          <p className="mt-4 text-[11px] text-zinc-500">
            Conversão potencial = min(50%, max(conv × 2, conv + 10pp)).
            Cálculo determinístico.
          </p>
        </Section>

        <footer className="mt-12 border-t border-white/10 pt-6 text-center text-[11px] text-zinc-500">
          O6 Growth · Offer Book gerado em {today}
        </footer>
      </main>
    </>
  );
}
