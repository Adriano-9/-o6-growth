import type { Metadata } from "next";
import Link from "next/link";
import { OG_IMAGE } from "@/app/_lib/seo/og";
import { o6Fonts } from "@/app/_lib/fonts-o6";
import { O6Header } from "@/app/_lib/O6Header";
import { SiteFooter } from "@/app/_lib/site/SiteFooter";
import { ContactForm } from "@/app/_lib/site/ContactForm";
import { MobileContactBar } from "@/app/_lib/MobileContactBar";
import { whatsappUrl } from "@/app/_lib/contato";
import { EXPRESS_DEADLINE, EXPRESS_PRICE } from "@/app/_lib/express";

export const metadata: Metadata = {
  title: "O6 Growth: Entenda o que Trava suas Vendas",
  description: "Estratégia, marca, site, conteúdo e atendimento para clínicas, consultórios e serviços em Salvador. Comece pelo Diagnóstico Express da O6.",
  alternates: { canonical: "/" },
  openGraph: { title: "O6 Growth: Entenda o que Trava suas Vendas", description: "Estratégia, marca, site, conteúdo e atendimento para clínicas, consultórios e serviços em Salvador. Comece pelo Diagnóstico Express da O6.", url: "/", type: "website", locale: "pt_BR", siteName: "O6 Growth", images: [OG_IMAGE] },
};

const display = { fontFamily: "var(--font-o6-display)" };
const serif = { fontFamily: "var(--font-o6-serif)" };
const mono = { fontFamily: "var(--font-o6-mono)" };

const problems = [
  { title: "Comunicação sem direção", text: "A marca publica, anuncia e atualiza o site, mas cada peça parece falar de uma empresa diferente.", signal: "Marca sem mensagem central" },
  { title: "Cópia sem contexto", text: "Repetir um formato viral sem entender o público, a oferta e a intenção por trás dele raramente constrói diferenciação.", signal: "Referência não é estratégia" },
  { title: "Entregas desconectadas", text: "Campanha, site, vídeo e painel são produzidos separadamente, sem uma direção comum nem um objetivo claro.", signal: "Estratégia e execução separadas" },
];

const services = [
  { slug: "fundacao", title: "Fundação estratégica e de marca", text: "Posicionamento, público, oferta, identidade visual e voz da marca para orientar decisões de comunicação e criação.", tag: "Offer Book · Brand Book · Voz" },
  { slug: "campanhas", title: "Campanhas", text: "Oferta, mensagem, landing page e peças de campanha num plano com escopo e aprovações definidos.", tag: "Campanha integrada" },
  { slug: "sites", title: "Sites e landing pages", text: "Páginas responsivas que explicam a oferta, respondem dúvidas e orientam o próximo passo.", tag: "Presença digital" },
  { slug: "conteudo", title: "Conteúdo e audiovisual", text: "Pautas e referências viram roteiros, peças, vídeos e adaptações que falam a língua da marca.", tag: "Conteúdo que ganha forma" },
  { slug: "sistema-o6", title: "Sistema O6", text: "Entrada, resposta e retomada dos contatos organizadas. A automação só entra quando resolve um gargalo real.", tag: "Processo simples" },
  { slug: "otimizacao", title: "O6 Otimização · mensal", text: "Para quem já tem site, LP ou automação no ar: a gente administra e melhora todo mês, sem recomeçar do zero.", tag: "Melhoria contínua" },
];

const steps = [
  { n: "01", title: "Entender", text: "Objetivo, público, oferta e o que já existe. Começa pelo Diagnóstico Express ou por uma conversa." },
  { n: "02", title: "Direcionar", text: "Posicionamento, mensagem e prioridades definidos antes de produzir qualquer peça." },
  { n: "03", title: "Produzir", text: "Site, campanha, conteúdo ou sistema, com escopo fechado e duas rodadas de revisão." },
  { n: "04", title: "Acompanhar", text: "Ajustes com base nos dados realmente disponíveis, em projeto pontual ou na O6 Otimização." },
];

export default function Home() {
  return (
    <div className={o6Fonts}>
      <main className="min-h-screen bg-[#f4f2ec] text-[#1d2022]" style={{ fontFamily: "var(--font-o6-sans)" }}>
        <O6Header current="/" />

        {/* Hero */}
        <section className="mx-auto grid max-w-[1240px] gap-10 px-4 py-12 md:px-8 md:py-20 lg:grid-cols-[1.25fr_0.75fr] lg:items-end lg:gap-16">
          <div>
            <p className="flex items-center gap-2.5 text-xs uppercase tracking-[0.12em] text-[#585d5b]" style={mono}>
              <span className="h-2 w-2 rounded-full bg-[#f2542d]" />Estratégia e produção para marcas
            </p>
            <h1 className="mt-4 text-[clamp(2.9rem,7.4vw,7rem)] uppercase leading-[0.92]" style={display}>
              Estratégia clara. Marcas <em className="normal-case text-[#f2542d]" style={serif}>memoráveis</em>.
            </h1>
            <p className="mt-6 max-w-[48ch] text-[clamp(1.05rem,1.45vw,1.25rem)] text-[#585d5b]">
              A O6 organiza o que sua marca tem a dizer e transforma essa direção em <strong className="font-semibold text-[#1d2022]">campanhas, sites, conteúdo, vídeos e sistemas de atendimento</strong>.
            </p>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <Link href="/produto/diagnostico" className="group inline-flex items-center justify-between gap-5 rounded-[2px] bg-[#f2542d] px-5 py-4 text-[15px] font-bold text-[#170904] transition-transform duration-300 hover:-translate-y-0.5">
                Começar pelo diagnóstico <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
              <a href="#contato" className="inline-flex items-center rounded-[2px] border border-[#1d2022] px-5 py-[15px] text-[15px] font-bold transition-colors hover:bg-[#1d2022] hover:text-[#f4f2ec]">
                Conversar sobre um projeto
              </a>
            </div>
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-[0.1em] text-[#585d5b]" style={mono}>
              {["Estratégia antes do formato", "Escopo fechado", "Projeto ou acompanhamento mensal"].map((f) => (
                <li key={f} className="flex items-center gap-2"><span className="h-[5px] w-[5px] bg-[#f2542d]" />{f}</li>
              ))}
            </ul>
          </div>

          <aside className="relative flex min-h-[340px] flex-col justify-end overflow-hidden border-t-[3px] border-[#f2542d] bg-[#131517] p-6 text-[#eceae4]">
            <video src="/videos/o6-growth-hero.mp4" autoPlay muted loop playsInline aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-35" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#131517] via-[#131517]/70 to-transparent" />
            <div className="relative flex flex-col gap-3">
              <span className="text-xs uppercase tracking-[0.12em] text-[#a3a19a]" style={mono}>Da estratégia à execução</span>
              <p className="text-[clamp(1.8rem,3vw,2.6rem)] uppercase leading-[0.95]" style={display}>
                Uma direção. <em className="normal-case text-[#f2542d]" style={serif}>Várias</em> entregas.
              </p>
              <p className="text-sm text-[#a3a19a]">Posicionamento, campanhas e produção digital alinhados ao que sua marca precisa comunicar.</p>
            </div>
          </aside>
        </section>

        {/* Problema */}
        <section id="fundacao" className="border-t border-[#1d2022]/15 bg-[#fbfaf6]">
          <div className="mx-auto max-w-[1240px] px-4 py-14 md:px-8 md:py-24">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <span className="text-xs uppercase tracking-[0.12em] text-[#f2542d]" style={mono}>Antes de produzir</span>
                <h2 className="mt-3 text-[clamp(2.2rem,5vw,4.4rem)] uppercase leading-[0.95]" style={display}>
                  Sua marca não precisa de mais do mesmo. Precisa de <em className="normal-case text-[#f2542d]" style={serif}>direção</em>.
                </h2>
              </div>
              <p className="max-w-[48ch] text-[17px] text-[#585d5b]">
                Antes de criar campanhas, sites ou vídeos, entendemos a marca, o público, a oferta e o contexto. Assim, as referências que já funcionam viram ideias próprias, coerentes com o negócio.
              </p>
            </div>
            <ol className="mt-12 grid list-none gap-0 border-t border-[#1d2022]/15 p-0 md:grid-cols-3">
              {problems.map((p, i) => (
                <li key={p.title} className="flex flex-col gap-3 border-b border-[#1d2022]/15 py-7 md:border-b-0 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0">
                  <span className="text-xs text-[#f2542d]" style={mono}>0{i + 1}</span>
                  <h3 className="text-xl font-bold">{p.title}</h3>
                  <p className="text-[15px] text-[#585d5b]">{p.text}</p>
                  <span className="mt-auto pt-3 text-xs uppercase tracking-[0.1em] text-[#585d5b]" style={mono}>{p.signal}</span>
                </li>
              ))}
            </ol>
            <p className="mt-12 max-w-[30ch] text-[clamp(1.6rem,3vw,2.4rem)] italic leading-tight" style={serif}>
              Entender o que funciona é diferente de copiar o que viralizou.
            </p>
          </div>
        </section>

        {/* Express */}
        <section className="bg-[#131517] text-[#eceae4]">
          <div className="mx-auto grid max-w-[1240px] gap-8 px-4 py-12 md:grid-cols-[1fr_auto] md:items-center md:px-8 md:py-16">
            <div className="flex flex-col gap-3">
              <span className="text-xs uppercase tracking-[0.12em] text-[#f2542d]" style={mono}>Comece por aqui</span>
              <h2 className="text-[clamp(2rem,4vw,3.4rem)] uppercase leading-[0.95]" style={display}>
                Diagnóstico Consultivo <em className="normal-case text-[#f2542d]" style={serif}>Express</em>
              </h2>
              <p className="max-w-[56ch] text-[#a3a19a]">25 perguntas em 5 frentes e até 3 prioridades em ordem, com revisão humana, {EXPRESS_DEADLINE}. Para decidir onde investir antes de contratar qualquer outra coisa.</p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <span className="text-[56px] leading-none" style={display}><small className="mr-1.5 align-top text-xs tracking-[0.1em]" style={mono}>R$</small>197</span>
              <Link href="/produto/diagnostico" className="inline-flex items-center gap-4 rounded-[2px] bg-[#f2542d] px-5 py-3.5 text-[15px] font-bold text-[#170904]">Ver o diagnóstico · {EXPRESS_PRICE} <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </section>

        {/* Serviços */}
        <section id="metodo" className="mx-auto max-w-[1240px] px-4 py-14 md:px-8 md:py-24">
          <div className="grid gap-6 lg:grid-cols-[0.32fr_0.68fr] lg:gap-12">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <span className="text-xs uppercase tracking-[0.12em] text-[#585d5b]" style={mono}>O que a O6 entrega</span>
              <h2 className="mt-3 text-[clamp(2rem,3.4vw,2.8rem)] uppercase leading-none" style={display}>Da estratégia à produção</h2>
              <p className="mt-3 text-[17px] italic text-[#585d5b]" style={serif}>Começamos pela fundação da marca ou entramos direto numa entrega.</p>
              <Link href="/servicos" className="mt-5 inline-block border-b border-[#1d2022] pb-0.5 font-semibold">Ver todos os serviços</Link>
            </div>
            <ul className="m-0 list-none border-t border-[#1d2022]/15 p-0">
              {services.map((s) => (
                <li key={s.slug} className="border-b border-[#1d2022]/15">
                  <Link href={`/servicos/${s.slug}`} className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-6 transition-colors hover:bg-[#ebe8e0] md:px-3">
                    <span>
                      <span className="block text-[clamp(1.25rem,2vw,1.6rem)] font-bold tracking-[-0.01em]">{s.title}</span>
                      <span className="mt-1 block max-w-[60ch] text-[15px] text-[#585d5b]">{s.text}</span>
                      <span className="mt-2 block text-xs uppercase tracking-[0.1em] text-[#f2542d]" style={mono}>{s.tag}</span>
                    </span>
                    <span aria-hidden="true" className="text-lg text-[#f2542d] transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Processo */}
        <section id="entregas" className="border-t border-[#1d2022]/15 bg-[#fbfaf6]">
          <div className="mx-auto max-w-[1240px] px-4 py-14 md:px-8 md:py-24">
            <span className="text-xs uppercase tracking-[0.12em] text-[#585d5b]" style={mono}>Como o trabalho avança</span>
            <h2 className="mt-3 text-[clamp(2.2rem,5vw,4.4rem)] uppercase leading-[0.95]" style={display}>Da direção à <em className="normal-case text-[#f2542d]" style={serif}>entrega</em>.</h2>
            <ol className="mt-10 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s) => (
                <li key={s.n} className="flex flex-col gap-2 border-t-[3px] border-[#1d2022] pt-5">
                  <span className="text-[40px] leading-none" style={display}>{s.n}</span>
                  <h3 className="text-lg font-bold">{s.title}</h3>
                  <p className="text-[15px] text-[#585d5b]">{s.text}</p>
                </li>
              ))}
            </ol>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/portfolio/index.html" className="border-b border-[#1d2022] pb-0.5 font-semibold">Ver o portfólio</Link>
            </div>
          </div>
        </section>

        {/* Contato */}
        <section id="contato" className="mx-auto grid max-w-[1240px] gap-10 px-4 py-14 md:px-8 md:py-24 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <div className="flex flex-col gap-4">
            <span className="text-xs uppercase tracking-[0.12em] text-[#f2542d]" style={mono}>Vamos conversar</span>
            <h2 className="text-[clamp(2.2rem,5vw,4.4rem)] uppercase leading-[0.95]" style={display}>
              O que sua marca precisa <em className="normal-case text-[#f2542d]" style={serif}>construir</em> agora?
            </h2>
            <p className="max-w-[46ch] text-[17px] text-[#585d5b]">Deixe seu contato para uma conversa inicial. Alinhamos objetivo e contexto e indicamos se faz sentido um projeto pontual ou a O6 Otimização.</p>
            <a href={whatsappUrl("Olá, quero conversar sobre um projeto com a O6.")} target="_blank" rel="noopener noreferrer" className="self-start border-b border-[#1d2022] pb-0.5 font-semibold">Prefiro falar no WhatsApp</a>
          </div>
          <ContactForm />
        </section>

        <SiteFooter />
        <MobileContactBar />
      </main>
    </div>
  );
}
