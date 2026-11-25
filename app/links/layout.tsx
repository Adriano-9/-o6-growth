import type { Metadata } from "next";
import { OG_IMAGE } from "@/app/_lib/seo/og";

export const metadata: Metadata = {
  title: "Comece pela O6: Diagnóstico e Contato | O6 Growth",
  description: "Todos os caminhos da O6 num lugar: Diagnóstico Express, soluções para clínicas, portfólio e WhatsApp. Escolha por onde começar.",
  alternates: { canonical: "/links" },
  openGraph: { title: "Comece pela O6: Diagnóstico e Contato | O6 Growth", description: "Todos os caminhos da O6 num lugar: Diagnóstico Express, soluções para clínicas, portfólio e WhatsApp. Escolha por onde começar.", url: "/links", type: "website", locale: "pt_BR", siteName: "O6 Growth", images: [OG_IMAGE] },
};

export default function LinksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
