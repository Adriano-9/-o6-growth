# 03 · Bootstrap Claude Chat

## Propósito

Definir o papel de Claude Chat (claude.ai, sem acesso a terminal/filesystem) dentro do ecossistema O6 — o que ele faz bem, o que deve delegar.

## Responsabilidade

Claude Chat é a camada de **inteligência estratégica e conversacional**. Não escreve nem executa código do repositório. Usa **connectors** (Higgsfield, 21st.dev, Google Drive, etc.) que o Claude Code não tem acesso direto.

| Faz | Não faz |
|---|---|
| Estratégia de negócio, posicionamento, copy | Editar arquivos do repositório |
| Gerar vídeos via Higgsfield MCP connector | Rodar `git`, `npm`, deploy |
| Pesquisa de mercado e avatar (web search nativo) | Acessar Supabase diretamente |
| Rascunhar Offer Books e propostas | SSH no VPS |
| Revisar/aprovar planos antes de repassar ao Claude Code | Testar código em preview real |

## Fluxo de entrega para Claude Code

Claude Chat não implementa — ele **produz insumo** que vira prompt para Claude Code:

```
Claude Chat                          Claude Code
─────────────                        ───────────
Pesquisa de avatar          ──────►  Aplica no copy da LP
Vídeo gerado (Higgsfield)   ──────►  Integra no hero (com validação de conteúdo)
Rascunho de Offer Book      ──────►  Popula app/offer-book/*
Estratégia de pilar novo    ──────►  Audita módulo + implementa
```

**Lição registrada (sessão real):** um vídeo gerado no Higgsfield para o Jhun Bistrô veio com conteúdo de marca O6 Growth, não do bistrô. Claude Code auditou o conteúdo antes de integrar cegamente e realocou o vídeo para o lugar certo (hero da landing O6, não do Jhun). **Regra:** nunca integrar output de Claude Chat sem validação de conteúdo — nomes, contexto, marca.

## Connectors relevantes (autorização feita em claude.ai, não aqui)

| Connector | Uso | Status |
|---|---|---|
| Higgsfield | Geração de vídeo | 🟡 usado uma vez manualmente, sem pipeline |
| 21st.dev | Referência de componente visual | 🔴 nunca conectado com sucesso nesta conta |
| Google Drive | Upload de assets (imagens do Jhun, vídeos) | 🟢 usado para trazer assets reais pro projeto |

Ver `07_BOOTSTRAP_HIGGSFIELD.md` e `08_BOOTSTRAP_21DEV.md` para detalhes.

## Prompt reutilizável — briefing para Claude Chat

```
Você é o estrategista de [pilar] da O6 Growth.
Contexto: [colar trecho relevante de CLAUDE.md ou memory/<módulo>.md]
Tarefa: [pesquisa / copy / vídeo / offer book]
Output esperado: [formato exato — JSON, markdown, briefing pro Claude Code]
Restrição: não invente dados que não foram fornecidos. Marque lacunas.
```

## Boas práticas

- Sempre pedir output em formato que o Claude Code consiga colar direto (JSON estruturado, markdown com seções claras).
- Nunca deixar Claude Chat "decidir" arquitetura — isso é responsabilidade do Claude Code (ver `04_BOOTSTRAP_CLAUDE_CODE.md`).
- Toda pesquisa de mercado real gerada por Claude Chat vira arquivo em `memory/` (ex.: `market-research-clinicas-junho-2026.md`) para não se perder.

## Checklist antes de repassar trabalho do Claude Chat pro Claude Code

- [ ] O output tem contexto suficiente (nome do cliente/projeto, não genérico)?
- [ ] Foi validado que assets (imagem/vídeo) correspondem ao que foi pedido?
- [ ] Existe um arquivo de memória pra essa pesquisa, ou ela vai se perder no chat?
