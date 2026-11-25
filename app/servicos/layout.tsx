import { MobileContactBar } from "@/app/_lib/MobileContactBar";
import { o6Fonts } from "@/app/_lib/fonts-o6";

export default function ServicosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={o6Fonts}>
      {children}
      <MobileContactBar message="Olá, vi os serviços no site da O6 e quero conversar." />
    </div>
  );
}
