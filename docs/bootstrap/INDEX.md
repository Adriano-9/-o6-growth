# Índice — O6 Bootstrap Pack

| # | Arquivo | Tema | Status geral do conteúdo |
|---|---|---|---|
| 01 | [SYSTEM_PROMPT_O6](01_SYSTEM_PROMPT_O6.md) | Constituição operacional | 🟢 |
| 02 | [BOOTSTRAP_PROJECT](02_BOOTSTRAP_PROJECT.md) | Visão geral do projeto | 🟢 |
| 03 | [BOOTSTRAP_CLAUDE_CHAT](03_BOOTSTRAP_CLAUDE_CHAT.md) | Papel do Claude Chat | 🟢 |
| 04 | [BOOTSTRAP_CLAUDE_CODE](04_BOOTSTRAP_CLAUDE_CODE.md) | Papel do Claude Code | 🟢 |
| 05 | [BOOTSTRAP_CODEX](05_BOOTSTRAP_CODEX.md) | Papel do Codex | 🔴 não wired |
| 06 | [BOOTSTRAP_HERMES](06_BOOTSTRAP_HERMES.md) | Hermes Telegram Bot | 🟡 |
| 07 | [BOOTSTRAP_HIGGSFIELD](07_BOOTSTRAP_HIGGSFIELD.md) | Geração de vídeo (Higgsfield) | 🔴 |
| 08 | [BOOTSTRAP_21DEV](08_BOOTSTRAP_21DEV.md) | Referência de design (21st.dev) | 🔴 |
| 09 | [BOOTSTRAP_FACTORY](09_BOOTSTRAP_FACTORY.md) | Pilar Factory (índice) | 🟡 |
| 10 | [BOOTSTRAP_INTELLIGENCE](10_BOOTSTRAP_INTELLIGENCE.md) | Intelligence Engine | 🟡 |
| 11 | [BOOTSTRAP_CONTENT_FACTORY](11_BOOTSTRAP_CONTENT_FACTORY.md) | Factory de Conteúdo | 🔴 |
| 12 | [BOOTSTRAP_DARK_FACTORY](12_BOOTSTRAP_DARK_FACTORY.md) | Factory Dark | 🔴 charter em aberto |
| 13 | [BOOTSTRAP_CRM](13_BOOTSTRAP_CRM.md) | CRM interno | 🟢 |
| 14 | [BOOTSTRAP_OFFERBOOK](14_BOOTSTRAP_OFFERBOOK.md) | Offer Book | 🟢 |
| 15 | [BOOTSTRAP_DASHBOARD](15_BOOTSTRAP_DASHBOARD.md) | Dashboards + Mission Control | 🟢 |
| 16 | [BOOTSTRAP_AGENTS](16_BOOTSTRAP_AGENTS.md) | Catálogo de agentes | 🟡 |
| 17 | [BOOTSTRAP_MCP](17_BOOTSTRAP_MCP.md) | MCP servers e connectors | 🟡 |
| 18 | [BOOTSTRAP_PIPELINES](18_BOOTSTRAP_PIPELINES.md) | Pipelines reais | 🟡 |
| 19 | [BOOTSTRAP_SKILLS](19_BOOTSTRAP_SKILLS.md) | Skills vs. Squads | 🟢 |
| 20 | [BOOTSTRAP_DEPLOY](20_BOOTSTRAP_DEPLOY.md) | Deploy e commits | 🟢 |
| — | [README](README.md) | Como usar este pack | 🟢 |

## Mapa por pilar

| Pilar | Arquivos relevantes |
|---|---|
| **Intelligence** | 10, 16 (parcial), 18 |
| **Offer Book** | 14, 09 |
| **Dashboard** | 15 |
| **CRM** | 13 |
| **Factory** | 09, 11, 12 |
| **Operations** | 06, 16, 17, 18, 20 |

## Mapa por agente/ferramenta

| Agente/Ferramenta | Arquivo |
|---|---|
| Claude Chat | 03 |
| Claude Code | 04 |
| Codex | 05 |
| Hermes | 06 |
| Higgsfield | 07 |
| 21st.dev | 08 |
| Squads (copy, deep-research, etc.) | 16, 19 |
| Skills nativas | 19 |

## Legenda de status

- 🟢 Implementado — código real, testado ou em produção
- 🟡 Em desenvolvimento — parcialmente real, ou pronto sem execução confirmada
- 🔴 Planejado — só intenção, zero código

## Links internos cruzados (auditados, sem duplicação de conteúdo)

- `06_BOOTSTRAP_HERMES.md` ↔ `10_BOOTSTRAP_INTELLIGENCE.md` (Hermes roda o Intelligence Engine sob demanda)
- `09_BOOTSTRAP_FACTORY.md` ↔ `11`, `12` (sub-factories)
- `13_BOOTSTRAP_CRM.md` ↔ `15_BOOTSTRAP_DASHBOARD.md` (mapeamento de estágios do `/os/pipeline`)
- `16_BOOTSTRAP_AGENTS.md` ↔ `19_BOOTSTRAP_SKILLS.md` (squads vs. skills)
- `07_BOOTSTRAP_HIGGSFIELD.md` ↔ `03_BOOTSTRAP_CLAUDE_CHAT.md` (connector só existe no Claude Chat)
