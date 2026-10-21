"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Copy, Layers, MessageSquareText } from "lucide-react";

const problems = [
  {
    icon: MessageSquareText,
    title: "Comunicação sem direção",
    description:
      "A marca publica, anuncia e atualiza o site, mas cada peça parece falar de uma empresa diferente.",
    signal: "Marca sem mensagem central",
  },
  {
    icon: Copy,
    title: "Cópia sem contexto",
    description:
      "Repetir um formato viral sem entender o público, a oferta e a intenção por trás dele raramente constrói diferenciação.",
    signal: "Referência não é estratégia",
  },
  {
    icon: Layers,
    title: "Entregas desconectadas",
    description:
      "Campanha, site, vídeo e painel são produzidos separadamente, sem uma direção comum nem um objetivo claro.",
    signal: "Estratégia e execução separadas",
  },
];

export default function O6Problem() {
  return (
    <section id="fundacao" className="w-full py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-[11px] font-black uppercase tracking-widest text-brand-orange block mb-4">
            Antes de produzir
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-brand-graphite leading-[0.92] mb-6">
            Sua marca não precisa<br />
            de mais do mesmo.<br />
            <span className="text-brand-graphite/30">Precisa de direção.</span>
          </h2>
          <p className="text-base md:text-lg text-brand-graphite/60 leading-relaxed max-w-2xl">
            Antes de criar campanhas, sites ou vídeos, entendemos a marca, o público, a oferta e o contexto. Assim, as referências que já funcionam viram ideias próprias, coerentes com o negócio.
          </p>
        </div>

        {/* Problem cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {problems.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="bg-brand-offwhite border-2 border-brand-graphite p-8 shadow-[4px_4px_0px_0px_#121212] flex flex-col gap-6"
            >
              <div className="w-10 h-10 bg-brand-graphite flex items-center justify-center shrink-0">
                <p.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase tracking-tight text-brand-graphite mb-3">
                  {p.title}
                </h3>
                <p className="text-sm text-brand-graphite/60 leading-relaxed">
                  {p.description}
                </p>
              </div>
              <div className="mt-auto pt-6 border-t-2 border-brand-graphite/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-orange">{p.signal}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bold statement */}
        <div className="bg-brand-graphite p-10 md:p-14 border-4 border-brand-graphite shadow-[8px_8px_0px_0px_#FF5722]">
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
            <AlertTriangle className="w-12 h-12 text-brand-orange shrink-0" />
            <div>
              <p className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white leading-tight mb-2">
                Entender o que funciona é diferente de copiar o que viralizou.
              </p>
              <p className="text-sm text-white/60 max-w-2xl leading-relaxed">
                A O6 identifica a lógica por trás das referências e a adapta ao posicionamento, à oferta e ao público de cada marca.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
