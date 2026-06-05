"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { ArrowRight, ExternalLink, KanbanSquare, Trash2, X } from "lucide-react";
import { LinkOption } from "../_lib/api";
import {
  emptyMeetingInput,
  Meeting,
  MEETING_STATUS,
  MeetingInput,
  MeetingStatus,
  SLOT_DURATION_MIN,
} from "../_lib/types";

type Mode = "create" | "edit";

type Props = {
  mode: Mode;
  startsAt?: string;
  initial?: Meeting;
  onClose: () => void;
  onSubmit: (input: MeetingInput, id?: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  linkOptions: LinkOption[];
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  textarea = false,
  rows = 3,
  full = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
  rows?: number;
  full?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
        {label}
      </span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="resize-y rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20"
        />
      )}
    </label>
  );
}

function formatSlot(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const fmt = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
  return fmt.format(d);
}

export function MeetingDrawer({
  mode,
  startsAt,
  initial,
  onClose,
  onSubmit,
  onDelete,
  linkOptions,
}: Props) {
  const initialInput: MeetingInput = initial
    ? {
        prospectId: initial.prospectId,
        clienteId: initial.clienteId,
        crmLeadId: initial.crmLeadId,
        titulo: initial.titulo,
        contatoNome: initial.contatoNome,
        contatoEmail: initial.contatoEmail,
        contatoWhatsapp: initial.contatoWhatsapp,
        notes: initial.notes,
        startsAt: initial.startsAt,
        endsAt: initial.endsAt,
        durationMin: initial.durationMin,
        status: initial.status,
        calEventId: initial.calEventId,
        googleEventId: initial.googleEventId,
        meetLink: initial.meetLink,
        fathomRecordingId: initial.fathomRecordingId,
        fathomSummary: initial.fathomSummary,
      }
    : emptyMeetingInput(startsAt ?? new Date().toISOString());

  const [input, setInput] = useState<MeetingInput>(initialInput);
  const [linkChoice, setLinkChoice] = useState<string>(() => {
    if (initial?.prospectId) return `Prospect:${initial.prospectId}`;
    if (initial?.crmLeadId) return `Lead:${initial.crmLeadId}`;
    if (initial?.clienteId) return `Cliente:${initial.clienteId}`;
    return "";
  });

  useEffect(() => {
    setInput(initialInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.id, startsAt]);

  function patch(p: Partial<MeetingInput>) {
    setInput((curr) => ({ ...curr, ...p }));
  }

  function handleLinkChange(value: string) {
    setLinkChoice(value);
    if (!value) {
      patch({ prospectId: null, crmLeadId: null, clienteId: null });
      return;
    }
    const [group, id] = value.split(":");
    patch({
      prospectId: group === "Prospect" ? id : null,
      crmLeadId: group === "Lead" ? id : null,
      clienteId: group === "Cliente" ? id : null,
    });
  }

  const prospects = linkOptions.filter((o) => o.group === "Prospect");
  const leads = linkOptions.filter((o) => o.group === "Lead");
  const clientes = linkOptions.filter((o) => o.group === "Cliente");

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
              {mode === "create" ? "Nova Reunião" : "Editar Reunião"}
            </div>
            <h2 className="mt-0.5 text-base font-black uppercase tracking-tight text-white">
              {input.titulo || "Sem título"}
            </h2>
            <div className="mt-1 text-[11px] text-zinc-400 first-letter:capitalize">
              {formatSlot(input.startsAt)} · {input.durationMin} min
            </div>
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
              label="Título"
              value={input.titulo}
              onChange={(v) => patch({ titulo: v })}
              placeholder="Diagnóstico O6"
              full
            />

            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Vincular a
              </span>
              <select
                value={linkChoice}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  handleLinkChange(e.target.value)
                }
                className="rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20"
              >
                <option value="">— Nenhum —</option>
                {prospects.length > 0 && (
                  <optgroup label="Prospects">
                    {prospects.map((o) => (
                      <option key={`Prospect:${o.id}`} value={`Prospect:${o.id}`}>
                        {o.label}
                      </option>
                    ))}
                  </optgroup>
                )}
                {leads.length > 0 && (
                  <optgroup label="Leads CRM">
                    {leads.map((o) => (
                      <option key={`Lead:${o.id}`} value={`Lead:${o.id}`}>
                        {o.label}
                      </option>
                    ))}
                  </optgroup>
                )}
                {clientes.length > 0 && (
                  <optgroup label="Clientes">
                    {clientes.map((o) => (
                      <option key={`Cliente:${o.id}`} value={`Cliente:${o.id}`}>
                        {o.label}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </label>

            <Field
              label="Contato"
              value={input.contatoNome}
              onChange={(v) => patch({ contatoNome: v })}
              placeholder="Nome"
            />
            <Field
              label="E-mail"
              value={input.contatoEmail}
              onChange={(v) => patch({ contatoEmail: v })}
              placeholder="contato@empresa.com"
              type="email"
            />
            <Field
              label="WhatsApp"
              value={input.contatoWhatsapp}
              onChange={(v) => patch({ contatoWhatsapp: v })}
              placeholder="(11) 99999-0000"
              full
            />

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Status
              </span>
              <select
                value={input.status}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  patch({ status: e.target.value as MeetingStatus })
                }
                className="rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20"
              >
                {MEETING_STATUS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Duração (min)
              </span>
              <input
                type="number"
                min={15}
                max={120}
                step={15}
                value={input.durationMin}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const min = Number(e.target.value) || SLOT_DURATION_MIN;
                  const start = new Date(input.startsAt);
                  const end = new Date(start.getTime() + min * 60 * 1000);
                  patch({ durationMin: min, endsAt: end.toISOString() });
                }}
                className="rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20"
              />
            </label>

            <Field
              label="Notas"
              value={input.notes}
              onChange={(v) => patch({ notes: v })}
              placeholder="Pauta, contexto, links..."
              textarea
              rows={4}
              full
            />
          </div>

          {/* Integrações futuras — read-only no v1 */}
          <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
              Integrações (em breve)
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Após conectar Cal.com / Google Calendar / Google Meet / Fathom,
              os IDs e links aparecem aqui automaticamente.
            </p>
            {input.meetLink && (
              <a
                href={input.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-cyan hover:underline"
              >
                Abrir Google Meet <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {input.fathomSummary && (
              <div className="mt-3 text-xs text-zinc-400">
                <span className="font-bold text-zinc-300">Resumo Fathom:</span>{" "}
                {input.fathomSummary}
              </div>
            )}
          </div>

          {mode === "edit" && input.status === "Realizada" && (
            <div className="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-400/[0.05] p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">
                Reunião realizada — Próxima etapa
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                {input.crmLeadId
                  ? "Volte ao CRM e mova o lead vinculado para Proposta."
                  : input.prospectId
                    ? "Promova o prospect vinculado para o CRM."
                    : input.clienteId
                      ? "Cliente vinculado — abra o Offer Book para registrar follow-up."
                      : "Sem vínculo. Crie um lead manualmente no CRM se houver oportunidade."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {input.crmLeadId && (
                  <a
                    href="/crm"
                    className="inline-flex items-center gap-2 rounded-lg border border-brand-cyan/40 bg-brand-cyan/15 px-3 py-2 text-xs font-bold uppercase tracking-wider text-brand-cyan transition hover:bg-brand-cyan/25"
                  >
                    <KanbanSquare className="h-3.5 w-3.5" />
                    Ir para CRM
                    <ArrowRight className="h-3 w-3" />
                  </a>
                )}
                {input.prospectId && !input.crmLeadId && (
                  <a
                    href="/oportunidades"
                    className="inline-flex items-center gap-2 rounded-lg border border-brand-cyan/40 bg-brand-cyan/15 px-3 py-2 text-xs font-bold uppercase tracking-wider text-brand-cyan transition hover:bg-brand-cyan/25"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                    Ir para Oportunidades
                  </a>
                )}
                {input.clienteId && (
                  <a
                    href="/offer-book/dashboard"
                    className="inline-flex items-center gap-2 rounded-lg border border-brand-cyan/40 bg-brand-cyan/15 px-3 py-2 text-xs font-bold uppercase tracking-wider text-brand-cyan transition hover:bg-brand-cyan/25"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                    Abrir Offer Book
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            {mode === "edit" && onDelete && initial ? (
              <button
                type="button"
                onClick={() => onDelete(initial.id)}
                className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold uppercase tracking-wider text-red-300 hover:bg-red-500/20"
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
                {mode === "create" ? "Agendar" : "Salvar"}
              </button>
            </div>
          </div>
        </form>
      </aside>
    </div>
  );
}
