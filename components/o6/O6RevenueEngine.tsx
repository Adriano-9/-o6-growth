"use client";

import { motion } from "framer-motion";
import { Database, MessageCircle, RefreshCw, Zap, ArrowRight } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Database,
    title: "CRM Estruturado",
    description:
      "Cada lead tem um registro. Cada interação é documentada. Nenhum contato se perde. Sua equipe sabe exatamente em que etapa está cada potencial cliente — e o que fazer a seguir.",
    result: "Zero leads perdidos por desorganização",
  },
  {
    step: "02",
    icon: MessageCircle,
    title: "Atendimento via WhatsApp",
    description:
      "O canal mais rápido e mais usado pelo seu cliente. Configuramos fluxos de atendimento que respondem em segundos, qualificam o lead e direcionam para o agendamento.",
    result: "Primeiro contato em menos de 5 minutos",
  },
  {
    step: "03",
    icon: RefreshCw,
    title: "Follow-up Sistemático",
    description:
      "Sequência de contatos estruturada para os leads que não fecharam na primeira interação. Lembretes, novos ângulos de abordagem e o momento certo para cada mensagem.",
    result: "Recuperação de leads que 'foram pensar'",
  },
  {
    step: "04",
    icon: Zap,
    title: "Automações de Relacionamento",
    description:
      "Confirmação de consulta, lembrete de retorno, pesquisa de satisfação, reativação de pacientes inativos. Tudo automático, com o tom e o timing certos.",
    result: "Recorrência e reativação sem esforço manual",
  },
];

export default function O6RevenueEngine() {
  return (
    <section id="revenue-engine" className="w-full py-24 md:py-32 bg-brand-graphite text-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-[11px] font-black uppercase tracking-widest text-brand-orange block mb-4">
            Pilar 03 — Revenue Engine
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white leading-[0.92] mb-6">
            Do interesse<br />ao fechamento.
          </h2>
          <p className="text-base md:text-lg text-white/60 leading-relaxed">
            Um lead que não é atendido rápido e acompanhado com consistência é um lead perdido. O Revenue Engine garante que sua equipe tenha o sistema, o processo e as ferramentas certas para transformar interesse em agenda cheia.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="bg-white/5 border border-white/10 p-8 flex flex-col gap-5 hover:bg-white/8 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-orange flex items-center justify-center shrink-0">
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-4xl font-black text-white/5 select-none leading-none">{s.step}</span>
              </div>

              <div>
                <h3 className="text-lg font-black uppercase tracking-tighter text-white mb-3">
                  {s.title}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed mb-4">
                  {s.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-brand-orange shrink-0" />
                  <span className="text-[11px] font-black text-brand-orange uppercase tracking-wide">
                    {s.result}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA strip */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/10 pt-12">
          <div>
            <p className="text-xl font-black uppercase tracking-tighter text-white mb-1">
              Sua agenda está cheia de espaços vazios?
            </p>
            <p className="text-sm text-white/50">
              O problema raramente é falta de leads. É falta de sistema para convertê-los.
            </p>
          </div>
          <a
            href="#diagnostico"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white bg-brand-orange px-8 py-4 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] hover:-translate-y-px transition-all shrink-0"
          >
            Quero estruturar meu sistema <ArrowRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </section>
  );
}
