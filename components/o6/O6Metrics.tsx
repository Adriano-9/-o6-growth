"use client";

import { motion } from "framer-motion";
import { BarChart3, Database, RefreshCw, Eye, TrendingUp, Zap, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";

export default function O6Metrics() {
  const [activeTab, setActiveTab] = useState<"analytics" | "dashboards">("analytics");
  const [logLines, setLogLines] = useState<string[]>([
    "ingestion.start: Canal de entrada inicializado [endpoint=/api/leads]",
    "analysis.load: Modelo bayesiano de qualificação ativo [v3.2.1]",
    "pipeline.status: Monitoramento de fluxo ativo em tempo real",
  ]);

  // Simulate live data analysis telemetry logs
  useEffect(() => {
    if (activeTab !== "analytics") return;
    const logs = [
      "lead.capture: Novo vetor de intenção capturado [canal=formulário_web]",
      "analysis.score: Avaliação de fit comercial: 94.2% [APROVADO]",
      "analysis.route: Lead qualificado → canal de conversão [latência=0.3s]",
      "telemetry.report: Integridade do pipeline: 99.9% [NOMINAL]",
      "data.stream: Fluxo de dados recebido [registros=847 | janela=15s]",
      "lead.capture: Novo vetor de intenção capturado [canal=landing_cta]",
      "analysis.score: Avaliação de fit comercial: 81.9% [APROVADO]",
      "analysis.route: Roteamento autónomo concluído [eficiência=100%]",
      "insight.generate: ROI incremental calculado [delta=+3.8x baseline]",
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

  // Animated counter values
  const [counters, setCounters] = useState({ leads: 0, roi: 0, latency: 0 });
  useEffect(() => {
    const targets = { leads: 4847, roi: 824, latency: 98 };
    const duration = 1800;
    const steps = 60;
    const increment = {
      leads: targets.leads / steps,
      roi: targets.roi / steps,
      latency: targets.latency / steps,
    };
    let step = 0;
    const timer = setInterval(() => {
      step++;
      if (step >= steps) {
        setCounters(targets);
        clearInterval(timer);
      } else {
        setCounters({
          leads: Math.floor(increment.leads * step),
          roi: Math.floor(increment.roi * step),
          latency: Math.floor(increment.latency * step),
        });
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="metricas" className="w-full py-24 md:py-32 bg-brand-graphite text-white relative overflow-hidden">
      {/* Layered grid backgrounds */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-brand-orange/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-brand-cyan/8 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-black tracking-widest text-brand-cyan uppercase block mb-3">
              TELEMETRIA E INTELIGÊNCIA DE NEGÓCIO
            </span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white leading-none">
              VISÃO RAIO-X DO SEU PIPELINE.
            </h2>
            <p className="mt-5 text-sm text-white/70 max-w-xl leading-relaxed">
              Deixe de navegar às cegas. O sistema da O6 Growth fornece ao dono de empresa uma visão de raio-X de cada euro investido — em tempo real, com granularidade matemática.
            </p>
          </div>

          {/* Tab Controls */}
          <div className="flex bg-black/40 border border-white/10 p-1 self-start">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-6 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                activeTab === "analytics"
                  ? "bg-brand-orange text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Análise de Alta Performance
            </button>
            <button
              onClick={() => setActiveTab("dashboards")}
              className={`px-6 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                activeTab === "dashboards"
                  ? "bg-brand-cyan text-brand-graphite"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Dashboards em Tempo Real
            </button>
          </div>
        </div>

        {/* Animated Counter Strip */}
        <div className="grid grid-cols-3 gap-4 mb-12 border border-white/10 bg-black/30 p-6">
          <div className="text-center border-r border-white/10">
            <span className="text-[10px] font-mono text-white/40 uppercase block mb-1">Leads Processados Hoje</span>
            <span className="text-4xl font-black tabular-nums text-brand-orange">{counters.leads.toLocaleString()}</span>
          </div>
          <div className="text-center border-r border-white/10">
            <span className="text-[10px] font-mono text-white/40 uppercase block mb-1">Multiplicador de ROI</span>
            <span className="text-4xl font-black tabular-nums text-brand-cyan">{counters.roi / 100}x</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] font-mono text-white/40 uppercase block mb-1">Integridade do Canal</span>
            <span className="text-4xl font-black tabular-nums text-white">{counters.latency}%</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">

          {/* Left Column: Context */}
          <div className="lg:col-span-5 flex flex-col justify-between py-2">
            {activeTab === "analytics" ? (
              <motion.div key="analytics-desc" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-6">
                <div className="inline-flex w-12 h-12 bg-white/5 border border-white/10 items-center justify-center text-brand-orange">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight">ANÁLISE DE DADOS DE ALTA PERFORMANCE</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Substituímos o processo de triagem manual por fluxos de análise de alta performance. O sistema recebe os dados do lead, executa modelos de avaliação estatística e direciona o vetor de intenção para o canal de conversão adequado — tudo em menos de 10 segundos, sem fricção humana.
                </p>
                <ul className="flex flex-col gap-3 text-xs font-semibold text-white/80 mt-2">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-brand-orange" />TEMPO DE ANÁLISE MÉDIO: 0.4s</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-brand-orange" />QUALIFICAÇÃO SEM INTERVENÇÃO MANUAL</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-brand-cyan" />ROTEAMENTO INTELIGENTE PARA CRM</li>
                </ul>
              </motion.div>
            ) : (
              <motion.div key="dashboards-desc" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-6">
                <div className="inline-flex w-12 h-12 bg-white/5 border border-white/10 items-center justify-center text-brand-cyan">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight">DASHBOARDS DE ACOMPANHAMENTO EM TEMPO REAL</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Cada cêntimo investido é rastreado. Os dashboards da O6 Growth expõem com total transparência o desempenho do pipeline, a eficiência dos canais de atração e o multiplicador de retorno — actualizados a cada 15 segundos.
                </p>
                <ul className="flex flex-col gap-3 text-xs font-semibold text-white/80 mt-2">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-brand-cyan" />EFICÁCIA DE CANAL (ROAS) EM TEMPO REAL</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-brand-cyan" />VARIÂNCIA DA CURVA DE CONVERSÃO</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-brand-orange" />ALERTAS AUTOMÁTICOS DE ANOMALIA</li>
                </ul>
              </motion.div>
            )}

            {/* Metric tiles */}
            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-8 mt-8">
              <div className="p-4 bg-black/30 border border-white/5">
                <span className="text-[10px] font-mono text-white/40 block uppercase">Aceleração de Receita</span>
                <span className="text-3xl font-black text-brand-orange tracking-tighter mt-1 block">4.6x</span>
                <span className="text-[9px] font-semibold text-white/60 uppercase">volume de conversão</span>
              </div>
              <div className="p-4 bg-black/30 border border-white/5">
                <span className="text-[10px] font-mono text-white/40 block uppercase">Redução de Atrito</span>
                <span className="text-3xl font-black text-brand-cyan tracking-tighter mt-1 block">-72%</span>
                <span className="text-[9px] font-semibold text-white/60 uppercase">pipelines inativos</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Panel */}
          <div className="lg:col-span-7 bg-black border border-white/10 flex flex-col min-h-[440px] relative overflow-hidden">

            {activeTab === "analytics" && (
              <motion.div key="analytics-console" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col font-mono text-xs p-6 justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 text-white/50 text-[10px]">
                    <div className="flex items-center gap-2">
                      <Database className="w-3.5 h-3.5 text-brand-orange" />
                      <span>high_performance_data_analysis.stream</span>
                    </div>
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
                    </div>
                  </div>

                  {/* JSON Data Structure Preview */}
                  <div className="text-[11px] text-white/40 mb-4 leading-relaxed">
                    <span className="text-brand-cyan">{"{"}</span><br />
                    &nbsp;&nbsp;<span className="text-brand-orange">"modelo"</span>: <span className="text-green-400">"BayesianQualifier_v3.2"</span>,<br />
                    &nbsp;&nbsp;<span className="text-brand-orange">"limiar_aprovacao"</span>: <span className="text-brand-cyan">0.75</span>,<br />
                    &nbsp;&nbsp;<span className="text-brand-orange">"janela_analise_ms"</span>: <span className="text-brand-cyan">400</span>,<br />
                    &nbsp;&nbsp;<span className="text-brand-orange">"modo"</span>: <span className="text-green-400">"autonomo_tempo_real"</span><br />
                    <span className="text-brand-cyan">{"}"}</span>
                  </div>

                  {/* Live Telemetry Logs */}
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
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                    ANÁLISE ATIVA
                  </span>
                  <span>THROUGHPUT: 847 LEADS/HORA — EFICIÊNCIA: 99.9%</span>
                </div>
              </motion.div>
            )}

            {activeTab === "dashboards" && (
              <motion.div key="dashboards-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col p-6 justify-between text-xs font-mono">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 text-white/50 text-[10px]">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-3.5 h-3.5 text-brand-cyan" />
                      <span>DASHBOARD DE ACOMPANHAMENTO EM TEMPO REAL</span>
                    </div>
                    <span className="flex items-center gap-1 text-[9px] text-brand-cyan font-bold">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" /> ACTUALIZANDO
                    </span>
                  </div>

                  {/* X-Ray Dashboard Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                      { label: "Volume de Leads Diário", value: "4.847", color: "text-white" },
                      { label: "Taxa de Conversão Efectiva", value: "94.8%", color: "text-brand-cyan" },
                      { label: "CAC Médio", value: "€42.30", color: "text-brand-orange" },
                      { label: "Multiplicador ROAS", value: "8.24x", color: "text-brand-cyan" },
                      { label: "Tempo Médio de Análise", value: "0.43s", color: "text-white" },
                      { label: "Leads Perdidos por Atrito", value: "0", color: "text-green-400" },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white/5 p-3 border border-white/10 flex flex-col gap-1">
                        <span className="text-[8px] text-white/40 uppercase">{stat.label}</span>
                        <span className={`text-lg font-black tracking-tighter ${stat.color}`}>{stat.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Comparison Bars */}
                  <div className="space-y-4 pt-2">
                    {[
                      { label: "CANAL O6 GROWTH (TEMPO REAL)", value: 97, color: "bg-brand-cyan", shadow: "shadow-[0_0_8px_rgba(0,229,255,0.5)]", textColor: "text-brand-cyan" },
                      { label: "CANAL TRADICIONAL (+5 MIN ATRITO)", value: 14, color: "bg-brand-orange", shadow: "shadow-[0_0_8px_rgba(255,87,34,0.5)]", textColor: "text-brand-orange" },
                    ].map((bar, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-[10px] text-white/70 mb-1">
                          <span>{bar.label}</span>
                          <span className={`${bar.textColor} font-bold`}>{bar.value}% EFICÁCIA</span>
                        </div>
                        <div className="w-full h-3 bg-white/10">
                          <motion.div className={`h-full ${bar.color} ${bar.shadow}`} initial={{ width: 0 }} animate={{ width: `${bar.value}%` }} transition={{ duration: 1, ease: "easeOut" }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Insight Row */}
                  <div className="mt-5 p-3 bg-brand-cyan/5 border border-brand-cyan/20 flex gap-3 items-start">
                    <TrendingUp className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
                    <p className="text-[10px] text-white/80 leading-snug">
                      <span className="text-brand-cyan font-bold">INSIGHT RAIO-X:</span> O diferencial de eficácia entre canais representa uma oportunidade não capitalizada de <span className="text-brand-orange font-bold">+83% de volume de conversão</span> no ciclo actual.
                    </p>
                  </div>
                </div>

                <div className="text-[10px] text-white/40 border-t border-white/10 pt-4 mt-4 flex justify-between">
                  <span>ACTUALIZAÇÃO AUTOMÁTICA: CADA 15s</span>
                  <span className="text-brand-cyan flex items-center gap-1 cursor-pointer hover:underline">
                    EXPORTAR RELATÓRIO <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
