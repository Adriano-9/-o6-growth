# O6 Diagnostic Intake — especificação do MVP

**Status:** especificação aprovada; prévia local do briefing criada em `/diagnostico-mvp`.  
**Regra central:** a IA prepara a análise; a O6 revisa e responde pelo diagnóstico final.

## 1. Produto

O Diagnóstico Express é uma análise consultiva paga. Ele não é um formulário automático, uma promessa de resultado comercial nem uma proposta gerada por IA.

### Distinções

- **Briefing:** coleta estruturada de contexto e evidências.
- **Diagnóstico:** interpretação do cenário, priorização de gargalos e recomendação.
- **IA:** transcreve, organiza, aponta lacunas e cria um rascunho.
- **O6:** valida hipóteses, corrige o rascunho e entrega a análise final.

## 2. Jornada do cliente

```text
Diagnóstico gratuito
-> Diagnóstico Express pago
-> pagamento confirmado pelo gateway
-> link individual do briefing
-> briefing completo
-> rascunho de IA
-> revisão humana O6
-> entrega em até 2 dias úteis
-> convite para call de priorização
```

O relógio de entrega começa em `briefing_completed_at`, nunca no pagamento.

## 3. Briefing guiado

O formulário apresenta **18 a 22 perguntas principais** e **4 a 8 perguntas condicionais**. O objetivo é reunir contexto suficiente sem reduzir a conclusão.

### Contexto do negócio

- Nome, segmento, tempo de operação, porte e decisor.

### Oferta e posicionamento

- Serviços prioritários, margem ou prioridade, cliente ideal, diferenciais e objeções recorrentes.

### Aquisição e marketing

- Origem dos clientes, canais, investimento em mídia, conteúdo, site, landing page, Perfil da Empresa no Google e tentativas anteriores.

### Atendimento e conversão

- Caminho após o primeiro contato, responsável, tempo de resposta, orçamento, agendamento, follow-up, conversão declarada e perda percebida.

### Operação e dados

- Ferramentas, CRM, tarefas repetitivas, retrabalho e indicadores acompanhados.

### Objetivos

- Resultado para os próximos 90 dias, prioridade e principal correção desejada.

## 4. Evidências e privacidade

Cada pergunta pode aceitar texto. O MVP também deve aceitar, quando fizer sentido:

- áudio de até 90 segundos;
- links de site, Instagram, Google Maps e landing pages;
- imagens, prints ou documentos pertinentes.

Não solicitar prontuários, dados clínicos, dados sensíveis de pacientes ou informações que não sejam necessárias ao diagnóstico comercial. O cliente precisa consentir com o armazenamento e processamento das respostas.

Para áudio: guardar o original, gerar transcrição e permitir revisão antes do envio final. A transcrição automática não substitui o áudio original como evidência.

## 5. Diagnóstico entregue

Entrega visual de cinco a oito páginas, com linguagem direta e sem promessa de venda, ranking ou agenda.

1. Leitura do cenário: negócio, oferta, público, canais e processo atual.
2. Até três gargalos prioritários: impacto, urgência, evidência e dificuldade de correção.
3. Análise de cada gargalo: o que ocorre, evidência, impacto provável e o que corrigir ou investigar.
4. Próximo passo recomendado: uma prioridade prática, não uma proposta automática.
5. Convite para call de priorização: conversa para decidir escopo, não venda agressiva.

## 6. Papel da IA

A IA pode:

1. Transcrever áudio.
2. Organizar respostas, links e anexos.
3. Sinalizar respostas vagas, contradições e lacunas.
4. Sugerir gargalos prováveis, evidências e nível de confiança.
5. Gerar um rascunho consultivo para revisão.

A IA não pode decidir o diagnóstico final, prometer retorno, disparar proposta ou recomendar contratação sem revisão humana.

## 7. Painel Diagnósticos

O dashboard deve ter uma área operacional com:

- lead, negócio e segmento;
- pagamento e referência do gateway;
- status e progresso do briefing;
- áudios, transcrições e anexos;
- rascunho da IA e revisão O6;
- responsável, prazo, entrega e histórico de eventos.

### Estados

```text
Pagamento confirmado
-> Briefing enviado
-> Briefing iniciado
-> Aguardando briefing completo
-> Briefing completo
-> Análise por IA
-> Revisão O6
-> Pronto para entrega
-> Entregue
-> Call convidada
-> Encerrado
```

## 8. Arquitetura do MVP

| Camada | Responsabilidade |
| --- | --- |
| O6 / Next.js | Checkout, briefing, dashboard e revisão. |
| PayPal | Pagamento e evento de confirmação. |
| Webhook O6 | Verifica assinatura, registra o pedido e libera o briefing. |
| Supabase | Pedidos, respostas, status, anexos, transcrições e auditoria. |
| Supabase Storage | Áudios, imagens e documentos. |
| IA | Transcrição, organização e rascunho. |
| n8n | E-mail, Telegram, lembretes e notificações posteriores ao registro validado. |

O webhook do O6, e não o n8n, é a fonte de verdade para pagamento. O processo só começa após `PAYMENT.CAPTURE.COMPLETED` validado.

## 9. Escopo da primeira versão

Incluído:

- pagamento confirmado;
- briefing condicionado ao tipo de negócio;
- texto, links, áudio e anexos;
- transcrição;
- armazenamento seguro;
- painel de pedidos;
- rascunho por IA;
- revisão humana;
- entrega por e-mail ou link seguro;
- alertas Telegram;
- prazo automático de dois dias úteis.

Fora da primeira versão:

- proposta automática;
- mensagens comerciais automáticas por WhatsApp;
- decisão autônoma de elegibilidade;
- integração de avatar, clone de voz ou vídeo;
- publicação automática de conteúdo.

## 10. Ordem de implementação

1. Fechar roteiro e condicionais do briefing.
2. Criar conta PayPal Business e testar Sandbox.
3. Aplicar migrations e criar o modelo de dados definitivo.
4. Integrar checkout PayPal e webhook assinado.
5. Construir painel de Diagnósticos com status e prazo.
6. Adicionar anexos e áudio com transcrição.
7. Integrar rascunho de IA, revisão e entrega.
8. Testar o fluxo completo em Sandbox antes de ativar pagamentos reais.

## 11. Estado da primeira construção

Já existe uma prévia local em `/diagnostico-mvp` com briefing guiado em seis etapas e geração de rascunho sem persistência. Ela serve para aprovar perguntas, clareza e estrutura do relatório.

Essa prévia não recebe pagamento, não salva respostas, não envia Telegram e não fica disponível em produção. Persistência, áudio, anexos, painel interno e PayPal continuam nas próximas etapas do MVP.
