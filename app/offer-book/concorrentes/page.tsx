"use client";

import { Plus, Swords, Trash2 } from "lucide-react";
import { Field } from "../_components/FormShell";
import { useOfferBook } from "../_lib/store";

export default function ConcorrentesPage() {
  const {
    state,
    addConcorrente,
    updateConcorrente,
    removeConcorrente,
    hydrated,
  } = useOfferBook();

  if (!hydrated) return null;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-brand-cyan">
            <Swords className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">
              Concorrentes
            </h1>
            <p className="mt-1 max-w-xl text-sm text-zinc-400">
              Mapeamento de players relevantes — posicionamento, oferta e
              ticket estimado.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={addConcorrente}
          className="flex items-center gap-2 rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-2 text-xs font-bold uppercase tracking-wider text-brand-cyan transition hover:bg-brand-cyan/20"
        >
          <Plus className="h-4 w-4" />
          Adicionar
        </button>
      </div>

      {state.concorrentes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-900/30 p-10 text-center">
          <p className="text-sm text-zinc-400">
            Nenhum concorrente cadastrado ainda.
          </p>
          <button
            type="button"
            onClick={addConcorrente}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/[0.08]"
          >
            <Plus className="h-4 w-4" />
            Adicionar concorrente
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {state.concorrentes.map((c, idx) => (
            <div
              key={c.id}
              className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-md bg-white/[0.06] text-[11px] font-bold text-zinc-300">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Concorrente
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeConcorrente(c.id)}
                  className="flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 transition hover:border-red-500/40 hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remover
                </button>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field
                  label="Nome"
                  value={c.nome}
                  onChange={(v) => updateConcorrente(c.id, { nome: v })}
                  full
                />
                <Field
                  label="Site"
                  value={c.site}
                  onChange={(v) => updateConcorrente(c.id, { site: v })}
                  placeholder="https://"
                />
                <Field
                  label="Instagram"
                  value={c.instagram}
                  onChange={(v) => updateConcorrente(c.id, { instagram: v })}
                  placeholder="@perfil"
                />
                <Field
                  label="Posicionamento"
                  value={c.posicionamento}
                  onChange={(v) =>
                    updateConcorrente(c.id, { posicionamento: v })
                  }
                  textarea
                  full
                />
                <Field
                  label="Oferta Principal"
                  value={c.ofertaPrincipal}
                  onChange={(v) =>
                    updateConcorrente(c.id, { ofertaPrincipal: v })
                  }
                  textarea
                  full
                />
                <Field
                  label="Ticket Estimado"
                  value={c.ticketEstimado}
                  onChange={(v) =>
                    updateConcorrente(c.id, { ticketEstimado: v })
                  }
                  placeholder="R$"
                  full
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
