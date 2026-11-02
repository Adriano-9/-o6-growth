import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { whatsappUrl } from "@/app/_lib/contato";

const servicePages = {
  diagnostico: {
    title: "Diagnóstico Consultivo Express",
    price: "R$ 197",
    headline: "Antes de produzir mais, entenda qual é a prioridade da sua marca.",
    intro: "Uma leitura consultiva e objetiva do contexto, da comunicação e dos ativos existentes. Você recebe uma recomendação clara sobre a prioridade de investimento — estratégia, projeto pontual ou continuidade.",
    label: "Clareza para decidir",
    items: ["Leitura do contexto, objetivo e oferta atual", "Análise dos principais ativos e da comunicação", "Até três pontos de atenção e prioridades", "Documento consultivo com recomendação de próximo passo"],
    fit: "Para empresas que precisam tomar decisões melhores antes de iniciar ou reorganizar um projeto de comunicação.",
    notIncluded: "Não é o Diagnóstico Completo pausado, nem inclui implementação, refação total de ativos ou promessa de resultado.",
    cta: "Pedir Diagnóstico Express",
  },
  fundacao: {
    title: "Fundação estratégica e de marca",
    price: "R$ 3.000",
    headline: "Uma direção clara para a marca se comunicar com consistência.",
    intro: "Organizamos posicionamento, público, oferta, identidade visual e voz da marca para orientar campanhas, conteúdo, sites e produções futuras.",
    label: "Estratégia de marca",
    items: ["Offer Book e contexto do negócio", "Posicionamento e proposta de valor", "Identidade visual e direção de arte", "Brand Book, voz e mensagens principais"],
    fit: "Para marcas que comunicam de forma genérica, mudam de linguagem a cada canal ou querem parar de copiar referências sem critério.",
    notIncluded: "Não inclui site, campanha, mídia paga ou produção contínua. Esses projetos podem ser definidos depois da fundação.",
    cta: "Conversar sobre minha marca",
  },
  campanhas: {
    title: "Campanhas",
    price: "R$ 2.800",
    headline: "Da oferta a uma campanha com mensagem e ativos conectados.",
    intro: "Estruturamos a campanha a partir do objetivo e do público, articulando mensagem, landing page, criativos, vídeos e acompanhamento conforme o escopo acordado.",
    label: "Campanhas integradas",
    items: ["Briefing e objetivo", "Oferta e mensagem central", "Landing page e peças de campanha", "Plano de aprovação e acompanhamento"],
    fit: "Para empresas com uma oferta ou iniciativa definida que precisam transformar a ideia em uma campanha executável.",
    notIncluded: "Não inclui verba de mídia, contratação de influenciadores ou produção ilimitada de peças.",
    cta: "Conversar sobre uma campanha",
  },
  sites: {
    title: "Sites e landing pages",
    price: "A partir de R$ 2.200",
    headline: "Uma experiência digital que explica a oferta e orienta o próximo passo.",
    intro: "Criamos ou atualizamos sites e landing pages com conteúdo, hierarquia, design responsivo, chamadas para ação e fundamentos de SEO. Estruturamos respostas claras e dados organizados para facilitar a interpretação por mecanismos de busca e sistemas de resposta por IA; isso não garante posições ou citações.",
    label: "Experiências digitais",
    items: ["Estrutura técnica: títulos, metadados, rastreabilidade e desempenho básico", "Conteúdo claro para SEO e respostas diretas (AEO)", "Dados estruturados adequados quando fizerem sentido; clareza da marca para GEO", "Design responsivo, formulários, links e revisão antes da publicação"],
    fit: "Para marcas que precisam lançar uma presença digital, explicar melhor um serviço ou apoiar uma campanha.",
    notIncluded: "Não inclui hospedagem, domínio, tráfego pago ou garantia de posicionamento em buscadores. Site institucional e landing page têm escopos e preços diferentes.",
    cta: "Conversar sobre um site",
  },
  "sistema-o6": {
    title: "Sistema O6",
    price: "Sob escopo",
    headline: "Um processo comercial mais simples, com automação apenas onde ela realmente ajuda.",
    intro: "Antes de adicionar ferramenta, organizamos a entrada, a resposta e os retornos que o negócio precisa sustentar. Se automações fizerem sentido, elas entram como parte do sistema, sem vender um CRM, dashboard ou manutenção infinita como pacote padrão.",
    label: "Processo que a equipe sustenta",
    items: ["Leitura dos canais, etapas e pontos em que oportunidades se perdem", "Fluxo simples de entrada, resposta, encaminhamento e retomada", "Automação proporcional ao volume e às regras aprovadas", "Orientação de uso e um critério claro para saber o que precisa ser acompanhado"],
    fit: "Para negócios que já recebem contatos, mas não têm um processo simples e consistente para responder, encaminhar e retomar as conversas certas.",
    notIncluded: "Não inclui operação comercial terceirizada, licença de ferramentas, CRM como produto nem dashboard como entrega padrão. Esses recursos só são avaliados se forem necessários ao projeto.",
    cta: "Conversar sobre o Sistema O6",
  },
  otimizacao: {
    title: "O6 Otimização",
    price: "R$ 750/mês",
    headline: "Melhore o que já funciona sem recomeçar do zero.",
    intro: "Um acompanhamento mensal mais leve para negócios que já têm presença digital, campanhas ou automações e precisam eliminar atritos, atualizar ativos e acompanhar melhorias prioritárias.",
    label: "Acompanhamento com escopo definido",
    items: ["Leitura mensal dos principais pontos de atrito", "Lista priorizada de melhorias em páginas, mensagens ou jornadas", "Execução de ajustes compatíveis com o escopo contratado", "Registro do que mudou e da próxima prioridade"],
    fit: "Para negócios com uma base existente que precisam melhorar conversão, clareza, resposta ou experiência sem contratar uma reconstrução completa.",
    notIncluded: "Não é um pacote de produção ilimitada, uma implantação completa ou uma licença de CRM.",
    cta: "Conversar sobre a O6 Otimização",
  },
  retainer: {
    title: "Retainer",
    price: "Sob contrato",
    headline: "Acompanhamento recorrente para uma agenda de evolução que pede continuidade.",
    intro: "O Retainer organiza uma relação contínua de trabalho para prioridades estratégicas e de produção que exigem capacidade reservada, cadência e responsabilidade compartilhada.",
    label: "Continuidade contratada",
    items: ["Prioridades, capacidade e canais definidos no contrato", "Ritual de planejamento, execução e revisão conforme a cadência acordada", "Entregas, aprovações e responsáveis registrados por ciclo", "Acompanhamento de evolução compatível com o escopo contratado"],
    fit: "Para empresas com uma agenda recorrente de comunicação ou evolução estratégica que já sabem por que precisam de continuidade e qual ritmo conseguem sustentar.",
    notIncluded: "Não é produção ilimitada, suporte sem limites, licença de CRM ou substituição de uma implantação estrutural. Valor, prazo mínimo e capacidade dependem do contrato.",
    cta: "Conversar sobre um Retainer",
  },
  conteudo: {
    title: "Conteúdo e audiovisual",
    price: "A partir de R$ 2.800",
    headline: "Uma direção de conteúdo que também vira vídeo, peça e presença.",
    intro: "Definimos os temas, formatos e mensagens que a marca precisa sustentar. A produção pode combinar pauta, carrossel, roteiro, vídeo e adaptações para os canais definidos, sempre em uma única direção de comunicação.",
    label: "Conteúdo que ganha forma",
    items: ["Pesquisa de referências, tendências e perguntas do público", "Pilares, pautas, ganchos e roteiros originais", "Carrosséis, vídeos curtos, motion e peças de apoio", "Calendário, aprovação e adaptações para os formatos combinados"],
    fit: "Para marcas que querem produzir com consistência e critério, usando referências do mercado sem perder identidade, clareza ou conexão com a oferta.",
    notIncluded: "Não inclui crescimento garantido, publicação em volume ilimitado, diária de produção externa ou uso de conteúdos de terceiros sem licença.",
    cta: "Conversar sobre conteúdo",
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
  if (slug === "dashboards" || slug === "videos" || slug === "sprint" || slug === "automacao-atendimento") redirect("/servicos/sistema-o6");
  const service = servicePages[slug as ServiceSlug];
  if (!service) notFound();
  const contactUrl = slug === "diagnostico"
    ? "/produto/diagnostico"
    : whatsappUrl(`Quero conversar sobre ${service.title} na O6 Growth.`);

  return (
    <main className="min-h-screen bg-[#17191B] text-[#F4F2EE]">
      <header className="border-b border-white/[0.08] bg-[#1B1E20]/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-sm font-extrabold tracking-[0.08em]">O6 <span className="font-medium text-[#A9AAA8]">GROWTH</span></Link>
          <nav className="flex items-center gap-4 text-xs font-semibold text-[#B5B5B1] sm:gap-6">
            <Link href="/servicos" className="transition-colors hover:text-white">Serviços</Link>
            <Link href="/portfolio/index.html" className="transition-colors hover:text-white">Portfólio</Link>
          </nav>
        </div>
      </header>
      <section className="relative isolate overflow-hidden border-b border-white/[0.08]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_12%_18%,rgba(255,87,34,0.12),transparent_37%),linear-gradient(115deg,#1B1E20_0%,#17191B_58%,#202224_100%)]" />
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[1.06fr_0.94fr] md:items-center md:gap-16 md:py-24">
        <div>
          <Link href="/servicos" className="inline-flex items-center gap-2 text-sm font-medium text-[#B5B5B1] transition-colors hover:text-white"><ArrowLeft className="h-4 w-4" /> Todos os serviços</Link>
          <p className="mt-14 inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF7950]"><span className="h-px w-8 bg-[#FF7950]" />{service.label}</p>
          <h1 className="mt-5 max-w-[13ch] text-[clamp(2.5rem,5vw,4.45rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-[#F5F3EF]">{service.headline}</h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-[#C0C0BC] md:text-[1.0625rem]">{service.intro}</p>
          <p className="mt-5 text-sm font-bold uppercase tracking-[0.14em] text-[#FF7950]">Investimento-base: {service.price}</p>
          <a href={contactUrl} target={slug === "diagnostico" ? undefined : "_blank"} rel={slug === "diagnostico" ? undefined : "noopener noreferrer"} className="group mt-9 inline-flex min-h-14 items-center gap-5 bg-[#FF5722] px-6 text-sm font-bold text-white shadow-[0_10px_32px_rgba(255,87,34,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#FF6A3D] hover:shadow-[0_14px_38px_rgba(255,87,34,0.25)]">
            {service.cta}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
        <div className="relative self-center border border-white/[0.11] bg-[#202325]/85 p-7 shadow-[0_28px_80px_rgba(0,0,0,0.18)] backdrop-blur-sm md:p-9">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF7950]/70 to-transparent" />
          <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#FF7950]">O que pode fazer parte</p>
          <ul className="mt-7 space-y-5">
            {service.items.map((item, index) => <li key={item} className="flex gap-4 text-[0.9375rem] leading-7 text-[#E2E0DB]"><span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#FF7950]/35 bg-[#FF7950]/10"><Check className="h-3 w-3 text-[#FF7950]" /></span><span><span className="mr-2 font-mono text-[11px] text-[#858783]">0{index + 1}</span>{item}</span></li>)}
          </ul>
          <div className="mt-9 border-t border-white/[0.1] pt-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#A6A6A1]">Para quem</p>
            <p className="mt-3 text-sm leading-7 text-[#C7C6C1]">{service.fit}</p>
          </div>
          <div className="mt-7 border-t border-white/[0.1] pt-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#A6A6A1]">O que não está incluído</p>
            <p className="mt-3 text-sm leading-7 text-[#C7C6C1]">{service.notIncluded}</p>
          </div>
        </div>
        </div>
      </section>
      <section className="bg-[#1B1E20] py-9">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 text-sm">
          <Link href="/servicos" className="font-medium text-[#C7C6C1] transition-colors hover:text-white">Explorar outros serviços</Link>
          <Link href="/portfolio/index.html" className="font-medium text-[#C7C6C1] transition-colors hover:text-white">Ver portfólio <ArrowRight className="ml-1 inline h-4 w-4" /></Link>
        </div>
      </section>
    </main>
  );
}
