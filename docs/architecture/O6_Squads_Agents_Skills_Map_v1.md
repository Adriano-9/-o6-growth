# O6 Squads, Agents & Skills Map v1

**Sistema:** O6 Growth  
**Relacionamento:** complementa `O6_Visual_Production_Workflow_v1.md`  
**Status:** arquitetura operacional, sem implementação de código

## Objetivo

Organizar as capacidades de criação, marketing, produto e distribuição do O6 Growth sem multiplicar agentes desnecessários. O O6 deve operar com poucos agentes coordenadores e skills especializadas acionadas conforme a etapa do trabalho.

## Princípio de arquitetura

Não criar um agente para cada ferramenta. Criar agentes por responsabilidade e conectar as ferramentas como skills.

```text
O6 Orchestrator
├── Strategy & Growth Squad
├── Brand & Creative Squad
├── Visual Production Squad
├── Product & Demo Squad
├── Distribution & Analytics Squad
└── Compliance & QA Gate
```

## 1. O6 Orchestrator

Responsável por receber o briefing, escolher o fluxo, distribuir tarefas, controlar dependências, registrar versões e bloquear publicação sem aprovação.

**Entradas:** briefing, arquivos, objetivo, prazo e canal.  
**Saídas:** plano de execução, tarefas, status, decisões pendentes e pacote final.

O Orchestrator não deve gerar todos os assets sozinho. Ele coordena os squads e mantém uma única fonte de verdade.

## 2. Strategy & Growth Squad

| Agente lógico | Função | Skills associadas |
|---|---|---|
| Growth Strategist | objetivo, público, oferta e KPI | `marketing:campaign-plan`, `marketing:competitive-brief` |
| Content Strategist | pilares, formatos e calendário | `marketing:content-creation`, `marketing:draft-content` |
| Performance Analyst | leitura de métricas e otimização | `marketing:performance-report`, `data-analytics:metric-diagnostics` |

**Saída:** campanha, matriz de conteúdo, CTA, KPI e hipóteses de teste.

## 3. Brand & Creative Squad

| Agente lógico | Função | Skills associadas |
|---|---|---|
| Brand Guardian | regras de marca, voz e consistência | `app-6a314a73f8ac819195b0d55e36b9c609:brand-identity`, `marketing:brand-review` |
| Creative Director | conceito, direção visual e referências | `app-6a314a73f8ac819195b0d55e36b9c609:design`, `taste-design` |
| Prompt Director | prompts por modelo, versão e intenção | `enhance-prompt`, `app-6a3293e129088191abf0875820e839da:higgsfield` |

**Saída:** creative brief, visual direction, prompt pack e critérios de aprovação.

## 4. Visual Production Squad

| Agente lógico | Função | Skills associadas |
|---|---|---|
| Character Continuity Agent | face sheet, headless body sheet, roupa e poses | `imagegen`, `app-6a3293e129088191abf0875820e839da:higgsfield` |
| Image Generator | hero frames, plates, props e variações | `imagegen`, `higgsfield-generate` |
| Video Director | movimento, câmera e geração de takes | `app-6a3293e129088191abf0875820e839da:higgsfield`, `higgsfield-generate` |
| Motion Editor | montagem, cortes, áudio, legendas e versões | `remotion:remotion-create`, `remotion:remotion-multimedia`, `remotion:remotion-captions`, `remotion:remotion-render` |
| Storyboard Agent | storyboard, shot list e continuidade | `remotion:remotion-markup`, `template-creator` |

**Regra:** HyperFrames/Higgsfield gera planos e movimento. Remotion organiza, edita, parametriza e renderiza o produto final.

## 5. Product & Demo Squad

| Agente lógico | Função | Skills associadas |
|---|---|---|
| Demo Designer | demonstrações, protótipos e apresentações | `prototype`, `sites:sites`, `figma:figma-generate-design` |
| Web Experience Agent | landing pages, páginas de campanha e microsites | `sites:sites`, `sites:sites-remix`, `vercel:bootstrap` |
| Product Systems Agent | integrações e arquitetura futura | `vercel:workflow`, `vercel:create-a-backend`, `supabase:supabase` |

Este squad só entra quando a campanha exigir site, demo, formulário, área de cliente ou produto interativo. Não deve ser acionado para um vídeo social simples.

## 6. Distribution & Analytics Squad

| Agente lógico | Função | Skills associadas |
|---|---|---|
| Channel Adapter | adapta formato, copy e metadados por canal | `marketing:content-creation`, `social-media-skills:post-formatter` |
| Publisher Coordinator | agenda, revisão e distribuição | integração Windsor/Metricool quando autorizada |
| Analytics Agent | métricas, diagnóstico e próximos testes | `data-analytics:build-report`, `data-analytics:metric-diagnostics` |

Publicação automática nunca deve ignorar o Approval Gate. A ferramenta de distribuição pode executar; a aprovação humana autoriza.

## 7. Compliance & QA Gate

Agente transversal, acionado antes da aprovação final.

Verifica:

- continuidade de rosto, corpo, roupa e cenário;
- texto e legenda;
- direitos de imagem, voz e música;
- claims de saúde, advocacia e performance;
- acessibilidade e área segura;
- adequação ao canal;
- presença de conteúdo não aprovado;
- versionamento e origem dos assets.

Para saúde e advocacia, a decisão final precisa de responsável humano habilitado quando o conteúdo envolver claims, casos, depoimentos ou orientação profissional.

## 8. Matriz de acionamento

| Pedido | Squads acionados | Fluxo mínimo |
|---|---|---|
| Reel simples | Strategy + Visual + Distribution | briefing → take → edição → QA |
| Campanha completa | todos, exceto Product quando não houver site | briefing → campanha → produção → distribuição |
| Hero frame | Brand + Visual + QA | direção → references → imagem → aprovação |
| Vídeo com personagem | Brand + Visual + QA | identity/body sheets → HyperFrames → Remotion |
| Landing page | Strategy + Brand + Product + QA | oferta → copy → design → build → revisão |
| Demo personalizada | Strategy + Product + Brand + QA | briefing → dados → experiência → render |
| Relatório de campanha | Strategy + Analytics | dados → diagnóstico → recomendações |

## 9. O que já existe e o que não criar agora

### Já coberto pela arquitetura atual

- criação de imagem e vídeo;
- character continuity;
- storyboard e shot list;
- edição, legendas e render;
- brand review;
- planejamento de campanha;
- análise de performance;
- sites e demos como fluxo separado.

### Não criar ainda

- um agente separado para cada modelo de imagem;
- um agente separado para cada rede social;
- um agente “prompt master” sem responsabilidade de marca;
- um agente de publicação sem Approval Gate;
- um agente de compliance diferente para cada cliente antes de existir demanda real.

## 10. Contrato de handoff entre agentes

Todo handoff deve conter:

```json
{
  "taskId": "task_001",
  "campaignId": "campaign_001",
  "objective": "string",
  "inputs": ["asset_or_document_id"],
  "decisions": ["string"],
  "constraints": ["string"],
  "requestedOutput": "string",
  "format": "string",
  "version": "v1",
  "approvalRequired": true,
  "status": "pending"
}
```

O agente seguinte não deve reabrir decisões aprovadas sem registrar conflito ou solicitação de revisão.

## 11. Exemplo de execução: Espaço Redoma

1. **Growth Strategist:** define objetivo, público, oferta e CTA.
2. **Brand Guardian:** revisa tom institucional e limites de claims.
3. **Creative Director:** cria direção visual do espaço.
4. **Character Continuity Agent:** só é acionado se houver pessoa/personagem recorrente.
5. **Storyboard Agent:** monta filme de 15–30 segundos.
6. **Video Director:** gera takes com HyperFrames.
7. **Motion Editor:** cria cortes para Reels, Shorts e site.
8. **Compliance & QA:** valida claims, privacidade, texto e continuidade.
9. **Human Approval:** cliente aprova.
10. **Publisher Coordinator:** distribui e registra a versão publicada.
11. **Analytics Agent:** mede resultado e sugere próxima versão.

## 12. Roadmap de implementação

### Fase 1 — Organização

- aprovar nomes dos squads;
- consolidar schemas;
- criar templates de briefing, handoff e QA;
- catalogar skills disponíveis.

### Fase 2 — Piloto visual

- executar XRUN com body sheet sem cabeça;
- produzir hero frame, take HyperFrames e montagem Remotion;
- medir retrabalho e tempo por etapa.

### Fase 3 — Biblioteca de templates

- templates XRUN;
- templates AO Sport & Fitness;
- templates Senhora Fitness;
- template de campanha para prospect.

### Fase 4 — Orquestração

- centralizar status e arquivos;
- criar aprovação por etapa;
- registrar prompts, assets e renders;
- configurar alertas Telegram.

### Fase 5 — Produto e escala

- portal Next.js;
- Supabase como fonte de dados;
- CRM e distribuição;
- dashboards e otimização por performance.

## Decisões pendentes

- escolher o nome oficial de HyperFrames no catálogo interno;
- definir se Windsor ou Metricool será o distribuidor primário;
- escolher o CRM inicial;
- definir o primeiro piloto: XRUN ou Espaço Redoma;
- confirmar quais skills serão realmente executáveis no ambiente de produção.

