import Link from "next/link";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://o6-growth.vercel.app";

export type Crumb = { name: string; path: string };

/**
 * Trilha de navegação + marcação BreadcrumbList (JSON-LD).
 * `visible=false` emite só a marcação (para landing pages, onde a trilha
 * visível tiraria o foco do CTA).
 */
export function Breadcrumbs({
  items,
  tone = "light",
  visible = true,
  className = "",
}: {
  items: Crumb[];
  tone?: "light" | "dark";
  visible?: boolean;
  className?: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: new URL(c.path, SITE_URL).toString(),
    })),
  };

  const muted = tone === "dark" ? "text-white/55 hover:text-white" : "text-black/55 hover:text-black";
  const current = tone === "dark" ? "text-white/85" : "text-black/80";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {visible && (
        <nav aria-label="Você está em" className={`text-xs ${className}`}>
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {items.map((c, i) => {
              const last = i === items.length - 1;
              return (
                <li key={c.path} className="flex items-center gap-2">
                  {last ? (
                    <span aria-current="page" className={current}>{c.name}</span>
                  ) : (
                    <>
                      <Link href={c.path} className={`${muted} underline-offset-4 hover:underline`}>{c.name}</Link>
                      <span aria-hidden="true" className={muted}>/</span>
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}
    </>
  );
}
