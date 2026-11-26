import Link from "next/link";

const mono = { fontFamily: "var(--font-o6-mono)" };

const links = [
  { href: "/produto/diagnostico", label: "Diagnóstico Express" },
  { href: "/servicos", label: "Serviços" },
  { href: "/saude", label: "Clínicas e consultórios" },
  { href: "/advocacia", label: "Escritórios de advocacia" },
  { href: "/portfolio/index.html", label: "Portfólio" },
];

/** Rodapé da direção visual C, compartilhado pelas páginas públicas novas. */
export function SiteFooter() {
  return (
    <footer className="border-t border-[#1d2022]/15 bg-[#f4f2ec]">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-sm font-extrabold tracking-[0.04em]">
          <span className="grid h-7 w-7 place-items-center bg-[#f2542d] text-[11px] text-[#170904]">O6</span>O6 GROWTH
        </Link>
        <nav aria-label="Rodapé" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#585d5b]">
          {links.map((l) => <Link key={l.href} href={l.href} className="hover:text-[#1d2022]">{l.label}</Link>)}
        </nav>
        <span className="text-xs uppercase tracking-[0.1em] text-[#585d5b]" style={mono}>Salvador + remoto · © 2026</span>
      </div>
    </footer>
  );
}
