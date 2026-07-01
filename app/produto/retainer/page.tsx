"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  LineChart,
  Wrench,
  MessageCircle,
  FileBarChart2,
  Clock,
} from "lucide-react";

const includes = [
  { icon: LineChart, title: "Monitoramento mensal do sistema", desc: "Acompanhamos quantos leads chegaram, quantos viraram agendamento e onde houve fricção." },
  { icon: Wrench, title: "Otimizações baseadas em dados reais", desc: "Não é palpite — toda mudança vem de número observado no mês anterior." },
  { icon: MessageCircle, title: "Suporte direto com Adriano", desc: "WhatsApp dedicado. Sem ticket. Sem chat genérico. Resposta em até 1 dia útil." },
  { icon: FileBarChart2, title: "Relatório mensal de resultados", desc: "PDF entregue todo dia 5 com: leads, conversão, ROI por canal, próximas otimizações." },
];

const faq = [
  { q: "Posso cancelar?", a: "Sim, após o período mínimo de 3 meses, com 30 dias de aviso prévio. Sem multa." },
  { q: "Preciso ter feito Sprint antes?", a: "Sim — o Retainer só faz sentido se você já tem o sistema instalado. Se não tem, comece pelo Sprint." },
  { q: "Posso pausar?", a: "Sim, até 30 dias por ano, pré-acordado. O contador de 3 meses não pausa, mas você não é cobrado no mês pausado." },
  { q: "Como funciona o pagamento?", a: "Mensalidade cobrada no dia 1 de cada mês via PIX ou cartão recorrente. Primeiro mês prorata se entrar no meio do mês." },
];

const WHATSAPP_URL = "https://wa.me/5571994054891?text=Quero%20contratar%20o%20Retainer%20O6";

export default function RetainerPage() {
  return (
    <main className="min-h-screen bg-[#0d0d0d] text-zinc-100">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <a href="/" className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center bg-brand-orange">
              <span className="font-black text-sm text-white">O6</span>
            </div>
            <span className="font-black text-lg uppercase tracking-tight text-white">O6 Growth</span>
          </a>
          <nav className="hidden gap-6 text-[11px] font-bold uppercase tracking-widest text-zinc-400 md:flex">
            <a href="/produto/diagnostico" className="hover:text-white">Diagnóstico</a>
            <a href="/produto/sprint" className="hover:text-white">Sprint</a>
            <a href="/produto/retainer" className="text-white">Retainer</a>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-20 md:py-28">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-5 inline-flex items-center gap-2 border border-emerald-400/40 bg-emerald-400/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
            Produto 3 · Continuidade
          </div>
          <h1 className="text-4xl font-black uppercase leading-[1.05] tracking-tight md:text-6xl">Retainer O6</h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-300 md:text-xl">
            Sistema funcionando e melhorando todo mês, sem você gerenciar.
          </p>

          <div className="mt-10 flex flex-col items-start gap-3 border-t border-white/10 pt-8 md:flex-row md:items-center md:gap-6">
            <div>
              <div className="text-5xl font-black tabular-nums text-white md:text-6xl">R$ 1.500<span className="text-2xl text-zinc-500">/mês</span></div>
              <div className="mt-1 text-xs uppercase tracking-widest text-zinc-500">Mínimo 3 meses · sem multa após o mínimo</div>
            </div>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-400 px-6 py-4 text-sm font-black uppercase tracking-widest text-[#0d0d0d] shadow-[4px_4px_0px_0px_#fff] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#fff] md:ml-auto"
            >
              Quero o Retainer
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </motion.div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.02] py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">O que está incluído</div>
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
                <it.icon className="mb-4 h-6 w-6 text-emerald-400" strokeWidth={1.5} />
                <h3 className="text-lg font-black text-white">{it.title}</h3>
                <p className="mt-2 text-sm text-zinc-400">{it.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 border border-emerald-400/30 bg-emerald-400/[0.06] p-6">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Promessa</div>
            <p className="mt-2 text-xl font-bold text-white md:text-2xl">
              Sistema funcionando e melhorando todo mês — sem você gerenciar.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-10 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">FAQ</div>
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

      <section className="border-t border-white/10 bg-emerald-400/[0.05] py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-black uppercase leading-tight tracking-tight text-white md:text-4xl">
            Você instalou. Agora é hora de manter rodando.
          </h2>
          <p className="mt-3 text-zinc-400">R$ 1.500/mês. Mínimo 3 meses. Sem multa depois.</p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 bg-emerald-400 px-7 py-4 text-sm font-black uppercase tracking-widest text-[#0d0d0d] shadow-[4px_4px_0px_0px_#fff] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#fff]"
          >
            Quero o Retainer
            <ArrowRight className="h-4 w-4" />
          </a>
          <p className="mt-6 flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest text-zinc-500">
            <Clock className="h-3.5 w-3.5" /> Pré-requisito: Sprint instalado
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-[11px] uppercase tracking-widest text-zinc-600">
        O6 Growth · Sistema Comercial · 2026
      </footer>
    </main>
  );
}
