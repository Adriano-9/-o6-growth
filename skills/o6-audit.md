---
name: o6-audit
description: Auditar uma empresa-alvo (site + presença comercial) e gerar pacote completo de prospecção O6 — score por eixo, qualificação de potencial, estimativa de impacto e mensagens de cold outreach (Email, WhatsApp, LinkedIn). Invocar quando o usuário pede "auditar [empresa/URL]", "qualificar lead", "preparar abordagem" ou "diagnosticar site de prospect".
trigger: /o6-audit
---

# O6 Audit — skill canônica

Esta skill transforma uma URL + vertical em um pacote de prospecção pronto pra abordar. Difere do `/o6-offerbook`: este audita **uma empresa externa** que ainda não é cliente; offer-book trabalha **dados internos do cliente** já onboarded.

Estado do módulo: **Audit Engine está PLANNED** (ver [`memory/audit-engine.md`](../memory/audit-engine.md)). Hoje, a execução é manual com ferramentas externas (Chrome DevTools, Lighthouse, PageSpeed Insights). Quando o engine for shipped, esta skill vira blueprint.

Antes de qualquer coisa, ler:
- [`CLAUDE.md`](../CLAUDE.md) — regras gerais
- [`memory/audit-engine.md`](../memory/audit-engine.md) — charter, perguntas em aberto
- [`memory/o6.md`](../memory/o6.md) — verticais prioritários (foco: Clínicas, Estética, Odonto, Fisio, Advogados)

---

## Pré-flight (sempre)

1. **Coletar do usuário** (ou pedir):
   - URL alvo (home da empresa)
   - Vertical (clínica de estética, odonto, fisio, advogado, outro)
   - Cidade/Estado (sinaliza tier comercial)
   - Persona alvo (dono, sócio, gestor de marketing) — afeta tom do outreach
2. **Confirmar fit O6**: a empresa precisa estar em um dos 5 verticais prioritários. Se não, registrar como "fora do ICP" e parar na qualificação.
3. **Não criar cliente no Supabase ainda** — só após decisão de abordar. Audit roda sobre URL pública sem persistência inicial. Quando virar lead real, criar via `/crm` com `clienteId` opcional.

---

## Fase A · Análise (7 eixos, 0-100 cada)

Cada eixo segue: checklist objetiva → nota 0-100 → tier (`low` <40, `mid` 40-69, `high` ≥70 — mesma escala de `scoreTier` em `_lib/scores.ts`).

### 1. SEO técnico
- `<title>` único, ≤ 60 char, com keyword + cidade
- `<meta description>` 130-160 char, persuasivo
- `<h1>` único, com keyword principal
- Schema.org `LocalBusiness` / `MedicalBusiness` / `Dentist` etc.
- `sitemap.xml` + `robots.txt` válidos
- Canonical tag
- Indexado no Google (`site:dominio.com`)
- **Score:** 1 ponto por check × 12.5

### 2. UX
- Hierarquia visual clara (H1 > H2 > body)
- Navegação ≤ 7 itens, sem submenu obrigatório
- Mobile usável (zoom desnecessário?)
- Densidade de texto razoável (sem walls of text)
- Contraste WCAG AA mínimo
- Foco visível em tab
- Sem popups intrusivos no load
- **Score:** heurística manual ou Lighthouse Accessibility

### 3. Conversão
- CTA primário visível above-the-fold (sem scroll)
- CTA com cópia de ação ("Agende avaliação", não "Saiba mais")
- Cor de CTA contrastante (não cinza)
- Único CTA principal por viewport
- Oferta clara nos primeiros 5 segundos
- Sem fricção desnecessária pra contatar
- **Score:** -20 por anti-pattern; +20 por boa prática

### 4. Trust
- Depoimentos com foto/nome reais (não stock)
- Casos antes/depois quando aplicável (estética/odonto)
- Reviews Google visíveis no site (rating + count)
- CRM / CNPJ / CRO / OAB visível
- Endereço físico + foto da clínica/escritório
- Selos (Reclame Aqui Verificada, parcerias)
- Política de privacidade + termos
- **Score:** 1 ponto por presença, ponderado

### 5. Velocidade (Core Web Vitals)
- Roda **PageSpeed Insights** (mobile): https://pagespeed.web.dev/?url=<URL>
- LCP < 2.5s (good) · 2.5-4s (needs improvement) · > 4s (poor)
- INP < 200ms · 200-500ms · > 500ms
- CLS < 0.1 · 0.1-0.25 · > 0.25
- TTFB < 800ms
- Bundle JS total < 200KB gz
- **Score:** PageSpeed Performance Score direto (já é 0-100)

### 6. Oferta
- Promessa explícita no hero ("Sorriso novo em 6 meses" > "Odontologia de excelência")
- Mecanismo único nomeado (não genérico)
- Garantia visível (devolução, satisfação, resultado)
- Prova quantificada (número de pacientes, anos, prêmios)
- Preço-âncora ou faixa (mesmo "a partir de") presente
- Diferencial vs. concorrente no mesmo bairro/cidade
- **Score:** 1 ponto por elemento × 16.6

### 7. Lead Capture
- WhatsApp button flutuante (ou fixo no header)
- Formulário curto (≤ 4 campos) acessível
- Chat ao vivo ou bot
- Telefone clicável (`tel:`) em mobile
- E-mail visível com link `mailto:`
- Página de contato com mapa + horário
- Reposta automática prometida ("retornamos em 5 min")
- **Score:** 1 ponto por canal × 14.3

---

## Fase B · Geração (7 outputs)

### 1. Score
- **Composto** = média dos 7 eixos. Aspirar 100; gargalo crítico em qualquer eixo < 40.
- Apresentar como tabela: eixo · nota · tier color.
- Identificar 3 piores → entram em Plano de Ação.

### 2. Potencial Comercial
Qualificação binária com critérios objetivos:

| Sinal | Significado |
|---|---|
| Vertical ∈ {Clínica, Estética, Odonto, Fisio, Advogado} | ✅ Fit |
| Cidade tier 1-2 ou capital | ✅ Ticket viável |
| Sinais de operação ativa (Instagram > 2k seguidores OU reviews Google > 50) | ✅ Tem volume |
| Score composto entre 30-65 | ✅ Tem dor, tem caixa pra investir |
| Score < 30 | ⚠️ Pode estar quebrado/abandonado |
| Score > 75 | ⚠️ Já é saudável, gap pequeno |

Output: `Alto` / `Médio` / `Baixo` + 2-3 bullets justificando.

### 3. Impacto Potencial
Estimativa $ usando heurística determinística:

```
ticket_estimado = lookup_por_vertical(vertical, cidade_tier)
leads_estimados = max(20, instagram_seguidores / 100)  # mensal
conv_atual_estimada = score_conversao / 100 × 0.10     # 10% se score=100
conv_potencial = min(50%, max(conv_atual × 2, conv_atual + 10pp))

receita_atual    = leads × conv_atual × ticket
receita_potencial = leads × conv_potencial × ticket
ganho_estimado   = potencial - atual
```

Lookup por vertical (R$, ordem de grandeza):

| Vertical | Tier 1 | Tier 2 |
|---|---|---|
| Estética avançada | 2000-5000 | 1000-2500 |
| Odontologia (implante/ortodontia) | 4000-15000 | 2500-8000 |
| Fisioterapia (pacote) | 800-2000 | 500-1200 |
| Advocacia (consultivo) | 3000-10000 | 1500-5000 |
| Clínica geral | 300-800 | 200-500 |

Output: "Estimativa conservadora de +R$X/mês destravados se ataque os 3 gargalos principais."

### 4. Plano de Ação
P1/P2/P3 derivados dos 3 piores eixos. Mapa de mensagens (similar ao `actionByScore` do Offer Book):

```ts
const actionByAuditAxis = {
  seo: "Reescrever meta tags + adicionar schema LocalBusiness + corrigir h1",
  ux: "Refazer hierarquia visual + reduzir nav + auditar mobile",
  conversao: "Mover CTA pra above-the-fold + reescrever copy de ação + simplificar oferta",
  trust: "Adicionar depoimentos reais + selos + reviews Google embedados",
  velocidade: "Otimizar imagens + reduzir JS + ativar cache + CDN",
  oferta: "Reescrever promessa + nomear mecanismo único + adicionar garantia",
  lead_capture: "Adicionar WhatsApp flutuante + reduzir formulário pra 3 campos"
};
```

### 5. Cold Email
Template determinístico, preencher placeholders. Sempre 4 parágrafos curtos, ≤ 120 palavras totais:

```
Assunto: {{primeiro_nome}} — vi um gap no site da {{empresa}}

Oi {{primeiro_nome}}, tudo bem?

Tô olhando sites de {{vertical}} em {{cidade}} e o da {{empresa}} chamou atenção — mas com {{gargalo_principal_em_uma_frase}}.

Estimativa rápida: corrigindo isso e mais 2 pontos, dá pra destravar algo na ordem de {{impacto_estimado_brl}}/mês sem aumentar volume de leads.

Posso te mandar o diagnóstico completo (6 páginas) em 24h, sem custo. Te chamo amanhã 11h pra alinhar?

— {{remetente}}
{{assinatura_o6}}
```

**Regras:**
- Personalização real (nome + empresa + gap específico). Genérico vira spam.
- Sem hype ("explodir vendas", "10x"). Tom analítico.
- CTA = 1 (resposta sim/não pra call). Não pedir 30 min na primeira mensagem.

### 6. WhatsApp
Versão curta, 2-3 mensagens encadeadas. Sem áudio, sem PDF inicial.

```
[Msg 1]
Oi {{primeiro_nome}}, aqui é {{remetente}} da O6 Growth.
Tô auditando sites de {{vertical}} em {{cidade}} essa semana e o da {{empresa}} entrou na lista.

[Msg 2]
Sem papo de venda — só queria te mandar o diagnóstico (6 páginas, gratuito) que mostra {{gargalo_principal_curto}} e quanto isso tá custando por mês.

[Msg 3]
Te mando hoje?
```

**Regras:**
- Apresentação humana, não mensagem de bot
- Oferecer **valor primeiro** (o diagnóstico), pedir nada
- Última mensagem é pergunta sim/não
- Sem emoji excessivo (1 no máximo, opcional)

### 7. LinkedIn (DM ou InMail)
Tom profissional, mais longo que WhatsApp, mais curto que email:

```
Olá {{primeiro_nome}}, prazer.

Sou {{remetente}}, sócio da O6 Growth — operamos diagnóstico e otimização comercial para {{vertical}}.

Auditei o site da {{empresa}} esta semana (parte de um benchmark de {{n_empresas}} clínicas em {{cidade}}). Score geral: {{score_composto}}/100. O gargalo principal está em {{eixo_pior}} — estimativa de impacto: {{impacto_estimado_brl}}/mês não capturados.

Tenho o relatório completo (6 páginas) pronto pra te enviar. Faz sentido eu te mandar?

— {{remetente}}
```

**Regras:**
- Mencionar credencial (sócio, fundador) sem inflar título
- Citar benchmark dá contexto (não é abordagem solo)
- Dado específico (score + eixo) prova que auditou de verdade
- CTA é envio de material, não call

---

## Definition of Done — Audit completo

```
[ ] URL + vertical + cidade + persona capturados
[ ] 7 eixos pontuados 0-100 com checklist real (não chute)
[ ] Score composto calculado
[ ] Potencial Comercial classificado (Alto/Médio/Baixo) com justificativa
[ ] Impacto $ estimado com fórmula transparente
[ ] Plano de Ação P1/P2/P3 derivado dos 3 piores eixos
[ ] Cold Email com placeholders preenchidos
[ ] WhatsApp 3-msg pronto pra colar
[ ] LinkedIn DM pronto pra colar
[ ] Tudo entregue como pacote único (markdown ou doc estruturado)
```

---

## Primitives a reusar

Quando o Audit Engine for codificado em `app/audit/*`:

| Símbolo | Reuso de |
|---|---|
| `getSupabase()` | `app/offer-book/_lib/supabase.ts` — único client |
| `scoreTier(value)` | `app/offer-book/_lib/scores.ts` — mesma escala de tiers |
| `ScoreCard` | `app/offer-book/_components/ScoreCard.tsx` — mesmo visual de score |
| `FormShell`, `Field` | `app/offer-book/_components/FormShell.tsx` — form de input da URL |
| Mappers camel↔snake | Padrão de `app/offer-book/_lib/store.tsx` |
| Topbar | Mesmo padrão do `app/crm/layout.tsx` (não usa Sidebar do Offer Book) |

Quando virar lead qualificado:
- Criar `crm_leads` row via `createLead` em `app/crm/_lib/api.ts`
- Persistir audit em tabela própria `audits` (planned, migration `004_audits`)

---

## Anti-padrões (vetar)

- ❌ Auditar fora do ICP (vertical ≠ Clínica/Estética/Odonto/Fisio/Advogado) sem aprovação. Foco é foco.
- ❌ Score chutado sem checklist real — cada nota precisa de evidência observada.
- ❌ Cold email genérico (sem nome da empresa + gap específico) — vira spam, queima domínio.
- ❌ Pedir call na primeira mensagem antes de entregar valor (o diagnóstico).
- ❌ Salvar audit no Supabase como cliente real (`clientes` table). Audit é prospect; vira cliente só depois de qualificação manual.
- ❌ Inflar impacto $ pra parecer atraente. Usar a fórmula transparente — é defensável e mostra rigor.
- ❌ Inventar dados de PageSpeed/Lighthouse — rodar de verdade ou não citar.

---

## Verificação ao final

1. **Coerência interna**: os 3 gargalos no Plano de Ação batem com os 3 piores eixos do Score?
2. **Cold message check**: o Cold Email e o WhatsApp citam o gap principal e o impacto $ de forma específica? Trocar o nome da empresa por "qualquer outra" e ainda fazem sentido? → se sim, está **genérico demais**, refazer.
3. **Impacto check**: a estimativa $ usa o ticket de tabela do vertical correto? O cálculo é reproduzível?
4. **Tom check**: nenhum hype, nenhum superlativo ("incrível", "10x", "explodir"). Tom de consultor sênior.

---

## Memory update (obrigatório)

Ao concluir um audit, **append** a [`memory/audit-engine.md`](../memory/audit-engine.md):

```
## YYYY-MM-DD · Audit — <Empresa>

### Contexto
- URL: <url>
- Vertical: <…>
- Cidade/Tier: <…>
- Persona alvo: <…>

### Scores
- SEO <n> · UX <n> · Conversão <n> · Trust <n> · Velocidade <n> · Oferta <n> · Lead Capture <n>
- Composto: <n>/100

### Decisão
- Potencial: Alto / Médio / Baixo
- Impacto estimado: R$<n>/mês
- Próximo passo: <enviar cold email | descartar | aguardar>

### Aprendizados (opcional)
- <padrões observados nesse vertical/cidade que afetam audits futuros>
```

Quando 10+ audits no mesmo vertical estiverem documentados, extrair médias por eixo e adicionar como benchmark em `memory/audit-engine.md`.

---

## Quando NÃO usar esta skill

- Cliente já é cliente O6 (Offer Book preenchido) → use `/o6-offerbook` pra estender a inteligência, não auditar do zero.
- Pedido genérico de "ver se o site tá bom" sem objetivo comercial — esta skill é instrumental pra prospectar.
- URL não-comercial (blog pessoal, ONG sem vendas) — fora do escopo O6.

---

## Quando o Audit Engine for shipped

Esta skill vira a especificação executável de `/audit`:
- Phase A → API route `/api/audit/run` que orquestra checks
- Phase B → componentes React renderizando os 7 outputs
- Persistência → tabela `audits` (FK opcional pra `clientes` quando lead vira cliente)
- Migration → `004_audits` no Supabase

Atualizar este arquivo quando o engine for built: trocar "PLANNED" por "SHIPPED" e linkar rotas reais.
