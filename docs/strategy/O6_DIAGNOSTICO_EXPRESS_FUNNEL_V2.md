# Diagnostico Express: funil e automacao v2

## Principio

Automatizar coleta, pagamento, analise, qualificacao e registro. Manter humana
a decisao de oferecer um servico, entrar em contato e definir proposta.

## Estados

1. `checkout_started`: sessao Stripe criada.
2. `paid`: pagamento confirmado pelo Stripe.
3. `submitted`: intake concluido e relatorio gerado.
4. `pending`: recomendacao aguardando aprovacao no Telegram.
5. `approved`: comprador promovido ao CRM.
6. `rejected`: nao promover; manter registro para analise.
7. `delivered`: entrega e proximo passo registrados.

## Fluxo

1. Pessoa abre `/produto/diagnostico`.
2. Checkout cobra R$197.
3. Stripe retorna `session_id`; o servidor confirma pagamento e produto.
4. Formulario e liberado apenas para sessao paga.
5. Intake gera relatorio deterministico e score interno.
6. Supabase guarda pedido, entrada, relatorio, score e recomendacao.
7. Telegram recebe resumo com botoes Aprovar e Rejeitar.
8. Ao aprovar, o sistema cria ou atualiza o lead no CRM em
   `Diagnostico Entregue`, com pagamento `pago` e proxima acao.
9. Nenhuma mensagem e enviada ao comprador automaticamente.
10. A conversa e a proposta continuam sob aprovacao humana.

## Score interno

O score considera:

- compra confirmada;
- severidade dos gaps;
- volume mensal de contatos;
- taxa declarada de conversao;
- ticket medio;
- tempo de resposta;
- existencia de follow-up;
- aderencia ao ICP prioritario.

O score prioriza fila; nao substitui julgamento e nao deve aparecer como
promessa para o comprador.

## Requisitos de ativacao

- `STRIPE_SECRET_KEY` no ambiente server-side.
- `STRIPE_WEBHOOK_SECRET` apos cadastrar o webhook.
- `SUPABASE_SERVICE_ROLE_KEY` apenas no servidor.
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` e `O6_WEBHOOK_SECRET`.
- migrations 016 e 017 aplicadas.
- webhook Stripe apontando para `/api/webhooks/stripe`.
- webhook Telegram apontando para `/api/telegram/webhook` com secret token.

## Metricas

- visitas da LP;
- inicio de checkout;
- pagamento;
- intake concluido;
- tempo ate aprovacao;
- aprovacao ou rejeicao;
- conversa, proposta e fechamento;
- receita e tempo humano por diagnostico;
- conversao por nicho e origem.

## Limites

- Sem Evolution API ativa, o sistema nao envia WhatsApp ao comprador.
- Sem credenciais Stripe, o checkout retorna indisponibilidade clara.
- Sem migration e service role, o intake pago nao deve ser ativado.
- O valor da implementacao nunca e calculado pelo score.
