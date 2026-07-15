# 06 · Bootstrap Hermes

## Propósito

Documentar o Hermes — o bot/orquestrador de operações da O6 — no que ele **é hoje** (Telegram bot ativo no VPS) versus a **visão futura** (orquestrador central de agentes).

## Status real: 🟡 Em desenvolvimento

Hermes hoje é um **Telegram bot rodando como systemd service no VPS**, não um orquestrador de pipelines completo. A confusão entre os dois é comum — este documento separa claramente.

## O que existe (🟢 confirmado por teste real)

- **Serviço:** `/opt/o6-hermes-bot/bot.py`, systemd unit `o6-hermes-bot.service`, `Restart=always`.
- **Segurança:** só responde ao `TELEGRAM_CHAT_ID` configurado em `/opt/o6-intelligence/.env` — qualquer outro remetente é ignorado silenciosamente.
- **Comandos testados e confirmados:**
  - `/ping` → `"Hermes ativo ✅ <timestamp UTC>"` — **testado no Telegram real, confirmado pelo usuário**.
  - `/status` → cron jobs ativos, último brief, uptime do processo.
  - `/skills` → lista arquivos `.md` em `~/.hermes/skills/o6/`.
  - `/criar_skill [nome] [conteúdo]` → cria arquivo `.md` novo nessa pasta.
  - `/brief` → roda `/opt/o6-intelligence/main.py` sob demanda (subprocess, timeout 300s).
  - `/ajuda` → lista os comandos.

## O que NÃO existe ainda (🔴)

- Hermes **não** orquestra outros agentes (Sales Agent, Deploy Agent) — cada um roda isolado, disparado por humano.
- Não há fila de tarefas nem scheduler além do cron simples do Intelligence Engine.
- `~/.hermes/skills/o6/` existe como pasta mas está vazia — nenhuma skill foi criada via `/criar_skill` ainda.

## Arquitetura

```
Telegram → polling (python-telegram-bot) → bot.py
                                              │
                              ┌───────────────┼───────────────┐
                              ▼               ▼               ▼
                       /opt/o6-intelligence  crontab       ~/.hermes/skills/o6/
                       main.py (subprocess)   (leitura)      (leitura/escrita)
```

Reusa `/opt/o6-intelligence/.env` — **não duplica** `TELEGRAM_TOKEN`/`TELEGRAM_CHAT_ID` em outro lugar (regra "nunca duplique secrets" aplicada).

## Como foi instalado (auditável)

Script: `scripts/vps-bootstrap-hermes-bot.sh` — idempotente, cola no console root do VPS. Não executado por SSH direto (sem acesso); o humano colou manualmente e confirmou o resultado (log do systemd + teste `/ping`).

## Visão futura (🔴 planejado, não confundir com implementado)

Quando Hermes assumir orquestração real:
- `agent_runs` table no Supabase — log único de toda execução de agente.
- Scheduler que decide *quando* rodar cada agente (não só cron fixo).
- Hermes vira o único ponto de entrada — Telegram é só a interface humana, não o motor.

## Checklist de expansão do Hermes (antes de adicionar comando novo)

- [ ] O comando novo é isolado ou depende de outro sistema (ex.: Supabase)?
- [ ] Segurança: continua checando `_authorized()` antes de qualquer ação?
- [ ] Se for ação destrutiva (deletar, sobrescrever), tem confirmação?
- [ ] Documentado neste arquivo antes de considerar "pronto"?

## Troubleshooting — `telegram.error.NetworkError: httpx.ReadError` durante `get_updates` (2026-07-06)

**Sintoma:** o polling do bot cai/reinicia com `httpx.ReadError` (ou `ConnectError`/`TimedOut`) durante `get_updates` — long-polling em rede de VPS instável derruba a conexão HTTP aberta.

**Causa raiz provável:** timeouts default do PTB (`python-telegram-bot`) são curtos (~5-10s) para uma conexão de long-polling que fica aberta esperando updates; qualquer instabilidade momentânea de rede na VPS derruba a leitura antes do timeout padrão.

**Patch aplicado:** `scripts/vps-patch-hermes-bot-resilience.sh` (idempotente, com backup automático em `/opt/o6-hermes-bot/backups/<timestamp>/`):
- Timeouts HTTPX mais tolerantes no `Application.builder()`: `.connect_timeout()`, `.read_timeout()`, `.write_timeout()`, `.pool_timeout()` (30s) para chamadas normais da API, e `.get_updates_read_timeout(40s)` + demais `get_updates_*_timeout(30s)` especificamente para o long-polling.
- **Error handler global** (`app.add_error_handler`): `NetworkError`/`TimedOut` viram log `WARNING` (ruído esperado de rede — PTB já faz retry automático internamente), qualquer outra `TelegramError` vira `ERROR` com contexto, e exceções genéricas logam stack trace completo — nada disso derruba o processo.
- **Logging configurado**: `httpx`/`httpcore` rebaixados para `WARNING` (eliminam ruído DEBUG), logger próprio (`hermes`) em `INFO`.
- **Unit systemd**: adicionado `StartLimitIntervalSec=0` para o systemd não desistir de reiniciar o serviço se houver uma rajada de crashes (default do systemd é parar de tentar após 5 falhas em 10s — `Restart=always` sozinho não previne isso).

**Não tocado:** `/opt/o6-intelligence/**` (Intelligence Engine), `TELEGRAM_TOKEN`, `TELEGRAM_CHAT_ID`.

**Como verificar que funcionou:** `journalctl -u o6-hermes-bot -f` deve mostrar `WARNING [hermes] Falha de rede transitória (retry automático do PTB): ...` em vez de o serviço reiniciar via systemd a cada hiccup de rede. `/ping` deve continuar respondendo normalmente entre esses hiccups.

## Hermes Agent Dashboard — publicação persistente (2026-07-06, revisado)

### ~~Tentativa anterior: stub placeholder~~ (revertida)

~~Uma primeira versão deste patch publicou um `server.py` stub (stdlib, sem
dependências) só para validar a infraestrutura, na ausência de informação
sobre um dashboard real.~~ **Revertido a pedido do operador** — existe um
dashboard real (`hermes dashboard`, CLI do Hermes Agent, já rodando
manualmente e confirmado com o output abaixo). Publicar um fake nunca
deveria ter sido o caminho depois que a informação real apareceu. O script
do stub (`scripts/vps-publish-hermes-dashboard.sh`) foi removido do
repositório.

### Status real: 🟡 Dashboard real existe (CLI), publicação persistente pendente de aplicação na VPS

**Evidência real fornecida pelo operador** — o comando `hermes dashboard`,
rodado manualmente na VPS, já retornou:
```
HERMES_DASHBOARD_READY port=9119
Hermes Web UI → http://127.0.0.1:9119
```
Isso confirma que existe um binário/CLI `hermes` instalado na VPS
(fora deste repositório — nenhum script em `scripts/vps-*` instala esse
CLI; ele já estava presente quando testado). O objetivo desta tarefa é
tornar esse comando persistente via systemd, sem depender de o operador
manter uma sessão SSH/tmux aberta rodando `hermes dashboard` manualmente.

### Objetivo do pedido
O dashboard não pode depender do túnel SSH do notebook do operador — precisa
rodar de forma persistente na própria VPS, sem exigir sessão ativa do lado
do cliente.

### Arquitetura

```
Internet → Nginx :80 (Basic Auth) → 127.0.0.1:9119 (Hermes Agent Dashboard real)
                                          │
                                   systemd (o6-hermes-agent-dashboard.service)
                                   ExecStart = caminho resolvido de `which hermes` + "dashboard"
                                   Restart=always, enable no boot
```

- **Bind em `127.0.0.1:9119`** — preservado **se** o CLI `hermes dashboard`
  suportar escolher a interface de bind. O output confirmado
  (`http://127.0.0.1:9119`) sugere que o bind padrão já é loopback — o que
  é bom, mas **não foi verificado se existe uma flag para forçar isso
  explicitamente** (o script tenta descobrir via `hermes dashboard --help`;
  ver seção Limitações abaixo).
- **Nginx** expõe a porta 80 publicamente, exigindo **Basic Auth**
  (`htpasswd`) antes de fazer proxy para `127.0.0.1:9119`.
- Se `ufw` estiver ativo, nega `9119/tcp` de fora como defesa em
  profundidade.

### Script

`scripts/vps-publish-hermes-agent-dashboard.sh` — idempotente, com backup
timestamped da unit systemd e do config Nginx anteriores antes de
sobrescrever. **Não cria nenhum arquivo Python/stub** — o `ExecStart`
aponta para o binário real, resolvido via `which hermes` no momento em
que o script roda (nunca hardcoded um path que pode não existir naquela
VPS). Gera usuário/senha Basic Auth automaticamente na primeira execução.

### Comandos de operação

| Ação | Comando |
|---|---|
| Instalar/atualizar | Colar `scripts/vps-publish-hermes-agent-dashboard.sh` no console root da VPS |
| Status do dashboard | `systemctl status o6-hermes-agent-dashboard --no-pager -l` |
| Status do Nginx | `systemctl status nginx --no-pager -l` |
| Restart do dashboard | `systemctl restart o6-hermes-agent-dashboard` |
| Restart do Nginx | `systemctl restart nginx` |
| Logs do dashboard (arquivo) | `tail -f /var/log/o6-hermes-agent-dashboard.log` |
| Logs via journalctl | `journalctl -u o6-hermes-agent-dashboard -f` |
| Trocar senha Basic Auth | `htpasswd /etc/nginx/.htpasswd-hermes hermes` |
| Testar config Nginx antes de recarregar | `nginx -t` |
| Confirmar binário resolvido | `which hermes` |

### Acesso seguro

- URL: `http://147.182.135.206/` (Basic Auth solicitado pelo navegador)
- Usuário: `hermes` (configurável via `DASH_USER=outro_usuario` antes de rodar o script)
- Senha: gerada automaticamente na primeira execução do script e impressa uma única vez no console
- **TLS**: HTTP puro (porta 80) por não haver domínio configurado ainda. Migrar para Let's Encrypt (`certbot --nginx`, exige domínio) ou Cloudflare Tunnel antes de uso com dado sensível.

### Limitações conhecidas (documentadas, não resolvidas por suposição)

- **Não sabemos se `hermes dashboard` aceita flags de host/porta** — o CLI
  não está neste repositório, então não há como ler seu código-fonte
  localmente. O script tenta `hermes dashboard --help` primeiro e loga a
  saída; se não houver flag de bind, roda `hermes dashboard` sem
  argumentos (confiando no bind padrão já observado em
  `127.0.0.1:9119`).
- **Fallback caso o systemd não consiga manter o processo estável**: manter
  o túnel SSH manual (`ssh -L 9119:127.0.0.1:9119 root@147.182.135.206`)
  como plano B documentado, não removido enquanto a publicação via
  systemd não for confirmada funcionando pelo operador.
- **Não verificado**: se `hermes dashboard` é um processo de vida longa
  (compatível com `Type=simple` + `Restart=always`) ou se ele mesmo faz
  fork/daemonize internamente (o que exigiria `Type=forking` na unit).
  Isso só pode ser confirmado rodando na VPS real.

### Não tocado
`/opt/o6-hermes-bot/**` (bot Telegram), `/opt/o6-intelligence/**` (Intelligence Engine), `TELEGRAM_TOKEN`, `TELEGRAM_CHAT_ID`.

### Próximo passo real
Colar o script na VPS, confirmar via `systemctl status` + acesso HTTP real
que o Hermes Agent Dashboard está de pé via systemd, e só então remover o
fallback de túnel SSH da rotina do operador.
