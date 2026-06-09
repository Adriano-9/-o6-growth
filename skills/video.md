# Skill: video — Gerador de vídeo de demo (placeholder)

> **Status: 📋 Planejado / Placeholder**
> Esta skill documenta o agente de vídeo planejado. Ainda **não implementado** porque depende da API do Higgsfield (pendente de acesso).
> Use o fallback **HTML+CSS animado em Vercel** quando a chamada principal não estiver disponível.

---

## Objetivo

Gerar um **vídeo curto (~15 segundos)** ou **página animada antes/depois** demonstrando para o prospect:
- O estado atual do site dele (com problemas destacados)
- O estado pós-O6 (demo gerada pela skill `agents` em `/api/prospects/demo`)
- Highlights do audit (3 piores eixos com badges visuais)

Esse artefato é anexado ao opener de WhatsApp (skill `agents` → `opener`) para aumentar a taxa de resposta inicial. Sem vídeo, opener é texto puro.

---

## Tool primário planejado: Higgsfield

| Aspecto | Plano |
|---|---|
| **Endpoint** | A definir — depende de qual API Higgsfield abre (text-to-video, image+text-to-video) |
| **Status acesso** | ⏳ Pendente. Quando estiver disponível, atualizar este arquivo + criar `app/api/prospects/video/route.ts` |
| **Custo estimado** | ~$0.10-0.50/vídeo (estimativa) — não confirmado até API liberar |
| **Tempo de geração** | 30-60s típico em produtos similares (Pika, Runway) |
| **Input** | Prompt textual descritivo + uma imagem (screenshot do site original ou da demo) |
| **Output** | URL de MP4 hospedado pelo provider |

### Quando Higgsfield estiver disponível

1. Criar `app/api/prospects/video/route.ts` seguindo padrão da skill `agents`
2. Adicionar `VIDEO_API_TOKEN` ou similar em `.env.local`
3. Migration `010_prospects_video.sql`:
   ```sql
   alter table public.prospects
     add column if not exists video_url           text,
     add column if not exists video_generated_at  timestamptz,
     add column if not exists video_provider      text;     -- "higgsfield" | "fallback-css"
   ```
4. UI: novo botão "Gerar Vídeo" no ProspectDrawer (entre "Gerar Abordagem" e "Gerar Demo")
5. Pipeline atualizado: opener WhatsApp pode incluir URL do vídeo se gerado

---

## Fallback (em produção enquanto Higgsfield não chega)

Página HTML estática com animações CSS, deployada no Vercel pelo mesmo helper de `app/api/prospects/demo/route.ts`. Não é vídeo real, mas comunica a mesma mensagem com link clicável.

### Estrutura sugerida

```
┌──────────────────────────────────────────┐
│  HEADER                                  │
│  "Como sua presença online pode ficar"   │
│  (animação fadeIn no load)               │
├──────────────────────────────────────────┤
│  COMPARAÇÃO ANTES / DEPOIS                │
│  ┌─────────────┬─────────────┐           │
│  │   ANTES     │   DEPOIS    │           │
│  │ screenshot  │ screenshot  │           │
│  │ + scores    │ + scores    │           │
│  │ baixos      │ altos       │           │
│  └─────────────┴─────────────┘           │
│  (CSS keyframes alternando hover)        │
├──────────────────────────────────────────┤
│  3 PROBLEMAS DESTACADOS                  │
│  - ${audit.recommendations[0].title}      │
│  - ${audit.recommendations[1].title}      │
│  - ${audit.recommendations[2].title}      │
│  (slide-in da esquerda staggered 0.3s)   │
├──────────────────────────────────────────┤
│  CTA                                     │
│  "Ver demo completa"                     │
│  ➜ link para prospect.demo_url            │
└──────────────────────────────────────────┘
```

### Input (caller passa para a rota)

```typescript
type VideoInput = {
  prospect_id: string;       // required
  force?: boolean;           // re-render mesmo se já existir
};
```

A rota lê de `prospects`:
- `nome`, `cidade`, `categoria` → header/branding
- `audit_json.overallScore`, `audit_json.recommendations` → comparação
- `audit_json.recommendations.slice(0, 3)` → 3 problemas
- `demo_url` → link do CTA

### Output

```typescript
type VideoOutput = {
  url: string;                          // URL Vercel da página animada
  provider: "higgsfield" | "fallback-css";
  durationSeconds?: number;             // 15 fixo no fallback CSS
  cached: boolean;
  generatedAt: string;
};
```

### Pseudocódigo do fallback CSS

Reusa `deployToVercel()` de `app/api/prospects/demo/route.ts`:

```typescript
export async function POST(req: NextRequest) {
  const { prospect_id, force = false } = await req.json();

  const sb = createClient(/* ... */);
  const { data: prospect } = await sb
    .from("prospects")
    .select("id, nome, cidade, categoria, audit_json, audit_score, demo_url, video_url, video_generated_at, video_provider")
    .eq("id", prospect_id)
    .maybeSingle();

  if (!prospect) {
    return NextResponse.json({ error: "Prospect não encontrado" }, { status: 404 });
  }

  // Cache check
  const cutoff = Date.now() - 7 * 86400 * 1000;
  if (!force && prospect.video_url && new Date(prospect.video_generated_at).getTime() > cutoff) {
    return NextResponse.json({
      url: prospect.video_url,
      provider: prospect.video_provider ?? "fallback-css",
      cached: true,
      generatedAt: prospect.video_generated_at,
    });
  }

  // Try Higgsfield first
  let videoUrl: string | null = null;
  let provider: "higgsfield" | "fallback-css" = "fallback-css";

  if (process.env.HIGGSFIELD_TOKEN) {
    try {
      videoUrl = await generateWithHiggsfield(prospect);
      provider = "higgsfield";
    } catch (err) {
      console.warn("[prospects/video] Higgsfield failed, falling back:", err);
    }
  }

  // Fallback: HTML + CSS animations
  if (!videoUrl) {
    const html = buildAnimatedPage(prospect);
    videoUrl = await deployToVercel(`o6-video-${toSlug(prospect.nome)}`, html);
  }

  // Persist (fail-soft)
  const { error: updErr } = await sb
    .from("prospects")
    .update({
      video_url: videoUrl,
      video_generated_at: new Date().toISOString(),
      video_provider: provider,
    })
    .eq("id", prospect.id);

  if (updErr) console.error("[prospects/video] persist failed", updErr);

  return NextResponse.json({
    url: videoUrl,
    provider,
    durationSeconds: provider === "fallback-css" ? 15 : undefined,
    cached: false,
    generatedAt: new Date().toISOString(),
  });
}
```

`buildAnimatedPage()` é uma função pura que monta HTML com:
- CSS variables tematizadas por `categoria` do prospect (azul para advocacia, verde-esmeralda para saúde)
- 3-4 `@keyframes` (fadeInUp, slideRight, pulseScore)
- Botão CTA gigante apontando para `prospect.demo_url`
- Footer "Gerado por O6 Growth" pequeno

### Quando NÃO chamar este agente

- Prospect sem audit (`prospect.audit_json IS NULL`) → audit primeiro
- Prospect sem demo (`prospect.demo_url IS NULL`) → demo primeiro
- Prospect com `status = "Fechado"` → cliente já entrou, vídeo é desnecessário

---

## Niche tuning (igual skill `agents`)

| Nicho | Paleta sugerida | Música/SFX (Higgsfield) | Tom |
|---|---|---|---|
| Saúde / Estética | Verde-esmeralda + branco + dourado suave | Suave, acolhedor, sem percussão forte | "Cuidado que transforma" |
| Advocacia | Azul-petróleo + cinza grafite + branco | Sóbrio, sem música ou tema institucional baixo | "Autoridade que protege" |
| Default (não detectado) | Cinza + acento ciano | Neutro | "Sua presença online merece mais" |

---

## Anti-padrões

- ❌ Não gerar vídeo sem audit prévio — fica conteúdo genérico, perde ponto
- ❌ Não fazer auto-trigger no audit (cascata audit→opener→demo→video sem pedir) — custo escapa rápido
- ❌ Não armazenar MP4 no Supabase Storage até confirmar que dimensão de payload está OK — URL externa Higgsfield é preferida
- ❌ Não chamar Higgsfield se `process.env.HIGGSFIELD_TOKEN` é vazio — pulle direto pro fallback
- ❌ Não regenerar dentro de 24h sem `force=true` — cache de fato

---

## Checklist de ativação (quando Higgsfield estiver disponível)

- [ ] Adicionar `HIGGSFIELD_TOKEN=` em `.env.local`
- [ ] Migration `010_prospects_video.sql` aplicada
- [ ] Route `app/api/prospects/video/route.ts` implementada seguindo skill `agents`
- [ ] Botão "Gerar Vídeo" no ProspectDrawer
- [ ] Pipeline pode incluir URL no opener WhatsApp
- [ ] Smoke test `?test=1` com HTML hardcoded antes de chamar Higgsfield
- [ ] Atualizar `CLAUDE.md` Agent Swarm Architecture table: `video` muda de 📋 Planejado para ✅ Produção
- [ ] Atualizar este arquivo: status no topo + remover "placeholder"
