"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Clock, PhoneOff, BarChart2 } from "lucide-react";

const problems = [
  {
    icon: Clock,
    title: "Demora no primeiro contato",
    description:
      "O lead preencheu o formulário, mas sua equipe demorou 30 minutos para responder. Ele já fechou com o concorrente.",
    stat: "5 min",
    statLabel: "é o tempo máximo antes de o lead esfriar",
  },
  {
    icon: PhoneOff,
    title: "Sem follow-up estruturado",
    description:
      "O cliente disse 'vou pensar'. A recepcionista anotou no papel. Três dias depois ninguém lembrou de ligar. A venda morreu.",
    stat: "68%",
    statLabel: "das vendas exigem 5+ contatos para fechar",
  },
  {
    icon: BarChart2,
    title: "Decisões sem dados",
    description:
      "Você investe em Google Ads, Instagram e indicações — mas não sabe qual canal traz o cliente que realmente fecha e paga.",
    stat: "0",
    statLabel: "clareza sobre ROI por canal",
  },
];

export default function O6Problem() {
  return (
    <section id="problema" className="w-full py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-[11px] font-black uppercase tracking-widest text-brand-orange block mb-4">
            O problema real
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-brand-graphite leading-[0.92] mb-6">
            Você investe em marketing.<br />
            Os leads chegam.<br />
            <span className="text-brand-graphite/30">E desaparecem.</span>
          </h2>
          <p className="text-base md:text-lg text-brand-graphite/60 leading-relaxed max-w-2xl">
            O problema não é a falta de leads. É a ausência de um sistema que os captura, nutre e converte de forma consistente — independente do dia da semana, do humor da equipe ou do volume de atendimentos.
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
                <p className="text-3xl font-black text-brand-orange tracking-tighter">{p.stat}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-brand-graphite/50 mt-1">{p.statLabel}</p>
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
                Cada lead não atendido em até 5 minutos tem 80% menos chance de fechar.
              </p>
              <p className="text-sm text-white/60 max-w-2xl leading-relaxed">
                Não é opinião. São os dados do mercado. Enquanto você não tem um sistema — está perdendo receita todos os dias.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
