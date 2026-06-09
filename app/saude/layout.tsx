import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "O6 Growth | Sistema Comercial para Clínicas e Consultórios",
  description:
    "Sua agenda cheia de pacientes particulares. Sistema de captação, qualificação e follow-up para clínicas médicas, odontológicas e de estética.",
};

export default function SaudeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
