"use client";

import { ChangeEvent, useCallback, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { batchCreateProspects } from "../_lib/api";
import { PlaceResult, ProspectInput } from "../_lib/types";

// ─────────────────────────────────────────────────────────────
// State machine
// ─────────────────────────────────────────────────────────────

type Phase =
  | { name: "idle" }
  | { name: "searching"; query: string }
  | { name: "preview"; results: PlaceResult[] }
  | { name: "importing"; done: number; total: number }
  | { name: "done"; imported: number; skipped: number; errors: number }
  | { name: "error"; message: string };

const LIMIT_OPTIONS = [10, 20, 50, 100] as const;

// ─────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────

function placeToInput(p: PlaceResult): ProspectInput {
  return {
    nome: p.nome,
    site: p.site,
    telefone: p.telefone,
    endereco: p.endereco,
    instagram: p.instagram,
    cidade: p.cidade,
    estado: p.estado,
    googleRating: p.googleRating,
    googleReviews: p.googleReviews,
    categoria: p.categoria,
    googlePlaceId: p.googlePlaceId,
    status: "Novo",
  };
}

// ─────────────────────────────────────────────────────────────
// Progress bar
// ─────────────────────────────────────────────────────────────

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full bg-brand-cyan transition-all duration-300"
        style={{ width: `${Math.min(100, pct)}%` }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Preview table row
// ─────────────────────────────────────────────────────────────

function PreviewRow({ place }: { place: PlaceResult }) {
  return (
    <tr className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02]">
      <td className="px-4 py-2 text-sm font-medium text-white">
        {place.nome || "—"}
      </td>
      <td className="px-4 py-2 text-xs text-zinc-400">
        {[place.cidade, place.estado].filter(Boolean).join("/") || "—"}
      </td>
      <td className="px-4 py-2 text-xs text-zinc-400">
        {place.categoria || "—"}
      </td>
      <td className="px-4 py-2 text-xs tabular-nums text-zinc-300">
        {place.googleRating != null ? (
          <span className="text-amber-300">★ {place.googleRating.toFixed(1)}</span>
        ) : (
          "—"
        )}
        {place.googleReviews != null && (
          <span className="ml-1 text-zinc-500">
            · {place.googleReviews.toLocaleString("pt-BR")}
          </span>
        )}
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

type Props = {
  onClose: () => void;
  onDone: () => void; // called after import to refresh parent list
};

export function CaptureModal({ onClose, onDone }: Props) {
  const [nicho, setNicho] = useState("");
  const [cidade, setCidade] = useState("");
  const [limit, setLimit] = useState<(typeof LIMIT_OPTIONS)[number]>(50);
  const [phase, setPhase] = useState<Phase>({ name: "idle" });

  const handleSearch = useCallback(async () => {
    if (!nicho.trim() || !cidade.trim()) return;

    setPhase({ name: "searching", query: `${nicho} ${cidade}` });

    try {
      const res = await fetch("/api/apify-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: nicho.trim(), cidade: cidade.trim(), limit }),
      });

      const data = await res.json() as {
        results?: PlaceResult[];
        error?: string;
        setup?: string;
      };

      if (!res.ok) {
        setPhase({
          name: "error",
          message: data.error ?? `Erro ${res.status}`,
        });
        return;
      }

      setPhase({ name: "preview", results: data.results ?? [] });
    } catch (err) {
      setPhase({
        name: "error",
        message: err instanceof Error ? err.message : "Erro de rede",
      });
    }
  }, [nicho, cidade, limit]);

  const handleImport = useCallback(async () => {
    if (phase.name !== "preview") return;
    const results = phase.results;
    if (results.length === 0) return;

    const inputs: ProspectInput[] = results.map(placeToInput);
    setPhase({ name: "importing", done: 0, total: inputs.length });

    const result = await batchCreateProspects(inputs, (done, total) => {
      setPhase({ name: "importing", done, total });
    });

    setPhase({ name: "done", ...result });
    onDone();
  }, [phase, onDone]);

  const isLoading =
    phase.name === "searching" || phase.name === "importing";

  return (
    <div className="fixed inset-0 z-30 flex items-start justify-center overflow-y-auto pt-16 pb-10">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Fechar"
      />

      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-brand-cyan">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-cyan">
                Captura Automática
              </div>
              <h2 className="text-base font-black uppercase tracking-tight text-white">
                Buscar via Apify
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="grid h-8 w-8 place-items-center rounded-md border border-white/10 text-zinc-400 hover:text-white disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Form */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5 sm:col-span-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Nicho / Categoria
              </span>
              <input
                type="text"
                value={nicho}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNicho(e.target.value)
                }
                placeholder="Clínica de Estética"
                disabled={isLoading}
                className="rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20 disabled:opacity-50"
              />
            </label>

            <label className="flex flex-col gap-1.5 sm:col-span-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Cidade
              </span>
              <input
                type="text"
                value={cidade}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setCidade(e.target.value)
                }
                placeholder="Salvador"
                disabled={isLoading}
                className="rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20 disabled:opacity-50"
              />
            </label>

            <label className="flex flex-col gap-1.5 sm:col-span-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Quantidade
              </span>
              <select
                value={limit}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setLimit(Number(e.target.value) as (typeof LIMIT_OPTIONS)[number])
                }
                disabled={isLoading}
                className="rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20 disabled:opacity-50"
              >
                {LIMIT_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n} empresas
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Note */}
          <p className="mt-2 text-[11px] text-zinc-500">
            Instagram não é retornado pelo Google Maps — pode ser preenchido manualmente depois.
          </p>

          {/* ── Phase: searching ── */}
          {phase.name === "searching" && (
            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-brand-cyan" />
                <div>
                  <div className="text-sm font-semibold text-white">
                    Buscando...
                  </div>
                  <div className="text-xs text-zinc-400">
                    {phase.query} — até {limit} empresas
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Phase: preview ── */}
          {phase.name === "preview" && (
            <div className="mt-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold text-white">
                  {phase.results.length} empresas encontradas
                </div>
                <div className="text-[11px] text-zinc-500">
                  Duplicatas serão ignoradas automaticamente
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-zinc-950/50">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                      <th className="px-4 py-2 font-semibold">Empresa</th>
                      <th className="px-4 py-2 font-semibold">Cidade</th>
                      <th className="px-4 py-2 font-semibold">Categoria</th>
                      <th className="px-4 py-2 font-semibold">Nota Google</th>
                    </tr>
                  </thead>
                  <tbody>
                    {phase.results.map((r, i) => (
                      <PreviewRow key={r.googlePlaceId || i} place={r} />
                    ))}
                  </tbody>
                </table>
              </div>

              {phase.results.length === 0 && (
                <p className="mt-3 text-center text-sm text-zinc-500">
                  Nenhuma empresa encontrada. Tente outro nicho ou cidade.
                </p>
              )}
            </div>
          )}

          {/* ── Phase: importing ── */}
          {phase.name === "importing" && (
            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <div className="mb-3 flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-brand-cyan" />
                <div>
                  <div className="text-sm font-semibold text-white">
                    Importando...
                  </div>
                  <div className="text-xs text-zinc-400">
                    {phase.done} de {phase.total} empresas
                  </div>
                </div>
              </div>
              <ProgressBar
                pct={phase.total > 0 ? (phase.done / phase.total) * 100 : 0}
              />
            </div>
          )}

          {/* ── Phase: done ── */}
          {phase.name === "done" && (
            <div className="mt-5 rounded-xl border border-emerald-400/30 bg-emerald-400/[0.05] p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <div>
                  <div className="text-sm font-bold text-emerald-200">
                    Concluído
                  </div>
                  <div className="mt-1 text-sm text-zinc-300">
                    <span className="font-bold text-white">
                      {phase.imported}
                    </span>{" "}
                    {phase.imported === 1 ? "empresa importada" : "empresas importadas"}
                    {phase.skipped > 0 && (
                      <span className="ml-2 text-zinc-400">
                        · {phase.skipped} já existiam (ignoradas)
                      </span>
                    )}
                    {phase.errors > 0 && (
                      <span className="ml-2 text-red-400">
                        · {phase.errors} erros
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Phase: error ── */}
          {phase.name === "error" && (
            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/[0.05] p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                <div>
                  <div className="text-sm font-bold text-red-300">
                    Erro na busca
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">
                    {phase.message}
                  </div>
                  {phase.message.includes("APIFY_TOKEN") && (
                    <div className="mt-2 text-xs text-zinc-400">
                      Adicione{" "}
                      <code className="rounded bg-white/10 px-1 py-0.5 text-zinc-200">
                        APIFY_TOKEN=sua_key
                      </code>{" "}
                      em{" "}
                      <code className="rounded bg-white/10 px-1 py-0.5 text-zinc-200">
                        .env.local
                      </code>{" "}
                      e reinicie o servidor. Obtenha em apify.com/settings/integrations.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-white/[0.04] disabled:opacity-40"
          >
            {phase.name === "done" ? "Fechar" : "Cancelar"}
          </button>

          <div className="flex items-center gap-2">
            {/* Search button — visible when idle or after error */}
            {(phase.name === "idle" ||
              phase.name === "error" ||
              phase.name === "done") && (
              <button
                type="button"
                onClick={() => {
                  setPhase({ name: "idle" });
                  handleSearch();
                }}
                disabled={!nicho.trim() || !cidade.trim()}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-200 hover:bg-white/[0.08] disabled:opacity-40"
              >
                <Search className="h-3.5 w-3.5" />
                {phase.name === "done" ? "Nova busca" : "Buscar Empresas"}
              </button>
            )}

            {/* Import button — visible on preview */}
            {phase.name === "preview" && phase.results.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setPhase({ name: "idle" })}
                  className="rounded-lg border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-white/[0.04]"
                >
                  Refazer
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  className="inline-flex items-center gap-2 rounded-lg border border-brand-cyan/40 bg-brand-cyan/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-cyan hover:bg-brand-cyan/25"
                >
                  Importar {phase.results.length} empresas
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
