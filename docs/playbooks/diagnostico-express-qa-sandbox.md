# Diagnostico Express: roteiro de QA no sandbox do Mercado Pago

Objetivo: validar o fluxo pago (checkout, volta, intake, webhook, resultado) com credenciais de TESTE, antes de qualquer promocao. Nenhum cartao real, nenhum webhook de producao, nenhuma migration.

Status comercial: o Express pago esta SEGURADO ate aprovacao do fundador. Este QA nao autoriza divulgar o botao.

## 0. Pre-requisitos (voce faz, valores nunca vao para o chat)

1. No painel do Mercado Pago, abra a aplicacao em modo de teste e crie dois usuarios de teste: vendedor e comprador.
2. Em `.env.local` (ja ignorado pelo git) defina SOMENTE por nome:
   - `MERCADOPAGO_ACCESS_TOKEN` (token `TEST-...` do vendedor de teste)
   - `MERCADOPAGO_WEBHOOK_SECRET` (assinatura secreta do webhook de teste)
   - `MERCADOPAGO_NOTIFICATION_BASE_URL` (URL https do tunel, ver passo 1)
   - Ja existentes e necessarios: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
3. Aviso: o Supabase atual e o de producao (nao ha ambiente de teste). Os pedidos de QA ficam gravados em `diagnostico_express_orders` e `diagnostico_express_runs`. Anote o e-mail de teste usado para limpar depois, com sua aprovacao.

## 1. Tunel para o webhook

O Mercado Pago precisa alcancar `notification_url`. Em localhost ela e omitida de proposito.

```bash
npx cloudflared tunnel --url http://localhost:3000
```

Copie a URL `https://....trycloudflare.com` para `MERCADOPAGO_NOTIFICATION_BASE_URL` e inicie o app: `npm run dev`.

Observacao: em preview da Vercel a Deployment Protection (SSO) bloqueia o webhook; teste local com tunel.

## 2. Checks automatizados (sem pagamento)

```bash
npm test
```

```bash
node --env-file=.env.local scripts/qa-mp-webhook.mjs http://localhost:3000
```

Esperado: todos PASS. Se o item "assinatura valida passa da barreira" falhar com 401, o segredo do `.env.local` nao e o da aplicacao.

## 3. Fluxo manual de ponta a ponta

Use navegador anonimo logado como COMPRADOR de teste.

| # | Passo | Esperado |
|---|---|---|
| 1 | Abrir `/produto/diagnostico` e clicar em pagar | Redireciona para o checkout de teste do MP; no log do dev aparece que `notification_url` foi enviada (nenhum aviso de omissao) |
| 2 | Pagar com o cartao de teste de aprovacao (nome do titular `APRO`) | MP volta para `/produto/diagnostico` com `payment_id`, `status=approved` e `external_reference` na URL |
| 3 | Tela "Confirmando seu pagamento" | Avanca para o formulario (intake) com e-mail do pagador preenchido |
| 4 | Preencher e enviar o intake | Resposta com `accessToken`; tela de resultado "em revisao" |
| 5 | Telegram | Chega UMA mensagem "Pagamento confirmado" (webhook) e UMA de diagnostico pendente com botoes Aprovar/Rejeitar |
| 6 | (Opcional) Aprovar no Telegram | So funciona se o webhook do bot apontar para o tunel e `O6_WEBHOOK_SECRET` estiver definido. Esperado: lead criado no CRM uma vez; resultado liberado ao recarregar `?token=...`. Sem isso, pule: confirme apenas que a mensagem com os botoes chegou |
| 7 | Reenviar o mesmo intake (F5 / duplo clique) | Resposta `alreadySubmitted: true`; nenhuma segunda linha em `diagnostico_express_runs` |

Se no passo 2 a URL de volta vier SEM `external_reference`, o passo 3 falha com 403. Anote e me avise: a hipotese de que o MP devolve esse parametro precisa ser confirmada aqui.

## 4. Casos negativos

| # | Caso | Como | Esperado |
|---|---|---|---|
| N1 | Pagamento recusado | Titular `OTHE` | Nao chega ao intake; mensagem de pagamento nao confirmado |
| N2 | Pagamento pendente | Titular `CONT` | Nao chega ao intake; ao aprovar depois, webhook registra o pedido |
| N3 | `payment_id` de outro pagamento | Abrir `/produto/diagnostico?payment_id=<id de outra compra>&external_reference=<qualquer>` | 403, sem e-mail nem telefone na resposta |
| N4 | Link sem `external_reference` | Remover o parametro da URL de volta | 403 |
| N5 | Reentrega do webhook | Reenviar a notificacao pelo painel do MP | 200 com `duplicate: true`; nenhuma segunda mensagem no Telegram |
| N6 | Valor errado | Nao reproduzivel pela UI; coberto por `npm test` | Teste "pagamento rejeitado" passa |
| N7 | Intake sem pagamento | `POST /api/diagnostico/submit` com `paymentId` inexistente | 502 ou 402, nunca 200 |

## 5. Verificacao no banco (somente leitura)

```sql
select checkout_session_id, payment_status, payment_provider, mp_payment_id, intake_completed, run_id
from diagnostico_express_orders order by created_at desc limit 5;
```

Esperado para a compra aprovada: `payment_provider = mercadopago`, `payment_status = paid`, `intake_completed = true`, uma unica linha por `mp_payment_id`.

## 6. Criterio de aceite

- `npm test` e `scripts/qa-mp-webhook.mjs` sem falhas.
- Passos 1 a 7 e N1 a N5 conforme esperado, com prints ou logs.
- Nenhum segredo em log, commit ou chat.
- Resultado registrado por voce neste arquivo ou numa nota; so entao discutimos promover.
