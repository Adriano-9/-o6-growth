# Hermes: piloto de inteligencia de conteudo da O6

Estado em 2026-10-21: proposta operacional; **nao implementado nem
agendado**. O Hermes Bot Telegram e o Intelligence Engine de noticias
existem parcialmente no VPS, mas nao formam hoje um motor diario de
referencias sociais ou um orquestrador de agentes. Conferir
`docs/registry/SYSTEM_STATE.yaml` e `docs/bootstrap/10_BOOTSTRAP_INTELLIGENCE.md`
antes de qualquer implantacao, pois esses registros foram verificados
pela ultima vez em julho de 2026.

## Objetivo

Reduzir tempo de pesquisa e aumentar a qualidade das pautas da O6.
Resultado diario desejado: no maximo cinco oportunidades priorizadas,
cada uma com fonte, sinal publico observado, tese, adaptacao original
para a O6, formato sugerido, oferta relacionada e proximo passo.
"Espionagem" aqui significa inteligencia competitiva com material
publico e uso permitido, nao acessar dados privados ou republicar
conteudo de terceiros.

## Ciclo de um dia

1. **Coletar** URLs de fontes aprovadas: buscas, canais publicos,
   paginas de campanhas, anuncios publicos, conteudo dos nichos e
   materiais proprios autorizados. Guardar URL, autor, data e contexto.
2. **Deduplicar e classificar** por tema, publico, problema, etapa do
   funil e formato (trivial, palestrinha, tela verde, tela dividida,
   dinamismo, explicador visual). Nao inferir desempenho a partir de
   um unico numero de visualizacoes; comparar idade e tamanho do canal.
3. **Verificar** sinais: fonte primaria para numeros, disponibilidade
   do conteudo, direitos de uso e se a O6 tem uma contribuicao propria.
   Transcricao serve para estudar estrutura, nao para copiar falas.
4. **Priorizar** por aderencia ao ICP, dor comercial, evidencia,
   viabilidade de producao e frescor. Registrar motivo de entrada e
   motivo de descarte para evitar repetir pesquisa.
5. **Gerar rascunho** de gancho, tese, roteiro curto e CTA para as tres
   melhores pautas. IA pode ajudar, mas a saida passa por revisao
   factual, de marca e de oferta antes de qualquer publicacao.
6. **Entregar digest** no Telegram ou painel: cinco pautas, tres
   rascunhos e uma recomendacao de gravacao. O operador aprova,
   ajusta ou descarta; so entao uma peca entra na fila de producao.

## Contrato minimo por oportunidade

```text
source_url, source_name, observed_at, published_at, platform,
topic, audience, funnel_stage, public_signals, format, central_claim,
evidence_url, rights_note, o6_angle, proposed_hook, proposed_cta,
score, score_reason, review_status
```

`public_signals` sao observacoes, nao prova de vendas. Nao guardar
dados pessoais de comentaristas ou participantes de reunioes. Materiais
de clientes e conversas so entram com autorizacao e remocao de detalhes
identificaveis.

## Agentes e limites

- **Coletor:** acha fontes publicas permitidas e salva metadados.
- **Analista:** agrupa padroes, verifica evidencias e aponta lacunas.
- **Roteirista:** cria angulo e roteiro originais na voz da O6.
- **Revisor:** bloqueia claims sem fonte, copias e ofertas nao aprovadas.

Esses papeis podem ser etapas de um unico job; nao requerem quatro
processos permanentes. Um lote diario com fila, limites de custo,
idempotencia e logs atende melhor ao objetivo do que agentes consumindo
creditos 24 horas por dia. Nao publicar, comprar ferramentas, disparar
mensagens ou alterar campanhas automaticamente.

## Primeiro piloto antes do agendamento

1. Selecionar 10 a 20 fontes publicas relevantes para a O6 e seus
   nichos; conferir termos de uso e acesso permitido.
2. Rodar coleta manual assistida por uma semana. Produzir digest e
   comparar as sugestoes com o julgamento do fundador.
3. Medir: pautas aproveitadas, tempo poupado, custo por digest,
   roteiros aprovados e conversas geradas apos publicacao.
4. Somente depois, ligar job diario com alerta de falha e aprovacao
   humana no Telegram. Verificar de novo o estado do VPS e credenciais.

Dependencias: fonte de pesquisa social aprovada, orcamento e provedor
de IA definidos (Claude esta sem creditos no momento), armazenamento
versionado, controle de acesso e fluxo de aprovacao. O bot atual nao
implementa essa aprovacao; isso e trabalho novo. O Intelligence Engine
existente e focado em noticias gerais de tecnologia, portanto suas
fontes e criterios nao devem ser reaproveitados sem revisao.
