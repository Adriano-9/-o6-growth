import Image from "next/image";
import Link from "next/link";
import { o6Fonts } from "@/app/_lib/fonts-o6";
import { O6Header } from "@/app/_lib/O6Header";
import { SiteFooter } from "@/app/_lib/site/SiteFooter";
import { NicheLeadForm } from "@/app/_lib/site/NicheLeadForm";
import { EXPRESS_DEADLINE, EXPRESS_PRICE } from "@/app/_lib/express";

const display = { fontFamily: "var(--font-o6-display)" };
const serif = { fontFamily: "var(--font-o6-serif)" };
const mono = { fontFamily: "var(--font-o6-mono)" };

// Texto informativo, sem promessa de resultado nem captação ostensiva (Código de Ética da OAB).
const points = [
  { title: "Presença e posicionamento", text: "Área de atuação, localização e canais de contato fáceis de identificar, com comunicação informativa e precisa." },
  { title: "Triagem do primeiro contato", text: "Um caminho claro entre a dúvida inicial e a avaliação por um profissional, sem antecipar aconselhamento jurídico." },
  { title: "Acompanhamento de propostas", text: "Depois da proposta, o próximo passo e o canal de retorno ficam claros, com discrição e respeito à decisão do cliente." },
];

export default function AdvocaciaPage() {
  return (
    <div className={o6Fonts}>
      <main className="min-h-screen bg-[#f4f2ec] text-[#1d2022]" style={{ fontFamily: "var(--font-o6-sans)" }}>
        <O6Header />

        <section className="mx-auto grid max-w-[1240px] gap-10 px-4 py-12 md:px-8 md:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-14">
          <div>
            <p className="flex items-center gap-2.5 text-xs uppercase tracking-[0.12em] text-[#585d5b]" style={mono}>
              <span className="h-2 w-2 rounded-full bg-[#f2542d]" />Para escritórios de advocacia
            </p>
            <h1 className="mt-4 text-[clamp(2.7rem,6.6vw,6.2rem)] uppercase leading-[0.92]" style={display}>
              Novos clientes além da <em className="normal-case text-[#f2542d]" style={serif}>indicação</em>.
            </h1>
            <p className="mt-6 max-w-[48ch] text-[clamp(1.05rem,1.45vw,1.25rem)] text-[#585d5b]">
              Torne sua atuação mais clara para quem procura um escritório. <strong className="font-semibold text-[#1d2022]">Organize a informação, o primeiro contato e o acompanhamento com critério.</strong>
            </p>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <Link href="/produto/diagnostico" className="group inline-flex items-center justify-between gap-5 rounded-[2px] bg-[#f2542d] px-5 py-4 text-[15px] font-bold text-[#170904] transition-transform duration-300 hover:-translate-y-0.5">
                Fazer o Diagnóstico Express · {EXPRESS_PRICE} <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
              <a href="#conversa" className="inline-flex items-center rounded-[2px] border border-[#1d2022] px-5 py-[15px] text-[15px] font-bold transition-colors hover:bg-[#1d2022] hover:text-[#f4f2ec]">
                Pedir uma conversa
              </a>
            </div>
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-[0.1em] text-[#585d5b]" style={mono}>
              {["Família", "Trabalhista", "Empresarial", "Cível"].map((f) => (
                <li key={f} className="flex items-center gap-2"><span className="h-[5px] w-[5px] bg-[#f2542d]" />{f}</li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden border-t-[3px] border-[#f2542d] bg-[#131517]">
            <Image src="/landing/advocacia-atendimento.png" alt="Advogada ouvindo uma cliente em seu escritório" fill priority sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
          </div>
        </section>

        <section className="border-t border-[#1d2022]/15 bg-[#fbfaf6]">
          <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-14 md:px-8 md:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <span className="text-xs uppercase tracking-[0.12em] text-[#585d5b]" style={mono}>O primeiro contato importa</span>
              <h2 className="mt-3 text-[clamp(2.2rem,4.6vw,4rem)] uppercase leading-[0.95]" style={display}>Da busca à <em className="normal-case text-[#f2542d]" style={serif}>conversa</em>.</h2>
              <p className="mt-4 max-w-[42ch] text-[17px] text-[#585d5b]">Quando alguém precisa de orientação, o caminho deve ser claro. Uma presença séria informa as áreas de atuação, facilita o contato e evita promessas.</p>
            </div>
            <ol className="m-0 list-none border-t border-[#1d2022]/15 p-0">
              {points.map((s, i) => (
                <li key={s.title} className="grid grid-cols-[auto_1fr] gap-5 border-b border-[#1d2022]/15 py-7">
                  <span className="text-[40px] leading-none text-[#f2542d]" style={display}>0{i + 1}</span>
                  <div>
                    <h3 className="text-xl font-bold">{s.title}</h3>
                    <p className="mt-1 max-w-[56ch] text-[15px] text-[#585d5b]">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1240px] gap-10 px-4 py-14 md:px-8 md:py-24 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#131517]">
            <Image src="/landing/advocacia-reuniao.png" alt="Reunião de atendimento em escritório de advocacia" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-xs uppercase tracking-[0.12em] text-[#585d5b]" style={mono}>Respeito ao contexto profissional</span>
            <h2 className="text-[clamp(2rem,4vw,3.4rem)] uppercase leading-[0.95]" style={display}>Comunicação <em className="normal-case text-[#f2542d]" style={serif}>informativa</em>, sem promessa.</h2>
            <p className="max-w-[48ch] text-[17px] text-[#585d5b]">Conteúdo claro sobre áreas e formas de atuação, contato organizado e um próximo passo definido depois de cada conversa.</p>
          </div>
        </section>

        <section className="bg-[#131517] text-[#eceae4]">
          <div className="mx-auto grid max-w-[1240px] gap-8 px-4 py-12 md:grid-cols-[1fr_auto] md:items-center md:px-8 md:py-16">
            <div className="flex flex-col gap-3">
              <span className="text-xs uppercase tracking-[0.12em] text-[#f2542d]" style={mono}>Antes de investir em site ou anúncio</span>
              <h2 className="text-[clamp(2rem,4vw,3.4rem)] uppercase leading-[0.95]" style={display}>Saiba o que resolver <em className="normal-case text-[#f2542d]" style={serif}>primeiro</em>.</h2>
              <p className="max-w-[56ch] text-[#a3a19a]">O Diagnóstico Express avalia 5 frentes do escritório e devolve até 3 prioridades em ordem, com revisão humana, {EXPRESS_DEADLINE}. Não analisa casos nem documentos de clientes.</p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <span className="text-[56px] leading-none" style={display}><small className="mr-1.5 align-top text-xs tracking-[0.1em]" style={mono}>R$</small>197</span>
              <Link href="/produto/diagnostico" className="inline-flex items-center gap-4 rounded-[2px] bg-[#f2542d] px-5 py-3.5 text-[15px] font-bold text-[#170904]">Ver o diagnóstico <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </section>

        <section id="conversa" className="mx-auto grid max-w-[1240px] gap-10 px-4 py-14 md:px-8 md:py-24 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <div className="flex flex-col gap-4">
            <span className="text-xs uppercase tracking-[0.12em] text-[#f2542d]" style={mono}>Prefere conversar antes?</span>
            <h2 className="text-[clamp(2.2rem,4.6vw,4rem)] uppercase leading-[0.95]" style={display}>Conte o que precisa de <em className="normal-case text-[#f2542d]" style={serif}>atenção</em>.</h2>
            <p className="max-w-[46ch] text-[17px] text-[#585d5b]">A O6 chama você no WhatsApp para entender o escritório e indicar se faz sentido começar pelo diagnóstico ou direto por um projeto.</p>
          </div>
          <div className="border border-[#1d2022]/15">
            <NicheLeadForm
              origem="site_o6_advocacia"
              page="LP advocacia"
              areaLabel="Área principal"
              areas={["Direito de família", "Direito trabalhista", "Direito empresarial", "Direito civil", "Outra área"]}
              concerns={["Presença e posicionamento", "Triagem do primeiro contato", "Acompanhamento de propostas"]}
              privacyNote="Não inclua informações sigilosas de clientes ou detalhes de casos."
              doneText="Se quiser a leitura completa do escritório agora, o Diagnóstico Express mostra as 3 prioridades em ordem."
            />
          </div>
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}
