"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createLead } from "@/app/crm/_lib/api";
import { emptyLeadInput } from "@/app/crm/_lib/types";
import { getAttribution } from "@/app/briefing/_lib/attribution";

const mono = { fontFamily: "var(--font-o6-mono)" };

const concerns = {
  resposta: "Resposta aos novos contatos",
  agenda: "Agendamento e confirmação",
  retorno: "Retorno após orçamento",
  presenca: "Ser encontrada no Google e no Instagram",
} as const;
type Concern = keyof typeof concerns;

/** Pedido de conversa da página de clínicas. Mesmo fluxo de antes: lead no CRM com origem site_o6_saude. */
export function SaudeLeadForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("Odontologia");
  const [concern, setConcern] = useState<Concern>("resposta");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    const attribution = getAttribution();
    try {
      const lead = await createLead({
        ...emptyLeadInput("Novo Lead"),
        nome: name.trim(),
        whatsapp: phone.trim(),
        nicho: specialty,
        cidade: "Salvador",
        origem: "site_o6_saude",
        notas: `Pedido de conversa LP saúde. Especialidade: ${specialty}. Ponto de atenção: ${concerns[concern]}. Origem: ${attribution.utm_source || "direto"}; mídia: ${attribution.utm_medium || "não informada"}; campanha: ${attribution.utm_campaign || "não informada"}; página: ${attribution.page}.`,
      });
      setStatus(lead ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div role="status" className="flex flex-col gap-4 bg-[#fbfaf6] p-6 text-[#1d2022] md:p-8">
        <span className="text-xs uppercase tracking-[0.12em] text-[#f2542d]" style={mono}>Recebido</span>
        <p className="text-xl font-bold">A O6 chama você no WhatsApp em até 1 dia útil.</p>
        <p className="text-[15px] text-[#585d5b]">Se quiser a leitura completa da clínica agora, o Diagnóstico Express mostra as 3 prioridades em ordem.</p>
        <Link href="/produto/diagnostico" className="inline-flex items-center justify-between gap-5 self-start rounded-[2px] bg-[#f2542d] px-5 py-3.5 text-[15px] font-bold text-[#170904]">Ver o Diagnóstico Express <span aria-hidden="true">→</span></Link>
      </div>
    );
  }

  const field = "mt-2 w-full rounded-[2px] border border-[#1d2022]/25 bg-white px-4 py-3.5 text-[15px] outline-none focus:border-[#f2542d]";
  return (
    <form onSubmit={submit} className="flex flex-col gap-5 bg-[#fbfaf6] p-6 text-[#1d2022] md:p-8">
      <div>
        <span className="text-xs uppercase tracking-[0.12em] text-[#585d5b]" style={mono}>Pedir conversa</span>
        <p className="mt-1 text-sm text-[#585d5b]">Leva 1 minuto. Não envie dados de pacientes.</p>
      </div>
      <label className="text-sm font-semibold">Seu nome<input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} /></label>
      <label className="text-sm font-semibold">WhatsApp<input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="(71) 9 9999-9999" className={field} /></label>
      <label className="text-sm font-semibold">Especialidade
        <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className={field}>
          {["Odontologia", "Clínica médica", "Estética", "Fisioterapia", "Outra especialidade"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </label>
      <label className="text-sm font-semibold">O que mais preocupa hoje?
        <select value={concern} onChange={(e) => setConcern(e.target.value as Concern)} className={field}>
          {Object.entries(concerns).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      {status === "error" && <p role="alert" className="text-sm font-semibold text-[#b3321a]">Não conseguimos registrar. Tente de novo ou fale pelo WhatsApp.</p>}
      <button disabled={status === "saving"} className="inline-flex items-center justify-between gap-5 rounded-[2px] bg-[#f2542d] px-5 py-4 text-[15px] font-bold text-[#170904] disabled:opacity-60">
        {status === "saving" ? "Enviando..." : "Pedir conversa"} <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
