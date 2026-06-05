"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  Building2,
  Calculator,
  FileText,
  LayoutDashboard,
  ListChecks,
  Loader2,
  Map as MapIcon,
  Package,
  Printer,
  Stethoscope,
  Swords,
  Target,
  Users,
} from "lucide-react";
import { useOfferBook } from "../_lib/store";

const items = [
  { href: "/offer-book/clientes", label: "Clientes", icon: Building2 },
  { href: "/offer-book/icp", label: "ICP", icon: Target },
  { href: "/offer-book/psicografia", label: "Psicografia", icon: Brain },
  { href: "/offer-book/concorrentes", label: "Concorrentes", icon: Swords },
  { href: "/offer-book/oferta", label: "Oferta", icon: Package },
  { href: "/offer-book/diagnostico", label: "Diagnóstico", icon: Stethoscope },
  { href: "/offer-book/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/offer-book/resumo", label: "Resumo Executivo", icon: FileText },
  { href: "/offer-book/plano-acao", label: "Plano de Ação", icon: ListChecks },
  { href: "/offer-book/roadmap", label: "Roadmap", icon: MapIcon },
  { href: "/offer-book/roi", label: "ROI Potencial", icon: Calculator },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { state, hydrated, currentClienteId, syncing } = useOfferBook();
  const empresa = state.cliente.empresa || "Sem nome";
  const hasCliente = Boolean(currentClienteId);

  function openPrintWindow() {
    if (typeof window === "undefined") return;
    window.open("/print", "_blank", "noopener,noreferrer");
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-zinc-950/80 px-4 py-6 md:flex">
      <Link href="/offer-book" className="mb-6 flex items-center gap-2 px-2">
        <span className="grid h-8 w-8 place-items-center rounded-md bg-brand-orange text-sm font-black text-black">
          O6
        </span>
        <div className="leading-tight">
          <div className="text-sm font-black uppercase tracking-tight text-white">
            Offer Book
          </div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            v1 — Intelligence
          </div>
        </div>
      </Link>

      <Link
        href="/clientes-dashboard"
        className="mb-5 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-left transition hover:bg-white/[0.07]"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            <Users className="h-3 w-3" />
            {hasCliente ? "Cliente atual" : "Nenhum cliente"}
          </div>
          <div className="mt-0.5 truncate text-sm font-bold text-white">
            {hasCliente ? empresa : "Abrir lista →"}
          </div>
        </div>
        {syncing ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-cyan" />
        ) : hasCliente ? (
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        ) : null}
      </Link>

      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (pathname?.startsWith(item.href + "/") ?? false);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                active
                  ? "bg-white/[0.06] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  : "text-zinc-400 hover:bg-white/[0.03] hover:text-white",
              ].join(" ")}
            >
              <Icon
                className={[
                  "h-4 w-4 transition",
                  active
                    ? "text-brand-cyan"
                    : "text-zinc-500 group-hover:text-zinc-300",
                ].join(" ")}
              />
              <span className="font-medium">{item.label}</span>
              {active ? (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-cyan" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <button
          type="button"
          onClick={openPrintWindow}
          disabled={!hasCliente || !hydrated}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-cyan/40 bg-brand-cyan/15 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-brand-cyan transition hover:bg-brand-cyan/25 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Printer className="h-4 w-4" />
          Gerar Offer Book
        </button>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Status
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-zinc-300">
            <span
              className={[
                "h-2 w-2 rounded-full",
                syncing
                  ? "animate-pulse bg-amber-300"
                  : hasCliente
                    ? "bg-emerald-400"
                    : "bg-zinc-500",
              ].join(" ")}
            />
            {syncing
              ? "Salvando..."
              : hasCliente
                ? "Sincronizado"
                : "Sem cliente"}
          </div>
        </div>
      </div>
    </aside>
  );
}
