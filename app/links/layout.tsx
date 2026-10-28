import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comece pela O6 | O6 Growth",
  description: "Apresentação da O6 Growth e caminhos para clínicas, consultórios e escritórios de advocacia.",
};

export default function LinksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
