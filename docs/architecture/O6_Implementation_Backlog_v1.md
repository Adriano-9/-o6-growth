# O6 Implementation Backlog v1

**Base:** `O6_Squads_Agents_Skills_Map_v1.md`  
**Status:** backlog de implementação, sem execução de código

## Objetivo

Implementar o sistema O6 Growth em ordem de risco e valor, reutilizando squads e skills existentes. O backlog não autoriza a criação de novos agentes até que o piloto valide a necessidade.

## Estado atual confirmado

### Squads existentes em `squads/INDEX.json`

- `copy`: agentes de copy e frameworks de voz.
- `deep-research`: pesquisa, fontes, concorrência e validação de claims.
- `offer-book`: arquitetura de oferta e Value Equation.
- `design-extractor`: extração de design system de referências.
- `data-analysis`: análise quantitativa de funil.

### Agentes/skills existentes

- `.codex/skills/`: agentes AIOX de análise, arquitetura, dados, desenvolvimento, DevOps, PM, PO, QA, social media, criação de squads e UX.
- `.claude/skills/`: AIOX, architect-first, checklist-runner, CodeRabbit review, MCP builder, skill creator, synapse e tech-search.

## Backlog priorizado

### P0 — Orchestrator e contrato de handoff

**Objetivo:** garantir que todas as tarefas tenham contexto, entradas, saída esperada, status e aprovação.

Entregas:

- schema `TaskHandoff`;
- estados `draft`, `in_progress`, `review`, `approved`, `blocked`, `published`;
- registro de decisões e conflitos;
- regra de não reabrir decisão aprovada sem revisão explícita;
- roteamento inicial para squads existentes.

Critério de aceite: uma campanha consegue passar de briefing para execução com handoffs rastreáveis.

### P0 — Piloto Espaço Redoma

**Objetivo:** validar o mapa em uma campanha real antes de generalizar.

Entregas:

- briefing;
- direção visual;
- storyboard;
- shot list;
- hero frame;
- pelo menos um take HyperFrames;
- montagem Remotion;
- QA e aprovação humana;
- pacote de distribuição.

Critério de aceite: registrar tempo, falhas, retrabalho e decisões por etapa.

Escopo do primeiro `MotionModule`:

- hook de 3 segundos;
- composição em tela dividida;
- captura da auditoria;
- identidade visual O6;
- duração total de 15 segundos;
- saída HyperFrames;
- formato vertical;
- checklist de QA;
- aprovação humana antes do envio.

### P0 — Aprovação humana e QA

**Objetivo:** impedir publicação de material visual, claims ou dados não aprovados.

Entregas:

- checklist estratégico;
- checklist de identidade e continuidade;
- checklist editorial;
- checklist de saúde/advocacia;
- log de aprovador, data, versão e observações.

Critério de aceite: nenhum render passa para `published` sem aprovação registrada.

### P1 — Jobs de produção visual

**Objetivo:** padronizar criação de imagens, HyperFrames e montagem.

Entregas:

- job `create-identity-sheet`;
- job `create-headless-body-sheet`;
- job `create-hero-frame`;
- job `generate-hyperframe-take`;
- job `assemble-remotion-render`;
- job `run-visual-continuity-qa`.

Critério de aceite: cada job recebe um handoff e produz asset/render com manifest e versão.

### P1 — Integração HyperFrames

**Objetivo:** encapsular a geração de takes sem acoplar o sistema a um único modelo.

Entregas:

- adapter de entrada;
- registro de referências;
- parâmetros de duração, proporção e movimento;
- armazenamento de prompt e resposta;
- tratamento de falhas e reprocessamento;
- status `queued`, `running`, `succeeded`, `failed`.

Critério de aceite: trocar o provedor sem alterar o contrato de campanha.

### P1 — Camada Remotion

**Objetivo:** montagem determinística e geração de variações.

Entregas:

- template vertical;
- template horizontal;
- template 4:3 para XRUN;
- legendas;
- CTA parametrizado;
- trilha e narração;
- render por lote.

Critério de aceite: um mesmo conjunto de shots gera versões por canal sem edição manual repetitiva.

### P1 — Versionamento e manifest

**Objetivo:** preservar origem e reprodutibilidade.

Entregas:

- convenção de nomes;
- `campaign.json`;
- `asset-manifest.json`;
- `prompt-manifest.json`;
- vínculo entre render, referências e aprovação;
- política de arquivamento.

Critério de aceite: qualquer render aprovado pode ser rastreado até briefing, prompt e referências.

### P2 — Distribuição

**Objetivo:** adaptar e publicar com segurança.

Entregas:

- adaptadores de Instagram, YouTube e LinkedIn;
- pacote de legenda, thumbnail, alt text e CTA;
- fila de aprovação;
- conector Windsor/Metricool conforme autorização e disponibilidade;
- registro de URL e data de publicação.

Critério de aceite: publicação automatizada só ocorre após gate humano.

### P2 — Métricas e aprendizado

**Objetivo:** conectar produção a resultado comercial.

Entregas:

- eventos de campanha;
- métricas por canal;
- associação com lead e CRM;
- relatório de performance;
- registro de aprendizado para a próxima versão.

Critério de aceite: cada campanha gera uma recomendação objetiva de otimização.

## Fora do escopo imediato

- criar novos squads de copy, pesquisa, oferta, design ou dados;
- criar um agente por ferramenta de IA;
- construir o portal Next.js antes da validação do piloto;
- automatizar publicação sem revisão;
- implementar CRM completo antes de definir os eventos mínimos.

## Sequência recomendada

```text
TaskHandoff
  → Piloto Espaço Redoma
  → QA e aprovação
  → Jobs visuais
  → HyperFrames adapter
  → Remotion templates
  → Distribuição
  → Métricas e CRM
```

## Decisão de encerramento estratégico

A arquitetura estratégica está encerrada. A partir deste documento, novas decisões devem ser tratadas como implementação, teste do piloto ou mudança formal de arquitetura — não como criação espontânea de novos agentes.

