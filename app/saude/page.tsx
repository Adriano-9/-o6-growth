import Image from "next/image";
import Link from "next/link";
import { o6Fonts } from "@/app/_lib/fonts-o6";
import { O6Header } from "@/app/_lib/O6Header";
import { SiteFooter } from "@/app/_lib/site/SiteFooter";
import { EXPRESS_DEADLINE, EXPRESS_PRICE } from "@/app/_lib/express";
import { SaudeLeadForm } from "./_components/SaudeLeadForm";

const display = { fontFamily: "var(--font-o6-display)" };
const serif = { fontFamily: "var(--font-o6-serif)" };
const mono = { fontFamily: "var(--font-o6-mono)" };

const stages = [
  { title: "Primeiro contato", text: "Quem procura sua clínica no Google, no Instagram ou por indicação encontra uma resposta clara e um caminho para agendar." },
  { title: "Atendimento", text: "A equipe sabe quem retornou, o que foi perguntado e quem precisa de atenção, sem depender da memória de ninguém." },
  { title: "Agendamento", text: "Confirmações, orçamentos e retornos ganham uma rotina que cabe na operação da recepção." },
];

const fronts = ["Marca e posicionamento", "Oferta", "Presença e busca", "Conteúdo e aquisição", "Conversão e reputação"];

export default function SaudePage() {
  return (
    <div className={o6Fonts}>
      <main className="min-h-screen bg-[#f4f2ec] text-[#1d2022]" style={{ fontFamily: "var(--font-o6-sans)" }}>
        <O6Header />

        {/* Hero */}
        <section className="mx-auto grid max-w-[1240px] gap-10 px-4 py-12 md:px-8 md:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-14">
          <div>
            <p className="flex items-center gap-2.5 text-xs uppercase tracking-[0.12em] text-[#585d5b]" style={mono}>
              <span className="h-2 w-2 rounded-full bg-[#f2542d]" />Para clínicas e consultórios
            </p>
            <h1 className="mt-4 text-[clamp(2.7rem,6.6vw,6.2rem)] uppercase leading-[0.92]" style={display}>
              Sua clínica recebe contatos. Quantos viram <em className="normal-case text-[#f2542d]" style={serif}>consulta</em>?
            </h1>
            <p className="mt-6 max-w-[48ch] text-[clamp(1.05rem,1.45vw,1.25rem)] text-[#585d5b]">
              Organize o caminho entre o primeiro contato, o atendimento da recepção e o agendamento. <strong className="font-semibold text-[#1d2022]">Cada paciente merece uma resposta clara.</strong>
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
              {["Odontologia", "Estética", "Clínica médica", "Fisioterapia"].map((f) => (
                <li key={f} className="flex items-center gap-2"><span className="h-[5px] w-[5px] bg-[#f2542d]" />{f}</li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden border-t-[3px] border-[#f2542d] bg-[#131517] lg:aspect-[4/5]">
            <Image src="/landing/saude-recepcao.png" alt="Paciente conversando com a recepção de uma clínica" fill priority sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover object-[64%_center]" />
          </div>
        </section>

        {/* Jornada */}
        <section id="jornada" className="border-t border-[#1d2022]/15 bg-[#fbfaf6]">
          <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-14 md:px-8 md:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <span className="text-xs uppercase tracking-[0.12em] text-[#585d5b]" style={mono}>A jornada do paciente</span>
              <h2 className="mt-3 text-[clamp(2.2rem,4.6vw,4rem)] uppercase leading-[0.95]" style={display}>Onde a conversa pode <em className="normal-case text-[#f2542d]" style={serif}>parar</em>?</h2>
              <p className="mt-4 max-w-[42ch] text-[17px] text-[#585d5b]">O contato pode vir do Google, de uma indicação ou de uma campanha. O que acontece depois precisa ser visível para sua equipe.</p>
            </div>
            <ol className="m-0 list-none border-t border-[#1d2022]/15 p-0">
              {stages.map((s, i) => (
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

        {/* Cuidado */}
        <section className="mx-auto grid max-w-[1240px] gap-10 px-4 py-14 md:px-8 md:py-24 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#131517]">
            <Image src="/landing/saude-consulta.png" alt="Médica ouvindo uma paciente durante consulta" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-xs uppercase tracking-[0.12em] text-[#585d5b]" style={mono}>Da mensagem à consulta</span>
            <h2 className="text-[clamp(2rem,4vw,3.4rem)] uppercase leading-[0.95]" style={display}>O cuidado também aparece na forma de <em className="normal-case text-[#f2542d]" style={serif}>atender</em>.</h2>
            <p className="max-w-[48ch] text-[17px] text-[#585d5b]">Para quem procura uma clínica particular, clareza e continuidade importam: saber o que fazer, receber resposta e não precisar repetir a própria história a cada etapa.</p>
          </div>
        </section>

        {/* Express */}
        <section className="bg-[#131517] text-[#eceae4]">
          <div className="mx-auto grid max-w-[1240px] gap-8 px-4 py-12 md:grid-cols-[1fr_auto] md:items-center md:px-8 md:py-16">
            <div className="flex flex-col gap-3">
              <span className="text-xs uppercase tracking-[0.12em] text-[#f2542d]" style={mono}>Antes de investir em site ou anúncio</span>
              <h2 className="text-[clamp(2rem,4vw,3.4rem)] uppercase leading-[0.95]" style={display}>Descubra o que resolver <em className="normal-case text-[#f2542d]" style={serif}>primeiro</em>.</h2>
              <p className="max-w-[56ch] text-[#a3a19a]">O Diagnóstico Express avalia 5 frentes da clínica e devolve até 3 prioridades em ordem, com revisão humana, {EXPRESS_DEADLINE}.</p>
              <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs uppercase tracking-[0.1em] text-[#a3a19a]" style={mono}>
                {fronts.map((f) => <li key={f} className="flex items-center gap-2"><span className="h-[5px] w-[5px] bg-[#f2542d]" />{f}</li>)}
              </ul>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <span className="text-[56px] leading-none" style={display}><small className="mr-1.5 align-top text-xs tracking-[0.1em]" style={mono}>R$</small>197</span>
              <Link href="/produto/diagnostico" className="inline-flex items-center gap-4 rounded-[2px] bg-[#f2542d] px-5 py-3.5 text-[15px] font-bold text-[#170904]">Ver o diagnóstico <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </section>

        {/* Conversa */}
        <section id="conversa" className="mx-auto grid max-w-[1240px] gap-10 px-4 py-14 md:px-8 md:py-24 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <div className="flex flex-col gap-4">
            <span className="text-xs uppercase tracking-[0.12em] text-[#f2542d]" style={mono}>Prefere conversar antes?</span>
            <h2 className="text-[clamp(2.2rem,4.6vw,4rem)] uppercase leading-[0.95]" style={display}>Conte o que mais <em className="normal-case text-[#f2542d]" style={serif}>preocupa</em> a equipe.</h2>
            <p className="max-w-[46ch] text-[17px] text-[#585d5b]">A O6 chama você no WhatsApp para entender a operação e indicar se faz sentido começar pelo diagnóstico ou direto por um projeto.</p>
          </div>
          <div className="border border-[#1d2022]/15">
            <SaudeLeadForm />
          </div>
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}
