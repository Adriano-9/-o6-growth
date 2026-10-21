"use client";

import { motion } from "framer-motion";
import { BarChart3, Database, RefreshCw, Eye, TrendingUp, Zap } from "lucide-react";
import { useState, useEffect } from "react";

export default function O6Metrics() {
  const [activeTab, setActiveTab] = useState<"analytics" | "dashboards">("analytics");
  const [logLines, setLogLines] = useState<string[]>([
    "briefing: objetivo e publico definidos",
    "estrategia: posicionamento e oferta organizados",
    "producao: primeiros ativos em revisao",
  ]);

  useEffect(() => {
    if (activeTab !== "analytics") return;
    const logs = [
      "briefing: objetivo e publico definidos",
      "fundacao: mensagem e identidade alinhadas",
      "campanha: estrutura e entregaveis planejados",
      "site: arquitetura e chamada para acao revisadas",
      "video: roteiro e storyboard preparados",
      "producao: criativos em desenvolvimento",
      "qa: revisao de links e consistencia",
      "aprovacao: materiais enviados ao cliente",
      "ciclo: proxima versao definida com base no retorno",
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
    <section id="entregas" className="w-full py-24 md:py-32 bg-brand-graphite text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-brand-orange/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-black tracking-widest text-brand-orange uppercase block mb-3">
              COMO O TRABALHO AVANÇA
            </span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white leading-none">
              DA DIREÇÃO À ENTREGA.
            </h2>
            <p className="mt-5 text-sm text-white/70 max-w-xl leading-relaxed">
              Cada projeto começa com um objetivo claro. A partir dele, organizamos a estratégia, produzimos os ativos e acompanhamos o andamento e os resultados disponíveis.
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
              Fundação da marca
            </button>
            <button
              onClick={() => setActiveTab("dashboards")}
              className={`px-6 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                activeTab === "dashboards"
                  ? "bg-brand-orange text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Produção e acompanhamento
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mb-12 border border-white/10 bg-black/30 p-6 text-center">
          <span className="w-2 h-2 rounded-full bg-white/20" />
          <span className="text-xs font-mono text-white/50 uppercase tracking-widest">
            Exemplo de fluxo de trabalho. Métricas de campanha dependem das fontes de dados conectadas.
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">

          <div className="lg:col-span-5 flex flex-col justify-between py-2">
            {activeTab === "analytics" ? (
              <motion.div key="analytics-desc" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-6">
                <div className="inline-flex w-12 h-12 bg-white/5 border border-white/10 items-center justify-center text-brand-orange">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight">CLAREZA SOBRE A MARCA</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Organizamos posicionamento, público, oferta, identidade visual e voz da marca para orientar a comunicação e as decisões de criação.
                </p>
                <ul className="flex flex-col gap-3 text-xs font-semibold text-white/80 mt-2">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-brand-orange" />OFFER BOOK E POSICIONAMENTO</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-brand-orange" />IDENTIDADE E VOZ DA MARCA</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-brand-orange" />DIREÇÃO PARA CAMPANHAS E CONTEÚDO</li>
                </ul>
              </motion.div>
            ) : (
              <motion.div key="dashboards-desc" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-6">
                <div className="inline-flex w-12 h-12 bg-white/5 border border-white/10 items-center justify-center text-brand-orange">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight">PRODUÇÃO CONECTADA AO OBJETIVO</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Criamos campanhas, sites, landing pages, vídeos, filmes e dashboards conforme o escopo. O acompanhamento de performance usa os dados realmente disponíveis.
                </p>
                <ul className="flex flex-col gap-3 text-xs font-semibold text-white/80 mt-2">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-brand-orange" />SITES, CAMPANHAS E CRIATIVOS</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-brand-orange" />VÍDEOS, FILMES E MOTION DESIGN</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-brand-orange" />DASHBOARDS CONFORME AS FONTES DISPONÍVEIS</li>
                </ul>
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-8 mt-8">
              <div className="p-4 bg-black/30 border border-white/5">
                <span className="text-[10px] font-mono text-white/40 block uppercase">Modelo de trabalho</span>
                <span className="text-xl font-black text-brand-orange tracking-tighter mt-2 block">Projeto</span>
                <span className="text-[9px] font-semibold text-white/60 uppercase">escopo pontual definido</span>
              </div>
              <div className="p-4 bg-black/30 border border-white/5">
                <span className="text-[10px] font-mono text-white/40 block uppercase">Modelo de continuidade</span>
                <span className="text-xl font-black text-white tracking-tighter mt-2 block">Retainer</span>
                <span className="text-[9px] font-semibold text-white/60 uppercase">produção mensal com escopo</span>
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
                      <span>fluxo_de_producao.log</span>
                    </div>
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
                    </div>
                  </div>

                  <div className="text-[11px] text-white/40 mb-4 leading-relaxed">
                    <span className="text-white/60">{"{"}</span><br />
                    &nbsp;&nbsp;<span className="text-brand-orange">&quot;etapa_1&quot;</span>: <span className="text-green-400">&quot;fundacao estrategica&quot;</span>,<br />
                    &nbsp;&nbsp;<span className="text-brand-orange">&quot;etapa_2&quot;</span>: <span className="text-green-400">&quot;campanha e producao&quot;</span>,<br />
                    &nbsp;&nbsp;<span className="text-brand-orange">&quot;etapa_3&quot;</span>: <span className="text-green-400">&quot;revisao e aprovacao&quot;</span>,<br />
                    &nbsp;&nbsp;<span className="text-brand-orange">&quot;modelo&quot;</span>: <span className="text-green-400">&quot;projeto ou retainer&quot;</span><br />
                    <span className="text-white/60">{"}"}</span>
                  </div>

                  <div className="flex flex-col gap-2.5 mt-2">
                    {logLines.map((line, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
                        <span className="text-brand-orange select-none">&gt;&gt;</span>
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
                    EXEMPLO ILUSTRATIVO DE PROCESSO
                  </span>
                </div>
              </motion.div>
            )}

            {activeTab === "dashboards" && (
              <motion.div key="dashboards-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col p-6 justify-between text-xs font-mono">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 text-white/50 text-[10px]">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-3.5 h-3.5 text-brand-orange" />
                      <span>ACOMPANHAMENTO DO PROJETO</span>
                    </div>
                    <span className="flex items-center gap-1 text-[9px] text-brand-orange font-bold">
                      <RefreshCw className="w-2.5 h-2.5" /> EXEMPLO
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                      { label: "Briefing" },
                      { label: "Estratégia" },
                      { label: "Site e campanha" },
                      { label: "Vídeo e criativos" },
                      { label: "Aprovação" },
                      { label: "Próximo ciclo" },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white/5 p-3 border border-white/10 flex flex-col gap-1">
                        <span className="text-[8px] text-white/40 uppercase">{stat.label}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-white/45">A definir no projeto</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border border-white/10 bg-black/30 flex items-start gap-3">
                    <TrendingUp className="w-4 h-4 text-white/30 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-white/50 leading-snug">
                      O painel pode mostrar status, entregas e indicadores. Métricas de mídia e retorno exigem integração com as respectivas fontes de dados.
                    </p>
                  </div>
                </div>

                <div className="text-[10px] text-white/40 border-t border-white/10 pt-4 mt-4 flex justify-between">
                  <span>EXEMPLO DE ORGANIZAÇÃO DE PROJETO</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
