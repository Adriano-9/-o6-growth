"use client";

import { motion } from "framer-motion";
import { Layers, Activity, Compass, Eye, ArrowUpRight } from "lucide-react";

export default function O6XSquad() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  };

  const squads = [
    {
      unit: "01",
      title: "Fundação estratégica e de marca",
      href: "/servicos/fundacao",
      icon: <Layers className="w-5 h-5 text-brand-orange" />,
      description: "Organizamos posicionamento, público, oferta, identidade visual e voz da marca para orientar decisões de comunicação e criação.",
      highlight: "Offer Book · Brand Book · Voz",
    },
    {
      unit: "02",
      title: "Campanhas, sites e landing pages",
      href: "/servicos/campanhas",
      icon: <Activity className="w-5 h-5 text-brand-orange" />,
      description: "Transformamos a direção estratégica em campanhas e experiências digitais com mensagem, design e ação conectados.",
      highlight: "Estratégia aplicada",
    },
    {
      unit: "03",
      title: "Vídeos, filmes e motion design",
      href: "/servicos/videos",
      icon: <Compass className="w-5 h-5 text-brand-orange" />,
      description: "Criamos peças audiovisuais da ideia à edição, com roteiro, storyboard, gravação ou assets, legendas e versões para cada canal.",
      highlight: "Da ideia ao vídeo final",
    },
    {
      unit: "04",
      title: "Dashboards e acompanhamento",
      href: "/servicos/dashboards",
      icon: <Eye className="w-5 h-5 text-brand-orange" />,
      description: "Organizamos indicadores e andamento do projeto em painéis claros. As métricas dependem das fontes de dados disponíveis e conectadas.",
      highlight: "Visibilidade do projeto",
    },
  ];

  return (
    <section id="metodo" className="w-full py-24 md:py-32 bg-brand-offwhite relative overflow-hidden border-t border-b border-brand-graphite/10">
      {/* Decorative Layer Grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#12121205_1px,transparent_1px),linear-gradient(to_bottom,#12121205_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      {/* Visual Contrast Shadows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="max-w-3xl mb-20">
          <span className="text-xs font-black tracking-widest text-brand-orange uppercase block mb-3">
            O QUE A O6 ENTREGA
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-brand-graphite leading-none">
            DA ESTRATÉGIA À PRODUÇÃO.
          </h2>
          <p className="mt-6 text-base md:text-lg text-brand-graphite/70 max-w-2xl font-normal leading-relaxed">
            Podemos começar pela fundação da marca ou entrar direto em uma entrega. Projetos pontuais e retainers são definidos conforme objetivo, volume e ritmo de produção.
          </p>
        </div>

        {/* Squad Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
        >
          {squads.map((squad, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="group bg-white border-2 border-brand-graphite p-8 md:p-10 relative flex flex-col justify-between min-h-[320px] shadow-[6px_6px_0px_0px_#121212] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_#121212] transition-all duration-300"
            >
              <div>
                {/* Top Row */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-graphite flex items-center justify-center text-white font-mono text-xs font-bold rounded-none">
                      {squad.unit}
                    </div>
                    <div className="p-2 bg-brand-offwhite border border-brand-graphite/10">
                      {squad.icon}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-graphite/40">{squad.unit}</span>
                </div>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-brand-graphite mb-4 group-hover:text-brand-orange transition-colors">
                  {squad.title}
                </h3>

                {/* Description */}
                <p className="text-xs md:text-sm text-brand-graphite/70 leading-relaxed font-normal mb-8">
                  {squad.description}
                </p>
              </div>

              {/* Bottom Row */}
              <div className="border-t border-brand-graphite/10 pt-4 flex justify-between items-center text-[10px] font-mono">
                <span className="text-brand-orange font-bold uppercase tracking-widest">
                  {squad.highlight}
                </span>
                <a href={squad.href} className="flex items-center gap-1 text-brand-graphite/60 hover:text-brand-orange transition-colors">
                  CONHECER <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Layer Separator Graphic */}
        <div className="mt-20 flex items-center gap-4 text-[10px] font-mono text-brand-graphite/30 uppercase tracking-widest justify-center">
          <div className="h-[1px] w-20 bg-brand-graphite/10" />
          <span>PROJETOS PONTUAIS · RETAINER MENSAL</span>
          <div className="h-[1px] w-20 bg-brand-graphite/10" />
        </div>

      </div>
    </section>
  );
}
