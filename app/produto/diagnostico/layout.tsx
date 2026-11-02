import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diagnóstico Express O6 — Cinco frentes do seu negócio | O6 Growth",
  description:
    "Um diagnóstico rápido das cinco frentes que determinam como sua empresa é encontrada, percebida e escolhida. R$ 197, com revisão humana.",
};

export default function DiagnosticoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
