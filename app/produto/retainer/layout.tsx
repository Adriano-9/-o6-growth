import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Retainer | O6 Growth",
  description: "Acompanhamento recorrente com capacidade, cadência e escopo definidos em contrato.",
  alternates: { canonical: "/servicos/otimizacao" },
};

export default function RetainerLayout({ children }: { children: React.ReactNode }) {
  void children;
  redirect("/servicos/otimizacao");
}
