"use client";

import { useEffect } from "react";
import { ArrowUpRight, Building2, Scale, Stethoscope } from "lucide-react";
import { captureAttribution } from "@/app/_lib/analytics/attribution";
import { LINKS } from "./_lib/links";

const icons = { o6: Building2, saude: Stethoscope, advocacia: Scale };

function recordClick(linkId: string) {
  const payload = JSON.stringify({ link_id: linkId, attribution: captureAttribution() });
  const url = "/api/analytics/links/click";
  if (navigator.sendBeacon?.(url, new Blob([payload], { type: "application/json" }))) return;
  void fetch(url, { method: "POST", body: payload, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
}

export function TrackedLinks() {
  useEffect(() => { captureAttribution(); }, []);

  return (
    <nav className="grid gap-3" aria-label="Links principais">
      {LINKS.map(({ id, href, label, description, accent }) => {
        const Icon = icons[id];
        return (
          <a key={id} href={href} onClick={() => recordClick(id)} onAuxClick={(event) => { if (event.button === 1) recordClick(id); }} className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 border border-white/20 bg-white/[0.04] p-4 transition-colors hover:border-brand-orange hover:bg-white/[0.08]">
            <span className={`grid h-11 w-11 place-items-center ${accent}`}><Icon className="h-5 w-5" /></span>
            <span>
              <span className="block text-sm font-black uppercase">{label}</span>
              <span className="mt-1 block text-xs leading-relaxed text-white/55">{description}</span>
            </span>
            <ArrowUpRight className="h-5 w-5 text-white/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-orange" />
          </a>
        );
      })}
    </nav>
  );
}
