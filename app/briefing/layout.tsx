import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Briefing de projeto | O6 Growth",
  description: "Conte para a O6 qual projeto precisa existir e receba o próximo passo.",
};

export default function BriefingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
