"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  PhoneOff,
  BarChart2,
  AlertTriangle,
  Stethoscope,
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
  "Clínicas Médicas",
  "Odontologia",
  "Estética Avançada",
  "Fisioterapia",
  "Dermatologia",
  "Harmonização Facial",
];

const problems = [
  {
    icon: Clock,
    title: "Paciente ligou e ninguém atendeu",
    description:
      "O paciente viu seu anúncio, ligou para agendar, mas a recepção estava ocupada. Ele já marcou no concorrente.",
    stat: "5 min",
    statLabel: "é o máximo que um paciente espera",
  },
  {
    icon: PhoneOff,
    title: "Orçamento enviado e esquecido",
    description:
      "O paciente pediu orçamento de um procedimento de R$ 3.000. Sua equipe mandou por WhatsApp. Ninguém fez follow-up. Ele nunca mais respondeu.",
    stat: "68%",
    statLabel: "dos orçamentos precisam de 3+ contatos para fechar",
  },
  {
    icon: BarChart2,
    title: "Investe em marketing sem saber o retorno",
    description:
      "Você paga Google Ads, Instagram e indicações — mas não sabe qual canal traz o paciente que realmente fecha o procedimento e paga.",
    stat: "R$ 0",
    statLabel: "de clareza sobre ROI por canal",
  },
];

const steps = [
  {
    number: "01",
    title: "Captação Inteligente",
    description:
      "Organizamos seus canais (Google, Instagram, indicações, site) para que cada paciente chegue qualificado e pronto para agendar.",
  },
  {
    number: "02",
    title: "Qualificação Automática",
    description:
      "O sistema avalia cada contato em segundos: interesse, perfil de ticket e procedimento desejado. A recepção só recebe quem tem perfil.",
  },
  {
    number: "03",
    title: "Atendimento Rápido",
    description:
      "Cada paciente é direcionado automaticamente para a pessoa certa. O tempo de resposta cai de horas para minutos.",
  },
  {
    number: "04",
    title: "Follow-up que Fecha",
    description:
      "Orçamentos pendentes recebem follow-up automático no timing certo. Nenhum paciente é esquecido — sua taxa de conversão sobe sem esforço.",
  },
];

const results = [
  { value: "3×", label: "mais agendamentos com follow-up estruturado" },
  { value: "30d", label: "para o sistema estar rodando" },
  { value: "-72%", label: "de pacientes perdidos por demora no atendimento" },
];

export default function SaudePage() {
  const [email, setEmail] = useState("");
  const [especialidade, setEspecialidade] = useState("Clínica Médica");
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
            <span className="font-black text-lg tracking-tighter text-brand-graphite uppercase">
              O6 Growth
            </span>
          </div>
          <a
            href="#diagnostico"
            className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-white bg-brand-orange px-5 py-2.5 shadow-[3px_3px_0px_0px_#121212] hover:shadow-[5px_5px_0px_0px_#121212] hover:-translate-y-px transition-all"
          >
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
                <Stethoscope className="w-4 h-4 text-brand-orange" />
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-graphite">
                  Para Clínicas e Consultórios
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-brand-graphite leading-[0.92] mb-6"
              >
                Sua agenda<br />
                <span className="text-brand-orange">cheia</span> de<br />
                pacientes<br />
                particulares.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.22 }}
                className="text-base md:text-lg text-brand-graphite/70 leading-relaxed max-w-lg mb-10"
              >
                Sistema comercial que capta, qualifica e acompanha cada paciente até o agendamento — sem depender da memória da recepcionista ou de planilha no WhatsApp.
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
                  Quero Mais Pacientes <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#como-funciona"
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
                  "Funciona para qualquer especialidade de saúde",
                  "Resultado mensurável em até 30 dias",
                  "Sem planilha, sem depender de memória",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-brand-orange shrink-0" />
                    <span className="text-sm font-semibold text-brand-graphite/70">{item}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col gap-4"
            >
              <div className="bg-brand-graphite text-white p-8 border-4 border-brand-graphite shadow-[8px_8px_0px_0px_#FF5722]">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Realidade das clínicas</p>
                <p className="text-5xl font-black tracking-tighter text-brand-orange mb-3">80%</p>
                <p className="text-sm text-white/80 leading-relaxed">
                  dos pacientes que não são atendidos em até 5 minutos <strong className="text-white">agendam no concorrente</strong>. Cada ligação perdida é um procedimento de R$ 2.500 que você não vai fazer.
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
                <p className="text-[9px] font-black uppercase tracking-widest text-brand-graphite/40 mb-3">Especialidades atendidas</p>
                <div className="flex flex-wrap gap-2">
                  {niches.map((p) => (
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

      {/* ── PROBLEMS ── */}
      <section className="w-full py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <span className="text-[11px] font-black uppercase tracking-widest text-brand-orange block mb-4">
              O problema real
            </span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-brand-graphite leading-[0.92] mb-6">
              Pacientes ligam.<br />
              A recepção não atende.<br />
              <span className="text-brand-graphite/30">E marcam no concorrente.</span>
            </h2>
            <p className="text-base md:text-lg text-brand-graphite/60 leading-relaxed max-w-2xl">
              O problema não é falta de pacientes. É falta de um sistema que garante que cada um deles seja atendido, acompanhado e convertido — sem depender de sorte.
            </p>
          </div>

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
                  Cada paciente não atendido em até 5 minutos é um procedimento de R$ 2.500 que vai para o concorrente.
                </p>
                <p className="text-sm text-white/60 max-w-2xl leading-relaxed">
                  Se sua clínica atende 100 ligações por mês e perde 30% por demora, são R$ 75.000 em receita perdida. Todo mês.
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
            <span className="text-xs font-black tracking-widest text-brand-orange uppercase block mb-3">
              COMO FUNCIONA
            </span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-brand-graphite leading-none">
              4 ETAPAS PARA LOTAR SUA AGENDA.
            </h2>
            <p className="mt-6 text-base md:text-lg text-brand-graphite/70 max-w-2xl font-normal leading-relaxed">
              Um sistema completo que cuida de cada etapa: da primeira ligação ao agendamento confirmado. Sem depender da memória da recepcionista.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
          >
            {steps.map((step, i) => (
              <motion.div
                key={i}
                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
                className="group bg-white border-2 border-brand-graphite p-8 md:p-10 relative flex flex-col min-h-[240px] shadow-[6px_6px_0px_0px_#121212] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_#121212] transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-brand-graphite flex items-center justify-center text-white font-mono text-xs font-bold">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-brand-graphite mb-4 group-hover:text-brand-orange transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs md:text-sm text-brand-graphite/70 leading-relaxed font-normal">
                  {step.description}
                </p>
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
            <span className="text-xs font-black tracking-widest text-brand-cyan uppercase block mb-3">
              RESULTADOS TÍPICOS
            </span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white leading-none">
              O QUE MUDA NOS PRIMEIROS 30 DIAS.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Calendar, value: "+40%", label: "agendamentos por mês", desc: "Com atendimento rápido e follow-up automático, a taxa de agendamento sobe já no primeiro mês." },
              { icon: Users, value: "3×", label: "mais pacientes particulares", desc: "Pacientes de alto ticket fecham quando são atendidos rápido e acompanhados até a consulta." },
              { icon: TrendingUp, value: "R$ 75k", label: "receita recuperada por trimestre", desc: "Em uma clínica com 100 leads/mês e ticket de R$ 2.500, a conversão extra representa R$ 75k/trimestre." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.12 }}
                className="bg-white/5 border border-white/10 p-8 flex flex-col gap-4"
              >
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
              <span className="text-xs font-black tracking-widest text-brand-orange uppercase">
                DIAGNÓSTICO GRATUITO
              </span>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-brand-graphite leading-none">
                DESCUBRA QUANTOS PACIENTES SUA CLÍNICA ESTÁ PERDENDO.
              </h2>
              <p className="text-sm md:text-base text-brand-graphite/70 leading-relaxed font-normal">
                Em 30 minutos, vamos mapear seu processo comercial, identificar onde os pacientes estão se perdendo e calcular quanto de receita você pode recuperar.
              </p>
            </div>

            <div className="lg:col-span-6 bg-white border border-brand-graphite/10 p-8 shadow-sm">
              <AnimatePresence mode="wait">
                {formState === "idle" && (
                  <motion.form key="form-idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} className="space-y-6">
                    <div className="pb-4 border-b border-brand-graphite/5">
                      <h3 className="text-sm font-black uppercase tracking-widest text-brand-graphite">AGENDAR DIAGNÓSTICO GRATUITO</h3>
                      <p className="text-[10px] text-brand-graphite/50 mt-1">PARA CLÍNICAS E CONSULTÓRIOS</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-brand-graphite/60 mb-2">Seu melhor e-mail</label>
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@clinica.com" className="w-full p-3.5 bg-brand-offwhite border border-brand-graphite/10 text-xs font-semibold text-brand-graphite focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-brand-graphite/60 mb-2">Especialidade</label>
                      <select value={especialidade} onChange={(e) => setEspecialidade(e.target.value)} className="w-full p-3.5 bg-brand-offwhite border border-brand-graphite/10 text-xs font-semibold text-brand-graphite focus:outline-none focus:border-brand-cyan transition-all">
                        <option>Clínica Médica</option>
                        <option>Odontologia</option>
                        <option>Estética / Harmonização</option>
                        <option>Fisioterapia</option>
                        <option>Dermatologia</option>
                        <option>Outra especialidade</option>
                      </select>
                    </div>
                    <button type="submit" className="w-full py-4 bg-brand-orange text-white font-black uppercase tracking-widest text-xs transition-all hover:bg-brand-orange/95 shadow-[4px_4px_0px_0px_#00E5FF] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#00E5FF]">
                      QUERO LOTAR MINHA AGENDA
                    </button>
                    <p className="text-[9px] text-brand-graphite/40 leading-snug text-center">Sem compromisso. Sem spam. Seus dados ficam seguros.</p>
                  </motion.form>
                )}
                {formState === "calculating" && (
                  <motion.div key="form-calc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12 flex flex-col items-center justify-center text-center">
                    <Cpu className="w-12 h-12 text-brand-cyan animate-spin mb-6" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-brand-graphite mb-2">ANALISANDO SUA CLÍNICA...</h3>
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
                      <p>ESPECIALIDADE: {especialidade}</p>
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
