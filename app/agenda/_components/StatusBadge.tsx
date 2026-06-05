import { MeetingStatus } from "../_lib/types";

const statusStyle: Record<MeetingStatus, string> = {
  Agendada: "border-sky-400/40 bg-sky-400/[0.08] text-sky-200",
  Confirmada: "border-brand-cyan/40 bg-brand-cyan/[0.08] text-brand-cyan",
  Realizada: "border-emerald-400/40 bg-emerald-400/[0.08] text-emerald-200",
  Cancelada: "border-zinc-500/40 bg-zinc-500/[0.08] text-zinc-400",
  "No-show": "border-red-500/40 bg-red-500/[0.08] text-red-300",
};

type Props = {
  status: MeetingStatus;
  size?: "xs" | "sm";
};

export function StatusBadge({ status, size = "xs" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-md border font-semibold uppercase tracking-wider ${statusStyle[status]} ${
        size === "xs"
          ? "px-1.5 py-0.5 text-[9px]"
          : "px-2 py-0.5 text-[10px]"
      }`}
    >
      {status}
    </span>
  );
}
