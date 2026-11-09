import Link from "next/link";
import { EXPRESS_PAYMENT_URL } from "@/app/_lib/express";

const links = [
  { href: "/", label: "Início" },
  { href: "/produto/diagnostico", label: "Diagnóstico" },
  { href: "/servicos", label: "Serviços" },
  { href: "/portfolio/index.html", label: "Portfólio" },
];

/** Cabeçalho da direção visual C (papel claro, laranja só no botão). */
export function O6Header({ current }: { current?: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#1d2022]/15 bg-[#f4f2ec]/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-4 py-3.5 md:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-sm font-extrabold tracking-[0.04em]">
          <span className="grid h-7 w-7 place-items-center bg-[#f2542d] text-[11px] text-[#170904]">O6</span>O6 GROWTH
        </Link>
        <nav aria-label="Principal" className="hidden gap-6 text-sm text-[#585d5b] md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} aria-current={current === l.href ? "page" : undefined} className={current === l.href ? "text-[#1d2022]" : "hover:text-[#1d2022]"}>
              {l.label}
            </Link>
          ))}
        </nav>
        <a href={EXPRESS_PAYMENT_URL} target="_blank" rel="noopener noreferrer" className="rounded-[2px] bg-[#f2542d] px-3.5 py-2.5 text-[13px] font-bold text-[#170904]">
          Diagnóstico R$ 197 →
        </a>
      </div>
    </header>
  );
}
