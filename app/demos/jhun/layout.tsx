import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jhun Bistrô | Experiência Gastronômica Japonesa",
  description: "A experiência começa antes de você sentar. Alta gastronomia japonesa contemporânea em Salvador, unindo tradição, refinamento e sofisticação.",
};

export default function JhunLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
