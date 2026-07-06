#!/usr/bin/env bash
# O6 Intelligence Engine — patch aditivo: mini Offer Book (score >= 80)
# Cole inteiro no console root do VPS 147.182.135.206
# Idempotente: roda 2x sem duplicar o patch.
#
# NÃO reescreve main.py — só insere 1 import + 1 chamada condicional
# no ponto exato onde o brief já processa cada oportunidade. Se o
# main.py foi editado manualmente e o texto-âncora não bater, o patch
# aborta em vez de adivinhar.
set -euo pipefail

BASE=/opt/o6-intelligence
MAIN="$BASE/main.py"
NOVO_MODULO="$BASE/offer_book_mini.py"
OUTPUT_DIR="$BASE/offer_books_gerados"

if [ ! -f "$MAIN" ]; then
  echo "ERRO: $MAIN não existe. Rode primeiro scripts/vps-bootstrap-intelligence.sh."
  exit 1
fi

cd "$BASE"
mkdir -p "$OUTPUT_DIR"

# ── 1. Novo módulo isolado — offer_book_mini.py ──
cat > "$NOVO_MODULO" <<'PY'
"""
offer_book_mini.py — Mini Offer Book para oportunidades de alto score.

Função isolada, chamada pelo main.py quando um item do brief tem
opportunity_score >= 80. Sem dashboard, sem integração com outros
agentes — só gera e salva o arquivo.
"""
import json
import os
import re
import unicodedata
from datetime import datetime
from pathlib import Path

import anthropic

OUTPUT_DIR = Path("/opt/o6-intelligence/offer_books_gerados")

PROMPT = """Voce e um estrategista de ofertas da O6 Growth.

Com base na oportunidade de mercado abaixo (score {score}/100), gere um
mini Offer Book de 5 campos. Responda APENAS com JSON valido, sem markdown,
sem comentarios, na estrutura exata:

{{
  "tese": "1-2 frases sobre por que essa oportunidade importa para o mercado brasileiro",
  "icp_sugerido": "descricao curta do cliente ideal para essa oportunidade",
  "oferta_sugerida": "o que a O6 Growth poderia oferecer, de forma concreta",
  "primeiro_passo": "acao pratica e imediata para validar essa oportunidade",
  "score_origem": {score}
}}

Titulo da oportunidade: {titulo}
Mercado: {mercado}
Problema pago: {problema_pago}
Oportunidade: {oportunidade}
"""


def _slugify(texto: str) -> str:
    texto = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode("ascii")
    texto = re.sub(r"[^a-zA-Z0-9]+", "-", texto).strip("-").lower()
    return texto[:60] or "sem-titulo"


def gerar_offer_book_mini(analysis: dict, article: dict | None = None):
    """
    Gera um mini Offer Book via Claude para uma oportunidade de alto score.
    Salva em OUTPUT_DIR e retorna o dict gerado (ou None em caso de erro).
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        print("[offer_book_mini] ANTHROPIC_API_KEY ausente - abortando.")
        return None

    titulo = analysis.get("titulo") or (article or {}).get("title") or "Oportunidade sem titulo"
    score = analysis.get("opportunity_score", 0)

    prompt = PROMPT.format(
        score=score,
        titulo=titulo,
        mercado=analysis.get("mercado", "-"),
        problema_pago=analysis.get("problema_pago", "-"),
        oportunidade=analysis.get("oportunidade", "-"),
    )

    try:
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}],
        )
        text = response.content[0].text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        offer_book = json.loads(text)
    except Exception as e:
        print(f"[offer_book_mini] erro ao gerar: {e}")
        return None

    offer_book.setdefault("score_origem", score)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    data_str = datetime.now().strftime("%Y-%m-%d")
    nome_arquivo = f"{data_str}_{_slugify(titulo)}.json"
    caminho = OUTPUT_DIR / nome_arquivo

    with open(caminho, "w", encoding="utf-8") as f:
        json.dump(offer_book, f, ensure_ascii=False, indent=2)

    print(f"[offer_book_mini] gerado: {caminho}")
    return offer_book
PY

# ── 2. Patch idempotente do main.py (Python faz o patch com segurança) ──
python3 <<'PATCHER'
from pathlib import Path

main_path = Path("/opt/o6-intelligence/main.py")
src = main_path.read_text(encoding="utf-8")

MARKER = "gerar_offer_book_mini"
if MARKER in src:
    print("[patch] main.py já contém o patch — nada a fazer (idempotente).")
    raise SystemExit(0)

IMPORT_ANCHOR = "from db import save_intelligence, save_opportunity"
IMPORT_NEW = IMPORT_ANCHOR + "\nfrom offer_book_mini import gerar_offer_book_mini"

CALL_ANCHOR = (
    "            save_opportunity({\n"
    "                \"market\": analysis.get(\"mercado\"),\n"
    "                \"problem\": analysis.get(\"problema_pago\"),\n"
    "                \"score\": analysis.get(\"opportunity_score\"),\n"
    "                \"source\": article.get(\"source\", \"\"),\n"
    "            })"
)
CALL_NEW = CALL_ANCHOR + (
    "\n            if analysis.get(\"opportunity_score\", 0) >= 80:\n"
    "                gerar_offer_book_mini(analysis, article)"
)

if IMPORT_ANCHOR not in src:
    print("[patch] ERRO: âncora de import não encontrada em main.py.")
    print("main.py foi editado manualmente — patch abortado por segurança.")
    raise SystemExit(1)

if CALL_ANCHOR not in src:
    print("[patch] ERRO: âncora do bloco save_opportunity não encontrada em main.py.")
    print("main.py foi editado manualmente — patch abortado por segurança.")
    raise SystemExit(1)

new_src = src.replace(IMPORT_ANCHOR, IMPORT_NEW, 1)
new_src = new_src.replace(CALL_ANCHOR, CALL_NEW, 1)

backup_path = main_path.with_suffix(f".py.bak-{__import__('datetime').datetime.now().strftime('%Y%m%d%H%M%S')}")
backup_path.write_text(src, encoding="utf-8")
main_path.write_text(new_src, encoding="utf-8")

print(f"[patch] backup salvo em {backup_path}")
print("[patch] main.py atualizado com sucesso.")
PATCHER

echo
echo "=== TESTE 1: rodando main.py de verdade ==="
BEFORE_FILES=$(ls -1 "$OUTPUT_DIR" 2>/dev/null | wc -l)
python3 main.py || echo "(main.py terminou com erro — ver saída acima)"
AFTER_FILES=$(ls -1 "$OUTPUT_DIR" 2>/dev/null | wc -l)

if [ "$AFTER_FILES" -gt "$BEFORE_FILES" ]; then
  echo
  echo "=== OFFER BOOK GERADO POR ACIONAMENTO REAL (score >= 80 no brief) ==="
  ARQUIVO_MAIS_RECENTE=$(ls -1t "$OUTPUT_DIR" | head -n 1)
  echo "Arquivo: $OUTPUT_DIR/$ARQUIVO_MAIS_RECENTE"
  cat "$OUTPUT_DIR/$ARQUIVO_MAIS_RECENTE"
else
  echo
  echo "=== NENHUM item do brief atingiu score >= 80 nesta rodada ==="
  echo "=== TESTE 2: SIMULAÇÃO MANUAL (score fictício 85 — NÃO é acionamento real) ==="
  python3 <<'SIMUL'
from offer_book_mini import gerar_offer_book_mini

# ATENÇÃO: isto é uma simulação manual para validar a função isoladamente.
# Não representa uma oportunidade real detectada pelo Intelligence Engine.
analysis_ficticio = {
    "titulo": "TESTE SIMULADO - validacao da funcao gerar_offer_book_mini",
    "mercado": "Simulacao - nao e dado real",
    "problema_pago": "Este e um teste manual, nao uma oportunidade real",
    "oportunidade": "Validar que a funcao gera e salva o arquivo corretamente",
    "opportunity_score": 85,
}
resultado = gerar_offer_book_mini(analysis_ficticio, article={"title": analysis_ficticio["titulo"]})
if resultado is None:
    print("[SIMULACAO] falhou — ver erro acima (provavelmente ANTHROPIC_API_KEY).")
else:
    print("[SIMULACAO] sucesso — arquivo gerado via chamada manual, score ficticio.")
SIMUL
  ARQUIVO_SIMULADO=$(ls -1t "$OUTPUT_DIR" | head -n 1)
  echo
  echo "=== CONTEÚDO DO ARQUIVO (GERADO POR SIMULAÇÃO MANUAL, NÃO ACIONAMENTO REAL) ==="
  echo "Arquivo: $OUTPUT_DIR/$ARQUIVO_SIMULADO"
  cat "$OUTPUT_DIR/$ARQUIVO_SIMULADO"
fi

echo
echo "=== RESUMO ==="
echo "Arquivos em $OUTPUT_DIR:"
ls -la "$OUTPUT_DIR"
