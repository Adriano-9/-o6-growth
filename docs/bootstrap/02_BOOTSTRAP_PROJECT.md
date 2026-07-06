# 02 · Bootstrap do Projeto — Visão Geral

## Propósito

Dar a qualquer pessoa ou agente novo uma visão completa e honesta do que a O6 Growth é hoje — sem inflar status, sem esconder dívida técnica.

## O que é a O6 Growth

Sistema operacional comercial para serviços profissionais, com foco nos verticais: **Clínicas · Estética · Odontologia · Fisioterapia · Advocacia**. Tese central: donos desses negócios já foram queimados por agências/consultorias — a O6 diagnostica antes de vender.

## Stack técnico real

| Camada | Tecnologia | Fonte de verdade |
|---|---|---|
| Framework | Next.js 16 (App Router + Turbopack) | `package.json`, `next.config.ts` |
| Linguagem | TypeScript 5 strict | `tsconfig.json` |
| UI | React 19, Tailwind 4 (`@theme` em `globals.css`), shadcn/ui parcial | `components/ui/`, `components.json` |
| Animação | framer-motion (obrigatório para motion) | ver qualquer `_lib/ui.tsx` |
| Dados | Supabase (Postgres + RLS `anon all`) | `app/offer-book/_lib/supabase.ts` |
| IA | Anthropic Claude via `fetch` direto (rotas simples) e `@anthropic-ai/sdk` (rota `generate`) | `AGENTS.md` seção AI rules |
| Pagamento | Stripe (`stripe`, `@stripe/stripe-js`) | `app/api/checkout/diagnostico` |
| Deploy | Vercel (projeto `o6-growth`, escopo `personaltraineradriano-4648s-projects`) | `20_BOOTSTRAP_DEPLOY.md` |
| VPS | DigitalOcean, `147.182.135.206` — Intelligence Engine + Hermes Bot | `10_BOOTSTRAP_INTELLIGENCE.md`, `06_BOOTSTRAP_HERMES.md` |
| Repositório | GitHub `Adriano-9/-o6-growth`, branch `main` | — |

## Estrutura do repositório (real, auditada)

```
app/
  layout.tsx, globals.css        root layout + design tokens
  page.tsx                       landing legada (light theme, isolada do OS)
  offer-book/                    🟢 10 páginas + store + scores
  offer-book-dashboard/          🟢 dashboard estático do offer book da própria O6
  crm/                           🟢 Kanban 7 etapas
  agenda/                        🟢 calendário comercial
  oportunidades/                 🟢 prospecção fria (Apify) + audit + demo + video
  dashboard-o6/                  🟢 dashboard executivo (MRR, pipeline, financeiro)
  os/                            🟡 Mission Control (Fase 1: Dashboard, Pipeline, Agentes, Hermes)
  produto/                       🟢 3 SKUs (diagnóstico, sprint, retainer) + Stripe checkout
  demos/                         🟢 landing pages premium standalone (Jhun, Empório)
  print/                         🟢 exportação PDF via window.print()
  saude/, advocacia/             🟢 landing pages verticais
  api/                           rotas — ver tabela abaixo

diagnostico-o6/                  🟡 scripts de medição pontual (canal_timing.py)
scripts/                         🟡 bootstrap/patch scripts para o VPS (colar manualmente)
squads/                          🟢 32 agents importados (copy, deep-research, offer-book, design-extractor, data-analysis)
skills/                          🟢 7 playbooks nativos O6 (agents.md, o6-audit.md, etc.)
memory/                          🟢 12 arquivos de decisão técnica por módulo
docs/bootstrap/                  🟢 este pack
```

## Rotas de API existentes (auditado em produção)

| Rota | Pilar | Status |
|---|---|---|
| `/api/apify-search` | Operations | 🟢 |
| `/api/audit` | Intelligence | 🟢 |
| `/api/checkout/diagnostico` | Factory (produto) | 🟢 |
| `/api/dashboard-o6` | Dashboard | 🟢 |
| `/api/offer-book/generate` | Offer Book | 🟢 |
| `/api/offer-book/sintese` | Offer Book | 🟢 |
| `/api/os/pipeline` | Dashboard | 🟢 |
| `/api/os/summary` | Dashboard | 🟢 |
| `/api/places` | Operations (legacy) | 🟡 mantido, substituído por apify-search |
| `/api/prospects/demo` | Factory | 🟢 |
| `/api/prospects/pipeline` | Intelligence + CRM | 🟢 |
| `/api/prospects/video` | Factory | 🟢 |
| `/api/telegram/send` | Operations | 🟢 |

## Não-objetivos atuais (decisão consciente, não dívida)

- Sem auth UI — RLS `anon all` por design até multi-tenant ser necessário.
- Sem IA na lógica de scoring do Offer Book — determinístico, auditável.
- Sem lib de PDF além de `window.print()`.
- Sem state manager global (Redux/Zustand) — cada módulo gerencia próprio state.
- Sem CSS-in-JS — só Tailwind + tokens.

## O que NÃO existe ainda (mapeado, não escondido)

| Sistema mencionado na constituição | Status real |
|---|---|
| Factory de Sites/LPs | 🟡 parcial — `produto/`, `demos/` existem; não há pipeline de produção em série automatizado |
| Factory de Dashboards | 🔴 planejado |
| Factory de Conteúdo | 🔴 planejado — squad `copy` (24 copywriters) é o insumo natural, não wired ainda |
| Factory Dark | 🔴 conceito não definido — precisa de charter (ver `12_BOOTSTRAP_DARK_FACTORY.md`) |
| Higgsfield MCP | 🔴 usado uma vez manualmente via claude.ai connector, não integrado ao Claude Code |
| 21st.dev MCP | 🔴 usado como referência de padrão visual, sem integração de API real |
| n8n | 🔴 não instalado, não referenciado em nenhum código |
| Customer Success (módulo formal) | 🔴 não existe — pós-venda é gap documentado (G7 no `CLAUDE.md`) |
| Onboarding automatizado | 🔴 planejado (agente `onboarding` no catálogo, sem código) |

## Ciclo do cliente (real, ponta a ponta hoje)

```
Apify Search → prospects (Supabase)
     │
     ▼
[audit] → 7 eixos de score do site
     │
     ▼
[opener] → mensagem WhatsApp via Claude (voz de copywriter opcional)
     │
     ▼
[demo] → landing HTML deployada na Vercel
     │
     ▼
[video] → página animada antes/depois deployada na Vercel
     │
     ▼ (humano dispara via ProspectDrawer)
WhatsApp manual → resposta do prospect
     │
     ▼ (humano promove)
CRM Lead → Kanban 7 etapas
     │
     ▼ (humano converte ao fechar)
Cliente → Offer Book completo → PDF → entrega
```

Nenhum passo é 100% automático hoje — todo trigger é humano clicando em botão. Ver `16_BOOTSTRAP_AGENTS.md` para o que muda quando Hermes assumir orquestração.

## Próximos passos de arquitetura (não implementados nesta sessão)

1. Confirmar charter da Factory Dark antes de codar qualquer coisa (conceito ambíguo hoje).
2. Decidir se Content Factory nasce como rota Next.js ou como script standalone (padrão `diagnostico-o6/`).
3. Avaliar n8n vs. Hermes cron para orquestração — não duplicar responsabilidade.
