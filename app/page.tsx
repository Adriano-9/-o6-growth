import type { Metadata } from "next";
import O6Hero from "@/components/o6/O6Hero";
import O6Problem from "@/components/o6/O6Problem";
import O6XSquad from "@/components/o6/O6XSquad";
import O6Metrics from "@/components/o6/O6Metrics";
import O6Footer from "@/components/o6/O6Footer";

export const metadata: Metadata = {
  title: "O6 Growth | Engenharia de Conversão e Análise de Dados de Alta Performance",
  description:
    "Reduza a latência operacional de contacto de leads para zero. Triagem e qualificação autónoma em menos de 10 segundos com análise de dados de alta performance e dashboards de ROI em tempo real.",
  openGraph: {
    title: "O6 Growth | Inteligência de Negócio para Decisão",
    description:
      "Estanque a hemorragia de leads após 5 minutos. Otimização matemática, roteamento matricial e visão raio-X do pipeline de conversão.",
    type: "website",
  },
};

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-brand-offwhite selection:bg-brand-cyan selection:text-brand-graphite">
      {/* Hero — Presença. Processo. Conversão. */}
      <O6Hero />

      {/* Problema — A hemorragia de leads aos 300 segundos */}
      <O6Problem />

      {/* XSquad — As quatro Unidades Táticas de Operação */}
      <O6XSquad />

      {/* Métricas — Visão Raio-X e Telemetria de ROI */}
      <O6Metrics />

      {/* CTA — Agendar Diagnóstico Estratégico */}
      <O6Footer />
    </main>
  );
}
