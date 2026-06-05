"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarPlus, KanbanSquare, Loader2, Trash2, X } from "lucide-react";
import {
  emptyProspectInput,
  PROSPECT_STATUS,
  Prospect,
  ProspectInput,
  ProspectStatus,
} from "../_lib/types";
import { promoteToCRM, updateProspect } from "../_lib/api";

type Mode = "create" | "edit" | "view";

type Props = {
  mode: Mode;
  initial?: Prospect;
  onClose: () => void;
  onSubmit: (input: ProspectInput, id?: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
        {label}
      </span>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={!readOnly ? placeholder : undefined}
        className={[
          "rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition",
          readOnly
            ? "cursor-default opacity-75"
            : "focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20",
        ].join(" ")}
      />
    </label>
  );
}

export function ProspectDrawer({ mode, initial, onClose, onSubmit, onDelete }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "schedule" | "promote">(null);

  async function handleScheduleMeeting() {
    if (!initial) return;
    setBusy("schedule");
    try {
      // Mark prospect as Reunião + redirect to /agenda with prospectId hint
      await updateProspect(initial.id, { status: "Reunião" });
      onClose();
      router.push(`/agenda?prospectId=${initial.id}&empresa=${encodeURIComponent(initial.nome)}`);
    } finally {
      setBusy(null);
    }
  }

  async function handlePromoteCRM() {
    if (!initial) return;
    setBusy("promote");
    try {
      const leadId = await promoteToCRM(initial);
      onClose();
      if (leadId) {
        router.push("/crm");
      }
    } finally {
      setBusy(null);
    }
  }

  const [input, setInput] = useState<ProspectInput>(
    initial
      ? {
          nome: initial.nome,
          site: initial.site,
          telefone: initial.telefone,
          endereco: initial.endereco,
          cidade: initial.cidade,
          estado: initial.estado,
          instagram: initial.instagram,
          googleRating: initial.googleRating,
          googleReviews: initial.googleReviews,
          categoria: initial.categoria,
          googlePlaceId: initial.googlePlaceId,
          status: initial.status,
        }
      : emptyProspectInput(),
  );

  useEffect(() => {
    setInput(
      initial
        ? {
            nome: initial.nome,
            site: initial.site,
            telefone: initial.telefone,
            endereco: initial.endereco,
            cidade: initial.cidade,
            estado: initial.estado,
            instagram: initial.instagram,
            googleRating: initial.googleRating,
            googleReviews: initial.googleReviews,
            categoria: initial.categoria,
            googlePlaceId: initial.googlePlaceId,
            status: initial.status,
          }
        : emptyProspectInput(),
    );
  }, [initial?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const patch = (p: Partial<ProspectInput>) =>
    setInput((curr) => ({ ...curr, ...p }));
  const isView = mode === "view";

  return (
    <div className="fixed inset-0 z-30 flex">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="flex-1 bg-black/60 backdrop-blur-sm"
      />
      <aside className="flex h-full w-full max-w-md flex-col border-l border-white/10 bg-zinc-950 shadow-2xl">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-cyan">
              {mode === "create"
                ? "Novo Prospect"
                : mode === "edit"
                  ? "Editar"
                  : "Visualizar"}
            </div>
            <h2 className="mt-0.5 text-base font-black uppercase tracking-tight text-white">
              {input.nome || "Sem nome"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md border border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <form
          className="flex-1 overflow-y-auto px-5 py-5"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(input, initial?.id);
          }}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Empresa"
              value={input.nome}
              onChange={(v) => patch({ nome: v })}
              placeholder="Nome da empresa"
              readOnly={isView}
            />
            <Field
              label="Site"
              value={input.site}
              onChange={(v) => patch({ site: v })}
              placeholder="https://"
              readOnly={isView}
            />
            <Field
              label="Telefone"
              value={input.telefone}
              onChange={(v) => patch({ telefone: v })}
              placeholder="(11) 9 9999-9999"
              readOnly={isView}
            />
            <Field
              label="Instagram"
              value={input.instagram}
              onChange={(v) => patch({ instagram: v })}
              placeholder="@perfil"
              readOnly={isView}
            />
            <Field
              label="Cidade"
              value={input.cidade}
              onChange={(v) => patch({ cidade: v })}
              readOnly={isView}
            />
            <Field
              label="Estado"
              value={input.estado}
              onChange={(v) => patch({ estado: v })}
              placeholder="UF"
              readOnly={isView}
            />
            <Field
              label="Categoria / Nicho"
              value={input.categoria}
              onChange={(v) => patch({ categoria: v })}
              placeholder="Ex.: Estética avançada"
              readOnly={isView}
            />
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Status
              </span>
              <select
                value={input.status}
                disabled={isView}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  patch({ status: e.target.value as ProspectStatus })
                }
                className="rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20 disabled:opacity-75"
              >
                {PROSPECT_STATUS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Nota Google
              </span>
              <input
                type="number"
                min={0}
                max={5}
                step={0.1}
                readOnly={isView}
                value={input.googleRating ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  patch({
                    googleRating: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                placeholder="4.8"
                className="rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Reviews
              </span>
              <input
                type="number"
                min={0}
                readOnly={isView}
                value={input.googleReviews ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  patch({
                    googleReviews: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                placeholder="312"
                className="rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20"
              />
            </label>
          </div>

          {mode !== "create" && initial && (
            <div className="mt-6 rounded-xl border border-brand-cyan/20 bg-brand-cyan/[0.04] p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-cyan">
                Próximas etapas
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                Avance este prospect para a próxima fase do funil.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleScheduleMeeting}
                  disabled={busy !== null}
                  className="inline-flex items-center gap-2 rounded-lg border border-brand-cyan/40 bg-brand-cyan/15 px-3 py-2 text-xs font-bold uppercase tracking-wider text-brand-cyan transition hover:bg-brand-cyan/25 disabled:opacity-40"
                >
                  {busy === "schedule" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CalendarPlus className="h-3.5 w-3.5" />
                  )}
                  Agendar Reunião
                </button>
                <button
                  type="button"
                  onClick={handlePromoteCRM}
                  disabled={busy !== null}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-200 transition hover:bg-white/[0.08] disabled:opacity-40"
                >
                  {busy === "promote" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <KanbanSquare className="h-3.5 w-3.5" />
                  )}
                  Promover para CRM
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {!isView && (
            <div className="mt-8 flex items-center justify-between gap-3">
              {mode === "edit" && onDelete && initial ? (
                <button
                  type="button"
                  onClick={() => onDelete(initial.id)}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold uppercase tracking-wider text-red-300 transition hover:bg-red-500/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Excluir
                </button>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-white/[0.04]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg border border-brand-cyan/40 bg-brand-cyan/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-cyan hover:bg-brand-cyan/25"
                >
                  {mode === "create" ? "Criar" : "Salvar"}
                </button>
              </div>
            </div>
          )}

          {isView && (
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-white/[0.04]"
              >
                Fechar
              </button>
            </div>
          )}
        </form>
      </aside>
    </div>
  );
}
