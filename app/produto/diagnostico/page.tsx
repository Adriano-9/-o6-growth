"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  ArrowRight,
  X,
  Eye,
  Headphones,
  Settings,
  Cpu,
  TrendingUp,
  MessageCircle,
} from "lucide-react";
import { whatsappUrl } from "@/app/_lib/contato";

const dimensoes = [
  { icon: Eye, title: "Presença", desc: "Como sua clínica aparece para quem busca no Google, Instagram e indicações." },
  { icon: Headphones, title: "Atendimento", desc: "Velocidade e qualidade da resposta ao primeiro contato do paciente." },
  { icon: Settings, title: "Processo", desc: "O caminho que o paciente percorre do interesse ao agendamento confirmado." },
  { icon: Cpu, title: "Automação", desc: "Quanto do follow-up e qualificação roda sem depender de memória humana." },
  { icon: TrendingUp, title: "Conversão", desc: "Percentual de contatos que viram consultas pagas — e onde os outros se perdem." },
];

const para = ["Dono de clínica em Salvador", "2-3 profissionais na equipe", "Faturamento R$ 30k+/mês", "Operando há 3+ anos"];
const naoPara = ["Clínica solo abaixo de R$ 20k/mês", "Clínica grande com gestor profissional dedicado", "Quem busca \"milagre em 7 dias\""];

const faq = [
  { q: "Já contratei agência e não funcionou.", a: "Por isso começamos com diagnóstico — não vendemos sistema sem antes mapear o problema real da sua clínica." },
  { q: "Como funciona o diagnóstico?", a: "Você fala com a Sofia no WhatsApp, agenda um horário e fazemos a análise do seu funil comercial juntos." },
  { q: "E se eu não gostar do resultado?", a: "O diagnóstico é um dado — se não gostar do que encontramos, você não é obrigado a contratar mais nada." },
  { q: "Preciso enviar acesso a alguma plataforma?", a: "Só os dados que você quiser compartilhar: site, Google Meu Negócio, anúncios ativos e WhatsApp Business. Sem invasão de privacidade." },
];

const WA_LINK = whatsappUrl("DIAGNÓSTICO");

function WhatsAppCTA({ className = "" }: { className?: string }) {
  return (
    <a
      href={WA_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 bg-[#25D366] px-6 py-4 text-sm font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_#fff] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#fff] ${className}`}
    >
      <MessageCircle className="h-4 w-4" />
      Quero meu diagnóstico gratuito
      <ArrowRight className="h-4 w-4" />
    </a>
  );
}

export default function DiagnosticoPage() {
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
            Diagnóstico gratuito
          </div>
          <h1 className="text-4xl font-black uppercase leading-[1.05] tracking-tight md:text-6xl">
            Diagnóstico gratuito O6
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-300 md:text-xl">
            Descubra onde sua clínica está perdendo paciente antes de investir em qualquer ferramenta.
          </p>

          <div className="mt-10 border-t border-white/10 pt-8">
            <WhatsAppCTA />
            <p className="mt-4 text-xs text-zinc-500">
              A Sofia, nossa atendente, responde e agenda. Se precisar, uma pessoa assume a conversa.
            </p>
          </div>
        </motion.div>
      </section>

      {/* 5 Dimensões */}
      <section className="border-t border-white/10 bg-white/[0.02] py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-orange">As 5 dimensões que analisamos</div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {dimensoes.map((it) => (
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
            Descubra onde sua clínica está vazando pacientes.
          </h2>
          <p className="mt-3 text-zinc-400">Gratuito. Sem compromisso. Sem surpresas.</p>
          <div className="mt-8 flex justify-center">
            <WhatsAppCTA />
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            A Sofia, nossa atendente, responde e agenda. Se precisar, uma pessoa assume a conversa.
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-[11px] uppercase tracking-widest text-zinc-600">
        O6 Growth · Sistema Comercial · 2026
      </footer>
    </main>
  );
}
