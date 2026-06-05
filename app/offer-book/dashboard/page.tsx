"use client";

import Link from "next/link";
import {
  Brain,
  Building2,
  ExternalLink,
  LayoutDashboard,
  Package,
  Stethoscope,
  Swords,
  Target,
} from "lucide-react";
import { ScoreCard } from "../_components/ScoreCard";
import { computeScores } from "../_lib/scores";
import { useOfferBook } from "../_lib/store";

function dash(v: string) {
  return v && v.trim().length > 0 ? v : "—";
}

function Card({
  title,
  icon,
  href,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md border border-white/10 bg-white/[0.03] text-brand-cyan">
            {icon}
          </div>
          <h2 className="text-sm font-black uppercase tracking-[0.14em] text-white">
            {title}
          </h2>
        </div>
        <Link
          href={href}
          className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 transition hover:text-brand-cyan"
        >
          Editar
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </div>
      <div className="text-sm text-zinc-100">{dash(value)}</div>
    </div>
  );
}

function Block({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </div>
      <div className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-zinc-200">
        {dash(value)}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { state, hydrated } = useOfferBook();
  if (!hydrated) return null;

  const { cliente, icp, psicografia, oferta, concorrentes, diagnostico } = state;
  const scores = computeScores(state);

  const filledCount = [
    Object.values(cliente).some(Boolean),
    Object.values(icp).some(Boolean),
    Object.values(psicografia).some(Boolean),
    Object.values(oferta).some(Boolean),
    concorrentes.length > 0,
    Object.values(diagnostico).some(Boolean),
  ].filter(Boolean).length;

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-10 flex items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-brand-cyan">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-cyan">
              Síntese Executiva
            </div>
            <h1 className="mt-1 text-3xl font-black uppercase tracking-tight text-white">
              {dash(cliente.empresa)}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              {dash(cliente.nicho)} · {dash(cliente.cidade)}
              {cliente.estado ? `/${cliente.estado}` : ""}
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-right">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Módulos preenchidos
            </div>
            <div className="text-2xl font-black text-white">
              {filledCount}
              <span className="text-base text-zinc-500">/6</span>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-right">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Concorrentes
            </div>
            <div className="text-2xl font-black text-white">
              {concorrentes.length}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Indicadores
          </span>
          <span className="h-px flex-1 bg-white/[0.06]" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {scores.map((s) => (
            <ScoreCard
              key={s.key}
              label={s.label}
              description={s.description}
              value={s.value}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card
          title="Cliente"
          icon={<Building2 className="h-4 w-4" />}
          href="/offer-book/clientes"
        >
          <div className="grid grid-cols-2 gap-4">
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
            <div className="col-span-2">
              <Stat label="Fonte de Leads" value={cliente.fonteLeads} />
            </div>
          </div>
        </Card>

        <Card
          title="ICP"
          icon={<Target className="h-4 w-4" />}
          href="/offer-book/icp"
        >
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Idade" value={icp.idade} />
            <Stat label="Sexo" value={icp.sexo} />
            <Stat label="Renda" value={icp.renda} />
            <Stat label="Profissão" value={icp.profissao} />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3">
            <Block label="Momento de Vida" value={icp.momentoVida} />
            <Block label="Objetivo Principal" value={icp.objetivoPrincipal} />
            <Block label="Problema Principal" value={icp.problemaPrincipal} />
          </div>
        </Card>

        <Card
          title="Psicografia"
          icon={<Brain className="h-4 w-4" />}
          href="/offer-book/psicografia"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Block label="Desejos" value={psicografia.desejos} />
            <Block label="Medos" value={psicografia.medos} />
            <Block label="Objeções" value={psicografia.objecoes} />
            <Block label="Frustrações" value={psicografia.frustracoes} />
            <Block label="Sonhos" value={psicografia.sonhos} />
            <Block label="Crenças" value={psicografia.crencas} />
          </div>
        </Card>

        <Card
          title="Oferta"
          icon={<Package className="h-4 w-4" />}
          href="/offer-book/oferta"
        >
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Produto" value={oferta.produto} />
            <Stat label="Ticket" value={oferta.ticket} />
            <div className="col-span-2">
              <Stat label="Garantia" value={oferta.garantia} />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3">
            <Block label="Transformação" value={oferta.transformacao} />
            <Block label="Diferencial" value={oferta.diferencial} />
            <Block label="Mecanismo Único" value={oferta.mecanismoUnico} />
            <Block label="Prova" value={oferta.prova} />
          </div>
        </Card>

        <div className="lg:col-span-2">
          <Card
            title="Diagnóstico"
            icon={<Stethoscope className="h-4 w-4" />}
            href="/offer-book/diagnostico"
          >
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
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
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card
            title="Concorrentes"
            icon={<Swords className="h-4 w-4" />}
            href="/offer-book/concorrentes"
          >
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
                      <th className="py-2 pr-4 font-semibold">
                        Posicionamento
                      </th>
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
          </Card>
        </div>
      </div>
    </div>
  );
}
