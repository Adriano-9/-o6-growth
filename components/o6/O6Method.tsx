"use client";

import { motion } from "framer-motion";
import { BookOpen, Globe, TrendingUp, Eye } from "lucide-react";

const pillars = [
  {
    number: "01",
    icon: BookOpen,
    name: "Offer Book",
    tagline: "A fundação de tudo",
    description:
      "Antes de investir em tráfego ou tecnologia, mapeamos com precisão quem é o seu cliente ideal, o que ele teme, o que deseja e por que ainda não comprou de você. Construímos o posicionamento e a oferta certa para o público certo.",
    items: ["ICP & Avatar", "Psicografia & Medos", "Objeções & Desejos", "Oferta & Posicionamento"],
    color: "bg-brand-orange",
    textAccent: "text-brand-orange",
  },
  {
    number: "02",
    icon: Globe,
    name: "Authority Engine",
    tagline: "Sua presença que converte",
    description:
      "Construímos ou reestruturamos sua presença digital para que ela gere confiança e capture intenção de compra — no Google, nas buscas locais, nas landing pages e no perfil da empresa.",
    items: ["Site & Landing Pages", "SEO & GEO", "Google Business", "Schema & Autoridade"],
    color: "bg-brand-graphite",
    textAccent: "text-brand-graphite",
  },
  {
    number: "03",
    icon: TrendingUp,
    name: "Revenue Engine",
    tagline: "Do interesse ao fechamento",
    description:
      "Implementamos o sistema que garante que nenhum lead fique sem resposta. CRM estruturado, atendimento via WhatsApp, sequências de follow-up e automações que trabalham enquanto você atende pacientes.",
    items: ["CRM Estruturado", "WhatsApp Profissional", "Follow-up Automatizado", "Régua de Relacionamento"],
    color: "bg-brand-orange",
    textAccent: "text-brand-orange",
  },
  {
    number: "04",
    icon: Eye,
    name: "Intelligence Engine",
    tagline: "Visão completa do negócio",
    description:
      "Dashboard executivo com as métricas que importam: quantos leads entraram, quantos fecharam, quanto custou cada cliente, qual canal tem melhor retorno. Decisões baseadas em dados, não em intuição.",
    items: ["Dashboard Executivo", "CAC & ROI por Canal", "Taxa de Conversão", "Receita Previsível"],
    color: "bg-brand-graphite",
    textAccent: "text-brand-graphite",
  },
];

export default function O6Method() {
  return (
    <section id="metodo" className="w-full py-24 md:py-32 bg-brand-offwhite">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-[11px] font-black uppercase tracking-widest text-brand-orange block mb-4">
            O Método O6
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-brand-graphite leading-[0.92] mb-6">
            O sistema que fecha<br />o ciclo completo.
          </h2>
          <p className="text-base md:text-lg text-brand-graphite/60 leading-relaxed">
            Não vendemos uma ferramenta isolada. Construímos os quatro pilares que transformam um negócio de saúde, estética ou jurídico em uma máquina de crescimento previsível.
          </p>
        </div>

        {/* Pillar cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-white border-2 border-brand-graphite p-8 shadow-[4px_4px_0px_0px_#121212] flex flex-col gap-6"
            >
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 ${p.color} flex items-center justify-center shrink-0`}>
                  <p.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-6xl font-black text-brand-graphite/5 leading-none select-none">
                  {p.number}
                </span>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-graphite/40 mb-1">
                  {p.tagline}
                </p>
                <h3 className="text-2xl font-black uppercase tracking-tighter text-brand-graphite mb-4">
                  {p.name}
                </h3>
                <p className="text-sm text-brand-graphite/60 leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-auto">
                {p.items.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-[11px] font-bold text-brand-graphite/70"
                  >
                    <span className={`w-1.5 h-1.5 shrink-0 ${p.color}`} />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
