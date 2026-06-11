"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Beaker, CalendarPlus, Check, Copy, ExternalLink, Film, Globe, KanbanSquare, Loader2, MessageCircle, Sparkles, Trash2, X } from "lucide-react";
import {
  emptyProspectInput,
  PROSPECT_STATUS,
  Prospect,
  ProspectInput,
  ProspectStatus,
} from "../_lib/types";
import { promoteToCRM, updateProspect } from "../_lib/api";
import { auditProspect } from "../_lib/audit-api";
import { AuditResult } from "../_lib/audit-types";
import { AuditPanel } from "./AuditPanel";

type Mode = "create" | "edit" | "view";

type Props = {
  mode: Mode;
  initial?: Prospect;
  onClose: () => void;
  onSubmit: (input: ProspectInput, id?: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
        {label}
      </span>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={!readOnly ? placeholder : undefined}
        className={[
          "rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition",
          readOnly
            ? "cursor-default opacity-75"
            : "focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20",
        ].join(" ")}
      />
    </label>
  );
}

export function ProspectDrawer({ mode, initial, onClose, onSubmit, onDelete }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "schedule" | "promote">(null);
  const [auditing, setAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);

  const [generating, setGenerating] = useState(false);
  const [abordagem, setAbordagem] = useState<string | null>(null);
  const [abordagemError, setAbordagemError] = useState<string | null>(null);
  const [abordagemScore, setAbordagemScore] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const [demoUrl, setDemoUrl] = useState<string | null>(null);
  const [generatingDemo, setGeneratingDemo] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const [copywriter, setCopywriter] = useState<string>("");

  async function handleGerarAbordagem(force = false) {
    if (!initial) return;
    setGenerating(true);
    setAbordagemError(null);
    try {
      const res = await fetch("/api/prospects/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospect_id: initial.id,
          force,
          ...(copywriter ? { copywriter } : {}),
        }),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || `Erro ${res.status}`);
      }

      const data = (await res.json()) as {
        abertura: string;
        auditScore: number;
        audit: AuditResult;
        demoUrl?: string | null;
        cached: boolean;
      };
      setAbordagem(data.abertura);
      setAbordagemScore(data.auditScore);
      setAuditResult(data.audit);
      if (data.demoUrl) setDemoUrl(data.demoUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao gerar abordagem";
      setAbordagemError(msg);
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopy() {
    if (!abordagem) return;
    try {
      await navigator.clipboard.writeText(abordagem);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard pode falhar em contexto sem HTTPS — ignora */
    }
  }

  async function handleGerarDemo() {
    if (!initial) return;
    setGeneratingDemo(true);
    setDemoError(null);
    try {
      const res = await fetch("/api/prospects/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospect_id: initial.id }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || `Erro ${res.status}`);
      }
      const data = (await res.json()) as { url: string };
      setDemoUrl(data.url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao gerar demo";
      setDemoError(msg);
    } finally {
      setGeneratingDemo(false);
    }
  }

  async function handleGerarVideo() {
    if (!initial) return;
    setGeneratingVideo(true);
    setVideoError(null);
    try {
      const res = await fetch("/api/prospects/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospect_id: initial.id }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || `Erro ${res.status}`);
      }
      const data = (await res.json()) as { url: string };
      setVideoUrl(data.url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao gerar vídeo";
      setVideoError(msg);
    } finally {
      setGeneratingVideo(false);
    }
  }

  async function handleAudit() {
    if (!initial?.site) return;
    setAuditing(true);
    setAuditError(null);
    try {
      // Ensure URL has protocol
      let url = initial.site;
      if (!url.startsWith("http")) {
        url = "https://" + url;
      }
      const result = await auditProspect(initial.id, url);
      setAuditResult(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao auditar site";
      setAuditError(msg);
    } finally {
      setAuditing(false);
    }
  }

  async function handleScheduleMeeting() {
    if (!initial) return;
    setBusy("schedule");
    try {
      // Mark prospect as Reunião + redirect to /agenda with prospectId hint
      await updateProspect(initial.id, { status: "Reunião" });
      onClose();
      router.push(`/agenda?prospectId=${initial.id}&empresa=${encodeURIComponent(initial.nome)}`);
    } finally {
      setBusy(null);
    }
  }

  async function handlePromoteCRM() {
    if (!initial) return;
    setBusy("promote");
    try {
      const leadId = await promoteToCRM(initial);
      onClose();
      if (leadId) {
        router.push("/crm");
      }
    } finally {
      setBusy(null);
    }
  }

  const [input, setInput] = useState<ProspectInput>(
    initial
      ? {
          nome: initial.nome,
          site: initial.site,
          telefone: initial.telefone,
          endereco: initial.endereco,
          cidade: initial.cidade,
          estado: initial.estado,
          instagram: initial.instagram,
          googleRating: initial.googleRating,
          googleReviews: initial.googleReviews,
          categoria: initial.categoria,
          googlePlaceId: initial.googlePlaceId,
          status: initial.status,
        }
      : emptyProspectInput(),
  );

  useEffect(() => {
    setInput(
      initial
        ? {
            nome: initial.nome,
            site: initial.site,
            telefone: initial.telefone,
            endereco: initial.endereco,
            cidade: initial.cidade,
            estado: initial.estado,
            instagram: initial.instagram,
            googleRating: initial.googleRating,
            googleReviews: initial.googleReviews,
            categoria: initial.categoria,
            googlePlaceId: initial.googlePlaceId,
            status: initial.status,
          }
        : emptyProspectInput(),
    );
    // Hidrata cached abordagem/audit/demo, se houver
    setAbordagem(initial?.aberturaWhatsapp ?? null);
    setAbordagemScore(initial?.auditScore ?? null);
    setAuditResult(
      initial?.auditJson
        ? ({
            ...initial.auditJson,
            prospectId: initial.auditJson.prospectId ?? initial.id,
            auditUrl: initial.auditJson.auditUrl ?? initial.site,
          } as AuditResult)
        : null,
    );
    setDemoUrl(initial?.demoUrl ?? null);
    setVideoUrl(null);
    setAbordagemError(null);
    setAuditError(null);
    setDemoError(null);
    setVideoError(null);
  }, [initial?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const patch = (p: Partial<ProspectInput>) =>
    setInput((curr) => ({ ...curr, ...p }));
  const isView = mode === "view";

  return (
    <div className="fixed inset-0 z-30 flex">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="flex-1 bg-black/60 backdrop-blur-sm"
      />
      <aside className="flex h-full w-full max-w-md flex-col border-l border-white/10 bg-zinc-950 shadow-2xl">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-cyan">
              {mode === "create"
                ? "Novo Prospect"
                : mode === "edit"
                  ? "Editar"
                  : "Visualizar"}
            </div>
            <h2 className="mt-0.5 text-base font-black uppercase tracking-tight text-white">
              {input.nome || "Sem nome"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md border border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <form
          className="flex-1 overflow-y-auto px-5 py-5"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(input, initial?.id);
          }}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Empresa"
              value={input.nome}
              onChange={(v) => patch({ nome: v })}
              placeholder="Nome da empresa"
              readOnly={isView}
            />
            <Field
              label="Site"
              value={input.site}
              onChange={(v) => patch({ site: v })}
              placeholder="https://"
              readOnly={isView}
            />
            <Field
              label="Telefone"
              value={input.telefone}
              onChange={(v) => patch({ telefone: v })}
              placeholder="(11) 9 9999-9999"
              readOnly={isView}
            />
            <Field
              label="Instagram"
              value={input.instagram}
              onChange={(v) => patch({ instagram: v })}
              placeholder="@perfil"
              readOnly={isView}
            />
            <Field
              label="Cidade"
              value={input.cidade}
              onChange={(v) => patch({ cidade: v })}
              readOnly={isView}
            />
            <Field
              label="Estado"
              value={input.estado}
              onChange={(v) => patch({ estado: v })}
              placeholder="UF"
              readOnly={isView}
            />
            <Field
              label="Categoria / Nicho"
              value={input.categoria}
              onChange={(v) => patch({ categoria: v })}
              placeholder="Ex.: Estética avançada"
              readOnly={isView}
            />
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Status
              </span>
              <select
                value={input.status}
                disabled={isView}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  patch({ status: e.target.value as ProspectStatus })
                }
                className="rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20 disabled:opacity-75"
              >
                {PROSPECT_STATUS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Nota Google
              </span>
              <input
                type="number"
                min={0}
                max={5}
                step={0.1}
                readOnly={isView}
                value={input.googleRating ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  patch({
                    googleRating: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                placeholder="4.8"
                className="rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Reviews
              </span>
              <input
                type="number"
                min={0}
                readOnly={isView}
                value={input.googleReviews ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  patch({
                    googleReviews: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                placeholder="312"
                className="rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20"
              />
            </label>
          </div>

          {mode !== "create" && initial && (
            <div className="mt-6 space-y-4">
              {/* Funnel glue buttons */}
              <div className="rounded-xl border border-brand-cyan/20 bg-brand-cyan/[0.04] p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-cyan">
                  Próximas etapas
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  Avance este prospect para a próxima fase do funil.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleScheduleMeeting}
                    disabled={busy !== null || auditing}
                    className="inline-flex items-center gap-2 rounded-lg border border-brand-cyan/40 bg-brand-cyan/15 px-3 py-2 text-xs font-bold uppercase tracking-wider text-brand-cyan transition hover:bg-brand-cyan/25 disabled:opacity-40"
                  >
                    {busy === "schedule" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CalendarPlus className="h-3.5 w-3.5" />
                    )}
                    Agendar Reunião
                  </button>
                  <button
                    type="button"
                    onClick={handlePromoteCRM}
                    disabled={busy !== null || auditing}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-200 transition hover:bg-white/[0.08] disabled:opacity-40"
                  >
                    {busy === "promote" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <KanbanSquare className="h-3.5 w-3.5" />
                    )}
                    Promover para CRM
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Copywriter voice selector (opcional) */}
              {initial.site && (
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                    Voz da abordagem
                  </label>
                  <select
                    value={copywriter}
                    onChange={(e) => setCopywriter(e.target.value)}
                    disabled={generating || auditing || generatingDemo || generatingVideo}
                    className="flex-1 rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-1.5 text-xs text-white outline-none focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20 disabled:opacity-50"
                  >
                    <option value="">Default (consultor)</option>
                    <option value="dan-kennedy">Dan Kennedy (direto, no-BS)</option>
                    <option value="eugene-schwartz">Eugene Schwartz (mercado)</option>
                    <option value="gary-halbert">Gary Halbert (A-pile, pessoal)</option>
                    <option value="jon-benson">Jon Benson (pattern interrupt)</option>
                  </select>
                </div>
              )}

              {/* Audit + Gerar Abordagem + Gerar Demo buttons */}
              {initial.site && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <button
                    type="button"
                    onClick={handleAudit}
                    disabled={auditing || generating || generatingDemo || generatingVideo}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-purple-500/40 bg-purple-500/10 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-purple-300 transition hover:bg-purple-500/20 disabled:opacity-40"
                  >
                    {auditing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Beaker className="h-3.5 w-3.5" />
                    )}
                    {auditing ? "Auditando..." : "Auditar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGerarAbordagem(!!abordagem)}
                    disabled={generating || auditing || generatingDemo || generatingVideo}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-emerald-200 transition hover:bg-emerald-400/20 disabled:opacity-40"
                  >
                    {generating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    {generating
                      ? "Gerando..."
                      : abordagem
                        ? "Regerar"
                        : "Abordagem"}
                  </button>
                  <button
                    type="button"
                    onClick={handleGerarDemo}
                    disabled={generatingDemo || auditing || generating || generatingVideo}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-cyan/40 bg-brand-cyan/10 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-brand-cyan transition hover:bg-brand-cyan/20 disabled:opacity-40"
                  >
                    {generatingDemo ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Globe className="h-3.5 w-3.5" />
                    )}
                    {generatingDemo ? "Gerando..." : demoUrl ? "Regen. Demo" : "Gerar Demo"}
                  </button>
                  <button
                    type="button"
                    onClick={handleGerarVideo}
                    disabled={generatingVideo || auditing || generating || generatingDemo}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-pink-400/40 bg-pink-400/10 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-pink-200 transition hover:bg-pink-400/20 disabled:opacity-40"
                  >
                    {generatingVideo ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Film className="h-3.5 w-3.5" />
                    )}
                    {generatingVideo
                      ? "Gerando vídeo..."
                      : videoUrl
                        ? "Regen. Vídeo"
                        : "Gerar Vídeo"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Abordagem WhatsApp gerada por Claude */}
          {mode !== "create" && initial && (abordagem || generating || abordagemError) && (
            <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.04] p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-md border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
                    <MessageCircle className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">
                      Abordagem WhatsApp
                    </div>
                    {abordagemScore != null && !generating && (
                      <div className="mt-0.5 text-[10px] text-zinc-500">
                        Audit score:{" "}
                        <span
                          className={
                            abordagemScore >= 70
                              ? "font-bold text-emerald-300"
                              : abordagemScore >= 40
                                ? "font-bold text-amber-300"
                                : "font-bold text-red-300"
                          }
                        >
                          {abordagemScore}/100
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {abordagem && !generating && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-200 transition hover:bg-white/[0.08]"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-300" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copiar
                      </>
                    )}
                  </button>
                )}
              </div>
              {generating ? (
                <div className="space-y-2 py-1">
                  <div className="h-3 w-full animate-pulse rounded bg-white/[0.06]" />
                  <div className="h-3 w-11/12 animate-pulse rounded bg-white/[0.06]" />
                  <div className="h-3 w-10/12 animate-pulse rounded bg-white/[0.06]" />
                </div>
              ) : abordagemError ? (
                <p className="rounded-md border border-red-500/20 bg-red-500/[0.06] p-2 text-xs text-red-200">
                  {abordagemError}
                </p>
              ) : (
                <p className="whitespace-pre-wrap rounded-md border border-white/[0.06] bg-zinc-950/40 p-3 text-sm leading-relaxed text-zinc-100">
                  {abordagem}
                </p>
              )}
            </div>
          )}

          {/* Demo Site Panel */}
          {mode !== "create" && initial && (demoUrl || generatingDemo || demoError) && (
            <div className="mt-4 rounded-xl border border-brand-cyan/20 bg-brand-cyan/[0.04] p-4">
              <div className="flex items-center gap-2">
                <div className="grid h-7 w-7 place-items-center rounded-md border border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan">
                  <Globe className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-cyan">
                    Demo Site
                  </div>
                  <div className="mt-0.5 text-[10px] text-zinc-500">
                    Landing page gerada por IA + deploy automático
                  </div>
                </div>
              </div>
              <div className="mt-3">
                {generatingDemo ? (
                  <div className="space-y-2 py-1">
                    <div className="h-3 w-full animate-pulse rounded bg-white/[0.06]" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-white/[0.06]" />
                  </div>
                ) : demoError ? (
                  <p className="rounded-md border border-red-500/20 bg-red-500/[0.06] p-2 text-xs text-red-200">
                    {demoError}
                  </p>
                ) : demoUrl ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 truncate rounded-md border border-brand-cyan/20 bg-zinc-950/40 px-3 py-2 text-xs text-brand-cyan hover:underline"
                    >
                      {demoUrl}
                    </a>
                    <a
                      href={demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-brand-cyan/40 bg-brand-cyan/15 px-3 py-2 text-xs font-bold uppercase tracking-wider text-brand-cyan transition hover:bg-brand-cyan/25"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Ver Demo
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Video Panel */}
          {mode !== "create" && initial && (videoUrl || generatingVideo || videoError) && (
            <div className="mt-4 rounded-xl border border-pink-400/20 bg-pink-400/[0.04] p-4">
              <div className="flex items-center gap-2">
                <div className="grid h-7 w-7 place-items-center rounded-md border border-pink-400/30 bg-pink-400/10 text-pink-300">
                  <Film className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-pink-200">
                    Vídeo Animado
                  </div>
                  <div className="mt-0.5 text-[10px] text-zinc-500">
                    Página animada com antes/depois + deploy automático
                  </div>
                </div>
              </div>
              <div className="mt-3">
                {generatingVideo ? (
                  <div className="space-y-2 py-1">
                    <div className="h-3 w-full animate-pulse rounded bg-white/[0.06]" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-white/[0.06]" />
                  </div>
                ) : videoError ? (
                  <p className="rounded-md border border-red-500/20 bg-red-500/[0.06] p-2 text-xs text-red-200">
                    {videoError}
                  </p>
                ) : videoUrl ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 truncate rounded-md border border-pink-400/20 bg-zinc-950/40 px-3 py-2 text-xs text-pink-200 hover:underline"
                    >
                      {videoUrl}
                    </a>
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-pink-400/40 bg-pink-400/15 px-3 py-2 text-xs font-bold uppercase tracking-wider text-pink-200 transition hover:bg-pink-400/25"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Ver Vídeo
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Audit Panel */}
          {mode !== "create" && initial && (
            <AuditPanel audit={auditResult} loading={auditing} error={auditError ?? undefined} />
          )}

          {!isView && (
            <div className="mt-8 flex items-center justify-between gap-3">
              {mode === "edit" && onDelete && initial ? (
                <button
                  type="button"
                  onClick={() => onDelete(initial.id)}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold uppercase tracking-wider text-red-300 transition hover:bg-red-500/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Excluir
                </button>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-white/[0.04]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg border border-brand-cyan/40 bg-brand-cyan/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-cyan hover:bg-brand-cyan/25"
                >
                  {mode === "create" ? "Criar" : "Salvar"}
                </button>
              </div>
            </div>
          )}

          {isView && (
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-white/[0.04]"
              >
                Fechar
              </button>
            </div>
          )}
        </form>
      </aside>
    </div>
  );
}
