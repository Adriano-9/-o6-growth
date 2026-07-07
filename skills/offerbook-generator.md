<!-- ESPELHO VERSIONADO — a skill canônica vive fora deste repo, em:
     %APPDATA%/Claude/local-agent-mode-sessions/skills-plugin/.../skills/offerbook-generator/SKILL.md
     Editar lá primeiro; este arquivo existe para versionamento/histórico no git. -->

---
name: offerbook-generator
description: Gera Offer Books (propostas comerciais estruturadas em 13 seções) com diagnóstico, oferta, preços, garantias e prova social, aplicando a identidade visual da marca. Use quando o usuário pedir "offer book", "proposta comercial", "book de oferta", ou quiser formalizar uma oferta de produto/serviço em documento vendável e reutilizável para novos nichos ou clientes.
---

# Offer Book Generator

Gera documento comercial estruturado em 13 seções fixas,
aplicando sempre a identidade visual (brandbook) da marca
que está oferecendo o produto/serviço.

## Estrutura padrão (13 seções, ordem fixa)

1. Capa + posicionamento de uma linha (promessa central)
2. O problema do mercado (dados concretos + dor real)
3. Por que agora (urgência genuína, contexto de mercado)
4. A solução (visão geral, sem jargão)
5. Como funciona (processo passo a passo, claro)
6. O que está incluído (lista literal de deliverables)
7. Diferencial competitivo (vs alternativas reais do mercado)
8. Prova social / cases (com placeholder claro se pendente)
9. Investimento (tabela de planos/preços, âncora se houver)
10. Garantias (condições claras, sem letra miúda escondida)
11. Quem está por trás (autoridade, credenciais reais)
12. FAQ — objeções mais comuns (honestas, não evasivas)
13. CTA + próximos passos (ação única e clara)

## Identidade visual
SEMPRE usa o brandbook/design system já existente da marca
(cores hex exatas, tipografia, logo) — nunca aplica estilo
genérico de "proposta comercial corporativa".

Se não houver brandbook formal ainda, usa o núcleo de
identidade validado em conversa (cores + fontes + tom).

## Inputs opcionais DSPC (Dor → Sprint → Pitch → Contrato)

Bloco opcional, fornecido ANTES da geração. Se presente, alimenta
seções específicas (ver regras abaixo). Se ausente, o comportamento
padrão da skill permanece exatamente o mesmo.

Bloco DSPC:
- Pain (dor central diagnosticada)
- Sprint (sprint/entrega recomendada para essa dor)
- Pitch (ângulo de venda validado)
- Contract (condições/formato de contratação)

Inputs estruturados opcionais adicionais:
- pain_summary — síntese da dor (alimenta seção 2)
- recommended_sprint — sprint recomendada (alimenta seções 4, 5)
- buyer_persona — persona compradora (alimenta tom das seções 2, 12)
- estimated_roi — ROI estimado COM premissas explícitas (alimenta seção 9)
- demo_angle — ângulo de demonstração (alimenta seções 4, 7)
- next_step — próximo passo único (alimenta seção 13)
- diagnosis_summary — síntese do diagnóstico real feito (alimenta seções 2, 3)
- offer_strategy — estratégia da oferta (alimenta seções 7, 9)

### Regras de uso do DSPC

- Se dados DSPC existem, usar para FORTALECER as seções
  2 (problema), 3 (por que agora), 4 (solução), 5 (como funciona),
  7 (diferencial), 9 (investimento), 10 (garantias), 12 (FAQ) e
  13 (CTA). As demais seções não são afetadas pelo DSPC.
- Se dados DSPC estão ausentes (total ou parcialmente), preservar
  o comportamento atual — nunca perguntar pelo bloco DSPC como se
  fosse obrigatório.
- NUNCA inventar métricas, prova, claims de receita ou garantias
  a partir do DSPC. `estimated_roi` só entra na seção 9 se vier
  com premissas declaradas pelo usuário — e é apresentado como
  estimativa com premissas visíveis, nunca como promessa.
- Garantia (seção 10) permanece SEMPRE baseada em entrega
  (deliverables, prazo, escopo) — nunca em resultado financeiro,
  mesmo que exista `estimated_roi`.

## Processo de geração

1. Recebe: produto/serviço, preço(s), diferenciais reais,
   identidade visual da marca, público-alvo
   — e, opcionalmente, o bloco DSPC + inputs estruturados acima
2. Pergunta SOMENTE o crítico que faltar (preço, garantia,
   diferencial específico) — não trava o fluxo com excesso
   de perguntas
3. Gera copy persuasivo mas honesto — nunca infla números,
   nunca promete o que não foi confirmado pelo usuário
4. Usa a skill docx para o documento final com identidade
   visual aplicada (cores reais, não placeholder)
5. Marca claramente qualquer seção com dado pendente
   (ex: depoimentos reais ainda não coletados) em vez de
   inventar prova social

## Reuso
Esta skill serve qualquer produto do portfólio do usuário —
O6 Growth (diagnóstico/sprint/retainer), XRUN, Clone Professor,
X-Series futuros, ou clientes de consultoria. Sempre confirma
qual marca/produto antes de gerar se ambíguo.

## Diferença vs Brandbook
Offer Book vende um produto/serviço específico.
Brandbook define a identidade visual da marca como um todo.
Offer Book sempre aplica um Brandbook já existente — não cria
identidade visual nova.
