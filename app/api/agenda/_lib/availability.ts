import { AVAILABILITY, SLOT_DURATION_MIN } from "@/app/agenda/_lib/types";

export const O6_TIMEZONE = "America/Bahia";
const O6_OFFSET = "-03:00";

type LocalParts = {
  date: string;
  weekday: number;
  hour: number;
  minute: number;
};

const weekdayMap: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function localParts(date: Date): LocalParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: O6_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const year = get("year");
  const month = get("month");
  const day = get("day");
  const weekday = weekdayMap[get("weekday")] ?? 0;

  return {
    date: `${year}-${month}-${day}`,
    weekday,
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const base = new Date(`${dateKey}T12:00:00Z`);
  base.setUTCDate(base.getUTCDate() + days);
  return base.toISOString().slice(0, 10);
}

export function slotISO(dateKey: string, hour: number): string {
  const hh = String(hour).padStart(2, "0");
  return new Date(`${dateKey}T${hh}:00:00${O6_OFFSET}`).toISOString();
}

export function slotEndISO(startsAt: string): string {
  const start = new Date(startsAt);
  return new Date(start.getTime() + SLOT_DURATION_MIN * 60 * 1000).toISOString();
}

export function isConfiguredSlot(startsAt: Date): boolean {
  if (Number.isNaN(startsAt.getTime())) return false;
  const local = localParts(startsAt);
  if (local.minute !== 0) return false;
  return (AVAILABILITY[local.weekday] ?? []).includes(local.hour);
}

export function buildCandidateSlots(days: number): Array<{
  startsAt: string;
  endsAt: string;
}> {
  const now = new Date();
  const today = localParts(now).date;
  const out: Array<{ startsAt: string; endsAt: string }> = [];

  for (let offset = 0; offset < days; offset++) {
    const dateKey = addDaysToDateKey(today, offset);
    const noon = new Date(`${dateKey}T12:00:00${O6_OFFSET}`);
    const weekday = localParts(noon).weekday;
    const hours = AVAILABILITY[weekday] ?? [];

    for (const hour of hours) {
      const startsAt = slotISO(dateKey, hour);
      if (new Date(startsAt).getTime() <= now.getTime()) continue;
      out.push({ startsAt, endsAt: slotEndISO(startsAt) });
    }
  }

  return out;
}

export function formatSlotLabel(startsAt: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: O6_TIMEZONE,
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(startsAt));
}
