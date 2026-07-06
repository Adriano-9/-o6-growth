# O6 Bootstrap Pack

Documentação estrutural completa da O6 Growth — 20 arquivos temáticos + este README + `INDEX.md`.

## O que é este pack

Um conjunto de documentos que qualquer agente (Claude Chat, Claude Code, Codex) ou pessoa nova deve ler antes de trabalhar no projeto O6. Cada arquivo cobre um agente, ferramenta ou pilar de produto, com **status real** (🟢 implementado, 🟡 em desenvolvimento, 🔴 planejado) — nunca inflado.

## Nota honesta sobre escopo

Este pack foi pedido com meta de "250-300 páginas". Entregamos densidade real por tópico em vez de padding para bater contagem — inflar página com boilerplate genérico sobre sistemas que não existem (Dark Factory, integração Higgsfield, n8n) violaria a própria regra do projeto: **"nunca documente como implementado algo que ainda não existe."** Onde um sistema é 🔴 planejado, o arquivo correspondente é deliberadamente mais curto — ele registra o charter e as perguntas em aberto, não uma arquitetura inventada.

## Como navegar

Comece por `INDEX.md` para o mapa completo com links. Ordem de leitura recomendada para quem é novo:

1. `01_SYSTEM_PROMPT_O6.md` — a constituição operacional
2. `02_BOOTSTRAP_PROJECT.md` — visão geral real do projeto
3. `03-05` — os 3 agentes de execução (Claude Chat, Claude Code, Codex)
4. `06-08` — ferramentas de automação/geração (Hermes, Higgsfield, 21st.dev)
5. `09-12` — pilar Factory e suas subdivisões
6. `13-15` — pilares CRM, Offer Book, Dashboard
7. `16-20` — mecânica interna (agentes, MCP, pipelines, skills, deploy)

## Relação com a documentação existente

Este pack **não substitui** `CLAUDE.md` e `AGENTS.md` (que continuam sendo a fonte de verdade técnica operacional do repositório) nem `memory/*` (decisões cronológicas por módulo). Ele é a camada de **onboarding estruturado** — organiza o que já existe em `CLAUDE.md`/`memory/` em um formato navegável por pilar/agente, sem duplicar o conteúdo linha a linha.

## Manutenção

Sempre que um item mudar de status (🔴 → 🟡 → 🟢), atualize o arquivo correspondente **e** `INDEX.md`. Nunca edite silenciosamente uma decisão revertida — siga a convenção de `memory/*`: marque com `~~strikethrough~~` e explique a reversão.
