"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitBranch,
  Users,
  FolderKanban,
  Bot,
  Activity,
  Wallet,
  BookOpen,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/os", icon: LayoutDashboard },
  { label: "Pipeline", href: "/os/pipeline", icon: GitBranch },
  { label: "Clientes", href: "/clientes-dashboard", icon: Users },
  { label: "Projetos", href: "/offer-book", icon: FolderKanban },
  { label: "Agentes", href: "/os/agentes", icon: Bot },
  { label: "Hermes", href: "/os/hermes", icon: Activity },
  { label: "Financeiro", href: "/dashboard-o6", icon: Wallet },
  { label: "Knowledge", href: "/offer-book-dashboard", icon: BookOpen },
];

export default function OsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#0D0D0D] text-white">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-[#222222] bg-[#0D0D0D] md:flex">
        <div className="flex items-center gap-2.5 border-b border-[#222222] px-6 py-5">
          <div className="grid h-7 w-7 place-items-center rounded bg-[#FF5722] text-xs font-black text-white">
            O6
          </div>
          <span className="text-sm font-bold uppercase tracking-widest">OS</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-5">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#FF5722]/10 text-[#FF5722]"
                    : "text-[#888888] hover:bg-white/[0.03] hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-[#222222] px-6 py-4 text-[10px] uppercase tracking-widest text-[#555555]">
          O6 Growth OS · v1
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center gap-2 overflow-x-auto border-b border-[#222222] bg-[#0D0D0D]/95 px-4 py-3 backdrop-blur md:hidden">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider ${
                active
                  ? "border-[#FF5722]/40 bg-[#FF5722]/10 text-[#FF5722]"
                  : "border-[#222222] text-[#888888]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 pt-14 md:pt-0">{children}</div>
    </div>
  );
}
