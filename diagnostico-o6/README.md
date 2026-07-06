# diagnostico-o6 — canal_timing.py

**Pilar:** Operations · Status: 🟡 Em desenvolvimento (script pronto, sem credenciais reais ainda)

Mede tempo de resposta bruto em dois canais (WhatsApp Business API e
Instagram Direct via Meta Graph API), separadamente. Não faz análise,
não tem dashboard, não usa IA — é um instrumento de medição puro que
alimenta decisões futuras de Intelligence/CRM (ex.: priorizar canal com
resposta mais rápida no opener).

## Uso

```bash
pip install requests
python diagnostico-o6/canal_timing.py
```

Saída (stdout, JSON):

```json
{
  "whatsapp": {
    "numero": "",
    "hora_envio": "",
    "hora_resposta": "",
    "tempo_decorrido_minutos": null,
    "erro": "credenciais ausentes: WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN, WHATSAPP_TEST_TO"
  },
  "instagram": {
    "perfil": "",
    "hora_envio": "",
    "hora_resposta": "",
    "tempo_decorrido_minutos": null,
    "erro": "credenciais ausentes: IG_BUSINESS_ACCOUNT_ID, IG_ACCESS_TOKEN, IG_TEST_RECIPIENT_ID"
  }
}
```

## Credenciais — nenhuma existe no projeto ainda

Nem `.env.local` nem o código do app têm qualquer integração com WhatsApp
Business API ou Instagram Graph API hoje (auditado em 2026-07-06). O único
canal de mensagem existente no O6 é o Telegram (bot ativo no VPS) e links
`wa.me` manuais (deep link, não API).

### WhatsApp Business API (Meta Graph API)

| Variável | Onde conseguir |
|---|---|
| `WHATSAPP_PHONE_NUMBER_ID` | Meta for Developers → seu App → WhatsApp → API Setup → "Phone number ID" |
| `WHATSAPP_ACCESS_TOKEN` | Mesmo painel — token temporário (24h) ou permanente via System User |
| `WHATSAPP_TEST_TO` | Número de destino do teste, formato E.164 sem `+` (ex: `5571999999999`) |
| `WHATSAPP_WEBHOOK_INBOX_URL` | **Não existe ainda.** WhatsApp entrega mensagens recebidas via webhook, não via GET — precisa de um endpoint que receba o webhook da Meta e exponha a última mensagem. Sem isso, o script nunca detecta resposta (fica em modo envio-only). |

Requer um App Meta com o produto **WhatsApp** ativado e o número de teste
verificado (sandbox da Meta permite até 5 números de teste sem verificação
de negócio).

### Instagram Direct (Meta Graph API)

| Variável | Onde conseguir |
|---|---|
| `IG_BUSINESS_ACCOUNT_ID` | Meta for Developers → App → Instagram → conta Business/Creator conectada |
| `IG_ACCESS_TOKEN` | Token com permissão `instagram_manage_messages` |
| `IG_TEST_RECIPIENT_ID` | IGSID do destinatário — só se obtém depois que essa pessoa manda mensagem pro seu perfil primeiro (limitação da API, não do script) |
| `IG_WEBHOOK_INBOX_URL` | **Não existe ainda.** Mesma limitação do WhatsApp — Instagram Direct entrega mensagens via webhook (`messaging` field na subscription do App). |

Requer conta Instagram Business ou Creator vinculada a uma Página do
Facebook, e o App Meta com o produto **Instagram Messaging** aprovado
(pode exigir App Review da Meta para uso fora do modo de desenvolvimento).

## Limitação conhecida (documentada, não escondida)

O script **envia** normalmente assim que as 3 credenciais de envio de cada
canal existirem. Mas **detectar a resposta** depende de um endpoint de
webhook que ainda não existe no projeto — sem ele, o campo `hora_resposta`
fica vazio e `erro` reporta "sem resposta em Ns" mesmo que a pessoa tenha
respondido de verdade (a mensagem chegou via webhook, não via polling GET).

**Próximo passo necessário para medição real:** criar uma rota
`/api/webhooks/whatsapp` e `/api/webhooks/instagram` no Next.js que recebam
o callback da Meta e persistam a última mensagem (Supabase ou memória),
para o script consultar via `WHATSAPP_WEBHOOK_INBOX_URL` /
`IG_WEBHOOK_INBOX_URL`. Isso é uma tarefa separada — não implementada aqui
porque o escopo pedido foi "só medir, sem dashboard/análise/IA".
