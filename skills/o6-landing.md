---
name: o6-landing
description: Construir landing pages de alta conversão para os verticais O6 (Clínicas, Estética, Odonto, Fisio, Advogados). Segue a sequência canônica de 7 seções (Hero → Proof → Oferta → ROI → Cases → FAQ → CTA) com design Dark Glassmorphism + Bento Grid + Framer Motion. Invocar quando o usuário pede "criar landing page", "construir página de conversão", "montar página de captura" ou "fazer LP pra [cliente/produto]".
trigger: /o6-landing
---

# O6 Landing — skill canônica

Constrói landing pages de alta conversão do zero. A sequência de 7 seções é **obrigatória e não-negociável** — cada bloco tem função específica no funil: Hero fixa atenção, Proof elimina ceticismo, Oferta resolve o problema, ROI justifica o investimento, Cases provam resultado, FAQ corta objeções, CTA fecha. Tirar ou inverter seções reduz conversão.

Antes de qualquer coisa, ler:
- [`CLAUDE.md`](../CLAUDE.md) — regras de stack, design system, não-objetivos
- [`memory/o6.md`](../memory/o6.md) — tokens de cor, tipografia, pilares de design

---

## Pré-flight (sempre, em ordem)

1. **Coletar do usuário** (ou pedir):
   - Vertical (Clínica, Estética, Odonto, Fisio, Advogado, outro)
   - Produto / serviço exato e ticket médio
   - Público-alvo (persona — ex: mulher 28-45, profissional liberal, SP capital)
   - Transformação principal prometida (resultado em 1 frase)
   - 1-3 provas disponíveis (depoimento real, número de atendimentos, prêmio, review Google)
   - CTA principal (WhatsApp, formulário, agendamento online, outro)
   - Paleta: **dark** (padrão OS, `bg-zinc-950`) ou light (`bg-brand-offwhite`) — default **dark**
2. **Definir rota**: a LP vai em `app/[slug]/page.tsx` + `app/[slug]/layout.tsx` isolada. Não herdar sidebar do Offer Book nem topbar do CRM. Nav próprio e simples.
3. **Criar arquivo de componente por seção**: cada seção vive em `app/[slug]/_sections/NomeSection.tsx` — nunca tudo em `page.tsx`.

---

## Estrutura de arquivos

```
app/[slug]/
  layout.tsx            metadata (title, description, OG) + body wrapper
  page.tsx              import + ordenação das 7 seções
  _sections/
    HeroSection.tsx
    ProofSection.tsx
    OfertaSection.tsx
    ROISection.tsx
    CasesSection.tsx
    FAQSection.tsx
    CTASection.tsx
  _components/
    NavBar.tsx           sticky nav minimalista
    CTAButton.tsx        botão primário reutilizável
```

Exceção: se for um experimento rápido de uma única seção, componente inline em `page.tsx` é OK.

---

## Fluxo canônico (7 seções)

### 1. Hero · `HeroSection.tsx`

**Função**: capturar atenção em 3 segundos e entregar a promessa central.

**Estrutura obrigatória:**
```
[Tag de contexto — micro-label]
[H1 — Promessa em 1 frase, ≤ 10 palavras, outcome específico]
[Subheadline — amplificação da promessa + para quem, ≤ 20 palavras]
[Proof chips — 2-3 sinais de credibilidade em linha]
[CTA primário] [CTA secundário (opcional)]
[Visual hero — bento com métricas animadas OU foto de resultado]
```

**Copy rules:**
- H1 fala de resultado, não de serviço. "Sorriso refazido em 90 dias" > "Clínica odontológica de excelência"
- Subheadline nomeia o ICP explicitamente. "Para quem quer X sem Y"
- Proof chips são factuais: `+1.200 pacientes` · `4,9★ no Google` · `12 anos de clínica`

**Framer Motion:**
```tsx
// Entrada escalonada por elemento
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0, 0, 1] } } }

<motion.div variants={container} initial="hidden" animate="show">
  <motion.span variants={item}>{/* tag */}</motion.span>
  <motion.h1 variants={item}>{/* headline */}</motion.h1>
  ...
</motion.div>
```

**Tailwind classes canônicas (dark):**
```
section: relative min-h-[90vh] bg-zinc-950 overflow-hidden flex items-center
H1: text-5xl md:text-7xl font-black uppercase tracking-tight text-white leading-none
Subheadline: text-lg text-zinc-300 max-w-xl leading-relaxed
Proof chip: inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-zinc-300
```

**Bento Visual (lado direito):**
- Grid 2×2 de cards com `bg-zinc-900/40 backdrop-blur border border-white/10 rounded-2xl p-5`
- Cards exibem métricas animadas via `framer-motion` counter (`useMotionValue` + `useTransform`)
- Ex.: card de `+1200 pacientes atendidos`, `98% satisfação`, `R$0 de custo oculto`

**Done quando**: H1 não cita o nome da empresa, fala de resultado, e CTA está visível sem scroll em mobile (375px).

---

### 2. Proof · `ProofSection.tsx`

**Função**: eliminar ceticismo antes de apresentar a oferta.

**Estrutura:**
```
[Título de seção — "Por que confiar?" OU números agregados]
[Bento grid de 3-4 prova cards]
[Logo strip de parceiros / certificações (se houver)]
```

**Tipos de prova (usar pelo menos 2 de tipos diferentes):**

| Tipo | Exemplo | Força |
|---|---|---|
| Numérica | +1.200 pacientes atendidos desde 2012 | Alta |
| Estrela | 4,9★ · 312 avaliações Google | Alta |
| Certificação | CRO-SP 12345 · CFO registrado | Média |
| Mídia | "Como visto em" Jornal / Podcast | Média |
| Social | Comunidade de 38k no Instagram | Baixa |

**Bento grid:**
```tsx
// Card de prova — clicável se URL disponível
<div className="rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur p-6 hover:border-brand-cyan/30 transition-colors">
  <div className="text-4xl font-black text-white tabular-nums">{value}</div>
  <div className="mt-1 text-sm text-zinc-400">{label}</div>
</div>
```

**Framer Motion**: `whileInView` com `once: true` + `viewport: { amount: 0.3 }` — não animar no load, animar quando o elemento entra na viewport.

**Done quando**: ≥ 2 tipos de prova diferentes, nenhum inventado (evidência real ou suprimir).

---

### 3. Oferta · `OfertaSection.tsx`

**Função**: resolver o problema do ICP com clareza cirúrgica — o que é, por que funciona, o que acontece se não fizer.

**Estrutura:**
```
[Headline — "O problema que você está ignorando"]
[Problema ampliado — 2-3 bullets de dor real do ICP]
[Solução — como o produto/serviço resolve de forma única]
[Mecanismo — o "por quê funciona" em linguagem simples]
[Stack de entregáveis — o que está incluso no sim]
[Garantia — remover risco de decisão]
```

**Stack de entregáveis (Bento):**
```tsx
// Grid 2 cols, cards numerados
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {items.map((item, i) => (
    <div key={i} className="rounded-2xl border border-white/10 bg-zinc-900/40 p-5">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-cyan">0{i+1}</span>
      <h3 className="mt-2 font-bold text-white">{item.title}</h3>
      <p className="mt-1 text-sm text-zinc-400">{item.desc}</p>
    </div>
  ))}
</div>
```

**Garantia (sempre incluir):**
```tsx
<div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.04] p-5 flex items-start gap-4">
  <Shield className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
  <div>
    <div className="font-bold text-white">Garantia de {prazo}</div>
    <p className="text-sm text-zinc-400">{termos}</p>
  </div>
</div>
```

**Done quando**: mecanismo único nomeado (não "tratamento avançado"), garantia explícita, lista de entregáveis ≥ 3 items.

---

### 4. ROI · `ROISection.tsx`

**Função**: transformar preço em investimento via cálculo concreto.

**Estrutura:**
```
[Headline — "Quanto custa não resolver?"]
[Calculadora visual — 3 cards: Custo do Problema, Custo da Solução, Retorno]
[Linha do tempo de resultado — quando o cliente vê diferença]
```

**3 cards ROI (Bento):**
```tsx
const cards = [
  { label: "Custo do problema por mês",  value: custoProblema,  color: "red",     icon: TrendingDown },
  { label: "Investimento na solução",    value: custoSolucao,   color: "zinc",    icon: DollarSign  },
  { label: "Retorno esperado em X meses", value: retorno,       color: "emerald", icon: TrendingUp  },
];
```

- Valores em `BRL.format()` (`new Intl.NumberFormat("pt-BR", { style:"currency", currency:"BRL", maximumFractionDigits:0 })`)
- Se ticket médio veio do Offer Book — reusar diretamente (não reinventar)
- Cálculo transparente: mostrar a conta em texto pequeno abaixo do número

**Linha do tempo:**
```tsx
// Steps horizontais com connector line
const steps = ["Dia 1 — avaliação", "7 dias — plano", "30 dias — resultados", "90 dias — transformação"];
```

**Done quando**: os 3 cards usam números reais do cliente ou estimativa declarada como estimativa. Não inventar ROI concreto sem fonte.

---

### 5. Cases · `CasesSection.tsx`

**Função**: prova social com contexto — alguém como eu já conseguiu.

**Estrutura:**
```
[Headline — "Resultados reais de {vertical}"]
[Grid de 2-3 cases / depoimentos]
[Social proof aggregate — "Junte-se a +X clientes"]
```

**Case card:**
```tsx
<blockquote className="rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur p-6 flex flex-col gap-4">
  <p className="text-zinc-100 leading-relaxed">"{depoimento}"</p>
  <footer className="flex items-center gap-3 pt-4 border-t border-white/10">
    <img src={foto} alt={nome} className="h-10 w-10 rounded-full object-cover" />
    <div>
      <div className="text-sm font-bold text-white">{nome}</div>
      <div className="text-xs text-zinc-400">{cargo_ou_contexto}</div>
    </div>
    {rating && <div className="ml-auto text-xs font-bold text-amber-300">★ {rating}</div>}
  </footer>
</blockquote>
```

**Regras de copy:**
- Depoimento real > inventado. Se não houver, usar resultado anônimo ("Paciente, 38 anos, São Paulo").
- Case com número é mais forte: "Perdi 8kg em 6 semanas" > "Adorei o tratamento"
- Foto real > stock photo. Se não tiver, ícone de avatar com inicial — nunca foto de banco de imagens.

**Done quando**: ≥ 2 depoimentos/cases com resultado mensurável, nenhuma foto de stock photo.

---

### 6. FAQ · `FAQSection.tsx`

**Função**: cortar objeções de compra antes da CTA final.

**Estrutura:**
```
[Headline — "Perguntas frequentes"]
[Accordion de 4-7 perguntas]
[Linha de fallback — "Não achou a resposta? Fale conosco"]
```

**Objeções prioritárias por tipo (ordenar as mais comuns primeiro):**

| Objeção | Pergunta no FAQ |
|---|---|
| Preço | "Quanto custa? Cabe no meu orçamento?" |
| Tempo | "Quanto tempo leva pra ver resultado?" |
| Confiança | "Como sei que vai funcionar pra mim?" |
| Logística | "Preciso ir presencialmente? Tem online?" |
| Risco | "E se não funcionar? Tem garantia?" |
| Credencial | "Quem é você / qual a formação?" |
| Urgência | "Por que agora e não depois?" |

**Accordion (sem lib, só estado React):**
```tsx
const [open, setOpen] = useState<number | null>(null);

<button onClick={() => setOpen(open === i ? null : i)}
  className="flex w-full items-center justify-between py-4 text-left font-bold text-white">
  {q}
  <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${open === i ? "rotate-180" : ""}`} />
</button>
<AnimatePresence>
  {open === i && (
    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
      className="overflow-hidden text-sm text-zinc-400 leading-relaxed pb-4">
      {a}
    </motion.div>
  )}
</AnimatePresence>
```

**Done quando**: objeção de preço, tempo e garantia cobertas.

---

### 7. CTA · `CTASection.tsx`

**Função**: fechar. Toda a página culmina aqui.

**Estrutura:**
```
[Urgência ou escassez real (não fake)]
[Headline de CTA — reafirma transformação, ≤ 8 palavras]
[Sub — desmonta a última barreira]
[Botão primário — WhatsApp/Formulário/Calendly]
[Garantia resumida — 1 linha]
[Micro-prova — "Você está em boa companhia com +X clientes"]
```

**Regras de urgência:**
- Real: "Agenda de {mês} com apenas X vagas" (se verdade)
- Real: "Condição especial válida até {data}"
- **Nunca**: countdown timer fake ou "apenas 3 vagas!" sem ser verdade — destrói confiança

**CTA Botão primário:**
```tsx
// WhatsApp CTA
const waMsg = encodeURIComponent(`Olá, vi a página e quero saber mais sobre ${produto}`);
const waUrl = `https://wa.me/55${telefone}?text=${waMsg}`;

<a href={waUrl} target="_blank" rel="noopener"
  className="inline-flex items-center gap-3 rounded-xl border border-brand-cyan/40 bg-brand-cyan/15 px-8 py-4 text-base font-black uppercase tracking-wider text-brand-cyan hover:bg-brand-cyan/25 transition-all">
  <WhatsApp className="h-5 w-5" />
  {cta_text}
</a>
```

**Background CTA section:**
```tsx
// Gradient radial sutil pra criar foco
<section className="relative bg-zinc-950 overflow-hidden">
  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.08)_0%,transparent_70%)]" />
  {/* content */}
</section>
```

**Done quando**: CTA abre diretamente o WhatsApp/formulário com mensagem pré-preenchida, garantia resumida visível próxima ao botão.

---

## Design System obrigatório

### Tokens (herdar de `globals.css`)
- `brand-cyan #00E5FF` — CTAs primários, destaques, ícones
- `brand-orange #FF5722` — accents quentes, urgência, badges de preço
- Canvas: `bg-zinc-950`, superfície: `bg-zinc-900/40 backdrop-blur border border-white/10 rounded-2xl`

### Padrão Glassmorphism
```tsx
// Glass card canônico — nunca inventar outra fórmula
className="rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur p-6"

// Glass com accent
className="rounded-2xl border border-brand-cyan/30 bg-brand-cyan/[0.05] backdrop-blur p-6"

// Glass com destaque positivo
className="rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.04] backdrop-blur p-6"
```

### Bento Grid
```tsx
// Layout base
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"

// Card largo (ocupa 2 cols)
className="md:col-span-2"

// Card alto (ocupa 2 rows — só desktop)
className="md:row-span-2"
```

### Tipografia
```tsx
// H1 landing (maior que OS interno)
className="text-5xl md:text-7xl font-black uppercase tracking-tight text-white leading-none"

// H2 seção
className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white"

// Label micro (topo de seção)
className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-cyan"

// Body
className="text-base md:text-lg text-zinc-300 leading-relaxed"

// Caption / note
className="text-sm text-zinc-500"
```

### Framer Motion — padrões canônicos
```tsx
// Entrada de seção (scroll-triggered)
<motion.div
  initial={{ opacity: 0, y: 32 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.2 }}
  transition={{ duration: 0.6, ease: [0.25, 0, 0, 1] }}
>

// Stagger de grid
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0, 0, 1] } }
}

// Counter animado (métricas)
import { useMotionValue, useTransform, animate } from "framer-motion"
const count = useMotionValue(0)
const rounded = useTransform(count, Math.round)
useEffect(() => { animate(count, targetValue, { duration: 1.5, ease: "easeOut" }) }, [])

// Hover em card
className="... transition-all"
whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
```

### Grid background (hero e seções escuras)
```tsx
// Grid sutil zinc
<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

// Glow radial (hero, CTA)
<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,229,255,0.15),transparent)]" />
```

---

## Metadata SEO (`layout.tsx`)

```tsx
export const metadata: Metadata = {
  title: `${headline_curta} | ${nome_clinica} — ${cidade}`,          // ≤ 60 char
  description: `${transformacao}. ${prova_social}. ${cta_verbal}`,   // 130-160 char
  openGraph: {
    title: `${headline_curta}`,
    description: `${transformacao}. Agende grátis.`,
    type: "website",
    locale: "pt_BR",
  },
};
```

---

## NavBar minimalista (`_components/NavBar.tsx`)

Sticky, com blur, scroll-aware. Esconder em scroll-down (mobile), mostrar em scroll-up.

```tsx
"use client"
// Links: âncoras internas (#proof, #oferta, #cases, #faq, #cta)
// CTA no header repete o CTA principal (WhatsApp ou form)
// Mobile: menu hamburguer ou apenas logo + CTA
className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-zinc-950/85 backdrop-blur"
```

---

## Definition of Done — LP completa

```
[ ] Pré-flight — vertical, produto, persona, transformação, provas coletados
[ ] 7 seções na ordem correta, nenhuma omitida
[ ] H1 fala de resultado (não serviço)
[ ] CTA visível above-the-fold em mobile 375px
[ ] Pelo menos 2 provas de tipos diferentes (número + avaliação OU número + depoimento)
[ ] Mecanismo único nomeado na Oferta
[ ] Garantia explícita (Oferta e CTA)
[ ] ROI com números reais ou estimativa declarada
[ ] ≥ 2 cases/depoimentos com resultado mensurável
[ ] FAQ cobre: preço, tempo, garantia
[ ] CTA primário abre WhatsApp/form com msg pré-preenchida
[ ] Metadata title ≤ 60 char, description 130-160
[ ] Framer Motion com `viewport: { once: true }` (não re-anima)
[ ] Nenhuma foto stock photo
[ ] Urgência/escassez real (ou omitida)
[ ] Responsivo — testado em 375, 768, 1280
```

---

## Anti-padrões (vetar)

- ❌ H1 com nome da empresa ou serviço genérico ("Odontologia Premium" > errado)
- ❌ Countdown timer fake
- ❌ Foto de banco de imagens em depoimentos
- ❌ ROI inventado sem fonte declarada
- ❌ Mais de 1 CTA primário por seção (divide atenção)
- ❌ Seção removida ou reordenada sem motivo — a sequência é funil, não decoração
- ❌ Glassmorphism sem `backdrop-blur` (vira só vidraça sem efeito)
- ❌ `framer-motion` sem `viewport: { once: true }` — re-anima em scroll-up, parece bug
- ❌ Urgência: "apenas 3 vagas" sem ser verdade — destrói confiança imediata
- ❌ `app/[slug]/page.tsx` com 500+ linhas — seções em `_sections/*.tsx` obrigatório

---

## Primitives reutilizáveis (não duplicar)

| Símbolo | Path | Nota |
|---|---|---|
| `FormShell`, `Field` | `app/offer-book/_components/FormShell.tsx` | Para formulários de captura de lead |
| `ScoreCard` | `app/offer-book/_components/ScoreCard.tsx` | Se exibir score de audit no hero |
| `getSupabase` | `app/offer-book/_lib/supabase.ts` | Persistir leads capturados em `crm_leads` |
| `BRL` formatter | Inline (extrair pra `_lib/format.ts` quando 4ª duplicação) | Cards de ROI |
| Componentes legados de referência | `components/o6/O6Hero.tsx`, `O6Metrics.tsx` | Referência de padrão, **não copiar** — reimplementar com dark theme |

---

## Verificação ao final

1. **Lighthouse score** (Chromium → DevTools → Lighthouse, mobile): Performance ≥ 80, Accessibility ≥ 90, SEO ≥ 90.
2. **Mobile check** via Preview MCP `preview_resize({ preset: "mobile" })` + screenshot — confirmar CTA visível above-the-fold.
3. **Copy check**: substituir nome do cliente por "qualquer outra empresa" — H1, sub e cases ainda fazem sentido? → se sim, está genérico, refazer.
4. **Framer Motion check**: rolar a página, confirmar que animações disparam só uma vez (`once: true`).
5. **WhatsApp link check**: clicar no CTA primário — deve abrir `https://wa.me/55...` com mensagem pré-preenchida.

---

## Memory update (obrigatório)

Ao entregar uma LP, **append** a [`memory/o6.md`](../memory/o6.md) (seção de landing pages, criar se não existir):

```
## YYYY-MM-DD · LP — <Nome do Cliente / Produto>

### Contexto
- Vertical: <…>
- Produto: <…> · Ticket: R$<…>
- CTA principal: <WhatsApp / formulário / calendly>

### Decisões de copy
- H1 final: "<headline>"
- Transformação central: "<resultado prometido>"

### Design
- Paleta: dark / light
- Variação de Bento: <layout especial se houver>

### Métricas Lighthouse
- Performance: <n> · Accessibility: <n> · SEO: <n>

### Aprendizados (livre)
- <padrões que funcionaram ou não nesse vertical>
```

---

## Quando NÃO usar esta skill

- Landing page interna do OS (dashboard, CRM) — usar o padrão de dark SaaS do `CLAUDE.md`.
- Atualização pontual de copy em LP existente — editar direto, sem rodar o fluxo.
- Página institucional com múltiplos serviços — `/o6-landing` é focada em **um produto / uma CTA**.
