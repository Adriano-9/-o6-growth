"use client";

import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  DollarSign,
  Handshake,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  ClienteOption,
  convertToCliente,
  createLead,
  deleteLead,
  listClienteOptions,
  listLeads,
  moveLead,
  updateLead,
} from "./_lib/api";
import {
  emptyLeadInput,
  Lead,
  LeadInput,
  STAGES,
  Stage,
} from "./_lib/types";

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const stageTone: Record<Stage, string> = {
  "Novo Lead": "border-zinc-500/40 text-zinc-300",
  "Contato Feito": "border-sky-400/40 text-sky-300",
  "Diagnóstico Agendado": "border-amber-300/40 text-amber-200",
  "Diagnóstico Entregue": "border-brand-cyan/40 text-brand-cyan",
  Proposta: "border-orange-400/40 text-orange-300",
  Fechado: "border-emerald-400/40 text-emerald-300",
  Perdido: "border-red-500/40 text-red-300",
};

function scoreTone(value: number): string {
  if (value >= 70) return "bg-emerald-400/15 text-emerald-200";
  if (value >= 40) return "bg-amber-300/15 text-amber-200";
  return "bg-red-500/15 text-red-200";
}

function formatDate(iso: string): string {
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

// ─────────────────────────────────────────────────────────────
// KPI tile
// ─────────────────────────────────────────────────────────────

function KPITile({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: "good" | "info";
}) {
  const cls =
    accent === "good"
      ? "border-emerald-400/30 bg-emerald-400/[0.04]"
      : accent === "info"
        ? "border-brand-cyan/30 bg-brand-cyan/[0.04]"
        : "border-white/10 bg-zinc-900/40";
  return (
    <div className={`rounded-xl border ${cls} p-4`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
          {label}
        </span>
        <span className="grid h-7 w-7 place-items-center rounded-md border border-white/10 bg-white/[0.03] text-brand-cyan">
          {icon}
        </span>
      </div>
      <div className="mt-2 text-2xl font-black tabular-nums text-white">
        {value}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Lead card
// ─────────────────────────────────────────────────────────────

function LeadCard({
  lead,
  onOpen,
  onDragStart,
  onDragEnd,
  dragging,
}: {
  lead: Lead;
  onOpen: () => void;
  onDragStart: (e: React.DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
  dragging: boolean;
}) {
  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      className={[
        "cursor-grab rounded-lg border border-white/10 bg-zinc-900/70 p-3 transition active:cursor-grabbing",
        dragging ? "opacity-40" : "hover:border-brand-cyan/40 hover:bg-zinc-900",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-white">
            {lead.empresa || "Sem empresa"}
          </div>
          <div className="truncate text-xs text-zinc-400">
            {lead.nome || "—"}
          </div>
        </div>
        <span
          className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold tabular-nums ${scoreTone(lead.score)}`}
        >
          {lead.score}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-400">
        {lead.nicho ? <span>{lead.nicho}</span> : null}
        {lead.cidade ? <span>· {lead.cidade}</span> : null}
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500">
        <div className="flex items-center gap-2">
          {lead.whatsapp ? <span>{lead.whatsapp}</span> : null}
          {lead.email ? <span className="truncate">· {lead.email}</span> : null}
        </div>
        <span className="tabular-nums">{formatDate(lead.data)}</span>
      </div>

      {lead.valor > 0 ? (
        <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
          {BRL.format(lead.valor)}
        </div>
      ) : null}
    </article>
  );
}

// ─────────────────────────────────────────────────────────────
// Kanban column
// ─────────────────────────────────────────────────────────────

function KanbanColumn({
  stage,
  leads,
  onCreate,
  onOpen,
  onDragStart,
  onDragEnd,
  onDrop,
  draggingId,
  isDragOver,
  onDragOver,
  onDragLeave,
}: {
  stage: Stage;
  leads: Lead[];
  onCreate: (stage: Stage) => void;
  onOpen: (lead: Lead) => void;
  onDragStart: (lead: Lead, e: React.DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
  onDrop: (stage: Stage) => void;
  draggingId: string | null;
  isDragOver: boolean;
  onDragOver: (stage: Stage, e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
}) {
  return (
    <section className="flex w-72 shrink-0 flex-col">
      <header className="mb-3 flex items-center justify-between rounded-t-lg border-b border-white/10 px-1 pb-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex h-5 items-center rounded-md border bg-white/[0.02] px-2 text-[10px] font-bold uppercase tracking-wider ${stageTone[stage]}`}
          >
            {stage}
          </span>
          <span className="text-[11px] font-semibold tabular-nums text-zinc-500">
            {leads.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onCreate(stage)}
          title="Novo lead nesta etapa"
          className="grid h-6 w-6 place-items-center rounded-md border border-white/10 text-zinc-400 transition hover:border-brand-cyan/40 hover:bg-brand-cyan/10 hover:text-brand-cyan"
        >
          <Plus className="h-3 w-3" />
        </button>
      </header>

      <div
        onDragOver={(e) => onDragOver(stage, e)}
        onDragLeave={onDragLeave}
        onDrop={() => onDrop(stage)}
        className={[
          "flex min-h-[200px] flex-1 flex-col gap-2 rounded-lg border p-2 transition",
          isDragOver
            ? "border-brand-cyan/50 bg-brand-cyan/[0.04]"
            : "border-dashed border-white/[0.08] bg-white/[0.01]",
        ].join(" ")}
      >
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onOpen={() => onOpen(lead)}
            onDragStart={(e) => onDragStart(lead, e)}
            onDragEnd={onDragEnd}
            dragging={draggingId === lead.id}
          />
        ))}

        {leads.length === 0 ? (
          <button
            type="button"
            onClick={() => onCreate(stage)}
            className="grid h-20 place-items-center rounded-md border border-dashed border-white/10 text-[11px] text-zinc-500 transition hover:border-brand-cyan/40 hover:text-brand-cyan"
          >
            + Novo lead
          </button>
        ) : null}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Lead drawer (create/edit)
// ─────────────────────────────────────────────────────────────

type DrawerState =
  | { mode: "closed" }
  | { mode: "create"; input: LeadInput }
  | { mode: "edit"; input: LeadInput; id: string };

function DrawerField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20"
      />
    </label>
  );
}

function LeadDrawer({
  drawer,
  onClose,
  onSubmit,
  onDelete,
  clientes,
  onConverted,
}: {
  drawer: DrawerState;
  onClose: () => void;
  onSubmit: (input: LeadInput, id?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  clientes: ClienteOption[];
  onConverted: () => void;
}) {
  const router = useRouter();
  const initial = drawer.mode === "closed" ? null : drawer.input;
  const [input, setInput] = useState<LeadInput | null>(initial);
  const [converting, setConverting] = useState(false);

  // Reset local state when drawer opens for a different lead
  useEffect(() => {
    if (drawer.mode === "closed") {
      setInput(null);
    } else {
      setInput(drawer.input);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawer.mode === "closed" ? "closed" : drawer.mode === "edit" ? drawer.id : "create"]);

  if (drawer.mode === "closed" || !input) return null;
  const isEdit = drawer.mode === "edit";

  function patch(p: Partial<LeadInput>) {
    setInput((curr) => (curr ? { ...curr, ...p } : curr));
  }

  async function handleConvert() {
    if (drawer.mode !== "edit") return;
    setConverting(true);
    try {
      // Reconstruct a Lead-shaped object from the current input + drawer id
      const lead = {
        id: drawer.id,
        clienteId: input!.clienteId,
        empresa: input!.empresa,
        nome: input!.nome,
        whatsapp: input!.whatsapp,
        email: input!.email,
        nicho: input!.nicho,
        cidade: input!.cidade,
        score: input!.score,
        stage: input!.stage,
        valor: input!.valor,
        sortOrder: 0,
        data: input!.data,
        createdAt: "",
        updatedAt: "",
      };
      const clienteId = await convertToCliente(lead);
      onConverted();
      onClose();
      if (clienteId) {
        try {
          window.localStorage.setItem("o6.offer-book.current", clienteId);
        } catch {
          /* ignore */
        }
        router.push("/offer-book/clientes");
      }
    } finally {
      setConverting(false);
    }
  }

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
              {isEdit ? "Editar Lead" : "Novo Lead"}
            </div>
            <h2 className="mt-0.5 text-base font-black uppercase tracking-tight text-white">
              {input.empresa || "Sem nome"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md border border-white/10 text-zinc-400 transition hover:border-white/20 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <form
          className="flex-1 overflow-y-auto px-5 py-5"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(input, isEdit ? drawer.id : undefined);
          }}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DrawerField
              label="Empresa"
              value={input.empresa}
              onChange={(v) => patch({ empresa: v })}
              placeholder="Razão social ou marca"
            />
            <DrawerField
              label="Nome"
              value={input.nome}
              onChange={(v) => patch({ nome: v })}
              placeholder="Contato"
            />
            <DrawerField
              label="WhatsApp"
              value={input.whatsapp}
              onChange={(v) => patch({ whatsapp: v })}
              placeholder="(11) 99999-0000"
            />
            <DrawerField
              label="E-mail"
              value={input.email}
              onChange={(v) => patch({ email: v })}
              placeholder="contato@empresa.com"
              type="email"
            />
            <DrawerField
              label="Nicho"
              value={input.nicho}
              onChange={(v) => patch({ nicho: v })}
            />
            <DrawerField
              label="Cidade"
              value={input.cidade}
              onChange={(v) => patch({ cidade: v })}
            />
            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Score (0-100)
              </span>
              <input
                type="number"
                min={0}
                max={100}
                value={input.score}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const n = Math.max(
                    0,
                    Math.min(100, Number(e.target.value) || 0),
                  );
                  patch({ score: n });
                }}
                className="rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Valor da proposta (R$)
              </span>
              <input
                type="number"
                min={0}
                step={100}
                value={input.valor}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  patch({ valor: Number(e.target.value) || 0 })
                }
                className="rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20"
              />
            </label>

            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Etapa
              </span>
              <select
                value={input.stage}
                onChange={(e) => patch({ stage: e.target.value as Stage })}
                className="rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Cliente vinculado (opcional)
              </span>
              <select
                value={input.clienteId ?? ""}
                onChange={(e) =>
                  patch({ clienteId: e.target.value || null })
                }
                className="rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20"
              >
                <option value="">— Nenhum —</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.empresa}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {isEdit && input.stage === "Fechado" && !input.clienteId && (
            <div className="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-400/[0.05] p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <div className="flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">
                    Lead Fechado — Próxima etapa
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">
                    Crie o cliente, vincule este lead e abra o Offer Book para
                    onboarding.
                  </p>
                  <button
                    type="button"
                    onClick={handleConvert}
                    disabled={converting}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-400/15 px-3 py-2 text-xs font-bold uppercase tracking-wider text-emerald-200 transition hover:bg-emerald-400/25 disabled:opacity-40"
                  >
                    {converting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Users className="h-3.5 w-3.5" />
                    )}
                    Converter para Cliente
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {isEdit && input.clienteId && (
            <div className="mt-6 rounded-xl border border-brand-cyan/30 bg-brand-cyan/[0.04] p-3 text-xs text-zinc-300">
              ✓ Cliente já vinculado. Acesse via <a href="/clientes-dashboard" className="font-bold text-brand-cyan hover:underline">Clientes Dashboard</a>.
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            {isEdit ? (
              <button
                type="button"
                onClick={() => onDelete(drawer.id)}
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
                className="rounded-lg border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-300 transition hover:bg-white/[0.04]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg border border-brand-cyan/40 bg-brand-cyan/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-cyan transition hover:bg-brand-cyan/25"
              >
                {isEdit ? "Salvar" : "Criar lead"}
              </button>
            </div>
          </div>
        </form>
      </aside>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [drawer, setDrawer] = useState<DrawerState>({ mode: "closed" });
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<Stage | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [ls, cs] = await Promise.all([listLeads(), listClienteOptions()]);
      setLeads(ls);
      setClientes(cs);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ── Drawer state needs to re-render when user types
  const [drawerKey, setDrawerKey] = useState(0);
  const openCreate = useCallback((stage: Stage) => {
    setDrawer({ mode: "create", input: emptyLeadInput(stage) });
    setDrawerKey((k) => k + 1);
  }, []);
  const openEdit = useCallback((lead: Lead) => {
    setDrawer({
      mode: "edit",
      id: lead.id,
      input: {
        clienteId: lead.clienteId,
        empresa: lead.empresa,
        nome: lead.nome,
        whatsapp: lead.whatsapp,
        email: lead.email,
        nicho: lead.nicho,
        cidade: lead.cidade,
        score: lead.score,
        stage: lead.stage,
        valor: lead.valor,
        data: lead.data,
      },
    });
    setDrawerKey((k) => k + 1);
  }, []);
  const closeDrawer = useCallback(() => {
    setDrawer({ mode: "closed" });
  }, []);

  const handleSubmit = useCallback(
    async (input: LeadInput, id?: string) => {
      if (id) {
        await updateLead(id, input);
      } else {
        await createLead(input);
      }
      closeDrawer();
      await refresh();
    },
    [closeDrawer, refresh],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (
        !window.confirm("Excluir este lead? A ação não pode ser desfeita.")
      ) {
        return;
      }
      await deleteLead(id);
      closeDrawer();
      await refresh();
    },
    [closeDrawer, refresh],
  );

  // ── Drag & Drop ──
  const handleDragStart = useCallback(
    (lead: Lead, e: React.DragEvent<HTMLElement>) => {
      setDraggingId(lead.id);
      e.dataTransfer.effectAllowed = "move";
      try {
        e.dataTransfer.setData("text/plain", lead.id);
      } catch {
        /* ignore */
      }
    },
    [],
  );
  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setOverStage(null);
  }, []);
  const handleDragOver = useCallback(
    (stage: Stage, e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setOverStage(stage);
    },
    [],
  );
  const handleDragLeave = useCallback(() => {
    setOverStage(null);
  }, []);
  const handleDrop = useCallback(
    async (stage: Stage) => {
      const id = draggingId;
      setDraggingId(null);
      setOverStage(null);
      if (!id) return;
      const lead = leads.find((l) => l.id === id);
      if (!lead) return;

      // Optimistic: move locally first
      const others = leads.filter((l) => l.id !== id);
      const inCol = others
        .filter((l) => l.stage === stage)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      const moved: Lead = {
        ...lead,
        stage,
        sortOrder: inCol.length,
      };
      setLeads([...others, moved]);

      await moveLead(id, stage, inCol.length, [...others, moved]);
      await refresh();
    },
    [draggingId, leads, refresh],
  );

  // ── KPIs ──
  const kpis = useMemo(() => {
    const count = (predicate: (l: Lead) => boolean) =>
      leads.filter(predicate).length;
    return {
      leads: leads.length,
      diagnosticos: count(
        (l) =>
          l.stage === "Diagnóstico Agendado" ||
          l.stage === "Diagnóstico Entregue",
      ),
      propostas: count((l) => l.stage === "Proposta"),
      fechamentos: count((l) => l.stage === "Fechado"),
      receita: leads
        .filter((l) => l.stage === "Fechado")
        .reduce((sum, l) => sum + l.valor, 0),
    };
  }, [leads]);

  // ── Grouped leads per column ──
  const grouped: Record<Stage, Lead[]> = useMemo(() => {
    const out = {} as Record<Stage, Lead[]>;
    STAGES.forEach((s) => (out[s] = []));
    leads.forEach((l) => {
      if (out[l.stage]) out[l.stage].push(l);
    });
    STAGES.forEach((s) =>
      out[s].sort((a, b) => a.sortOrder - b.sortOrder),
    );
    return out;
  }, [leads]);

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-cyan">
            O6 / CRM
          </div>
          <h1 className="mt-1 text-3xl font-black uppercase tracking-tight text-white">
            Pipeline Comercial
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-400">
            Kanban com 7 etapas. Arraste cards entre colunas — dados persistem
            no Supabase em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-200 transition hover:bg-white/[0.08] disabled:opacity-40"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
          <button
            type="button"
            onClick={() => openCreate("Novo Lead")}
            className="inline-flex items-center gap-2 rounded-lg border border-brand-cyan/40 bg-brand-cyan/15 px-3 py-2 text-xs font-bold uppercase tracking-wider text-brand-cyan transition hover:bg-brand-cyan/25"
          >
            <Plus className="h-4 w-4" />
            Novo Lead
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <KPITile
          label="Leads"
          value={String(kpis.leads)}
          icon={<Users className="h-4 w-4" />}
        />
        <KPITile
          label="Diagnósticos"
          value={String(kpis.diagnosticos)}
          icon={<ClipboardCheck className="h-4 w-4" />}
          accent="info"
        />
        <KPITile
          label="Propostas"
          value={String(kpis.propostas)}
          icon={<Handshake className="h-4 w-4" />}
          accent="info"
        />
        <KPITile
          label="Fechamentos"
          value={String(kpis.fechamentos)}
          icon={<CheckCircle2 className="h-4 w-4" />}
          accent="good"
        />
        <KPITile
          label="Receita"
          value={BRL.format(kpis.receita)}
          icon={<DollarSign className="h-4 w-4" />}
          accent="good"
        />
      </div>

      {/* Kanban */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4">
          {STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              leads={grouped[stage]}
              onCreate={openCreate}
              onOpen={openEdit}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              draggingId={draggingId}
              isDragOver={overStage === stage}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            />
          ))}
        </div>
      </div>

      <LeadDrawer
        key={drawerKey}
        drawer={drawer}
        onClose={closeDrawer}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        clientes={clientes}
        onConverted={refresh}
      />
    </div>
  );
}
