#!/usr/bin/env bash
# O6 Hermes Telegram Bot — VPS bootstrap (one-shot)
# Cole inteiro no console root do VPS 147.182.135.206
# Idempotente: roda 2x sem quebrar
#
# Reusa /opt/o6-intelligence/.env já existente (TELEGRAM_TOKEN,
# TELEGRAM_CHAT_ID). Não duplica secrets — se o Intelligence Engine
# ainda não foi instalado, rode primeiro scripts/vps-bootstrap-intelligence.sh
# (ou crie /opt/o6-intelligence/.env manualmente com essas 2 chaves).
set -euo pipefail

BASE=/opt/o6-hermes-bot
ENV_FILE=/opt/o6-intelligence/.env
SKILLS_DIR="$HOME/.hermes/skills/o6"

if [ ! -f "$ENV_FILE" ]; then
  echo "ERRO: $ENV_FILE não existe. Crie-o com TELEGRAM_TOKEN e TELEGRAM_CHAT_ID antes de continuar."
  exit 1
fi

mkdir -p "$BASE" "$SKILLS_DIR"
cd "$BASE"

# ── 1. requirements.txt ──
cat > requirements.txt <<'REQ'
python-telegram-bot
python-dotenv
psutil
REQ

# ── 2. bot.py ──
cat > bot.py <<'PY'
"""
O6 Hermes Telegram Bot — daemon de comunicação bidirecional.

Comandos: /ping /status /skills /criar_skill /brief /ajuda
Segurança: só responde ao TELEGRAM_CHAT_ID configurado em
/opt/o6-intelligence/.env — qualquer outro remetente é ignorado
silenciosamente (sem eco, sem log de conteúdo de terceiros).
"""
import os
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

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


def main() -> None:
    app = Application.builder().token(TELEGRAM_TOKEN).build()
    app.add_handler(CommandHandler("ping", cmd_ping))
    app.add_handler(CommandHandler("status", cmd_status))
    app.add_handler(CommandHandler("skills", cmd_skills))
    app.add_handler(CommandHandler("criar_skill", cmd_criar_skill))
    app.add_handler(CommandHandler("brief", cmd_brief))
    app.add_handler(CommandHandler("ajuda", cmd_ajuda))
    app.run_polling(drop_pending_updates=True)


if __name__ == "__main__":
    main()
PY

# ── 3. install deps ──
pip3 install -r requirements.txt --break-system-packages

# ── 4. systemd service ──
cat > /etc/systemd/system/o6-hermes-bot.service <<'UNIT'
[Unit]
Description=O6 Hermes Telegram Bot
After=network-online.target
Wants=network-online.target

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
systemctl enable o6-hermes-bot
systemctl restart o6-hermes-bot

echo
echo "=== STATUS DO SERVIÇO ==="
sleep 2
systemctl status o6-hermes-bot --no-pager -l

echo
echo "=== ÚLTIMAS LINHAS DO LOG ==="
tail -n 20 /opt/o6-hermes-bot/bot.log 2>/dev/null || echo "(log ainda vazio)"

echo
echo "=== PRÓXIMO PASSO ==="
echo "Abra o Telegram e envie /ping para o bot. Deve responder:"
echo '  Hermes ativo ✅ <timestamp UTC>'
echo "Se não responder em 10s, rode: journalctl -u o6-hermes-bot -n 50 --no-pager"
