import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://o6-growth.vercel.app";
const serviceSlugs = ["diagnostico", "fundacao", "campanhas", "sites", "dashboards", "videos", "sprint", "retainer"];

export default function sitemap(): MetadataRoute.Sitemap {
  const publicPaths = [
    "",
    "/saude",
    "/advocacia",
    "/servicos",
    "/portfolio/index.html",
    "/portfolio/about/index.html",
    "/portfolio/work/index.html",
    "/portfolio/work/aquila/index.html",
    "/portfolio/systems/index.html",
  ];

  return [
    ...publicPaths.map((path) => ({
      url: new URL(path, siteUrl).toString(),
      changeFrequency: "monthly" as const,
    })),
    ...serviceSlugs.map((slug) => ({
      url: new URL(`/servicos/${slug}`, siteUrl).toString(),
      changeFrequency: "monthly" as const,
    })),
  ];
}
