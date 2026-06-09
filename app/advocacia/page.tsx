"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  PhoneOff,
  BarChart2,
  AlertTriangle,
  Scale,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Cpu,
  Sparkles,
} from "lucide-react";
import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";

const niches = [
  "Direito Civil",
  "Direito Trabalhista",
  "Direito Tributário",
  "Direito Empresarial",
  "Direito de Família",
  "Direito Imobiliário",
];

const problems = [
  {
    icon: Clock,
    title: "Cliente ligou e ninguém retornou",
    description:
      "A pessoa pesquisou 'advogado trabalhista', encontrou seu escritório e mandou mensagem. Sua secretária só viu 2 horas depois. Ele já fechou com outro.",
    stat: "5 min",
    statLabel: "é o máximo que um potencial cliente espera",
  },
  {
    icon: PhoneOff,
    title: "Consulta feita, proposta esquecida",
    description:
      "O cliente veio na consulta inicial, gostou, pediu proposta de honorários. Ninguém fez follow-up. Ele contratou quem ligou primeiro.",
    stat: "72%",
    statLabel: "dos clientes fecham com quem responde primeiro",
  },
  {
    icon: BarChart2,
    title: "Depende 100% de indicação",
    description:
      "Seu escritório cresce quando alguém indica. Quando não indica, a agenda esvazia. Não existe um canal previsível de novos clientes.",
    stat: "0",
    statLabel: "canais de captação estruturados",
  },
];

const steps = [
  {
    number: "01",
    title: "Captação Estruturada",
    description:
      "Criamos canais de entrada que atraem clientes com perfil ideal para sua área de atuação — Google, site, conteúdo — além de indicações.",
  },
  {
    number: "02",
    title: "Qualificação Automática",
    description:
      "Cada contato é avaliado automaticamente: tipo de caso, perfil de honorários, urgência. Sua equipe só recebe quem vale uma conversa.",
  },
  {
    number: "03",
    title: "Atendimento Rápido",
    description:
      "O potencial cliente é respondido em minutos, não horas. A primeira impressão do seu escritório é de agilidade e profissionalismo.",
  },
  {
    number: "04",
    title: "Follow-up até o Fechamento",
    description:
      "Propostas enviadas recebem acompanhamento automático. Nenhum cliente 'esfria' por falta de retorno — sua taxa de conversão sobe sem esforço extra.",
  },
];

const results = [
  { value: "3×", label: "mais clientes sem depender de indicação" },
  { value: "30d", label: "para o sistema estar funcionando" },
  { value: "-65%", label: "de propostas perdidas por falta de follow-up" },
];

export default function AdvocaciaPage() {
  const [email, setEmail] = useState("");
  const [area, setArea] = useState("Direito Civil");
  const [formState, setFormState] = useState<"idle" | "calculating" | "success">("idle");
  const [progress, setProgress] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setFormState("calculating");
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setFormState("success"), 400);
          return 100;
        }
        return prev + 10;
      });
    }, 120);
  };

  return (
    <main className="min-h-screen flex flex-col bg-brand-offwhite selection:bg-brand-cyan selection:text-brand-graphite">

      {/* ── HERO ── */}
      <section className="relative w-full min-h-screen bg-brand-offwhite flex flex-col overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#12121206_1px,transparent_1px),linear-gradient(to_bottom,#12121206_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none" />

        <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-graphite flex items-center justify-center">
              <span className="text-white font-black text-sm">O6</span>
            </div>
            <span className="font-black text-lg tracking-tighter text-brand-graphite uppercase">O6 Growth</span>
          </div>
          <a href="#diagnostico" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-white bg-brand-orange px-5 py-2.5 shadow-[3px_3px_0px_0px_#121212] hover:shadow-[5px_5px_0px_0px_#121212] hover:-translate-y-px transition-all">
            Diagnóstico Grátis
          </a>
        </header>

        <div className="relative z-10 flex-1 flex items-center w-full max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">

            <div className="flex flex-col">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-brand-graphite shadow-[3px_3px_0px_0px_#121212] mb-8 self-start"
              >
                <Scale className="w-4 h-4 text-brand-orange" />
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-graphite">
                  Para Escritórios de Advocacia
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-brand-graphite leading-[0.92] mb-6"
              >
                Novos clientes<br />
                <span className="text-brand-orange">sem depender</span><br />
                de indicação.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.22 }}
                className="text-base md:text-lg text-brand-graphite/70 leading-relaxed max-w-lg mb-10"
              >
                Sistema comercial que atrai, qualifica e acompanha potenciais clientes do primeiro contato ao fechamento de honorários — de forma previsível e profissional.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.32 }}
                className="flex flex-col sm:flex-row gap-4 mb-12"
              >
                <a href="#diagnostico" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-orange text-white font-black uppercase tracking-widest text-xs shadow-[4px_4px_0px_0px_#121212] hover:shadow-[6px_6px_0px_0px_#121212] hover:-translate-y-px transition-all">
                  Quero Mais Clientes <ArrowRight className="w-4 h-4" />
                </a>
                <a href="#como-funciona" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-brand-graphite text-brand-graphite font-black uppercase tracking-widest text-xs shadow-[4px_4px_0px_0px_#121212] hover:bg-brand-graphite hover:text-white transition-all">
                  Ver Como Funciona
                </a>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }} className="flex flex-col gap-3">
                {[
                  "Funciona para qualquer área do Direito",
                  "Resultado mensurável em até 30 dias",
                  "Compatível com as regras da OAB",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-brand-orange shrink-0" />
                    <span className="text-sm font-semibold text-brand-graphite/70">{item}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="flex flex-col gap-4">
              <div className="bg-brand-graphite text-white p-8 border-4 border-brand-graphite shadow-[8px_8px_0px_0px_#FF5722]">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Realidade dos escritórios</p>
                <p className="text-5xl font-black tracking-tighter text-brand-orange mb-3">72%</p>
                <p className="text-sm text-white/80 leading-relaxed">
                  dos potenciais clientes fecham com o <strong className="text-white">primeiro advogado que responde</strong>. Se você demora, o cliente vai para quem foi mais rápido.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {results.map((card, i) => (
                  <div key={i} className="bg-white border-2 border-brand-graphite p-4 shadow-[3px_3px_0px_0px_#121212]">
                    <p className="text-2xl font-black text-brand-graphite tracking-tighter">{card.value}</p>
                    <p className="text-[10px] text-brand-graphite/60 leading-snug mt-1">{card.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white border-2 border-brand-graphite p-4 shadow-[3px_3px_0px_0px_#121212]">
                <p className="text-[9px] font-black uppercase tracking-widest text-brand-graphite/40 mb-3">Áreas atendidas</p>
                <div className="flex flex-wrap gap-2">
                  {niches.map((p) => (
                    <span key={p} className="px-3 py-1 bg-brand-offwhite border border-brand-graphite/20 text-[10px] font-bold text-brand-graphite uppercase tracking-wider">{p}</span>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── PROBLEMS ── */}
      <section className="w-full py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <span className="text-[11px] font-black uppercase tracking-widest text-brand-orange block mb-4">O problema real</span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-brand-graphite leading-[0.92] mb-6">
              Você depende de indicação.<br />
              Quando não vem,<br />
              <span className="text-brand-graphite/30">a agenda esvazia.</span>
            </h2>
            <p className="text-base md:text-lg text-brand-graphite/60 leading-relaxed max-w-2xl">
              O problema não é falta de demanda jurídica. É falta de um sistema que gera clientes de forma previsível — sem depender de quem conhece quem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {problems.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.1 }} className="bg-brand-offwhite border-2 border-brand-graphite p-8 shadow-[4px_4px_0px_0px_#121212] flex flex-col gap-6">
                <div className="w-10 h-10 bg-brand-graphite flex items-center justify-center shrink-0">
                  <p.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-tight text-brand-graphite mb-3">{p.title}</h3>
                  <p className="text-sm text-brand-graphite/60 leading-relaxed">{p.description}</p>
                </div>
                <div className="mt-auto pt-6 border-t-2 border-brand-graphite/10">
                  <p className="text-3xl font-black text-brand-orange tracking-tighter">{p.stat}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-brand-graphite/50 mt-1">{p.statLabel}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-brand-graphite p-10 md:p-14 border-4 border-brand-graphite shadow-[8px_8px_0px_0px_#FF5722]">
            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
              <AlertTriangle className="w-12 h-12 text-brand-orange shrink-0" />
              <div>
                <p className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white leading-tight mb-2">
                  Se seu escritório atende 30 consultas por mês e perde 40% por falta de follow-up, são R$ 36.000 em honorários perdidos.
                </p>
                <p className="text-sm text-white/60 max-w-2xl leading-relaxed">
                  Com honorário médio de R$ 3.000, cada cliente perdido dói no caixa. E a maioria se perde simplesmente porque ninguém fez o segundo contato.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="como-funciona" className="w-full py-24 md:py-32 bg-brand-offwhite border-t border-b border-brand-graphite/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#12121205_1px,transparent_1px),linear-gradient(to_bottom,#12121205_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl mb-20">
            <span className="text-xs font-black tracking-widest text-brand-orange uppercase block mb-3">COMO FUNCIONA</span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-brand-graphite leading-none">
              4 ETAPAS PARA CLIENTES PREVISÍVEIS.
            </h2>
            <p className="mt-6 text-base md:text-lg text-brand-graphite/70 max-w-2xl font-normal leading-relaxed">
              Um sistema que cuida de cada etapa: do primeiro contato ao fechamento de honorários. Respeitando as regras da OAB e a imagem do seu escritório.
            </p>
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {steps.map((step, i) => (
              <motion.div key={i} variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }} className="group bg-white border-2 border-brand-graphite p-8 md:p-10 relative flex flex-col min-h-[240px] shadow-[6px_6px_0px_0px_#121212] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_#121212] transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-brand-graphite flex items-center justify-center text-white font-mono text-xs font-bold">{step.number}</div>
                </div>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-brand-graphite mb-4 group-hover:text-brand-orange transition-colors">{step.title}</h3>
                <p className="text-xs md:text-sm text-brand-graphite/70 leading-relaxed font-normal">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="w-full py-24 md:py-32 bg-brand-graphite text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-black tracking-widest text-brand-cyan uppercase block mb-3">RESULTADOS TÍPICOS</span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white leading-none">O QUE MUDA NOS PRIMEIROS 30 DIAS.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Calendar, value: "+50%", label: "mais consultas agendadas", desc: "Com atendimento rápido e follow-up automático, a taxa de agendamento de consultas iniciais sobe no primeiro mês." },
              { icon: Users, value: "3×", label: "mais clientes fechados", desc: "Potenciais clientes que recebem follow-up no timing certo fecham 3 vezes mais do que os que ficam sem retorno." },
              { icon: TrendingUp, value: "R$ 36k", label: "receita recuperada por trimestre", desc: "Em um escritório com 30 consultas/mês e honorário de R$ 3.000, a conversão extra representa R$ 36k/trimestre." },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.12 }} className="bg-white/5 border border-white/10 p-8 flex flex-col gap-4">
                <item.icon className="w-8 h-8 text-brand-cyan" />
                <p className="text-4xl font-black text-brand-orange tracking-tighter">{item.value}</p>
                <p className="text-xs font-black uppercase tracking-wider text-white/80">{item.label}</p>
                <p className="text-sm text-white/60 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="diagnostico" className="w-full bg-brand-offwhite border-t border-brand-graphite/10 pt-24 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#12121203_1px,transparent_1px),linear-gradient(to_bottom,#12121203_1px,transparent_1px)] bg-[size:6rem_6rem] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">

            <div className="lg:col-span-6 flex flex-col gap-6">
              <span className="text-xs font-black tracking-widest text-brand-orange uppercase">DIAGNÓSTICO GRATUITO</span>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-brand-graphite leading-none">
                DESCUBRA QUANTOS CLIENTES SEU ESCRITÓRIO ESTÁ PERDENDO.
              </h2>
              <p className="text-sm md:text-base text-brand-graphite/70 leading-relaxed font-normal">
                Em 30 minutos, mapeamos seu processo comercial, identificamos onde os clientes estão se perdendo e calculamos quanto de honorários você pode recuperar.
              </p>
            </div>

            <div className="lg:col-span-6 bg-white border border-brand-graphite/10 p-8 shadow-sm">
              <AnimatePresence mode="wait">
                {formState === "idle" && (
                  <motion.form key="form-idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} className="space-y-6">
                    <div className="pb-4 border-b border-brand-graphite/5">
                      <h3 className="text-sm font-black uppercase tracking-widest text-brand-graphite">AGENDAR DIAGNÓSTICO GRATUITO</h3>
                      <p className="text-[10px] text-brand-graphite/50 mt-1">PARA ESCRITÓRIOS DE ADVOCACIA</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-brand-graphite/60 mb-2">Seu melhor e-mail</label>
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@escritorio.com" className="w-full p-3.5 bg-brand-offwhite border border-brand-graphite/10 text-xs font-semibold text-brand-graphite focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-brand-graphite/60 mb-2">Área de atuação principal</label>
                      <select value={area} onChange={(e) => setArea(e.target.value)} className="w-full p-3.5 bg-brand-offwhite border border-brand-graphite/10 text-xs font-semibold text-brand-graphite focus:outline-none focus:border-brand-cyan transition-all">
                        <option>Direito Civil</option>
                        <option>Direito Trabalhista</option>
                        <option>Direito Tributário</option>
                        <option>Direito Empresarial</option>
                        <option>Direito de Família</option>
                        <option>Direito Imobiliário</option>
                        <option>Outra área</option>
                      </select>
                    </div>
                    <button type="submit" className="w-full py-4 bg-brand-orange text-white font-black uppercase tracking-widest text-xs transition-all hover:bg-brand-orange/95 shadow-[4px_4px_0px_0px_#00E5FF] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#00E5FF]">
                      QUERO MAIS CLIENTES NO MEU ESCRITÓRIO
                    </button>
                    <p className="text-[9px] text-brand-graphite/40 leading-snug text-center">Sem compromisso. Sem spam. Seus dados ficam seguros.</p>
                  </motion.form>
                )}
                {formState === "calculating" && (
                  <motion.div key="form-calc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12 flex flex-col items-center justify-center text-center">
                    <Cpu className="w-12 h-12 text-brand-cyan animate-spin mb-6" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-brand-graphite mb-2">ANALISANDO SEU ESCRITÓRIO...</h3>
                    <div className="w-48 h-1.5 bg-brand-graphite/10 mb-4 overflow-hidden relative">
                      <motion.div className="h-full bg-brand-cyan" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-[10px] text-brand-graphite/50">{progress}%</span>
                  </motion.div>
                )}
                {formState === "success" && (
                  <motion.div key="form-success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-8 flex flex-col items-center justify-center text-center">
                    <CheckCircle2 className="w-14 h-14 text-brand-cyan mb-6" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-brand-graphite mb-2">DIAGNÓSTICO AGENDADO!</h3>
                    <p className="text-xs text-brand-graphite/70 max-w-sm leading-relaxed mb-6">
                      Um consultor da O6 vai entrar em contato em até 15 minutos para agendar sua sessão gratuita.
                    </p>
                    <div className="w-full bg-brand-offwhite border border-brand-cyan/20 p-4 font-mono text-[9px] text-left text-brand-graphite/70 space-y-1">
                      <p className="text-brand-orange font-bold uppercase mb-1 flex items-center gap-1"><Sparkles className="w-3 h-3" /> CONFIRMAÇÃO</p>
                      <p>EMAIL: {email}</p>
                      <p>ÁREA: {area}</p>
                      <p>STATUS: RETORNO EM ATÉ 15 MINUTOS</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          <footer className="border-t border-brand-graphite/10 pt-12 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-semibold text-brand-graphite/50 tracking-wider">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-brand-graphite flex items-center justify-center">
                <span className="text-white font-black text-xs">O6</span>
              </div>
              <span className="font-black text-xs text-brand-graphite uppercase tracking-tighter">O6 Growth</span>
            </div>
            <span>&copy; 2026 O6 Growth. Todos os direitos reservados.</span>
          </footer>
        </div>
      </section>

    </main>
  );
}
