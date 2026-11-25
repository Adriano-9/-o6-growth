"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { whatsappUrl } from "@/app/_lib/contato";

const display = { fontFamily: "var(--font-o6-display)" };
const serif = { fontFamily: "var(--font-o6-serif)" };
const mono = { fontFamily: "var(--font-o6-mono)" };

const SEGMENTOS = ["Odontologia", "Estética", "Clínica médica", "Fisioterapia", "Psicologia", "Nutrição", "Advocacia", "Outro serviço"];
const CANAIS = ["WhatsApp", "Instagram", "Telefone", "Site", "Google"];
const TEMPOS = ["Em até 5 minutos", "Em até 1 hora", "No mesmo dia", "No dia seguinte ou mais", "Não sei dizer"];
const RETOMADAS = ["Sempre voltamos a falar", "Às vezes", "Quase nunca", "Não sei dizer"];

const field = "mt-2 w-full rounded-[2px] border border-[#1d2022]/20 bg-white px-3.5 py-3 text-[15px] outline-none transition-colors focus:border-[#f2542d]";
const label = "block text-sm font-semibold";

export default function FormularioExpress() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");
  const [canais, setCanais] = useState<string[]>(["WhatsApp"]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "");
    setStatus("saving");
    setError("");
    try {
      const res = await fetch("/api/diagnostico/express/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: get("nome"), email: get("email"), whatsapp: get("whatsapp"), negocio: get("negocio"),
          segmento: get("segmento"), cidade: get("cidade"), instagram: get("instagram"), site: get("site"),
          canais, tempoResposta: get("tempoResposta"), retomada: get("retomada"),
          maiorDificuldade: get("maiorDificuldade"), operacaoMp: get("operacaoMp"),
          consentimento: f.get("consentimento") === "on",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Não conseguimos enviar agora.");
      router.push("/obrigado?tipo=express");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Não conseguimos enviar agora.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f2ec] text-[#1d2022]" style={{ fontFamily: "var(--font-o6-sans)" }}>
      <header className="border-b border-[#1d2022]/15">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between px-4 py-3.5 md:px-8">
          <Link href="/" className="flex items-center gap-2.5 text-sm font-extrabold tracking-[0.04em]">
            <span className="grid h-7 w-7 place-items-center bg-[#f2542d] text-[11px] text-[#170904]">O6</span>O6 GROWTH
          </Link>
          <span className="text-xs uppercase tracking-[0.12em] text-[#585d5b]" style={mono}>Diagnóstico Express</span>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1080px] gap-10 px-4 py-10 md:px-8 md:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="flex flex-col gap-4 lg:sticky lg:top-8 lg:self-start">
          <span className="text-xs uppercase tracking-[0.12em] text-[#f2542d]" style={mono}>Passo 2 de 3</span>
          <h1 className="text-[clamp(2.4rem,5vw,4rem)] uppercase leading-[0.94]" style={display}>
            Conte sobre o seu <em className="normal-case text-[#f2542d]" style={serif}>negócio</em>.
          </h1>
          <p className="text-[#585d5b]">Leva uns 5 minutos. Com isso analisamos sua presença e seu atendimento e te entregamos até 3 prioridades em ordem, em até 48h úteis.</p>
          <p className="border-l-2 border-[#f2542d] pl-3 text-sm text-[#585d5b]">Não envie dados de pacientes, clientes ou prontuários. Só informações do negócio.</p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-5 border-t-[3px] border-[#f2542d] bg-[#fbfaf6] p-5 md:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={label}>Seu nome<input id="nome" name="nome" required autoComplete="name" className={field} /></label>
            <label className={label}>WhatsApp<input id="whatsapp" name="whatsapp" required type="tel" autoComplete="tel" placeholder="(71) 99999-9999" className={field} /></label>
            <label className={label}>E-mail<input id="email" name="email" required type="email" autoComplete="email" className={field} /></label>
            <label className={label}>Nome do negócio<input id="negocio" name="negocio" required autoComplete="organization" className={field} /></label>
            <label className={label}>Segmento
              <select id="segmento" name="segmento" required defaultValue="" className={field}>
                <option value="" disabled>Escolha</option>
                {SEGMENTOS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label className={label}>Cidade<input id="cidade" name="cidade" defaultValue="Salvador" className={field} /></label>
            <label className={label}>Instagram do negócio<input id="instagram" name="instagram" placeholder="@seunegocio" className={field} /></label>
            <label className={label}>Site (se tiver)<input id="site" name="site" type="url" placeholder="https://" className={field} /></label>
          </div>

          <fieldset className="m-0 border-0 p-0">
            <legend className={label}>Por onde os clientes falam com você?</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {CANAIS.map((c) => {
                const on = canais.includes(c);
                return (
                  <button key={c} type="button" aria-pressed={on} onClick={() => setCanais((p) => (on ? p.filter((x) => x !== c) : [...p, c]))}
                    className={`rounded-[2px] border px-3.5 py-2 text-sm font-semibold transition-colors ${on ? "border-[#1d2022] bg-[#1d2022] text-[#f4f2ec]" : "border-[#1d2022]/20 bg-white"}`}>
                    {c}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className={label}>Quanto tempo leva para responder um contato novo?
              <select id="tempoResposta" name="tempoResposta" required defaultValue="" className={field}>
                <option value="" disabled>Escolha</option>
                {TEMPOS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label className={label}>Alguém volta a falar com quem disse “vou pensar”?
              <select id="retomada" name="retomada" required defaultValue="" className={field}>
                <option value="" disabled>Escolha</option>
                {RETOMADAS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
          </div>

          <label className={label}>Hoje, o que mais te incomoda nas vendas ou no atendimento?
            <textarea id="maiorDificuldade" name="maiorDificuldade" rows={4} className={field} placeholder="Ex.: muita gente pergunta o preço e some." />
          </label>

          <label className={label}>Número da operação no Mercado Pago (opcional)
            <input id="operacaoMp" name="operacaoMp" className={field} placeholder="Ajuda a localizar seu pagamento" />
          </label>

          <label className="flex items-start gap-3 text-sm text-[#585d5b]">
            <input id="consentimento" name="consentimento" type="checkbox" required className="mt-1 h-4 w-4 accent-[#f2542d]" />
            Autorizo a O6 Growth a usar estas informações para fazer o diagnóstico e falar comigo sobre ele.
          </label>

          {status === "error" && (
            <p role="alert" className="text-sm text-[#b42318]">
              {error} <a className="underline" href={whatsappUrl("Tive problema ao enviar o formulário do Diagnóstico Express.")} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
            </p>
          )}

          <button type="submit" disabled={status === "saving"} className="inline-flex items-center justify-between gap-5 rounded-[2px] bg-[#f2542d] px-5 py-4 text-[15px] font-bold text-[#170904] transition-transform hover:-translate-y-0.5 disabled:opacity-60">
            {status === "saving" ? "Enviando..." : "Enviar e começar o diagnóstico"}<span aria-hidden="true">→</span>
          </button>
          <p className="text-xs text-[#585d5b]">Resposta pelo WhatsApp em até 48h úteis.</p>
        </form>
      </div>
    </main>
  );
}
