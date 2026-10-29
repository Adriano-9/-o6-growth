import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comece pela O6 | O6 Growth",
  description: "Diagnóstico Express, presença digital e soluções O6 para clínicas e consultórios.",
};

export default function LinksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
