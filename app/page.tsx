import type { Metadata } from "next";
import { OG_IMAGE } from "@/app/_lib/seo/og";
import O6Hero from "@/components/o6/O6Hero";
import O6Problem from "@/components/o6/O6Problem";
import O6XSquad from "@/components/o6/O6XSquad";
import O6Metrics from "@/components/o6/O6Metrics";
import O6Footer from "@/components/o6/O6Footer";
import { MobileContactBar } from "@/app/_lib/MobileContactBar";

export const metadata: Metadata = {
  title: "O6 Growth: Entenda o que Trava suas Vendas",
  description: "Estratégia, marca, site, conteúdo e atendimento para clínicas, consultórios e serviços em Salvador. Comece pelo Diagnóstico Express da O6.",
  alternates: { canonical: "/" },
  openGraph: { title: "O6 Growth: Entenda o que Trava suas Vendas", description: "Estratégia, marca, site, conteúdo e atendimento para clínicas, consultórios e serviços em Salvador. Comece pelo Diagnóstico Express da O6.", url: "/", type: "website", locale: "pt_BR", siteName: "O6 Growth", images: [OG_IMAGE] },
};

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-brand-offwhite selection:bg-brand-orange selection:text-white">
      <O6Hero />
      <O6Problem />
      <O6XSquad />
      <O6Metrics />
      <O6Footer />
      <MobileContactBar />
    </main>
  );
}
