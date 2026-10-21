# Relatorio tecnico

## Inventario atual do O6

O ambiente ja possui `content-matrix`, `gemini-carousel`, `hook-generator`,
`niche-research`, `reels-scripting`, `voice-builder`, `graphic-designer` e
outras skills sociais. O squad de copy acrescenta headlines, scripts, VSL,
oferta e planejamento de campanha. A skill local `o6-carousel` controla Brand
Book, assets aprovados, copy, QA e exportacao; o renderer gera PNG e overview
com Puppeteer.

Isso significa que uma nova instalacao precisa trazer capacidade liquida, e nao
apenas outro nome para o mesmo processo.

## 1. sergebulaev/instagram-skills

**Estado:** 539 estrelas, 120 forks, 57 commits, licenca MIT e suporte declarado
a Codex, Claude Code e ao padrao Agent Skills. O pacote possui nove skills para
legenda, planejamento de carrossel, extracao de hooks, hashtags, humanizacao,
planejamento semanal, reaproveitamento, perfil e pesquisa de audiencia. A
pesquisa de audiencia usa Apify; a publicacao opcional usa Publora.

**Pontos fortes:** foco real em Instagram, aprovacao antes de publicar,
humanizacao, repurposing e leitura de nicho por dados.

**Limitacoes para o O6:** o proprio projeto informa que escreve palavras e
planos, mas o usuario fornece a midia. Ha sobreposicao alta com as skills sociais
ja instaladas. Publora acrescenta credencial e efeito externo que o O6 ainda nao
precisa ativar.

**Decisao:** nao instalar o pacote completo. Avaliar depois apenas os metodos de
`Audience Insights`, `Humanizer` e `Repurposer`, integrados ao motor Hermes e
sempre sem publicacao automatica inicial.

Fonte: [repositorio oficial](https://github.com/sergebulaev/instagram-skills).

## 2. tenfoldmarc/carousel-suite-skill

**Estado:** 17 estrelas, 6 forks, apenas 1 commit e quatro skills. O fluxo faz
ideia, copy, design e renderizacao via Puppeteer.

**Problemas objetivos:** o repositorio nao apresenta arquivo de licenca na raiz;
usa configuracao global em `~/.claude/skills`; duplica Puppeteer; possui regras
de copy muito orientadas a tecnologia e terminal; e chama `1080x1440` de 4:5,
embora 4:5 para largura 1080 seja `1080x1350`.

**O que vale aproveitar:** separacao conceitual entre ideia, copy, design e
entrega, alem do gate de aprovacao antes de renderizar. Esses principios ja estao
presentes no pipeline O6.

**Decisao:** nao instalar e nao copiar codigo. Manter apenas a referencia
conceitual.

Fonte: [repositorio oficial](https://github.com/tenfoldmarc/carousel-suite-skill).

## 3. Hainrixz/open-carrusel

**Estado:** 490 estrelas, 82 forks, 6 commits e licenca MIT. E um aplicativo
Next.js 16/React 19 local, nao apenas uma skill. Oferece chat, preview, filmstrip,
reordenacao, templates, versoes e exportacao PNG/ZIP com Puppeteer e Sharp.

**Pontos fortes:** experiencia visual de edicao, armazenamento local, HTML/CSS
flexivel, preview fiel ao export e arquitetura semelhante ao stack O6.

**Limitacoes para o O6:** roda como segundo aplicativo, baixa Chromium, duplica
Next.js/Puppeteer e abre um subprocesso da Claude CLI. Portanto o chat depende
do Claude local e nao resolve a pausa atual de creditos. Integrar seu codigo ao
O6 agora ampliaria manutencao e risco de conflito.

**Decisao:** candidato a laboratorio isolado, nao a dependencia do produto.
Testar somente quando o Claude estiver disponivel; depois decidir se alguma UX
de editor ou versionamento merece ser portada para o O6.

Fonte: [repositorio oficial](https://github.com/Hainrixz/open-carrusel).

## 4. coreyhaines31/marketingskills

**Estado:** 55,7 mil estrelas, 8,2 mil forks, mais de 1.200 commits, licenca MIT,
testes, empacotamento para Claude e suporte ao padrao Agent Skills, incluindo
Codex. A biblioteca cobre estrategia, social, copy, SEO/AEO/GEO, concorrentes,
ads, CRO, analytics, tracking, RevOps e sales enablement.

**Pontos fortes:** maior maturidade dos quatro, escopo profissional, skills
especificas para `content-strategy`, `competitor-profiling`, `ai-seo`, `schema`,
`ad-creative`, `conversion-tracking` e `sales-enablement`.

**Limitacoes para o O6:** instalar tudo criaria forte duplicacao com o plugin de
marketing ja disponivel e com o squad de copy. O projeto teve uma issue recente
de carregamento do marketplace no Claude Code, posteriormente encerrada; isso
reforca a necessidade de teste seletivo e versionado.

**Decisao:** melhor fonte para adocao seletiva. Nao instalar o pacote inteiro.

Fonte: [repositorio oficial](https://github.com/coreyhaines31/marketingskills) e
[issue de empacotamento](https://github.com/coreyhaines31/marketingskills/issues/243).

## Matriz final

| Repositorio | Conteudo | Render | Dados | Maturidade | Decisao O6 |
|---|---:|---:|---:|---:|---|
| instagram-skills | Alta | Nao | Apify | Media | Extrair capacidades |
| carousel-suite-skill | Media | Sim | Nao | Baixa | Nao instalar |
| open-carrusel | Media | Sim | Nao | Media | Teste isolado futuro |
| marketingskills | Alta | Nao | Via integracoes | Alta | Instalar seletivamente |

## Conclusao

O problema atual do O6 nao e falta de mais uma skill de carrossel. E consolidar
pesquisa, estrategia, roteiro, identidade, producao e aprovacao num pipeline sem
regras concorrentes. A camada visual deve continuar sendo `o6-carousel`; novas
skills devem alimentar etapas anteriores, nunca substituir o Brand Book.
