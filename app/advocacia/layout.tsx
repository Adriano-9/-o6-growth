import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "O6 Growth | Sistema Comercial para Escritórios de Advocacia",
  description:
    "Novos clientes sem depender de indicação. Sistema de captação, qualificação e follow-up para escritórios de advocacia.",
};

export default function AdvocaciaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
