import {
  AVAILABILITY,
  Meeting,
  SLOT_BUFFER_MIN,
  SLOT_DURATION_MIN,
} from "./types";

/**
 * Representa um slot da agenda, ocupado ou não.
 *
 * `weekday` = 0..6 (Dom..Sáb)
 * `startsAt` = ISO local timestamp (Date(year, month, day, hour))
 */
export type Slot = {
  weekday: number;
  startsAt: string;       // ISO
  endsAt: string;         // ISO + duration
  hourLabel: string;      // "11:00"
  meeting: Meeting | null;
};

// ─────────────────────────────────────────────────────────────
// Date helpers
// ─────────────────────────────────────────────────────────────

/**
 * Retorna a segunda-feira da semana que contém `ref` (00:00:00 local).
 */
export function startOfWeek(ref: Date = new Date()): Date {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay(); // 0=Dom
  const diff = dow === 0 ? -6 : 1 - dow; // queremos segunda
  d.setDate(d.getDate() + diff);
  return d;
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

export function formatRange(weekStart: Date): string {
  const end = addDays(weekStart, 4); // Sex
  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `${fmt(weekStart)} → ${fmt(end)}`;
}

export function isoYMDH(d: Date): string {
  // toISOString() converte para UTC — para comparações precisamos do horário local
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

// ─────────────────────────────────────────────────────────────
// Slot generation
// ─────────────────────────────────────────────────────────────

/**
 * Gera todos os slots disponíveis da semana, mesclando com reuniões existentes.
 * Cada slot ocupado recebe `meeting`. Slots livres recebem `null`.
 *
 * Algoritmo:
 *   - Para cada dia (Seg..Sex) e cada hora de AVAILABILITY:
 *     - Cria slot [hora, hora + SLOT_DURATION_MIN]
 *     - Procura reunião cujo startsAt esteja dentro deste slot
 *     - Marca como ocupado se encontrar
 */
export function generateWeekSlots(
  weekStart: Date,
  meetings: Meeting[],
): Slot[] {
  const out: Slot[] = [];

  for (let dow = 1; dow <= 5; dow++) {
    const dayDate = addDays(weekStart, dow - 1);
    const hours = AVAILABILITY[dow] ?? [];

    for (const hour of hours) {
      const start = new Date(dayDate);
      start.setHours(hour, 0, 0, 0);
      const end = new Date(start.getTime() + SLOT_DURATION_MIN * 60 * 1000);

      // Procura uma reunião que comece dentro deste intervalo
      const m = meetings.find((mt) => {
        const ms = new Date(mt.startsAt);
        return ms.getTime() === start.getTime();
      });

      out.push({
        weekday: dow,
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        hourLabel: `${String(hour).padStart(2, "0")}:00`,
        meeting: m ?? null,
      });
    }
  }

  return out;
}

/**
 * Verifica se um candidato a reunião colide com reunião existente (considerando buffer).
 * Retorna true se livre, false se conflita.
 */
export function isSlotAvailable(
  startsAt: Date,
  endsAt: Date,
  meetings: Meeting[],
  excludeId?: string,
): boolean {
  const bufferMs = SLOT_BUFFER_MIN * 60 * 1000;

  for (const m of meetings) {
    if (excludeId && m.id === excludeId) continue;
    if (m.status === "Cancelada") continue;

    const ms = new Date(m.startsAt).getTime();
    const me = new Date(m.endsAt).getTime();

    // Reuniões + buffer overlapam o slot candidato?
    const startConflict =
      startsAt.getTime() < me + bufferMs &&
      endsAt.getTime() > ms - bufferMs;

    if (startConflict) return false;
  }

  return true;
}

// ─────────────────────────────────────────────────────────────
// Range helpers para query Supabase
// ─────────────────────────────────────────────────────────────

export function weekRange(weekStart: Date): {
  fromISO: string;
  toISO: string;
} {
  const from = new Date(weekStart);
  from.setHours(0, 0, 0, 0);
  const to = addDays(from, 7);
  return { fromISO: from.toISOString(), toISO: to.toISOString() };
}
