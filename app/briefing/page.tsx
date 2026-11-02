"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Clipboard,
  ExternalLink,
  Loader2,
  Sparkles,
} from "lucide-react";
import type {
  ContentFrequency,
  CreativeFreedom,
  HybridBriefingInput,
  HybridBriefingResult,
  MotionMode,
  ProjectMode,
} from "./_lib/types";

const initialInput: HybridBriefingInput = {
  projectName: "",
  companyName: "",
  projectMode: "novo",
  currentUrl: "",
  mainGoal: "",
  primaryCta: "",
  routesCount: 1,
  contentTypes: "",
  contentFrequency: "raro",
  clientNeedsEditing: false,
  editableFields: "",
  motionMode: "leve",
  needsLogin: false,
  hasPrivateData: false,
  needsScheduling: false,
  needsDashboard: false,
  hasBusinessRules: false,
  businessRules: "",
  existingAssets: "",
  vibe: "",
  creativeFreedom: "alta",
  journey: "",
  publishDestination: "Vercel",
  integrations: "",
  constraints: "",
};

function Field({
  label,
  hint,
  children,
  full = false,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-2 ${full ? "md:col-span-2" : ""}`}>
      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400">
        {label}
      </span>
      {children}
      {hint ? <span className="text-xs text-zinc-600">{hint}</span> : null}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">
      <span className="text-sm text-zinc-200">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-cyan-400"
      />
    </label>
  );
}

const inputClass =
  "rounded-xl border border-white/10 bg-zinc-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/15";

export default function HybridBriefingPage() {
  const [input, setInput] = useState<HybridBriefingInput>(initialInput);
  const [result, setResult] = useState<HybridBriefingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const completion = useMemo(() => {
    const essentials = [
      input.projectName,
      input.companyName,
      input.mainGoal,
      input.primaryCta,
      input.contentTypes,
      input.vibe,
      input.existingAssets,
      input.publishDestination,
    ];
    const done = essentials.filter((v) => v.trim().length > 0).length;
    return Math.round((done / essentials.length) * 100);
  }, [input]);

  function patch<K extends keyof HybridBriefingInput>(
    key: K,
    value: HybridBriefingInput[K],
  ) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/briefing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = (await res.json()) as HybridBriefingResult | { error?: string };
      if (!res.ok) {
        const message =
          "error" in data && typeof data.error === "string"
            ? data.error
            : "Não foi possível gerar o briefing.";
        throw new Error(message);
      }
      setResult(data as HybridBriefingResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  async function copyBriefing() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.markdown);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Não foi possível copiar automaticamente.");
    }
  }

  return (
    <main className="min-h-screen bg-[#090909] text-zinc-100 selection:bg-brand-cyan selection:text-zinc-950">
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <a href="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center bg-brand-orange text-xs font-black text-white">
              O6
            </span>
            <div>
              <div className="text-sm font-black uppercase tracking-tight text-white">
                Briefing Híbrido
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                O6 Website Router
              </div>
            </div>
          </a>
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
              Completude
            </div>
            <div className="mt-1 text-sm font-black tabular-nums text-brand-cyan">
              {completion}%
            </div>
          </div>
        </div>
      </header>

      <form onSubmit={submit}>
        <section className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="lg:sticky lg:top-8 lg:self-start">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-cyan">
                Intake + decisão técnica
              </div>
              <h1 className="mt-4 max-w-2xl text-4xl font-black uppercase leading-[0.95] tracking-[-0.055em] text-white md:text-6xl">
                O cliente responde.
                <br />
                O sistema organiza.
                <br />
                <span className="text-zinc-500">A O6 decide.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-400">
                O briefing combina informação humana com a régua técnica N1–N4,
                Lane A–C e síntese assistida por IA. A classificação não é
                terceirizada para o modelo.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-2">
                {["N1–N4", "Lane A–C", "CMS / App"].map((item) => (
                  <div
                    key={item}
                    className="border border-white/10 bg-white/[0.025] px-3 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-400"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 md:p-7">
                <div className="mb-6">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-orange">
                    01 · Negócio e objetivo
                  </div>
                  <h2 className="mt-2 text-xl font-black uppercase text-white">
                    O que precisa acontecer?
                  </h2>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Empresa">
                    <input
                      className={inputClass}
                      value={input.companyName}
                      onChange={(e) => patch("companyName", e.target.value)}
                      placeholder="Ex.: Residencial Vista Mar"
                    />
                  </Field>
                  <Field label="Nome do projeto">
                    <input
                      className={inputClass}
                      value={input.projectName}
                      onChange={(e) => patch("projectName", e.target.value)}
                      placeholder="Ex.: LP lançamento Vista Mar"
                    />
                  </Field>
                  <Field label="Projeto">
                    <select
                      className={inputClass}
                      value={input.projectMode}
                      onChange={(e) =>
                        patch("projectMode", e.target.value as ProjectMode)
                      }
                    >
                      <option value="novo">Site novo</option>
                      <option value="reforma">Reforma / evolução</option>
                    </select>
                  </Field>
                  <Field label="URL atual" hint="Opcional quando o projeto é novo.">
                    <input
                      className={inputClass}
                      value={input.currentUrl}
                      onChange={(e) => patch("currentUrl", e.target.value)}
                      placeholder="https://..."
                    />
                  </Field>
                  <Field label="Objetivo principal" full>
                    <textarea
                      className={inputClass}
                      rows={3}
                      value={input.mainGoal}
                      onChange={(e) => patch("mainGoal", e.target.value)}
                      placeholder="O que o visitante deve entender, sentir ou fazer?"
                    />
                  </Field>
                  <Field label="CTA principal">
                    <input
                      className={inputClass}
                      value={input.primaryCta}
                      onChange={(e) => patch("primaryCta", e.target.value)}
                      placeholder="Agendar visita, pedir orçamento..."
                    />
                  </Field>
                  <Field label="Páginas / rotas">
                    <input
                      className={inputClass}
                      type="number"
                      min={1}
                      max={50}
                      value={input.routesCount}
                      onChange={(e) =>
                        patch("routesCount", Math.max(1, Number(e.target.value) || 1))
                      }
                    />
                  </Field>
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 md:p-7">
                <div className="mb-6">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-orange">
                    02 · Conteúdo e autonomia
                  </div>
                  <h2 className="mt-2 text-xl font-black uppercase text-white">
                    O que muda e quem edita?
                  </h2>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Conteúdo publicado" full>
                    <textarea
                      className={inputClass}
                      rows={3}
                      value={input.contentTypes}
                      onChange={(e) => patch("contentTypes", e.target.value)}
                      placeholder="Serviços, preços, fotos, imóveis, cardápio, blog..."
                    />
                  </Field>
                  <Field label="Frequência de atualização">
                    <select
                      className={inputClass}
                      value={input.contentFrequency}
                      onChange={(e) =>
                        patch(
                          "contentFrequency",
                          e.target.value as ContentFrequency,
                        )
                      }
                    >
                      <option value="raro">Raramente</option>
                      <option value="mensal">Mensalmente</option>
                      <option value="semanal">Semanalmente</option>
                    </select>
                  </Field>
                  <Toggle
                    label="Cliente precisa editar sem tocar no código"
                    checked={input.clientNeedsEditing}
                    onChange={(v) => patch("clientNeedsEditing", v)}
                  />
                  {input.clientNeedsEditing ? (
                    <Field label="Campos editáveis" full>
                      <textarea
                        className={inputClass}
                        rows={2}
                        value={input.editableFields}
                        onChange={(e) => patch("editableFields", e.target.value)}
                        placeholder="Preços, horários, catálogo, equipe..."
                      />
                    </Field>
                  ) : null}
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 md:p-7">
                <div className="mb-6">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-orange">
                    03 · Experiência e lógica
                  </div>
                  <h2 className="mt-2 text-xl font-black uppercase text-white">
                    Site, cinema ou aplicação?
                  </h2>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Experiência visual">
                    <select
                      className={inputClass}
                      value={input.motionMode}
                      onChange={(e) =>
                        patch("motionMode", e.target.value as MotionMode)
                      }
                    >
                      <option value="leve">Motion leve / 2D</option>
                      <option value="cinematico">Vídeo cinematográfico / scroll</option>
                      <option value="3d_interativo">3D interativo real</option>
                    </select>
                  </Field>
                  <Field label="Liberdade criativa">
                    <select
                      className={inputClass}
                      value={input.creativeFreedom}
                      onChange={(e) =>
                        patch(
                          "creativeFreedom",
                          e.target.value as CreativeFreedom,
                        )
                      }
                    >
                      <option value="alta">Alta</option>
                      <option value="media">Média</option>
                      <option value="baixa">Baixa</option>
                    </select>
                  </Field>
                  <Toggle
                    label="Login / perfis / permissões"
                    checked={input.needsLogin}
                    onChange={(v) => patch("needsLogin", v)}
                  />
                  <Toggle
                    label="Dados privados"
                    checked={input.hasPrivateData}
                    onChange={(v) => patch("hasPrivateData", v)}
                  />
                  <Toggle
                    label="Agendamento"
                    checked={input.needsScheduling}
                    onChange={(v) => patch("needsScheduling", v)}
                  />
                  <Toggle
                    label="Dashboard interno"
                    checked={input.needsDashboard}
                    onChange={(v) => patch("needsDashboard", v)}
                  />
                  <Toggle
                    label="Regras de negócio próprias"
                    checked={input.hasBusinessRules}
                    onChange={(v) => patch("hasBusinessRules", v)}
                  />
                  {input.hasBusinessRules ? (
                    <Field label="Regras de negócio" full>
                      <textarea
                        className={inputClass}
                        rows={3}
                        value={input.businessRules}
                        onChange={(e) => patch("businessRules", e.target.value)}
                        placeholder="Descreva estados, permissões, cálculos e critérios..."
                      />
                    </Field>
                  ) : null}
                  <Field label="Vibe em uma linha" full>
                    <input
                      className={inputClass}
                      value={input.vibe}
                      onChange={(e) => patch("vibe", e.target.value)}
                      placeholder="Ex.: arquitetura premium, silenciosa, atlântica e contemporânea"
                    />
                  </Field>
                  <Field
                    label="Jornada / capítulos"
                    hint="Obrigatório quando a experiência for cinematográfica."
                    full
                  >
                    <textarea
                      className={inputClass}
                      rows={3}
                      value={input.journey}
                      onChange={(e) => patch("journey", e.target.value)}
                      placeholder="Hero → contexto → prova → produto → CTA..."
                    />
                  </Field>
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 md:p-7">
                <div className="mb-6">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-orange">
                    04 · Produção
                  </div>
                  <h2 className="mt-2 text-xl font-black uppercase text-white">
                    O que já existe e o que falta?
                  </h2>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Ativos existentes" full>
                    <textarea
                      className={inputClass}
                      rows={3}
                      value={input.existingAssets}
                      onChange={(e) => patch("existingAssets", e.target.value)}
                      placeholder="Logo, brand book, textos, fotos, vídeos, referências..."
                    />
                  </Field>
                  <Field label="Destino de publicação">
                    <input
                      className={inputClass}
                      value={input.publishDestination}
                      onChange={(e) => patch("publishDestination", e.target.value)}
                      placeholder="Vercel, domínio do cliente..."
                    />
                  </Field>
                  <Field label="Integrações">
                    <input
                      className={inputClass}
                      value={input.integrations}
                      onChange={(e) => patch("integrations", e.target.value)}
                      placeholder="WhatsApp, Stripe, Supabase, Calendar..."
                    />
                  </Field>
                  <Field label="Restrições / riscos" full>
                    <textarea
                      className={inputClass}
                      rows={3}
                      value={input.constraints}
                      onChange={(e) => patch("constraints", e.target.value)}
                      placeholder="Prazo, compliance, assets pendentes, orçamento de mídia..."
                    />
                  </Field>
                </div>
              </section>

              {error ? (
                <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-brand-cyan px-6 py-4 text-sm font-black uppercase tracking-[0.13em] text-zinc-950 transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Estruturando briefing
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Gerar briefing híbrido
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </form>

      {result ? (
        <section className="border-t border-white/10 bg-white/[0.02]">
          <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
            <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-cyan">
                  Saída pronta para produção
                </div>
                <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
                  {result.routing.level} · {result.routing.levelLabel}
                </h2>
                <p className="mt-2 text-sm text-zinc-500">
                  {result.aiGenerated
                    ? "Síntese enriquecida por IA + classificação determinística."
                    : "Classificação determinística + síntese de fallback."}
                </p>
              </div>
              <button
                type="button"
                onClick={copyBriefing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-200 hover:bg-white/[0.05]"
              >
                {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                {copied ? "Copiado" : "Copiar briefing"}
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {[
                ["Nível", `${result.routing.level} · ${result.routing.levelLabel}`],
                ["Lane", `${result.routing.lane} · ${result.routing.laneLabel}`],
                ["Arquitetura", result.routing.architectureLabel],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/10 bg-zinc-950/60 p-5"
                >
                  <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                    {label}
                  </div>
                  <div className="mt-2 text-base font-black text-white">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-zinc-950/60 p-5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                    Faixa de referência
                  </div>
                  <div className="mt-2 text-2xl font-black text-white">
                    {result.routing.priceReference}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-zinc-950/60 p-5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                    Próximo passo
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                    {result.ai.recommendedNextStep}
                  </p>
                </div>
                {input.currentUrl ? (
                  <a
                    href={input.currentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-cyan hover:underline"
                  >
                    Abrir referência atual
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </div>

              <pre className="max-h-[720px] overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black p-5 text-xs leading-relaxed text-zinc-300">
                {result.markdown}
              </pre>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
