import Link from "next/link";
import { whatsappUrl } from "@/app/_lib/contato";
import { EXPRESS_DEADLINE, EXPRESS_HAS_PAYMENT_LINK, EXPRESS_PAYMENT_URL, EXPRESS_PRICE } from "@/app/_lib/express";
import { ExpressSteps } from "./_components/ExpressSteps";

const display = { fontFamily: "var(--font-o6-display)" };
const serif = { fontFamily: "var(--font-o6-serif)" };
const mono = { fontFamily: "var(--font-o6-mono)" };

const report = [
  { label: "Presença no Instagram e Google", status: "Claro", tone: "ok" },
  { label: "Oferta e mensagem", status: "Atenção", tone: "mid" },
  { label: "Primeira resposta no WhatsApp", status: "Prioridade 1", tone: "hot" },
  { label: "Retomada de quem disse “vou pensar”", status: "Prioridade 2", tone: "hot" },
  { label: "Caminho até agendar", status: "Atenção", tone: "mid" },
] as const;

const how = [
  { n: "01", title: "Pagamento", text: `${EXPRESS_PRICE} pelo Mercado Pago, no Pix ou no cartão.` },
  { n: "02", title: "Formulário de 5 minutos", text: "Você conta sobre o negócio e o atendimento. Sem dados de pacientes ou clientes." },
  { n: "03", title: "Análise com revisão humana", text: "Olhamos sua presença pública e o que você descreveu, e ordenamos o que mais trava." },
  { n: "04", title: "Entrega pelo WhatsApp", text: `Até três prioridades em ordem, ${EXPRESS_DEADLINE}.` },
];

function BuyButton({ className = "", label = `Fazer o Diagnóstico Express · ${EXPRESS_PRICE}` }: { className?: string; label?: string }) {
  return (
    <a
      href={EXPRESS_PAYMENT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center justify-between gap-5 rounded-[2px] bg-[#f2542d] px-5 py-4 text-[15px] font-bold text-[#170904] transition-transform duration-300 hover:-translate-y-0.5 ${className}`}
    >
      {label}
      <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
    </a>
  );
}

export default function DiagnosticoExpressPage() {
  return (
    <main className="min-h-screen bg-[#f4f2ec] text-[#1d2022]" style={{ fontFamily: "var(--font-o6-sans)" }}>
      <header className="sticky top-0 z-30 border-b border-[#1d2022]/15 bg-[#f4f2ec]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-4 py-3.5 md:px-8">
          <Link href="/" className="flex items-center gap-2.5 text-sm font-extrabold tracking-[0.04em]">
            <span className="grid h-7 w-7 place-items-center bg-[#f2542d] text-[11px] text-[#170904]">O6</span>O6 GROWTH
          </Link>
          <nav aria-label="Principal" className="hidden gap-6 text-sm text-[#585d5b] md:flex">
            <Link href="/" className="hover:text-[#1d2022]">Início</Link>
            <Link href="/servicos" className="hover:text-[#1d2022]">Serviços</Link>
            <Link href="/portfolio/index.html" className="hover:text-[#1d2022]">Portfólio</Link>
          </nav>
          <a href={EXPRESS_PAYMENT_URL} target="_blank" rel="noopener noreferrer" className="rounded-[2px] bg-[#f2542d] px-3.5 py-2.5 text-[13px] font-bold text-[#170904]">
            Contratar →
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-[1240px] gap-10 px-4 py-12 md:px-8 md:py-20 lg:grid-cols-[1.3fr_0.7fr] lg:items-end lg:gap-16">
        <div>
          <p className="flex items-center gap-2.5 text-xs uppercase tracking-[0.12em] text-[#585d5b]" style={mono}>
            <span className="h-2 w-2 rounded-full bg-[#f2542d]" />Clínicas, consultórios e negócios de serviço
          </p>
          <h1 className="mt-4 text-[clamp(2.9rem,7.4vw,7rem)] uppercase leading-[0.92]" style={display}>
            Entenda o que trava suas vendas <em className="normal-case text-[#f2542d]" style={serif}>antes</em> de investir.
          </h1>
          <p className="mt-6 max-w-[46ch] text-[clamp(1.05rem,1.45vw,1.25rem)] text-[#585d5b]">
            Seu negócio recebe contatos, mas nem todos viram agenda. O Diagnóstico Express descobre <strong className="font-semibold text-[#1d2022]">em que ponto o interesse perde força</strong>, do Instagram ao WhatsApp, e diz o que resolver primeiro.
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <BuyButton />
            <a href={whatsappUrl("Olá, tenho dúvidas sobre o Diagnóstico Express.")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-[2px] border border-[#1d2022] px-5 py-[15px] text-[15px] font-bold transition-colors hover:bg-[#1d2022] hover:text-[#f4f2ec]">
              Tirar dúvidas no WhatsApp
            </a>
          </div>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-[0.1em] text-[#585d5b]" style={mono}>
            {["Até 3 prioridades", "Revisão humana", EXPRESS_DEADLINE].map((f) => (
              <li key={f} className="flex items-center gap-2"><span className="h-[5px] w-[5px] bg-[#f2542d]" />{f}</li>
            ))}
          </ul>
        </div>

        <aside aria-label="Exemplo ilustrativo do que o diagnóstico entrega" className="flex flex-col gap-3.5 border-t-[3px] border-[#f2542d] bg-[#131517] p-5 text-[#eceae4]">
          <div className="flex justify-between text-xs uppercase tracking-[0.12em] text-[#a3a19a]" style={mono}><span>Diagnóstico Express</span><span>Exemplo</span></div>
          <h2 className="m-0 text-[17px] font-semibold">Onde o interesse perde força</h2>
          <ul className="m-0 list-none border-t border-white/12 p-0">
            {report.map((r) => (
              <li key={r.label} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-white/12 py-2.5 text-[14.5px]">
                {r.label}
                <span className={`border px-2 py-1 text-[10.5px] uppercase tracking-[0.08em] ${r.tone === "hot" ? "border-[#f2542d] text-[#ffb39f]" : "border-white/12 text-[#a3a19a]"}`} style={mono}>{r.status}</span>
              </li>
            ))}
          </ul>
          <p className="border-l-2 border-[#f2542d] pl-3 text-sm text-[#cfccc4]">Comece pela primeira resposta. É o que mais trava agora.</p>
          <span className="text-[10.5px] uppercase tracking-[0.08em] text-[#8f8d86]" style={mono}>Exemplo ilustrativo, não é dado de cliente</span>
        </aside>
      </section>

      {/* Cinco pontos (escuro) */}
      <section className="bg-[#131517] text-[#eceae4]">
        <div className="mx-auto max-w-[1240px] px-4 py-16 md:px-8 md:py-28">
          <ExpressSteps />
          <div className="mt-10 grid items-center gap-6 border border-white/12 bg-[#1b1e21] p-6 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-8">
            <div className="text-[60px] leading-none" style={display}><small className="mr-1.5 align-top text-xs tracking-[0.1em]" style={mono}>R$</small>197</div>
            <ul className="m-0 flex list-none flex-col gap-1 p-0 text-[14.5px] text-[#cfccc4]">
              <li>— Até 3 prioridades em ordem</li>
              <li>— Revisão humana · {EXPRESS_DEADLINE}</li>
              <li>— Sem dados de pacientes ou clientes</li>
            </ul>
            <BuyButton label="Quero o diagnóstico" />
          </div>
          <p className="mt-4 text-sm text-[#a3a19a]">
            Já sabe o que precisa? <Link href="/servicos" className="border-b border-white/20 text-[#eceae4] hover:border-[#f2542d]">Veja os serviços</Link> e peça uma proposta direta.
          </p>
        </div>
      </section>

      {/* Como funciona */}
      <section className="mx-auto max-w-[1240px] px-4 py-16 md:px-8 md:py-24">
        <span className="text-xs uppercase tracking-[0.12em] text-[#585d5b]" style={mono}>Como funciona</span>
        <h2 className="mt-3 text-[clamp(2.2rem,4.4vw,3.8rem)] uppercase leading-[0.95]" style={display}>
          Do pagamento à <em className="normal-case text-[#f2542d]" style={serif}>entrega</em>.
        </h2>
        <ol className="mt-10 grid list-none gap-px border border-[#1d2022]/15 bg-[#1d2022]/15 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {how.map((h) => (
            <li key={h.n} className="flex flex-col gap-2 bg-[#fbfaf6] p-6">
              <span className="text-[34px] leading-none text-[#f2542d]" style={display}>{h.n}</span>
              <h3 className="m-0 text-lg font-bold">{h.title}</h3>
              <p className="m-0 text-[15px] text-[#585d5b]">{h.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-[#585d5b]">
          Já pagou? <Link href="/diagnostico/formulario" className="font-semibold text-[#1d2022] underline underline-offset-4">Preencha o formulário do diagnóstico</Link>.
        </p>
      </section>

      {/* Para quem é */}
      <section className="border-t border-[#1d2022]/15">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-16 md:grid-cols-2 md:px-8 md:py-20">
          <div>
            <h2 className="text-2xl font-bold">É para você se</h2>
            <ul className="mt-4 flex list-none flex-col gap-2.5 p-0 text-[#585d5b]">
              <li>— recebe contatos e sente que muitos não viram cliente;</li>
              <li>— quer saber onde investir antes de pagar anúncio, site ou agência;</li>
              <li>— prefere uma ordem clara de prioridades a um pacote fechado.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold">O que ele não é</h2>
            <ul className="mt-4 flex list-none flex-col gap-2.5 p-0 text-[#585d5b]">
              <li>— não é auditoria de prontuário nem de dados de pacientes;</li>
              <li>— não é promessa de faturamento;</li>
              <li>— não obriga a contratar nada depois.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-[#131517] text-[#eceae4]">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-8 px-4 py-14 md:px-8 md:py-20">
          <h2 className="max-w-[16ch] text-[clamp(2rem,4vw,3.4rem)] uppercase leading-[0.95]" style={display}>
            Comece <em className="normal-case text-[#f2542d]" style={serif}>entendendo</em>. Depois decida.
          </h2>
          <BuyButton />
        </div>
        {!EXPRESS_HAS_PAYMENT_LINK && (
          <p className="mx-auto max-w-[1240px] px-4 pb-6 text-xs text-[#8f8d86] md:px-8">Pagamento pelo WhatsApp enquanto o link do Mercado Pago não está configurado.</p>
        )}
      </section>

      {/* Barra fixa no celular */}
      <div aria-hidden="true" className="h-20 md:hidden" />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#1d2022]/15 bg-[#f4f2ec]/95 px-4 pt-2.5 md:hidden" style={{ paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}>
        <BuyButton className="w-full" label={`Diagnóstico Express · ${EXPRESS_PRICE}`} />
      </div>
    </main>
  );
}
