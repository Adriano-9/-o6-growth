"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";

const proofs = [
  "Clínicas Médicas",
  "Odontologia",
  "Estética",
  "Fisioterapia",
  "Advocacia",
];

export default function O6Hero() {
  const statCardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: statCardRef,
    offset: ["start end", "end start"],
  });
  const videoScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.3]);
  const videoOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.35, 0.5, 0.28]);

  return (
    <section className="relative w-full min-h-screen bg-brand-offwhite flex flex-col overflow-hidden">
      {/* Subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#12121206_1px,transparent_1px),linear-gradient(to_bottom,#12121206_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none" />

      {/* Nav */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-graphite flex items-center justify-center">
            <span className="text-white font-black text-sm">O6</span>
          </div>
          <span className="font-black text-lg tracking-tighter text-brand-graphite uppercase">
            O6 Growth
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold tracking-widest text-brand-graphite/60 uppercase">
          <a href="/produto/diagnostico" className="hover:text-brand-graphite transition-colors">Diagnóstico</a>
          <a href="#metodo" className="hover:text-brand-graphite transition-colors">Método</a>
          <a href="#nichos" className="hover:text-brand-graphite transition-colors">Nichos</a>
          <a href="#processo" className="hover:text-brand-graphite transition-colors">Como Funciona</a>
          <a href="#faq" className="hover:text-brand-graphite transition-colors">FAQ</a>
        </nav>

        <a
          href="#diagnostico"
          className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-white bg-brand-orange px-5 py-2.5 shadow-[3px_3px_0px_0px_#121212] hover:shadow-[5px_5px_0px_0px_#121212] hover:-translate-y-px transition-all"
        >
          Diagnóstico Grátis
        </a>
      </header>

      {/* Hero Body */}
      <div className="relative z-10 flex-1 flex items-center w-full max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">

          {/* Left */}
          <div className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-brand-graphite shadow-[3px_3px_0px_0px_#121212] mb-8 self-start"
            >
              <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-graphite">
                Sistema de Crescimento Previsível
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-brand-graphite leading-[0.92] mb-6"
            >
              Interesse em<br />
              <span className="text-brand-orange">Receita</span><br />
              Previsível.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.22 }}
              className="text-base md:text-lg text-brand-graphite/70 leading-relaxed max-w-lg mb-10"
            >
              A O6 constrói sistemas de aquisição, conversão e inteligência para clínicas, consultórios e escritórios que querem crescer com consistência — não com sorte.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.32 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <a
                href="#diagnostico"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-orange text-white font-black uppercase tracking-widest text-xs shadow-[4px_4px_0px_0px_#121212] hover:shadow-[6px_6px_0px_0px_#121212] hover:-translate-y-px transition-all"
              >
                Quero um Diagnóstico Gratuito <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#metodo"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-brand-graphite text-brand-graphite font-black uppercase tracking-widest text-xs shadow-[4px_4px_0px_0px_#121212] hover:bg-brand-graphite hover:text-white transition-all"
              >
                Ver Como Funciona
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col gap-3"
            >
              {[
                "Sem promessas vazias — sistema estruturado do zero",
                "Resultado mensurável em até 30 dias",
                "Dedicado a negócios de saúde, estética e jurídico",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-brand-orange shrink-0" />
                  <span className="text-sm font-semibold text-brand-graphite/70">{item}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Visual card stack */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-4"
          >
            {/* Main stat card — video background with scroll-linked scale/fade */}
            <div
              ref={statCardRef}
              className="relative overflow-hidden bg-brand-graphite text-white p-8 border-4 border-brand-graphite shadow-[8px_8px_0px_0px_#FF5722]"
            >
              <motion.video
                src="/videos/o6-growth-hero.mp4"
                autoPlay
                muted
                loop
                playsInline
                style={{ scale: videoScale, opacity: videoOpacity }}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-brand-graphite/90 via-brand-graphite/75 to-brand-graphite/90" />
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Realidade do mercado</p>
                <p className="text-5xl font-black tracking-tighter text-brand-orange mb-3">80%</p>
                <p className="text-sm text-white/80 leading-relaxed">
                  dos leads que não são atendidos em até 5 minutos <strong className="text-white">nunca fecham</strong>. Seu concorrente está aproveitando essa janela.
                </p>
              </div>
            </div>

            {/* 3 small cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { number: "3×", label: "mais conversões com follow-up estruturado" },
                { number: "30d", label: "para o sistema estar funcionando" },
                { number: "100%", label: "visibilidade sobre cada lead e cada real investido" },
              ].map((card, i) => (
                <div key={i} className="bg-white border-2 border-brand-graphite p-4 shadow-[3px_3px_0px_0px_#121212]">
                  <p className="text-2xl font-black text-brand-graphite tracking-tighter">{card.number}</p>
                  <p className="text-[10px] text-brand-graphite/60 leading-snug mt-1">{card.label}</p>
                </div>
              ))}
            </div>

            {/* Niche strip */}
            <div className="bg-white border-2 border-brand-graphite p-4 shadow-[3px_3px_0px_0px_#121212]">
              <p className="text-[9px] font-black uppercase tracking-widest text-brand-graphite/40 mb-3">Desenvolvido para</p>
              <div className="flex flex-wrap gap-2">
                {proofs.map((p) => (
                  <span
                    key={p}
                    className="px-3 py-1 bg-brand-offwhite border border-brand-graphite/20 text-[10px] font-bold text-brand-graphite uppercase tracking-wider"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
