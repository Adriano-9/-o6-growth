"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

// As mesmas 5 frentes que o formulário pago avalia (app/_lib/diagnostico-express/fronts.ts), 5 perguntas cada.
const steps = [
  { n: "01", title: "Marca e posicionamento", text: "Público certo, diferencial claro e a mesma cara em site, Instagram e Google.", ask: "Quem nunca ouviu falar de você entende por que escolher você?" },
  { n: "02", title: "Oferta", text: "Serviços, valor e preço explicados, com um próximo passo simples.", ask: "O cliente sabe o que comprar e como começar?" },
  { n: "03", title: "Presença e busca", text: "Google, Perfil da Empresa, páginas por serviço, celular e respostas do ChatGPT.", ask: "Quem procura o que você faz encontra você?" },
  { n: "04", title: "Conteúdo e aquisição", text: "Rotina de postagem, conteúdo para quem ainda não segue e de onde vem cada contato.", ask: "Seu conteúdo traz cliente ou só curtida?" },
  { n: "05", title: "Conversão e reputação", text: "Resposta rápida, acompanhamento, avaliações e retomada de quem disse “vou pensar”.", ask: "Quanto tempo o contato espera e quem volta a falar com ele?" },
];

const display = { fontFamily: "var(--font-o6-display)" };
const serif = { fontFamily: "var(--font-o6-serif)" };
const mono = { fontFamily: "var(--font-o6-mono)" };

/** Coluna fixa com contador + cinco etapas que acendem ao entrar na tela. */
export function ExpressSteps() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  return (
    <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
      <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
        <span className="text-xs uppercase tracking-[0.12em] text-[#f2542d]" style={mono}>Diagnóstico Consultivo Express</span>
        <h2 className="text-[clamp(2.4rem,5vw,4.5rem)] uppercase leading-[0.94]" style={display}>
          Cinco frentes. Uma <em className="normal-case text-[#f2542d]" style={serif}>ordem</em> para agir.
        </h2>
        <div className="mt-2 hidden items-end gap-4 lg:flex" aria-hidden="true">
          <span className="text-[clamp(6rem,11vw,10.5rem)] leading-[0.8] text-[#f2542d] tabular-nums" style={display}>{steps[active].n}</span>
          <div>
            <div className="mb-1.5 text-xs uppercase tracking-[0.12em] text-[#a3a19a]" style={mono}>de 05</div>
            <div className="text-[2rem] italic leading-none" style={serif}>{steps[active].title}</div>
          </div>
        </div>
        <p className="max-w-[42ch] text-[#a3a19a]">
          São 25 perguntas rápidas, 5 por frente, mais o que é público sobre o seu negócio. Você recebe até três prioridades em ordem, revisadas por uma pessoa, antes de gastar com qualquer outra coisa.
        </p>
      </div>

      <ol className="m-0 list-none p-0">
        {steps.map((s, i) => (
          <motion.li
            key={s.n}
            className="grid grid-cols-[24px_minmax(0,1fr)] gap-5"
            initial={reduce ? false : { opacity: 0.45 }}
            whileInView={{ opacity: 1 }}
            viewport={{ amount: 0.6 }}
            onViewportEnter={() => setActive(i)}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col items-center">
              <span className={`mt-[30px] h-[11px] w-[11px] rounded-full border-[1.5px] ${i <= active ? "border-[#f2542d] bg-[#f2542d] shadow-[0_0_0_5px_rgba(242,84,45,0.18)]" : "border-white/35 bg-[#131517]"}`} />
              {i < steps.length - 1 && <span className={`w-px flex-1 ${i < active ? "bg-[#f2542d]" : "bg-white/12"}`} />}
            </div>
            <div className="border-b border-white/12 pb-6 pt-[22px]">
              <span className="text-xs uppercase tracking-[0.12em] text-[#a3a19a]" style={mono}>Frente {s.n}</span>
              <h3 className="mb-1.5 mt-1.5 text-[22px] font-semibold tracking-[-0.01em]">{s.title}</h3>
              <p className="m-0 max-w-[52ch] text-[#a3a19a]">{s.text}</p>
              <p className="mt-2.5 text-[19px] italic text-[#eceae4]" style={serif}>“{s.ask}”</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
