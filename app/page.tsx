import type { Metadata } from "next";
import O6Hero from "@/components/o6/O6Hero";
import O6Problem from "@/components/o6/O6Problem";
import O6XSquad from "@/components/o6/O6XSquad";
import O6Metrics from "@/components/o6/O6Metrics";
import O6Footer from "@/components/o6/O6Footer";

export const metadata: Metadata = {
  title: "O6 Growth | Estratégia, Campanhas e Produção Digital",
  description:
    "Estratégia de marca, campanhas, sites, dashboards e produções audiovisuais para empresas que querem comunicar com clareza e crescer.",
  openGraph: {
    title: "O6 Growth | Estratégia e Produção Digital",
    description:
      "Organizamos a estratégia da marca e transformamos em campanhas, sites, dashboards, vídeos e filmes.",
    type: "website",
  },
};

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-brand-offwhite selection:bg-brand-orange selection:text-white">
      <O6Hero />
      <O6Problem />
      <O6XSquad />
      <O6Metrics />
      <O6Footer />
    </main>
  );
}
