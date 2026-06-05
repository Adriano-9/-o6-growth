"use client";

import { motion } from "framer-motion";
import { Globe, FileText, Search, MapPin, Star, Code2, ArrowRight } from "lucide-react";

const components = [
  {
    icon: Globe,
    title: "Site Profissional",
    description:
      "Estruturado para converter, não apenas para existir. Velocidade, mobile-first, CTA em cada seção e narrativa que conduz o visitante ao agendamento.",
  },
  {
    icon: FileText,
    title: "Landing Pages",
    description:
      "Páginas dedicadas para cada serviço ou campanha. Sem distrações, com foco único no próximo passo do visitante.",
  },
  {
    icon: Search,
    title: "SEO",
    description:
      "Otimização para que seu negócio apareça quando o cliente certo busca no Google. Conteúdo estratégico, arquitetura técnica e autoridade de domínio.",
  },
  {
    icon: MapPin,
    title: "GEO — Busca Local",
    description:
      "Posicionamento para buscas geográficas. 'Dentista em [cidade]', 'clínica estética próxima de mim'. Captura intenção de compra local de alta conversão.",
  },
  {
    icon: Star,
    title: "Google Business",
    description:
      "Perfil otimizado, avaliações gerenciadas e informações corretas. O Google Business é a vitrine digital mais visitada do seu negócio.",
  },
  {
    icon: Code2,
    title: "Schema & Dados Estruturados",
    description:
      "Marcação técnica que comunica ao Google exatamente o que você faz, onde está e quem você atende — aumentando a relevância nas buscas.",
  },
];

export default function O6AuthorityEngine() {
  return (
    <section id="authority-engine" className="w-full py-24 md:py-32 bg-brand-offwhite">
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

          {/* Left sticky header */}
          <div className="lg:col-span-4 lg:sticky lg:top-10">
            <span className="text-[11px] font-black uppercase tracking-widest text-brand-orange block mb-4">
              Pilar 02 — Authority Engine
            </span>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-brand-graphite leading-[0.92] mb-6">
              Sua autoridade<br />digital<br />em ordem.
            </h2>
            <p className="text-sm text-brand-graphite/60 leading-relaxed mb-8">
              De nada adianta ter a melhor clínica da cidade se o cliente não te encontra online — ou te encontra e não confia. O Authority Engine constrói a presença digital que gera credibilidade e captura demanda.
            </p>
            <a
              href="#diagnostico"
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white bg-brand-orange px-6 py-3 shadow-[3px_3px_0px_0px_#121212] hover:shadow-[5px_5px_0px_0px_#121212] hover:-translate-y-px transition-all"
            >
              Auditar minha presença <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Right — component grid */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {components.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="bg-white border-2 border-brand-graphite p-6 shadow-[3px_3px_0px_0px_#121212] flex flex-col gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-brand-graphite flex items-center justify-center shrink-0">
                    <c.icon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-brand-graphite">
                    {c.title}
                  </h3>
                </div>
                <p className="text-[12px] text-brand-graphite/60 leading-relaxed">
                  {c.description}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
