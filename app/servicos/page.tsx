import type { Metadata } from "next";
import Link from "next/link";
import { OG_IMAGE } from "@/app/_lib/seo/og";
import { Breadcrumbs } from "@/app/_lib/seo/Breadcrumbs";
import { O6Header } from "@/app/_lib/O6Header";
import { whatsappUrl } from "@/app/_lib/contato";
import { EXPRESS_DEADLINE, EXPRESS_PAYMENT_URL, EXPRESS_PRICE } from "@/app/_lib/express";

const title = "Serviços de Estratégia, Sites e Conteúdo | O6 Growth";
const description = "Estratégia, marca, sites, campanhas, conteúdo e atendimento. Contrate só o que destrava suas vendas. Veja os serviços da O6.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/servicos" },
  openGraph: { title, description, url: "/servicos", type: "website", locale: "pt_BR", siteName: "O6 Growth", images: [OG_IMAGE] },
};

const display = { fontFamily: "var(--font-o6-display)" };
const serif = { fontFamily: "var(--font-o6-serif)" };
const mono = { fontFamily: "var(--font-o6-mono)" };

// Só o Diagnóstico Express tem preço público (decisão de 04/11/2026). Os demais saem por proposta.
const groups = [
  {
    name: "Conquistar",
    note: "Deixar claro o valor e gerar confiança.",
    items: [
      { slug: "fundacao", title: "Fundação estratégica e de marca", text: "Posicionamento, oferta, identidade visual e voz da marca numa direção só." },
      { slug: "sites", title: "Sites e landing pages", text: "Páginas que explicam a oferta, passam confiança e levam ao próximo passo, pensadas para o celular." },
    ],
  },
  {
    name: "Atrair",
    note: "Ser encontrado e despertar interesse.",
    items: [
      { slug: "campanhas", title: "Campanhas", text: "Oferta, mensagem, landing page e peças conectadas a um objetivo claro." },
      { slug: "conteudo", title: "Conteúdo e audiovisual", text: "Pautas, roteiros, carrosséis e vídeos curtos numa direção única de comunicação." },
    ],
  },
  {
    name: "Aproveitar",
    note: "Atender, acompanhar e não deixar o contato esfriar.",
    items: [
      { slug: "sistema-o6", title: "Sistema O6", text: "Entrada, resposta e retomada dos contatos organizadas, com automação só onde ajuda." },
      { slug: "otimizacao", title: "O6 Otimização", text: "Ajustes mensais priorizados no que já está no ar: páginas, mensagens e jornadas." },
      { slug: "retainer", title: "Retainer", text: "Acompanhamento recorrente com capacidade, cadência e entregas definidas em contrato." },
    ],
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-[#f4f2ec] text-[#1d2022]" style={{ fontFamily: "var(--font-o6-sans)" }}>
      <O6Header current="/servicos" />

      <section className="mx-auto max-w-[1240px] px-4 pb-14 pt-10 md:px-8 md:pb-20 md:pt-14">
        <Breadcrumbs items={[{ name: "Início", path: "/" }, { name: "Serviços", path: "/servicos" }]} />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <p className="flex items-center gap-2.5 text-xs uppercase tracking-[0.12em] text-[#585d5b]" style={mono}><span className="h-2 w-2 rounded-full bg-[#f2542d]" />Serviços da O6</p>
            <h1 className="mt-4 text-[clamp(2.8rem,7vw,6.4rem)] uppercase leading-[0.92]" style={display}>
              Contrate só o que <em className="normal-case text-[#f2542d]" style={serif}>destrava</em> suas vendas.
            </h1>
          </div>
          <p className="max-w-[44ch] text-[clamp(1.05rem,1.4vw,1.2rem)] text-[#585d5b]">
            Cardápio curto de propósito. Cada serviço resolve um ponto do caminho do cliente. Se não sabe por onde começar, o diagnóstico mostra.
          </p>
        </div>
      </section>

      {/* Entrada: Express em destaque escuro */}
      <section className="bg-[#131517] text-[#eceae4]">
        <div className="mx-auto grid max-w-[1240px] gap-8 px-4 py-12 md:grid-cols-[1fr_auto] md:items-center md:px-8 md:py-16">
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-[0.12em] text-[#f2542d]" style={mono}>Comece por aqui</span>
            <h2 className="text-[clamp(2rem,4vw,3.4rem)] uppercase leading-[0.95]" style={display}>
              Diagnóstico Consultivo <em className="normal-case text-[#f2542d]" style={serif}>Express</em>
            </h2>
            <p className="max-w-[56ch] text-[#a3a19a]">Até 3 prioridades em ordem, com revisão humana, {EXPRESS_DEADLINE}. Para decidir onde investir antes de contratar qualquer outra coisa.</p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <span className="text-[56px] leading-none" style={display}><small className="mr-1.5 align-top text-xs tracking-[0.1em]" style={mono}>R$</small>197</span>
            <div className="flex flex-wrap gap-2">
              <a href={EXPRESS_PAYMENT_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-4 rounded-[2px] bg-[#f2542d] px-5 py-3.5 text-[15px] font-bold text-[#170904]">Contratar · {EXPRESS_PRICE} <span aria-hidden="true">→</span></a>
              <Link href="/produto/diagnostico" className="inline-flex items-center rounded-[2px] border border-white/30 px-5 py-3.5 text-[15px] font-bold hover:border-white">Ver como funciona</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Os serviços por etapa */}
      <section className="mx-auto max-w-[1240px] px-4 py-14 md:px-8 md:py-24">
        <div className="flex flex-col gap-14">
          {groups.map((g) => (
            <div key={g.name} className="grid gap-6 lg:grid-cols-[0.32fr_0.68fr] lg:gap-12">
              <div className="lg:sticky lg:top-24 lg:self-start">
                <h2 className="text-[clamp(2rem,3.4vw,2.8rem)] uppercase leading-none" style={display}>{g.name}</h2>
                <p className="mt-2 text-[17px] italic text-[#585d5b]" style={serif}>{g.note}</p>
              </div>
              <ul className="m-0 list-none border-t border-[#1d2022]/15 p-0">
                {g.items.map((s) => (
                  <li key={s.slug} className="border-b border-[#1d2022]/15">
                    <Link href={`/servicos/${s.slug}`} className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-6 transition-colors hover:bg-[#ebe8e0] md:px-3">
                      <span>
                        <span className="block text-[clamp(1.25rem,2vw,1.6rem)] font-bold tracking-[-0.01em]">{s.title}</span>
                        <span className="mt-1 block max-w-[60ch] text-[15px] text-[#585d5b]">{s.text}</span>
                      </span>
                      <span className="flex items-center gap-3 text-xs uppercase tracking-[0.1em] text-[#585d5b]" style={mono}>
                        <span className="hidden sm:inline">Sob proposta</span>
                        <span aria-hidden="true" className="text-lg text-[#f2542d] transition-transform group-hover:translate-x-1">→</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Duas formas de começar */}
      <section className="border-t border-[#1d2022]/15 bg-[#fbfaf6]">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-14 md:grid-cols-2 md:px-8 md:py-20">
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-[0.12em] text-[#585d5b]" style={mono}>Ainda em dúvida</span>
            <h2 className="text-2xl font-bold">Comece pelo diagnóstico</h2>
            <p className="text-[#585d5b]">Você descobre a prioridade antes de investir. Se depois contratar um serviço, já começamos sabendo o que importa.</p>
            <Link href="/produto/diagnostico" className="self-start border-b border-[#1d2022] pb-0.5 font-semibold">Ver o Diagnóstico Express</Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-[0.12em] text-[#585d5b]" style={mono}>Já sabe o que precisa</span>
            <h2 className="text-2xl font-bold">Peça uma proposta direta</h2>
            <p className="text-[#585d5b]">Conte o projeto. Respondemos com escopo fechado, prazo, valor e duas rodadas de revisão. Domínio e hospedagem ficam no seu nome.</p>
            <div className="flex flex-wrap gap-4">
              <a href={whatsappUrl("Olá, quero uma proposta da O6.")} target="_blank" rel="noopener noreferrer" className="border-b border-[#1d2022] pb-0.5 font-semibold">Falar no WhatsApp</a>
              <Link href="/briefing" className="border-b border-[#1d2022] pb-0.5 font-semibold">Enviar briefing</Link>
              <Link href="/portfolio/index.html" className="border-b border-[#1d2022] pb-0.5 font-semibold">Ver o portfólio</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
