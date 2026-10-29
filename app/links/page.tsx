import Link from "next/link";
import { TrackedLinks } from "./TrackedLinks";

export default function LinksPage() {
  return (
    <main className="min-h-screen bg-[#0d0d0d] px-5 py-8 text-white sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col">
        <header className="flex items-center justify-between border-b border-white/15 pb-5">
          <Link href="/" className="flex items-center gap-3" aria-label="O6 Growth">
            <span className="grid h-10 w-10 place-items-center bg-brand-orange text-sm font-black text-white">O6</span>
            <span className="text-sm font-black uppercase tracking-[0.18em]">Growth</span>
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">Comece por aqui</span>
        </header>

        <section className="py-12">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-orange">O6 Growth</p>
          <h1 className="mt-4 text-4xl font-black uppercase leading-[1.02] sm:text-5xl">Por onde começamos?</h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/70">Escolha o caminho que faz sentido para o momento da sua empresa.</p>
        </section>

        <TrackedLinks />

        <footer className="mt-auto border-t border-white/15 pt-6 text-xs text-white/40">
          Salvador + remoto · O6 Growth
        </footer>
      </div>
    </main>
  );
}
