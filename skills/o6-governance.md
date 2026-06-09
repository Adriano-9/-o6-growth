# Skill: o6-governance — Rotina Diária e Governança Operacional

> **Status: ✅ Ativo**
> Playbook para operação diária do O6 Growth OS.

---

## Rotina Diária (30 min/dia)

### Manhã (15 min) — Preparação

| # | Ação | Onde | Tempo |
|---|---|---|---|
| 1 | **Revisar Agenda** — confirmar reuniões do dia, checar no-shows de ontem | `/agenda` | 3 min |
| 2 | **Checar CRM** — leads parados >48h sem ação, mover ou arquivar | `/crm` | 5 min |
| 3 | **Novos prospects** — rodar Apify se pipeline está seco (<5 prospects ativos) | `/oportunidades` → Capturar | 5 min |
| 4 | **Telegram** — confirmar que notificações estão chegando | Chat Telegram | 2 min |

### Tarde (15 min) — Execução

| # | Ação | Onde | Tempo |
|---|---|---|---|
| 5 | **Pipeline** — rodar audit+abordagem nos 3 melhores prospects novos | ProspectDrawer → "Gerar Abordagem" | 5 min |
| 6 | **Enviar WhatsApp** — copiar abordagem gerada e enviar para prospects prontos | WhatsApp Web | 5 min |
| 7 | **Follow-up** — prospects que responderam ontem → agendar reunião ou promover para CRM | `/oportunidades` + `/agenda` | 3 min |
| 8 | **Log** — anotar quantos contatos feitos, reuniões agendadas | Mental ou planilha | 2 min |

---

## Ciclo Semanal

### Segunda — Prospecção em massa
- Rodar 2-3 buscas Apify (cidades diferentes ou categorias)
- Meta: 30+ novos prospects na semana
- Priorizar por Google rating (>4.0) e presença de site

### Terça a Quinta — Pipeline + Conversão
- Rotina diária acima
- Foco em mover prospects → CRM → agendamento
- Gerar demos para os 5 melhores da semana

### Sexta — Review + Planejamento
- **KPIs da semana** (checar em `/crm` e `/oportunidades`):
  - Prospects capturados
  - Auditorias realizadas
  - Abordagens enviadas
  - Respostas recebidas
  - Reuniões agendadas
  - Propostas enviadas
  - Fechamentos
- **Ajustar** busca/nicho/cidade se taxa de resposta <10%
- **Planejar** cidades/categorias da semana seguinte

---

## Funil e Metas

### Métricas-alvo (por semana)

| Etapa | Meta | Taxa esperada |
|---|---|---|
| Prospects capturados (Apify) | 30 | — |
| Auditorias + abordagens geradas | 15 | 50% dos capturados |
| Abordagens enviadas (WhatsApp) | 15 | 100% dos gerados |
| Respostas recebidas | 3-5 | 20-33% |
| Reuniões agendadas | 2-3 | 50% das respostas |
| Diagnósticos realizados | 2 | 80% dos agendados |
| Propostas enviadas | 1-2 | 50-100% dos diagnósticos |
| Fechamentos | 1 | 50% das propostas |

### Receita projetada (por mês)

Com 1 fechamento/semana a R$ 800 (diagnóstico) + R$ 1.500/mês (recorrente):

- **Mês 1:** R$ 3.200 diagnósticos + R$ 6.000 recorrente = **R$ 9.200**
- **Mês 3:** R$ 3.200 + R$ 18.000 acumulado = **R$ 21.200**
- **Mês 6:** R$ 3.200 + R$ 36.000 = **R$ 39.200**

---

## Governança do Sistema

### Regras de higiene de dados

1. **Prospect parado >14 dias sem ação** → mover para status "Descartado"
2. **Lead no CRM parado >7 dias na mesma etapa** → follow-up obrigatório ou arquivar
3. **Meeting "No-show"** → tentar reagendar 1x. Se falhar novamente → voltar para CRM com nota
4. **Cliente sem Offer Book completo >30 dias** → barra de progresso + alerta

### Regras de qualidade de abordagem

1. **Nunca enviar abordagem genérica** — sempre rodar audit primeiro
2. **Personalizar** — confirmar que o nome do negócio e problema citado fazem sentido antes de enviar
3. **1 mensagem por prospect** — não reenviar se não respondeu. Seguir com email ou ligar em 3 dias
4. **Horário de envio** — terça a quinta, 9h-11h ou 14h-16h (melhor taxa de resposta)

### Regras de deploy e código

1. **Não fazer deploy em sexta à noite** — se quebrar, perde o fim de semana
2. **Testar localmente antes de push** — `npm run build` + `npx tsc --noEmit`
3. **Um commit por tarefa** — não misturar features
4. **Atualizar CLAUDE.md e memory/** — após cada sprint ou decisão importante
5. **Backup Supabase** — verificar que o projeto está ACTIVE_HEALTHY semanalmente

---

## Checklist de Onboarding de Novo Cliente

Quando um lead fecha (stage "Fechado" no CRM):

- [ ] Criar cliente em `/clientes-dashboard`
- [ ] Preencher dados básicos (empresa, nicho, cidade, contato)
- [ ] Iniciar Offer Book: `/offer-book/clientes`
- [ ] Agendar kickoff de 1h: `/agenda`
- [ ] No kickoff, preencher junto: ICP, Psicografia, Concorrentes, Oferta
- [ ] Rodar Diagnóstico: `/offer-book/diagnostico`
- [ ] Gerar síntese AI: "Gerar Offer Book" na sidebar
- [ ] Revisar Plano de Ação + Roadmap + ROI
- [ ] Exportar PDF: `/print`
- [ ] Enviar ao cliente + agendar reunião de apresentação
- [ ] Definir próximos passos e frequência de acompanhamento

---

## Escalação

### Quando contratar ajuda

- **>50 prospects/semana** → precisa de SDR junior para qualificar e enviar
- **>5 clientes ativos** → precisa de CS para acompanhamento
- **>10 clientes** → precisa de analista para manter Offer Books atualizados

### Quando automatizar mais

- **Taxa de resposta <5%** → melhorar prompt de abordagem ou mudar nicho
- **>3 no-shows/semana** → implementar reminder automático (Telegram/WhatsApp)
- **Pipeline manual demais** → implementar cron para audit automático de novos prospects
