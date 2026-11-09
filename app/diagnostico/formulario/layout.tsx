import type { Metadata } from "next";
import { o6Fonts } from "@/app/_lib/fonts-o6";

export const metadata: Metadata = {
  title: "Formulário do Diagnóstico Express | O6 Growth",
  description: "Conte sobre o seu negócio para começarmos o Diagnóstico Express.",
  robots: { index: false, follow: false },
};

export default function FormularioLayout({ children }: { children: React.ReactNode }) {
  return <div className={o6Fonts}>{children}</div>;
}
