#!/usr/bin/env bash
# O6 Hermes Bot — patch de resiliência de polling (VPS 147.182.135.206)
# Cole inteiro no console root do VPS. Idempotente: roda 2x sem quebrar.
#
# Problema alvo: telegram.error.NetworkError: httpx.ReadError durante get_updates
# (long-polling do Telegram derrubando a conexão HTTP intermitentemente).
#
# O que este patch faz:
#   1. Backup do bot.py e da unit systemd atuais (timestamped, nunca sobrescreve backup antigo)
#   2. Reporta a versão instalada de python-telegram-bot e httpx (para o registro)
#   3. Reescreve bot.py com:
#      - timeouts HTTPX mais tolerantes no ApplicationBuilder (connect/read/write/pool)
#      - error handler global (app.add_error_handler) — NetworkError vira log, não crash
#      - logging configurado (silencia ruído de httpx/httpcore em DEBUG, mantém INFO próprio)
#   4. Ajusta a unit systemd para não bater no rate-limit de restart do systemd
#      (StartLimitIntervalSec=0 — Restart=always continua válido mesmo sob falhas em rajada)
#   5. Reinicia o serviço e mostra status + log
#
# NÃO toca em: /opt/o6-intelligence/** (Intelligence Engine), TELEGRAM_TOKEN,
# TELEGRAM_CHAT_ID, nem em nenhum outro secret.
set -euo pipefail

BASE=/opt/o6-hermes-bot
UNIT=/etc/systemd/system/o6-hermes-bot.service
STAMP=$(date +%Y%m%d%H%M%S)

if [ ! -f "$BASE/bot.py" ]; then
  echo "ERRO: $BASE/bot.py não existe. Rode scripts/vps-bootstrap-hermes-bot.sh primeiro."
  exit 1
fi

# ── 1. Backup ──
BACKUP_DIR="$BASE/backups/$STAMP"
mkdir -p "$BACKUP_DIR"
cp "$BASE/bot.py" "$BACKUP_DIR/bot.py.bak"
[ -f "$UNIT" ] && cp "$UNIT" "$BACKUP_DIR/o6-hermes-bot.service.bak"
echo "=== BACKUP CRIADO EM: $BACKUP_DIR ==="

# ── 2. Versões instaladas (antes do patch) ──
echo
echo "=== VERSÕES INSTALADAS (antes do patch) ==="
pip3 show python-telegram-bot 2>/dev/null | grep -E "^(Name|Version)" || echo "python-telegram-bot: não encontrado via pip3 show"
pip3 show httpx 2>/dev/null | grep -E "^(Name|Version)" || echo "httpx: não encontrado via pip3 show"

# ── 3. Garante versão mínima que suporta os métodos de timeout usados abaixo ──
# ApplicationBuilder.get_updates_read_timeout() etc. existem a partir do PTB v20.
# Não força downgrade/upgrade agressivo — só garante piso de versão.
pip3 install --break-system-packages "python-telegram-bot>=20.0" psutil python-dotenv

# ── 4. Novo bot.py ──
cat > "$BASE/bot.py" <<'PY'
"""
O6 Hermes Telegram Bot — daemon de comunicação bidirecional.

Comandos: /ping /status /skills /criar_skill /brief /ajuda
Segurança: só responde ao TELEGRAM_CHAT_ID configurado em
/opt/o6-intelligence/.env — qualquer outro remetente é ignorado
silenciosamente (sem eco, sem log de conteúdo de terceiros).

Resiliência de rede (patch 2026-07-06):
- Timeouts HTTPX tolerantes no polling (get_updates) e nas chamadas normais
  da API — long-polling em redes de VPS instáveis derruba conexões com
  timeouts default (padrão da lib é ~5-10s, curto demais para isso).
- Error handler global: NetworkError (httpx.ReadError/ConnectError/etc.)
  vira log estruturado, nunca derruba o processo. PTB já faz retry
  automático internamente no polling; o handler aqui cobre exceções que
  escapam dos handlers de comando individuais.
- Logging configurado para não poluir o log com DEBUG de httpx/httpcore,
  mantendo apenas o que é relevante para o Hermes.
"""
import logging
import os
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from telegram import Update
from telegram.error import NetworkError, TimedOut, TelegramError
from telegram.ext import Application, CommandHandler, ContextTypes

# ── Logging ──
# Silencia ruído DEBUG de httpx/httpcore (a lib HTTP usada pelo PTB) mas
# mantém INFO/WARNING/ERROR — é aí que um NetworkError real aparece.
logging.basicConfig(
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    level=logging.INFO,
)
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)
logger = logging.getLogger("hermes")

load_dotenv("/opt/o6-intelligence/.env")

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
ALLOWED_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
SKILLS_DIR = Path.home() / ".hermes" / "skills" / "o6"
INTELLIGENCE_MAIN = Path("/opt/o6-intelligence/main.py")
INTELLIGENCE_LOG = Path("/opt/o6-intelligence/logs/cron.log")
START_TIME = time.time()

if not TELEGRAM_TOKEN or not ALLOWED_CHAT_ID:
    raise SystemExit("TELEGRAM_TOKEN / TELEGRAM_CHAT_ID ausentes em /opt/o6-intelligence/.env")

SKILLS_DIR.mkdir(parents=True, exist_ok=True)


def _authorized(update: Update) -> bool:
    """Só processa update se vier do chat autorizado. Ignora o resto."""
    chat_id = str(update.effective_chat.id) if update.effective_chat else None
    return chat_id == str(ALLOWED_CHAT_ID)


async def cmd_ping(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not _authorized(update):
        return
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    await update.message.reply_text(f"Hermes ativo ✅ {ts}")


async def cmd_status(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not _authorized(update):
        return
    try:
        cron_raw = subprocess.run(
            ["crontab", "-l"], capture_output=True, text=True, check=False
        ).stdout
        cron_lines = [l for l in cron_raw.splitlines() if l.strip() and not l.startswith("#")]
    except Exception as e:
        cron_lines = [f"erro ao ler crontab: {e}"]

    uptime_seconds = int(time.time() - START_TIME)
    h, rem = divmod(uptime_seconds, 3600)
    m, s = divmod(rem, 60)

    ultimo_brief = "nunca executado"
    if INTELLIGENCE_LOG.exists():
        try:
            lines = INTELLIGENCE_LOG.read_text(errors="ignore").strip().splitlines()
            if lines:
                ultimo_brief = lines[-1][:200]
        except Exception:
            pass

    msg = (
        "*Status do Hermes*\n\n"
        f"Uptime do bot: {h}h {m}m {s}s\n\n"
        f"Cron jobs ativos ({len(cron_lines)}):\n"
        + ("\n".join(f"- {l}" for l in cron_lines) if cron_lines else "- nenhum")
        + f"\n\nÚltimo brief (log): {ultimo_brief}"
    )
    await update.message.reply_text(msg, parse_mode="Markdown")


async def cmd_skills(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not _authorized(update):
        return
    files = sorted(SKILLS_DIR.glob("*.md"))
    if not files:
        await update.message.reply_text(f"Nenhuma skill encontrada em {SKILLS_DIR}")
        return
    listing = "\n".join(f"- {f.name}" for f in files)
    await update.message.reply_text(f"*Skills em {SKILLS_DIR}:*\n\n{listing}", parse_mode="Markdown")


async def cmd_criar_skill(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not _authorized(update):
        return
    if len(context.args) < 2:
        await update.message.reply_text(
            "Uso: /criar_skill [nome] [conteúdo]\nEx: /criar_skill minha-skill Este é o conteúdo da skill."
        )
        return
    nome = context.args[0]
    conteudo = " ".join(context.args[1:])
    safe_name = "".join(c for c in nome if c.isalnum() or c in ("-", "_")).strip("-_")
    if not safe_name:
        await update.message.reply_text("Nome inválido — use apenas letras, números, - e _.")
        return
    path = SKILLS_DIR / f"{safe_name}.md"
    path.write_text(f"# {nome}\n\n{conteudo}\n", encoding="utf-8")
    await update.message.reply_text(f"Skill criada: {path}")


async def cmd_brief(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not _authorized(update):
        return
    if not INTELLIGENCE_MAIN.exists():
        await update.message.reply_text(
            f"Intelligence Engine não encontrado em {INTELLIGENCE_MAIN}. Nada para executar."
        )
        return
    await update.message.reply_text("Rodando Intelligence Brief agora — aguarde...")
    try:
        result = subprocess.run(
            ["python3", str(INTELLIGENCE_MAIN)],
            capture_output=True,
            text=True,
            timeout=300,
            cwd=str(INTELLIGENCE_MAIN.parent),
        )
        output = (result.stdout or "") + (result.stderr or "")
        await update.message.reply_text(f"Brief concluído.\n\n```\n{output[-1500:]}\n```", parse_mode="Markdown")
    except subprocess.TimeoutExpired:
        await update.message.reply_text("Timeout (>5min) ao rodar o brief.")
    except Exception as e:
        await update.message.reply_text(f"Erro ao rodar o brief: {e}")


async def cmd_ajuda(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not _authorized(update):
        return
    msg = (
        "*Comandos do Hermes*\n\n"
        "/ping — verifica se o bot está ativo\n"
        "/status — cron jobs, último brief, uptime\n"
        "/skills — lista skills em ~/.hermes/skills/o6/\n"
        "/criar_skill [nome] [conteúdo] — cria uma nova skill .md\n"
        "/brief — força execução do Intelligence Brief agora\n"
        "/ajuda — esta mensagem"
    )
    await update.message.reply_text(msg, parse_mode="Markdown")


async def global_error_handler(update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Handler global de exceções — nunca deixa uma falha derrubar o processo.

    NetworkError/TimedOut (httpx.ReadError, ConnectError, etc.) durante
    get_updates já são retentados internamente pelo PTB; aqui só logamos
    em nível WARNING (é ruído esperado de rede, não bug) e seguimos.
    Qualquer outra exceção vira ERROR com stack trace completo para
    investigação, mas também não derruba o polling.
    """
    err = context.error
    if isinstance(err, (NetworkError, TimedOut)):
        logger.warning("Falha de rede transitória (retry automático do PTB): %s", err)
        return
    if isinstance(err, TelegramError):
        logger.error("Erro da API do Telegram: %s", err)
        return
    logger.error("Exceção não tratada no handler", exc_info=context.error)


def main() -> None:
    app = (
        Application.builder()
        .token(TELEGRAM_TOKEN)
        # Timeouts das chamadas normais da API (sendMessage, etc.)
        .connect_timeout(30.0)
        .read_timeout(30.0)
        .write_timeout(30.0)
        .pool_timeout(30.0)
        # Timeouts específicos do long-polling (get_updates) — mais generosos
        # porque get_updates fica com a conexão aberta esperando updates.
        .get_updates_connect_timeout(30.0)
        .get_updates_read_timeout(40.0)
        .get_updates_write_timeout(30.0)
        .get_updates_pool_timeout(30.0)
        .build()
    )

    app.add_handler(CommandHandler("ping", cmd_ping))
    app.add_handler(CommandHandler("status", cmd_status))
    app.add_handler(CommandHandler("skills", cmd_skills))
    app.add_handler(CommandHandler("criar_skill", cmd_criar_skill))
    app.add_handler(CommandHandler("brief", cmd_brief))
    app.add_handler(CommandHandler("ajuda", cmd_ajuda))
    app.add_error_handler(global_error_handler)

    logger.info("Hermes bot iniciando polling...")
    app.run_polling(drop_pending_updates=True, allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
PY

echo
echo "=== bot.py atualizado ==="

# ── 5. Unit systemd — evita o systemd desistir de reiniciar sob falhas em rajada ──
# StartLimitIntervalSec=0 desativa o rate-limit de restart do systemd (default:
# 5 tentativas em 10s e ele para de tentar). Restart=always + RestartSec=5 já
# existiam; isso só garante que rajadas de NetworkError não esgotem o limite.
cat > "$UNIT" <<'UNIT'
[Unit]
Description=O6 Hermes Telegram Bot
After=network-online.target
Wants=network-online.target
StartLimitIntervalSec=0

[Service]
Type=simple
WorkingDirectory=/opt/o6-hermes-bot
ExecStart=/usr/bin/python3 /opt/o6-hermes-bot/bot.py
Restart=always
RestartSec=5
User=root
StandardOutput=append:/opt/o6-hermes-bot/bot.log
StandardError=append:/opt/o6-hermes-bot/bot.log

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl restart o6-hermes-bot

echo
echo "=== STATUS DO SERVIÇO (após patch) ==="
sleep 2
systemctl status o6-hermes-bot --no-pager -l

echo
echo "=== ÚLTIMAS LINHAS DO LOG ==="
tail -n 30 /opt/o6-hermes-bot/bot.log 2>/dev/null || echo "(log ainda vazio)"

echo
echo "=== VERSÕES INSTALADAS (depois do patch) ==="
pip3 show python-telegram-bot 2>/dev/null | grep -E "^(Name|Version)"
pip3 show httpx 2>/dev/null | grep -E "^(Name|Version)"

echo
echo "=== PRÓXIMO PASSO ==="
echo "1. Envie /ping no Telegram — deve responder normalmente."
echo "2. Monitore por alguns minutos: journalctl -u o6-hermes-bot -f"
echo "   Se aparecer 'Falha de rede transitória (retry automático do PTB)' em nível WARNING,"
echo "   é o comportamento esperado agora (antes derrubava o processo, agora só loga e segue)."
echo "3. Backup do bot.py e da unit anteriores está em: $BACKUP_DIR"
