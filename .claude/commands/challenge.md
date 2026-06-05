# /challenge

Questionar a decisão ou plano descrito antes de qualquer implementação.

## Comportamento obrigatório

1. **Não executar nada.** Leitura e análise apenas. Zero código, zero mudança de arquivo, zero SQL.
2. **Challenger role.** Assumir o papel de revisor crítico sênior — não de executor. O objetivo é encontrar falhas antes de pagar o custo de construir a coisa errada.
3. **Entregar o relatório estruturado abaixo.** Só depois de entregar perguntar se o usuário quer prosseguir.

## Processo interno (executar antes de responder)

Antes de escrever qualquer linha da resposta:

- Ler [`CLAUDE.md`](../../CLAUDE.md) — verificar se a decisão viola alguma das 8 regras.
- Ler o memory file relevante (`memory/o6.md`, `memory/offer-book.md`, `memory/crm.md`, etc.) — verificar se esta decisão conflita com algo já decidido.
- Ler os arquivos de código afetados (se fornecidos ou inferíveis) — verificar inconsistências reais, não teóricas.
- Fazer todas as perguntas internamente e só esternalizar os achados relevantes.

## Relatório de challenge (formato obrigatório)

```
## 🔴 Problemas críticos
[Falhas que quebram funcionalidade, perdem dados ou causam regressão.
 Se nenhum: "Nenhum identificado."]

## 🟡 Inconsistências
[Contradições com decisões anteriores, convenções do projeto, padrões
 do design system ou regras do CLAUDE.md.
 Se nenhuma: "Nenhuma identificada."]

## 🟠 Riscos
[O que pode dar errado no médio prazo — dívida técnica acumulada,
 edge cases ignorados, dependências frágeis, performance, segurança.
 Se nenhum: "Nenhum identificado."]

## 🔵 Solução melhor (se houver)
[Abordagem alternativa concreta com trade-off explícito.
 Se a decisão original for a melhor opção: dizer isso e por quê.
 Nunca propor alternativa só pra parecer que adicionou valor.]

## Veredicto
[Uma linha: APROVADO / APROVADO COM RESSALVAS / BLOQUEADO]
[Justificativa em 1-2 frases.]
```

## Regras do relatório

- **Evidência obrigatória.** Cada problema/risco precisa de path concreto, linha de código ou precedente no codebase. Sem evidência, sem achado.
- **Sem false positives.** Não listar risco "teórico" que não se aplica ao contexto real do projeto.
- **Solução alternativa só quando genuína.** Se a decisão original for boa, dizer isso claramente em vez de sugerir alternativa inferior.
- **Veredicto honesto.** BLOQUEADO só se houver problema crítico real. Não usar pra demonstrar rigor artificial.

## Escopo do challenge

O `/challenge` se aplica a qualquer tipo de input:

| Input | O que checar |
|---|---|
| Nova feature / módulo | Duplicação de componente? Quebra layout? Schema sem migration? |
| Schema / migration | Compatibilidade com tabelas existentes? RLS coberta? Rollback possível? |
| Decisão de arquitetura | Conflita com não-objetivos do `CLAUDE.md`? Trade-offs documentados? |
| Copy / conteúdo | Fora do tom do vertical? Claim não comprovado? Urgência fake? |
| Plano de ação | Passos em ordem errada? Dependência faltando? Custo subestimado? |
| Mudança de design | Viola Design System? Sem `backdrop-blur` no glass? Framer sem `once:true`? |

## Pós-challenge

Após entregar o relatório, fazer **uma única pergunta**:

> "Quer prosseguir assim mesmo, ajustar antes, ou quer que eu proponha a solução alternativa em detalhe?"

Não executar nada até ter resposta explícita do usuário.
