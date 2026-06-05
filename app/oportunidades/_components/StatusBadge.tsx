import { ProspectStatus } from "../_lib/types";

const statusStyle: Record<ProspectStatus, string> = {
  Novo: "border-zinc-500/40 bg-zinc-500/[0.08] text-zinc-300",
  Auditado: "border-sky-400/40 bg-sky-400/[0.08] text-sky-200",
  "Demo Gerada": "border-brand-cyan/40 bg-brand-cyan/[0.08] text-brand-cyan",
  "Contato Enviado": "border-amber-300/40 bg-amber-300/[0.08] text-amber-200",
  Reunião: "border-orange-400/40 bg-orange-400/[0.08] text-orange-200",
  Fechado: "border-emerald-400/40 bg-emerald-400/[0.08] text-emerald-200",
};

type Props = {
  status: ProspectStatus;
  size?: "sm" | "md";
};

export function StatusBadge({ status, size = "sm" }: Props) {
  const cls = statusStyle[status] ?? statusStyle["Novo"];
  return (
    <span
      className={`inline-flex items-center rounded-md border font-semibold uppercase tracking-wider ${cls} ${
        size === "sm"
          ? "px-2 py-0.5 text-[10px]"
          : "px-2.5 py-1 text-xs"
      }`}
    >
      {status}
    </span>
  );
}
