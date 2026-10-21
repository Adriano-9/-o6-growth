# Revisao do guia Marcondes Instagram Skills

## Veredito

O guia do Marcondes e uma documentacao independente, clara e majoritariamente
fiel ao repositorio `sergebulaev/instagram-skills`. Ele nao apresenta uma nova
ferramenta: explica, em portugues, como instalar e operar o mesmo pacote de nove
skills ja analisado neste dossie.

O material serve como manual de onboarding e referencia operacional. Nao deve
ser tratado como prova de desempenho, garantia de alcance ou especificacao
tecnica superior ao repositorio oficial.

## O que foi confirmado

- nove skills para legenda, carrossel, hashtags, humanizacao, planejamento,
  reaproveitamento, hooks, audiencia e perfil;
- compatibilidade declarada com Claude Code e Codex;
- leitura de dados publicos de nicho e perfil via Apify;
- publicacao opcional via Publora, sempre depois de aprovacao;
- geracao visual opcional via Pixfaro;
- licenca MIT no repositorio oficial;
- criacao de texto e planos mesmo sem integracoes externas.

## Limites importantes para o O6

1. `ig-carousel-planner` planeja os slides; nao substitui o sistema visual,
   renderizacao, inspecao e exportacao do `o6-carousel`.
2. `ig-hook-extractor` nao consegue ler automaticamente um Reel especifico
   somente pela URL. O repositorio pede que o usuario forneca a legenda ou os
   primeiros segundos.
3. `ig-audience-insights` usa dados publicos de hashtags e perfis. Ele nao
   entrega lista completa de engajados, transcricao de video nem inteligencia
   competitiva irrestrita.
4. Horarios, quantidade de hashtags e formulas de hook sao heuristicas, nao
   garantias do algoritmo.
5. Publora e Pixfaro introduzem custo, credenciais e dependencia externa. Nao
   devem ser ativados antes de teste controlado e politica de aprovacao.
6. A skill nao resolve sozinha pesquisa de videos virais, download, transcricao,
   analise visual, roteiro original, producao e distribuicao. Isso exige um
   pipeline coordenado.

## Decisao de adocao

Nao instalar o pacote completo agora. O O6 ja possui skills equivalentes para
hooks, pesquisa de nicho, matriz de conteudo, carrossel, Reels, voz, formatacao e
avaliacao. A instalacao integral criaria sobreposicao e duas autoridades para a
mesma etapa.

Usar o repositorio como referencia e testar seletivamente estas capacidades:

- `ig-audience-insights`, integrado ao Apify e ao motor Hermes;
- `ig-hook-extractor`, com entrada fornecida ou transcrita legalmente;
- `ig-repurposer`, para derivar formatos sem copiar a peca de origem;
- regras uteis do `ig-humanizer`, subordinadas a voz oficial da O6.

Nao adotar neste momento:

- Publora para publicacao automatica;
- Pixfaro como gerador visual principal;
- perfil de voz armazenado dentro da pasta de uma dependencia;
- recomendacoes genericas de horario ou hashtag como regra fixa.

## Pipeline recomendado

`Coleta autorizada -> Metadados e transcricao -> Ranking relativo -> Analise de
hook e formato -> Roteiro original -> Voz O6 -> Producao visual -> QA humano ->
Aprovacao no Telegram -> Publicacao -> Metricas`

### Responsabilidades

- **Hermes:** coleta recorrente, deduplicacao, ranking e fila de oportunidades.
- **Estrategia:** escolhe tema, publico, tese, evidencia e oferta.
- **Copy:** cria o roteiro original sem reproduzir texto ou identidade de
  terceiros.
- **O6 Carousel / Visual Production:** aplica Brand Book, assets aprovados e
  exportacao.
- **QA:** valida fonte, clareza, direitos, promessa e identidade.
- **Humano:** aprova publicacao e investimento.

## Aplicacao imediata

Para os primeiros conteudos da O6, a pesquisa externa deve inspirar estrutura,
hook e formato. A evidencia visual deve vir do proprio O6, do site e dos cases
aprovados: Jhun Bistro, Emporio dos Graos e La Casita quando houver captura
validada. O ciano legado e imagens rejeitadas nao entram na comunicacao.

## Fontes verificadas

- Guia independente fornecido pelo usuario, revisado em 21/10/2026.
- Repositorio oficial: https://github.com/sergebulaev/instagram-skills

