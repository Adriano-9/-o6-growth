# O6 · Briefing Híbrido + Pré-venda / Agendamento

## Objetivo

Fechar dois fluxos operacionais que acontecem antes da entrega:

1. transformar uma conversa inicial em briefing técnico executável sem obrigar o cliente a responder um questionário técnico;
2. permitir que Sofia/GPTMaker qualifique um lead e avance para CRM ou agendamento sem perder contexto.

O princípio é o mesmo da O6: automatizar organização e continuidade; manter decisão de escopo e exceções com humano.

---

## 1. Briefing Híbrido

### Entrada

Rota interna: `/briefing`.

O formulário coleta apenas as decisões que alteram escopo:

- negócio, nome do projeto, site novo ou reforma;
- objetivo principal e CTA;
- quantidade de páginas/rotas;
- tipo de conteúdo e frequência de atualização;
- necessidade de edição pelo cliente;
- motion leve, experiência cinematográfica ou 3D interativo;
- login, dados privados, agendamento, dashboard e regras de negócio;
- ativos existentes;
- vibe, liberdade criativa e jornada;
- integrações, destino de publicação e restrições.

### Decisão determinística

A classificação N1–N4 e Lane A–C não é decidida por IA.

- N4 quando há lógica operacional, dados privados, login, agendamento, dashboard ou regra de negócio.
- N2 para página única cinematográfica.
- N1 para página única sem lógica de aplicação.
- N3 para multipágina sem lógica de aplicação.
- Lane C para 3D interativo.
- Lane B para vídeo/scroll-scrub.
- Lane A para motion 2D.

A arquitetura de conteúdo também é determinística:

- aplicação para N4;
- CMS Supabase simples apenas quando N3 + edição pelo cliente + conteúdo recorrente;
- código direto nos demais casos.

### Síntese assistida

`POST /api/briefing/generate`

A IA recebe a decisão técnica já fechada e apenas organiza:

- resumo executivo;
- escopo incluído;
- exclusões;
- ativos faltantes;
- gates de aprovação;
- riscos;
- próximo passo.

Se Claude estiver indisponível, o sistema devolve um briefing determinístico de fallback. O fluxo não para por falta de IA.

---

## 2. Pré-venda Sofia

Endpoint existente:

`POST /api/lead`

Uso: registrar lead qualificado sem agendamento.

Headers:

```
Content-Type: application/json
x-o6-secret: <O6_WEBHOOK_SECRET>
```

Payload:

```json
{
  "nome": "Nome do lead",
  "telefone": "5571999999999",
  "email": "lead@empresa.com",
  "pontos": 72,
  "resumo": "Contexto da conversa e principal objetivo."
}
```

Resultado: cria ou mescla lead no CRM com origem `gptmaker_sofia`.

---

## 3. Disponibilidade para agendamento

`GET /api/agenda/slots?days=10`

Headers:

```
x-o6-secret: <O6_WEBHOOK_SECRET>
```

Resposta:

```json
{
  "timezone": "America/Bahia",
  "slots": [
    {
      "startsAt": "2026-09-24T13:00:00.000Z",
      "endsAt": "2026-09-24T13:30:00.000Z",
      "label": "quinta-feira, 24/09, 10:00"
    }
  ]
}
```

A API:

- usa a disponibilidade comercial configurada em `app/agenda/_lib/types.ts`;
- remove horários passados;
- consulta `meetings`;
- respeita reuniões canceladas e buffer;
- trabalha explicitamente no fuso `America/Bahia`.

Sofia deve oferecer no máximo 3 opções por vez, em linguagem natural.

---

## 4. Confirmar agendamento

`POST /api/agenda/book`

Headers:

```
Content-Type: application/json
x-o6-secret: <O6_WEBHOOK_SECRET>
```

Payload:

```json
{
  "nome": "Nome do lead",
  "telefone": "5571999999999",
  "email": "lead@empresa.com",
  "empresa": "Empresa",
  "resumo": "Resumo preservado da conversa.",
  "pontos": 72,
  "startsAt": "2026-09-24T13:00:00.000Z"
}
```

Comportamento:

1. valida se o horário pertence à disponibilidade O6;
2. revalida conflito no momento da reserva;
3. cria/mescla o lead no CRM;
4. move o lead para `Diagnóstico Agendado`;
5. registra `proxima_acao` e `data_proxima_acao`;
6. cria a reunião em `meetings` vinculada ao lead;
7. devolve horário e IDs para Sofia confirmar ao lead.

Se a reunião falhar depois de salvar o lead, a resposta é erro explícito e Sofia não deve confirmar o horário ao lead.

---

## 5. Roteamento de conversa da Sofia

Fluxo preferido:

```
Entrada
  ↓
Identificar intenção
  ↓
Qualificação breve
  ↓
Há contexto suficiente?
  ├─ não → Diagnóstico Gratuito / coleta mínima
  └─ sim
      ↓
O próximo passo exige humano?
  ├─ sim → handoff preservando resumo
  └─ não
      ↓
Lead quer conversar agora com a O6?
  ├─ não → POST /api/lead + follow-up
  └─ sim → GET /api/agenda/slots
               ↓
            lead escolhe
               ↓
          POST /api/agenda/book
               ↓
        confirmação ao lead
```

Sofia não deve:

- transformar a primeira conversa em questionário longo;
- inventar problema, preço, prazo ou disponibilidade;
- confirmar horário antes de `/api/agenda/book` retornar sucesso;
- repetir perguntas já respondidas;
- perder o resumo no handoff humano.

---

## 6. Papel do n8n

O n8n pode funcionar como camada de orquestração, não como fonte de verdade.

Fluxo recomendado:

```
GPTMaker / Sofia
  → n8n webhook
  → O6 API
  → CRM / Agenda / Supabase
  → resposta estruturada
  → Sofia
```

Responsabilidades úteis do n8n:

- logs de cada chamada;
- retry controlado de erros transitórios;
- notificação interna;
- envio de confirmação/reminder quando o canal estiver configurado;
- futuro sync com Google Calendar/Cal.com.

Não duplicar CRM ou agenda dentro do n8n.

---

## 7. Handoff humano

Handoff obrigatório quando:

- lead pedir uma pessoa;
- houver negociação fora da base;
- preço, prazo ou escopo não estiver confirmado;
- surgir tema sensível;
- houver erro de agenda;
- oportunidade exigir proposta personalizada.

Payload mínimo preservado no handoff:

- nome;
- telefone;
- empresa;
- intenção;
- principal dificuldade percebida;
- objetivo;
- score/qualificação quando existente;
- resumo da conversa;
- próximo passo já combinado.

---

## 8. Pendências antes de produção plena

1. confirmar os horários em `AVAILABILITY` antes de abrir agendamento real para leads;
2. testar `/api/agenda/slots` e `/api/agenda/book` com o Supabase de produção;
3. configurar/validar `O6_WEBHOOK_SECRET` na Vercel e no GPTMaker/n8n;
4. conectar Calendar/Cal.com apenas depois de validar o fluxo interno;
5. configurar reminders e confirmação por WhatsApp somente quando o provedor estiver autorizado;
6. fazer teste ponta a ponta: Sofia → slot → reserva → CRM → Agenda → handoff.

O MVP fica operacional antes de depender de Calendar externo. A Agenda O6 e o CRM continuam sendo a fonte de verdade.
