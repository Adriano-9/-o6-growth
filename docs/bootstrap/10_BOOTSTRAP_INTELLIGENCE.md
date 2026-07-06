# 10 · Bootstrap Intelligence Engine

## Propósito

Documentar a arquitetura real do Intelligence Engine — coleta de notícias, análise de oportunidade via Claude, notificação, e a extensão recente (mini Offer Book) — separando o que roda de verdade do que foi só preparado.

## Status: 🟡 Em desenvolvimento

Código completo e testado localmente; implantação no VPS depende de o usuário colar os scripts no console (sem SSH disponível para Claude Code).

## Arquitetura (arquivos reais em `/opt/o6-intelligence/` no VPS)

```
feeds.json          → lista de RSS feeds (HN, VentureBeat, TechCrunch, Anthropic, HBR...)
collector.py         → parseia feeds, pega 3 entries por feed, limita a 20 artigos
analyzer.py          → chama Claude (claude-sonnet-4-6) por artigo, retorna JSON com score
telegram_sender.py   → formata e envia brief no Telegram (top 5 por score)
db.py                → persiste em Supabase (market_intelligence, paid_problems)
main.py              → orquestra o ciclo: collect → analyze → save → send
offer_book_mini.py   → 🟡 NOVO — gera mini Offer Book quando score >= 80
```

## Schema Supabase (migration `011_o6_intelligence_engine`)

| Tabela | Colunas-chave | Uso |
|---|---|---|
| `market_intelligence` | `title, market, paid_problem, opportunity, risk, action, opportunity_score, confidence_score, ai_analysis (jsonb)` | Histórico completo de análises |
| `paid_problems` | `market, problem, frequency, score, source` | Dedup por problema recorrente — incrementa frequência se já existe |
| `opportunities` | `market, opportunity, score, source` | Reservada, não usada ativamente pelo `main.py` atual |

Todas com RLS `anon all` — consistente com o resto do projeto.

## Ciclo de execução

```
cron 06:00 (não confirmado ativo no VPS — ver 06_BOOTSTRAP_HERMES.md)
     │
     ▼
collect_news() → 20 artigos
     │
     ▼
analyze(article) para cada um → Claude retorna JSON {opportunity_score, ...}
     │
     ├─ score >= 60 → save_intelligence() + save_opportunity()
     │                       │
     │                       ▼
     │              score >= 80 → 🟡 gerar_offer_book_mini() [NOVO]
     │
     ▼
send(top 5 por score) → Telegram
```

## Extensão nova: mini Offer Book (score >= 80)

**Módulo:** `offer_book_mini.py` (isolado, sem dependência de outros agentes)

**Contrato de saída (5 campos, JSON):**
```json
{
  "tese": "",
  "icp_sugerido": "",
  "oferta_sugerida": "",
  "primeiro_passo": "",
  "score_origem": 0
}
```

**Onde é salvo:** `/opt/o6-intelligence/offer_books_gerados/<data>_<slug-do-titulo>.json`

**Patch aplicado a `main.py`:** aditivo, não reescreve — 1 linha de import + 2 linhas de chamada condicional inseridas logo após o bloco `save_opportunity(...)` existente. Backup automático do `main.py` antes de qualquer alteração.

**Status de execução real:** 🟡 patch e módulo prontos e revisados (`scripts/vps-patch-offer-book-mini.sh`), **ainda não colado/rodado no VPS** — aguardando o usuário executar e reportar a saída (protocolo: não reportar sucesso sem prova real, incluindo o caso de simulação manual explícita se nenhum item do brief bater score >= 80 no teste).

## Regras de IA aplicáveis (herdadas de `AGENTS.md`)

- Modelo: `claude-sonnet-4-6` (mesmo do `analyzer.py` original — não trocar sem aprovação).
- Prompt em pt-BR, sempre pedindo "APENAS JSON, sem markdown".
- `max_tokens`: 800 para análise de brief, 500 para o mini Offer Book (mais compacto).

## Credenciais (nunca em texto plano no repositório)

`scripts/vps-bootstrap-intelligence.sh` foi sanitizado (commit `37ab2da`) para usar placeholders `<YOUR_*>` — as chaves reais vivem só em `/opt/o6-intelligence/.env` no servidor, nunca commitadas.

## Checklist antes de expandir o Intelligence Engine

- [ ] A mudança precisa reescrever `main.py` ou pode ser aditiva (novo módulo + patch cirúrgico)?
- [ ] O patch tem âncora de texto exata e aborta se o arquivo mudou externamente?
- [ ] Existe backup automático antes do patch?
- [ ] O teste real (não simulado) foi tentado antes de recorrer à simulação explícita?
