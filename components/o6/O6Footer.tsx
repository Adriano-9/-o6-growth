"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, ShieldAlert, Cpu, Sparkles } from "lucide-react";
import React, { useState } from "react";
import Link from "next/link";
import { createLead } from "@/app/crm/_lib/api";
import { emptyLeadInput } from "@/app/crm/_lib/types";

export default function O6Footer() {
  const [email, setEmail] = useState("");
  const [projectType, setProjectType] = useState("Fundação estratégica e de marca");
  const [formState, setFormState] = useState<"idle" | "calculating" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setFormState("calculating");
    setProgress(0);

    // Persistência real roda em paralelo com a animação de progresso —
    // a animação é só percepção de responsividade (pedido explícito do
    // usuário), o resultado exibido depende do insert de verdade, nunca
    // de um timer fixo.
    const savePromise = createLead({
      ...emptyLeadInput("Novo Lead"),
      email,
      notas: `Solicitação de conversa pelo site O6 — interesse: ${projectType}`,
      origem: "site_o6",
    });

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          savePromise
            .then((lead) => {
              setFormState(lead ? "success" : "error");
            })
            .catch(() => setFormState("error"));
          return 100;
        }
        return prev + 10;
      });
    }, 120);
  };

  return (
    <section id="contato" className="w-full bg-brand-offwhite border-t border-brand-graphite/10 pt-24 pb-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#12121203_1px,transparent_1px),linear-gradient(to_bottom,#12121203_1px,transparent_1px)] bg-[size:6rem_6rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">

          <div className="lg:col-span-6 flex flex-col gap-6">
            <span className="text-xs font-black tracking-widest text-brand-orange uppercase">
              VAMOS CONVERSAR
            </span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-brand-graphite leading-none">
              O QUE SUA MARCA PRECISA CONSTRUIR AGORA?
            </h2>
            <p className="text-sm md:text-base text-brand-graphite/70 leading-relaxed font-normal">
              Conte um pouco sobre o projeto. Vamos entender sua marca, objetivo e entregas necessárias para definir o próximo passo e o formato de trabalho.
            </p>

            <div className="flex flex-col gap-4 mt-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-none bg-brand-graphite flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-brand-graphite">
                    Entendimento do projeto
                  </h4>
                  <p className="text-[11px] text-brand-graphite/60 mt-0.5">
                    Alinhamos objetivo, público, contexto e o que já existe.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-none bg-brand-graphite flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-brand-graphite">
                    Escopo e próximo passo
                  </h4>
                  <p className="text-[11px] text-brand-graphite/60 mt-0.5">
                    Avaliamos se faz sentido um projeto pontual ou um retainer mensal.
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
                      FALAR SOBRE MEU PROJETO
                    </h3>
                    <p className="text-[10px] text-brand-graphite/50 mt-1">
                      DEIXE SEU E-MAIL E ESCOLHA UMA FRENTE
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
                      className="w-full p-3.5 bg-brand-offwhite border border-brand-graphite/10 text-xs font-semibold text-brand-graphite focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-brand-graphite/60 mb-2">
                      O que você precisa desenvolver?
                    </label>
                    <select
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                      className="w-full p-3.5 bg-brand-offwhite border border-brand-graphite/10 text-xs font-semibold text-brand-graphite focus:outline-none focus:border-brand-orange transition-all"
                    >
                      <option>Fundação estratégica e de marca</option>
                      <option>Campanha</option>
                      <option>Site ou landing page</option>
                      <option>Dashboard</option>
                      <option>Vídeo ou filme</option>
                      <option>Retainer mensal</option>
                      <option>Ainda não sei</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-brand-orange text-white font-black uppercase tracking-widest text-xs transition-all hover:bg-brand-orange/95 shadow-[4px_4px_0px_0px_#121212] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#121212]"
                  >
                    SOLICITAR CONVERSA
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
                  <Cpu className="w-12 h-12 text-brand-orange animate-spin mb-6" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-brand-graphite mb-2">
                    REGISTRANDO SUA SOLICITAÇÃO...
                  </h3>
                  <div className="w-48 h-1.5 bg-brand-graphite/10 mb-4 overflow-hidden relative">
                    <motion.div
                      className="h-full bg-brand-orange"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-brand-graphite/50">
                    {progress}% — ENVIANDO SEU PEDIDO
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
                  <CheckCircle2 className="w-14 h-14 text-brand-orange mb-6" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-brand-graphite mb-2">
                    DADOS RECEBIDOS!
                  </h3>
                  <p className="text-xs text-brand-graphite/70 max-w-sm leading-relaxed mb-6">
                    Recebemos seu pedido. Vamos entrar em contato para entender o projeto e combinar o próximo passo.
                  </p>

                  <div className="w-full bg-brand-offwhite border border-brand-orange/20 p-4 font-mono text-[9px] text-left text-brand-graphite/70 space-y-1">
                    <p className="text-brand-orange font-bold uppercase mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> CONFIRMAÇÃO
                    </p>
                    <p>EMAIL: {email}</p>
                    <p>INTERESSE: {projectType}</p>
                    <p>STATUS: RECEBIDO</p>
                  </div>
                </motion.div>
              )}

              {formState === "error" && (
                <motion.div
                  key="form-error"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 flex flex-col items-center justify-center text-center"
                >
                  <ShieldAlert className="w-14 h-14 text-red-400 mb-6" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-brand-graphite mb-2">
                    ALGO DEU ERRADO
                  </h3>
                  <p className="text-xs text-brand-graphite/70 max-w-sm leading-relaxed mb-6">
                    Não conseguimos salvar seus dados agora. Tente novamente em instantes.
                  </p>
                  <button
                    type="button"
                    onClick={() => setFormState("idle")}
                    className="px-6 py-3 bg-brand-graphite text-white font-black uppercase tracking-widest text-xs hover:bg-brand-graphite/90 transition-all"
                  >
                    TENTAR NOVAMENTE
                  </button>
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
            <Link href="/portfolio/index.html" className="hover:text-brand-graphite transition-colors">PORTFÓLIO</Link>
            <Link href="/servicos/retainer" className="hover:text-brand-graphite transition-colors">RETAINER</Link>
            <span>&copy; 2026 O6 Growth. Todos os direitos reservados.</span>
          </div>
        </footer>

      </div>
    </section>
  );
}
