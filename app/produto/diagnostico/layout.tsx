import type { Metadata } from "next";
import { Breadcrumbs } from "@/app/_lib/seo/Breadcrumbs";
import { OG_IMAGE } from "@/app/_lib/seo/og";
import { o6Fonts } from "@/app/_lib/fonts-o6";

const title = "Diagnóstico Express: o que Trava suas Vendas | O6";
const description = "Descubra onde o interesse do cliente perde força, do Instagram ao WhatsApp. Até 3 prioridades com revisão humana por R$ 197. Comece agora.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/produto/diagnostico" },
  openGraph: { title, description, url: "/produto/diagnostico", type: "website", locale: "pt_BR", siteName: "O6 Growth", images: [OG_IMAGE] },
};

export default function DiagnosticoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={o6Fonts}>
      <Breadcrumbs visible={false} items={[{ name: "Início", path: "/" }, { name: "Diagnóstico Consultivo Express", path: "/produto/diagnostico" }]} />
      {children}
    </div>
  );
}
