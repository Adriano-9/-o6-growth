# Playbook · Diagnóstico Completo O6

Processo comercial de diagnóstico em dois níveis (gratuito → pago), baseado no método já validado em campo com Carol (Jhun + Empório). Documento operacional: serve para executar manualmente hoje e para orientar automação futura.

**Convenção de status** (mesma do Bootstrap Pack): 🟢 real, já usado/testado · 🟡 parcial, existe mas incompleto · 🔴 não existe, não prometer.

---

## 1. Objetivo do Diagnóstico Simples (gratuito) 🟢

Auditoria **externa** do negócio — sem coletar nenhum dado do cliente, sem pedir acesso a nada. É o processo já usado hoje na prospecção:

- Análise do site (se existir): clareza da oferta, CTA, mobile, velocidade percebida
- Análise do Instagram: frequência de post, link na bio, destaque de contato, respostas visíveis a comentários
- Presença no Google (ficha do Google Maps, avaliações, horário atualizado)

**O que ele entrega:** 2-3 observações objetivas que o dono do negócio consegue confirmar sozinho ("seu link da bio não leva pra lugar nenhum", "sua ficha do Google está sem horário").

**O que ele NÃO é:** não mede tempo de resposta real, não conhece o funil interno, não estima impacto financeiro. É isca de valor + qualificação de interesse — não substitui o pago.

## 2. Objetivo do Diagnóstico Completo (pago) 🟢 método validado 1x

**Preço:** R$ 800 por negócio · R$ 1.200 no pacote de 2 negócios (caso real: Jhun + Empório da Carol).

Método real já validado em campo (não teoria):

1. **Teste manual de tempo de resposta via WhatsApp** — mandar mensagem real como cliente e cronometrar. Já executado 1x com o Empório: a resposta levou **mais de 1 hora** (esse dado virou o gancho central do diagnóstico).
2. **Entrevista estruturada com o cliente** — questionário de ~20 perguntas (ver seção 5), respondido pelo dono, sem acesso a sistemas.
3. **Síntese em relatório de gaps** — 3 gaps priorizados por negócio, com impacto financeiro estimado onde possível (ver seções 6-8).

**O que ele NÃO inclui:** acesso a sistemas do cliente, instalação de ferramenta, correção dos gaps (isso é o serviço seguinte — seção 9).

## 3. Quando oferecer o pago 🟢

Três gatilhos, por ordem de frequência esperada:

1. **Depois do diagnóstico gratuito revelar interesse** — o prospect respondeu, comentou, perguntou "e como resolve isso?"
2. **Quando o prospect pede mais profundidade** — "isso é só o site, e o resto?"
3. **Quando já existe relacionamento quente** — caso Carol: a relação pré-existente pulou o gratuito e foi direto ao pacote de 2 negócios.

Anti-padrão: oferecer o pago frio, sem o gratuito ter gerado reação. O gratuito é o qualificador.

## 4. Dados que preciso coletar 🟢 (via teste manual + entrevista — nunca via acesso a sistemas)

| Dado | Como coletar |
|---|---|
| Tempo de resposta por canal (WhatsApp, Instagram Direct, telefone se aplicável) | Teste manual cronometrado, como cliente anônimo, em horário comercial |
| Fluxo de reserva | Entrevista: como o cliente reserva hoje? Quantos passos? Onde trava? |
| Fluxo de delivery | Entrevista: canal, cardápio atualizado?, quem anota, tempo médio |
| Fluxo de consulta de eventos | Entrevista: como chega o pedido de orçamento de evento, quem responde, em quanto tempo |
| Recompra / retenção | Entrevista: % estimado de clientes que voltam, existe cadastro?, alguma ação ativa de retorno? |

Regra: tudo declarado pelo dono ou medido de fora. **Zero acesso a sistemas do cliente** nesta fase.

## 5. Perguntas obrigatórias 🟡 template existe, texto verbatim está fora deste repo

O questionário de ~20 perguntas usado com a Carol (Jhun + Empório) é o template canônico. **O texto verbatim das 20 perguntas não está versionado neste repositório** (vive na conversa/documento original) — colar aqui quando recuperado, para este playbook ficar autossuficiente. `<!-- TODO: colar as 20 perguntas originais do questionário Carol aqui -->`

Estrutura temática generalizada (para reproduzir com qualquer cliente enquanto o verbatim não é colado):

1. **Canais e atendimento** (~5 perguntas): por onde os clientes chegam, quem responde cada canal, horário de cobertura, o que acontece fora do horário, tempo de resposta que o dono *acha* que pratica
2. **Fluxos de venda** (~5 perguntas): passo a passo de reserva / delivery / evento (adaptar aos fluxos do negócio), onde o cliente desiste, pedido mais comum que se perde
3. **Base e retenção** (~4 perguntas): existe lista/cadastro de clientes, % que volta, última ação feita para trazer cliente de volta, data comemorativa/evento que move o negócio
4. **Oferta e preço** (~3 perguntas): produto mais vendido, mais lucrativo, o que o cliente elogia e o que reclama
5. **Operação e dono** (~3 perguntas): o que depende só do dono, maior gargalo na visão dele, o que ele faria com 2h/dia a mais

Regra de adaptação por vertical: mudar **terminologia e exemplos**, nunca a estrutura (mesmo princípio do Diagnosis Engine: núcleo único, vertical é camada de configuração).

## 6. Estrutura da análise 🟢

Por negócio, exatamente **3 gaps priorizados** — nem mais (dilui), nem menos (parece raso):

```
GAP #1 (maior impacto estimado)
├── O que está acontecendo (fato medido ou declarado — citar a fonte: "teste manual em DD/MM" ou "declarado na entrevista")
├── O que isso custa (estimativa em R$/mês quando possível — mostrar a conta, não só o número)
└── O que resolveria (1 frase, sem detalhar solução — o detalhe é o serviço pago seguinte)

GAP #2 e GAP #3: mesma estrutura.
```

Regra de honestidade do impacto financeiro: só estimar quando houver dois números reais para multiplicar (ex.: ticket médio declarado × pedidos perdidos estimados). Quando não houver, escrever "impacto não quantificável com os dados coletados" — nunca inventar um número para impressionar.

## 7. Critérios de pontuação 🟢 simples de propósito

**Tempo de resposta** (por canal, medido no teste manual):

| Faixa | Classificação |
|---|---|
| < 5 min | 🟢 Excelente |
| 5–30 min | 🟡 Aceitável |
| > 30 min | 🔴 Crítico (caso real Empório: >1h → crítico) |

**Severidade de gap** (pela estimativa de impacto em receita):

| Severidade | Critério |
|---|---|
| Alta | Impacto estimado relevante vs. faturamento declarado, ou perda direta de venda comprovada |
| Média | Impacto real mas indireto (retenção, recompra) ou não quantificável com precisão |
| Baixa | Fricção sem perda de venda demonstrável (estético, organizacional) |

Sem fórmula complexa nesta versão manual. Quando o processo for automatizado, os thresholds acima são o ponto de partida da configuração (compatível com o Diagnosis Engine em `app/_lib/diagnosis-engine/`, que já usa buckets de tempo semelhantes — mas a integração é futura, não existe hoje 🔴).

## 8. Modelo de relatório final 🟡 formato de referência existe, arquivo fora deste repo

Formato de referência: **Proposta_Carol_O6** — documento real já entregue. **O arquivo não está versionado neste repositório** — anexar/colar quando recuperado. `<!-- TODO: versionar Proposta_Carol_O6 (ou export PDF) em docs/playbooks/referencias/ -->`

Estrutura do relatório (reproduzível a partir do formato usado):

1. **Capa** — nome do negócio, data, "Diagnóstico Completo O6"
2. **Resumo executivo** — 3 frases: o que foi medido, o achado principal, o custo estimado de não agir
3. **Como o diagnóstico foi feito** — método transparente (teste manual + entrevista), datas dos testes
4. **Os 3 gaps** — estrutura da seção 6, um por página/bloco
5. **Score de tempo de resposta por canal** — tabela com os thresholds da seção 7
6. **Próximos passos recomendados** — os serviços da seção 9, apenas os que fazem sentido para os gaps encontrados (não listar tudo sempre)
7. **Fechamento** — validade da proposta, canal de contato

## 9. Próximos serviços recomendados 🟢 preços definidos · 🔴 um escopo indefinido

| Serviço | Preço | Status do escopo |
|---|---|---|
| Site simples | R$ 800 | 🟢 definido |
| Site completo | R$ 1.500 | 🟢 definido |
| Manutenção mensal | R$ 500/mês | 🟢 definido |
| Sprint | R$ 4.800 | 🔴 **escopo indefinido** — preço existe, entregável não foi especificado. Não descrever/prometer conteúdo do Sprint em proposta até o escopo ser definido. Definir antes da primeira venda. |

Regra: o relatório recomenda o serviço que resolve o GAP #1 primeiro. Não empurrar pacote completo no diagnóstico.

## 10. Checklist de execução manual 🟢 (rodável hoje, sem nenhuma ferramenta nova)

**Preparação (dia 0):**
- [ ] Diagnóstico gratuito feito e reação registrada (ou relacionamento quente justificando pular)
- [ ] Preço acordado por escrito (R$ 800 / R$ 1.200 pacote duplo) antes de começar
- [ ] Identificar os canais a testar (WhatsApp é obrigatório; Instagram Direct se o negócio usa)

**Teste de tempo de resposta (dias 1-2):**
- [ ] Mandar mensagem realista de cliente (pergunta de reserva/pedido/orçamento) em horário comercial
- [ ] Cronometrar até a primeira resposta humana (não confundir com auto-resposta)
- [ ] Registrar: canal, horário do envio, horário da resposta, print
- [ ] Repetir em pelo menos 2 momentos diferentes (ex.: manhã e fim de tarde) — 1 medição só não é padrão, é anedota
- [ ] Se o negócio tem 2+ canais, testar cada um

**Entrevista (dia 3):**
- [ ] Agendar 45-60 min com o dono (chamada ou presencial)
- [ ] Aplicar o questionário (seção 5) — anotar respostas literais, não interpretar na hora
- [ ] Pedir os 3 números-chave: ticket médio, volume mensal aproximado, % de recompra estimado

**Síntese (dias 4-5):**
- [ ] Cruzar teste + entrevista → listar todos os gaps percebidos
- [ ] Cortar para os 3 de maior impacto (seção 6)
- [ ] Calcular impacto financeiro só onde há dois números reais (seção 6, regra de honestidade)
- [ ] Montar relatório no formato da seção 8
- [ ] Definir o 1 serviço recomendado prioritário (seção 9)

**Entrega:**
- [ ] Apresentar ao vivo (não só mandar PDF) — o relatório é roteiro de conversa de venda
- [ ] Registrar a reação e o próximo passo acordado no CRM

## 11. Checklist para futura automação 🔴 nada disto existe — não é promessa de prazo

Se (e somente se) o volume justificar automatizar o teste de tempo de resposta, precisaria existir:

- [ ] 🔴 Meta App criado e aprovado (Facebook Developers) com produto WhatsApp Business API
- [ ] 🔴 Credenciais WhatsApp Business API (token permanente, phone number ID)
- [ ] 🔴 Instagram Graph API habilitada no mesmo Meta App (exige conta business vinculada a página)
- [ ] 🔴 Endpoint de webhook público para receber eventos de mensagem (verificação de assinatura Meta inclusa)
- [ ] 🔴 Persistência dos timestamps (tabela Supabase nova — não existe)
- [ ] 🔴 Decisão ética/prática: teste automatizado exige número "cliente fantasma" — validar se isso é aceitável antes de construir

Nota: `diagnostico-o6/canal_timing.py` 🟡 já existe como script de medição, mas **depende exatamente das credenciais acima para funcionar de verdade** — foi verificado na criação (2026-06) que as APIs WhatsApp/Instagram não estavam configuradas. Ele é o esqueleto da automação, não uma automação funcionando.

## 12. Backlog técnico para Claude Code e Codex 🔴 honesto, baseado no que já foi tentado e bloqueou

O que a automação exigiria, na ordem, com base no bloqueio real já encontrado (tentativa com `canal_timing.py`):

1. **Meta App + credenciais** (humano, não código) — bloqueador raiz de tudo. WhatsApp Business API e Instagram Graph API exigem app aprovado na Meta com business verification. Sem isso, nenhum código destrava nada.
2. **Webhook infrastructure** (Claude Code) — rota `app/api/webhooks/meta` para receber eventos de mensagem, com verificação de assinatura. Só faz sentido depois do item 1.
3. **Persistência de medições** (Claude Code) — migration nova (ex.: `response_time_tests`), seguindo a regra de migrations nomeadas do projeto.
4. **Integração com o Diagnosis Engine** (Claude Code) — alimentar as perguntas de `operacao_eficiencia` (tempo de resposta) com dado medido em vez de declarado. Engine já existe (`app/_lib/diagnosis-engine/`), a ponte não.
5. **UI de relatório** (Codex, conforme divisão de papéis) — página de relatório do Diagnóstico Completo no padrão visual do OS. Depende de 3-4.

Estado atual de tudo acima: 🔴 não configurado / não construído. O processo deste playbook **não depende de nenhum item desta lista** — roda 100% manual hoje.
