"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  Loader2,
  LockKeyhole,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { DIAGNOSTICO_EXPRESS_PRICE_LABEL } from "@/app/_lib/diagnostico-express/config";
import { EXPRESS_CHECK_COUNT, EXPRESS_FRONTS, MARKETING_BUDGET_LABELS, TEAM_SIZE_LABELS, type FrontId, type FrontInput } from "@/app/_lib/diagnostico-express/fronts";
import type { ExpressReport } from "@/app/_lib/diagnostico-express/report";

type DiagnosisResponse = {
  id: string;
  status: "submitted";
  reviewStatus: "pending" | "approved" | "rejected";
  accessToken?: string;
  report?: ExpressReport;
};

type Buyer = {
  email: string;
  phone: string;
};

type Stage = "offer" | "checkout" | "verifying" | "intake" | "submitting" | "result";

const inputClass =
  "mt-2 w-full border border-white/15 bg-[#161616] px-4 py-3 text-sm text-white outline-none focus:border-[#FF5722]";

const WHATSAPP_CTA_URL =
  "https://wa.me/5571994054891?text=Recebi%20meu%20Diagn%C3%B3stico%20Express%20e%20quero%20agendar%20uma%20conversa";

const deliverables = [
  "Nota fundamentada para cada uma das cinco frentes",
  "Principais gargalos e três prioridades",
  "Recomendações práticas e próximo passo",
  "Entrega após revisão humana das respostas",
];

export default function DiagnosticoExpress() {
  const searchParams = useSearchParams();

  // Mercado Pago returns: ?payment_id=XXX&status=approved&preference_id=YYY
  const mpPaymentId = searchParams.get("payment_id") ?? "";
  const mpStatus = searchParams.get("status") ?? "";
  const mpExternalReference = searchParams.get("external_reference") ?? "";

  // Token-based result access (after submit)
  const resultToken = searchParams.get("token") ?? "";

  // Legacy Stripe (kept for backwards compat error message)
  const sessionId = searchParams.get("session_id") ?? "";

  const checkoutCancelled =
    searchParams.get("checkout") === "cancelado" ||
    searchParams.get("mp_status") === "failure";

  const hasPayment = Boolean(mpPaymentId) || Boolean(sessionId);
  const [stage, setStage] = useState<Stage>(
    resultToken ? "verifying" : hasPayment ? "verifying" : "offer",
  );
  const [buyer, setBuyer] = useState<Buyer>({ email: "", phone: "" });
  const [result, setResult] = useState<DiagnosisResponse | null>(null);
  const [accessToken, setAccessToken] = useState(resultToken);
  const [error, setError] = useState("");

  // Verify payment on return from Mercado Pago, or load result by token
  useEffect(() => {
    if (!mpPaymentId && !resultToken && !sessionId) return;
    let active = true;

    async function verify() {
      try {
        // Direct result access via token
        if (resultToken) {
          const res = await fetch(
            `/api/diagnostico/result?token=${encodeURIComponent(resultToken)}`,
            { cache: "no-store" },
          );
          const data: unknown = await res.json();
          if (!res.ok) {
            throw new Error(isErrorResponse(data) ? data.error : "Não foi possível consultar seu diagnóstico.");
          }
          if (!active) return;
          if (isResultStatus(data) && data.submitted) {
            setResult({ id: data.id, status: "submitted", reviewStatus: data.reviewStatus, report: isExpressReport(data.report) ? data.report : undefined });
            setStage("result");
          } else {
            setStage("offer");
          }
          return;
        }

        // Legacy Stripe session_id → error
        if (sessionId && !mpPaymentId) {
          throw new Error("Link de pagamento Stripe expirado. Faça um novo diagnóstico.");
        }

        // Mercado Pago payment verification
        const verifyUrl = `/api/checkout/diagnostico/verify?payment_id=${encodeURIComponent(mpPaymentId)}&status=${encodeURIComponent(mpStatus)}&external_reference=${encodeURIComponent(mpExternalReference)}`;
        const response = await fetch(verifyUrl, { cache: "no-store" });
        const data: unknown = await response.json();
        if (!response.ok || !isVerifyResponse(data) || !data.paid) {
          throw new Error(isErrorResponse(data) ? data.error : "Pagamento ainda não foi confirmado.");
        }
        if (!active) return;
        setBuyer({ email: data.email ?? "", phone: data.phone ?? "" });
        setStage("intake");
      } catch (verifyError) {
        if (!active) return;
        setError(verifyError instanceof Error ? verifyError.message : "Não foi possível validar o pagamento.");
        setStage("offer");
      }
    }

    void verify();
    return () => { active = false; };
  }, [mpPaymentId, mpStatus, mpExternalReference, resultToken, sessionId]);

  // Poll for approval status when waiting
  useEffect(() => {
    if (stage !== "result" || !result || result.reviewStatus !== "pending" || !accessToken) return;
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch(`/api/diagnostico/result?token=${encodeURIComponent(accessToken)}`, { cache: "no-store" });
        const data: unknown = await response.json();
        if (active && response.ok && isResultStatus(data) && data.submitted) {
          setResult({ id: data.id, status: "submitted", reviewStatus: data.reviewStatus, report: isExpressReport(data.report) ? data.report : undefined });
        }
      } catch { /* next poll will retry */ }
    };
    const timer = window.setInterval(() => { void refresh(); }, 30000);
    return () => { active = false; window.clearInterval(timer); };
  }, [stage, result, accessToken]);

  async function startCheckout() {
    setStage("checkout");
    setError("");
    try {
      const response = await fetch("/api/checkout/diagnostico", { method: "POST" });
      const data: unknown = await response.json();
      if (!response.ok || !isCheckoutResponse(data)) {
        throw new Error(
          isErrorResponse(data) ? data.error : "Checkout indisponível.",
        );
      }
      window.location.assign(data.url);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Não foi possível iniciar o pagamento.",
      );
      setStage("offer");
    }
  }

  if (stage === "verifying") {
    return <StatusScreen text="Confirmando seu pagamento..." />;
  }

  if (stage === "intake" || stage === "submitting") {
    return (
      <Intake
        buyer={buyer}
        paymentId={mpPaymentId}
        externalReference={mpExternalReference}
        loading={stage === "submitting"}
        error={error}
        onSubmitStart={() => {
          setError("");
          setStage("submitting");
        }}
        onSuccess={(response) => {
          setResult(response);
          if (response.accessToken) setAccessToken(response.accessToken);
          setStage("result");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onError={(message) => {
          setError(message);
          setStage("intake");
        }}
      />
    );
  }

  if (stage === "result" && result) {
    return <DiagnosisResult result={result} accessToken={accessToken} />;
  }

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-[#F8F9FA]">
      <ProductHeader />
      <section className="border-b border-white/10">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-14 lg:grid-cols-[1.1fr_.9fr] lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#FF5722]">
              Diagnóstico Express O6
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black uppercase leading-[1.02] md:text-6xl">
              Como sua empresa é encontrada, percebida e escolhida?
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-300">
              Um diagnóstico rápido das 5 frentes que determinam como sua empresa é encontrada, percebida e escolhida.
            </p>

            <div className="mt-8 grid gap-2 border-y border-white/15 py-5 sm:grid-cols-2">
              {EXPRESS_FRONTS.map((front, index) => (
                <div key={front.id} className="flex gap-3 py-2 text-sm text-zinc-200">
                  <span className="font-mono text-[#FF5722]">0{index + 1}</span>{front.label}
                </div>
              ))}
            </div>

            <div className="mt-9 grid gap-3 sm:grid-cols-2">
              {deliverables.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-zinc-300">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#FF5722]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-end gap-5 border-t border-white/15 pt-8">
              <div>
                <p className="text-xs uppercase tracking-widest text-zinc-500">Investimento</p>
                <p className="mt-2 text-4xl font-black">{DIAGNOSTICO_EXPRESS_PRICE_LABEL}</p>
                <p className="mt-1 text-xs text-zinc-500">Pix ou cartão · Pagamento único</p>
              </div>
              <button
                type="button"
                onClick={startCheckout}
                disabled={stage === "checkout"}
                className="group inline-flex min-h-14 items-center justify-center gap-3 bg-[#FF5722] px-7 text-sm font-black uppercase tracking-widest text-white disabled:opacity-60"
              >
                {stage === "checkout" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <CreditCard className="h-5 w-5" />
                )}
                {stage === "checkout" ? "Abrindo pagamento..." : "Fazer diagnóstico"}
                {stage !== "checkout" && <ArrowRight className="h-5 w-5" />}
              </button>
            </div>

            {(error || checkoutCancelled) && (
              <p role="alert" className="mt-5 border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
                {error || "Pagamento cancelado. Nenhuma cobrança foi concluída."}
              </p>
            )}
          </motion.div>

          <aside className="border border-white/15 bg-[#121212] p-6 md:p-8">
            <div className="flex items-center gap-3 border-b border-white/10 pb-6">
              <ShieldCheck className="h-7 w-7 text-[#FF5722]" />
              <div>
                <p className="text-sm font-black uppercase">Processo com controle humano</p>
                <p className="mt-1 text-xs text-zinc-500">Automação sem proposta automática</p>
              </div>
            </div>
            <ol className="mt-7 space-y-6">
              {[
                ["01", "Pagamento verificado", "O formulário só é liberado depois da confirmação."],
                ["02", "Análise estruturada", "O sistema prioriza sinais declarados sem fabricar impacto."],
                ["03", "Aprovação O6", "A oferta seguinte só entra no CRM após revisão humana."],
              ].map(([number, title, description]) => (
                <li key={number} className="grid grid-cols-[auto_1fr] gap-4">
                  <span className="font-mono text-xs font-bold text-[#FF5722]">{number}</span>
                  <div>
                    <h2 className="text-sm font-black uppercase">{title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">{description}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-8 flex items-start gap-3 border-t border-white/10 pt-6 text-xs leading-relaxed text-zinc-500">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />
              Não envie nomes, prontuários ou informações clínicas de pacientes.
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            ["Não é consultoria genérica", "As perguntas conectam volume, resposta, conversão e rotina de retomada."],
            ["Não é promessa de resultado", "O relatório mostra sinais e caminhos de investigação, não garante receita."],
            ["Não empurra pacote", "Preço e escopo da implementação são definidos somente depois da revisão."],
          ].map(([title, text]) => (
            <article key={title} className="border-t border-white/20 pt-5">
              <h2 className="text-lg font-black uppercase">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function ProductHeader() {
  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-3 font-black uppercase tracking-tight">
          <span className="grid h-9 w-9 place-items-center bg-[#FF5722] text-sm text-white">O6</span>
          O6 Growth
        </Link>
        <a href="/portfolio/index.html#projetos" className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white">
          Ver portfólio
        </a>
      </div>
    </header>
  );
}

function StatusScreen({ text }: { text: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#0D0D0D] px-6 text-white">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#FF5722]" />
        <p className="mt-5 text-sm font-black uppercase tracking-widest">{text}</p>
      </div>
    </main>
  );
}

function Intake({
  buyer,
  paymentId,
  externalReference,
  loading,
  error,
  onSubmitStart,
  onSuccess,
  onError,
}: {
  buyer: Buyer;
  paymentId: string;
  externalReference: string;
  loading: boolean;
  error: string;
  onSubmitStart: () => void;
  onSuccess: (result: DiagnosisResponse) => void;
  onError: (message: string) => void;
}) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmitStart();
    const form = new FormData(event.currentTarget);
    const fronts = Object.fromEntries(EXPRESS_FRONTS.map((front) => [front.id, {
      context: String(form.get(`${front.id}_context`) ?? ""),
      checks: Object.fromEntries(front.checks.map((check) => [check.id, String(form.get(`${front.id}_${check.id}`) ?? "nao_sei")])),
    }])) as Record<FrontId, FrontInput>;
    const optionalNumber = (name: string) => {
      const value = String(form.get(name) ?? "").trim();
      return value ? Number(value) : undefined;
    };
    const payload = {
      paymentId,
      externalReference,
      contact: {
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        phone: String(form.get("phone") ?? ""),
      },
      consent: form.get("consent") === "on",
      business: {
        name: String(form.get("business") ?? ""),
        segment: String(form.get("segment") ?? ""),
        siteUrl: String(form.get("siteUrl") ?? ""),
        googleUrl: String(form.get("googleUrl") ?? ""),
        instagramUrl: String(form.get("instagramUrl") ?? ""),
        averageTicket: optionalNumber("ticket"),
        monthlyContacts: optionalNumber("monthlyContacts"),
        monthlyConversions: optionalNumber("monthlyConversions"),
        teamSize: String(form.get("teamSize") ?? "") || undefined,
        marketingBudget: String(form.get("marketingBudget") ?? "") || undefined,
      },
      fronts,
    };

    try {
      const response = await fetch("/api/diagnostico/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: unknown = await response.json();
      if (!response.ok || !isDiagnosisResponse(data)) {
        throw new Error(
          isErrorResponse(data)
            ? data.error
            : "Não foi possível registrar o diagnóstico.",
        );
      }
      onSuccess({
        ...data,
        accessToken: isAccessTokenResponse(data) ? data.accessToken : undefined,
      });
    } catch (submitError) {
      onError(
        submitError instanceof Error ? submitError.message : "Erro inesperado.",
      );
    }
  }

  return (
    <main id="intake" className="min-h-screen bg-[#0D0D0D] text-[#F8F9FA]">
      <ProductHeader />
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[.72fr_1.28fr] lg:py-16">
        <div>
          <div className="inline-flex items-center gap-2 border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-emerald-300">
            <CheckCircle2 className="h-4 w-4" /> Pagamento confirmado
          </div>
          <h1 className="mt-6 text-4xl font-black uppercase leading-tight">Vamos entender as cinco frentes do seu negócio.</h1>
          <p className="mt-5 leading-relaxed text-zinc-400">
            Use dados agregados e estimativas honestas. Quanto mais claro o contexto,
            melhor a priorização.
          </p>
          <div className="mt-8 border-l-2 border-[#FF5722] pl-5 text-sm leading-relaxed text-zinc-400">
            Responda com honestidade. As notas iniciais dependem do que você declarar e serão revisadas antes da entrega.
          </div>
        </div>

        <form onSubmit={submit} className="border border-white/15 bg-[#111111] p-6 shadow-[8px_8px_0_0_#FF5722] md:p-8">
          <div className="mb-8 flex items-start gap-4">
            <ClipboardCheck className="mt-1 h-7 w-7 text-[#FF5722]" />
            <div>
              <h2 className="text-xl font-black uppercase">Mapeamento inicial</h2>
              <p className="mt-1 text-sm text-zinc-400">Cinco frentes e {EXPRESS_CHECK_COUNT} perguntas rápidas, com espaço para contar o contexto de cada uma. Leva cerca de 12 minutos.</p>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Seu nome" name="name" required />
            <Field label="E-mail do pagamento" name="email" type="email" required defaultValue={buyer.email} readOnly={Boolean(buyer.email)} />
            <Field label="WhatsApp" name="phone" required defaultValue={buyer.phone} />
            <Field label="Nome do negócio" name="business" required />
            <label className="text-sm font-bold text-zinc-200">
              Segmento
              <select name="segment" className={inputClass} required defaultValue="">
                <option value="" disabled>Selecione</option>
                <option value="Clínica odontológica">Clínica odontológica</option>
                <option value="Clínica de estética ou dermatologia">Estética ou dermatologia</option>
                <option value="Clínica médica particular">Clínica médica particular</option>
                <option value="Fisioterapia ou reabilitação">Fisioterapia ou reabilitação</option>
                <option value="Escritório de advocacia">Escritório de advocacia</option>
                <option value="Outro serviço profissional">Outro serviço profissional</option>
              </select>
            </label>
            <label className="text-sm font-bold text-zinc-200">
              Tamanho da equipe
              <select name="teamSize" className={inputClass} required defaultValue="">
                <option value="" disabled>Selecione</option>
                {Object.entries(TEAM_SIZE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="text-sm font-bold text-zinc-200">
              Investimento mensal em marketing
              <select name="marketingBudget" className={inputClass} required defaultValue="">
                <option value="" disabled>Selecione</option>
                {Object.entries(MARKETING_BUDGET_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <Field label="Ticket médio aproximado (opcional)" name="ticket" type="number" placeholder="R$" />
            <Field label="Contatos por mês (opcional)" name="monthlyContacts" type="number" />
            <Field label="Clientes por mês (opcional)" name="monthlyConversions" type="number" />
            <Field label="Site ou landing page (opcional)" name="siteUrl" type="url" placeholder="https://" />
            <Field label="Perfil no Google (opcional)" name="googleUrl" type="url" placeholder="https://" />
            <Field label="Instagram (opcional)" name="instagramUrl" type="url" placeholder="https://" />
          </div>
          {EXPRESS_FRONTS.map((front, index) => (
            <fieldset key={front.id} className="mt-9 border-t border-white/15 pt-7">
              <legend className="pr-4 text-lg font-black uppercase"><span className="mr-3 font-mono text-[#FF5722]">0{index + 1}</span>{front.label}</legend>
              <p className="mt-2 text-sm text-zinc-400">{front.prompt}</p>
              <label className="mt-5 block text-sm font-bold text-zinc-200">
                Conte o que acontece hoje
                <textarea name={`${front.id}_context`} required minLength={8} maxLength={2000} rows={3} className={inputClass} placeholder="Descreva a situação real, sem dados de clientes ou pacientes." />
              </label>
              <div className="mt-5 grid gap-4">
                {front.checks.map((check) => (
                  <label key={check.id} className="text-sm text-zinc-200">
                    {check.label}
                    <select name={`${front.id}_${check.id}`} required defaultValue="" className={inputClass}>
                      <option value="" disabled>Selecione</option>
                      <option value="sim">Sim</option>
                      <option value="parcial">Em parte</option>
                      <option value="nao">Não</option>
                      <option value="nao_sei">Não sei</option>
                    </select>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <label className="mt-6 flex items-start gap-3 text-xs leading-relaxed text-zinc-400">
            <input type="checkbox" name="consent" required className="mt-1 accent-[#FF5722]" />
            Autorizo o uso destes dados para gerar e revisar meu diagnóstico e para a O6 entrar em contato sobre o resultado. Não enviarei dados de pacientes.
          </label>
          {error && <p role="alert" className="mt-5 border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
          <button disabled={loading} className="mt-7 flex w-full items-center justify-center gap-2 bg-[#FF5722] px-5 py-4 text-sm font-black uppercase tracking-widest text-white disabled:opacity-60">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
            {loading ? "Registrando respostas..." : "Enviar para análise"}
          </button>
        </form>
      </section>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  defaultValue,
  readOnly = false,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  readOnly?: boolean;
}) {
  return (
    <label className="text-sm font-bold text-zinc-200">
      {label}
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
        readOnly={readOnly}
        className={`${inputClass} read-only:text-zinc-400`}
      />
    </label>
  );
}

function DiagnosisResult({ result, accessToken }: { result: DiagnosisResponse; accessToken: string }) {
  if (!result.report) return (
    <main className="min-h-screen bg-[#0D0D0D] px-6 py-14 text-[#F8F9FA]">
      <div className="mx-auto max-w-3xl">
        <ShieldCheck className="h-8 w-8 text-[#FF5722]" />
        <h1 className="mt-6 text-4xl font-black uppercase">{result.reviewStatus === "rejected" ? "Sua análise precisa de revisão adicional." : result.reviewStatus === "approved" ? "Seu relatório anterior precisa de atualização." : "Análise recebida para revisão."}</h1>
        <p className="mt-5 text-lg leading-relaxed text-zinc-300">{result.reviewStatus === "rejected" ? "A O6 vai entrar em contato para esclarecer os dados antes da entrega." : result.reviewStatus === "approved" ? "Este diagnóstico foi criado antes da avaliação das cinco frentes. Entre em contato com a O6 para receber o relatório no formato original." : "Seus dados foram registrados. O relatório ficará disponível nesta página após a aprovação da O6."}</p>
        {accessToken && <p className="mt-4 text-sm text-zinc-500">Guarde este link para acessar seu resultado: <code className="break-all text-xs text-zinc-400">/produto/diagnostico?token={accessToken}</code></p>}
        <a href="/links" className="mt-8 inline-flex bg-[#FF5722] px-5 py-3 text-sm font-bold text-white">Voltar aos links</a>
      </div>
    </main>
  );
  return (
    <main className="min-h-screen bg-[#0D0D0D] px-6 py-14 text-[#F8F9FA]">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center gap-3 text-[#FF5722]">
          <ShieldCheck className="h-7 w-7" />
          <span className="text-xs font-black uppercase tracking-[0.2em]">Diagnóstico revisado pela O6</span>
        </div>
        <h1 className="mt-5 text-4xl font-black uppercase md:text-5xl">Seu Diagnóstico Express está pronto.</h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-zinc-300">{result.report.summary}</p>
        <div className="mt-10 grid gap-5">
          {result.report.fronts.map((front) => (
            <article key={front.id} className="border border-white/15 bg-[#111111] p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-black uppercase">{front.label}</h2>
                <span className="shrink-0 font-mono text-xl font-bold text-[#FF5722]">{front.score === null ? "Sem nota" : `${front.score}/5`}</span>
              </div>
              <p className="mt-3 text-xs text-zinc-500">{front.basis}</p>
              {front.gaps.length > 0 && <p className="mt-4 text-sm text-zinc-300"><strong className="text-white">Pontos de atenção:</strong> {front.gaps.join("; ")}</p>}
              <p className="mt-4 border-l-2 border-[#FF5722] pl-4 text-sm text-zinc-400"><strong className="text-white">Ação prática:</strong> {front.recommendation}</p>
            </article>
          ))}
        </div>
        <section className="mt-10 border-t border-white/15 pt-8">
          <h2 className="text-xl font-black uppercase">Três prioridades</h2>
          <ol className="mt-5 grid gap-4">
            {result.report.priorities.map((priority, index) => (
              <li key={priority.front} className="flex gap-4 text-sm leading-relaxed text-zinc-300">
                <span className="font-mono font-bold text-[#FF5722]">0{index + 1}</span>
                <span><strong className="text-white">{priority.front}:</strong> {priority.action} <span className="text-zinc-500">{priority.reason}</span></span>
              </li>
            ))}
          </ol>
          {result.report.suggestions && result.report.suggestions.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Como a O6 pode ajudar</h3>
              <ul className="mt-4 grid gap-3">
                {result.report.suggestions.map((item) => (
                  <li key={item.front} className="border-l-2 border-[#FF5722] pl-4 text-sm leading-relaxed text-zinc-300">
                    <strong className="text-white">{item.service}</strong> · {item.front}. {item.why}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="mt-7 text-sm text-zinc-300"><strong className="text-white">Próximo passo:</strong> {result.report.nextStep}</p>
          <p className="mt-3 text-xs leading-relaxed text-zinc-500">{result.report.method}</p>
        </section>
        {/* WhatsApp CTA — Agendar conversa */}
        <div className="mt-10 border border-[#FF5722]/30 bg-[#FF5722]/[0.06] p-6 md:p-8">
          <h2 className="text-xl font-black uppercase">Próximo passo</h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">
            Quer entender o que cada prioridade significa para o seu negócio e como resolver? Agende uma conversa com a O6.
          </p>
          <a
            href={WHATSAPP_CTA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 bg-[#FF5722] px-6 py-4 text-sm font-black uppercase tracking-widest text-white"
          >
            <MessageCircle className="h-5 w-5" />
            Agendar conversa pelo WhatsApp
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>

        <div className="mt-10 border-t border-white/15 pt-8">
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
            A indicação de serviço depende da revisão do contexto. Nenhuma proposta ou mensagem comercial é enviada automaticamente.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/portfolio/index.html#projetos" className="inline-flex items-center gap-2 bg-[#FF5722] px-5 py-3 text-xs font-black uppercase tracking-widest text-white">Ver portfólio <ArrowRight className="h-4 w-4" /></a>
            <a href="/links" className="inline-flex items-center gap-2 border border-white/20 px-5 py-3 text-xs font-black uppercase tracking-widest text-white"><RotateCcw className="h-4 w-4" /> Voltar aos links</a>
          </div>
        </div>
      </div>
    </main>
  );
}

function isErrorResponse(value: unknown): value is { error: string } {
  return typeof value === "object" && value !== null && "error" in value && typeof value.error === "string";
}

function isCheckoutResponse(value: unknown): value is { url: string; sessionId: string } {
  return typeof value === "object" && value !== null && "url" in value && typeof value.url === "string" && "sessionId" in value && typeof value.sessionId === "string";
}

function isVerifyResponse(value: unknown): value is { paid: boolean; email: string | null; phone: string | null } {
  return typeof value === "object" && value !== null && "paid" in value && typeof value.paid === "boolean";
}

function isDiagnosisResponse(value: unknown): value is DiagnosisResponse {
  return typeof value === "object" && value !== null && "id" in value && typeof value.id === "string" && "status" in value && value.status === "submitted" && "reviewStatus" in value && (value.reviewStatus === "pending" || value.reviewStatus === "approved" || value.reviewStatus === "rejected");
}

function isResultStatus(value: unknown): value is { submitted: true; id: string; reviewStatus: "pending" | "approved" | "rejected"; report?: unknown } {
  return typeof value === "object" && value !== null && "submitted" in value && value.submitted === true && "id" in value && typeof value.id === "string" && "reviewStatus" in value && (value.reviewStatus === "pending" || value.reviewStatus === "approved" || value.reviewStatus === "rejected");
}

function isAccessTokenResponse(value: unknown): value is { accessToken: string } {
  return typeof value === "object" && value !== null && "accessToken" in value && typeof value.accessToken === "string";
}

function isExpressReport(value: unknown): value is ExpressReport {
  return typeof value === "object" && value !== null && "version" in value && value.version === "five-fronts-v1" && "fronts" in value && Array.isArray(value.fronts) && "priorities" in value && Array.isArray(value.priorities);
}
