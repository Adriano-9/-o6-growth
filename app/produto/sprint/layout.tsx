import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sistema O6 | O6 Growth",
  description: "Processos e automações proporcionais ao gargalo real, definidos sob escopo.",
};

export default function SprintLayout({ children }: { children: React.ReactNode }) {
  void children;
  redirect("/servicos/sprint");
}
