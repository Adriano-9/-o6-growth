"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useMotionValue } from "framer-motion";

const statusCards = [
  { label: "Mercado", value: "Salvador · Saúde" },
  { label: "ICP", value: "2-3 profissionais · R$30k+/mês" },
  { label: "Oferta", value: "3 SKUs · R$800→R$4.800" },
  { label: "Roadmap", value: "10 clientes · 12 meses" },
];

const pipeline = [
  { title: "DIAGNÓSTICO", meta: "R$800 · 5 dias" },
  { title: "SPRINT", meta: "R$4.800 · 14 dias" },
  { title: "RETAINER", meta: "R$1.500/mês · mín 3 meses" },
];

const avatarQuadrants = [
  {
    title: "Frustrações",
    items: [
      "agenda furada",
      "não fecha o caixa",
      "agência sem retorno",
      "equipe sem camisa",
    ],
  },
  {
    title: "Desejos",
    items: [
      "previsibilidade de caixa",
      "tirar das próprias costas",
      "paciente que fecha plano",
    ],
  },
  {
    title: "Medos",
    items: ["fechar em 5 anos", "perder funcionário", "processo judicial"],
  },
  {
    title: "Sombras",
    items: [
      "prefere agência a admitir que não sabe",
      "gasta com curso para sentir progresso",
    ],
  },
];

const roadmap = [
  {
    phase: "Fase 1",
    period: "meses 1-3",
    clients: "2 clientes",
    mrr: "R$3k MRR",
    status: "● Validação",
  },
  {
    phase: "Fase 2",
    period: "meses 4-6",
    clients: "5 clientes",
    mrr: "R$7.5k MRR",
    status: "● Tração",
  },
  {
    phase: "Fase 3",
    period: "meses 7-12",
    clients: "10 clientes",
    mrr: "R$15k MRR",
    status: "○ Escala",
  },
];

const statistics = [
  {
    label: "clínicas fecham em menos de 5 anos",
    start: 60,
    suffix: "%",
  },
  {
    label: "conversão com resposta em menos de 5 min",
    start: 21,
    suffix: "x",
  },
  {
    label: "leads que nunca agendam",
    start: 65,
    end: 75,
    suffix: "%",
  },
  {
    label: "agendamentos fora do horário comercial",
    start: 52,
    suffix: "%",
  },
];

const objections = [
  {
    title: "Já contratei agência",
    answer: "Diagnóstico primeiro, sem risco",
  },
  {
    title: "Tá caro",
    answer: "Quanto perde por mês em leads perdidos?",
  },
  {
    title: "Não tenho tempo",
    answer: "É exatamente pra isso que serve",
  },
];

type FadeUpProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

function FadeUp({ children, className = "", delay = 0 }: FadeUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

type StatCounterProps = {
  start: number;
  end?: number;
  suffix: string;
};

function StatCounter({ start, end, suffix }: StatCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const firstValue = useMotionValue(0);
  const secondValue = useMotionValue(0);
  const [firstDisplay, setFirstDisplay] = useState(0);
  const [secondDisplay, setSecondDisplay] = useState(0);

  useEffect(() => {
    const firstControls = animate(firstValue, isInView ? start : 0, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (latest) => setFirstDisplay(Math.round(latest)),
    });

    const secondControls =
      end === undefined
        ? undefined
        : animate(secondValue, isInView ? end : 0, {
            duration: 1.4,
            ease: "easeOut",
            onUpdate: (latest) => setSecondDisplay(Math.round(latest)),
          });

    return () => {
      firstControls.stop();
      secondControls?.stop();
    };
  }, [end, firstValue, secondValue, isInView, start]);

  return (
    <span ref={ref}>
      {end === undefined
        ? `${firstDisplay}${suffix}`
        : `${firstDisplay}-${secondDisplay}${suffix}`}
    </span>
  );
}

function ObjectionAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {objections.map((objection, index) => {
        const isOpen = openIndex === index;

        return (
          <FadeUp key={objection.title} delay={index * 0.08}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              className="group flex min-h-[150px] w-full flex-col justify-between rounded-lg border border-[#222222] bg-[#111111] p-5 text-left outline-none transition-colors hover:border-[#3A3A3A] focus-visible:border-white"
              aria-expanded={isOpen}
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-base font-bold text-white">
                  {objection.title}
                </h3>
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#222222] text-lg leading-none text-[#888888] transition-colors group-hover:text-white">
                  {isOpen ? "−" : "+"}
                </span>
              </div>

              <motion.p
                initial={false}
                animate={{
                  height: isOpen ? "auto" : 0,
                  opacity: isOpen ? 1 : 0,
                  marginTop: isOpen ? 28 : 0,
                }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="overflow-hidden text-sm leading-6 text-[#888888]"
              >
                {objection.answer}
              </motion.p>
            </button>
          </FadeUp>
        );
      })}
    </div>
  );
}

export default function OfferBookDashboardPage() {
  return (
    <main className="min-h-screen bg-[#0D0D0D] px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12">
        <header className="flex flex-col gap-5 border-b border-[#222222] pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-[#222222] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white">
                v2 · Ativo
              </span>
              <span className="text-sm font-medium text-[#888888]">
                Jun 2026
              </span>
            </div>
            <h1 className="text-5xl font-bold leading-[0.95] text-white sm:text-7xl lg:text-8xl">
              Offer Book O6
            </h1>
          </div>
          <p className="max-w-sm text-sm leading-6 text-[#888888]">
            Diagnóstico antes de venda. Sistema antes de promessa.
          </p>
        </header>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {statusCards.map((card, index) => (
            <FadeUp
              key={card.label}
              delay={index * 0.06}
              className="rounded-lg border border-[#222222] bg-[#111111] p-5"
            >
              <p className="mb-8 text-xs font-bold uppercase tracking-[0.18em] text-[#888888]">
                {card.label}
              </p>
              <p className="text-xl font-bold leading-tight text-white">
                {card.value}
              </p>
            </FadeUp>
          ))}
        </section>

        <section className="grid gap-3 lg:grid-cols-2">
          <FadeUp className="rounded-lg border border-[#222222] bg-[#111111] p-6 sm:p-8">
            <p className="mb-8 text-xs font-bold uppercase tracking-[0.18em] text-[#888888]">
              Tese
            </p>
            <p className="text-2xl font-bold leading-tight text-white sm:text-3xl">
              Donos de clínicas em Salvador já foram queimados por agências. A
              O6 não promete — diagnostica primeiro.
            </p>
          </FadeUp>

          <FadeUp
            delay={0.08}
            className="rounded-lg border border-[#222222] bg-[#111111] p-6 sm:p-8"
          >
            <p className="mb-8 text-xs font-bold uppercase tracking-[0.18em] text-[#888888]">
              Posicionamento
            </p>
            <p className="mb-8 text-2xl font-bold leading-tight text-white sm:text-3xl">
              Não é agência · Não é consultoria · Não é software
            </p>
            <p className="border-t border-[#222222] pt-6 text-base leading-7 text-[#888888]">
              Diagnóstico antes de venda. Sistema antes de promessa.
            </p>
          </FadeUp>
        </section>

        <section>
          <FadeUp>
            <div className="mb-5 flex items-end justify-between gap-4">
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-white">
                Esteira
              </h2>
              <span className="text-xs font-medium text-[#888888]">
                Oferta tripwire → implementação → recorrência
              </span>
            </div>
          </FadeUp>
          <div className="grid gap-3 lg:grid-cols-[1fr_72px_1fr_72px_1fr] lg:items-center">
            {pipeline.map((step, index) => (
              <div
                key={step.title}
                className="contents"
              >
                <FadeUp
                  delay={index * 0.08}
                  className="rounded-lg border border-[#222222] bg-[#111111] p-6"
                >
                  <p className="mb-10 text-xs font-bold uppercase tracking-[0.18em] text-[#888888]">
                    0{index + 1}
                  </p>
                  <h3 className="mb-3 text-2xl font-bold text-white">
                    {step.title}
                  </h3>
                  <p className="text-sm font-medium text-[#888888]">
                    {step.meta}
                  </p>
                </FadeUp>

                {index < pipeline.length - 1 ? (
                  <motion.div
                    aria-hidden="true"
                    className="hidden h-px overflow-hidden bg-[#222222] lg:block"
                    initial={{ scaleX: 0.2, opacity: 0.4 }}
                    whileInView={{ scaleX: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{
                      duration: 1,
                      delay: 0.2 + index * 0.12,
                      ease: "easeOut",
                    }}
                  >
                    <motion.div
                      className="h-px w-10 bg-white"
                      animate={{ x: [0, 32, 0] }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.div>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section>
          <FadeUp>
            <h2 className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-white">
              Avatar
            </h2>
          </FadeUp>
          <div className="grid gap-3 md:grid-cols-2">
            {avatarQuadrants.map((quadrant, index) => (
              <FadeUp
                key={quadrant.title}
                delay={index * 0.06}
                className="rounded-lg border border-[#222222] bg-[#111111] p-6"
              >
                <h3 className="mb-6 text-lg font-bold text-white">
                  {quadrant.title}
                </h3>
                <ul className="space-y-3">
                  {quadrant.items.map((item) => (
                    <li
                      key={item}
                      className="border-t border-[#222222] pt-3 text-sm leading-6 text-[#888888]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </FadeUp>
            ))}
          </div>
        </section>

        <section>
          <FadeUp>
            <div className="mb-5 flex items-end justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-white">
                Roadmap
              </h2>
              <span className="text-xs font-medium text-[#888888]">
                12 meses
              </span>
            </div>
          </FadeUp>

          <div className="relative rounded-lg border border-[#222222] bg-[#111111] p-6 sm:p-8">
            <div
              aria-hidden="true"
              className="absolute left-8 right-8 top-[54px] hidden h-px bg-[#222222] md:block"
            />
            <motion.div
              aria-hidden="true"
              className="absolute left-8 top-[54px] hidden h-px origin-left bg-white md:block"
              initial={{ width: "0%" }}
              whileInView={{ width: "calc(100% - 4rem)" }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />

            <div className="grid gap-6 md:grid-cols-3">
              {roadmap.map((phase, index) => (
                <FadeUp key={phase.phase} delay={index * 0.08}>
                  <div className="relative">
                    <div className="mb-8 h-4 w-4 rounded-full border border-white bg-[#0D0D0D] shadow-[0_0_0_8px_#111111]" />
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#888888]">
                      {phase.period}
                    </p>
                    <h3 className="mb-5 text-2xl font-bold text-white">
                      {phase.phase}
                    </h3>
                    <div className="space-y-2 text-sm font-medium text-[#888888]">
                      <p>{phase.clients}</p>
                      <p>{phase.mrr}</p>
                      <p className="text-white">{phase.status}</p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {statistics.map((stat, index) => (
            <FadeUp
              key={stat.label}
              delay={index * 0.06}
              className="rounded-lg border border-[#222222] bg-[#111111] p-6"
            >
              <p className="mb-10 min-h-[48px] text-sm leading-6 text-[#888888]">
                {stat.label}
              </p>
              <p className="text-5xl font-bold leading-none text-white sm:text-6xl">
                <StatCounter
                  start={stat.start}
                  end={stat.end}
                  suffix={stat.suffix}
                />
              </p>
            </FadeUp>
          ))}
        </section>

        <section>
          <FadeUp>
            <h2 className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-white">
              Objeções
            </h2>
          </FadeUp>
          <ObjectionAccordion />
        </section>

        <FadeUp>
          <section className="border-y border-[#222222] py-16 text-center sm:py-24">
            <blockquote className="mx-auto max-w-4xl text-3xl font-bold leading-tight text-white sm:text-5xl">
              “A maioria das clínicas não falha por falta de esforço.
              <br />
              Falha porque ninguém nunca mostrou onde o dinheiro vaza.”
            </blockquote>
          </section>
        </FadeUp>
      </div>
    </main>
  );
}
