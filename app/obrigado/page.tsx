"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { whatsappUrl } from "@/app/_lib/contato";

const display = { fontFamily: "var(--font-o6-display)" };
const serif = { fontFamily: "var(--font-o6-serif)" };
const mono = { fontFamily: "var(--font-o6-mono)" };

type Variant = {
  step: string;
  title: React.ReactNode;
  text: string;
  cta: { href: string; label: string; external?: boolean };
};

// tipo=pagamento: volta do Mercado Pago (configurar como URL de sucesso do link).
// tipo=express: formulário enviado.
const variants: Record<string, Variant> = {
  pagamento: {
    step: "Passo 1 de 3 concluído",
    title: <>Pagamento <em className="normal-case text-[#f2542d]" style={serif}>recebido</em>.</>,
    text: "Agora falta só o formulário. São uns 5 minutos para você contar sobre o negócio e o atendimento.",
    cta: { href: "/diagnostico/formulario", label: "Preencher o formulário" },
  },
  express: {
    step: "Passo 2 de 3 concluído",
    title: <>Recebemos suas <em className="normal-case text-[#f2542d]" style={serif}>respostas</em>.</>,
    text: "Agora analisamos sua presença e o que você contou. Em até 48h úteis você recebe pelo WhatsApp até 3 prioridades em ordem, revisadas por uma pessoa.",
    cta: { href: whatsappUrl("Olá, acabei de enviar o formulário do Diagnóstico Express."), label: "Falar com a O6 no WhatsApp", external: true },
  },
};

function Inner() {
  const tipo = useSearchParams().get("tipo") ?? "express";
  const v = variants[tipo] ?? variants.express;
  return (
    <section className="mx-auto flex min-h-screen max-w-[760px] flex-col justify-center gap-6 px-4 py-16 md:px-8">
      <span className="flex items-center gap-2.5 text-xs uppercase tracking-[0.12em] text-[#585d5b]" style={mono}>
        <span className="h-2 w-2 rounded-full bg-[#f2542d]" />{v.step}
      </span>
      <h1 className="text-[clamp(2.6rem,7vw,5rem)] uppercase leading-[0.92]" style={display}>{v.title}</h1>
      <p className="max-w-[52ch] text-lg text-[#585d5b]">{v.text}</p>
      <div className="flex flex-wrap gap-3">
        {v.cta.external ? (
          <a href={v.cta.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-5 rounded-[2px] bg-[#f2542d] px-5 py-4 text-[15px] font-bold text-[#170904]">{v.cta.label} <span aria-hidden="true">→</span></a>
        ) : (
          <Link href={v.cta.href} className="inline-flex items-center gap-5 rounded-[2px] bg-[#f2542d] px-5 py-4 text-[15px] font-bold text-[#170904]">{v.cta.label} <span aria-hidden="true">→</span></Link>
        )}
        <Link href="/portfolio/index.html" className="inline-flex items-center rounded-[2px] border border-[#1d2022] px-5 py-4 text-[15px] font-bold">Ver o portfólio</Link>
      </div>
      <p className="text-sm text-[#585d5b]">Não envie dados de pacientes ou clientes pelo WhatsApp.</p>
    </section>
  );
}

export default function ObrigadoPage() {
  return (
    <main className="min-h-screen bg-[#f4f2ec] text-[#1d2022]" style={{ fontFamily: "var(--font-o6-sans)" }}>
      <Suspense>
        <Inner />
      </Suspense>
    </main>
  );
}
