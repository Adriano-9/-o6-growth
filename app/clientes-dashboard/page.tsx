"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Users,
} from "lucide-react";
import { ClienteListItem, useOfferBook } from "@/app/offer-book/_lib/store";
import { computeScores, scoreTier } from "@/app/offer-book/_lib/scores";

function formatDate(iso: string): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function overallScore(item: ClienteListItem): number {
  const scores = computeScores(item.state);
  return Math.round(
    scores.reduce((sum, s) => sum + s.value, 0) / scores.length,
  );
}

function completionPercent(item: ClienteListItem): number {
  const s = item.state;
  // 6 seções equivalentes
  const sections = [
    // cliente — 8 campos
    [
      s.cliente.empresa, s.cliente.site, s.cliente.instagram, s.cliente.nicho,
      s.cliente.cidade, s.cliente.estado, s.cliente.ticketMedio, s.cliente.fonteLeads,
    ],
    // icp — 7 campos
    [
      s.icp.idade, s.icp.sexo, s.icp.renda, s.icp.profissao,
      s.icp.momentoVida, s.icp.objetivoPrincipal, s.icp.problemaPrincipal,
    ],
    // psicografia — 6 campos
    [
      s.psicografia.desejos, s.psicografia.medos, s.psicografia.objecoes,
      s.psicografia.frustracoes, s.psicografia.sonhos, s.psicografia.crencas,
    ],
    // oferta — 7 campos
    [
      s.oferta.produto, s.oferta.ticket, s.oferta.garantia, s.oferta.transformacao,
      s.oferta.diferencial, s.oferta.mecanismoUnico, s.oferta.prova,
    ],
    // diagnostico — 7 campos
    [
      s.diagnostico.tempoResposta, s.diagnostico.origemLeads, s.diagnostico.crm,
      s.diagnostico.vendedores, s.diagnostico.ticketMedio, s.diagnostico.conversaoAtual,
      s.diagnostico.leadsMes,
    ],
  ];
  const sectionPercents = sections.map(
    (fields) => fields.filter((v) => v && v.trim()).length / fields.length,
  );
  // 6ª "seção": concorrentes — pelo menos 1 mapeado conta
  sectionPercents.push(s.concorrentes.length > 0 ? 1 : 0);
  const avg = sectionPercents.reduce((a, b) => a + b, 0) / sectionPercents.length;
  return Math.round(avg * 100);
}

function ProgressBadge({ value }: { value: number }) {
  const color =
    value >= 90
      ? "bg-emerald-400"
      : value >= 60
        ? "bg-brand-cyan"
        : value >= 30
          ? "bg-amber-300"
          : "bg-red-400";
  return (
    <div className="flex flex-col gap-1 min-w-24">
      <div className="text-[10px] font-bold tabular-nums text-zinc-400">
        {value}%
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div className={`h-full ${color} transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ScoreBadge({ value }: { value: number }) {
  const tier = scoreTier(value);
  const cls =
    tier === "high"
      ? "border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-200"
      : tier === "mid"
        ? "border-amber-300/30 bg-amber-300/[0.08] text-amber-200"
        : "border-red-500/30 bg-red-500/[0.08] text-red-200";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-bold tabular-nums ${cls}`}
    >
      {value}/100
    </span>
  );
}

export default function ClientesDashboardPage() {
  const router = useRouter();
  const { createCliente, selectCliente, deleteCliente, listClientes, hydrated } =
    useOfferBook();
  const [items, setItems] = useState<ClienteListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listClientes();
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, [listClientes]);

  useEffect(() => {
    if (!hydrated) return;
    refresh();
  }, [hydrated, refresh]);

  async function handleCreate() {
    setBusy(true);
    try {
      const id = await createCliente({ empresa: "Novo cliente" });
      if (id) router.push("/offer-book/clientes");
    } finally {
      setBusy(false);
    }
  }

  async function handleOpen(id: string) {
    setBusy(true);
    try {
      await selectCliente(id);
      router.push("/offer-book/dashboard");
    } finally {
      setBusy(false);
    }
  }

  async function handleEdit(id: string) {
    setBusy(true);
    try {
      await selectCliente(id);
      router.push("/offer-book/clientes");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string, empresa: string) {
    if (
      !window.confirm(
        `Excluir "${empresa || "cliente sem nome"}"? Isso remove cliente, diagnóstico e offer book deste registro.`,
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      await deleteCliente(id);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-brand-cyan">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-cyan">
              O6 / Clientes
            </div>
            <h1 className="mt-1 text-3xl font-black uppercase tracking-tight text-white">
              Dashboard de Clientes
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-zinc-400">
              Todos os offer books salvos. Visualize, edite ou exclua. Os dados
              são persistidos automaticamente no Supabase.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refresh}
            disabled={loading || busy}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-200 transition hover:bg-white/[0.08] disabled:opacity-40"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg border border-brand-cyan/40 bg-brand-cyan/15 px-3 py-2 text-xs font-bold uppercase tracking-wider text-brand-cyan transition hover:bg-brand-cyan/25 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            Novo Cliente
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-zinc-900/40">
        {loading ? (
          <div className="grid place-items-center px-6 py-16 text-sm text-zinc-500">
            Carregando…
          </div>
        ) : items.length === 0 ? (
          <div className="grid place-items-center px-6 py-16 text-center">
            <p className="text-sm text-zinc-400">
              Nenhum cliente cadastrado ainda.
            </p>
            <button
              type="button"
              onClick={handleCreate}
              disabled={busy}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-brand-cyan/40 bg-brand-cyan/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-cyan transition hover:bg-brand-cyan/25 disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
              Criar primeiro cliente
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  <th className="px-5 py-3 font-semibold">Empresa</th>
                  <th className="px-5 py-3 font-semibold">Nicho</th>
                  <th className="px-5 py-3 font-semibold">Cidade</th>
                  <th className="px-5 py-3 font-semibold">Score Geral</th>
                  <th className="px-5 py-3 font-semibold">Offer Book</th>
                  <th className="px-5 py-3 font-semibold">Atualizado</th>
                  <th className="px-5 py-3 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const score = overallScore(item);
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-white/[0.06] last:border-0 transition hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleOpen(item.id)}
                          className="text-left font-semibold text-white hover:text-brand-cyan"
                        >
                          {item.empresa || "Cliente sem nome"}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-zinc-300">
                        {item.nicho || "—"}
                      </td>
                      <td className="px-5 py-4 text-zinc-300">
                        {[item.cidade, item.estado].filter(Boolean).join("/") ||
                          "—"}
                      </td>
                      <td className="px-5 py-4">
                        <ScoreBadge value={score} />
                      </td>
                      <td className="px-5 py-4">
                        <ProgressBadge value={completionPercent(item)} />
                      </td>
                      <td className="px-5 py-4 text-zinc-400 tabular-nums">
                        {formatDate(item.updatedAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpen(item.id)}
                            disabled={busy}
                            title="Visualizar"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-zinc-300 transition hover:border-brand-cyan/40 hover:bg-brand-cyan/10 hover:text-brand-cyan disabled:opacity-40"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(item.id)}
                            disabled={busy}
                            title="Editar"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-zinc-300 transition hover:border-amber-300/40 hover:bg-amber-300/10 hover:text-amber-200 disabled:opacity-40"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.empresa)}
                            disabled={busy}
                            title="Excluir"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-zinc-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-40"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs text-zinc-500">
          Score geral = média dos 4 indicadores do diagnóstico (velocidade,
          oferta, aquisição, conversão).
        </p>
        <Link
          href="/offer-book"
          className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-brand-cyan"
        >
          Ir para o Offer Book
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
