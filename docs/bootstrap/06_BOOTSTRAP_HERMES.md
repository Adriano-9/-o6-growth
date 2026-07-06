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
