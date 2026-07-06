"""
canal_timing.py — Medição de tempo de resposta por canal (WhatsApp x Instagram)

Pilar: Operations (insumo de decisão para CRM/Intelligence — não analisa,
só mede). Ver diagnostico-o6/README.md para credenciais e uso.

O QUE FAZ:
  1. Envia uma mensagem de teste via WhatsApp Business API (Meta Graph API)
     para um número configurado.
  2. Envia uma mensagem de teste via Instagram Direct (Meta Graph API) para
     um perfil configurado.
  3. Registra o timestamp de envio de cada uma.
  4. Faz polling do endpoint de mensagens recebidas até detectar a primeira
     resposta em cada canal (ou até estourar o timeout).
  5. Imprime um JSON único com os dois canais.

O QUE NÃO FAZ (por design — fora de escopo desta tarefa):
  - Não tem dashboard, UI ou persistência em banco.
  - Não faz nenhuma análise ou recomendação — só mede e reporta o tempo bruto.
  - Não decide nada com IA. Isso fica para uma etapa futura de Intelligence
    que consome este output.

CREDENCIAIS NECESSÁRIAS (nenhuma existe no projeto hoje — ver README.md):
  WHATSAPP_PHONE_NUMBER_ID   - ID do número no WhatsApp Business API
  WHATSAPP_ACCESS_TOKEN      - token de acesso (Meta App, permissão whatsapp_business_messaging)
  WHATSAPP_TEST_TO           - número de destino do teste (formato E.164, ex: 5571999999999)
  IG_BUSINESS_ACCOUNT_ID     - ID da conta Instagram Business/Creator conectada ao Meta App
  IG_ACCESS_TOKEN            - token de acesso (permissão instagram_manage_messages)
  IG_TEST_RECIPIENT_ID       - IGSID do destinatário de teste (obtido via webhook prévio)

Sem essas variáveis, o script roda em modo "dry" — reporta exatamente o
que está faltando em vez de travar com stack trace.
"""

from __future__ import annotations

import json
import os
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import requests

GRAPH_API_VERSION = "v21.0"
GRAPH_BASE = f"https://graph.facebook.com/{GRAPH_API_VERSION}"

# Quanto tempo esperar por uma resposta antes de desistir (segundos).
POLL_TIMEOUT_SECONDS = int(os.getenv("CANAL_TIMING_POLL_TIMEOUT", "600"))
POLL_INTERVAL_SECONDS = int(os.getenv("CANAL_TIMING_POLL_INTERVAL", "10"))


def _load_env_file() -> None:
    """Carrega .env.local da raiz do projeto sem depender de python-dotenv."""
    env_path = Path(__file__).resolve().parent.parent / ".env.local"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8", errors="ignore").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip())


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _elapsed_minutes(inicio_iso: str, fim_iso: str) -> float:
    inicio = datetime.fromisoformat(inicio_iso)
    fim = datetime.fromisoformat(fim_iso)
    return round((fim - inicio).total_seconds() / 60, 2)


@dataclass
class CanalResultado:
    identificador_label: str
    identificador_valor: str = ""
    hora_envio: str = ""
    hora_resposta: str = ""
    tempo_decorrido_minutos: Optional[float] = None
    erro: Optional[str] = None

    def to_dict(self) -> dict:
        d = {
            self.identificador_label: self.identificador_valor,
            "hora_envio": self.hora_envio,
            "hora_resposta": self.hora_resposta,
            "tempo_decorrido_minutos": self.tempo_decorrido_minutos,
        }
        if self.erro:
            d["erro"] = self.erro
        return d


# ─────────────────────────────────────────────────────────────
# WhatsApp Business API (Meta Graph API)
# ─────────────────────────────────────────────────────────────

def medir_whatsapp() -> CanalResultado:
    resultado = CanalResultado(identificador_label="numero")

    phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
    access_token = os.getenv("WHATSAPP_ACCESS_TOKEN")
    destino = os.getenv("WHATSAPP_TEST_TO")
    resultado.identificador_valor = destino or ""

    faltando = [
        nome
        for nome, val in [
            ("WHATSAPP_PHONE_NUMBER_ID", phone_number_id),
            ("WHATSAPP_ACCESS_TOKEN", access_token),
            ("WHATSAPP_TEST_TO", destino),
        ]
        if not val
    ]
    if faltando:
        resultado.erro = f"credenciais ausentes: {', '.join(faltando)}"
        return resultado

    url = f"{GRAPH_BASE}/{phone_number_id}/messages"
    headers = {"Authorization": f"Bearer {access_token}"}
    payload = {
        "messaging_product": "whatsapp",
        "to": destino,
        "type": "text",
        "text": {"body": "[O6 diagnóstico] teste de tempo de resposta — pode ignorar."},
    }

    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=30)
        resp.raise_for_status()
    except requests.RequestException as e:
        resultado.erro = f"falha ao enviar: {e}"
        return resultado

    resultado.hora_envio = _now_iso()

    resposta_ts = _poll_whatsapp_resposta(phone_number_id, access_token, resultado.hora_envio)
    if resposta_ts:
        resultado.hora_resposta = resposta_ts
        resultado.tempo_decorrido_minutos = _elapsed_minutes(resultado.hora_envio, resposta_ts)
    else:
        resultado.erro = f"sem resposta em {POLL_TIMEOUT_SECONDS}s"

    return resultado


def _poll_whatsapp_resposta(phone_number_id: str, access_token: str, desde_iso: str) -> Optional[str]:
    """
    Poll simplificado: WhatsApp Business API normalmente entrega mensagens
    recebidas via WEBHOOK, não via GET. Este poll assume que existe um
    endpoint/coletor de webhook já rodando que expõe a última mensagem
    recebida em WHATSAPP_WEBHOOK_INBOX_URL (não existe no projeto ainda —
    ver README.md). Sem isso, retorna None e o resultado registra o erro.
    """
    inbox_url = os.getenv("WHATSAPP_WEBHOOK_INBOX_URL")
    if not inbox_url:
        return None

    deadline = time.monotonic() + POLL_TIMEOUT_SECONDS
    while time.monotonic() < deadline:
        try:
            resp = requests.get(inbox_url, params={"since": desde_iso}, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            if data.get("received_at"):
                return data["received_at"]
        except requests.RequestException:
            pass
        time.sleep(POLL_INTERVAL_SECONDS)
    return None


# ─────────────────────────────────────────────────────────────
# Instagram Direct (Meta Graph API)
# ─────────────────────────────────────────────────────────────

def medir_instagram() -> CanalResultado:
    resultado = CanalResultado(identificador_label="perfil")

    ig_account_id = os.getenv("IG_BUSINESS_ACCOUNT_ID")
    access_token = os.getenv("IG_ACCESS_TOKEN")
    destinatario_id = os.getenv("IG_TEST_RECIPIENT_ID")
    resultado.identificador_valor = destinatario_id or ""

    faltando = [
        nome
        for nome, val in [
            ("IG_BUSINESS_ACCOUNT_ID", ig_account_id),
            ("IG_ACCESS_TOKEN", access_token),
            ("IG_TEST_RECIPIENT_ID", destinatario_id),
        ]
        if not val
    ]
    if faltando:
        resultado.erro = f"credenciais ausentes: {', '.join(faltando)}"
        return resultado

    url = f"{GRAPH_BASE}/{ig_account_id}/messages"
    headers = {"Authorization": f"Bearer {access_token}"}
    payload = {
        "recipient": {"id": destinatario_id},
        "message": {"text": "[O6 diagnóstico] teste de tempo de resposta — pode ignorar."},
    }

    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=30)
        resp.raise_for_status()
    except requests.RequestException as e:
        resultado.erro = f"falha ao enviar: {e}"
        return resultado

    resultado.hora_envio = _now_iso()

    resposta_ts = _poll_instagram_resposta(resultado.hora_envio)
    if resposta_ts:
        resultado.hora_resposta = resposta_ts
        resultado.tempo_decorrido_minutos = _elapsed_minutes(resultado.hora_envio, resposta_ts)
    else:
        resultado.erro = f"sem resposta em {POLL_TIMEOUT_SECONDS}s"

    return resultado


def _poll_instagram_resposta(desde_iso: str) -> Optional[str]:
    """
    Mesma limitação do WhatsApp: mensagens recebidas no Instagram Direct
    chegam via webhook (evento 'messages'), não via GET direto na Graph API.
    Assume um coletor de webhook em IG_WEBHOOK_INBOX_URL — não existe no
    projeto ainda. Sem isso, retorna None.
    """
    inbox_url = os.getenv("IG_WEBHOOK_INBOX_URL")
    if not inbox_url:
        return None

    deadline = time.monotonic() + POLL_TIMEOUT_SECONDS
    while time.monotonic() < deadline:
        try:
            resp = requests.get(inbox_url, params={"since": desde_iso}, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            if data.get("received_at"):
                return data["received_at"]
        except requests.RequestException:
            pass
        time.sleep(POLL_INTERVAL_SECONDS)
    return None


# ─────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────

def main() -> None:
    _load_env_file()

    whatsapp = medir_whatsapp()
    instagram = medir_instagram()

    output = {
        "whatsapp": whatsapp.to_dict(),
        "instagram": instagram.to_dict(),
    }

    print(json.dumps(output, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
