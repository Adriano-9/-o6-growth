"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, ShieldAlert, Cpu, Sparkles } from "lucide-react";
import React, { useState } from "react";

export default function O6Footer() {
  const [email, setEmail] = useState("");
  const [volume, setVolume] = useState("< 50");
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
          setTimeout(() => {
            setFormState("success");
          }, 400);
          return 100;
        }
        return prev + 10;
      });
    }, 120);
  };

  return (
    <section id="diagnostico" className="w-full bg-brand-offwhite border-t border-brand-graphite/10 pt-24 pb-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#12121203_1px,transparent_1px),linear-gradient(to_bottom,#12121203_1px,transparent_1px)] bg-[size:6rem_6rem] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-cyan/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">

          <div className="lg:col-span-6 flex flex-col gap-6">
            <span className="text-xs font-black tracking-widest text-brand-orange uppercase">
              DIAGNÓSTICO GRATUITO
            </span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-brand-graphite leading-none">
              DESCUBRA QUANTOS CLIENTES VOCÊ ESTÁ PERDENDO.
            </h2>
            <p className="text-sm md:text-base text-brand-graphite/70 leading-relaxed font-normal">
              Agende um diagnóstico gratuito de 30 minutos. Vamos analisar seu processo comercial, identificar onde os leads estão se perdendo e mostrar quanto de receita você pode recuperar nos próximos 30 dias.
            </p>

            <div className="flex flex-col gap-4 mt-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-none bg-brand-graphite flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-brand-graphite">
                    Mapeamento do Processo
                  </h4>
                  <p className="text-[11px] text-brand-graphite/60 mt-0.5">
                    Identificamos exatamente onde e por que os leads deixam de virar clientes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-none bg-brand-graphite flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-brand-graphite">
                    Projeção de Resultado
                  </h4>
                  <p className="text-[11px] text-brand-graphite/60 mt-0.5">
                    Calculamos quanto de receita você pode ganhar com atendimento rápido e follow-up estruturado.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white border border-brand-graphite/10 p-8 shadow-sm">

            <AnimatePresence mode="wait">
              {formState === "idle" && (
                <motion.form
                  key="form-idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="pb-4 border-b border-brand-graphite/5">
                    <h3 className="text-sm font-black uppercase tracking-widest text-brand-graphite">
                      AGENDAR DIAGNÓSTICO GRATUITO
                    </h3>
                    <p className="text-[10px] text-brand-graphite/50 mt-1">
                      PREENCHA PARA RECEBER SUA ANÁLISE PERSONALIZADA
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-brand-graphite/60 mb-2">
                      Seu melhor e-mail
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full p-3.5 bg-brand-offwhite border border-brand-graphite/10 text-xs font-semibold text-brand-graphite focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-brand-graphite/60 mb-2">
                      Quantos leads você recebe por mês?
                    </label>
                    <select
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                      className="w-full p-3.5 bg-brand-offwhite border border-brand-graphite/10 text-xs font-semibold text-brand-graphite focus:outline-none focus:border-brand-cyan transition-all"
                    >
                      <option value="< 50">Menos de 50 leads/mês</option>
                      <option value="50 - 200">50 a 200 leads/mês</option>
                      <option value="200 - 500">200 a 500 leads/mês</option>
                      <option value="500+">Mais de 500 leads/mês</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-brand-orange text-white font-black uppercase tracking-widest text-xs transition-all hover:bg-brand-orange/95 shadow-[4px_4px_0px_0px_#00E5FF] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#00E5FF]"
                  >
                    QUERO MEU DIAGNÓSTICO GRATUITO
                  </button>

                  <p className="text-[9px] text-brand-graphite/40 leading-snug text-center">
                    Sem compromisso. Sem spam. Seus dados ficam seguros.
                  </p>
                </motion.form>
              )}

              {formState === "calculating" && (
                <motion.div
                  key="form-calc"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 flex flex-col items-center justify-center text-center font-mono"
                >
                  <Cpu className="w-12 h-12 text-brand-cyan animate-spin mb-6" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-brand-graphite mb-2">
                    PREPARANDO SEU DIAGNÓSTICO...
                  </h3>
                  <div className="w-48 h-1.5 bg-brand-graphite/10 mb-4 overflow-hidden relative">
                    <motion.div
                      className="h-full bg-brand-cyan"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-brand-graphite/50">
                    {progress}% — ANALISANDO SEU PROCESSO COMERCIAL
                  </span>
                </motion.div>
              )}

              {formState === "success" && (
                <motion.div
                  key="form-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 flex flex-col items-center justify-center text-center"
                >
                  <CheckCircle2 className="w-14 h-14 text-brand-cyan mb-6" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-brand-graphite mb-2">
                    DIAGNÓSTICO AGENDADO!
                  </h3>
                  <p className="text-xs text-brand-graphite/70 max-w-sm leading-relaxed mb-6">
                    Recebemos seus dados. Um consultor da O6 vai entrar em contato em até 15 minutos para agendar sua sessão de diagnóstico gratuita.
                  </p>

                  <div className="w-full bg-brand-offwhite border border-brand-cyan/20 p-4 font-mono text-[9px] text-left text-brand-graphite/70 space-y-1">
                    <p className="text-brand-orange font-bold uppercase mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> CONFIRMAÇÃO
                    </p>
                    <p>EMAIL: {email}</p>
                    <p>VOLUME: {volume} leads/mês</p>
                    <p>STATUS: PRIORIDADE ALTA — RETORNO EM ATÉ 15 MIN</p>
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
            <span className="font-black text-xs text-brand-graphite uppercase tracking-tighter">
              O6 Growth
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-8 uppercase">
            <a href="#problema" className="hover:text-brand-graphite transition-colors">POLÍTICA DE PRIVACIDADE</a>
            <a href="#metricas" className="hover:text-brand-graphite transition-colors">TERMOS DE USO</a>
            <span>&copy; 2026 O6 Growth. Todos os direitos reservados.</span>
          </div>
        </footer>

      </div>
    </section>
  );
}
