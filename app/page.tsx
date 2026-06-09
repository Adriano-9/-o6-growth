import type { Metadata } from "next";
import O6Hero from "@/components/o6/O6Hero";
import O6Problem from "@/components/o6/O6Problem";
import O6XSquad from "@/components/o6/O6XSquad";
import O6Metrics from "@/components/o6/O6Metrics";
import O6Footer from "@/components/o6/O6Footer";

export const metadata: Metadata = {
  title: "O6 Growth | Mais Pacientes e Clientes com Sistema de Conversão",
  description:
    "Sistema comercial para clínicas, consultórios e escritórios. Resposta rápida, follow-up automático e visibilidade total do ROI de cada canal.",
  openGraph: {
    title: "O6 Growth | Sistema Comercial para Serviços Profissionais",
    description:
      "Pare de perder leads por demora no atendimento. Sistema de aquisição, conversão e acompanhamento com ROI visível em tempo real.",
    type: "website",
  },
};

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-brand-offwhite selection:bg-brand-cyan selection:text-brand-graphite">
      <O6Hero />
      <O6Problem />
      <O6XSquad />
      <O6Metrics />
      <O6Footer />
    </main>
  );
}
