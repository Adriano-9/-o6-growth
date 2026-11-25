"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { getAttribution } from "@/app/briefing/_lib/attribution";

const subscribeNoop = () => () => {};

export default function O6Footer() {
  const [email, setEmail] = useState("");
  const [projectType, setProjectType] = useState("Fundação estratégica e de marca");
  const [formState, setFormState] = useState<"idle" | "saving" | "success" | "error">("idle");
  const search = useSyncExternalStore(subscribeNoop, () => window.location.search, () => "");
  const briefingHref = `/briefing${search}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || formState === "saving") return;
    setFormState("saving");
    try {
      const response = await fetch("/api/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "contact",
          email,
          service: projectType,
          attribution: getAttribution(),
        }),
      });
      setFormState(response.ok ? "success" : "error");
    } catch {
      setFormState("error");
    }
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
              Deixe seu contato para uma conversa inicial. Se já tem um projeto em mente, envie o briefing completo.
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
                    Avaliamos se faz sentido um projeto pontual, O6 Otimização ou um Retainer sob contrato.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white border border-brand-graphite/10 p-8 shadow-sm">

            <AnimatePresence mode="wait">
              {(formState === "idle" || formState === "saving" || formState === "error") && (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="pb-4 border-b border-brand-graphite/5">
                    <h3 className="text-sm font-black uppercase tracking-widest text-brand-graphite">
                      SOLICITAR CONVERSA
                    </h3>
                    <p className="text-[10px] text-brand-graphite/50 mt-1">
                      CONTATO INICIAL, NÃO É O BRIEFING
                    </p>
                  </div>

                  <div>
                    <label htmlFor="o6-contact-email" className="block text-[10px] font-black uppercase tracking-widest text-brand-graphite/60 mb-2">
                      Seu melhor e-mail
                    </label>
                    <input
                      id="o6-contact-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full p-3.5 bg-brand-offwhite border border-brand-graphite/10 text-xs font-semibold text-brand-graphite focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="o6-contact-service" className="block text-[10px] font-black uppercase tracking-widest text-brand-graphite/60 mb-2">
                      O que você precisa desenvolver?
                    </label>
                    <select
                      id="o6-contact-service"
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                      className="w-full p-3.5 bg-brand-offwhite border border-brand-graphite/10 text-xs font-semibold text-brand-graphite focus:outline-none focus:border-brand-orange transition-all"
                    >
                      <option>Diagnóstico Consultivo Express</option>
                      <option>Fundação estratégica e de marca</option>
                      <option>Presença digital</option>
                      <option>Campanhas, conteúdo e audiovisual</option>
                      <option>Sistema O6</option>
                      <option>O6 Otimização</option>
                      <option>Retainer</option>
                      <option>Ainda não sei</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={formState === "saving"}
                    className="w-full py-4 bg-brand-orange text-white font-black uppercase tracking-widest text-xs transition-all hover:bg-brand-orange/95 shadow-[4px_4px_0px_0px_#121212] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#121212]"
                  >
                    {formState === "saving" ? "REGISTRANDO..." : "SOLICITAR CONVERSA"}
                  </button>

                  {formState === "error" && <p role="alert" className="text-xs font-semibold text-red-700">Não conseguimos registrar seu contato. Tente novamente; seus dados continuam preenchidos.</p>}
                  <Link href={briefingHref} className="inline-flex items-center gap-2 text-xs font-bold text-brand-graphite underline underline-offset-4 hover:text-brand-orange">Preencher briefing completo <ArrowRight className="h-4 w-4" /></Link>
                  <p className="text-[9px] text-brand-graphite/40 leading-snug text-center">
                    Usaremos seu e-mail apenas para retornar sobre a solicitação.
                  </p>
                </motion.form>
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
                    CONTATO REGISTRADO
                  </h3>
                  <p className="text-xs text-brand-graphite/70 max-w-sm leading-relaxed mb-6">
                    Sua solicitação foi registrada. A O6 retornará pelo e-mail informado para entender o projeto.
                  </p>

                  <div className="w-full bg-brand-offwhite border border-brand-orange/20 p-4 font-mono text-[9px] text-left text-brand-graphite/70 space-y-1">
                    <p className="text-brand-orange font-bold uppercase mb-1">CONFIRMAÇÃO</p>
                    <p>EMAIL: {email}</p>
                    <p>INTERESSE: {projectType}</p>
                    <p>STATUS: RECEBIDO</p>
                  </div>
                  <Link href={briefingHref} className="mt-6 inline-flex items-center gap-2 text-xs font-bold underline underline-offset-4">Enviar briefing completo <ArrowRight className="h-4 w-4" /></Link>
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

          <nav aria-label="Rodapé" className="flex flex-wrap justify-center gap-x-8 gap-y-3 uppercase">
            <Link href="/produto/diagnostico" className="hover:text-brand-graphite transition-colors">Diagnóstico Express</Link>
            <Link href="/saude" className="hover:text-brand-graphite transition-colors">Para clínicas e consultórios</Link>
            <Link href="/advocacia" className="hover:text-brand-graphite transition-colors">Para escritórios de advocacia</Link>
            <Link href="/servicos" className="hover:text-brand-graphite transition-colors">Serviços da O6</Link>
            <Link href="/portfolio/index.html" className="hover:text-brand-graphite transition-colors">Portfólio de projetos</Link>
            <span>&copy; 2026 O6 Growth. Todos os direitos reservados.</span>
          </nav>
        </footer>

      </div>
    </section>
  );
}
