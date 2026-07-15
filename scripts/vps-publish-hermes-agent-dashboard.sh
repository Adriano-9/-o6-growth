#!/usr/bin/env bash
# O6 Hermes Agent Dashboard — publicação persistente via systemd + Nginx (Basic Auth)
# Cole inteiro no console root do VPS (147.182.135.206). Idempotente: roda 2x sem quebrar.
#
# NÃO cria nenhum server.py/stub — publica o comando REAL `hermes dashboard`,
# já confirmado funcionando manualmente pelo operador:
#   HERMES_DASHBOARD_READY port=9119
#   Hermes Web UI → http://127.0.0.1:9119
#
# O binário `hermes` já está instalado na VPS por fora deste repositório —
# nenhum script em scripts/vps-*.sh o instala. Este script só resolve o
# caminho real via `which hermes` e o torna persistente via systemd.
#
# O que este script faz:
#   1. Resolve o caminho real do binário `hermes` via `which` (falha com
#      mensagem clara se não encontrar — nunca hardcoda um path chutado)
#   2. Inspeciona `hermes dashboard --help` para logar se existem flags de
#      host/porta (não assume — documenta o que encontrar)
#   3. Backup da unit systemd e do config Nginx anteriores, se existirem
#   4. Cria unit systemd `o6-hermes-agent-dashboard.service`
#      (Restart=always, enable no boot)
#   5. Instala nginx + apache2-utils (htpasswd) se ausentes
#   6. Gera usuário/senha Basic Auth (se ainda não existir) — impresso UMA VEZ
#   7. Configura Nginx como reverse proxy 127.0.0.1:9119 → porta 80, com Basic Auth
#   8. Recarrega tudo e reporta status real
#
# NÃO toca em: /opt/o6-hermes-bot/** (bot Telegram), /opt/o6-intelligence/**
# (Intelligence Engine), TELEGRAM_TOKEN, TELEGRAM_CHAT_ID.
set -euo pipefail

UNIT=/etc/systemd/system/o6-hermes-agent-dashboard.service
HTPASSWD=/etc/nginx/.htpasswd-hermes
NGINX_SITE=/etc/nginx/sites-available/o6-hermes-agent-dashboard
DASH_PORT=9119
DASH_USER="${DASH_USER:-hermes}"
LOG_FILE=/var/log/o6-hermes-agent-dashboard.log
STAMP=$(date +%Y%m%d%H%M%S)

# ── 1. Resolve o binário real — nunca hardcoda ──
HERMES_BIN="$(command -v hermes || true)"
if [ -z "$HERMES_BIN" ]; then
  echo "ERRO: 'hermes' não encontrado no PATH deste shell (which hermes retornou vazio)."
  echo "Rode 'which hermes' manualmente e confirme o binário antes de continuar."
  echo "Se o CLI estiver instalado em outro shell/PATH (ex.: nvm, pyenv, venv),"
  echo "ajuste o PATH desta sessão root antes de rodar este script de novo."
  exit 1
fi
echo "=== hermes resolvido em: $HERMES_BIN ==="

# ── 2. Inspeciona flags de host/porta disponíveis — só loga, não assume ──
echo
echo "=== hermes dashboard --help (para checar flags de host/porta) ==="
"$HERMES_BIN" dashboard --help 2>&1 | tee /tmp/hermes-dashboard-help.txt || \
  echo "(comando --help falhou ou não é suportado — seguindo sem flags extras)"

BIND_FLAG=""
if grep -qiE -- "--host|--bind" /tmp/hermes-dashboard-help.txt 2>/dev/null; then
  echo "AVISO: o CLI parece suportar uma flag de host/bind (ver output acima)."
  echo "Este script NÃO adiciona a flag automaticamente — o bind padrão já"
  echo "observado (127.0.0.1:9119) é seguro. Se quiser forçar explicitamente,"
  echo "edite ExecStart em $UNIT manualmente após a instalação."
fi

# ── 3. Backup se já existir instalação anterior ──
if [ -f "$UNIT" ]; then
  mkdir -p /opt/o6-hermes-agent-dashboard/backups/"$STAMP"
  cp "$UNIT" /opt/o6-hermes-agent-dashboard/backups/"$STAMP"/o6-hermes-agent-dashboard.service.bak
  echo "=== BACKUP da unit anterior em: /opt/o6-hermes-agent-dashboard/backups/$STAMP ==="
fi
if [ -f "$NGINX_SITE" ]; then
  mkdir -p /opt/o6-hermes-agent-dashboard/backups/"$STAMP"
  cp "$NGINX_SITE" /opt/o6-hermes-agent-dashboard/backups/"$STAMP"/nginx-site.bak
fi

# ── 4. Unit systemd — aponta para o binário real, sem stub ──
cat > "$UNIT" <<UNIT
[Unit]
Description=O6 Hermes Agent Dashboard (hermes dashboard)
After=network-online.target
Wants=network-online.target
StartLimitIntervalSec=0

[Service]
Type=simple
ExecStart=$HERMES_BIN dashboard
Restart=always
RestartSec=5
User=root
StandardOutput=append:$LOG_FILE
StandardError=append:$LOG_FILE

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable o6-hermes-agent-dashboard
systemctl restart o6-hermes-agent-dashboard

echo
echo "=== STATUS DO SERVIÇO (dashboard) ==="
sleep 2
systemctl status o6-hermes-agent-dashboard --no-pager -l || true

echo
echo "=== ÚLTIMAS LINHAS DO LOG ==="
tail -n 30 "$LOG_FILE" 2>/dev/null || echo "(log ainda vazio)"

echo
echo "=== IMPORTANTE: confira acima se o log mostra 'HERMES_DASHBOARD_READY port=9119' ==="
echo "Se o processo caiu (systemctl status mostrando 'failed' ou 'inactive'), o"
echo "CLI pode fazer fork/daemonize internamente (precisaria de Type=forking na"
echo "unit em vez de Type=simple) — ver seção Limitações em"
echo "docs/bootstrap/06_BOOTSTRAP_HERMES.md antes de tentar variações às cegas."

# ── 5. Nginx + apache2-utils (htpasswd) ──
if ! command -v nginx >/dev/null 2>&1; then
  echo "=== Instalando nginx ==="
  apt-get update -y
  apt-get install -y nginx
fi
if ! command -v htpasswd >/dev/null 2>&1; then
  echo "=== Instalando apache2-utils (htpasswd) ==="
  apt-get install -y apache2-utils
fi

# ── 6. Basic Auth — gera usuário/senha só se ainda não existir ──
GENERATED_PASSWORD=""
if [ ! -f "$HTPASSWD" ]; then
  GENERATED_PASSWORD=$(openssl rand -base64 18)
  htpasswd -bc "$HTPASSWD" "$DASH_USER" "$GENERATED_PASSWORD"
  echo "=== Basic Auth criado (credenciais impressas UMA VEZ abaixo) ==="
else
  echo "=== Basic Auth já existe em $HTPASSWD — não sobrescrito. ==="
  echo "    Para trocar a senha: htpasswd $HTPASSWD $DASH_USER"
fi

# ── 7. Site Nginx — reverse proxy com Basic Auth ──
cat > "$NGINX_SITE" <<NGINX
server {
    listen 80;
    server_name _;

    location / {
        auth_basic "O6 Hermes Agent Dashboard";
        auth_basic_user_file $HTPASSWD;

        proxy_pass http://127.0.0.1:$DASH_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX

ln -sf "$NGINX_SITE" /etc/nginx/sites-enabled/o6-hermes-agent-dashboard
nginx -t
systemctl reload nginx || systemctl restart nginx

# ── 8. Firewall (defesa em profundidade, só se ufw estiver ativo) ──
if command -v ufw >/dev/null 2>&1 && ufw status | grep -q "Status: active"; then
  ufw allow 80/tcp || true
  ufw deny "$DASH_PORT"/tcp || true
  echo "=== ufw: porta 80 liberada, porta $DASH_PORT explicitamente negada de fora ==="
else
  echo "=== ufw inativo/ausente — proteção primária é o bind em 127.0.0.1 do próprio hermes dashboard ==="
fi

echo
echo "=== STATUS FINAL: nginx ==="
systemctl status nginx --no-pager -l | head -n 10

echo
echo "================================================================"
echo " ACESSO"
echo "================================================================"
echo "URL:      http://<IP_DA_VPS>/          (ou http://147.182.135.206/)"
echo "Usuário:  $DASH_USER"
if [ -n "$GENERATED_PASSWORD" ]; then
  echo "Senha:    $GENERATED_PASSWORD"
  echo
  echo "IMPORTANTE: esta senha só é exibida agora. Guarde-a (ex.: gerenciador"
  echo "de senhas). Para trocar depois: htpasswd $HTPASSWD $DASH_USER"
else
  echo "Senha:    (já configurada anteriormente — não foi regerada)"
fi
echo
echo "FALLBACK caso o systemd não sustente o processo (ver Limitações no doc):"
echo "  ssh -L $DASH_PORT:127.0.0.1:$DASH_PORT root@147.182.135.206"
echo "  depois abra http://127.0.0.1:$DASH_PORT no seu notebook"
echo "================================================================"
