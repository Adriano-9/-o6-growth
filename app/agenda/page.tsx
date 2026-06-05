"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock, Target, X, XCircle } from "lucide-react";
import {
  createMeeting,
  deleteMeeting,
  LinkOption,
  listLinkOptions,
  listMeetingsForWeek,
  updateMeeting,
} from "./_lib/api";
import { Meeting, MeetingInput } from "./_lib/types";
import { generateWeekSlots, startOfWeek } from "./_lib/slots";
import { WeekNav } from "./_components/WeekNav";
import { CalendarGrid } from "./_components/CalendarGrid";
import { MeetingDrawer } from "./_components/MeetingDrawer";

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
  value: string | number;
  icon: React.ReactNode;
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
// Page
// ─────────────────────────────────────────────────────────────

type DrawerState =
  | { mode: "closed" }
  | { mode: "create"; startsAt: string }
  | { mode: "edit"; meeting: Meeting };

export default function AgendaPage() {
  const searchParams = useSearchParams();
  const pendingProspectId = searchParams.get("prospectId");
  const pendingProspectEmpresa = searchParams.get("empresa") ?? "";

  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [linkOptions, setLinkOptions] = useState<LinkOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState<DrawerState>({ mode: "closed" });
  const [pendingDismissed, setPendingDismissed] = useState(false);

  const showPendingBanner =
    !!pendingProspectId && !pendingDismissed && drawer.mode === "closed";

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [m, opts] = await Promise.all([
        listMeetingsForWeek(weekStart),
        listLinkOptions(),
      ]);
      setMeetings(m);
      setLinkOptions(opts);
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const slots = useMemo(
    () => generateWeekSlots(weekStart, meetings),
    [weekStart, meetings],
  );

  const kpis = useMemo(() => {
    const total = meetings.length;
    const confirmadas = meetings.filter(
      (m) => m.status === "Confirmada",
    ).length;
    const realizadas = meetings.filter((m) => m.status === "Realizada").length;
    const noshow = meetings.filter((m) => m.status === "No-show").length;
    const usableSlots = slots.length; // total slots semana
    const occupancy =
      usableSlots > 0 ? Math.round((total / usableSlots) * 100) : 0;
    return { total, confirmadas, realizadas, noshow, occupancy };
  }, [meetings, slots]);

  async function handleSubmit(input: MeetingInput, id?: string) {
    if (id) {
      await updateMeeting(id, input);
    } else {
      // Se veio um prospect pendente da URL, vincular automaticamente
      const finalInput =
        !pendingDismissed && pendingProspectId && !input.prospectId
          ? {
              ...input,
              prospectId: pendingProspectId,
              titulo: input.titulo || `Reunião — ${pendingProspectEmpresa}`,
            }
          : input;
      await createMeeting(finalInput);
      // Limpa o pending após o primeiro uso
      if (pendingProspectId) setPendingDismissed(true);
    }
    setDrawer({ mode: "closed" });
    await refresh();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Excluir esta reunião?")) return;
    await deleteMeeting(id);
    setDrawer({ mode: "closed" });
    await refresh();
  }

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-cyan">
            O6 / Comercial
          </div>
          <h1 className="mt-1 text-3xl font-black uppercase tracking-tight text-white">
            Agenda
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-400">
            Calendário semanal de reuniões comerciais. 30 min cada · 10 min de
            buffer entre slots.
          </p>
        </div>

        <WeekNav weekStart={weekStart} onChange={setWeekStart} />
      </div>

      {/* Pending prospect banner */}
      {showPendingBanner && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-brand-cyan/30 bg-brand-cyan/[0.06] px-4 py-3">
          <div className="flex items-center gap-3">
            <Target className="h-4 w-4 text-brand-cyan" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-cyan">
                Agendando para
              </div>
              <div className="text-sm font-bold text-white">
                {pendingProspectEmpresa || "Prospect selecionado"}
              </div>
            </div>
          </div>
          <div className="text-xs text-zinc-400">
            Clique em qualquer slot livre para vincular este prospect.
          </div>
          <button
            type="button"
            onClick={() => setPendingDismissed(true)}
            className="grid h-7 w-7 place-items-center rounded-md border border-white/10 text-zinc-400 hover:text-white"
            title="Cancelar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <KPITile
          label="Semana"
          value={kpis.total}
          icon={<CalendarDays className="h-4 w-4" />}
        />
        <KPITile
          label="Confirmadas"
          value={kpis.confirmadas}
          icon={<CheckCircle2 className="h-4 w-4" />}
          accent="info"
        />
        <KPITile
          label="Realizadas"
          value={kpis.realizadas}
          icon={<CheckCircle2 className="h-4 w-4" />}
          accent="good"
        />
        <KPITile
          label="No-show"
          value={kpis.noshow}
          icon={<XCircle className="h-4 w-4" />}
          accent="warn"
        />
        <KPITile
          label="Ocupação"
          value={`${kpis.occupancy}%`}
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      {/* Calendar */}
      {loading ? (
        <div className="grid place-items-center rounded-2xl border border-white/10 bg-zinc-900/40 py-16 text-sm text-zinc-500">
          Carregando…
        </div>
      ) : (
        <CalendarGrid
          weekStart={weekStart}
          slots={slots}
          onCreate={(startsAt) => setDrawer({ mode: "create", startsAt })}
          onOpen={(meeting) => setDrawer({ mode: "edit", meeting })}
        />
      )}

      {/* Drawer */}
      {drawer.mode === "create" && (
        <MeetingDrawer
          mode="create"
          startsAt={drawer.startsAt}
          onClose={() => setDrawer({ mode: "closed" })}
          onSubmit={handleSubmit}
          linkOptions={linkOptions}
        />
      )}
      {drawer.mode === "edit" && (
        <MeetingDrawer
          mode="edit"
          initial={drawer.meeting}
          onClose={() => setDrawer({ mode: "closed" })}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          linkOptions={linkOptions}
        />
      )}
    </div>
  );
}
