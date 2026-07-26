"use client";

import { motion } from "framer-motion";
import { BarChart3, Database, RefreshCw, Eye, TrendingUp, Zap } from "lucide-react";
import { useState, useEffect } from "react";

export default function O6Metrics() {
  const [activeTab, setActiveTab] = useState<"analytics" | "dashboards">("analytics");
  const [logLines, setLogLines] = useState<string[]>([
    "captacao: Novo lead recebido via formulário do site",
    "qualificacao: Perfil avaliado — interesse alto, ticket compatível",
    "atendimento: Lead direcionado para equipe comercial",
  ]);

  useEffect(() => {
    if (activeTab !== "analytics") return;
    const logs = [
      "captacao: Novo lead via Instagram — clínica odontológica",
      "qualificacao: Score 92% — encaixe perfeito com o serviço",
      "atendimento: Direcionado para WhatsApp da recepção em 8s",
      "pipeline: Follow-up automático agendado para amanhã 10h",
      "captacao: Lead via Google Ads — interessado em harmonização",
      "qualificacao: Score 78% — agendar conversa exploratória",
      "atendimento: Recepção notificada — responder em até 5 min",
      "pipeline: 3 leads aguardando retorno — alerta enviado",
      "resultado: Consulta agendada — R$ 2.500 ticket estimado",
    ];

    let current = 0;
    const interval = setInterval(() => {
      setLogLines((prev) => {
        const next = [...prev, logs[current]];
        if (next.length > 7) next.shift();
        return next;
      });
      current = (current + 1) % logs.length;
    }, 2800);

    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <section id="metricas" className="w-full py-24 md:py-32 bg-brand-graphite text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-brand-orange/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-brand-cyan/8 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-black tracking-widest text-brand-cyan uppercase block mb-3">
              PAINEL DE RESULTADOS
            </span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white leading-none">
              SAIBA EXATAMENTE ONDE ESTÁ SEU DINHEIRO.
            </h2>
            <p className="mt-5 text-sm text-white/70 max-w-xl leading-relaxed">
              Chega de investir no escuro. O painel da O6 Growth mostra em tempo real quanto cada canal de marketing traz de retorno — lead por lead, real por real.
            </p>
          </div>

          <div className="flex bg-black/40 border border-white/10 p-1 self-start">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-6 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                activeTab === "analytics"
                  ? "bg-brand-orange text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Acompanhamento de Leads
            </button>
            <button
              onClick={() => setActiveTab("dashboards")}
              className={`px-6 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                activeTab === "dashboards"
                  ? "bg-brand-cyan text-brand-graphite"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Painel de ROI
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mb-12 border border-white/10 bg-black/30 p-6 text-center">
          <span className="w-2 h-2 rounded-full bg-white/20" />
          <span className="text-xs font-mono text-white/50 uppercase tracking-widest">
            Aguardando primeiros dados reais — o painel ativa automaticamente assim que os primeiros leads entrarem pelo sistema
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">

          <div className="lg:col-span-5 flex flex-col justify-between py-2">
            {activeTab === "analytics" ? (
              <motion.div key="analytics-desc" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-6">
                <div className="inline-flex w-12 h-12 bg-white/5 border border-white/10 items-center justify-center text-brand-orange">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight">ACOMPANHAMENTO DE CADA LEAD</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Cada lead que entra é avaliado automaticamente: de onde veio, qual o perfil, e se tem potencial de fechar. Sua equipe recebe só os leads quentes, já com contexto — sem perder tempo com curiosos.
                </p>
                <ul className="flex flex-col gap-3 text-xs font-semibold text-white/80 mt-2">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-brand-orange" />QUALIFICAÇÃO AUTOMÁTICA EM SEGUNDOS</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-brand-orange" />SUA EQUIPE SÓ ATENDE QUEM TEM PERFIL</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-brand-cyan" />FOLLOW-UP AUTOMÁTICO POR WHATSAPP E EMAIL</li>
                </ul>
              </motion.div>
            ) : (
              <motion.div key="dashboards-desc" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-6">
                <div className="inline-flex w-12 h-12 bg-white/5 border border-white/10 items-center justify-center text-brand-cyan">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight">PAINEL DE ROI EM TEMPO REAL</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Cada real investido é rastreado. O painel mostra com clareza total o desempenho de cada canal, quantos leads viraram clientes e qual o retorno — atualizado continuamente.
                </p>
                <ul className="flex flex-col gap-3 text-xs font-semibold text-white/80 mt-2">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-brand-cyan" />RETORNO POR CANAL (GOOGLE, INSTAGRAM, INDICAÇÃO)</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-brand-cyan" />TAXA DE CONVERSÃO POR ETAPA DO FUNIL</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-brand-orange" />ALERTAS QUANDO ALGO ESTÁ FORA DO NORMAL</li>
                </ul>
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-8 mt-8">
              <div className="p-4 bg-black/30 border border-white/5">
                <span className="text-[10px] font-mono text-white/40 block uppercase">Aumento Médio de Receita</span>
                <span className="text-3xl font-black text-brand-orange tracking-tighter mt-1 block">3×</span>
                <span className="text-[9px] font-semibold text-white/60 uppercase">nos primeiros 90 dias</span>
              </div>
              <div className="p-4 bg-black/30 border border-white/5">
                <span className="text-[10px] font-mono text-white/40 block uppercase">Leads Perdidos por Atraso</span>
                <span className="text-3xl font-black text-brand-cyan tracking-tighter mt-1 block">-72%</span>
                <span className="text-[9px] font-semibold text-white/60 uppercase">com resposta em até 5 min</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-black border border-white/10 flex flex-col min-h-[440px] relative overflow-hidden">

            {activeTab === "analytics" && (
              <motion.div key="analytics-console" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col font-mono text-xs p-6 justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 text-white/50 text-[10px]">
                    <div className="flex items-center gap-2">
                      <Database className="w-3.5 h-3.5 text-brand-orange" />
                      <span>acompanhamento_leads.log</span>
                    </div>
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
                    </div>
                  </div>

                  <div className="text-[11px] text-white/40 mb-4 leading-relaxed">
                    <span className="text-brand-cyan">{"{"}</span><br />
                    &nbsp;&nbsp;<span className="text-brand-orange">&quot;sistema&quot;</span>: <span className="text-green-400">&quot;O6 Growth Comercial&quot;</span>,<br />
                    &nbsp;&nbsp;<span className="text-brand-orange">&quot;qualificacao_auto&quot;</span>: <span className="text-brand-cyan">true</span>,<br />
                    &nbsp;&nbsp;<span className="text-brand-orange">&quot;tempo_resposta_max&quot;</span>: <span className="text-green-400">&quot;5 minutos&quot;</span>,<br />
                    &nbsp;&nbsp;<span className="text-brand-orange">&quot;followup&quot;</span>: <span className="text-green-400">&quot;automatico&quot;</span><br />
                    <span className="text-brand-cyan">{"}"}</span>
                  </div>

                  <div className="flex flex-col gap-2.5 mt-2">
                    {logLines.map((line, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
                        <span className="text-brand-cyan select-none">&gt;&gt;</span>
                        <span className={`text-[11px] ${idx === logLines.length - 1 ? "text-brand-orange font-bold" : "text-white/80"}`}>
                          {line}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10 text-[9px] text-white/40">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    AGUARDANDO PRIMEIROS DADOS REAIS
                  </span>
                </div>
              </motion.div>
            )}

            {activeTab === "dashboards" && (
              <motion.div key="dashboards-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col p-6 justify-between text-xs font-mono">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 text-white/50 text-[10px]">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-3.5 h-3.5 text-brand-cyan" />
                      <span>PAINEL DE RESULTADOS — TEMPO REAL</span>
                    </div>
                    <span className="flex items-center gap-1 text-[9px] text-brand-cyan font-bold">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" /> ATUALIZANDO
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                      { label: "Leads Este Mês" },
                      { label: "Taxa de Conversão" },
                      { label: "Custo por Lead" },
                      { label: "Retorno sobre Investimento" },
                      { label: "Ticket Médio" },
                      { label: "Leads Perdidos por Atraso" },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white/5 p-3 border border-white/10 flex flex-col gap-1">
                        <span className="text-[8px] text-white/40 uppercase">{stat.label}</span>
                        <span className="text-lg font-black tracking-tighter text-white/25">—</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border border-white/10 bg-black/30 flex items-start gap-3">
                    <TrendingUp className="w-4 h-4 text-white/30 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-white/50 leading-snug">
                      Aguardando primeiros dados reais. Assim que os leads começarem a entrar pelo sistema, este painel mostra conversão por canal, custo por lead e ROI atualizados automaticamente.
                    </p>
                  </div>
                </div>

                <div className="text-[10px] text-white/40 border-t border-white/10 pt-4 mt-4 flex justify-between">
                  <span>SEM DADOS REAIS AINDA</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
