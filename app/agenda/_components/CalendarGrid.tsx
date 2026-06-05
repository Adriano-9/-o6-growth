"use client";

import { Plus } from "lucide-react";
import { Meeting, WEEKDAY_SHORT } from "../_lib/types";
import { Slot, addDays } from "../_lib/slots";
import { StatusBadge } from "./StatusBadge";

type Props = {
  weekStart: Date;
  slots: Slot[];
  onCreate: (slotStartsAt: string) => void;
  onOpen: (meeting: Meeting) => void;
};

export function CalendarGrid({
  weekStart,
  slots,
  onCreate,
  onOpen,
}: Props) {
  // Agrupar slots por dia
  const byDay: Record<number, Slot[]> = {};
  for (let d = 1; d <= 5; d++) byDay[d] = [];
  for (const s of slots) byDay[s.weekday].push(s);

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
      {[1, 2, 3, 4, 5].map((dow) => {
        const dayDate = addDays(weekStart, dow - 1);
        const isToday = isSameDay(dayDate, new Date());
        const daySlots = byDay[dow];

        return (
          <section key={dow} className="flex flex-col gap-2">
            {/* Day header */}
            <header
              className={[
                "flex items-baseline justify-between rounded-lg border px-3 py-2",
                isToday
                  ? "border-brand-cyan/40 bg-brand-cyan/[0.06]"
                  : "border-white/10 bg-zinc-900/40",
              ].join(" ")}
            >
              <div className="flex items-center gap-2">
                <span
                  className={[
                    "text-[10px] font-semibold uppercase tracking-[0.18em]",
                    isToday ? "text-brand-cyan" : "text-zinc-500",
                  ].join(" ")}
                >
                  {WEEKDAY_SHORT[dow]}
                </span>
                {isToday && (
                  <span className="rounded-md bg-brand-cyan/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-cyan">
                    Hoje
                  </span>
                )}
              </div>
              <span
                className={[
                  "text-2xl font-black tabular-nums",
                  isToday ? "text-brand-cyan" : "text-white",
                ].join(" ")}
              >
                {String(dayDate.getDate()).padStart(2, "0")}
              </span>
            </header>

            {/* Slots */}
            {daySlots.length === 0 ? (
              <div className="rounded-lg border border-dashed border-white/[0.08] bg-white/[0.01] p-3 text-center text-[11px] text-zinc-500">
                Sem horários
              </div>
            ) : (
              daySlots.map((slot) => (
                <SlotCell
                  key={slot.startsAt}
                  slot={slot}
                  onCreate={onCreate}
                  onOpen={onOpen}
                />
              ))
            )}
          </section>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Slot cell
// ─────────────────────────────────────────────────────────────

function SlotCell({
  slot,
  onCreate,
  onOpen,
}: {
  slot: Slot;
  onCreate: (startsAt: string) => void;
  onOpen: (meeting: Meeting) => void;
}) {
  if (slot.meeting) {
    const m = slot.meeting;
    return (
      <button
        type="button"
        onClick={() => onOpen(m)}
        className="group flex flex-col gap-1.5 rounded-lg border border-brand-cyan/30 bg-brand-cyan/[0.06] p-3 text-left transition hover:border-brand-cyan/50 hover:bg-brand-cyan/[0.10]"
      >
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[11px] font-bold tabular-nums text-brand-cyan">
            {slot.hourLabel}
          </span>
          <StatusBadge status={m.status} />
        </div>
        <div className="text-sm font-semibold leading-tight text-white">
          {m.titulo || "Sem título"}
        </div>
        {m.contatoNome && (
          <div className="text-[11px] text-zinc-400">{m.contatoNome}</div>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onCreate(slot.startsAt)}
      className="group flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.01] p-3 transition hover:border-brand-cyan/30 hover:bg-brand-cyan/[0.03]"
    >
      <span className="text-[11px] font-bold tabular-nums text-zinc-400 group-hover:text-brand-cyan">
        {slot.hourLabel}
      </span>
      <span className="grid h-5 w-5 place-items-center rounded-md border border-white/10 text-zinc-500 group-hover:border-brand-cyan/40 group-hover:text-brand-cyan">
        <Plus className="h-3 w-3" />
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
