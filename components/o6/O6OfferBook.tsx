"use client";

import { motion } from "framer-motion";

const elements = [
  {
    label: "ICP",
    title: "Perfil de Cliente Ideal",
    description:
      "Definimos com precisão o tipo de cliente que tem mais probabilidade de fechar, pagar e continuar. Faixa etária, localização, hábitos digitais, poder aquisitivo.",
  },
  {
    label: "Avatar",
    title: "Persona Detalhada",
    description:
      "Criamos o perfil psicológico do seu cliente. Nome, rotina, frustrações do dia a dia, como ele pesquisa antes de comprar e quais palavras o fazem agir.",
  },
  {
    label: "Psicografia",
    title: "O que Move a Decisão",
    description:
      "Mapeamos os valores, crenças e identidade do seu cliente ideal. Por que ele prefere uma clínica a outra? O que o faz sentir que está tomando a decisão certa?",
  },
  {
    label: "Medos",
    title: "O que Paralisa a Compra",
    description:
      "Quais são os riscos percebidos? Medo de se decepcionar, de pagar caro, de não ver resultado, de se expor. Seu sistema precisa endereçar cada um deles antes de pedir o fechamento.",
  },
  {
    label: "Desejos",
    title: "O que Ele Realmente Quer",
    description:
      "O paciente não quer 'tratamento de canal' — quer parar de sentir dor. A cliente não quer 'preenchimento labial' — quer se sentir bonita e confiante. Comunicamos o resultado, não o procedimento.",
  },
  {
    label: "Objeções",
    title: "Por que Ele Ainda Não Comprou",
    description:
      "'Está caro', 'preciso pensar', 'vou ver com meu marido'. Mapeamos cada objeção e construímos argumentos, provas e garantias que as neutralizam antes do fechamento.",
  },
  {
    label: "Oferta",
    title: "O que Você Vende e Como",
    description:
      "Estruturamos sua oferta com clareza irresistível: o que está incluído, qual o resultado esperado, qual a garantia, qual o preço e por que o valor justifica o investimento.",
  },
  {
    label: "Posicionamento",
    title: "Por que Você e Não o Concorrente",
    description:
      "Definimos a narrativa de diferenciação. Por que sua clínica ou escritório é a escolha óbvia para o perfil de cliente que você quer atender.",
  },
];

export default function O6OfferBook() {
  return (
    <section id="offer-book" className="w-full py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end mb-16">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-brand-orange block mb-4">
              Pilar 01 — Offer Book
            </span>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-brand-graphite leading-[0.92]">
              Antes de atrair,<br />é preciso saber<br />
              <span className="text-brand-orange">para quem</span><br />e com o quê.
            </h2>
          </div>
          <div>
            <p className="text-base text-brand-graphite/60 leading-relaxed">
              A maioria das clínicas e escritórios gasta dinheiro com marketing sem nunca ter definido com clareza o cliente que quer atrair, a oferta que vai vender e o posicionamento que vai diferenciá-los. O Offer Book é o alicerce de tudo o que vem depois.
            </p>
          </div>
        </div>

        {/* 8 element grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {elements.map((el, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="border-2 border-brand-graphite p-6 bg-brand-offwhite shadow-[3px_3px_0px_0px_#FF5722] flex flex-col gap-4"
            >
              <div className="inline-flex items-center gap-2">
                <span className="px-2 py-0.5 bg-brand-orange text-white text-[9px] font-black uppercase tracking-widest">
                  {el.label}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight text-brand-graphite mb-2">
                  {el.title}
                </h3>
                <p className="text-[12px] text-brand-graphite/60 leading-relaxed">
                  {el.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-12 p-8 bg-brand-graphite border-2 border-brand-graphite">
          <p className="text-sm text-white/70 leading-relaxed max-w-3xl">
            <strong className="text-white">O Offer Book não é um documento para enfeitar gaveta.</strong> É a base operacional que guia cada anúncio, cada mensagem de WhatsApp, cada landing page e cada abordagem de vendas. Sem ele, você está atirando no escuro.
          </p>
        </div>

      </div>
    </section>
  );
}
