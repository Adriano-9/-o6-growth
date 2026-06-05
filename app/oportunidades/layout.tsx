import type { Metadata } from "next";
import Link from "next/link";
import { Building2, CalendarDays, KanbanSquare, Target, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "O6 Oportunidades — Prospecção",
};

export default function OportunidadesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-6 py-3">
          <Link href="/oportunidades" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-brand-orange text-sm font-black text-black">
              O6
            </span>
            <div className="leading-tight">
              <div className="text-sm font-black uppercase tracking-tight text-white">
                Oportunidades
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                Prospecção Fria
              </div>
            </div>
          </Link>

          <nav className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider">
            <Link
              href="/oportunidades"
              className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.06] px-3 py-1.5 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
            >
              <Target className="h-3.5 w-3.5 text-brand-cyan" />
              Oportunidades
            </Link>
            <Link
              href="/agenda"
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Agenda
            </Link>
            <Link
              href="/crm"
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              <KanbanSquare className="h-3.5 w-3.5" />
              CRM
            </Link>
            <Link
              href="/clientes-dashboard"
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              <Users className="h-3.5 w-3.5" />
              Clientes
            </Link>
            <Link
              href="/offer-book"
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              <Building2 className="h-3.5 w-3.5" />
              Offer Book
            </Link>
          </nav>
        </div>
      </header>

      <main className="px-4 py-6 md:px-6 md:py-8">{children}</main>
    </div>
  );
}
