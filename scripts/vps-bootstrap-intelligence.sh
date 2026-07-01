#!/usr/bin/env bash
# O6 Intelligence Engine — VPS bootstrap (one-shot)
# Cole inteiro no console root do VPS 147.182.135.206
# Idempotente: roda 2x sem quebrar
#
# Copy this file and fill in the real values before running on VPS
# Real values are stored in /opt/o6-intelligence/.env on the server
set -euo pipefail

BASE=/opt/o6-intelligence
mkdir -p "$BASE/logs" "$BASE/data"
cd "$BASE"

# ── 1. requirements.txt ──
cat > requirements.txt <<'REQ'
anthropic
feedparser
requests
supabase
python-dotenv
REQ

# ── 2. feeds.json ──
cat > feeds.json <<'FEEDS'
{
  "feeds": [
    "https://hnrss.org/newest?q=AI+business",
    "https://venturebeat.com/category/ai/feed/",
    "https://techcrunch.com/category/artificial-intelligence/feed/",
    "https://openai.com/news/rss.xml",
    "https://www.anthropic.com/news/rss.xml",
    "https://feeds.feedburner.com/entrepreneur/latest",
    "https://hbr.org/resources/rss/commerce-and-markets-feed",
    "https://hnrss.org/newest?q=startup+growth"
  ]
}
FEEDS

# ── 3. .env (chmod 600) ──
cat > .env <<'ENV'
ANTHROPIC_API_KEY=<YOUR_ANTHROPIC_API_KEY>
SUPABASE_URL=<YOUR_SUPABASE_URL>
SUPABASE_KEY=<YOUR_SUPABASE_KEY>
TELEGRAM_TOKEN=<YOUR_TELEGRAM_TOKEN>
TELEGRAM_CHAT_ID=<YOUR_TELEGRAM_CHAT_ID>
ENV
chmod 600 .env

# ── 4. db.py ──
cat > db.py <<'PY'
from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

def save_intelligence(data):
    try:
        supabase.table("market_intelligence").insert(data).execute()
    except Exception as e:
        print(f"DB error: {e}")

def save_opportunity(data):
    try:
        existing = supabase.table("paid_problems").select("*").eq("problem", data["problem"]).execute()
        if existing.data:
            supabase.table("paid_problems").update({"frequency": existing.data[0]["frequency"] + 1}).eq("id", existing.data[0]["id"]).execute()
        else:
            supabase.table("paid_problems").insert(data).execute()
    except Exception as e:
        print(f"DB opportunity error: {e}")
PY

# ── 5. collector.py ──
cat > collector.py <<'PY'
import feedparser, json

def collect_news():
    with open("/opt/o6-intelligence/feeds.json") as f:
        feeds = json.load(f)["feeds"]
    articles = []
    for url in feeds:
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:3]:
                articles.append({
                    "title": entry.get("title", ""),
                    "summary": entry.get("summary", "")[:500],
                    "link": entry.get("link", ""),
                    "source": feed.feed.get("title", url),
                })
        except Exception as e:
            print(f"Feed error {url}: {e}")
    return articles[:20]
PY

# ── 6. analyzer.py ──
cat > analyzer.py <<'PY'
import anthropic, json, os
from dotenv import load_dotenv

load_dotenv()
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

PROMPT = """Voce e o O6 Intelligence Analyst.
Sua funcao nao e resumir noticias.
Sua funcao e detectar oportunidades de negocio para o mercado brasileiro.

Para a noticia abaixo, retorne APENAS JSON valido com esta estrutura:
{
  "titulo": "titulo em portugues",
  "resumo_executivo": "2 linhas maximo",
  "mercado": "mercado impactado",
  "problema_pago": "problema que empresas pagam para resolver",
  "oportunidade": "oportunidade de negocio especifica",
  "risco": "principal risco",
  "acao": "acao recomendada para o O6 Growth",
  "opportunity_score": 0-100,
  "confidence_score": 0-100
}

Noticia: {news}
"""

def analyze(article):
    try:
        news_text = f"Titulo: {article['title']}\nResumo: {article['summary']}"
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=800,
            messages=[{"role": "user", "content": PROMPT.replace("{news}", news_text)}],
        )
        text = response.content[0].text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception as e:
        print(f"Analyze error: {e}")
        return None
PY

# ── 7. telegram_sender.py ──
cat > telegram_sender.py <<'PY'
import requests, os
from dotenv import load_dotenv

load_dotenv()

def send(items):
    token = os.getenv("TELEGRAM_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    header = "O6 Intelligence Brief\n" + "-" * 25 + "\n\n"
    messages = [header]
    for item in items[:5]:
        score = item.get("opportunity_score", 0)
        emoji = "FIRE" if score >= 80 else "BOLT" if score >= 60 else "BAR"
        msg = f"[{emoji}] *{item.get('titulo','')}*\n"
        msg += f"Mercado: {item.get('mercado','')}\n"
        msg += f"Problema: {item.get('problema_pago','')}\n"
        msg += f"Oportunidade: {item.get('oportunidade','')}\n"
        msg += f"Acao: {item.get('acao','')}\n"
        msg += f"Score: {score}/100\n" + "-" * 20 + "\n"
        messages.append(msg)
    requests.post(
        f"https://api.telegram.org/bot{token}/sendMessage",
        json={"chat_id": chat_id, "text": "\n".join(messages), "parse_mode": "Markdown"},
    )
    print("Telegram sent.")
PY

# ── 8. main.py ──
cat > main.py <<'PY'
from collector import collect_news
from analyzer import analyze
from telegram_sender import send
from db import save_intelligence, save_opportunity
from datetime import datetime

def run():
    print(f"[{datetime.now()}] O6 Intelligence Engine starting...")
    articles = collect_news()
    print(f"Collected {len(articles)} articles")
    results = []
    for article in articles:
        analysis = analyze(article)
        if analysis and analysis.get("opportunity_score", 0) >= 60:
            results.append(analysis)
            save_intelligence({
                "title": analysis.get("titulo"),
                "market": analysis.get("mercado"),
                "paid_problem": analysis.get("problema_pago"),
                "opportunity": analysis.get("oportunidade"),
                "risk": analysis.get("risco"),
                "action": analysis.get("acao"),
                "opportunity_score": analysis.get("opportunity_score"),
                "confidence_score": analysis.get("confidence_score"),
                "raw_news": article.get("title"),
                "ai_analysis": analysis,
            })
            save_opportunity({
                "market": analysis.get("mercado"),
                "problem": analysis.get("problema_pago"),
                "score": analysis.get("opportunity_score"),
                "source": article.get("source", ""),
            })
    print(f"High-value items: {len(results)}")
    if results:
        send(results)
    else:
        send([{"titulo": "Sem oportunidades acima do score 60 hoje",
               "mercado": "-", "problema_pago": "-",
               "oportunidade": "-", "acao": "Revisar feeds",
               "opportunity_score": 0}])

if __name__ == "__main__":
    run()
PY

# ── 9. install deps ──
pip3 install -r requirements.txt --break-system-packages

# ── 10. cron (idempotente) ──
CRON_LINE="0 6 * * * /usr/bin/python3 /opt/o6-intelligence/main.py >> /opt/o6-intelligence/logs/cron.log 2>&1"
( crontab -l 2>/dev/null | grep -vF "/opt/o6-intelligence/main.py"; echo "$CRON_LINE" ) | crontab -

# ── 11. test run ──
echo "=== TEST RUN ==="
python3 main.py

echo
echo "=== CRON ==="
crontab -l | grep o6-intelligence
echo
echo "=== DONE ==="
ls -la /opt/o6-intelligence/
