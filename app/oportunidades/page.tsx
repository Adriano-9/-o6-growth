"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpDown,
  Download,
  Eye,
  ExternalLink,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  createProspect,
  deleteProspect,
  listCategorias,
  listCidades,
  listProspects,
  updateProspect,
} from "./_lib/api";
import {
  Prospect,
  PROSPECT_STATUS,
  ProspectInput,
  ProspectStatus,
} from "./_lib/types";
import { StatusBadge } from "./_components/StatusBadge";
import { RatingBadge } from "./_components/RatingBadge";
import { ProspectDrawer } from "./_components/ProspectDrawer";
import { CaptureModal } from "./_components/CaptureModal";

// ─────────────────────────────────────────────────────────────
// KPI tile
// ─────────────────────────────────────────────────────────────
function KPITile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: "info" | "good" | "warn";
}) {
  const cls =
    accent === "good"
      ? "border-emerald-400/30 bg-emerald-400/[0.04]"
      : accent === "info"
        ? "border-brand-cyan/30 bg-brand-cyan/[0.04]"
        : accent === "warn"
          ? "border-amber-300/30 bg-amber-300/[0.04]"
          : "border-white/10 bg-zinc-900/40";
  return (
    <div className={`rounded-xl border ${cls} px-5 py-4`}>
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </div>
      <div className="mt-1.5 text-2xl font-black tabular-nums text-white">
        {value}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
type DrawerState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; prospect: Prospect }
  | { mode: "view"; prospect: Prospect };

export default function OportunidadesPage() {
  const [all, setAll] = useState<Prospect[]>([]);
  const [cidades, setCidades] = useState<string[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState<DrawerState>({ mode: "closed" });
  const [showCapture, setShowCapture] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ProspectStatus | "Todos">(
    "Todos",
  );
  const [filterCidade, setFilterCidade] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("");
  const [orderBy, setOrderBy] = useState<
    "google_rating" | "google_reviews" | "created_at"
  >("created_at");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [data, cs, cats] = await Promise.all([
        listProspects({ orderBy }),
        listCidades(),
        listCategorias(),
      ]);
      setAll(data);
      setCidades(cs);
      setCategorias(cats);
    } finally {
      setLoading(false);
    }
  }, [orderBy]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Client-side filtering
  const filtered = useMemo(() => {
    let rows = all;
    if (filterStatus !== "Todos") {
      rows = rows.filter((p) => p.status === filterStatus);
    }
    if (filterCidade) {
      rows = rows.filter((p) => p.cidade === filterCidade);
    }
    if (filterCategoria) {
      rows = rows.filter((p) => p.categoria === filterCategoria);
    }
    if (search.trim()) {
      const term = search.toLowerCase();
      rows = rows.filter(
        (p) =>
          p.nome.toLowerCase().includes(term) ||
          p.site.toLowerCase().includes(term) ||
          p.cidade.toLowerCase().includes(term) ||
          p.categoria.toLowerCase().includes(term),
      );
    }
    return rows;
  }, [all, filterStatus, filterCidade, filterCategoria, search]);

  // KPIs
  const kpis = useMemo(() => {
    const count = (s: ProspectStatus) =>
      all.filter((p) => p.status === s).length;
    return {
      total: all.length,
      novos: count("Novo"),
      auditados: count("Auditado"),
      contato: count("Contato Enviado"),
      reuniao: count("Reunião"),
    };
  }, [all]);

  async function handleSubmit(input: ProspectInput, id?: string) {
    if (id) {
      await updateProspect(id, input);
    } else {
      await createProspect(input);
    }
    setDrawer({ mode: "closed" });
    await refresh();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Excluir este prospect?")) return;
    await deleteProspect(id);
    setDrawer({ mode: "closed" });
    await refresh();
  }

  function formatDate(iso: string) {
    if (!iso) return "—";
    try {
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      }).format(new Date(iso));
    } catch {
      return "—";
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-cyan">
            O6 / Prospecção
          </div>
          <h1 className="mt-1 text-3xl font-black uppercase tracking-tight text-white">
            Oportunidades
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Empresas em fase de qualificação fria. Capture, audite e converta em
            leads no CRM.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-200 hover:bg-white/[0.08] disabled:opacity-40"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
          <button
            type="button"
            onClick={() => setShowCapture(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-200 hover:bg-white/[0.08]"
          >
            <Download className="h-4 w-4" />
            Buscar Empresas
          </button>
          <button
            type="button"
            onClick={() => setDrawer({ mode: "create" })}
            className="inline-flex items-center gap-2 rounded-lg border border-brand-cyan/40 bg-brand-cyan/15 px-3 py-2 text-xs font-bold uppercase tracking-wider text-brand-cyan hover:bg-brand-cyan/25"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <KPITile label="Total" value={kpis.total} />
        <KPITile label="Novos" value={kpis.novos} />
        <KPITile label="Auditados" value={kpis.auditados} accent="info" />
        <KPITile label="Contato Enviado" value={kpis.contato} accent="warn" />
        <KPITile label="Reuniões" value={kpis.reuniao} accent="good" />
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar empresa, site, cidade..."
            className="w-full rounded-lg border border-white/10 bg-zinc-900/60 py-2 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-brand-cyan/60"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(e.target.value as ProspectStatus | "Todos")
          }
          className="rounded-lg border border-white/10 bg-zinc-900/60 px-3 py-2 text-sm text-white outline-none focus:border-brand-cyan/60"
        >
          <option value="Todos">Todos os status</option>
          {PROSPECT_STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={filterCidade}
          onChange={(e) => setFilterCidade(e.target.value)}
          className="rounded-lg border border-white/10 bg-zinc-900/60 px-3 py-2 text-sm text-white outline-none focus:border-brand-cyan/60"
        >
          <option value="">Todas as cidades</option>
          {cidades.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={filterCategoria}
          onChange={(e) => setFilterCategoria(e.target.value)}
          className="rounded-lg border border-white/10 bg-zinc-900/60 px-3 py-2 text-sm text-white outline-none focus:border-brand-cyan/60"
        >
          <option value="">Todas as categorias</option>
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-zinc-500" />
          <select
            value={orderBy}
            onChange={(e) =>
              setOrderBy(
                e.target.value as
                  | "google_rating"
                  | "google_reviews"
                  | "created_at",
              )
            }
            className="rounded-lg border border-white/10 bg-zinc-900/60 px-3 py-2 text-sm text-white outline-none focus:border-brand-cyan/60"
          >
            <option value="created_at">Mais recente</option>
            <option value="google_rating">Nota Google ↓</option>
            <option value="google_reviews">Reviews ↓</option>
          </select>
        </div>

        {(search || filterStatus !== "Todos" || filterCidade || filterCategoria) && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setFilterStatus("Todos");
              setFilterCidade("");
              setFilterCategoria("");
            }}
            className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white"
          >
            <X className="h-3 w-3" />
            Limpar
          </button>
        )}
      </div>

      <p className="mb-3 text-xs text-zinc-500">
        {filtered.length} {filtered.length === 1 ? "prospect" : "prospects"}{" "}
        {filtered.length !== all.length ? `(de ${all.length} total)` : ""}
      </p>

      {/* Table */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/40">
        {loading ? (
          <div className="grid place-items-center py-16 text-sm text-zinc-500">
            Carregando…
          </div>
        ) : filtered.length === 0 ? (
          <div className="grid place-items-center py-16 text-center">
            <p className="text-sm text-zinc-400">
              {all.length === 0
                ? "Nenhum prospect cadastrado."
                : "Nenhum prospect com esses filtros."}
            </p>
            {all.length === 0 && (
              <button
                type="button"
                onClick={() => setDrawer({ mode: "create" })}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-brand-cyan/40 bg-brand-cyan/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-cyan hover:bg-brand-cyan/25"
              >
                <Plus className="h-4 w-4" />
                Adicionar primeiro prospect
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  <th className="px-5 py-3 font-semibold">Empresa</th>
                  <th className="px-5 py-3 font-semibold">Cidade</th>
                  <th className="px-5 py-3 font-semibold">Categoria</th>
                  <th className="px-5 py-3 font-semibold">Site</th>
                  <th className="px-5 py-3 font-semibold">Nota Google</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Criado</th>
                  <th className="px-5 py-3 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        onClick={() => setDrawer({ mode: "view", prospect: p })}
                        className="text-left font-semibold text-white hover:text-brand-cyan"
                      >
                        {p.nome || "Sem nome"}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-zinc-300">
                      {p.cidade
                        ? [p.cidade, p.estado].filter(Boolean).join("/")
                        : "—"}
                    </td>
                    <td className="px-5 py-3 text-zinc-400">
                      {p.categoria || "—"}
                    </td>
                    <td className="px-5 py-3">
                      {p.site ? (
                        <a
                          href={
                            p.site.startsWith("http")
                              ? p.site
                              : `https://${p.site}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-brand-cyan hover:underline"
                        >
                          {p.site.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-zinc-500">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <RatingBadge
                        rating={p.googleRating}
                        reviews={p.googleReviews}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-5 py-3 tabular-nums text-zinc-500">
                      {formatDate(p.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          title="Visualizar"
                          onClick={() =>
                            setDrawer({ mode: "view", prospect: p })
                          }
                          className="grid h-7 w-7 place-items-center rounded-md border border-white/10 text-zinc-300 hover:border-brand-cyan/40 hover:bg-brand-cyan/10 hover:text-brand-cyan"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Editar"
                          onClick={() =>
                            setDrawer({ mode: "edit", prospect: p })
                          }
                          className="grid h-7 w-7 place-items-center rounded-md border border-white/10 text-zinc-300 hover:border-amber-300/40 hover:bg-amber-300/10 hover:text-amber-200"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Excluir"
                          onClick={() => handleDelete(p.id)}
                          className="grid h-7 w-7 place-items-center rounded-md border border-white/10 text-zinc-300 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawers */}
      {drawer.mode === "create" && (
        <ProspectDrawer
          mode="create"
          onClose={() => setDrawer({ mode: "closed" })}
          onSubmit={handleSubmit}
        />
      )}
      {drawer.mode === "edit" && (
        <ProspectDrawer
          mode="edit"
          initial={drawer.prospect}
          onClose={() => setDrawer({ mode: "closed" })}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
        />
      )}
      {drawer.mode === "view" && (
        <ProspectDrawer
          mode="view"
          initial={drawer.prospect}
          onClose={() => setDrawer({ mode: "closed" })}
          onSubmit={handleSubmit}
        />
      )}

      {/* Capture modal — Serper.dev integration */}
      {showCapture && (
        <CaptureModal
          onClose={() => setShowCapture(false)}
          onDone={refresh}
        />
      )}
    </div>
  );
}
