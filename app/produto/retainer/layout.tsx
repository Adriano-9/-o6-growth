import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Retainer O6 — Sistema melhorando todo mês | O6 Growth",
  description:
    "Acompanhamento mensal: monitoramento, otimizações com base em dados reais, suporte direto com Adriano, relatório mensal. R$ 1.500/mês (mín. 3 meses).",
};

export default function RetainerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
