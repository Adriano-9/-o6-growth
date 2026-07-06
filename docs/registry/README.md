# O6 Registry v1

Fonte da verdade operacional do O6 Growth OS — para Hermes, Claude Code, Codex e ChatGPT saberem, sem precisar re-auditar o repositório inteiro, **o que existe, o que está em desenvolvimento e o que é planejado**.

Este registry é **documentação**, não código executável. Ele não substitui `app/_lib/integrations/registry.ts` (que é a fonte de verdade em runtime para conectores) — ele espelha o que está em código real, com contexto adicional que o código não carrega (por que algo é `planned`, o que falta para virar `implemented`, etc.).

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| [`SYSTEM_STATE.yaml`](SYSTEM_STATE.yaml) | Estágio atual do O6, módulos por status, links (repo, Vercel, Supabase, VPS, dashboards) |
| [`TOOLS_REGISTRY.yaml`](TOOLS_REGISTRY.yaml) | Ferramentas de IA/dev que constroem e operam o sistema (ChatGPT, Claude Chat, Claude Code, Codex, Hermes, GitHub, Supabase, Telegram, MCPs) |
| [`AGENTS_REGISTRY.yaml`](AGENTS_REGISTRY.yaml) | Agentes de negócio (Scout/Intelligence, OfferBook, Sales/CRM, etc.) — capacidades que produzem valor, não ferramentas de dev |
| [`INTEGRATIONS_REGISTRY.yaml`](INTEGRATIONS_REGISTRY.yaml) | Espelho de `app/_lib/integrations/registry.ts` — conectores reais vs. `not_available` |
| [`PIPELINES_REGISTRY.yaml`](PIPELINES_REGISTRY.yaml) | Fluxos ponta a ponta (Intelligence, OfferBook, CRM, Follow-up, etc.) e suas etapas reais vs. planejadas |

## Legenda de status (obrigatória em todo registro)

| Status | Significado |
|---|---|
| `implemented` | Código real existe, roda, e foi testado (manualmente ou em produção). Não significa "perfeito" — significa "existe e funciona". |
| `developing` | Parte do código existe e funciona, mas o escopo completo do item não está pronto — ex.: função testada só por simulação manual, ou peças isoladas sem orquestração única. |
| `planned` | Nenhum código real. Pode ter documentação (skill, playbook) descrevendo a intenção, mas zero implementação. |
| `unavailable` | Existe intenção/pedido de integração, mas não há (e talvez nunca haja) API server-side chamável — ex.: Claude Code é o próprio agente da sessão, Higgsfield só existe como OAuth do claude.ai. Diferente de `not_configured`: aqui, configurar uma chave não resolveria o problema. |
| `not_configured` | Existe conector/API real e chamável, mas falta uma credencial/env var para ativá-lo (ex.: GitHub sem `GITHUB_TOKEN`). |

## Regra de atualização

Este registry é **append/update honesto**, não aspiracional:

1. **Nunca inventar status.** Se não há evidência de código rodando, não é `implemented`. Se há dúvida entre `developing` e `planned`, prefira o mais conservador.
2. **Atualizar quando o código muda de status real** — não em cadência fixa. Ex.: quando `offer_book_mini` for acionado por um score real (não simulado), `PIPELINES_REGISTRY.yaml` muda de `developing` para `implemented`.
3. **Se `app/_lib/integrations/registry.ts` mudar**, `INTEGRATIONS_REGISTRY.yaml` deve refletir a mudança na mesma tarefa — evitar divergência entre código e doc.
4. **Toda entrada nova deve citar o path real do código** (ou dizer explicitamente que não há nenhum) — nunca uma afirmação sem como verificar.
5. **Consumo por agentes**: Hermes, Claude Code, Codex ou ChatGPT que precisarem saber "isso existe?" devem ler o YAML relevante antes de assumir. Se o registry estiver desatualizado em relação ao código, o código vence — mas a divergência deve ser corrigida na mesma sessão em que for percebida.

## Não confundir com

- `memory/o6.md` e `memory/*.md` — log cronológico de decisões (por que algo foi feito), não um snapshot de estado atual.
- `docs/bootstrap/*` — guias de onboarding por sistema/agente (como usar, padrões, checklists), mais extensos e narrativos que este registry.
- `CLAUDE.md` / `AGENTS.md` — regras de operação para agentes de desenvolvimento (o que não tocar, como commitar), não inventário de estado.

Este registry é o **inventário compacto e machine-friendly** — os outros arquivos continuam sendo a fonte de contexto profundo.
