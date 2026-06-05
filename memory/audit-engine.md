# Website Audit Engine — memory

Status: **📋 PLANNED** — nada construído ainda.

Quando o escopo for definido, este arquivo recebe entradas no formato `## YYYY-MM-DD · título` igual aos outros memory files do OS. Por enquanto: charter inicial + perguntas em aberto + decisões já antecipadas pelo padrão O6.

---

## Charter inicial (rascunho)

Engine que diagnostica o site de um cliente do CRM/Offer Book e produz score técnico + relatório acionável. Tese: a página é o vendedor 24/7; se ela está lenta ou opaca, todo o resto do funil sofre.

### Eixos de análise propostos
- **Performance** — Core Web Vitals (LCP, INP, CLS), TTFB, bundle size, imagens não otimizadas.
- **SEO técnico** — meta tags, schema.org, sitemap, robots, hreflang, canonical.
- **UX comercial** — CTA acima da dobra, formulário de captação, prova social visível, WhatsApp acessível, mobile usável.
- **Acessibilidade** — contraste, labels, foco visível (impacta SEO + conversão).
- **Conversão** — micro-friction, claridade da oferta na home, depoimentos, garantia.

### Output esperado
Score 0-100 por eixo + Plano de Ação no padrão dos demais módulos (P1/P2/P3 ordenados pelo pior eixo). Deve aparecer no Dashboard do cliente, no Resumo Executivo e no PDF gerado.

---

## Perguntas em aberto (responder antes de codar)

1. **Como rodar a análise?** Opções:
   - Server-side via `fetch` + DOM parser (cheerio/htmlparser2) — fácil, mas sem JS executado, perde apps client-side.
   - PageSpeed Insights API (Google) — oficial, dá Web Vitals reais, requer API key + rate limit.
   - Headless browser (Playwright) — caro de hospedar, mais fiel.
   - Combinação: PSI pra performance + cheerio pra SEO/meta.
2. **Onde executar?** API route Next 16 (`app/api/audit/route.ts`) com `runtime = 'nodejs'`? Edge runtime não suporta DOM parsing pesado.
3. **Cache?** Audit do mesmo URL repete muito — TTL em Supabase de 24h por URL? Ou cache em `kv` separado?
4. **Custos** — PSI tem cota gratuita; se passar disso, precisa key paga ou self-hosted Lighthouse.

---

## Decisões antecipadas (herdadas do padrão O6)

- **Scoring determinístico** — mesma filosofia dos 4 scores do Offer Book. Sem IA na lógica.
- **Persistência Supabase** — provável tabela `audits(id, cliente_id FK opcional, url, scores jsonb, findings jsonb, created_at, expires_at)`.
- **Migration nomeada** — `004_audits` (próximo número).
- **RLS anon all** — mesma policy dos outros módulos enquanto não houver auth UI.
- **UI no padrão Glass + ScoreCard** — reuse de `ScoreCard`, `FormShell`, tier colors. NÃO criar novo design system.
- **Layout próprio** ou **embed no Offer Book**? Decisão a tomar: módulo standalone `/audit` (provável, alinhado com o brief original) ou aba dentro de `/offer-book/audit`. Padrão O6 sugere standalone.
- **PDF** — audit completo entra no `/print` do cliente como seção 10 (ou seção dedicada).

---

## Não-objetivos (pré-definidos)

- **Sem crawl recursivo** do site inteiro v1 — só home + 1-2 páginas indicadas pelo cliente.
- **Sem screenshots automáticos** v1 — só métrica + texto.
- **Sem auth pra ler URLs públicas** — o audit roda sobre URL pública.

---

## Path provisórios (quando começar)

```
app/audit/
  _lib/
    types.ts          AuditResult, AuditFinding, AuditScore
    api.ts            wrappers Supabase
    runner.ts         orquestrador da análise
    checks/
      performance.ts  PSI fetch + parse
      seo.ts          meta/schema/sitemap
      ux.ts           heurísticas de conversão
  _components/
    AuditCard.tsx     reuse ScoreCard
    FindingList.tsx
  layout.tsx          dark + topbar igual /crm
  page.tsx            form de URL + last audits + resultado
```
