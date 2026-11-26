"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import type { BriefingReceipt, HybridBriefingInput } from "./_lib/types";

const display = { fontFamily: "var(--font-o6-display)" };
const serif = { fontFamily: "var(--font-o6-serif)" };
const mono = { fontFamily: "var(--font-o6-mono)" };

// Perguntas em linguagem de cliente. Cada resposta é traduzida para os campos técnicos
// que a classificação interna (app/briefing/_lib/router.ts) usa; o cliente nunca vê a régua.
const PROJECT_TYPES = {
  lp: { label: "Uma página para um serviço ou campanha", routes: 1, mode: "novo" },
  site: { label: "Um site completo para a empresa", routes: 5, mode: "novo" },
  reforma: { label: "Melhorar o site que já tenho", routes: 5, mode: "reforma" },
  sistema: { label: "Um sistema (agenda, área do cliente, painel)", routes: 3, mode: "novo" },
  naosei: { label: "Ainda não sei, quero uma orientação", routes: 1, mode: "novo" },
} as const;
type ProjectType = keyof typeof PROJECT_TYPES;

const ACTIONS = ["Chamar no WhatsApp", "Agendar um horário", "Pedir orçamento", "Comprar online"] as const;

const EXTRAS = {
  scheduling: "Agendamento online dentro do site",
  login: "Área com login para clientes ou equipe",
  dashboard: "Painel para acompanhar números",
  privateData: "Guardar dados de clientes ou pacientes",
  payment: "Pagamento online",
} as const;
type Extra = keyof typeof EXTRAS;

const ASSETS = ["Logo", "Fotos profissionais", "Textos prontos", "Vídeos", "Domínio (endereço do site)"] as const;

const STYLES = {
  leve: "Limpo e direto, com movimentos discretos",
  cinematico: "Marcante, com vídeo e animações ao rolar a página",
} as const;
type Style = keyof typeof STYLES;

type Form = {
  name: string;
  whatsapp: string;
  company: string;
  currentUrl: string;
  type: ProjectType;
  action: string;
  goal: string;
  content: string;
  selfEdit: boolean;
  extras: Extra[];
  impression: string;
  style: Style;
  assets: string[];
  notes: string;
};

const initial: Form = {
  name: "", whatsapp: "", company: "", currentUrl: "", type: "lp", action: ACTIONS[0], goal: "", content: "",
  selfEdit: false, extras: [], impression: "", style: "leve", assets: [], notes: "",
};

function toInput(f: Form): HybridBriefingInput {
  const t = PROJECT_TYPES[f.type];
  const has = (e: Extra) => f.extras.includes(e);
  return {
    contactName: f.name,
    contactWhatsapp: f.whatsapp,
    projectName: t.label,
    companyName: f.company,
    projectMode: t.mode,
    currentUrl: f.currentUrl,
    mainGoal: f.goal,
    primaryCta: f.action,
    routesCount: t.routes,
    contentTypes: f.content,
    contentFrequency: f.selfEdit ? "mensal" : "raro",
    clientNeedsEditing: f.selfEdit,
    editableFields: "",
    motionMode: f.style,
    needsLogin: has("login"),
    hasPrivateData: has("privateData"),
    needsScheduling: has("scheduling"),
    needsDashboard: has("dashboard"),
    hasBusinessRules: false,
    businessRules: "",
    existingAssets: f.assets.join(", "),
    vibe: f.impression,
    creativeFreedom: "media",
    journey: "",
    publishDestination: "Vercel",
    integrations: [has("payment") ? "Pagamento online" : "", f.action === "Chamar no WhatsApp" ? "WhatsApp" : ""].filter(Boolean).join(", "),
    constraints: f.notes,
  };
}

const field = "mt-2 w-full rounded-[2px] border border-[#1d2022]/25 bg-white px-4 py-3.5 text-[15px] text-[#1d2022] outline-none placeholder:text-[#8f8d86] focus:border-[#f2542d]";
const label = "block text-[15px] font-semibold";

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-5 border-t border-[#1d2022]/15 py-8 md:grid-cols-[0.35fr_0.65fr] md:gap-10">
      <legend className="sr-only">{title}</legend>
      <div>
        <span className="text-[34px] leading-none text-[#f2542d]" style={display}>{n}</span>
        <h2 className="mt-2 text-xl font-bold">{title}</h2>
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </fieldset>
  );
}

function Choice({ checked, onChange, children, type = "checkbox", name }: { checked: boolean; onChange: () => void; children: React.ReactNode; type?: "checkbox" | "radio"; name?: string }) {
  return (
    <label className={`flex cursor-pointer items-center gap-3 border px-4 py-3.5 text-[15px] ${checked ? "border-[#f2542d] bg-[#fff4f0]" : "border-[#1d2022]/20 bg-white"}`}>
      <input type={type} name={name} checked={checked} onChange={onChange} className="h-4 w-4 accent-[#f2542d]" />
      {children}
    </label>
  );
}

export default function BriefingPage() {
  const [f, setF] = useState<Form>(initial);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setF((cur) => ({ ...cur, [key]: value }));
  const toggle = <K extends "extras" | "assets">(key: K, value: Form[K][number]) =>
    setF((cur) => {
      const list = cur[key] as string[];
      return { ...cur, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] };
    });

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/briefing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toInput(f)),
      });
      const data = (await res.json()) as BriefingReceipt | { error?: string };
      if (!res.ok) throw new Error("error" in data && typeof data.error === "string" ? data.error : "Não foi possível enviar.");
      setSent(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f4f2ec] px-4 text-[#1d2022]" style={{ fontFamily: "var(--font-o6-sans)" }}>
        <div role="status" className="flex max-w-xl flex-col gap-4 border-t-[3px] border-[#f2542d] bg-[#fbfaf6] p-8">
          <span className="text-xs uppercase tracking-[0.12em] text-[#f2542d]" style={mono}>Recebido</span>
          <h1 className="text-[clamp(2rem,5vw,3rem)] uppercase leading-[0.95]" style={display}>Obrigado, {f.name.split(" ")[0] || "tudo certo"}.</h1>
          <p className="text-[17px] text-[#585d5b]">A O6 analisa o que você contou e responde no seu WhatsApp em até 1 dia útil, com a recomendação, o escopo e o investimento.</p>
          <Link href="/" className="self-start border-b border-[#1d2022] pb-0.5 font-semibold">Voltar ao site</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f2ec] text-[#1d2022]" style={{ fontFamily: "var(--font-o6-sans)" }}>
      <header className="border-b border-[#1d2022]/15">
        <div className="mx-auto flex max-w-[1040px] items-center justify-between gap-4 px-4 py-3.5 md:px-8">
          <Link href="/" className="flex items-center gap-2.5 text-sm font-extrabold tracking-[0.04em]">
            <span className="grid h-7 w-7 place-items-center bg-[#f2542d] text-[11px] text-[#170904]">O6</span>O6 GROWTH
          </Link>
          <span className="text-xs uppercase tracking-[0.12em] text-[#585d5b]" style={mono}>Briefing de projeto</span>
        </div>
      </header>

      <section className="mx-auto max-w-[1040px] px-4 pb-4 pt-10 md:px-8 md:pt-14">
        <p className="flex items-center gap-2.5 text-xs uppercase tracking-[0.12em] text-[#585d5b]" style={mono}>
          <span className="h-2 w-2 rounded-full bg-[#f2542d]" />Leva cerca de 5 minutos
        </p>
        <h1 className="mt-4 text-[clamp(2.4rem,6vw,5rem)] uppercase leading-[0.92]" style={display}>
          Conte o que você precisa. A O6 monta o <em className="normal-case text-[#f2542d]" style={serif}>caminho</em>.
        </h1>
        <p className="mt-5 max-w-[52ch] text-[17px] text-[#585d5b]">Não precisa saber termos técnicos. Responda do seu jeito: a gente analisa e responde pelo WhatsApp com a recomendação, o escopo e o investimento.</p>
      </section>

      <form onSubmit={submit} className="mx-auto max-w-[1040px] px-4 pb-16 md:px-8">
        <Step n="01" title="Quem é você">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={label}>Seu nome<input required className={field} value={f.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" /></label>
            <label className={label}>WhatsApp<input required className={field} value={f.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} inputMode="tel" autoComplete="tel" placeholder="(71) 9 9999-9999" /></label>
            <label className={label}>Nome da empresa<input className={field} value={f.company} onChange={(e) => set("company", e.target.value)} placeholder="Ex.: Clínica Aurora" /></label>
            <label className={label}>Site ou Instagram atual (opcional)<input className={field} value={f.currentUrl} onChange={(e) => set("currentUrl", e.target.value)} placeholder="Cole o link, se tiver" /></label>
          </div>
        </Step>

        <Step n="02" title="O que você precisa">
          <div className="grid gap-2.5">
            {(Object.keys(PROJECT_TYPES) as ProjectType[]).map((k) => (
              <Choice key={k} type="radio" name="type" checked={f.type === k} onChange={() => set("type", k)}>{PROJECT_TYPES[k].label}</Choice>
            ))}
          </div>
          <label className={label}>Em poucas palavras, o que você quer alcançar?
            <textarea required rows={3} className={field} value={f.goal} onChange={(e) => set("goal", e.target.value)} placeholder="Ex.: quero que mais pessoas agendem avaliação de harmonização pelo site" />
          </label>
        </Step>

        <Step n="03" title="O que o visitante deve fazer">
          <div className="grid gap-2.5 sm:grid-cols-2">
            {ACTIONS.map((a) => <Choice key={a} type="radio" name="action" checked={f.action === a} onChange={() => set("action", a)}>{a}</Choice>)}
          </div>
          <label className={label}>O que precisa aparecer na página?
            <textarea rows={3} className={field} value={f.content} onChange={(e) => set("content", e.target.value)} placeholder="Ex.: serviços, equipe, fotos do espaço, depoimentos, endereço" />
          </label>
          <Choice checked={f.selfEdit} onChange={() => set("selfEdit", !f.selfEdit)}>Quero conseguir mudar textos e fotos sozinho depois</Choice>
        </Step>

        <Step n="04" title="Precisa de algo a mais?">
          <p className="-mt-2 text-sm text-[#585d5b]">Marque só se precisar. Se não souber, deixe em branco.</p>
          <div className="grid gap-2.5">
            {(Object.keys(EXTRAS) as Extra[]).map((k) => <Choice key={k} checked={f.extras.includes(k)} onChange={() => toggle("extras", k)}>{EXTRAS[k]}</Choice>)}
          </div>
        </Step>

        <Step n="05" title="Como deve parecer">
          <label className={label}>Que impressão o cliente deve ter ao ver o site?
            <input className={field} value={f.impression} onChange={(e) => set("impression", e.target.value)} placeholder="Ex.: acolhedor e confiável · sofisticado e discreto" />
          </label>
          <div className="grid gap-2.5">
            {(Object.keys(STYLES) as Style[]).map((k) => <Choice key={k} type="radio" name="style" checked={f.style === k} onChange={() => set("style", k)}>{STYLES[k]}</Choice>)}
          </div>
        </Step>

        <Step n="06" title="O que você já tem">
          <div className="grid gap-2.5 sm:grid-cols-2">
            {ASSETS.map((a) => <Choice key={a} checked={f.assets.includes(a)} onChange={() => toggle("assets", a)}>{a}</Choice>)}
          </div>
          <label className={label}>Algo mais que a gente deva saber? (opcional)
            <textarea rows={3} className={field} value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Prazo, referência de site que você gosta, orçamento previsto..." />
          </label>
        </Step>

        <div className="flex flex-col gap-3 border-t border-[#1d2022]/15 pt-8">
          {error && <p role="alert" className="text-sm font-semibold text-[#b3321a]">{error}</p>}
          <button type="submit" disabled={loading} className="inline-flex items-center justify-between gap-5 self-start rounded-[2px] bg-[#f2542d] px-6 py-4 text-[15px] font-bold text-[#170904] disabled:opacity-60">
            {loading ? "Enviando..." : "Enviar briefing"} <span aria-hidden="true">→</span>
          </button>
          <p className="text-xs text-[#585d5b]">Usamos seus dados só para responder sobre este projeto. Não envie dados de pacientes.</p>
        </div>
      </form>
    </main>
  );
}
