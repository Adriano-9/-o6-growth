import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://o6-growth.vercel.app";

// Áreas internas da operação (CRM, agenda, prospecção, Offer Book etc.).
// Bloquear aqui só evita que buscadores rastreiem; NÃO protege o acesso.
const privatePaths = [
  "/api/",
  "/crm",
  "/agenda",
  "/oportunidades",
  "/os",
  "/offer-book",
  "/offer-book-dashboard",
  "/clientes-dashboard",
  "/dashboard-o6",
  "/print",
  "/obrigado",
  "/proposta-carol/",
  "/diagnostico/",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: privatePaths },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
