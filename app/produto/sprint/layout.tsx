import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sprint O6 — Sistema implantado em 14 dias | O6 Growth",
  description:
    "Sistema de captação implantado em 14 dias: resposta automática, follow-up, WhatsApp + agendamento, treinamento da equipe. R$ 4.800 à vista ou 2x R$ 2.500.",
};

export default function SprintLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
