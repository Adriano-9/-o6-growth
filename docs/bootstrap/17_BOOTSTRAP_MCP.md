# 17 · Bootstrap MCP (Model Context Protocol)

## Propósito

Esclarecer a diferença entre MCP servers disponíveis **dentro desta sessão de Claude Code** versus **connectors do claude.ai** (Claude Chat) — confusão comum que já causou bloqueio real em tarefas anteriores.

## Distinção fundamental

| | Claude Code (esta ferramenta) | Claude Chat (claude.ai) |
|---|---|---|
| Onde configura | `.mcp.json` do projeto ou global, `claude mcp add` | Settings → Connectors, na conta claude.ai |
| OAuth interativo | 🔴 não funciona em sessão não-interativa | 🟢 funciona (browser do usuário) |
| Exemplos usados nesta sessão | Supabase MCP, Vercel (preview), Figma, filesystem | Higgsfield, 21st.dev (nunca autorizado com sucesso) |

**Regra aplicada quando um MCP pedido não está disponível:** nunca simular a chamada. Reportar o bloqueio, sugerir autorização via `claude mcp`/`/mcp` (interativo) ou via claude.ai Connectors, e seguir com alternativa manual quando possível (ex.: implementar padrão visual manualmente em vez de esperar 21st.dev).

## MCP servers usados de verdade nesta sessão (🟢)

| MCP | Uso real |
|---|---|
| Supabase MCP | `list_tables`, `execute_sql`, `apply_migration` — instável em alguns momentos (timeout de conexão), tratado com fail-soft nas rotas Next.js consumidoras |
| Claude Preview | `preview_start`, `preview_screenshot`, `preview_eval` — verificação visual de UI antes de declarar "pronto" |
| Vercel (via API direta, não MCP dedicado) | Deploy programático (`scripts/deploy-*.mjs`) e `vercel --prod` via CLI |

## MCP servers listados mas nunca usados com sucesso (🔴)

Figma, Canva, HubSpot, Notion, Slack, Linear, Asana, ClickUp, Monday, Zapier, Apollo, Clay, Close, ZoomInfo, Fireflies, Outreach, SimilarWeb, Ahrefs, Amplitude, Klaviyo, Supermetrics, Wix — todos aparecem na lista de "requer autorização" em algum momento desta sessão, nenhum foi conectado ou usado.

## Regra de segurança para MCPs de escrita

MCPs que escrevem em sistemas de terceiros (Zapier, HubSpot, Slack, etc.) exigem confirmação explícita do usuário antes de qualquer ação — mesmo padrão de "ações reversíveis vs. irreversíveis" do resto do projeto.

## Checklist antes de pedir/usar um MCP novo

- [ ] É um MCP do Claude Code (esta sessão) ou um connector do claude.ai (outra sessão)?
- [ ] Já está autorizado, ou precisa de OAuth interativo que esta sessão não consegue rodar?
- [ ] Existe alternativa manual caso o MCP não esteja disponível agora?
- [ ] Se for MCP de escrita (não leitura), o usuário confirmou a ação antes de executar?

## Camada de integração O6 (2026-07-06)

A distinção MCP-vs-connector acima é exatamente o que motivou o design de `app/_lib/integrations/` (ver `memory/o6.md`). Higgsfield e 21st.dev viraram conectores `not_available` no registry — não `not_configured` — porque a causa raiz é a mesma documentada nesta página: eles só existem como OAuth connector do claude.ai, sem API key chamável a partir de uma rota server-side do Next.js. Claude Code e Codex têm o mesmo status pelo motivo inverso (Claude Code é o próprio agente rodando a sessão; Codex nunca foi instalado neste repo).

`/api/integrations/status` é a fonte única de verdade que o Dashboard OS (`/os`) consulta para mostrar isso de forma honesta ao operador, em vez de esconder ou fingir que a integração existe.
