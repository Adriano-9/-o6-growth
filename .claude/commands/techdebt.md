# /techdebt

Auditar o projeto em busca de dívida técnica acumulada. Gerar relatório priorizado por impacto. Não corrigir nada — só diagnosticar.

## Comportamento obrigatório

1. **Não editar nada.** Read-only. Zero mudança de arquivo, zero refactor, zero exclusão.
2. **Evidência real.** Todo achado precisa de path + linha ou contagem concreta. Sem suposição.
3. **Priorização por impacto.** Ordenar dentro de cada categoria: P1 (bloqueia / causa bug) → P2 (acumula custo) → P3 (cosmético).
4. **Quantificar.** "3 arquivos não utilizados" > "alguns arquivos não utilizados".

## Processo de auditoria (executar antes de responder)

### Passo 1 — Mapa do projeto
```
Glob("app/**/*.{ts,tsx}")        → lista de todas as rotas e componentes
Glob("components/**/*.{ts,tsx}") → componentes legados
Glob("app/**/_lib/*.{ts,tsx}")   → libs por módulo
Glob("app/**/_components/*.tsx") → componentes por módulo
Read("package.json")             → dependências declaradas
Read("CLAUDE.md")                → regras e não-objetivos
```

### Passo 2 — Código duplicado
- Grep por funções com assinatura similar entre módulos (`parseNumber`, `parsePercent`, `BRL`, `formatDate`, mappers `rowTo*`, `*ToRow`)
- Verificar se existe mais de uma declaração de `createClient` do Supabase
- Identificar inline utilities que aparecem em ≥ 2 arquivos e ainda não foram extraídas para `_lib/`

### Passo 3 — Componentes duplicados
- Comparar `app/offer-book/_components/*.tsx` vs `components/o6/*.tsx` vs outros `_components/`
- Verificar se alguma página cria componente local que já existe globalmente (ex.: botão CTA, badge de score, label micro)
- Checar se `FormShell` / `Field` / `ScoreCard` foram recriados em alguma rota em vez de importados

### Passo 4 — Rotas mortas
- Listar todos os `app/**/page.tsx` via Glob
- Para cada rota, Grep por referência no código (`href=`, `Link href`, `router.push`, `window.location`)
- Marcar rotas sem referência de entrada como "potencialmente órfãs" (confirmar antes de declarar morta)
- Verificar `app/page.tsx` (landing legada) — ainda está linkada de algum lugar?

### Passo 5 — Dependências inúteis
- Read `package.json` → lista de `dependencies` + `devDependencies`
- Grep cada pacote no codebase (`import .* from 'nome-do-pacote'`)
- Atenção especial: `framer-motion` (usado em landing legada, verificar se também no OS), qualquer pacote com 0 hits
- Verificar se `@supabase/supabase-js` é importado diretamente em algum lugar além de `_lib/supabase.ts` (deveria ser 1 lugar só)

### Passo 6 — Arquivos não utilizados
- Para cada arquivo em `app/**` e `components/**`, Grep pelo nome do export default no restante do codebase
- Marcar como "candidato a remoção" se zero imports encontrados
- Excluir da análise: `layout.tsx`, `page.tsx`, `globals.css`, arquivos de config (são carregados pelo framework, não por import)
- Verificar `components/o6/*.tsx` — componentes da landing legada ainda são usados em `app/page.tsx`?

### Passo 7 — Candidatos a extração (regra 4ª duplicação)
- Verificar `BRL` formatter: quantos arquivos o declaram inline? (regra: 4ª ocorrência → extrair para `_lib/format.ts`)
- Verificar `parseNumber` / `parsePercent` / `targetConversion`: quantas cópias existem?
- Verificar `actionByScore` / `actionByAuditAxis`: ainda inline ou já extraído?
- Verificar `formatDate`: quantas implementações diferentes?

## Relatório (formato obrigatório)

```
# Tech Debt Report — [data]
Projeto: [nome] | Arquivos analisados: [n] | Achados: [n]

─────────────────────────────────────────────────────
## 1. CÓDIGO DUPLICADO
─────────────────────────────────────────────────────
[Para cada achado:]
[P1/P2/P3] Nome do símbolo
  Ocorrências: arquivo:linha, arquivo:linha, ...
  Impacto: [o que quebra ou acumula se deixar assim]
  Solução: [extrair para X / consolidar em Y]

─────────────────────────────────────────────────────
## 2. COMPONENTES DUPLICADOS
─────────────────────────────────────────────────────
[Para cada achado:]
[P1/P2/P3] NomeDoComponente
  Duplicatas: arquivo A, arquivo B
  Canônico: [qual manter e por quê]
  Deletar: [qual remover]

─────────────────────────────────────────────────────
## 3. ROTAS MORTAS
─────────────────────────────────────────────────────
[Para cada rota:]
[P1/P2/P3] /caminho/da/rota  (app/caminho/page.tsx)
  Referências encontradas: [n]
  Status: ÓRFÃ CONFIRMADA / SUSPEITA (verificar manualmente)
  Ação: remover / adicionar link de entrada

─────────────────────────────────────────────────────
## 4. DEPENDÊNCIAS INÚTEIS
─────────────────────────────────────────────────────
[Para cada pacote:]
[P1/P2/P3] nome-do-pacote  (dependencies / devDependencies)
  Usos encontrados: [n hits] em [arquivos]
  Status: SEM USO / USO ÚNICO SUSPEITO / PODE REMOVER
  Ação: npm uninstall / investigar

─────────────────────────────────────────────────────
## 5. ARQUIVOS NÃO UTILIZADOS
─────────────────────────────────────────────────────
[Para cada arquivo:]
[P1/P2/P3] caminho/do/arquivo.tsx
  Exports: [nome dos exports]
  Referências no codebase: 0
  Ação: remover / arquivar

─────────────────────────────────────────────────────
## 6. CANDIDATOS A EXTRAÇÃO
─────────────────────────────────────────────────────
[Para cada símbolo inline duplicado:]
Símbolo: [nome]
  Cópias: [n] em [arquivos]
  Extrair para: [path sugerido]
  Prioridade: [agora / próxima iteração / aceitável]

─────────────────────────────────────────────────────
## SUMÁRIO EXECUTIVO
─────────────────────────────────────────────────────
Críticos (P1): [n]  → resolver antes do próximo deploy
Médios   (P2): [n]  → resolver na próxima iteração
Baixos   (P3): [n]  → backlog

Estimativa de esforço:
  Rápidos (< 30 min): [lista]
  Médios  (1-2h):     [lista]
  Longos  (> 2h):     [lista]

Recomendação de ordem: [top 3 achados pra atacar primeiro]
```

## Critérios de prioridade

| Prioridade | Critério |
|---|---|
| **P1** | Causa bug silencioso, corrompe dados, cria comportamento divergente entre módulos, ou viola regra crítica do CLAUDE.md (ex: `createClient` duplicado) |
| **P2** | Acumula custo de manutenção, cria risco de divergência futura, dificulta onboarding de agente novo |
| **P3** | Código morto sem consequência imediata, nomenclatura inconsistente, comentário obsoleto |

## Regras do relatório

- **Só achados com evidência.** Sem grep confirmado = não listar.
- **Falsos positivos são piores que omissões.** Se não tiver certeza, marcar como "SUSPEITA" e pedir verificação manual.
- **Não misturar diagnóstico com solução.** Relatório = o que está errado. A correção vem depois, se o usuário pedir.
- **Layout files e page.tsx não são arquivos não utilizados.** São entry points do framework.
- **Componentes da landing legada (`components/o6/*`) podem parecer mortos mas são usados em `app/page.tsx`.** Confirmar antes de listar.

## Pós-relatório

Encerrar com a pergunta:

> "Quer que eu priorize e corrija os P1s agora, ou prefere revisar o relatório completo primeiro?"

Não corrigir nada sem instrução explícita. Se o usuário pedir correção, usar `/challenge` nos achados P1 antes de tocar o código.
