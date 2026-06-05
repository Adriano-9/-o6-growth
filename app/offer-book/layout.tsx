import type { Metadata } from "next";
import { Sidebar } from "./_components/Sidebar";
import { OfferBookProvider } from "./_lib/store";

export const metadata: Metadata = {
  title: "O6 Offer Book — Inteligência Comercial",
  description:
    "Coletor e organizador de inteligência comercial da O6 Growth.",
};

export default function OfferBookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OfferBookProvider>
      <div className="flex min-h-screen w-full bg-zinc-950 text-zinc-100">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">
          <div className="px-6 py-10 md:px-10 md:py-12">{children}</div>
        </main>
      </div>
    </OfferBookProvider>
  );
}
