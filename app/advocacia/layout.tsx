import type { Metadata } from "next";
import { Breadcrumbs } from "@/app/_lib/seo/Breadcrumbs";
import { MobileContactBar } from "@/app/_lib/MobileContactBar";
import { OG_IMAGE } from "@/app/_lib/seo/og";

export const metadata: Metadata = {
  title: "Marketing para Escritórios de Advocacia | O6 Growth",
  description: "Presença, triagem do primeiro contato e acompanhamento de propostas para escritórios. Peça uma leitura inicial à O6.",
  alternates: { canonical: "/advocacia" },
  openGraph: { title: "Marketing para Escritórios de Advocacia | O6 Growth", description: "Presença, triagem do primeiro contato e acompanhamento de propostas para escritórios. Peça uma leitura inicial à O6.", url: "/advocacia", type: "website", locale: "pt_BR", siteName: "O6 Growth", images: [OG_IMAGE] },
};

export default function AdvocaciaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Breadcrumbs visible={false} items={[{ name: "Início", path: "/" }, { name: "Escritórios de advocacia", path: "/advocacia" }]} />
      {children}
      <MobileContactBar message="Olá, tenho um escritório e vim pelo site da O6." />
    </>
  );
}
