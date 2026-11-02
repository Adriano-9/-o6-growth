"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowDown, ArrowRight, BookOpen, Check, FileText, MessageSquareText, Scale } from "lucide-react";
import { createLead } from "@/app/crm/_lib/api";
import { emptyLeadInput } from "@/app/crm/_lib/types";
import { whatsappUrl } from "@/app/_lib/contato";
import { getAttribution } from "@/app/briefing/_lib/attribution";

const findings = {
  presenca: { title: "Presença e posicionamento", text: "A primeira revisão deve observar se a área de atuação, a localização e os canais de contato estão fáceis de identificar, com comunicação informativa e precisa.", action: "Revisar as páginas públicas pela ótica de quem procura orientação pela primeira vez." },
  triagem: { title: "Triagem do primeiro contato", text: "Seu ponto de atenção é a passagem entre a dúvida inicial e a avaliação por um profissional. Um processo claro ajuda a registrar o pedido sem antecipar aconselhamento jurídico.", action: "Definir quais informações administrativas podem ser solicitadas no primeiro contato." },
  propostas: { title: "Acompanhamento de propostas", text: "Quando a proposta é enviada, o próximo passo e o canal de retorno devem estar claros. O acompanhamento pode ser organizado com discrição e respeito à decisão do cliente.", action: "Verificar propostas sem retorno e os prazos de acompanhamento usados hoje." },
} as const;
type Finding = keyof typeof findings;

const heroImages = [
  { src: "/landing/advocacia-reuniao.png", alt: "Reunião de atendimento em escritório de advocacia" },
  { src: "/landing/advocacia-atendimento.png", alt: "Advogada ouvindo uma cliente em seu escritório" },
  { src: "/landing/advocacia-equipe.png", alt: "Equipe jurídica revisando documentos em conjunto" },
] as const;

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function AdvocaciaPage() {
  const pageRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const methodRef = useRef<HTMLElement>(null);
  const methodProgressRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [activeImage, setActiveImage] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [practice, setPractice] = useState("Direito de família");
  const [finding, setFinding] = useState<Finding>("presenca");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");

  useEffect(() => {
    if (reduced) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") setActiveImage((current) => (current + 1) % heroImages.length);
    }, 2500);
    return () => window.clearInterval(timer);
  }, [reduced]);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (heroImageRef.current && heroRef.current) {
      gsap.fromTo(heroImageRef.current, { yPercent: -5 }, {
        yPercent: 10,
        ease: "none",
        scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: 0.7 },
      });
    }

    if (methodProgressRef.current && methodRef.current) {
      gsap.fromTo(methodProgressRef.current, { scaleX: 0 }, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { trigger: methodRef.current, start: "top 78%", end: "bottom 32%", scrub: 0.5 },
      });
    }

    gsap.utils.toArray<HTMLElement>("section h2").forEach((element) => {
      gsap.fromTo(element, { autoAlpha: 0, y: 34 }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.85,
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
        nome: name.trim(), email: email.trim(), whatsapp: phone.trim(),
        nicho: `Advocacia · ${practice}`,
        origem: "site_o6_advocacia",
        notas: `Diagnóstico inicial LP advocacia. Área: ${practice}. Ponto declarado: ${findings[finding].title}. Origem: ${attribution.utm_source || "direto"}; mídia: ${attribution.utm_medium || "não informada"}; campanha: ${attribution.utm_campaign || "não informada"}; página: ${attribution.page}.`,
      });
      setStatus(lead ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  const insight = findings[finding];
  return (
    <main ref={pageRef} className="bg-[#e8e8e4] text-[#152132]">
      <section ref={heroRef} className="relative flex min-h-[650px] flex-col overflow-hidden bg-[#101b2b] text-white md:min-h-[min(770px,90svh)]">
        <div ref={heroImageRef} className="absolute -top-12 inset-x-0 -bottom-12 will-change-transform">
          {heroImages.map((item, index) => (
            <motion.div key={item.src} aria-hidden={index !== activeImage} initial={false} animate={{ opacity: index === activeImage ? 1 : 0, scale: index === activeImage ? 1 : 1.045 }} transition={{ opacity: { duration: reduced ? 0 : 0.9 }, scale: { duration: reduced ? 0 : 2.5 } }} className="absolute inset-0">
              <Image src={item.src} alt={index === activeImage ? item.alt : ""} fill priority={index === 0} sizes="100vw" className="object-cover object-[62%_center]" />
            </motion.div>
          ))}
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,17,30,.95)_0%,rgba(8,17,30,.78)_36%,rgba(8,17,30,.08)_100%)] md:bg-[linear-gradient(90deg,rgba(8,17,30,.95)_0%,rgba(8,17,30,.70)_32%,rgba(8,17,30,.02)_80%)]" />
        <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between border-b border-white/20 px-6 py-5 md:px-10"><Link href="/" className="text-sm font-black uppercase">O6 <span className="font-normal">Growth</span></Link><a href="#diagnostico" className="border-b border-[#cfb886] pb-1 text-xs font-bold uppercase text-[#eadbb9] transition hover:text-white">Solicitar análise <ArrowRight size={14} className="ml-1 inline" /></a></header>
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 pb-14 pt-16 md:px-10"><motion.div initial={reduced ? false : { opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .85 }} className="max-w-[850px]"><p className="mb-8 flex items-center gap-3 text-xs font-bold uppercase text-[#d3bd91]"><Scale size={19} /> Comunicação para escritórios de advocacia</p><h1 className="font-serif text-[clamp(3.15rem,6vw,6.2rem)] leading-[.98]">Novos clientes além da <em className="text-[#dcc69a]">indicação.</em></h1><p className="mt-8 max-w-[510px] text-lg leading-relaxed text-white/78">Torne sua atuação mais clara para quem procura um escritório. Organize a informação, o primeiro contato e o acompanhamento com critério.</p><a href="#diagnostico" className="mt-9 inline-flex items-center gap-3 border border-[#cbb381] bg-[#cbb381] px-6 py-4 text-sm font-bold text-[#101b2b] transition hover:bg-white hover:border-white">Analisar meu escritório <ArrowRight size={18} /></a></motion.div></div>
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-white/20 px-6 py-5 text-xs uppercase text-white/60 md:px-10"><div className="flex items-center gap-3"><span className="font-mono text-[#e2d1ad]">0{activeImage + 1} / 03</span><div className="flex gap-1.5" aria-label="Cenas do escritório">{heroImages.map((item, index) => <button key={item.src} type="button" aria-label={`Ver cena ${index + 1}`} aria-pressed={index === activeImage} onClick={() => setActiveImage(index)} className={`h-1 w-7 transition-colors ${index === activeImage ? "bg-[#d3bd91]" : "bg-white/35 hover:bg-white/70"}`} />)}</div></div><span className="hidden sm:inline">Respeito ao contexto profissional</span><a href="#metodo" className="inline-flex items-center gap-2 text-white">Conheça o método <ArrowDown size={15} /></a></div>
      </section>

      <section className="bg-[#e8e8e4] pb-20 pt-10 md:py-28"><div className="mx-auto grid max-w-7xl gap-12 px-6 md:px-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-20"><div><p className="text-xs font-bold uppercase text-[#8d6a36]">O primeiro contato importa</p><h2 className="mt-6 font-serif text-5xl leading-[1.05] md:text-7xl">Quando alguém precisa de orientação, o caminho deve ser claro.</h2></div><div className="border-t border-[#8e9699] pt-8 lg:mt-20"><p className="max-w-xl text-lg leading-relaxed text-[#4c5862]">Uma presença digital séria informa áreas de atuação, permite contato fácil e evita promessas. Ela ajuda a pessoa a entender se deve procurar seu escritório e como iniciar uma conversa.</p><div className="mt-10 grid gap-0 border-t border-[#aab0ae]"><div className="flex items-start gap-5 border-b border-[#aab0ae] py-5"><BookOpen className="shrink-0 text-[#8d6a36]" /><p>Conteúdo claro sobre áreas e formas de atuação</p></div><div className="flex items-start gap-5 border-b border-[#aab0ae] py-5"><MessageSquareText className="shrink-0 text-[#8d6a36]" /><p>Contato organizado e linguagem respeitosa</p></div><div className="flex items-start gap-5 border-b border-[#aab0ae] py-5"><FileText className="shrink-0 text-[#8d6a36]" /><p>Próximo passo definido após cada conversa</p></div></div></div></div></section>

      <section id="metodo" ref={methodRef} className="bg-[linear-gradient(125deg,#101b2b_0%,#172536_58%,#344358_100%)] py-20 text-white md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div><p className="text-xs font-bold uppercase text-[#d3bd91]">Arquitetura de confiança</p><h2 className="mt-5 max-w-2xl font-serif text-5xl md:text-7xl">Da busca à conversa.</h2></div>
            <p className="max-w-sm leading-relaxed text-white/65">Três pontos para observar na presença do escritório. O trabalho é definido depois da análise do contexto.</p>
          </div>
          <div className="mt-14 h-px bg-white/25"><div ref={methodProgressRef} className="h-px origin-left bg-[#d3bd91]" /></div>
          <div className="grid md:grid-cols-3">
            {[
              {n:"01",title:"Ser encontrado",text:"Informações consistentes sobre o escritório, as áreas e os canais oficiais."},
              {n:"02",title:"Ser compreendido",text:"Conteúdo que explica a atuação em linguagem acessível, sem prometer desfechos."},
              {n:"03",title:"Ser procurado",text:"Formas simples de iniciar o contato e uma rotina de resposta bem definida."},
            ].map((step,i)=><motion.div key={step.n} initial={reduced ? false : { opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .3 }} transition={{ delay: i * .12 }} className="border-b border-white/25 py-8 md:min-h-72 md:border-r md:px-7 md:first:pl-0 md:last:border-r-0"><span className="font-mono text-xs text-[#d3bd91]">{step.n} / 03</span><h3 className="mt-10 font-serif text-3xl">{step.title}</h3><p className="mt-4 max-w-xs leading-relaxed text-white/60">{step.text}</p></motion.div>)}
          </div>
        </div>
      </section>

      <section className="bg-[#d3d9da] py-20 md:py-28"><div className="mx-auto grid max-w-7xl gap-12 px-6 md:px-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><p className="text-xs font-bold uppercase text-[#8d6a36]">Uma leitura objetiva</p><h2 className="mt-5 font-serif text-5xl md:text-6xl">O que avaliar primeiro?</h2><p className="mt-6 leading-relaxed text-[#4c5862]">Um diagnóstico começa pelo que o visitante consegue entender e pelo que acontece quando decide entrar em contato.</p></div><motion.div initial={reduced ? false : { opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="border border-[#a8b2b3] bg-white/60 p-7 shadow-[0_22px_50px_rgba(17,33,49,.09)] backdrop-blur-md md:p-10"><div className="flex justify-between border-b border-[#b8c1c0] pb-5 text-xs font-bold uppercase"><span>Roteiro de revisão</span><span className="text-[#8d6a36]">01—03</span></div>{["A área de atuação está evidente?","O contato é fácil e discreto?","Existe uma rotina após a primeira conversa?"].map((question,i)=><div key={question} className="flex items-start gap-5 border-b border-[#c7cecc] py-5 last:border-b-0"><span className="font-mono text-xs text-[#8d6a36]">0{i+1}</span><p className="text-lg">{question}</p><Check size={18} className="ml-auto shrink-0 text-[#8d6a36]" /></div>)}<p className="pt-4 text-xs text-[#647178]">Perguntas orientadoras; nenhuma pontuação é presumida sem dados.</p></motion.div></div></section>

      <section id="diagnostico" className="bg-[#f2f2ef] py-20 md:py-28"><div className="mx-auto grid max-w-7xl gap-12 px-6 md:px-10 lg:grid-cols-[.85fr_1.15fr] lg:gap-24"><div><p className="text-xs font-bold uppercase text-[#8d6a36]">Diagnóstico inicial gratuito</p><h2 className="mt-6 font-serif text-5xl leading-tight md:text-6xl">Uma leitura para o seu escritório.</h2><p className="mt-6 max-w-md leading-relaxed text-[#4c5862]">Conte qual parte da presença ou do atendimento precisa de atenção. Você recebe uma orientação inicial e escolhe o próximo passo.</p><div className="mt-10 h-px w-20 bg-[#8d6a36]" /><p className="mt-5 max-w-sm text-sm leading-relaxed text-[#647178]">Não inclua informações sigilosas de clientes, detalhes de casos ou documentos neste formulário.</p></div><div className="border-t-2 border-[#8d6a36] bg-white p-6 shadow-[0_20px_45px_rgba(16,27,43,.07)] md:p-9">{status === "done" ? <div aria-live="polite"><p className="text-xs font-bold uppercase text-[#8d6a36]">Sua leitura inicial</p><h3 className="mt-4 font-serif text-4xl">{insight.title}</h3><p className="mt-6 leading-relaxed text-[#4c5862]">{insight.text}</p><div className="mt-8 border-l-2 border-[#8d6a36] pl-5"><p className="text-xs font-bold uppercase">Primeiro passo</p><p className="mt-2 text-sm leading-relaxed text-[#4c5862]">{insight.action}</p></div><p className="mt-7 text-xs leading-relaxed text-[#647178]">Leitura baseada na prioridade declarada, sem análise de casos ou garantia de resultado. A avaliação completa depende de conversa e dados adicionais.</p><div className="mt-8 grid gap-3 sm:grid-cols-2"><a href="/produto/diagnostico" className="inline-flex items-center justify-center gap-2 bg-[#172536] px-4 py-3 text-center text-sm font-semibold text-white">Diagnóstico Express <ArrowRight size={16} /></a><a href={whatsappUrl("Quero conversar sobre a presença digital do meu escritório")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 border border-[#172536] px-4 py-3 text-center text-sm font-semibold">Agendar conversa <ArrowRight size={16} /></a></div><Link href="/servicos" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4">Ver serviços <ArrowRight size={15} /></Link></div> : <form onSubmit={submit} className="space-y-5"><p className="text-xs font-bold uppercase text-[#8d6a36]">Solicitar leitura inicial</p><label className="block text-sm font-semibold">Seu nome<input required value={name} onChange={e=>setName(e.target.value)} className="mt-2 w-full border border-[#b8c1c0] bg-[#fafaf9] p-3 outline-none focus:border-[#8d6a36]" /></label><div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-semibold">E-mail<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full border border-[#b8c1c0] bg-[#fafaf9] p-3 outline-none focus:border-[#8d6a36]" /></label><label className="block text-sm font-semibold">WhatsApp<input required type="tel" value={phone} onChange={e=>setPhone(e.target.value)} className="mt-2 w-full border border-[#b8c1c0] bg-[#fafaf9] p-3 outline-none focus:border-[#8d6a36]" /></label></div><label className="block text-sm font-semibold">Área principal<select value={practice} onChange={e=>setPractice(e.target.value)} className="mt-2 w-full border border-[#b8c1c0] bg-[#fafaf9] p-3"><option>Direito de família</option><option>Direito trabalhista</option><option>Direito empresarial</option><option>Direito civil</option><option>Outra área</option></select></label><label className="block text-sm font-semibold">O que precisa de atenção?<select value={finding} onChange={e=>setFinding(e.target.value as Finding)} className="mt-2 w-full border border-[#b8c1c0] bg-[#fafaf9] p-3"><option value="presenca">Presença e posicionamento</option><option value="triagem">Triagem do primeiro contato</option><option value="propostas">Acompanhamento de propostas</option></select></label>{status === "error" && <p role="alert" className="text-sm text-red-700">Não conseguimos registrar seus dados. Tente novamente ou entre em contato pelo WhatsApp.</p>}<button disabled={status === "saving"} className="flex w-full items-center justify-center gap-2 bg-[#172536] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#2a4058] disabled:opacity-60">{status === "saving" ? "Preparando leitura..." : "Receber leitura gratuita"}<ArrowRight size={17} /></button><p className="text-xs leading-relaxed text-[#647178]">Usaremos seus dados para retornar sobre a análise. Não envie dados de clientes.</p></form>}</div></div></section>
      <footer className="bg-[#101b2b] px-6 py-8 text-xs text-white/60"><div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4"><span>O6 Growth · Advocacia</span><a href="/portfolio/index.html">Ver portfólio</a></div></footer>
    </main>
  );
}
