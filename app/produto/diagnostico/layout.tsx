import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diagnóstico O6 — Saiba onde sua clínica está vazando | O6 Growth",
  description:
    "Diagnóstico completo do funil de captação da sua clínica em 5 dias. Vídeo personalizado + plano de ação + 3 principais vazamentos mapeados. R$ 800.",
};

export default function DiagnosticoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
