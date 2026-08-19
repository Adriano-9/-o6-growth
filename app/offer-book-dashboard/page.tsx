"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useMotionValue } from "framer-motion";

const readout = [
  {
    code: "01",
    label: "Market Friction",
    text: "Clínicas em Salvador compram com baixa confiança porque já foram queimadas por agências.",
  },
  {
    code: "02",
    label: "Strategic Wedge",
    text: "Diagnóstico pago transforma desconfiança em prova antes da venda de implementação.",
  },
  {
    code: "03",
    label: "Revenue Path",
    text: "Auditoria de R$800 abre sprint de R$4.800 e cria caminho para R$15k MRR em 12 meses.",
  },
];

const kpis = [
  {
    label: "Mercado",
    value: "Salvador · Saúde",
    sub: "cluster inicial",
    tone: "Context",
  },
  {
    label: "ICP",
    value: "2-3 prof. · R$30k+",
    sub: "dono ainda operacional",
    tone: "Fit",
  },
  {
    label: "Entrada",
    value: "R$800 · 5 dias",
    sub: "prova de vazamento",
    tone: "Wedge",
  },
  {
    label: "Forecast",
    value: "10 clientes · R$15k",
    sub: "MRR em 12 meses",
    tone: "Target",
  },
];

const marketSignals = [
  {
    value: 60,
    suffix: "%",
    label: "clínicas fecham em menos de 5 anos",
    insight: "sobrevivência vira argumento de caixa, não de marketing",
  },
  {
    value: 21,
    suffix: "x",
    label: "conversão com resposta em menos de 5 min",
    insight: "velocidade é alavanca antes de mídia",
  },
  {
    value: 65,
    end: 75,
    suffix: "%",
    label: "leads que nunca agendam",
    insight: "perda acontece antes da oportunidade virar venda",
  },
  {
    value: 52,
    suffix: "%",
    label: "agendamentos fora do horário comercial",
    insight: "demanda chega quando a operação está invisível",
  },
];

const thesisMatrix = [
  {
    label: "Risk",
    title: "Confiança queimada",
    text: "Mais uma promessa de agência ativa defesa. A venda precisa começar por evidência.",
  },
  {
    label: "Proof",
    title: "Diagnóstico antes",
    text: "A O6 mostra onde o dinheiro vaza antes de pedir investimento maior.",
  },
  {
    label: "Move",
    title: "Auditoria paga",
    text: "R$800 valida dor, cria urgência e conduz para sprint com risco percebido menor.",
  },
];

const pipeline = [
  {
    title: "Diagnóstico",
    label: "Prova",
    price: "R$800",
    period: "5 dias",
    text: "Mapear vazamento, quantificar perda e gerar confiança.",
    progress: 24,
  },
  {
    title: "Sprint",
    label: "Correção",
    price: "R$4.800",
    period: "14 dias",
    text: "Implementar sistema comercial que remove perdas visíveis.",
    progress: 64,
  },
  {
    title: "Retainer",
    label: "Recorrência",
    price: "R$1.500/mês",
    period: "mín. 3 meses",
    text: "Operar melhoria contínua e manter previsibilidade.",
    progress: 100,
  },
];

const roadmap = [
  {
    phase: "Validação",
    period: "M1-M3",
    clients: "2 clientes",
    mrr: "R$3k MRR",
    width: "20%",
  },
  {
    phase: "Tração",
    period: "M4-M6",
    clients: "5 clientes",
    mrr: "R$7.5k MRR",
    width: "50%",
  },
  {
    phase: "Escala",
    period: "M7-M12",
    clients: "10 clientes",
    mrr: "R$15k MRR",
    width: "100%",
  },
];

const avatarRows = [
  ["Dor", "agenda furada · caixa instável · agência sem retorno"],
  ["Ambição", "previsibilidade · sair da operação · paciente que fecha plano"],
  ["Medo", "fechar em 5 anos · perder funcionário · processo judicial"],
  ["Sombra", "compra curso para sentir progresso · terceiriza culpa na agência"],
];

const objections = [
  ["Já contratei agência", "Diagnóstico primeiro, sem risco"],
  ["Tá caro", "Quanto perde por mês em leads perdidos?"],
  ["Não tenho tempo", "É exatamente pra isso que serve"],
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
      initial={{ opacity: 0, y: 18 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

type CounterProps = {
  value: number;
  end?: number;
  suffix: string;
};

function Counter({ value, end, suffix }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const first = useMotionValue(0);
  const second = useMotionValue(0);
  const [firstDisplay, setFirstDisplay] = useState(0);
  const [secondDisplay, setSecondDisplay] = useState(0);

  useEffect(() => {
    const firstControls = animate(first, isInView ? value : 0, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: (latest) => setFirstDisplay(Math.round(latest)),
    });

    const secondControls =
      end === undefined
        ? undefined
        : animate(second, isInView ? end : 0, {
            duration: 0.8,
            ease: "easeOut",
            onUpdate: (latest) => setSecondDisplay(Math.round(latest)),
          });

    return () => {
      firstControls.stop();
      secondControls?.stop();
    };
  }, [end, first, isInView, second, value]);

  return (
    <span ref={ref}>
      {end === undefined
        ? `${firstDisplay}${suffix}`
        : `${firstDisplay}-${secondDisplay}${suffix}`}
    </span>
  );
}

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`border border-[#222222] bg-[#111111] ${className}`}>
      {children}
    </div>
  );
}

function TerminalHeader({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#222222] px-4 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#888888]">
        {label}
      </p>
      {value ? (
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
          {value}
        </p>
      ) : null}
    </div>
  );
}

function ExecutiveTape() {
  return (
    <Panel className="overflow-hidden rounded-lg">
      <div className="grid divide-y divide-[#222222] lg:grid-cols-4 lg:divide-x lg:divide-y-0">
        {kpis.map((item, index) => (
          <FadeUp key={item.label} delay={index * 0.04}>
            <div className="relative min-h-[118px] p-4">
              <div className="mb-5 flex items-center justify-between gap-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#888888]">
                  {item.label}
                </p>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF6B00]">
                  {item.tone}
                </span>
              </div>
              <p className="mb-3 text-2xl font-bold leading-none text-white">
                {item.value}
              </p>
              <p className="text-xs leading-5 text-[#888888]">{item.sub}</p>
            </div>
          </FadeUp>
        ))}
      </div>
    </Panel>
  );
}

function SignalGrid() {
  return (
    <Panel className="overflow-hidden rounded-lg">
      <TerminalHeader label="Market Signal Grid" value="evidence layer" />
      <div className="grid divide-y divide-[#222222] md:grid-cols-2 md:divide-x md:divide-y-0">
        {marketSignals.map((signal, index) => (
          <FadeUp key={signal.label} delay={index * 0.04}>
            <div className="min-h-[160px] p-4">
              <p className="mb-5 min-h-[34px] text-[11px] font-bold uppercase leading-5 tracking-[0.14em] text-[#888888]">
                {signal.label}
              </p>
              <div className="mb-5 flex items-end justify-between gap-4">
                <p className="text-5xl font-bold leading-none text-white">
                  <Counter
                    value={signal.value}
                    end={signal.end}
                    suffix={signal.suffix}
                  />
                </p>
                <div className="h-12 w-24 border-b border-l border-[#222222]">
                  <motion.div
                    className="mt-7 h-px origin-left bg-[#FF6B00]"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.05 }}
                  />
                </div>
              </div>
              <p className="border-t border-[#222222] pt-3 text-xs leading-5 text-[#888888]">
                {signal.insight}
              </p>
            </div>
          </FadeUp>
        ))}
      </div>
    </Panel>
  );
}

function StrategyMap() {
  return (
    <Panel className="overflow-hidden rounded-lg">
      <TerminalHeader label="Strategic Map" value="risk · proof · move" />
      <div className="grid divide-y divide-[#222222] lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        {thesisMatrix.map((item, index) => (
          <FadeUp key={item.label} delay={index * 0.05}>
            <div className="p-4">
              <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#FF6B00]">
                {item.label}
              </p>
              <h3 className="mb-3 text-xl font-bold leading-tight text-white">
                {item.title}
              </h3>
              <p className="text-sm leading-6 text-[#888888]">{item.text}</p>
            </div>
          </FadeUp>
        ))}
      </div>
    </Panel>
  );
}

function RevenuePath() {
  return (
    <Panel className="overflow-hidden rounded-lg">
      <TerminalHeader label="Revenue Path" value="offer architecture" />
      <div className="grid divide-y divide-[#222222] lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        {pipeline.map((step, index) => (
          <FadeUp key={step.title} delay={index * 0.05}>
            <div className="p-4">
              <div className="mb-5 flex items-center justify-between gap-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#888888]">
                  0{index + 1} · {step.label}
                </p>
                <span className="h-2 w-2 rounded-full bg-white" />
              </div>
              <h3 className="mb-3 text-2xl font-bold leading-none text-white">
                {step.title}
              </h3>
              <div className="mb-5 flex items-baseline justify-between gap-4">
                <p className="text-xl font-bold text-white">{step.price}</p>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#888888]">
                  {step.period}
                </p>
              </div>
              <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-[#222222]">
                <motion.div
                  className="h-full rounded-full bg-[#FF6B00]"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${step.progress}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.08 }}
                />
              </div>
              <p className="text-sm leading-6 text-[#888888]">{step.text}</p>
            </div>
          </FadeUp>
        ))}
      </div>
    </Panel>
  );
}

function ForecastPanel() {
  return (
    <Panel className="overflow-hidden rounded-lg">
      <TerminalHeader label="12M MRR Forecast" value="validation → scale" />
      <div className="divide-y divide-[#222222]">
        {roadmap.map((item, index) => (
          <FadeUp key={item.phase} delay={index * 0.04}>
            <div className="grid gap-4 px-4 py-3 sm:grid-cols-[112px_1fr_112px] sm:items-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888]">
                  {item.period}
                </p>
                <p className="mt-1 text-base font-bold text-white">
                  {item.phase}
                </p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#222222]">
                <motion.div
                  className="h-full rounded-full bg-white"
                  initial={{ width: 0 }}
                  whileInView={{ width: item.width }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: index * 0.08 }}
                />
              </div>
              <div className="sm:text-right">
                <p className="text-sm font-bold text-white">{item.mrr}</p>
                <p className="mt-1 text-xs text-[#888888]">{item.clients}</p>
              </div>
            </div>
          </FadeUp>
        ))}
      </div>
    </Panel>
  );
}

function IntelSidePanel() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="grid gap-3">
      <Panel className="overflow-hidden rounded-lg">
        <TerminalHeader label="Buyer Intel" value="avatar" />
        <div className="divide-y divide-[#222222]">
          {avatarRows.map(([label, text]) => (
            <div key={label} className="grid gap-2 px-4 py-3 sm:grid-cols-[96px_1fr]">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                {label}
              </p>
              <p className="text-sm leading-6 text-[#888888]">{text}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="overflow-hidden rounded-lg">
        <TerminalHeader label="Objection Handling" value="sales layer" />
        <div className="divide-y divide-[#222222]">
          {objections.map(([title, answer], index) => {
            const isOpen = openIndex === index;

            return (
              <button
                key={title}
                type="button"
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                className="group w-full px-4 py-3 text-left outline-none transition-colors hover:bg-[#151515] focus-visible:bg-[#151515]"
                aria-expanded={isOpen}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-bold text-white">{title}</p>
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[#222222] text-sm leading-none text-[#888888] group-hover:text-white">
                    {isOpen ? "−" : "+"}
                  </span>
                </div>
                <motion.p
                  initial={false}
                  animate={{
                    height: isOpen ? "auto" : 0,
                    opacity: isOpen ? 1 : 0,
                    marginTop: isOpen ? 10 : 0,
                  }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden text-sm leading-6 text-[#888888]"
                >
                  {answer}
                </motion.p>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel className="overflow-hidden rounded-lg">
        <TerminalHeader label="Recommended Decision" value="next action" />
        <div className="p-4">
          <p className="mb-4 text-2xl font-bold leading-tight text-white">
            Entrar por diagnóstico pago. Provar vazamento. Converter para
            sprint. Reter por operação mensal.
          </p>
          <p className="border-t border-[#222222] pt-4 text-sm leading-6 text-[#888888]">
            A venda não começa prometendo crescimento. Começa mostrando a perda
            que já existe.
          </p>
        </div>
      </Panel>
    </div>
  );
}

export default function OfferBookDashboardPage() {
  return (
    <main className="min-h-screen bg-[#0D0D0D] px-4 py-4 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-[1540px] gap-3">
        <header className="grid gap-3 xl:grid-cols-[280px_minmax(0,1fr)_420px]">
          <FadeUp>
            <Panel className="flex min-h-[250px] flex-col justify-between overflow-hidden rounded-lg">
              <div className="border-b border-[#222222] px-4 py-3">
                <div className="mb-3 h-px w-16 bg-[#FF6B00]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#888888]">
                  O6 Growth · Offer Intelligence
                </p>
              </div>
              <div className="p-4">
                <div className="mb-6 flex flex-wrap gap-2">
                  <span className="rounded-full border border-[#222222] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                    v2 · Ativo
                  </span>
                  <span className="rounded-full border border-[#222222] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#888888]">
                    Jun 2026
                  </span>
                </div>
                <h1 className="text-5xl font-bold leading-[0.88] text-white lg:text-6xl">
                  Offer{" "}
                  <br />
                  Book O6
                </h1>
              </div>
            </Panel>
          </FadeUp>

          <FadeUp delay={0.05}>
            <Panel className="relative flex min-h-[250px] flex-col justify-between overflow-hidden rounded-lg p-5 sm:p-6">
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px bg-[#FF6B00]"
              />
              <div>
                <p className="mb-8 text-[10px] font-bold uppercase tracking-[0.24em] text-[#888888]">
                  Strategic Intelligence Dashboard
                </p>
                <p className="max-w-4xl text-4xl font-bold leading-[0.98] text-white sm:text-5xl lg:text-6xl">
                  Donos de clínicas não precisam de promessa. Precisam ver onde
                  o dinheiro vaza.
                </p>
              </div>
              <div className="mt-8 grid gap-3 border-t border-[#222222] pt-4 md:grid-cols-3">
                {readout.map((item) => (
                  <div key={item.code}>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF6B00]">
                      {item.code} · {item.label}
                    </p>
                    <p className="text-sm leading-6 text-[#888888]">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </Panel>
          </FadeUp>

          <FadeUp delay={0.1}>
            <Panel className="flex min-h-[250px] flex-col justify-between overflow-hidden rounded-lg">
              <TerminalHeader label="Positioning" value="market stance" />
              <div className="p-4">
                <p className="mb-5 text-3xl font-bold leading-tight text-white">
                  Não é agência. Não é consultoria. Não é software.
                </p>
                <p className="border-t border-[#222222] pt-4 text-sm leading-6 text-[#888888]">
                  Diagnóstico antes de venda. Sistema antes de promessa.
                </p>
              </div>
              <div className="grid grid-cols-3 border-t border-[#222222]">
                {["Audit", "Sprint", "MRR"].map((item) => (
                  <div key={item} className="border-r border-[#222222] p-3 last:border-r-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#888888]">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </Panel>
          </FadeUp>
        </header>

        <ExecutiveTape />

        <section className="grid gap-3 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.55fr)]">
          <div className="grid gap-3">
            <div className="grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
              <SignalGrid />
              <StrategyMap />
            </div>

            <RevenuePath />
            <ForecastPanel />

            <FadeUp>
              <Panel className="rounded-lg px-5 py-8 text-center">
                <blockquote className="mx-auto max-w-5xl text-3xl font-bold leading-tight text-white sm:text-4xl">
                  “A maioria das clínicas não falha por falta de esforço. Falha
                  porque ninguém nunca mostrou onde o dinheiro vaza.”
                </blockquote>
              </Panel>
            </FadeUp>
          </div>

          <aside>
            <IntelSidePanel />
          </aside>
        </section>
      </div>
    </main>
  );
}
