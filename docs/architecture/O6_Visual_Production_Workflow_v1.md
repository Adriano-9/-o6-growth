# O6 Visual Production Workflow v1

**Sistema:** O6 Growth  
**Versão:** 1.0  
**Idioma:** português brasileiro  
**Status:** especificação operacional — sem implementação de código

## 1. Objetivo

Definir um fluxo único e repetível para transformar uma oportunidade comercial em campanhas, imagens, vídeos, sites e demos personalizados, com consistência de marca, controle humano e rastreabilidade de prompts, assets e renders.

O workflow atende especialmente campanhas de aquisição, apresentações comerciais, páginas de conversão, demos de produto e conteúdos para redes sociais. Ele deve funcionar para O6 Growth, AO Sport & Fitness, XRUN e clientes de setores regulados, como saúde e advocacia.

## 2. Princípios do sistema

- Briefing antes da ferramenta.
- Sistema de referências antes da geração.
- Separação entre identidade facial e continuidade corporal.
- Hero Frame aprovado antes da animação.
- Cada cena tem função comercial clara.
- IA gera possibilidades; a aprovação humana decide.
- Toda saída precisa ser versionada e reproduzível.
- Saúde e advocacia exigem revisão adicional de conformidade.

## 3. Design system O6

| Elemento | Definição |
|---|---|
| Fundo principal | `#0D0D0D` |
| Cor de ação/tecnologia | `#00E5FF` |
| Cor de energia/alerta | `#FF5722` |
| Tipografia | Sans-serif contemporânea, legível em mobile |
| Estilo | Editorial, tecnológico, direto, premium e funcional |
| Contraste | Alto; texto branco ou quase branco sobre fundo escuro |
| Uso do ciano | Links, dados, linhas de sistema, estados ativos |
| Uso do laranja | CTA, urgência, destaque e mudança de estado |

As cores podem ser adaptadas ao cliente, mas o O6 deve permanecer reconhecível nos bastidores, nos templates, nos dashboards e nos materiais internos.

## 4. Arquitetura do workflow

```text
Briefing
  ↓
Objetivo e oferta
  ↓
Direção visual + design system
  ↓
Face/Identity Sheet + Headless Character Sheet
  ↓
Hero Frames e referências aprovadas
  ↓
Storyboard + roteiro + shot list
  ↓
Geração de imagens e HyperFrames
  ↓
Remotion: montagem, texto, áudio, cortes e versões
  ↓
QA de continuidade e conformidade
  ↓
Aprovação humana
  ↓
Distribuição + métricas + aprendizado
```

## 5. Papéis dos agentes

| Agente | Responsabilidade | Saída principal |
|---|---|---|
| Estrategista | Objetivo, público, oferta, mensagem e KPI | Briefing aprovado |
| Diretor de criação | Conceito, tom, direção visual e referências | Creative direction |
| Guardião de marca | Regras de identidade e consistência | Brand QA |
| Character designer | Identidade facial, corpo, roupa e continuidade | Sheets aprovados |
| Roteirista | Roteiro, narração, CTA e versões | Script |
| Storyboard artist | Sequência visual e intenção dos planos | Storyboard |
| Prompt engineer | Prompts por ferramenta e versão | Prompt pack |
| Gerador visual | Imagens, hero frames e HyperFrames | Renders brutos |
| Editor | Montagem, cortes, texto, áudio e legendas | Master render |
| QA/compliance | Continuidade, legibilidade, claims e direitos | QA report |
| Publisher | Metadados, adaptação por canal e publicação | Pacote de distribuição |

Em operações pequenas, um mesmo agente pode acumular funções; as responsabilidades e aprovações continuam separadas.

## 6. Entradas e saídas por etapa

### 6.1 Briefing e objetivo da campanha

**Entradas:** prospect, contexto comercial, público, oferta, canais, prazo e restrições.  
**Perguntas obrigatórias:** o que queremos que a pessoa faça, por que agora, qual prova existe e o que não pode ser prometido?  
**Saídas:** `campaign_brief`, KPI primário, CTA, mensagem central e critérios de sucesso.

### 6.2 Headless Character Sheet

Folha corporal sem cabeça ou rosto. Deve mostrar corpo inteiro, proporções, silhueta, roupa, calçado, acessórios e vistas necessárias.

**Regra:** nunca misturar o rosto no sheet corporal principal. Isso reduz a tendência do modelo de reinterpretar a identidade facial quando a tarefa é preservar corpo e figurino.

**Saída:** `body_reference_id`.

### 6.3 Face/Identity Sheet

Folha separada para rosto, cabelo, pele, características faciais, expressões e ângulos autorizados.

**Saída:** `identity_reference_id`.

### 6.4 Direção visual e design system

Define paleta, luz, lente, textura, cenários, composição, tratamento de texto, ritmo e referências proibidas.

**Saída:** `visual_direction` e `reference_board`.

### 6.5 Geração de imagens

Gerar primeiro exploração controlada; depois selecionar e refinar hero frames. Cada geração deve registrar ferramenta, modelo, prompt, referências, seed quando disponível, proporção e data.

**Saídas:** hero frame, environment plate, prop sheet, pose sheet e variações aprovadas.

### 6.6 Geração de vídeos com HyperFrames

HyperFrames é o caminho principal quando a peça depende de continuidade visual, transformação, câmera e movimento gerados a partir de frames aprovados.

Entrada mínima:

- hero frame aprovado;
- referência corporal e facial, quando aplicável;
- prompt de movimento;
- duração e proporção;
- restrições de continuidade;
- áudio de referência, se houver.

**Saída:** takes versionados, com indicação de modelo, duração e limitações observadas.

### 6.7 Uso complementar do Remotion

Remotion não substitui HyperFrames na geração de movimento visual complexo. Ele entra depois, para montar e parametrizar:

- cortes;
- textos e CTAs;
- legendas;
- logos e lower thirds;
- trilha e voz;
- formatos 9:16, 1:1, 4:5, 16:9 e 4:3;
- variações personalizadas por lead;
- renders em lote.

### 6.8 Storyboard

Cada quadro deve indicar: objetivo do plano, ação, sujeito, cenário, câmera, transição, texto e áudio.

### 6.9 Shot list

| Campo | Obrigatório |
|---|---|
| ID do plano | Sim |
| Duração | Sim |
| Enquadramento | Sim |
| Movimento | Sim |
| Ação | Sim |
| Texto na tela | Quando houver |
| Narração | Quando houver |
| Música/SFX | Quando houver |
| Asset de referência | Sim |
| Critério de aprovação | Sim |

### 6.10 Roteiro e narração

Estrutura recomendada: gancho → tensão/problema → mecanismo ou prova → oferta → CTA. A narração deve ser escrita para fala, com frases curtas e pausas marcadas. Toda alegação deve ser verificável.

### 6.11 Edição, cortes e legendas

Priorizar compreensão sem áudio. As legendas devem respeitar área segura, contraste e ritmo de leitura. O primeiro corte deve eliminar silêncios, repetições, glitches de geração e planos sem função.

## 7. Controle de continuidade visual

O QA compara cada plano com os assets aprovados:

- rosto e identidade;
- corpo e proporções;
- roupa, textura e acessórios;
- cabelo, barba e maquiagem;
- iluminação e direção de sombra;
- cenário, arquitetura e clima;
- escala e eixo de câmera;
- movimento e física;
- texto, logo e produto;
- cor e tratamento final.

Qualquer mudança intencional deve ser registrada como decisão de direção, não tratada como erro.

## 8. Adaptação para saúde e advocacia

### Saúde

- Não prometer cura, resultado garantido ou diagnóstico.
- Separar informação educativa de orientação clínica.
- Exigir revisão do responsável técnico quando aplicável.
- Proteger imagem, voz e dados de pacientes.
- Obter consentimento documentado para depoimentos e casos.

### Advocacia

- Evitar promessa de resultado ou captação irregular.
- Revisar regras da OAB e do estado aplicável.
- Não usar urgência enganosa ou comparação indevida.
- Identificar conteúdo educativo e institucional.
- Registrar aprovação jurídica antes da publicação.

## 9. Aprovação humana

Há quatro gates:

1. **Gate estratégico:** briefing, oferta e CTA.
2. **Gate visual:** sheets, direção e hero frame.
3. **Gate editorial:** roteiro, narração, edição e legenda.
4. **Gate de publicação:** conformidade, metadados e canal.

Nenhum asset com pessoa real, claim sensível ou publicação externa deve atravessar o último gate sem aprovação humana.

## 10. Publicação e distribuição

O pacote final deve conter master, cortes por canal, thumbnail, legenda, CTA, hashtags, alt text, direitos e janela de publicação.

Distribuição prevista: Instagram, YouTube, LinkedIn, site, Telegram, CRM e apresentações comerciais. O Metricool ou outro conector pode organizar a distribuição, mas a autorização de publicação e o controle de aprovação permanecem explícitos.

## 11. Versionamento

Padrão de nome:

```text
{cliente}_{campanha}_{asset}_{canal}_{formato}_v{n}_{status}
```

Status permitidos: `draft`, `review`, `approved`, `published`, `archived`.

Todo prompt deve registrar modelo, ferramenta, referências, parâmetros, data, autor, objetivo e observações de falha.

## 12. Estrutura de pastas

```text
/o6-visual-production/
  /clients/{client-slug}/
    /campaigns/{campaign-slug}/
      01_brief/
      02_strategy/
      03_brand/
      04_references/
        /face-identity/
        /headless-body/
        /motion/
        /environment/
      05_prompts/
      06_storyboard/
      07_shot-list/
      08_generation/
      09_editing/
      10_qa/
      11_exports/
      12_distribution/
      manifest.json
  /templates/
  /schemas/
  /system/
```

## 13. Schemas de dados sugeridos

### CampaignBrief

```json
{
  "id": "campaign_001",
  "clientId": "client_espaco_redoma",
  "objective": "string",
  "audience": ["string"],
  "offer": "string",
  "primaryCta": "string",
  "channels": ["instagram", "youtube", "site"],
  "kpi": {"name": "leads", "target": 100},
  "claims": {"allowed": [], "restricted": []},
  "status": "draft"
}
```

### VisualReference

```json
{
  "id": "ref_001",
  "type": "headless_body",
  "filePath": "04_references/headless-body/body_v1.png",
  "identityPriority": "body_and_wardrobe",
  "approved": false,
  "version": 1
}
```

### Shot

```json
{
  "id": "shot_01",
  "durationSeconds": 4,
  "framing": "medium_close_up",
  "cameraMovement": "slow_push_in",
  "action": "string",
  "onScreenText": "string",
  "voiceover": "string",
  "audio": "string",
  "references": ["ref_001"],
  "status": "review"
}
```

### Render

```json
{
  "id": "render_001",
  "campaignId": "campaign_001",
  "tool": "hyperframes",
  "model": "string",
  "promptVersion": "prompt_014_v3",
  "inputAssets": ["ref_001"],
  "format": "9:16",
  "durationSeconds": 15,
  "qaStatus": "pending",
  "approvalStatus": "draft"
}
```

## 14. Integrações futuras

- **Next.js:** portal de briefing, revisão, aprovação, biblioteca e páginas de campanha.
- **Supabase:** campanhas, versões, usuários, assets, prompts, aprovações, renders e métricas.
- **Telegram:** alertas de aprovação, falha de render, novo lead e publicação concluída.
- **CRM:** associação entre prospect, campanha, personalização, CTA, lead e resultado.

O desenho de integração deve manter o asset como entidade central. Um mesmo render pode alimentar site, social, CRM e demo sem duplicar arquivos ou perder a origem.

## 15. HyperFrames versus Remotion

| Necessidade | HyperFrames | Remotion |
|---|---:|---:|
| Movimento visual gerado por IA | Principal | Não é o foco |
| Transformação de personagem | Principal | Não substitui |
| Consistência baseada em referências | Principal | Apenas organiza |
| Texto e CTA parametrizados | Limitado | Principal |
| Legendas e templates | Limitado | Principal |
| Variações em lote | Parcial | Excelente |
| Montagem determinística | Parcial | Excelente |
| Render por canal | Parcial | Excelente |

Regra: **HyperFrames cria o plano; Remotion transforma os planos aprovados em produto de comunicação.**

## 16. Exemplo: prospect Espaço Redoma

### Hipótese de campanha

Objetivo: gerar conversas qualificadas para conhecer o Espaço Redoma.  
Oferta: visita, conversa inicial ou avaliação, conforme a oferta real aprovada pelo cliente.  
Mensagem: um espaço claro, humano e confiável para o próximo passo da pessoa.  
CTA: solicitar informações ou agendar conversa.

### Aplicação

1. Briefing registra público, serviço, região, diferenciais e restrições.
2. Direção visual define ambiente, luz, textura e linguagem institucional.
3. Se houver personagem, criar face sheet e headless body sheet separados.
4. Gerar hero frame do ambiente e dos principais pontos de contato.
5. Criar storyboard de 15–30 segundos: problema, acolhimento, espaço, prova, CTA.
6. Gerar planos de ambiente e interação com HyperFrames.
7. Montar versões 9:16, 1:1 e 16:9 no Remotion.
8. Revisar claims, privacidade, acessibilidade e aprovação do cliente.
9. Exportar para Instagram, YouTube, site, Telegram e CRM.

O exemplo é um molde operacional; não autoriza alegações sobre serviços, resultados ou credenciais que ainda não tenham sido confirmadas pelo Espaço Redoma.

## 17. Critérios de qualidade e checklist final

### Estratégia

- [ ] Objetivo e KPI definidos.
- [ ] Oferta e CTA aprovados.
- [ ] Público e canal definidos.

### Identidade e visual

- [ ] Face sheet separado do body sheet.
- [ ] Headless sheet mostra roupa e proporções completas.
- [ ] Hero frame aprovado.
- [ ] Paleta e direção visual respeitadas.

### Produção

- [ ] Storyboard e shot list completos.
- [ ] Duração e enquadramento corretos.
- [ ] Prompt e referências versionados.
- [ ] HyperFrames usado apenas onde agrega movimento.
- [ ] Remotion usado para montagem e variações.

### QA

- [ ] Não há troca de rosto, roupa ou cenário sem intenção.
- [ ] Não há texto ilegível, deformado ou fora da área segura.
- [ ] Áudio, narração e legendas estão sincronizados.
- [ ] Claims e direitos foram revisados.
- [ ] Aprovação humana registrada.

### Distribuição

- [ ] Master e cortes por canal exportados.
- [ ] Thumbnail, legenda, CTA e alt text prontos.
- [ ] Arquivos nomeados e arquivados.
- [ ] Publicação e métricas vinculadas à campanha.

## 18. Roadmap por fases

### Fase 1 — Fundamentos

Formalizar schemas, estrutura de pastas, nomenclatura, gates de aprovação e templates de briefing.

### Fase 2 — Piloto XRUN

Executar uma campanha completa com face sheet, headless body sheet, hero frame, HyperFrames, Remotion e QA. Medir tempo, falhas e retrabalho.

### Fase 3 — Templates O6

Transformar o piloto em templates reutilizáveis para AO Sport & Fitness, XRUN, Senhora Fitness e clientes.

### Fase 4 — Portal operacional

Implementar Next.js e Supabase para briefing, biblioteca, prompts, aprovação e renders.

### Fase 5 — Integrações comerciais

Conectar Telegram, CRM, distribuição e métricas. Automatizar alertas e tarefas, mantendo aprovação humana para publicação sensível.

### Fase 6 — Escala e aprendizado

Criar biblioteca de falhas, score de qualidade, relatórios de campanha e otimização baseada em métricas reais.

## Decisões pendentes

- Modelo definitivo e parâmetros de HyperFrames.
- Plano e voz do ElevenLabs a validar no piloto, conforme decisao operacional abaixo.
- Critério de aprovação do cliente.
- Conector final de publicação.
- CRM inicial e campos obrigatórios.
- Definição da oferta e claims do Espaço Redoma.

Estas decisões não bloqueiam a documentação do workflow, mas precisam ser resolvidas antes da implementação técnica.

## Correção conceitual de camadas

- **Creative coding** é o método e a biblioteca de referências para criar animações e experiências com código.
- **HyperFrames** é a camada HTML-native de composição, motion graphics, demos e renderização frame a frame; não é, por si só, um gerador de personagens.
- **Remotion** também pode criar animações e é a camada preferencial para composição React, edição programática, áudio, legendas e múltiplas versões.
- **Ferramentas de avatar** cuidam de rosto, personagem, voz, lip-sync e performance, quando necessário.
- **O6** coordena dados, fluxo, aprovação humana, publicação e métricas.

## Decisao operacional de voz e conteudo - 2026-10-20

Esta decisao complementa o workflow e prevalece sobre referencias anteriores
que confundem HyperFrames com geracao de cenas por IA.

**Pipeline:** pesquisa de referencias -> briefing e voz da marca -> roteiro
original aprovado -> narracao -> cenas -> montagem e legendas -> aprovacao
humana -> exportacao e medicao.

1. Pesquisa: registrar links, data, nicho e sinais de desempenho de videos do
   Instagram, TikTok e YouTube. Transcricao apoia a analise de estrutura;
   visualizacoes nao comprovam vendas nem autorizam copiar o roteiro.
2. Roteiro: adaptar os aprendizados ao posicionamento, oferta e voz da O6
   ou do cliente. Definir CTA, duracao e cenas antes de gerar.
3. Narracao: gravacao direta do fundador ou ElevenLabs. ElevenLabs fica
   escolhido como opcao de voz sintetica e clonagem autorizada da propria
   voz, sujeita a validacao de plano, direitos comerciais e qualidade pt-BR.
   HeyGen fica fora do fluxo atual por decisao do usuario.
4. Cenas: gravacoes reais, assets aprovados, motion graphics ou geracao
   visual. Higgsfield e uma opcao mencionada no contexto; modelo de video
   e eventual lip-sync precisam ser identificados e testados. Nao assumir
   qual ferramenta foi citada oralmente como "Kinegen".
5. Avatar e lip-sync sao opcionais: videos narrados com imagens e cenas
   dispensam rosto animado. Um clone visual usa referencias autorizadas,
   audio aprovado e teste de sincronismo antes de entrar na producao.
6. Montagem: Remotion para audio, cenas, legendas, CTA e versoes.
   HyperFrames pode compor motion HTML; nao e requisito para narracao
   nem substitui um modelo de geracao de video.
7. Revisao: conferir pronuncia, naturalidade, volume, sincronismo quando
   houver, legibilidade e consistencia da marca. Aprovar antes de publicar.

**Primeiro piloto:** um roteiro O6 de 30 a 45 segundos, formato 9:16,
narracao direta ou ElevenLabs, cenas de apoio e legendas. Registrar custo
real, tempo de producao e retrabalho por video aprovado antes de escalar.

**Estado:** pipeline documentado. Este registro nao confirma conta paga,
API integrada, voz clonada, modelo de video validado nem publicacao
automatica. Nenhuma assinatura foi contratada nesta decisao.

Referencia oficial para plano e recursos:
https://elevenlabs.io/pricing
