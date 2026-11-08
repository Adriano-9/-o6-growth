import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AttributionCapture } from "./_lib/analytics/AttributionCapture";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://o6-growth.vercel.app"),
  title: "O6 Growth",
  description: "Estratégia, marca, site, conteúdo e atendimento para clínicas, consultórios e serviços em Salvador. Comece pelo Diagnóstico Express.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><AttributionCapture />{children}</body>
    </html>
  );
}
