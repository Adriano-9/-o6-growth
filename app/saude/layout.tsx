import type { Metadata } from "next";
import { Breadcrumbs } from "@/app/_lib/seo/Breadcrumbs";
import { MobileContactBar } from "@/app/_lib/MobileContactBar";
import { OG_IMAGE } from "@/app/_lib/seo/og";

export const metadata: Metadata = {
  title: "Marketing para Clínicas e Consultórios | O6 Growth",
  description: "Descubra onde o paciente desiste entre o Instagram, o site e o WhatsApp. Peça uma leitura inicial da sua clínica à O6.",
  alternates: { canonical: "/saude" },
  openGraph: { title: "Marketing para Clínicas e Consultórios | O6 Growth", description: "Descubra onde o paciente desiste entre o Instagram, o site e o WhatsApp. Peça uma leitura inicial da sua clínica à O6.", url: "/saude", type: "website", locale: "pt_BR", siteName: "O6 Growth", images: [OG_IMAGE] },
};

export default function SaudeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Breadcrumbs visible={false} items={[{ name: "Início", path: "/" }, { name: "Clínicas e consultórios", path: "/saude" }]} />
      {children}
      <MobileContactBar message="Olá, tenho uma clínica e vim pelo site da O6." />
    </>
  );
}
