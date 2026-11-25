import type { Metadata } from "next";
import { o6Fonts } from "@/app/_lib/fonts-o6";

export const metadata: Metadata = {
  title: "Obrigado | O6 Growth",
  robots: { index: false, follow: false },
};

export default function ObrigadoLayout({ children }: { children: React.ReactNode }) {
  return <div className={o6Fonts}>{children}</div>;
}
