import type { Metadata } from "next";
import { OG_IMAGE } from "@/app/_lib/seo/og";

export const metadata: Metadata = {
  title: "Briefing de Projeto | O6 Growth",
  description: "Conte qual site, campanha ou projeto você precisa e receba o próximo passo da O6. Preencha o briefing em poucos minutos.",
  alternates: { canonical: "/briefing" },
  openGraph: { title: "Briefing de Projeto | O6 Growth", description: "Conte qual site, campanha ou projeto você precisa e receba o próximo passo da O6. Preencha o briefing em poucos minutos.", url: "/briefing", type: "website", locale: "pt_BR", siteName: "O6 Growth", images: [OG_IMAGE] },
};

export default function BriefingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
