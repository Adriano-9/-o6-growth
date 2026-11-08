import { MobileContactBar } from "@/app/_lib/MobileContactBar";

export default function ServicosLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <MobileContactBar message="Olá, vi os serviços no site da O6 e quero conversar." />
    </>
  );
}
