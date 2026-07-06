# 19 · Bootstrap Skills

## Propósito

Diferenciar **skill** (playbook nativo O6, versionado em `skills/`) de **squad** (agent importado de terceiros, versionado em `squads/`) — os dois já foram confundidos no histórico do projeto.

## Diferença

| | Skill (`skills/`) | Squad (`squads/`) |
|---|---|---|
| Origem | Escrita pela própria O6, específica do domínio | Importada de fora (AIOX, bibliotecas de agents) |
| Formato | Markdown de playbook — sequência de passos, primitives obrigatórios | Agent `.md` com persona, framework, YAML de comandos |
| Exemplo | `skills/o6-offerbook.md` (10 passos pra construir Offer Book completo) | `squads/copy/agents/dan-kennedy.md` (persona de copywriter) |
| Quando criar uma nova | Task que se repete e tem sequência canônica dentro do O6 | Nunca — squads são importados, não criados aqui |

## Skills nativas existentes (🟢)

| Skill | Quando usar |
|---|---|
| `skills/agents.md` | Construir um agente novo (padrão I/O, prompt rules, persist fail-soft) |
| `skills/o6-audit.md` | Auditar empresa-alvo em 7 eixos, gerar pacote de prospecção |
| `skills/o6-landing.md` | Construir landing page de alta conversão (7 seções) |
| `skills/o6-offerbook.md` | Construir Offer Book completo (10 passos) |
| `skills/o6-governance.md` | Rotina diária, ciclo semanal, metas de funil |
| `skills/video.md` | Gerar vídeo de demo (placeholder até Higgsfield ter API própria) |
| `skills/dspc/*` | 5 playbooks DSPC (Dor·Sprint·Pitch·Contrato) — abordagem, banco de dores, demo, contrato |

## Squads instalados (🟢 instalados, 🔴 maioria não wired)

Ver `16_BOOTSTRAP_AGENTS.md` para o catálogo completo com status de uso em runtime.

## Skill do Hermes Bot (`~/.hermes/skills/o6/`) — terceira categoria, nova

O comando `/criar_skill` do Hermes Bot (ver `06_BOOTSTRAP_HERMES.md`) cria arquivos `.md` numa pasta **no VPS**, separada tanto de `skills/` (repositório) quanto de `squads/` (repositório). Esta é uma skill **operacional/runtime**, não versionada no Git — decisão consciente (o VPS é o "cérebro operacional" vivo, o repo é o código). Ainda vazia — nenhuma skill foi criada por lá nesta sessão.

## Quando uma tarefa "vira skill" (critério real usado no projeto)

Uma tarefa vira skill nativa quando:
1. Foi repetida ≥ 2 vezes com a mesma sequência de passos.
2. Tem primitives/componentes obrigatórios que não podem ser esquecidos (ex.: "sempre reusar `getSupabase()`").
3. Vale a pena um agente futuro ler antes de começar, sem reconstruir o raciocínio do zero.

## Checklist antes de criar uma skill nova

- [ ] Isso é playbook nativo (→ `skills/`) ou agent importado (→ `squads/`, mas squads não se criam, se importam)?
- [ ] A sequência de passos já se repetiu pelo menos uma vez?
- [ ] Foi registrada em `CLAUDE.md` na tabela de skills reutilizáveis?
