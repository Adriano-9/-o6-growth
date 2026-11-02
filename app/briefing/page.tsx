"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { getAttribution } from "./_lib/attribution";

const services = [
  "Site institucional",
  "Landing page",
  "Dashboard",
  "CRM e sistema comercial",
  "Automação de atendimento",
  "Campanha de marketing",
  "Conteúdo",
  "Vídeo e audiovisual",
  "Fundação estratégica e de marca",
  "Sprint de produção",
  "Acompanhamento mensal",
  "Diagnóstico",
];

export default function BriefingPage() {
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "saving") return;
    const data = new FormData(event.currentTarget);
    setStatus("saving");
    try {
      const response = await fetch("/api/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "briefing",
          service: data.get("service"),
          name: data.get("name"),
          business: data.get("business"),
          email: data.get("email"),
          objective: data.get("objective"),
          reference: data.get("reference"),
          deadline: data.get("deadline"),
          attribution: getAttribution(),
        }),
      });
      setStatus(response.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-brand-offwhite text-brand-graphite">
      <header className="border-b border-brand-graphite/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/links" className="inline-flex items-center gap-2 text-xs font-black uppercase"><ArrowLeft className="h-4 w-4" /> Voltar</Link>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand-orange">O6 Growth</span>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-14 md:py-20">
        <div className="max-w-3xl">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-brand-orange">Briefing de projeto</p>
          <h1 className="mt-4 text-4xl font-black uppercase leading-[1.02] md:text-6xl">O que precisa existir agora?</h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-brand-graphite/65">Este é o briefing inicial do projeto. Conte seu objetivo e deixe um e-mail para a O6 avaliar o contexto e retornar com o próximo passo.</p>
        </div>

        {status === "success" ? (
          <div role="status" className="mt-12 max-w-2xl border-2 border-brand-graphite bg-white p-8 shadow-[5px_5px_0px_0px_#121212]">
            <Check className="h-8 w-8 text-emerald-600" />
            <h2 className="mt-5 text-2xl font-black uppercase">Briefing recebido.</h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-graphite/65">Suas respostas foram registradas. A O6 vai analisar o projeto e retornar pelo e-mail informado.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-12 grid max-w-3xl gap-8 border-2 border-brand-graphite bg-white p-6 shadow-[5px_5px_0px_0px_#121212] md:p-8">
            <label className="grid gap-2 text-sm font-bold">O que você quer criar?
              <select name="service" required className="border-2 border-brand-graphite bg-brand-offwhite px-4 py-3 text-sm font-normal outline-none focus:border-brand-orange">
                <option value="">Selecione uma opção</option>
                {services.map((service) => <option key={service}>{service}</option>)}
              </select>
            </label>
            <div className="grid gap-6 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold">Seu nome<input name="name" required className="border-2 border-brand-graphite bg-brand-offwhite px-4 py-3 text-sm font-normal outline-none focus:border-brand-orange" placeholder="Como podemos chamar você?" /></label>
              <label className="grid gap-2 text-sm font-bold">Negócio ou marca<input name="business" required className="border-2 border-brand-graphite bg-brand-offwhite px-4 py-3 text-sm font-normal outline-none focus:border-brand-orange" placeholder="Nome da empresa" /></label>
            </div>
            <label className="grid gap-2 text-sm font-bold">E-mail para retorno<input name="email" type="email" required autoComplete="email" className="border-2 border-brand-graphite bg-brand-offwhite px-4 py-3 text-sm font-normal outline-none focus:border-brand-orange" placeholder="seu@email.com" /></label>
            <label className="grid gap-2 text-sm font-bold">Qual resultado você quer alcançar?<textarea name="objective" required rows={4} className="resize-y border-2 border-brand-graphite bg-brand-offwhite px-4 py-3 text-sm font-normal outline-none focus:border-brand-orange" placeholder="Ex.: explicar melhor o serviço, gerar pedidos de orçamento, organizar uma campanha..." /></label>
            <div className="grid gap-6 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold">Referências ou links<textarea name="reference" rows={3} className="resize-y border-2 border-brand-graphite bg-brand-offwhite px-4 py-3 text-sm font-normal outline-none focus:border-brand-orange" placeholder="Sites, perfis ou materiais que ajudam a explicar o projeto" /></label>
              <label className="grid gap-2 text-sm font-bold">Prazo desejado<input name="deadline" className="border-2 border-brand-graphite bg-brand-offwhite px-4 py-3 text-sm font-normal outline-none focus:border-brand-orange" placeholder="Ex.: novembro de 2026" /></label>
            </div>
            {status === "error" && <p role="alert" className="text-sm font-semibold text-red-700">Não conseguimos registrar seu briefing. Confira a conexão e tente novamente; suas respostas continuam no formulário.</p>}
            <button type="submit" disabled={status === "saving"} className="inline-flex items-center justify-center gap-2 bg-brand-orange px-6 py-4 text-sm font-black uppercase text-white shadow-[4px_4px_0px_0px_#121212] transition-transform hover:-translate-y-0.5 disabled:opacity-60">{status === "saving" ? "Registrando..." : "Enviar briefing"} <ArrowRight className="h-4 w-4" /></button>
          </form>
        )}
      </section>
    </main>
  );
}
