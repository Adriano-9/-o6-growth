import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";

export const metadata: Metadata = {
  title: "Serviços | O6 Growth",
  description: "Conheça as soluções de estratégia, projetos e continuidade da O6 Growth.",
};

const services = [
  { slug: "diagnostico", number: "01", category: "Estratégia", title: "Diagnóstico Consultivo Express", price: "R$ 197", description: "Uma leitura objetiva para identificar o gargalo principal e indicar o próximo investimento mais coerente." },
  { slug: "fundacao", number: "02", category: "Estratégia", title: "Fundação estratégica e de marca", price: "R$ 3.000", description: "Posicionamento, oferta, identidade visual, Brand Book e voz da marca em uma direção coerente." },
  { slug: "sites", number: "03", category: "Projetos", title: "Presença digital", price: "a partir de R$ 2.200", description: "Site ou landing page que deixa a oferta clara e orienta o próximo passo do público." },
  { slug: "campanhas", number: "04", category: "Projetos", title: "Campanhas, conteúdo e audiovisual", price: "a partir de R$ 2.800", description: "Mensagem, peças e vídeos conectados a uma campanha ou presença de marca com direção única." },
  { slug: "sistema-o6", number: "05", category: "Projetos", title: "Sistema O6", price: "sob escopo", description: "Organização do atendimento e automações proporcionais ao processo real, apenas quando elas resolvem o gargalo." },
  { slug: "otimizacao", number: "06", category: "Continuidade", title: "O6 Otimização", price: "R$ 750/mês", description: "Melhorias priorizadas para ativos e processos que já estão de pé." },
  { slug: "retainer", number: "07", category: "Continuidade", title: "Retainer", price: "sob contrato", description: "Acompanhamento recorrente com capacidade, cadência e escopo definidos em contrato." },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-[#17191B] text-[#F4F2EE]">
      <header className="border-b border-white/[0.08] bg-[#1B1E20]/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-sm font-extrabold tracking-[0.08em]">O6 <span className="font-medium text-[#A9AAA8]">GROWTH</span></Link>
          <nav className="flex items-center gap-5 text-xs font-semibold text-[#B5B5B1]">
            <Link href="/" className="transition-colors hover:text-white">Início</Link>
            <Link href="/portfolio/index.html" className="transition-colors hover:text-white">Portfólio</Link>
          </nav>
        </div>
      </header>
      <section className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_14%_12%,rgba(255,87,34,0.12),transparent_32%),linear-gradient(120deg,#1B1E20_0%,#17191B_62%,#202224_100%)]" />
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <p className="inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF7950]"><span className="h-px w-8 bg-[#FF7950]" />O que a O6 faz</p>
        <h1 className="mt-5 max-w-4xl text-[clamp(2.6rem,5.5vw,4.75rem)] font-semibold leading-[1.03] tracking-[-0.035em]">Estratégia, projetos e continuidade.</h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-[#C0C0BC] md:text-[1.0625rem]">O cardápio é curto de propósito: direção estratégica, projetos que viram ativos concretos e continuidade para não deixar o que já existe perder força.</p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link key={service.slug} href={`/servicos/${service.slug}`} className="group relative flex min-h-56 flex-col border border-white/[0.1] bg-[#202325]/85 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#FF7950]/45 hover:bg-[#242729]">
              <span className="flex items-center justify-between text-[11px] font-mono font-medium text-[#FF7950]"><span>{service.number}</span><ArrowRight className="h-4 w-4 text-[#92938F] transition-all group-hover:translate-x-1 group-hover:text-[#FF7950]" /></span>
              <span className="mt-5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#A9AAA8]">{service.category}</span>
              <h2 className="mt-7 text-xl font-semibold leading-snug tracking-[-0.02em] text-[#F2F0EB]">{service.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-7 text-[#B9BAB5]">{service.description}</p>
              <span className="mt-6 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.12em] text-[#D5D3CD] transition-colors group-hover:text-white"><span>{service.price}</span><span>Conhecer serviço</span></span>
            </Link>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-5 border-t border-white/[0.12] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#F2F0EB]">Já sabe o que precisa?</p>
            <p className="mt-1 text-sm leading-6 text-[#B9BAB5]">Conte sobre o projeto. Vamos entender o contexto e indicar o próximo passo.</p>
          </div>
          <Link href="/briefing" className="inline-flex shrink-0 items-center justify-center gap-3 bg-[#FF5722] px-5 py-4 text-sm font-bold text-white transition-colors hover:bg-[#ff7043]">
            <ClipboardList className="h-4 w-4" /> Enviar briefing <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <Link href="/portfolio/index.html" className="mt-8 inline-flex items-center gap-3 border-b border-[#FF7950]/60 pb-2 text-sm font-semibold text-[#E4E1DB] transition-colors hover:text-white">Ver projetos no portfólio <ArrowRight className="h-4 w-4 text-[#FF7950]" /></Link>
        </div>
      </section>
    </main>
  );
}
