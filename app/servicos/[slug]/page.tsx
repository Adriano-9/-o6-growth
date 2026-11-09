import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Breadcrumbs } from "@/app/_lib/seo/Breadcrumbs";
import { OG_IMAGE } from "@/app/_lib/seo/og";
import { whatsappUrl } from "@/app/_lib/contato";
import { O6Header } from "@/app/_lib/O6Header";

const servicePages = {
  diagnostico: {
    title: "Diagnóstico Consultivo Express",
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

const serviceSeo: Record<ServiceSlug, { title: string; description: string }> = {
  diagnostico: { title: "Diagnóstico Consultivo Express | O6 Growth", description: "Descubra o que trava suas vendas antes de investir. Até 3 prioridades em ordem, com revisão humana. Peça o seu Diagnóstico Express." },
  fundacao: { title: "Fundação Estratégica e de Marca | O6 Growth", description: "Posicionamento, oferta, identidade e voz da marca numa direção só. Converse com a O6 e organize sua marca antes de produzir mais." },
  campanhas: { title: "Campanhas com Objetivo Claro | O6 Growth", description: "Mensagem, peças e vídeos conectados a um objetivo de negócio. Fale com a O6 e planeje sua próxima campanha com direção." },
  sites: { title: "Sites e Landing Pages | O6 Growth", description: "Site ou landing page que explica sua oferta e leva ao próximo passo, pensado para o celular. Peça uma proposta à O6." },
  "sistema-o6": { title: "Sistema O6: Atendimento e Automação | O6 Growth", description: "Organize entrada, resposta e retorno dos contatos, com automação só onde ajuda. Converse com a O6 sobre o seu atendimento." },
  otimizacao: { title: "O6 Otimização: Melhoria Contínua | O6 Growth", description: "Ajustes priorizados no site, nas páginas e nos processos que você já tem. Fale com a O6 e melhore o que já está no ar." },
  retainer: { title: "Retainer: Acompanhamento Mensal | O6 Growth", description: "Acompanhamento mensal com escopo e entregas definidos para manter marca, presença e atendimento evoluindo. Converse com a O6." },
  conteudo: { title: "Conteúdo e Audiovisual | O6 Growth", description: "Pautas, roteiros, carrosséis e vídeos numa direção única de comunicação. Fale com a O6 e produza conteúdo com critério." },
};

export function generateStaticParams() {
  return Object.keys(servicePages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = servicePages[slug as ServiceSlug];
  if (!service) return {};
  const seo = serviceSeo[slug as ServiceSlug];
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: `/servicos/${slug}` },
    openGraph: { title: seo.title, description: seo.description, url: `/servicos/${slug}`, type: "website", locale: "pt_BR", siteName: "O6 Growth", images: [OG_IMAGE] },
  };
}

const display = { fontFamily: "var(--font-o6-display)" };
const serif = { fontFamily: "var(--font-o6-serif)" };
const mono = { fontFamily: "var(--font-o6-mono)" };

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "dashboards" || slug === "videos" || slug === "sprint" || slug === "automacao-atendimento") redirect("/servicos/sistema-o6");
  if (slug === "diagnostico") redirect("/produto/diagnostico");
  const service = servicePages[slug as ServiceSlug];
  if (!service) notFound();
  const contactUrl = whatsappUrl(`Quero conversar sobre ${service.title} na O6 Growth.`);

  return (
    <main className="min-h-screen bg-[#f4f2ec] text-[#1d2022]" style={{ fontFamily: "var(--font-o6-sans)" }}>
      <O6Header current="/servicos" />

      <section className="mx-auto max-w-[1240px] px-4 pb-14 pt-10 md:px-8 md:pb-20 md:pt-14">
        <Breadcrumbs items={[{ name: "Início", path: "/" }, { name: "Serviços", path: "/servicos" }, { name: service.title, path: `/servicos/${slug}` }]} />
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="flex items-center gap-2.5 text-xs uppercase tracking-[0.12em] text-[#585d5b]" style={mono}><span className="h-2 w-2 rounded-full bg-[#f2542d]" />{service.title}</p>
            <h1 className="mt-4 text-[clamp(2.2rem,4.6vw,4.2rem)] uppercase leading-[0.94]" style={display}>{service.headline}</h1>
            <p className="mt-6 max-w-[56ch] text-[clamp(1.05rem,1.35vw,1.2rem)] text-[#585d5b]">{service.intro}</p>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <a href={contactUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-5 rounded-[2px] bg-[#f2542d] px-5 py-4 text-[15px] font-bold text-[#170904] transition-transform hover:-translate-y-0.5">{service.cta} <span aria-hidden="true">→</span></a>
              <Link href="/produto/diagnostico" className="inline-flex items-center rounded-[2px] border border-[#1d2022] px-5 py-4 text-[15px] font-bold transition-colors hover:bg-[#1d2022] hover:text-[#f4f2ec]">Começar pelo diagnóstico</Link>
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.1em] text-[#585d5b]" style={mono}>Sob proposta · escopo fechado · 2 rodadas de revisão</p>
          </div>
          <aside className="flex flex-col gap-4 border-t-[3px] border-[#f2542d] bg-[#131517] p-6 text-[#eceae4]">
            <span className="text-xs uppercase tracking-[0.12em] text-[#a3a19a]" style={mono}>{service.label}</span>
            <h2 className="m-0 text-lg font-semibold">O que pode fazer parte</h2>
            <ol className="m-0 list-none border-t border-white/12 p-0">
              {service.items.map((item, i) => (
                <li key={item} className="grid grid-cols-[28px_minmax(0,1fr)] gap-2 border-b border-white/12 py-3 text-[14.5px]">
                  <span className="text-[#f2542d]" style={mono}>{String(i + 1).padStart(2, "0")}</span>{item}
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>

      <section className="border-t border-[#1d2022]/15 bg-[#fbfaf6]">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-14 md:grid-cols-2 md:px-8 md:py-20">
          <div>
            <h2 className="text-[clamp(1.8rem,3vw,2.4rem)] uppercase leading-none" style={display}>Para <em className="normal-case text-[#f2542d]" style={serif}>quem</em> é</h2>
            <p className="mt-4 max-w-[52ch] text-[#585d5b]">{service.fit}</p>
          </div>
          <div>
            <h2 className="text-[clamp(1.8rem,3vw,2.4rem)] uppercase leading-none" style={display}>O que não inclui</h2>
            <p className="mt-4 max-w-[52ch] text-[#585d5b]">{service.notIncluded}</p>
          </div>
        </div>
      </section>

      <section className="bg-[#131517] text-[#eceae4]">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-8 px-4 py-14 md:px-8 md:py-16">
          <h2 className="max-w-[18ch] text-[clamp(1.9rem,3.6vw,3rem)] uppercase leading-[0.95]" style={display}>
            Valor e prazo saem na <em className="normal-case text-[#f2542d]" style={serif}>proposta</em>.
          </h2>
          <div className="flex flex-wrap gap-3">
            <a href={contactUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-5 rounded-[2px] bg-[#f2542d] px-5 py-4 text-[15px] font-bold text-[#170904]">{service.cta} <span aria-hidden="true">→</span></a>
            <Link href="/servicos" className="inline-flex items-center rounded-[2px] border border-white/30 px-5 py-4 text-[15px] font-bold hover:border-white">Todos os serviços</Link>
            <Link href="/portfolio/index.html" className="inline-flex items-center rounded-[2px] border border-white/30 px-5 py-4 text-[15px] font-bold hover:border-white">Ver o portfólio</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
