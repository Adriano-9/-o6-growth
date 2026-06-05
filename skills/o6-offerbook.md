---
name: o6-offerbook
description: Construir um O6 Offer Book completo seguindo a sequência canônica obrigatória (Cliente → ICP → Psicografia → Concorrentes → Oferta → Diagnóstico → Plano de Ação → Roadmap → ROI → PDF). Invocar quando o usuário pede pra "criar um offer book", "abrir cliente novo", "fazer o diagnóstico completo de X", ou auditar um offer book existente.
trigger: /o6-offerbook
---

# O6 Offer Book — skill canônica

Orquestra a construção end-to-end de um Offer Book O6. A sequência abaixo é **obrigatória e não-negociável**: cada etapa alimenta a próxima (Diagnóstico → scores → Plano de Ação → ROI → PDF). Pular etapa quebra o output downstream.

Antes de qualquer coisa, ler:
- [`CLAUDE.md`](../CLAUDE.md) — regras gerais do OS
- [`memory/offer-book.md`](../memory/offer-book.md) — decisões técnicas já tomadas
- [`memory/o6.md`](../memory/o6.md) — stack, design system, não-objetivos

---

## Pré-flight (sempre, em ordem)

1. Confirmar projeto Supabase ativo: **`O6 growth`** · `wphrwidjokimfjfvyaym`.
2. Confirmar que existe um cliente alvo:
   - Se sim → abrir `/clientes-dashboard`, clicar 👁 no cliente (`selectCliente`) → grava `localStorage["o6.offer-book.current"]`.
   - Se não → "+ Novo Cliente" → cria 3 rows (clientes + diagnosticos + offer_books) com FK cascade.
3. Verificar `currentClienteId` antes de prosseguir. Sem cliente selecionado, **nenhuma mudança persiste** (a Sidebar mostra "Sem cliente").

---

## Fluxo canônico (10 passos)

### 1. Cliente · `/offer-book/clientes`
- **Coletar** (8 campos): Empresa, Site, Instagram, Nicho, Cidade, Estado, Ticket Médio, Fonte de Leads Atual.
- Persistido em `clientes` (colunas flat) via debounce 600ms.
- **Done quando**: Empresa + Nicho + Cidade/Estado + Ticket Médio preenchidos no mínimo. Sem isso, capa do PDF fica anêmica.

### 2. ICP · `/offer-book/icp`
- **Coletar** (7 campos): Idade, Sexo, Renda, Profissão, Momento de Vida, Objetivo Principal, Problema Principal.
- Persistido em `offer_books.icp` (JSONB).
- **Done quando**: Objetivo Principal e Problema Principal escritos com pelo menos uma frase substantiva. Esses dois entram no Resumo Executivo e no PDF.

### 3. Psicografia · `/offer-book/psicografia`
- **Coletar** (6 textareas): Desejos, Medos, Objeções, Frustrações, Sonhos, Crenças.
- Persistido em `offer_books.psicografia` (JSONB).
- **Done quando**: 4 dos 6 preenchidos no mínimo. Medos e Objeções são os mais críticos pra trabalhar a Oferta depois.

### 4. Concorrentes · `/offer-book/concorrentes`
- **Coletar** (multi-row, 6 campos cada): Nome, Site, Instagram, Posicionamento, Oferta Principal, Ticket Estimado.
- Persistido em `offer_books.concorrentes` (JSONB array).
- **Done quando**: **≥ 3 concorrentes** mapeados. Sem ponto de referência, posicionamento da oferta vira chute.

### 5. Oferta · `/offer-book/oferta`
- **Coletar** (7 campos): Produto, Ticket, Garantia, Transformação, Diferencial, Mecanismo Único, Prova.
- Persistido em `offer_books.oferta` (JSONB).
- **Done quando**: Os 7 preenchidos. Esta página alimenta direto o `ofertaScore` em `_lib/scores.ts` — completude conta.

### 6. Diagnóstico · `/offer-book/diagnostico`
- **Coletar** (7 campos): Tempo médio de resposta ao lead, Origem dos leads, CRM, Vendedores, Ticket médio, Conversão atual, Leads por mês.
- Persistido em `diagnosticos` (colunas flat).
- **Done quando**: Os 7 preenchidos. Crítico para os 4 scores e pro ROI no passo 9.

### 7. Plano de Ação · `/offer-book/plano-acao` *(derivado, read-only)*
- Página gera P1/P2/P3 automaticamente a partir dos 3 piores scores via `computeScores(state)` em `_lib/scores.ts`.
- Mensagens por score em `actionByScore` (mapa interno).
- **Done quando**: As 3 prioridades aparecem com scores reais (não 0). Se algum está 0, voltar pro passo cujo score zerou (Velocidade = Diagnóstico; Oferta = Oferta; Aquisição = Cliente+Diagnóstico; Conversão = Diagnóstico+Oferta+ICP).

### 8. Roadmap · `/offer-book/roadmap` *(estático)*
- 3 fases fixas (Estancar Hemorragia 0-30d · Otimizar e Escalar 30-90d · Previsibilidade e Domínio 90-180d), 4 bullets cada.
- **Done quando**: visualizado — não há input do usuário.

### 9. ROI · `/offer-book/roi` *(computed, ligado ao Diagnóstico)*
- Inputs lidos de `diagnostico` (leads_mes, ticket_medio, conversao_atual). Edição na rota ROI também persiste no Diagnóstico — mesma fonte de verdade.
- Fórmula determinística: `convPotencial = min(50%, max(conv×2, conv+10pp))`. Sem IA.
- **Done quando**: Os 3 cards (Receita Atual, Receita Potencial, Ganho Estimado) mostram valores > R$ 0. Se ainda zerados, faltam dados no Diagnóstico (passo 6).

### 10. PDF · `/print`
- Clicar **"Gerar Offer Book"** na Sidebar (botão cyan no rodapé) — abre `/print` em nova aba com mesmo `currentClienteId`.
- `window.print()` dispara automaticamente 800ms após hydration.
- 9 seções renderizadas na ordem: Cliente → ICP → Psicografia → Concorrentes → Oferta → Diagnóstico → Plano de Ação → Roadmap → ROI.
- Capa traz 5 chips (Health Score + 4 indicadores) + data de geração.
- **Done quando**: usuário salvou como PDF via diálogo do browser. PDF é o entregável final.

---

## Definition of done — Offer Book completo

```
[ ] Cliente       — 4 campos críticos mínimos
[ ] ICP           — 7 campos, Objetivo e Problema com frase substantiva
[ ] Psicografia   — ≥ 4 dos 6 textareas
[ ] Concorrentes  — ≥ 3 mapeados
[ ] Oferta        — 7 campos preenchidos
[ ] Diagnóstico   — 7 campos (inclui leads/mês)
[ ] Plano de Ação — P1/P2/P3 com scores reais
[ ] Roadmap       — visualizado
[ ] ROI           — 3 cards > R$ 0
[ ] PDF           — 9 seções no /print, salvo como PDF
```

Health Score Global = média dos 4 indicadores. Aspirar ≥ 60 antes de considerar o Offer Book "vendável" — abaixo disso, há gargalo crítico documentado.

---

## Primitives obrigatórios (sempre reusar — não duplicar)

| Símbolo | Path |
|---|---|
| `FormShell`, `Field` | `app/offer-book/_components/FormShell.tsx` |
| `ScoreCard` | `app/offer-book/_components/ScoreCard.tsx` |
| `Sidebar` | `app/offer-book/_components/Sidebar.tsx` |
| `OfferBookProvider`, `useOfferBook` | `app/offer-book/_lib/store.tsx` |
| `getSupabase` | `app/offer-book/_lib/supabase.ts` |
| `computeScores`, `scoreTier` | `app/offer-book/_lib/scores.ts` |
| `STAGES` (CRM, se vincular lead) | `app/crm/_lib/types.ts` |

---

## Anti-padrões (vetar imediatamente)

- ❌ Pular Cliente / ICP / Diagnóstico — quebra Plano de Ação e ROI (scores zerados).
- ❌ Editar diretamente Supabase via `execute_sql`. Mudanças passam por mappers no store.
- ❌ Criar novo componente de formulário — sempre `FormShell` + `Field`.
- ❌ Instalar lib de PDF (jsPDF, react-pdf, puppeteer). `/print` é window.print por design.
- ❌ Adicionar IA para gerar conteúdo de campos sem aprovação explícita. Brief atual é determinístico.
- ❌ Pular o passo PDF. O entregável é o PDF; sem ele, não há tarefa concluída.

---

## Verificação ao final

1. **DB check** (Supabase MCP):
   ```sql
   select c.empresa, c.nicho,
          d.conversao_atual, d.leads_mes,
          jsonb_array_length(o.concorrentes) as n_concorrentes,
          o.icp->>'problemaPrincipal' as problema,
          o.oferta->>'mecanismoUnico' as mecanismo
   from public.clientes c
   left join public.diagnosticos d on d.cliente_id = c.id
   left join public.offer_books o on o.cliente_id = c.id
   where c.id = '<currentClienteId>';
   ```
2. **UI check**: screenshot de `/offer-book/dashboard` mostrando 5 score chips com tier color + cards das 6 seções com dados.
3. **PDF check**: screenshot de `/print` mostrando capa com nome do cliente + 9 seções visíveis (h2 enumerados 01-09).

---

## Memory update (obrigatório)

Ao concluir um Offer Book completo, **append** a `memory/offer-book.md`:

```
## YYYY-MM-DD · Offer Book — <Empresa do cliente>

### Contexto
- Vertical: <clínica de estética / odonto / etc>
- Cliente ID: <uuid>

### Health Score final
- Global: <n>/100
- Velocidade <n> · Oferta <n> · Aquisição <n> · Conversão <n>

### Insights cruzados (livre, 1-3 bullets)
- ...

### Pendências
- <quais campos ficaram em branco e por quê>
```

---

## Quando NÃO usar esta skill

- Auditoria pontual de uma única seção (e.g. "revisar só a oferta") → editar direto a rota, sem rodar o fluxo.
- Cliente já completo, só queremos regerar PDF → ir direto pro passo 10.
- Trabalho no CRM, Audit Engine ou outro módulo — usar a skill desse módulo (quando existir).
