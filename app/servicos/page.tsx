import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Serviços | O6 Growth",
  description: "Conheça os serviços de estratégia, campanhas e produção digital da O6 Growth.",
};

const services = [
  { slug: "diagnostico", number: "00", title: "Diagnóstico", description: "Entenda o cenário da marca, os desafios de comunicação e qual próximo passo faz sentido." },
  { slug: "fundacao", number: "01", title: "Fundação estratégica e de marca", description: "Posicionamento, oferta, identidade visual, Brand Book e voz da marca em uma direção coerente." },
  { slug: "campanhas", number: "02", title: "Campanhas", description: "Uma oferta transformada em campanha, com mensagem, ativos digitais e plano de acompanhamento." },
  { slug: "sites", number: "03", title: "Sites e landing pages", description: "Experiências digitais com conteúdo, design, chamadas para ação e desenvolvimento responsivo." },
  { slug: "dashboards", number: "04", title: "Dashboards", description: "Visibilidade para projetos e campanhas, com indicadores definidos conforme os dados disponíveis." },
  { slug: "videos", number: "05", title: "Vídeos e filmes", description: "Produção audiovisual da ideia à edição, incluindo roteiro, motion, legendas e versões." },
  { slug: "sprint", number: "06", title: "Sprint de produção", description: "Um projeto de escopo e prazo definidos para avançar uma entrega prioritária." },
  { slug: "retainer", number: "07", title: "Acompanhamento mensal (Retainer)", description: "Continuidade estratégica e de produção com prioridades, volume e revisões combinados." },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-brand-offwhite text-brand-graphite">
      <header className="border-b border-brand-graphite/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="font-black uppercase">O6 Growth</Link>
          <nav className="flex items-center gap-5 text-xs font-bold uppercase">
            <Link href="/" className="hover:text-brand-orange">Início</Link>
            <Link href="/portfolio/index.html" className="hover:text-brand-orange">Portfólio</Link>
          </nav>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <p className="text-xs font-black uppercase tracking-widest text-brand-orange">O que a O6 faz</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-black uppercase leading-tight md:text-6xl">Estratégia, projetos e continuidade.</h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-brand-graphite/70">Cada trabalho começa pelo objetivo e pelo contexto da marca. Podemos organizar a direção, desenvolver uma entrega específica ou acompanhar a produção em ciclos mensais.</p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link key={service.slug} href={`/servicos/${service.slug}`} className="group flex min-h-56 flex-col border-2 border-brand-graphite bg-white p-6 shadow-[4px_4px_0px_0px_#121212] transition-transform hover:-translate-y-1">
              <span className="text-xs font-mono font-bold text-brand-orange">{service.number}</span>
              <h2 className="mt-5 text-xl font-black uppercase leading-tight">{service.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-graphite/65">{service.description}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase">Conhecer <ArrowRight className="h-4 w-4" /></span>
            </Link>
          ))}
        </div>
        <Link href="/portfolio/index.html" className="mt-10 inline-flex items-center gap-2 border-b-2 border-brand-orange pb-1 text-sm font-black uppercase">Ver projetos no portfólio <ArrowRight className="h-4 w-4" /></Link>
      </section>
    </main>
  );
}
