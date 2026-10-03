import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diagnóstico Gratuito O6 — Descubra onde sua clínica perde pacientes | O6 Growth",
  description:
    "Diagnóstico gratuito do funil comercial da sua clínica. Analisamos Presença, Atendimento, Processo, Automação e Conversão para encontrar onde você está perdendo pacientes.",
};

export default function DiagnosticoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
