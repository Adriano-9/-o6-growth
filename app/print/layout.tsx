import type { Metadata } from "next";
import { OfferBookProvider } from "@/app/offer-book/_lib/store";

export const metadata: Metadata = {
  title: "O6 Offer Book — Exportação",
};

export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OfferBookProvider>
      <div className="min-h-screen bg-zinc-950 text-zinc-100">{children}</div>
    </OfferBookProvider>
  );
}
