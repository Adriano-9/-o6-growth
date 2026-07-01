"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  ArrowRight,
  Clock,
  FileText,
  Target,
  Video,
  ShieldCheck,
  X,
} from "lucide-react";
import { useState } from "react";

const includes = [
  { icon: Target, title: "Análise completa do funil de captação", desc: "Mapeamos como o paciente chega, onde clica, e em que ponto desiste." },
  { icon: Video, title: "Vídeo-diagnóstico personalizado", desc: "Adriano grava um vídeo mostrando o que encontramos na sua clínica especificamente." },
  { icon: FileText, title: "Plano de ação com prioridades", desc: "Lista ordenada por impacto — o que mexer primeiro pra resultado em 30 dias." },
  { icon: ShieldCheck, title: "Os 3 principais vazamentos mapeados com dados", desc: "Não é opinião — são números do seu próprio site, anúncios e atendimento." },
];

const stats = [
  { value: "60%", label: "das clínicas fecham em <5 anos", source: "SEBRAE 2022" },
  { value: "21×", label: "mais conversão quando responde em <5min", source: "Lead Response Survey" },
  { value: "65-75%", label: "dos leads que entram em contato nunca agendam", source: "Setor médico BR" },
];

const para = ["Dono de clínica em Salvador", "2-3 profissionais na equipe", "Faturamento R$ 30k+/mês", "Operando há 3+ anos"];
const naoPara = ["Clínica solo abaixo de R$ 20k/mês", "Clínica grande com gestor profissional dedicado", "Quem busca \"milagre em 7 dias\""];

const faq = [
  { q: "Já contratei agência e não funcionou.", a: "Por isso começamos com diagnóstico — não vendemos sistema sem antes mapear o problema real da sua clínica. Você paga R$ 800 e recebe o relatório. Se decidir não contratar mais nada depois, o diagnóstico é seu." },
  { q: "Como funciona o diagnóstico?", a: "Você paga, entra em contato pelo WhatsApp, em 5 dias úteis entregamos o relatório completo com vídeo + plano de ação." },
  { q: "E se eu não gostar do resultado?", a: "O diagnóstico é um dado — se não gostar do que encontramos, você não é obrigado a contratar mais nada. O relatório fica com você." },
  { q: "Preciso enviar acesso a alguma plataforma?", a: "Só os dados que você quiser compartilhar: site, Google Meu Negócio, anúncios ativos e WhatsApp Business. Sem invasão de privacidade." },
  { q: "Quanto tempo dura?", a: "5 dias úteis entre o pagamento e a entrega do vídeo + relatório." },
];

export default function DiagnosticoPage() {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/diagnostico", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
      else alert(data.error || "Não foi possível abrir o checkout. Tente em alguns minutos.");
    } catch {
      alert("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0d0d0d] text-zinc-100">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <a href="/" className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center bg-brand-orange">
              <span className="font-black text-sm text-white">O6</span>
            </div>
            <span className="font-black text-lg uppercase tracking-tight text-white">O6 Growth</span>
          </a>
          <nav className="hidden gap-6 text-[11px] font-bold uppercase tracking-widest text-zinc-400 md:flex">
            <a href="/produto/diagnostico" className="text-white">Diagnóstico</a>
            <a href="/produto/sprint" className="hover:text-white">Sprint</a>
            <a href="/produto/retainer" className="hover:text-white">Retainer</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-20 md:py-28">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-5 inline-flex items-center gap-2 border border-brand-orange/40 bg-brand-orange/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-orange">
            Produto 1 · Fundo de funil
          </div>
          <h1 className="text-4xl font-black uppercase leading-[1.05] tracking-tight md:text-6xl">
            Diagnóstico O6
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-300 md:text-xl">
            Saiba exatamente onde sua clínica está perdendo pacientes e dinheiro — em 5 dias.
          </p>

          <div className="mt-10 flex flex-col items-start gap-3 border-t border-white/10 pt-8 md:flex-row md:items-center md:gap-6">
            <div>
              <div className="text-5xl font-black tabular-nums text-white md:text-6xl">R$ 800</div>
              <div className="mt-1 text-xs uppercase tracking-widest text-zinc-500">Pagamento único · 5 dias úteis</div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-brand-orange px-6 py-4 text-sm font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_#fff] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#fff] disabled:opacity-50 md:ml-auto"
            >
              {loading ? "Abrindo checkout…" : "Quero meu diagnóstico — R$ 800"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Inclui */}
      <section className="border-t border-white/10 bg-white/[0.02] py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-orange">O que está incluído</div>
          <div className="grid gap-5 md:grid-cols-2">
            {includes.map((it) => (
              <motion.div
                key={it.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="border border-white/10 bg-white/[0.02] p-6"
              >
                <it.icon className="mb-4 h-6 w-6 text-brand-orange" strokeWidth={1.5} />
                <h3 className="text-lg font-black text-white">{it.title}</h3>
                <p className="mt-2 text-sm text-zinc-400">{it.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 border border-brand-orange/30 bg-brand-orange/[0.06] p-6">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-orange">Promessa</div>
            <p className="mt-2 text-xl font-bold text-white md:text-2xl">
              Você sabe exatamente onde está vazando paciente e dinheiro.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-10 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-orange">Por que isso importa</div>
          <div className="grid gap-6 md:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="border-l-2 border-brand-orange pl-5">
                <div className="text-4xl font-black tabular-nums text-white">{s.value}</div>
                <div className="mt-2 text-sm text-zinc-300">{s.label}</div>
                <div className="mt-1 text-[10px] uppercase tracking-widest text-zinc-500">{s.source}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Para quem é / não é */}
      <section className="border-t border-white/10 bg-white/[0.02] py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <div className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Para quem é</div>
              <ul className="space-y-3">
                {para.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-zinc-200">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" strokeWidth={1.5} />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">Para quem NÃO é</div>
              <ul className="space-y-3">
                {naoPara.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-zinc-400">
                    <X className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" strokeWidth={1.5} />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-10 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-orange">FAQ</div>
          <div className="space-y-6">
            {faq.map((it) => (
              <div key={it.q} className="border-b border-white/10 pb-6">
                <h3 className="text-base font-bold text-white">{it.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{it.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-white/10 bg-brand-orange/[0.05] py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-black uppercase leading-tight tracking-tight text-white md:text-4xl">
            Em 5 dias você sabe onde está perdendo dinheiro.
          </h2>
          <p className="mt-3 text-zinc-400">Pagamento único de R$ 800. Sem mensalidade. Sem contrato.</p>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="mt-8 inline-flex items-center gap-2 bg-brand-orange px-7 py-4 text-sm font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_#fff] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#fff] disabled:opacity-50"
          >
            {loading ? "Abrindo checkout…" : "Quero meu diagnóstico"}
            <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-6 flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest text-zinc-500">
            <Clock className="h-3.5 w-3.5" /> Resposta em 24h via WhatsApp após pagamento
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-[11px] uppercase tracking-widest text-zinc-600">
        O6 Growth · Sistema Comercial · 2026
      </footer>
    </main>
  );
}
