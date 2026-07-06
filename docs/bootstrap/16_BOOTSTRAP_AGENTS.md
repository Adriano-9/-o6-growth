# 16 · Bootstrap Agentes

## Propósito

Catálogo real de todos os agentes da O6 — nativos (rotas `/api/*`), importados (squads) e o padrão de orquestração usado hoje.

## Regra de comunicação entre agentes

> Via Supabase, nunca via fila/queue/Redis. Cada agente lê seu estado de uma tabela e escreve o próximo estado em coluna pré-acordada. Nada de webhooks Vercel→Vercel entre rotas O6 (uma rota pode chamar outra via `fetch` interno quando precisar, mas o caso normal é o caller orquestrar). Estado é a tabela, não há "agente A guarda contexto pra agente B".

Trigger hoje é **sempre humano** (clique no UI ou chamada manual da rota `pipeline`) — não há cron/scheduler rodando agentes de negócio ainda (só o Intelligence Engine tem cron, e mesmo esse depende do VPS estar com o cron ativo, não confirmado).

## Catálogo — agentes nativos O6

| Agente | Rota | Input | Output | Status |
|---|---|---|---|---|
| `audit` | `/api/audit` | `prospectId + auditUrl` | 7 scores + recomendações | 🟢 |
| `opener` | `/api/prospects/pipeline` | `prospectId` (lê audit) | Mensagem WhatsApp (+ voice card opcional) | 🟢 |
| `demo` | `/api/prospects/demo` | `prospectId` | Landing HTML deployada | 🟢 |
| `video` | `/api/prospects/video` | `prospectId` | Página animada antes/depois deployada | 🟢 |
| `sintese` | `/api/offer-book/sintese` | `clienteId` + state | 4 campos estratégicos | 🟢 |
| `generate` | `/api/offer-book/generate` | `clienteId` + state | Síntese + plano + roadmap + insights | 🟢 |
| `offer_book_mini` | `/opt/o6-intelligence/offer_book_mini.py` | analysis (score≥80) | Mini Offer Book 5 campos | 🟡 patch pronto, não executado |
| `proposta` | — | — | — | 🔴 |
| `outreach-wpp` | — | — | — | 🔴 |
| `outreach-email` | — | — | — | 🔴 |
| `onboarding` | — | — | — | 🔴 |

## Catálogo — squads importados (`squads/`)

| Squad | Agents | Wired em runtime? |
|---|---|---|
| `copy` | 24 (Kennedy, Schwartz, Halbert, Benson, Ogilvy...) | 🟡 parcial — 4 destilados em `app/_lib/copywriters.ts`, usados no opener |
| `deep-research` | 5 (research-chief, cochrane, higgins, ioannidis, kahneman) | 🔴 instalado, zero chamada em código |
| `offer-book` (squad) | 1 (offer-architect) | 🔴 instalado, auditado sem conflito, zero chamada em código |
| `design-extractor` | 1 | 🔴 instalado, Chromium baixado, zero chamada em código |
| `data-analysis` | 1 | 🔴 instalado, zero chamada em código |

Ver `19_BOOTSTRAP_SKILLS.md` para a diferença entre squad (agent importado, referência de voz/método) e skill (playbook nativo O6).

## Pipeline de orquestração real (o que acontece hoje, ponta a ponta)

```
Apify Search (humano dispara)
     │ insere em prospects
     ▼
[audit] ──── humano clica "Auditar" no ProspectDrawer
     │
     ▼
[opener] ──── humano clica "Gerar Abordagem" (ou chama /api/prospects/pipeline direto)
     │
     ├──► [demo] (dentro do mesmo pipeline, fail-soft se falhar)
     │
     ▼
Humano copia mensagem → envia manualmente no WhatsApp
     │
     ▼ (resposta do prospect, offline)
Humano promove pra CRM → Kanban
     │
     ▼ (fecha negócio)
Humano converte em Cliente → Offer Book
```

**Nenhum passo roda sozinho.** Sprint 8 (mencionado em `CLAUDE.md` como pendente) previa cron/scheduler + tabela `agent_runs` — não implementado.

## Idempotência (regra obrigatória para qualquer agente novo)

Toda rota agente deve aceitar `force?: boolean` e cachear por 7 dias por padrão. Re-rodar sem `force` retorna cache; com `force=true` regenera. Já aplicado em `demo`, `video`, `sintese`, `generate`.

## Checklist antes de criar um agente novo

- [ ] Ele fortalece um dos 6 pilares? Qual?
- [ ] O estado dele vive em uma tabela Supabase (não em memória/fila)?
- [ ] Aceita `force` e cacheia por padrão?
- [ ] Reusa `getSupabase()` e o padrão de rota de `AGENTS.md`?
- [ ] Foi registrado neste catálogo com status real?
