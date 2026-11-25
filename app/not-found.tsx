import type { Metadata } from "next";
import Link from "next/link";
import { whatsappUrl } from "@/app/_lib/contato";

export const metadata: Metadata = {
  title: "Página não encontrada | O6 Growth",
  description: "O endereço que você abriu não existe ou mudou de lugar. Veja as páginas principais da O6 Growth.",
  robots: { index: false, follow: true },
};

const links = [
  { href: "/", label: "Início da O6 Growth" },
  { href: "/produto/diagnostico", label: "Diagnóstico Consultivo Express" },
  { href: "/saude", label: "Soluções para clínicas e consultórios" },
  { href: "/advocacia", label: "Soluções para escritórios de advocacia" },
  { href: "/servicos", label: "Todos os serviços" },
  { href: "/portfolio/index.html", label: "Portfólio de projetos" },
];

export default function NotFound() {
  return (
    <main className="min-h-screen bg-brand-offwhite text-brand-graphite">
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-20">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-orange">Erro 404</p>
        <h1 className="text-4xl font-black leading-tight tracking-tight md:text-6xl">
          Esta página não existe ou mudou de endereço.
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-brand-graphite/75">
          Escolha um dos caminhos abaixo ou fale direto com a O6.
        </p>
        <nav aria-label="Páginas principais">
          <ul className="grid gap-3 sm:grid-cols-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="block border border-brand-graphite/15 bg-white px-5 py-4 text-sm font-semibold transition-colors hover:border-brand-orange hover:text-brand-orange"
                >
                  {l.label} →
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <a
            href={whatsappUrl("Olá, cheguei por uma página que não existe no site da O6.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-brand-orange px-6 py-4 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            Falar com a O6 pelo WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}
