"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Zap,
  MessageSquare,
  CalendarCheck2,
  Users,
  CheckCircle2,
  Clock,
} from "lucide-react";

const includes = [
  { icon: Zap, title: "Sistema de resposta automática configurado", desc: "Quando o paciente manda mensagem, ele recebe resposta em segundos — mesmo fora do horário comercial." },
  { icon: MessageSquare, title: "Follow-up de leads implantado", desc: "Cada lead que não responde recebe sequência automática de 5 toques em 14 dias. Sem você lembrar." },
  { icon: CalendarCheck2, title: "Integração WhatsApp + agendamento", desc: "Paciente clica no link, escolhe horário e cai direto na sua agenda. Sem ligação, sem fricção." },
  { icon: Users, title: "Treinamento da equipe incluído", desc: "Recepção + comercial aprendem a operar o sistema em 2 sessões de 1h. Sem manual gigante." },
];

const stats = [
  { value: "60%", label: "das clínicas fecham em <5 anos", source: "SEBRAE 2022" },
  { value: "21×", label: "mais conversão quando responde em <5min", source: "Lead Response Survey" },
  { value: "65-75%", label: "dos leads que entram em contato nunca agendam", source: "Setor médico BR" },
];

const faq = [
  { q: "Precisa de técnico na clínica?", a: "Não. Implantamos remotamente, você só precisa nos dar acesso ao WhatsApp Business da clínica. Em 14 dias está rodando." },
  { q: "E depois dos 14 dias?", a: "O sistema continua funcionando. Para suporte e otimização contínua, existe o Retainer (R$ 1.500/mês)." },
  { q: "Posso parcelar?", a: "Sim — R$ 4.800 à vista ou 2x R$ 2.500 (primeira no início, segunda na entrega)." },
  { q: "Preciso ter feito o Diagnóstico antes?", a: "Não é obrigatório, mas é recomendado. Sem diagnóstico, começamos com checklist padrão." },
];

const WHATSAPP_URL = "https://wa.me/5571994054891?text=Quero%20contratar%20o%20Sprint%20O6";

export default function SprintPage() {
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
            <a href="/produto/sprint" className="text-white">Sprint</a>
            <a href="/produto/retainer" className="hover:text-white">Retainer</a>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-20 md:py-28">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-5 inline-flex items-center gap-2 border border-brand-cyan/40 bg-brand-cyan/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-cyan">
            Produto 2 · Implementação
          </div>
          <h1 className="text-4xl font-black uppercase leading-[1.05] tracking-tight md:text-6xl">Sprint O6</h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-300 md:text-xl">
            Sistema de captação implantado em 14 dias. Você dorme com o sistema atendendo.
          </p>

          <div className="mt-10 flex flex-col items-start gap-3 border-t border-white/10 pt-8 md:flex-row md:items-center md:gap-6">
            <div>
              <div className="text-5xl font-black tabular-nums text-white md:text-6xl">R$ 4.800</div>
              <div className="mt-1 text-xs uppercase tracking-widest text-zinc-500">à vista · ou 2× R$ 2.500 · 14 dias</div>
            </div>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-brand-cyan px-6 py-4 text-sm font-black uppercase tracking-widest text-[#0d0d0d] shadow-[4px_4px_0px_0px_#fff] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#fff] md:ml-auto"
            >
              Quero o Sprint
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </motion.div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.02] py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-cyan">O que está incluído</div>
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
                <it.icon className="mb-4 h-6 w-6 text-brand-cyan" strokeWidth={1.5} />
                <h3 className="text-lg font-black text-white">{it.title}</h3>
                <p className="mt-2 text-sm text-zinc-400">{it.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 border border-brand-cyan/30 bg-brand-cyan/[0.06] p-6">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-cyan">Promessa</div>
            <p className="mt-2 text-xl font-bold text-white md:text-2xl">
              Agenda respondendo sozinha fora do horário comercial em 14 dias.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-10 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-cyan">Por que isso importa</div>
          <div className="grid gap-6 md:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="border-l-2 border-brand-cyan pl-5">
                <div className="text-4xl font-black tabular-nums text-white">{s.value}</div>
                <div className="mt-2 text-sm text-zinc-300">{s.label}</div>
                <div className="mt-1 text-[10px] uppercase tracking-widest text-zinc-500">{s.source}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.02] py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-10 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-cyan">FAQ</div>
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

      <section className="border-t border-white/10 bg-brand-cyan/[0.05] py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-black uppercase leading-tight tracking-tight text-white md:text-4xl">
            14 dias. Sistema rodando. Sem precisar de TI.
          </h2>
          <p className="mt-3 text-zinc-400">R$ 4.800 à vista ou 2× R$ 2.500.</p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 bg-brand-cyan px-7 py-4 text-sm font-black uppercase tracking-widest text-[#0d0d0d] shadow-[4px_4px_0px_0px_#fff] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#fff]"
          >
            Quero o Sprint
            <ArrowRight className="h-4 w-4" />
          </a>
          <p className="mt-6 flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest text-zinc-500">
            <Clock className="h-3.5 w-3.5" /> Conversa pelo WhatsApp · sem formulário
          </p>
          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-zinc-500">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" strokeWidth={1.5} />
            Recomendado fazer Diagnóstico antes
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-[11px] uppercase tracking-widest text-zinc-600">
        O6 Growth · Sistema Comercial · 2026
      </footer>
    </main>
  );
}
