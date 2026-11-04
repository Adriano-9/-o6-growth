import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diagnóstico Consultivo Express — R$ 197 | O6 Growth",
  description:
    "Diagnóstico Express do funil de captação da sua clínica em 5 dias. Plano de ação + 3 principais vazamentos mapeados com dados. R$ 197.",
};

export default function DiagnosticoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
