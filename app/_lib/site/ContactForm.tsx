"use client";

import { useState } from "react";
import { getAttribution } from "@/app/briefing/_lib/attribution";

const mono = { fontFamily: "var(--font-o6-mono)" };

const SERVICES = [
  "Diagnóstico Consultivo Express",
  "Fundação estratégica e de marca",
  "Sites e landing pages",
  "Campanhas, conteúdo e audiovisual",
  "Sistema O6",
  "O6 Otimização",
  "Ainda não sei",
] as const;

/**
 * Pedido de conversa no visual da direção C. Mesmo fluxo do antigo O6Footer:
 * POST /api/briefing (kind "contact") → lead no CRM + aviso no Telegram.
 */
export function ContactForm() {
  const [email, setEmail] = useState("");
  const [service, setService] = useState<string>(SERVICES[0]);
  const [state, setState] = useState<"idle" | "saving" | "success" | "error">("idle");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!email || state === "saving") return;
    setState("saving");
    try {
      const response = await fetch("/api/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "contact", email, service, attribution: getAttribution() }),
      });
      setState(response.ok ? "success" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div role="status" className="flex flex-col gap-3 border-t-[3px] border-[#f2542d] bg-[#131517] p-6 text-[#eceae4]">
        <span className="text-xs uppercase tracking-[0.12em] text-[#f2542d]" style={mono}>Recebido</span>
        <p className="text-lg font-bold">A O6 retorna pelo e-mail {email} para entender o projeto.</p>
        <p className="text-sm text-[#a3a19a]">Se preferir adiantar, mande os detalhes pelo WhatsApp.</p>
      </div>
    );
  }

  const field = "w-full rounded-[2px] border border-[#1d2022]/25 bg-[#fbfaf6] px-4 py-3.5 text-[15px] outline-none focus:border-[#f2542d]";
  return (
    <form onSubmit={submit} className="flex flex-col gap-5 border border-[#1d2022]/15 bg-[#fbfaf6] p-6 md:p-8">
      <div>
        <span className="text-xs uppercase tracking-[0.12em] text-[#585d5b]" style={mono}>Pedir conversa</span>
        <p className="mt-1 text-sm text-[#585d5b]">Contato inicial. Respondemos em até 1 dia útil.</p>
      </div>
      <label className="flex flex-col gap-2 text-sm font-semibold">
        Seu melhor e-mail
        <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className={field} />
      </label>
      <label className="flex flex-col gap-2 text-sm font-semibold">
        O que você precisa?
        <select value={service} onChange={(e) => setService(e.target.value)} className={field}>
          {SERVICES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </label>
      {state === "error" && (
        <p role="alert" className="text-sm font-semibold text-[#b3321a]">Não conseguimos registrar agora. Tente de novo; seus dados continuam preenchidos.</p>
      )}
      <button type="submit" disabled={state === "saving"} className="inline-flex items-center justify-between gap-5 rounded-[2px] bg-[#f2542d] px-5 py-4 text-[15px] font-bold text-[#170904] disabled:opacity-60">
        {state === "saving" ? "Enviando..." : "Pedir conversa"} <span aria-hidden="true">→</span>
      </button>
      <p className="text-xs text-[#585d5b]">Usamos seu e-mail só para responder esta solicitação.</p>
    </form>
  );
}
