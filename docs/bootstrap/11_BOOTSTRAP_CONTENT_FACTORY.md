# 11 · Bootstrap Content Factory

## Propósito

Documentar o estado real (inexistente como pipeline) da produção de conteúdo em série, e o insumo já disponível que a viabiliza.

## Status: 🔴 Planejado

Não há rota, script ou agente que produza conteúdo em série hoje. O que existe é o **insumo**: o squad `copy`.

## Insumo disponível (🟢 instalado, 🔴 não conectado)

`squads/copy/` — 24 agents de copywriters lendários (Dan Kennedy, Eugene Schwartz, Gary Halbert, Jon Benson, David Ogilvy, entre outros), cada um com framework, voice patterns e templates próprios.

**Uso real já validado:** `app/_lib/copywriters.ts` destila 4 desses 24 agents (dan-kennedy, eugene-schwartz, gary-halbert, jon-benson) em "voice cards" compactos, injetados no prompt do opener WhatsApp (`/api/prospects/pipeline`) via parâmetro opcional `copywriter`.

**Por que não lê o `.md` completo em runtime:** cada arquivo de agent tem 1000+ linhas de YAML. Ler isso em cada cold start serverless seria caro. A destilação em `copywriters.ts` é o padrão correto — extrair só o que vai no prompt, manter o `.md` como referência humana.

## O que precisaria existir para virar Content Factory real

```
Trigger (ex.: cliente fechado, ou agendamento semanal)
     │
     ▼
Seleção do copywriter (baseado no nicho do cliente)
     │
     ▼
Prompt builder (reusar padrão de app/_lib/copywriters.ts)
     │
     ▼
Chamada Claude → N peças de conteúdo (posts, emails, scripts)
     │
     ▼
Persistência (Supabase — tabela nova, não existe ainda)
     │
     ▼
Aprovação humana (nunca publicar direto sem revisão)
```

## Decisão de arquitetura pendente

Antes de implementar, decidir:
1. Content Factory é uma rota Next.js (`/api/content/generate`) ou um script standalone (padrão `diagnostico-o6/`)?
2. Quem consome o conteúdo gerado — CRM (follow-up), Factory de LPs (copy da página), ou ambos?
3. Precisa de tabela Supabase própria (`content_generated`) ou reusa `offer_books` como JSONB?

## Checklist antes de implementar

- [ ] Escopo definido: conteúdo para qual canal (WhatsApp, email, redes sociais, LP)?
- [ ] Reusa `app/_lib/copywriters.ts` em vez de duplicar a lógica de voice card?
- [ ] Tem aprovação humana antes de qualquer publicação automática?
