# O6 Growth - Auditoria do Sistema e Mapa de Entrega v1

Data: 2026-10-21
Status: baseline operacional para revisão humana

Fonte comercial oficial: `docs/architecture/O6_SERVICE_CATALOG_AND_CAPABILITY_MAP_v1.md`.
Este documento descreve capacidade tecnica e estado operacional. O catalogo oficial define o que pode ser vendido, incluindo fundacao de marca, projetos pontuais e retainers.

## 1. Resumo executivo

O O6 Growth e um sistema operacional comercial para servicos profissionais brasileiros. Seu nucleo atual combina prospeccao, diagnostico, personalizacao, demos, CRM, agenda e producao de ativos comerciais.

O sistema ja permite demonstrar valor para um prospect e organizar a operacao comercial. Ainda nao deve ser vendido como uma plataforma totalmente autonoma de marketing, publicacao e monitoramento competitivo. Essas camadas existem como arquitetura, prototipos ou backlog.

Regra comercial: vender fundacao estrategica, projetos de campanha e retainers com escopo definido; automatizar e escalar depois que o fluxo for validado com clientes reais.

## 2. O que o O6 entrega hoje

### 2.1 Offer Book

Funcao: organizar ICP, dores, desejos, psicografia, oferta, posicionamento e concorrentes.

Pontos fortes:
- Cria contexto estrategico antes da execucao.
- Centraliza informacoes do cliente.
- Permite gerar sintese e plano de acao.

Limitacoes:
- Ainda depende de preenchimento e revisao humana.
- Nao e um monitor automatico de mercado.

### 2.2 Oportunidades e prospeccao

Funcao: capturar empresas via Apify/Google Maps e registrar prospects.

Pontos fortes:
- Boa aderencia a clinicas, profissionais locais e escritorios.
- Permite trabalhar por cidade e nicho.
- Integra com auditoria e abordagem.

Limitacoes:
- Enriquecimento de decisores e e-mails ainda nao e uma camada completa.
- Requer controle de deduplicacao, evidencias e data da coleta.
- Envio automatico de mensagens deve permanecer bloqueado por aprovacao humana.

### 2.3 Auditoria digital

Funcao: avaliar site, CTA, clareza da oferta, jornada de contato e problemas de conversao.

Pontos fortes:
- Gera um motivo concreto para iniciar conversa.
- Alimenta opener, demo e video.
- E uma entrega comercial tangivel.

Limitacoes:
- Nao substitui dados reais de analytics, CRM ou vendas.
- O resultado e uma hipotese ate ser validado com o cliente.

### 2.4 Abordagem personalizada

Funcao: criar mensagem curta para WhatsApp com base no prospect e na auditoria.

Pontos fortes:
- Evita mensagem generica.
- Funciona bem como abertura de conversa.
- Mantem o humano no controle do envio.

Limitacoes:
- Nao garante resposta ou fechamento.
- Precisa de opt-out, lista de supressao e controle de frequencia.

### 2.5 Demo personalizada

Funcao: gerar uma pagina demonstrando uma possivel melhoria para o prospect e publicar via Vercel.

Pontos fortes:
- Alto poder de demonstracao.
- Transforma auditoria em algo visual.
- Diferencia o O6 de uma consultoria que entrega apenas PDF.

Limitacoes:
- E uma hipotese de melhoria, nao uma implementacao contratada.
- Deploy, links e assets externos precisam de validacao.
- A rota de demo ainda deve ser consolidada com o helper de deploy compartilhado.

### 2.6 Video personalizado

Funcao: gerar uma experiencia animada de antes/depois a partir da auditoria.

Pontos fortes:
- Facilita o envio de uma explicacao curta.
- Pode ser personalizado por nicho.
- Telegram e o CRM podem receber o resultado.

Limitacoes:
- A implementacao atual e fallback CSS/HTML, nao um pipeline Remotion ou HyperFrames completo.
- Renderizacao MP4 exige worker separado com Chrome/FFmpeg.
- Avatar, voz clonada e lip-sync ainda sao camadas futuras.

### 2.7 CRM

Funcao: organizar stages, follow-ups e historico comercial.

Pontos fortes:
- Oferece visibilidade do funil.
- Permite acompanhar prospect ate reuniao e proposta.

Limitacoes:
- Automacoes de cadencia e mensagens ainda precisam de governanca.
- Metricas de conversao precisam ser padronizadas.

### 2.8 Agenda

Funcao: organizar reunioes, slots e preparacao comercial.

Pontos fortes:
- Conecta prospeccao a reuniao.
- Permite notificacao via Telegram.

Limitacoes:
- Integracoes Cal.com, Google Calendar, Meet ou WhatsApp nao devem ser consideradas completas sem teste ponta a ponta.

### 2.9 Telegram

Funcao: notificar novos prospects, demos, videos, auditorias e reunioes.

Pontos fortes:
- Baixo custo.
- Bom para operacao interna.
- Integracao fail-soft.

Limitacoes:
- Depende de TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID.
- Nao e substituto de CRM ou fila de tarefas.

## 3. LPs e ofertas atuais

### O6 institucional e paginas de servico

Funcao: apresentar a O6, o portfolio e os caminhos de contratacao.

Estado: home revisada e oito paginas publicas disponiveis em `/servicos`:
diagnostico, fundacao, campanhas, sites, dashboards, videos, sprint e retainer.
Build, responsividade, CTAs, portfolio, sitemap e robots foram validados em
21/10/2026. Trafego pago ainda exige analytics, eventos de conversao e
confirmacao dos valores e condicoes comerciais.

### Saude

Promessa: Sua agenda cheia de pacientes particulares.

Publico: clinicas, dentistas, medicos, estetica e fisioterapia.

Entrega: diagnostico de captacao, LP, atendimento, follow-up e campanha.

### Advocacia

Promessa: Novos clientes sem depender de indicacao.

Publico: escritorios e advogados.

Entrega: diagnostico de captacao, consulta inicial, LP, autoridade e follow-up.

Limitacao comum das LPs: precisam de validacao com trafego real, eventos de conversao e prova social verificavel.

## 4. Pipelines oficiais

### Pipeline A - Prospecccao fria

Captura → deduplicacao → qualificacao → auditoria → mensagem → aprovacao humana → envio → follow-up → reuniao → proposta → fechamento.

### Pipeline B - Diagnostico estrategico

Briefing → coleta de acessos/dados → auditoria → sintese → plano de acao → reuniao → entrega → proposta de recorrencia.

O diagnostico nao possui preco fixo oficial. A conversa inicial pode apenas
qualificar a necessidade; quando houver uma entrega formal de diagnostico,
escopo, prazo e investimento devem constar na proposta.

### Pipeline C - Campanha de cliente

Oferta → ICP → copy → LP/site → criativos → video → aprovacao → publicacao → leads → CRM → relatorio.

### Pipeline D - Conteudo proprio do O6

Pesquisa → ideia → hook → roteiro → storyboard → producao → edicao → QA → aprovacao → publicacao → metricas.

### Pipeline E - Inteligencia competitiva

Fonte publica → captura de evidencia → classificacao → comparacao → insight → pauta → campanha → medicao.

Estado: parcialmente existente. A coleta recorrente de anuncios, posts, funis e historico ainda precisa ser implementada.

### Pipeline F - Producao visual

Briefing → character/identity sheet → roteiro → shot list → assets → avatar/voz opcional → HyperFrames ou Remotion → legendas → QA → aprovacao → render → storage → publicacao.

Estado: especificado; fallback HTML/CSS existente; renderizacao produtiva ainda pendente.

## 5. Squads e responsabilidades

### O6 Orchestrator

Coordena briefing, handoffs, status, aprovacoes e resultado final.

Estado: especificado no mapa de squads; implementacao completa pendente.

### Strategy & Growth

ICP, oferta, posicionamento, funil, metas e diagnostico.

### Brand & Creative

Tom de voz, copy, identidade, hooks, roteiros e criativos.

### Visual Production

Storyboard, shot list, creative coding, HyperFrames, Remotion, avatar, voz e video.

### Product & Demo

LPs, sites, demos, componentes, deploys e integracao com o produto.

### Distribution & Analytics

Publicacao, canais, tracking, CRM, relatorios e metricas.

### Compliance & QA

Revisao de claims, LGPD, direitos de uso, qualidade visual, links e aprovacao.

## 6. Skills e ferramentas

### Ja existentes ou instaladas

- AIOX agents e squads base.
- copy.
- design-extractor.
- deep-research.
- data-analysis.
- Apify.
- Supabase.
- Vercel.
- Telegram.
- Remotion skill disponivel no ambiente.
- Creative Coding Motion Library documentada.

### Analisadas, mas nao devem ser instaladas cegamente

- Skill de geracao de leads: util, mas precisa ser adaptada ao fluxo WhatsApp/local do O6.
- HyperFrames: candidato para renderizacao HTML de videos curtos.
- Higgsfield: candidato para personagens e influencers artificiais.
- OpenVoice/ElevenLabs: voz clonada, sujeito a teste de portugues e consentimento.
- Sync/lip-sync: candidato para piloto de avatar.

## 7. Entregaveis vendaveis

### Fundacao e diagnostico estrategico

- Leitura do contexto, objetivos e ativos existentes.
- Offer Book, posicionamento e direcao de marca conforme o escopo.
- Auditoria digital, de jornada e CTA quando fizer parte do projeto.
- Prioridades e recomendacao de proximos passos.

### Projetos e acompanhamento

- Fundacao estrategica e de marca.
- Campanhas, sites e landing pages.
- Dashboards, videos, filmes e motion.
- Sprint com escopo e prazo definidos.
- Retainer mensal com volume, responsabilidades e revisoes definidos.

Nao existe preco padrao aprovado neste documento. Valores dependem do briefing,
do escopo, das ferramentas e dos custos de terceiros.

Nao vender como automatico o que ainda depende de aprovacao manual, renderizacao manual ou integracao nao testada.

## 8. Auditoria de prontidao

### Pronto para demonstrar

- Offer Book.
- Captura de prospects.
- Auditoria inicial.
- Mensagem personalizada.
- Demo publicada.
- Home institucional e hub de servicos.
- Paginas de diagnostico, fundacao, campanhas, sites, dashboards, videos,
  sprint e retainer.
- LPs de saude e advocacia.
- CRM e agenda basicos.
- Notificacoes Telegram.

### Pronto com supervisao

- Prospecccao fria.
- Diagnostico estrategico com escopo e revisao humana.
- Campanhas de LP.
- Videos HTML/CSS.
- Conteudo baseado em templates.

### Ainda nao pronto para vender como produto fechado

- Fabrica autonoma de conteudo.
- Monitoramento competitivo recorrente.
- Renderizacao HyperFrames em escala.
- Avatar e voz clonados em producao.
- Publicacao automatica multicanal.
- Analytics completo de atribuicao.

## 9. Proximas entregas para fechar a operacao

1. Publicar e testar em producao a home e as paginas de servico revisadas.
2. Completar o fluxo do Diagnostico Express: entrada publica, persistencia,
   geracao, revisao e entrega.
3. Aprovar e publicar os dois primeiros carrosseis da O6.
4. Gravar e editar os dois videos de estreia.
5. Executar por uma semana o piloto manual do Hermes Content Intelligence.
6. Executar o piloto completo do Espaco Redoma.
7. Implementar aprovacao humana no Telegram e checklist de QA persistente.
8. Confirmar valores, limites de escopo e modelo de proposta comercial.

## 10. Regra de decisao

O6 deve priorizar uma entrega pequena, visual e verificavel para cada cliente: diagnostico, uma melhoria demonstravel, uma campanha inicial e acompanhamento comercial. A automacao completa vem depois da validacao de venda e uso.

