"use client";

import { FormEvent, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowDown, ArrowRight, CalendarCheck, Clock3, MessageCircle, PhoneCall, Stethoscope } from "lucide-react";
import { createLead } from "@/app/crm/_lib/api";
import { emptyLeadInput } from "@/app/crm/_lib/types";
import { whatsappUrl } from "@/app/_lib/contato";
import { getAttribution } from "@/app/briefing/_lib/attribution";

const stages = [
  { icon: MessageCircle, title: "Primeiro contato", detail: "Quem procura sua clínica encontra uma resposta clara e um caminho para agendar." },
  { icon: PhoneCall, title: "Atendimento", detail: "A equipe sabe quem retornou, o que foi perguntado e quem precisa de atenção." },
  { icon: CalendarCheck, title: "Agendamento", detail: "Confirmações e retornos ganham uma rotina que cabe na operação." },
];

const concerns = {
  resposta: { title: "Tempo de resposta", text: "Vale medir quanto tempo passa entre o primeiro contato e a resposta da recepção, inclusive fora do horário comercial.", action: "Registrar horários de chegada e resposta por uma semana." },
  agenda: { title: "Agendamento e confirmação", text: "A etapa entre a conversa e a consulta pode estar criando atrito. Verifique como o paciente escolhe horário e recebe confirmação.", action: "Mapear quantos contatos avançam para horário marcado." },
  retorno: { title: "Retorno após orçamento", text: "Uma conversa que termina com um orçamento precisa ter próximo passo definido, com acompanhamento respeitoso e consentido.", action: "Revisar orçamentos pendentes e a rotina de retorno." },
} as const;

type Concern = keyof typeof concerns;

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function SaudePage() {
  const pageRef = useRef<HTMLElement>(null);
  const journeyRef = useRef<HTMLElement>(null);
  const journeyLineRef = useRef<HTMLDivElement>(null);
  const consultImageRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const imageY = useTransform(scrollYProgress, [0, 0.35], [0, 90]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("Odontologia");
  const [concern, setConcern] = useState<Concern>("resposta");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.fromTo("[data-health-word]", { autoAlpha: 0, yPercent: 55 }, {
      autoAlpha: 1,
      yPercent: 0,
      duration: 0.85,
      stagger: 0.075,
      ease: "power3.out",
      delay: 0.15,
    });

    if (journeyLineRef.current && journeyRef.current) {
      gsap.fromTo(journeyLineRef.current, { scaleY: 0 }, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: { trigger: journeyRef.current, start: "top 72%", end: "bottom 38%", scrub: 0.6 },
      });
    }

    if (consultImageRef.current) {
      gsap.fromTo(consultImageRef.current, { yPercent: -7 }, {
        yPercent: 7,
        ease: "none",
        scrollTrigger: { trigger: consultImageRef.current.parentElement, start: "top bottom", end: "bottom top", scrub: 0.8 },
      });
    }

    gsap.utils.toArray<HTMLElement>("[data-health-reveal]").forEach((element) => {
      gsap.fromTo(element, { autoAlpha: 0, y: 28 }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: element, start: "top 88%", once: true },
      });
    });
  }, { scope: pageRef });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    const attribution = getAttribution();
    try {
      const lead = await createLead({
        ...emptyLeadInput("Novo Lead"),
        nome: name.trim(),
        whatsapp: phone.trim(),
        nicho: specialty,
        cidade: "Salvador",
        origem: "site_o6_saude",
        notas: `Diagnóstico inicial LP saúde. Especialidade: ${specialty}. Gargalo declarado: ${concerns[concern].title}. Origem: ${attribution.utm_source || "direto"}; mídia: ${attribution.utm_medium || "não informada"}; campanha: ${attribution.utm_campaign || "não informada"}; página: ${attribution.page}.`,
      });
      setStatus(lead ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  const insight = concerns[concern];

  return (
    <main ref={pageRef} className="bg-[#f5f8f5] text-[#17382f]">
      <section className="relative flex min-h-[650px] flex-col overflow-hidden bg-[#17382f] text-white md:min-h-[min(740px,88svh)]">
        <motion.div style={reduced ? undefined : { y: imageY }} className="absolute -top-12 inset-x-0 -bottom-12">
          <Image src="/landing/saude-recepcao.png" alt="Paciente conversando com a recepção de uma clínica" fill priority sizes="100vw" className="object-cover object-[64%_center]" />
        </motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,41,33,.94)_0%,rgba(12,41,33,.77)_36%,rgba(12,41,33,.14)_100%)] md:bg-[linear-gradient(90deg,rgba(12,41,33,.96)_0%,rgba(12,41,33,.80)_32%,rgba(12,41,33,.03)_75%)]" />
        <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 md:px-10">
          <Link href="/" className="text-sm font-black uppercase">O6 <span className="font-normal">Growth</span></Link>
          <a href="#diagnostico" className="border border-white/60 px-4 py-2 text-xs font-bold uppercase transition hover:bg-white hover:text-[#17382f]">Diagnóstico gratuito</a>
        </header>
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 pb-12 pt-8 md:px-10">
          <div className="max-w-[760px]">
            <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase text-[#a9dfb7]"><Stethoscope size={17} /> Para clínicas e consultórios</div>
            <h1 aria-label="Sua agenda cheia de pacientes particulares." className="max-w-[760px] text-[clamp(3rem,4.7vw,4.8rem)] font-semibold leading-[1.02]">
              {"Sua agenda cheia de pacientes particulares.".split(" ").map((word, index) => (
                <span key={`${word}-${index}`} aria-hidden="true" data-health-word className={`mr-[.24em] inline-block will-change-transform ${index >= 4 ? "text-[#c8edcc]" : ""}`}>{word}</span>
              ))}
            </h1>
            <motion.p initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .75, delay: .55 }} className="mt-5 max-w-[490px] text-lg leading-relaxed text-white/85">Organize o caminho entre o primeiro contato, o atendimento da recepção e o agendamento. Cada paciente merece uma resposta clara.</motion.p>
            <motion.div initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .75, delay: .7 }} className="mt-7 flex flex-wrap gap-3"><a href="#diagnostico" className="group inline-flex min-h-14 items-center gap-4 border border-[#d9f5d2] bg-[linear-gradient(110deg,#e2f7ad_0%,#a9ead2_100%)] px-5 py-3 text-sm font-bold text-[#15392e] shadow-[0_14px_36px_rgba(174,241,182,.28)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(174,241,182,.4)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Receber diagnóstico gratuito <span className="grid h-8 w-8 shrink-0 place-items-center bg-[#17382f] text-white transition-transform duration-300 group-hover:translate-x-1"><ArrowRight size={17} /></span></a><a href="#jornada" className="inline-flex items-center gap-2 border border-white/50 px-6 py-4 text-sm font-semibold transition hover:bg-white/15">Ver a jornada <ArrowDown size={17} /></a></motion.div>
          </div>
        </div>
        <div className="relative z-10 border-t border-white/20 bg-[#12362c]/70 backdrop-blur-md"><div className="mx-auto flex max-w-7xl flex-wrap gap-x-10 gap-y-2 px-6 py-4 text-xs font-semibold text-white/75 md:px-10"><span>01 / Receber</span><span>02 / Responder</span><span>03 / Confirmar</span></div></div>
      </section>

      <section id="jornada" ref={journeyRef} className="mx-auto max-w-7xl px-6 pb-20 pt-10 md:px-10 md:py-28">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
          <motion.div initial={reduced ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="text-xs font-bold uppercase text-[#176b59]">A jornada do paciente</p><h2 className="mt-5 text-4xl font-semibold leading-tight md:text-6xl">Onde a conversa pode parar?</h2><p className="mt-6 max-w-md text-base leading-relaxed text-[#46675b]">O contato pode vir do Google, de uma indicação ou de uma campanha. O que acontece depois precisa ser visível para sua equipe.</p></motion.div>
          <div className="relative border-l border-[#8ebbad] pl-6 md:pl-10">
            <div ref={journeyLineRef} aria-hidden="true" className="absolute -left-px top-0 h-full w-[2px] origin-top bg-[#176b59]" />
            {stages.map((step, i) => <motion.div key={step.title} initial={reduced ? false : { opacity: 0, x: 22 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: .4 }} transition={{ delay: i * .12 }} className="relative border-b border-[#cbdcd2] py-7 first:pt-0 last:border-b-0"><span className="absolute -left-[30px] top-8 h-2 w-2 rounded-full bg-[#176b59] md:-left-[46px]" /><div className="flex items-start gap-5"><step.icon className="mt-1 shrink-0 text-[#176b59]" size={26} /><div><span className="text-xs font-bold text-[#78978c]">0{i + 1}</span><h3 className="mt-1 text-2xl font-semibold">{step.title}</h3><p className="mt-2 max-w-lg leading-relaxed text-[#46675b]">{step.detail}</p></div></div></motion.div>)}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-[linear-gradient(135deg,#e9f4e9_0%,#f6f7ee_52%,#e2efe9_100%)]">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-2 lg:items-center">
          <div className="relative min-h-[360px] overflow-hidden lg:min-h-[580px]">
            <div ref={consultImageRef} className="absolute -inset-y-12 inset-x-0 will-change-transform">
              <Image src="/landing/saude-consulta.png" alt="Médica ouvindo uma paciente durante consulta" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover object-center" />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(14,55,43,.44),transparent_44%)]" />
            <div className="absolute bottom-6 left-6 border-l-2 border-[#c5e9ce] pl-4 text-xs font-bold uppercase text-white md:bottom-9 md:left-10">A experiência começa no primeiro contato</div>
          </div>
          <div data-health-reveal className="px-6 py-16 md:px-10 lg:px-16 lg:py-20">
            <p className="text-xs font-bold uppercase text-[#b45f47]">Da mensagem à consulta</p>
            <h2 className="mt-5 max-w-xl text-4xl font-semibold leading-tight md:text-5xl">O cuidado também aparece na forma de atender.</h2>
            <p className="mt-6 max-w-lg leading-relaxed text-[#46675b]">Para quem procura uma clínica particular, clareza e continuidade importam: saber o que fazer, receber resposta e não precisar repetir a própria história a cada etapa.</p>
            <div className="mt-10 grid gap-4 border-t border-[#9fbba8] pt-6 text-sm font-semibold text-[#245747] sm:grid-cols-2"><span>Resposta com contexto</span><span>Próximo passo definido</span></div>
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(120deg,#dcebe0_0%,#eef7ef_52%,#d9eee9_100%)] py-20 md:py-28"><div className="mx-auto grid max-w-7xl gap-12 px-6 md:px-10 lg:grid-cols-2 lg:items-center"><div data-health-reveal><p className="text-xs font-bold uppercase text-[#176b59]">Visibilidade para decidir</p><h2 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">Acompanhe o percurso, não só a agenda.</h2><p className="mt-6 max-w-lg leading-relaxed text-[#46675b]">Um painel útil começa com perguntas simples: de onde vieram os contatos, quem recebeu resposta e quantos chegaram a um horário confirmado.</p></div><motion.div initial={reduced ? false : { opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="border border-[#89b69d] bg-white/55 p-6 shadow-[0_24px_50px_rgba(19,76,54,.09)] backdrop-blur-md md:p-9"><div className="flex items-center justify-between border-b border-[#a9c7b2] pb-4 text-xs font-bold uppercase"><span>Mapa do atendimento</span><span>Exemplo ilustrativo</span></div>{[{label:"Contatos recebidos",width:"100%"},{label:"Contatos respondidos",width:"74%"},{label:"Consultas confirmadas",width:"46%"}].map(row=><div key={row.label} className="mt-7"><div className="mb-2 flex justify-between text-sm"><span>{row.label}</span><span className="font-mono text-[#46675b]">{row.width}</span></div><div className="h-2 bg-[#cadfd0]"><motion.div initial={{ width: 0 }} whileInView={{ width: row.width }} viewport={{ once: true }} transition={{ duration: .8 }} className="h-full bg-[linear-gradient(90deg,#176b59,#42b39b)]" /></div></div>)}<p className="mt-7 text-xs text-[#46675b]">Os valores acima demonstram a leitura visual. Seu diagnóstico usa seus próprios dados.</p></motion.div></div></section>

      <section id="diagnostico" className="bg-[linear-gradient(135deg,#102e29_0%,#176b59_60%,#2d8172_100%)] py-20 text-white md:py-28"><div className="mx-auto grid max-w-7xl gap-12 px-6 md:px-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-20"><div><p className="text-xs font-bold uppercase text-[#b5e0b7]">Diagnóstico inicial gratuito</p><h2 className="mt-5 text-4xl font-semibold leading-tight md:text-6xl">Onde sua clínica precisa olhar primeiro?</h2><p className="mt-6 max-w-md leading-relaxed text-white/75">Selecione o ponto que mais preocupa a equipe. Você recebe uma primeira leitura na hora e pode seguir para uma análise mais completa.</p><div className="mt-10 flex items-center gap-3 border-t border-white/20 pt-6 text-sm text-white/65"><Clock3 size={20} /> Preenchimento em cerca de 1 minuto</div></div>
        <div className="bg-[#f6faf7] p-6 text-[#17382f] md:p-9">
          {status === "done" ? <div aria-live="polite"><p className="text-xs font-bold uppercase text-[#176b59]">Leitura inicial</p><h3 className="mt-4 text-3xl font-semibold">{insight.title}</h3><p className="mt-5 leading-relaxed">{insight.text}</p><div className="mt-7 border-l-2 border-[#176b59] pl-5"><p className="text-xs font-bold uppercase">Primeiro passo</p><p className="mt-2 text-sm leading-relaxed">{insight.action}</p></div><p className="mt-6 text-xs leading-relaxed text-[#597467]">Leitura baseada no problema que você declarou. Não mede resultados nem substitui a análise da operação.</p><div className="mt-8 grid gap-3 sm:grid-cols-2"><a href="/produto/diagnostico" className="flex items-center justify-center gap-2 bg-[#176b59] px-4 py-3 text-center text-sm font-bold text-white">Diagnóstico Express <ArrowRight size={16} /></a><a href={whatsappUrl("Quero conversar sobre o atendimento da minha clínica")} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 border border-[#176b59] px-4 py-3 text-center text-sm font-bold">Agendar conversa <ArrowRight size={16} /></a></div><Link href="/servicos" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4">Explorar serviços <ArrowRight size={15} /></Link></div> : <form onSubmit={submit} className="space-y-5"><div><p className="text-xs font-bold uppercase text-[#176b59]">Comece por aqui</p><h3 className="mt-2 text-2xl font-semibold">Conte sobre sua operação</h3></div><label className="block text-sm font-semibold">Seu nome<input required value={name} onChange={e=>setName(e.target.value)} className="mt-2 w-full border border-[#b9d1c1] bg-white p-3 outline-none focus:border-[#176b59]" /></label><label className="block text-sm font-semibold">WhatsApp<input required type="tel" value={phone} onChange={e=>setPhone(e.target.value)} className="mt-2 w-full border border-[#b9d1c1] bg-white p-3 outline-none focus:border-[#176b59]" placeholder="(71) 99999-9999" /></label><label className="block text-sm font-semibold">Especialidade<select value={specialty} onChange={e=>setSpecialty(e.target.value)} className="mt-2 w-full border border-[#b9d1c1] bg-white p-3"><option>Odontologia</option><option>Clínica médica</option><option>Estética</option><option>Fisioterapia</option><option>Outra especialidade</option></select></label><label className="block text-sm font-semibold">Qual etapa mais precisa de atenção?<select value={concern} onChange={e=>setConcern(e.target.value as Concern)} className="mt-2 w-full border border-[#b9d1c1] bg-white p-3"><option value="resposta">Resposta aos novos contatos</option><option value="agenda">Agendamento e confirmação</option><option value="retorno">Retorno após orçamento</option></select></label>{status === "error" && <p role="alert" className="text-sm text-red-700">Não conseguimos registrar seus dados. Tente novamente ou fale conosco pelo WhatsApp.</p>}<button disabled={status === "saving"} className="flex w-full items-center justify-center gap-2 bg-[#176b59] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#0e5142] disabled:opacity-60">{status === "saving" ? "Preparando leitura..." : "Receber diagnóstico gratuito"}<ArrowRight size={17} /></button><p className="text-xs leading-relaxed text-[#597467]">Usaremos seus dados para entrar em contato sobre a análise. Não envie dados de pacientes.</p></form>}
        </div></div></section>
      <footer className="bg-[#102d25] px-6 py-8 text-xs text-white/60"><div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4"><span>O6 Growth · Saúde</span><a href="/portfolio/index.html">Ver portfólio</a></div></footer>
    </main>
  );
}
