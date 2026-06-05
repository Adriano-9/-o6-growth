import type { Metadata } from "next";
import { OfferBookProvider } from "@/app/offer-book/_lib/store";

export const metadata: Metadata = {
  title: "Dashboard de Clientes — O6 Offer Book",
};

export default function ClientesDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OfferBookProvider>
      <div className="min-h-screen w-full bg-zinc-950 text-zinc-100">
        <div className="px-6 py-10 md:px-10 md:py-12">{children}</div>
      </div>
    </OfferBookProvider>
  );
}
