# 09 · Bootstrap Factory (pilar guarda-chuva)

## Propósito

"Factory" é o pilar que cobre **produção em série** de artefatos vendáveis ou de prospecção — sites, landing pages, dashboards, conteúdo. Este documento é o índice; cada sub-factory tem status próprio.

## Sub-factories e status real

| Sub-factory | Status | Detalhe |
|---|---|---|
| Factory de Sites/LPs | 🟡 | `app/produto/*` (3 SKUs reais, com Stripe), `app/demos/*` (2 landing pages premium standalone), `/api/prospects/demo` (geração automática via Claude) |
| Factory de Landing Pages (prospecção) | 🟢 | `/api/prospects/demo` gera HTML completo por prospect, deploy automático na Vercel |
| Factory de Dashboards | 🔴 | Nenhum gerador automático — `dashboard-o6`, `offer-book-dashboard`, `/os/*` foram construídos um a um manualmente |
| Factory de Conteúdo | 🔴 | Squad `copy` (24 copywriters) existe como insumo, nunca foi "wired" a uma rota que produza conteúdo em série |
| Factory Dark | 🔴 | Conceito não definido — ver seção "Charter em aberto" abaixo |

## O que já funciona como "factory" de verdade (🟢)

**`/api/prospects/demo`** é o exemplo mais maduro de produção em série:

```
prospect (Supabase) → buildHtmlPrompt() → Claude gera HTML completo
     → extractHtmlFromResponse() (parsing robusto) → deployToVercel()
     → demo_url salvo no prospect
```

Rodou para dezenas de prospects reais (Salvador, Recife, Aracaju, Maceió) sem intervenção manual em cada HTML — só o disparo é manual (clique no ProspectDrawer ou chamada da rota pipeline).

**`/api/prospects/video`** segue o mesmo padrão para vídeos animados CSS (fallback enquanto Higgsfield não tem pipeline real).

## Charter em aberto — Factory Dark

🔴 Este conceito foi citado na constituição mas **nunca foi definido** nesta sessão. Antes de qualquer implementação, as seguintes perguntas precisam de resposta do usuário:

- "Dark" se refere a Dark Factory (fábrica sem intervenção humana, 100% autônoma) ou a "dark content" (conteúdo agressivo/controverso de marketing)?
- Qual pilar de negócio ela serve — geração de leads, retenção, ou algo novo?
- Existe precedente em outro projeto do usuário (ex.: `xrun-projeto` mencionado em outras memórias)?

**Não implementar nada sob este nome até o charter ser esclarecido** — mesmo padrão usado em `memory/audit-engine.md` (documentar perguntas em aberto em vez de inventar escopo).

## Padrão arquitetural comum a toda Factory

Toda sub-factory real segue o mesmo esqueleto (extraído de `demo` e `video`):

```typescript
// 1. Input: entidade do Supabase (prospect, cliente, etc.)
// 2. Prompt builder determinístico (função pura, testável)
// 3. Chamada Claude com fetch direto + max_tokens adequado
// 4. Parser robusto de resposta (extractHtmlFromResponse como referência)
// 5. Deploy/persist com fail-soft (nunca quebra o fluxo por erro de deploy)
// 6. Cache-by-default, force=true para regenerar
```

Esse padrão é o que qualquer Factory nova (Dashboards, Conteúdo) deveria seguir — **não reescrever a lógica de deploy/parsing**, reusar `app/_lib/vercel-deploy.ts`.

## Próximos passos

1. Esclarecer charter da Factory Dark com o usuário antes de qualquer código.
2. Avaliar se Factory de Conteúdo nasce como rota `/api/content/generate` reusando squad `copy`.
3. Factory de Dashboards: avaliar se vale a pena generalizar `dashboard-o6`/`os` em um gerador parametrizado, ou se cada dashboard continua sendo construído manualmente (mais simples, menos abstração prematura).
