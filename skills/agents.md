# Skill: agents — padrão de construção de agentes O6

Use esta skill **antes de criar qualquer agente novo**. Ela documenta o padrão I/O canônico, a chamada Claude, a persistência em Supabase e o deploy estático em Vercel — todos batidos em produção via `/api/prospects/pipeline` e `/api/prospects/demo`.

---

## 1. O que é um agente O6

Agente O6 = **rota Next.js (`app/api/<scope>/<name>/route.ts`) que:**

1. Recebe input estruturado (POST body) ou trigger externo
2. Lê contexto de uma ou mais tabelas Supabase
3. Chama Claude (ou cadeia de Claude + serviços externos)
4. Persiste resultado de volta em Supabase
5. Opcionalmente publica um artefato externo (Vercel, WhatsApp, email)
6. Retorna o resultado pro caller (ou trigger próximo agente)

Não é classe, não é framework. **É uma route** com pattern compartilhado.

---

## 2. Padrão I/O

| Aspecto | Convenção |
|---|---|
| **Método** | `POST` sempre. `GET` retorna 405 (exceto smoke test `?test=1`) |
| **Body in** | JSON com `{ <entity>_id: string, force?: boolean, ...flags }`. Ex.: `{ prospect_id, force, skipDemo }` |
| **Body out (sucesso)** | JSON com dados do agente + `cached?: boolean` + `generatedAt?: string` |
| **Body out (erro)** | `{ error: string }` com mensagem humana |
| **Cache** | Cache-by-default. Se já existe resultado < 7 dias em DB, retorna sem chamar Claude. `force=true` regenera. |
| **Persist** | Fail-soft: se UPDATE falha, retorna resultado mesmo assim. Log o erro mas não bloqueia o response. |
| **Status codes** | 200 sucesso · 400 input ruim · 404 recurso · 502 falha externa · 503 config faltando · 500 inesperado |
| **`maxDuration`** | export const adequado ao boundary mais lento (Vercel Pro+: 300s ceiling) |
| **Logs** | Prefixo `[scope/name]` em toda linha pra grep fácil |

---

## 3. Chamada Claude (canônica)

Padrão **direto via `fetch`** (sem SDK) para casos simples:

```typescript
async function callClaude(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY não configurada");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,                      // ajustar por uso (ver tabela)
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Claude ${res.status}: ${txt.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; text: string }>;
    stop_reason?: string;
    usage?: { input_tokens?: number; output_tokens?: number };
  };

  // Log raw response APENAS em debug (não em produção sem flag)
  // console.log(`[agent] stop_reason=${data.stop_reason} usage=${JSON.stringify(data.usage)}`);

  const text = data.content?.[0]?.text?.trim() ?? "";
  if (!text) throw new Error(`Claude vazio (stop_reason=${data.stop_reason})`);

  // Strip de fences markdown se prompt pediu texto puro
  return text
    .replace(/^```(?:json|markdown|html)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}
```

### `max_tokens` por caso

| Caso | Tokens |
|---|---|
| Opener WhatsApp (3-4 linhas) | 600 |
| Síntese estratégica (4 campos JSON curto) | 2048 |
| Engine completo (sintese + plano + roadmap + insights) | 6144 |
| HTML landing page (10-15k chars de markup + CSS) | 20000 |

### Prompt JSON output (regra fundamental)

Sempre terminar com:
```
Responda APENAS com o objeto JSON. Sem markdown. Sem comentários. Sem texto antes ou depois.
```

E **sempre** validar:
```typescript
function validateOutput(raw: unknown): raw is ExpectedShape {
  if (!raw || typeof raw !== "object") return false;
  const o = raw as Record<string, unknown>;
  if (typeof o.campo1 !== "string") return false;
  // ... mais checks
  return true;
}
```

Se Claude embrulhar em fences ```` ```json ```` apesar das instruções, strip antes de `JSON.parse`. Se a estrutura for inválida, **lance erro com primeiros 300 chars da resposta** pra debug.

### `claude-opus-4-8` exceção

Usado **só** em `/api/offer-book/generate` por decisão Sprint 4. Adaptive thinking + outputs longos (~$0.03/geração). Não estender para agentes novos sem aprovação.

---

## 4. Persistência em Supabase

### Cliente inline (rotas server-side)

```typescript
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } },
);
```

> **Observação:** rotas API usam `createClient` direto. Componentes client-side usam `getSupabase()` de `app/offer-book/_lib/supabase.ts` (singleton com hidratação tolerante).

### Cache lookup

```typescript
const cacheCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

const { data: cached } = await sb
  .from("table_cache")
  .select("col1, col2, created_at")
  .eq("cliente_id", clienteId)
  .gte("created_at", cacheCutoff)
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle();

if (cached && !force) {
  return NextResponse.json({ ...cached, cached: true });
}
```

### Persist com fail-soft

```typescript
const { error: updErr } = await sb
  .from("prospects")
  .update({
    field1: result.field1,
    field2: result.field2,
    generated_at: new Date().toISOString(),
  })
  .eq("id", prospect_id);

if (updErr) {
  // Log mas NÃO retornar erro — o agente já fez o trabalho.
  // O custo da chamada Claude já foi pago.
  console.error("[scope/name] persist failed:", updErr);
}

return NextResponse.json({ ...result, cached: false });
```

### Migration para novas colunas

**Toda coluna nova exige migration nomeada** em `supabase/migrations/NNN_<descricao>.sql`. Aplicar via Supabase MCP `apply_migration` (preferido) ou `execute_sql` (fallback). **Sempre criar o arquivo** mesmo se aplicar via MCP — histórico.

```sql
alter table public.prospects
  add column if not exists audit_score          int,
  add column if not exists audit_json           jsonb,
  add column if not exists abertura_whatsapp    text,
  add column if not exists abordagem_gerada_em  timestamptz;

create index if not exists prospects_audit_score_idx
  on public.prospects (audit_score desc) where audit_score is not null;
```

---

## 5. Deploy de artefato em Vercel (HTML estático)

Padrão completo em `app/api/prospects/demo/route.ts`. Resumo:

### Pré-requisitos

- `VERCEL_TOKEN` em `.env.local` (criar em https://vercel.com/account/tokens, scope: Full Account)
- Conta northstar: detecção automática de `teamId` via `/v2/user` na primeira chamada

### Fluxo

```
1. Detectar teamId   →  GET /v2/user                                (cache em memória)
2. Upload do arquivo →  POST /v2/files?teamId=...                   (SHA1 digest header)
3. Criar deployment  →  POST /v13/deployments?teamId=...
   ↓
4. Disable SSO       →  PATCH /v9/projects/<id>?teamId=...          (BEFORE polling)
                        body: { ssoProtection: null, passwordProtection: null }
5. Poll READY        →  GET /v13/deployments/<id>?teamId=...        (2s × 15 tentativas)
6. Devolver URL      →  alias estável se READY, ephemeral senão
```

### Pegadinhas críticas

1. **`?teamId=` em TODA chamada** — contas northstar exigem. Sem isso, undici retorna "fetch failed" sem status (debug fica impossível).

2. **`x-vercel-digest: <sha1>`** — SHA1 é a convenção Vercel CLI. SHA256 também funciona se o `files[].sha` no deploy body bater.

3. **Não setar `Content-Length` manualmente** — undici calcula da Buffer. Setar manual causa `ERR_HTTP_INVALID_HEADER_VALUE` esporádico no Node 22+.

4. **SSO disable ANTES do poll** — projetos novos em Hobby team default `ssoProtection: "all"`. Sem PATCH, alias responde 401 quando vai READY.

5. **Polling de READY antes de devolver URL** — o create call retorna `aliasAssigned: false`. Devolver URL antes do alias estar wired = callers vêem 404.

6. **`err.cause` unwrap** — wrap toda fetch em `try/catch` e logue `(err.cause as any).code + .message`. Sem isso, todo erro de transporte vira "fetch failed" opaco.

### Smoke test obrigatório

Crie endpoint `GET /api/<scope>/<name>?test=1&dry=1` que valida só auth/teamId, e `?test=1` que faz deploy com HTML hardcoded **sem chamar Claude**. Isola deploy infra de generation infra na hora do debug.

---

## 6. Exemplo de agente completo

**Caso**: agente "demo" que pega um prospect, gera landing page com Claude, faz deploy em Vercel, persiste URL.

Estrutura (copie de `app/api/prospects/demo/route.ts`):

```typescript
// 1. Imports + maxDuration
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
export const maxDuration = 120;

// 2. Types
type Input = { prospect_id: string; force?: boolean };
type ProspectRow = { /* ... */ };

// 3. Build prompt (pure function, pt-BR, instruções explícitas)
function buildPrompt(p: ProspectRow): string { /* ... */ }

// 4. Robust extraction (Claude output handler)
function extractHtmlFromResponse(raw: string): { html: string; source: string } {
  // Branch 1: fenced ```html ... ```  → exige <!doctype ou <html dentro
  // Branch 2: slice DOCTYPE → end, auto-close </body>/</html> se truncado
  // Branch 3: wrap em shell minimal como último recurso
}

// 5. Chamada Claude
async function generateHtml(p: ProspectRow): Promise<string> { /* fetch + extract */ }

// 6. Deploy Vercel (com teamId, polling, SSO disable, debug logs)
async function deployToVercel(projectName: string, html: string): Promise<string> { /* ... */ }

// 7. POST handler
export async function POST(req: NextRequest) {
  // 7.1 parse body
  // 7.2 validate env (ANTHROPIC_API_KEY, VERCEL_TOKEN, SUPABASE)
  // 7.3 init supabase
  // 7.4 read prospect
  // 7.5 cache check (force=false + already has demo_url < 7d → return cached)
  // 7.6 generateHtml → catch 502
  // 7.7 deployToVercel → catch 502
  // 7.8 persist demo_url + demo_generated_at (fail-soft)
  // 7.9 return { url, projectName }
}

// 8. Smoke test
export async function GET(req: NextRequest) {
  const test = req.nextUrl.searchParams.get("test");
  if (!test) return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  // ?dry=1 → só team scope
  // sem dry → deploy de HTML hardcoded sem Claude
}
```

---

## 7. Niche definitions

O6 atende dois grandes verticais; copy, preço e tom dos agentes mudam por nicho.

### 🩺 Saúde / Estética (default)

- **Sub-nichos**: clínicas de estética, odontologia, fisioterapia, dermatologia, harmonização facial
- **Ticket médio cliente**: R$ 2.500 — R$ 5.000
- **Decisão de compra**: emocional, ciclo curto (1-3 semanas)
- **Linguagem**: acolhedora, "cuidar de você", "sentir-se bem"
- **Gatilhos**: prova social local, foto antes/depois, depoimento em vídeo
- **Objeções típicas**: "será que funciona pra mim?", "tenho medo de não dar certo"
- **CTA**: "Agendar Avaliação" / "Marcar Consulta" (nunca "Compre agora")

### ⚖️ Advocacia

- **Sub-nichos**: trabalhista, previdenciário, família, tributário, criminal
- **Ticket médio cliente**: R$ 3.000 — R$ 15.000 (depende de área)
- **Decisão de compra**: racional + autoridade, ciclo médio (2-8 semanas)
- **Linguagem**: técnica mas acessível, "seus direitos", "tranquilidade jurídica"
- **Gatilhos**: autoridade (OAB, anos de experiência, cases), notícias de mudança legislativa
- **Objeções típicas**: "vou perder ou ganhar?", "vou pagar quanto?", "vai demorar muito?"
- **CTA**: "Solicitar Análise" / "Consultar Especialista" (nunca "Contratar agora")

Agentes devem **detectar nicho via `prospect.categoria`** ou tag explícita e ajustar tom + CTA accordingly.

---

## 8. Pricing (referência interna)

Não expor no produto direto, mas agente de proposta usa esses valores:

| Item | Valor | Observação |
|---|---|---|
| **Diagnóstico inicial** | R$ 800 | Pacote único: audit + síntese + plano de ação. Cobra o trabalho do Offer Book v1. |
| **Mensalidade recorrente** | R$ 1.500/mês | Plataforma + atualizações + 1 demo/audit por mês. Ciclo mínimo de 6 meses. |
| **Setup** | R$ 0 | Diluído no diagnóstico inicial. |
| **Onboarding** | R$ 0 | Incluso na mensalidade. |

Para Codex/agente de proposta: se prospect score < 40 (audit ruim), oferecer com **desconto de 30%** no diagnóstico (R$ 560) pra acelerar entrada. Se score > 70 (operação madura), focar apenas em mensalidade (sem diagnóstico).

---

## 9. Anti-padrões (não faça)

- ❌ Criar rota nova chamando OpenAI. Sempre Claude.
- ❌ Hardcodear `prospectId` no prompt — use template do body.
- ❌ Esquecer cache check — toda chamada Claude custa $$.
- ❌ Devolver Vercel URL antes do polling READY — 404 garantido pra caller.
- ❌ Salvar `audit_json` como string — é JSONB, salve como objeto.
- ❌ Validar input só na UI — sempre validar no route também.
- ❌ Logar key de API em produção — só máscara `key.slice(0, 8) + "..."` se precisar diagnóstico.
- ❌ Bloquear response em failure de persist — fail-soft é regra.

---

## 10. Checklist antes de PR

- [ ] Migration aplicada via MCP **e** arquivo `.sql` em `supabase/migrations/`
- [ ] Route compila sem warnings: `npx tsc --noEmit -p .`
- [ ] Smoke test (`?test=1&dry=1`) retorna 200
- [ ] Smoke test (`?test=1`) deploya e URL responde 200
- [ ] Teste com prospect real retorna 200 + estado coerente em DB
- [ ] Memory file atualizado (`memory/<modulo>.md`)
- [ ] CLAUDE.md atualizado se decisão de design nova foi tomada
- [ ] Commit com prefixo `feat(<scope>):` e verification no body
