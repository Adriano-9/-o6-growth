"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, formatRange } from "../_lib/slots";

type Props = {
  weekStart: Date;
  onChange: (next: Date) => void;
};

export function WeekNav({ weekStart, onChange }: Props) {
  const today = new Date();

  function goToToday() {
    const d = new Date(today);
    d.setHours(0, 0, 0, 0);
    const dow = d.getDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    d.setDate(d.getDate() + diff);
    onChange(d);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(addDays(weekStart, -7))}
        title="Semana anterior"
        className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div className="rounded-lg border border-white/10 bg-zinc-900/40 px-4 py-2 text-sm">
        <div className="flex items-center gap-2 text-white">
          <CalendarDays className="h-3.5 w-3.5 text-brand-cyan" />
          <span className="font-bold tabular-nums">{formatRange(weekStart)}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(addDays(weekStart, 7))}
        title="Próxima semana"
        className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={goToToday}
        className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-200 hover:bg-white/[0.08]"
      >
        Hoje
      </button>
    </div>
  );
}
