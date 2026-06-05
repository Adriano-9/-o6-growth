"use client";

import { motion } from "framer-motion";
import { Layers, Activity, Compass, Eye, ShieldCheck, ArrowUpRight } from "lucide-react";

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
      unit: "UT-01",
      title: "Engenharia de Tráfego e Intenção",
      icon: <Layers className="w-5 h-5 text-brand-orange" />,
      description: "Estabilização e otimização dos vetores de entrada de leads. Filtramos e calibramos os canais de atração para maximizar a densidade de intenção inicial antes que ocorra a dispersão térmica.",
      highlight: "Minimização de Dispersão",
    },
    {
      unit: "UT-02",
      title: "Triagem e Qualificação Autónoma",
      icon: <Activity className="w-5 h-5 text-brand-cyan" />,
      description: "Processamento analítico instantâneo. Implementação de algoritmos de qualificação estatística que avaliam o enquadramento comercial em menos de 10 segundos, eliminando a fricção humana.",
      highlight: "Processamento < 10 Segundos",
    },
    {
      unit: "UT-03",
      title: "Roteamento Matricial de Latência Zero",
      icon: <Compass className="w-5 h-5 text-brand-orange" />,
      description: "Direcionamento automático de alta fidelidade. O vetor do lead qualificado é distribuído instantaneamente para a interface de conversão apropriada, assegurando que o tempo de resposta se aproxima de zero.",
      highlight: "Latência Operacional Nula",
    },
    {
      unit: "UT-04",
      title: "Telemetria de ROI e Inteligência de Negócio",
      icon: <Eye className="w-5 h-5 text-brand-cyan" />,
      description: "Infraestrutura de diagnóstico contínuo. Calibramos os fluxos financeiros e fornecemos dashboards analíticos em tempo real que geram visão de Raio-X do pipeline de aquisição.",
      highlight: "Visão Raio-X de Conversão",
    },
  ];

  return (
    <section id="xsquad" className="w-full py-24 md:py-32 bg-brand-offwhite relative overflow-hidden border-t border-b border-brand-graphite/10">
      {/* Decorative Layer Grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#12121205_1px,transparent_1px),linear-gradient(to_bottom,#12121205_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      {/* Visual Contrast Shadows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="max-w-3xl mb-20">
          <span className="text-xs font-black tracking-widest text-brand-orange uppercase block mb-3">
            UNIDADES TÁTICAS DE OPERAÇÃO
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-brand-graphite leading-none">
            AS DIVISÕES FUNCIONAIS DA XSQUAD.
          </h2>
          <p className="mt-6 text-base md:text-lg text-brand-graphite/70 max-w-2xl font-normal leading-relaxed">
            Estrutura operacional matricial de alta performance. Cada divisão executa uma etapa específica do processo de retenção e qualificação, anulando a latência do canal.
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
                  <span className="text-[10px] font-mono text-brand-graphite/40 font-bold uppercase tracking-wider flex items-center gap-1">
                    Ativo <ShieldCheck className="w-3 h-3 text-brand-cyan animate-pulse" />
                  </span>
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
                <span className="text-brand-graphite/40 group-hover:text-brand-graphite flex items-center gap-1 transition-colors">
                  VER MÉTRICAS <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Layer Separator Graphic */}
        <div className="mt-20 flex items-center gap-4 text-[10px] font-mono text-brand-graphite/30 uppercase tracking-widest justify-center">
          <div className="h-[1px] w-20 bg-brand-graphite/10" />
          <span>XSQUAD MULTI-AGENT PROTOCOL v1.8</span>
          <div className="h-[1px] w-20 bg-brand-graphite/10" />
        </div>

      </div>
    </section>
  );
}
