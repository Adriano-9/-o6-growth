# XRun — memory

Status: **🟡 ESCOPO INDEFINIDO** — placeholder.

Não tenho contexto sobre o que é XRun. Vi um projeto Supabase chamado `xrun-app` (`bqjsbopetcfdffcspvro`, region us-east-1, status INACTIVE) na conta da organização, mas nenhuma instrução chegou definindo escopo, objetivo ou relação com o O6 Growth OS.

## O que preencher quando o escopo for definido

1. **Identidade** — o que é XRun? Produto autônomo? Submódulo do O6? Tooling interno?
2. **Vertical / público-alvo** — mesmo dos verticais do O6 (Clínicas/Estética/Odonto/Fisio/Advogados) ou diferente?
3. **Stack** — herda Next 16 + Supabase + Tailwind do O6, ou diverge?
4. **Supabase** — usa o mesmo projeto `O6 growth` (`wphrwidjokimfjfvyaym`) ou o `xrun-app` separado (`bqjsbopetcfdffcspvro`)?
5. **Relação com OS** — compartilha clientes? compartilha CRM? compartilha auth quando vier?
6. **Charter** — qual problema resolve, qual a tese, qual o output que entrega ao cliente?

## Decisões pré-aceitas (herdadas do padrão O6, sujeitas a confirmação)

- TypeScript strict, Tailwind 4, lucide-react se UI dark SaaS.
- Migration nomeada `NNN_descricao_snake` via Supabase MCP.
- RLS anon all enquanto não houver auth UI.
- Scoring/lógica determinística (sem IA) até decisão contrária.

## Formato de entrada (a partir da primeira decisão real)

```
## YYYY-MM-DD · título curto

### Contexto
…

### Decisão
…

### Trade-off
…

### Paths tocados
…
```
