import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { whatsappUrl } from "@/app/_lib/contato";

const servicePages = {
  diagnostico: {
    title: "Diagnóstico estratégico",
    headline: "Antes de produzir mais, entenda o que sua marca precisa.",
    intro: "Analisamos o contexto, a comunicação e os ativos existentes para organizar prioridades e recomendar um caminho de trabalho. Escopo e investimento são definidos conforme a necessidade.",
    label: "Clareza para decidir",
    items: ["Leitura do contexto e dos objetivos", "Análise dos ativos e da comunicação atual", "Oportunidades e prioridades", "Recomendação de próximos passos"],
    fit: "Para empresas que precisam tomar decisões melhores antes de iniciar ou reorganizar um projeto de comunicação.",
    cta: "Conversar sobre diagnóstico",
  },
  fundacao: {
    title: "Fundação estratégica e de marca",
    headline: "Uma direção clara para a marca se comunicar com consistência.",
    intro: "Organizamos posicionamento, público, oferta, identidade visual e voz da marca para orientar campanhas, conteúdo, sites e produções futuras.",
    label: "Estratégia de marca",
    items: ["Offer Book e contexto do negócio", "Posicionamento e proposta de valor", "Identidade visual e direção de arte", "Brand Book, voz e mensagens principais"],
    fit: "Para marcas que comunicam de forma genérica, mudam de linguagem a cada canal ou querem parar de copiar referências sem critério.",
    cta: "Conversar sobre minha marca",
  },
  campanhas: {
    title: "Campanhas",
    headline: "Da oferta a uma campanha com mensagem e ativos conectados.",
    intro: "Estruturamos a campanha a partir do objetivo e do público, articulando mensagem, landing page, criativos, vídeos e acompanhamento conforme o escopo acordado.",
    label: "Campanhas integradas",
    items: ["Briefing e objetivo", "Oferta e mensagem central", "Landing page e peças de campanha", "Plano de aprovação e acompanhamento"],
    fit: "Para empresas com uma oferta ou iniciativa definida que precisam transformar a ideia em uma campanha executável.",
    cta: "Conversar sobre uma campanha",
  },
  sites: {
    title: "Sites e landing pages",
    headline: "Uma experiência digital que explica a oferta e orienta o próximo passo.",
    intro: "Criamos ou atualizamos sites e landing pages com conteúdo, hierarquia, design responsivo, chamadas para ação e fundamentos de SEO. Estruturamos respostas claras e dados organizados para facilitar a interpretação por mecanismos de busca e sistemas de resposta por IA; isso não garante posições ou citações.",
    label: "Experiências digitais",
    items: ["Estrutura técnica: títulos, metadados, rastreabilidade e desempenho básico", "Conteúdo claro para SEO e respostas diretas (AEO)", "Dados estruturados adequados quando fizerem sentido; clareza da marca para GEO", "Design responsivo, formulários, links e revisão antes da publicação"],
    fit: "Para marcas que precisam lançar uma presença digital, explicar melhor um serviço ou apoiar uma campanha.",
    cta: "Conversar sobre um site",
  },
  dashboards: {
    title: "Dashboards",
    headline: "Informação organizada para acompanhar projetos e campanhas.",
    intro: "Desenhamos painéis para dar visibilidade ao andamento, aos ativos e aos indicadores acordados. Métricas de resultado dependem da integração e qualidade das fontes de dados.",
    label: "Visibilidade e acompanhamento",
    items: ["Definição das perguntas e indicadores", "Organização das fontes de dados disponíveis", "Painel de projeto ou campanha", "Revisão de leitura e próximos passos"],
    fit: "Para equipes que precisam consolidar informações e acompanhar o trabalho sem depender de planilhas dispersas.",
    cta: "Conversar sobre um dashboard",
  },
  videos: {
    title: "Vídeos e filmes",
    headline: "Produção audiovisual pensada para a mensagem da marca.",
    intro: "Desenvolvemos peças audiovisuais da ideia à edição. Formato, recursos de produção e volume são definidos conforme o objetivo, os materiais e o orçamento do projeto.",
    label: "Produção audiovisual",
    items: ["Conceito, roteiro e storyboard", "Gravação ou produção com assets aprovados", "Edição, motion design e legendas", "Adaptação para formatos combinados"],
    fit: "Para marcas que precisam explicar uma ideia, apresentar uma oferta ou contar uma história em vídeo.",
    cta: "Conversar sobre um vídeo",
  },
  sprint: {
    title: "Sprint de produção",
    headline: "Um projeto concentrado em uma entrega prioritária.",
    intro: "Definimos um objetivo, um escopo, as etapas de aprovação e um prazo compatível com o trabalho. A entrega pode envolver estratégia, campanha, site, dashboard ou audiovisual.",
    label: "Projeto com escopo definido",
    items: ["Objetivo e resultado esperado", "Entregáveis e limites de escopo", "Etapas, responsáveis e aprovações", "Prazo e investimento definidos antes do início"],
    fit: "Para empresas que têm uma prioridade clara e preferem contratar um projeto delimitado em vez de uma operação mensal.",
    cta: "Definir um projeto",
  },
  retainer: {
    title: "Acompanhamento mensal (Retainer)",
    headline: "Estratégia e produção contínuas, sem contratar cada peça isoladamente.",
    intro: "Retainer é um contrato mensal para dar continuidade a um trabalho recorrente. A cada ciclo, prioridades e entregas são combinadas; volume, prazos, canais e revisões ficam limitados no acordo. Não significa serviço ilimitado nem garantia de resultado.",
    label: "Continuidade com escopo definido",
    items: ["Planejamento de prioridades do ciclo", "Produção de ativos conforme o plano", "Acompanhamento e revisão periódica", "Limites de entregas, prazos e revisões explícitos"],
    fit: "Para marcas que precisam de continuidade e têm demandas recorrentes de estratégia, campanhas ou produção digital.",
    cta: "Conversar sobre retainer",
  },
} as const;

type ServiceSlug = keyof typeof servicePages;

export function generateStaticParams() {
  return Object.keys(servicePages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = servicePages[slug as ServiceSlug];
  return service ? { title: `${service.title} | O6 Growth`, description: service.intro } : {};
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = servicePages[slug as ServiceSlug];
  if (!service) notFound();
  const contactUrl = whatsappUrl(`Quero conversar sobre ${service.title} na O6 Growth.`);

  return (
    <main className="min-h-screen bg-[#101010] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="font-black uppercase">O6 Growth</Link>
          <nav className="flex items-center gap-4 text-xs font-bold uppercase text-zinc-400 sm:gap-6">
            <Link href="/servicos" className="hover:text-white">Serviços</Link>
            <Link href="/portfolio/index.html" className="hover:text-white">Portfólio</Link>
          </nav>
        </div>
      </header>
      <section className="mx-auto grid max-w-6xl gap-14 px-6 py-20 md:grid-cols-2 md:py-28">
        <div>
          <Link href="/servicos" className="inline-flex items-center gap-2 text-xs font-bold uppercase text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Todos os serviços</Link>
          <p className="mt-12 text-xs font-black uppercase tracking-[0.2em] text-brand-orange">{service.label}</p>
          <h1 className="mt-5 text-4xl font-black uppercase leading-[1.05] md:text-6xl">{service.headline}</h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-300">{service.intro}</p>
          <a href={contactUrl} target="_blank" rel="noopener noreferrer" className="mt-9 inline-flex items-center gap-3 bg-brand-orange px-6 py-4 text-sm font-black uppercase text-white shadow-[4px_4px_0px_0px_#fff] transition-transform hover:-translate-y-0.5">
            {service.cta}<ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div className="self-center border border-white/15 bg-white/[0.03] p-7 md:p-9">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-brand-orange">O que pode fazer parte</h2>
          <ul className="mt-7 space-y-5">
            {service.items.map((item) => <li key={item} className="flex gap-3 text-sm leading-relaxed text-zinc-200"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />{item}</li>)}
          </ul>
          <div className="mt-9 border-t border-white/10 pt-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Para quem</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">{service.fit}</p>
          </div>
        </div>
      </section>
      <section className="border-t border-white/10 py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 text-sm">
          <Link href="/servicos" className="font-bold text-zinc-300 hover:text-white">Explorar outros serviços</Link>
          <Link href="/portfolio/index.html" className="font-bold text-zinc-300 hover:text-white">Ver portfólio <ArrowRight className="ml-1 inline h-4 w-4" /></Link>
        </div>
      </section>
    </main>
  );
}
