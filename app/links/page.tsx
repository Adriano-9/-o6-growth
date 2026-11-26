import Link from "next/link";
import { o6Fonts } from "@/app/_lib/fonts-o6";
import { TrackedLinks } from "./TrackedLinks";

const display = { fontFamily: "var(--font-o6-display)" };
const serif = { fontFamily: "var(--font-o6-serif)" };
const mono = { fontFamily: "var(--font-o6-mono)" };

export default function LinksPage() {
  return (
    <div className={o6Fonts}>
      <main className="min-h-screen bg-[#f4f2ec] px-5 py-8 text-[#1d2022] sm:px-8" style={{ fontFamily: "var(--font-o6-sans)" }}>
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col">
          <header className="flex items-center justify-between border-b border-[#1d2022]/15 pb-5">
            <Link href="/" className="flex items-center gap-2.5 text-sm font-extrabold tracking-[0.04em]" aria-label="O6 Growth">
              <span className="grid h-8 w-8 place-items-center bg-[#f2542d] text-[11px] text-[#170904]">O6</span>O6 GROWTH
            </Link>
            <span className="text-xs uppercase tracking-[0.12em] text-[#585d5b]" style={mono}>Comece por aqui</span>
          </header>

          <section className="py-10">
            <h1 className="text-[clamp(2.6rem,10vw,4rem)] uppercase leading-[0.92]" style={display}>
              Por onde <em className="normal-case text-[#f2542d]" style={serif}>começamos</em>?
            </h1>
            <p className="mt-4 max-w-lg text-[17px] text-[#585d5b]">Escolha o caminho que faz sentido para o momento da sua empresa.</p>
          </section>

          <TrackedLinks />

          <footer className="mt-auto border-t border-[#1d2022]/15 pt-6 text-xs uppercase tracking-[0.1em] text-[#585d5b]" style={mono}>
            Salvador + remoto · O6 Growth
          </footer>
        </div>
      </main>
    </div>
  );
}
