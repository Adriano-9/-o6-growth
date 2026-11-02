# Recomendacoes de adocao

## Agora

1. Nao instalar nenhum dos quatro pacotes completos.
2. Manter `o6-carousel` como unico controlador de identidade e exportacao.
3. Usar as skills sociais ja instaladas para hooks, matriz, pesquisa de nicho,
   roteiro de Reels e voz.
4. Usar o squad de copy para oferta, persuasao e scripts longos.

## Piloto seletivo recomendado

Auditar e, se realmente superiores ao que ja existe, importar apenas estas
capacidades do `marketingskills`:

- `content-strategy`;
- `competitor-profiling`;
- `ai-seo`;
- `schema`;
- `ad-creative`;
- `conversion-tracking`.

Elas cobrem lacunas reais do O6: motor editorial, inteligencia competitiva,
SEO/AEO/GEO, distribuicao paga e medicao.

## Motor Hermes

Usar como inspiracao do `instagram-skills`:

- pesquisa periodica de audiencia e nicho via Apify;
- extracao de hook de referencias fornecidas;
- repurposing para formatos nativos;
- humanizacao antes da aprovacao.

O Hermes deve gerar uma fila priorizada e rascunhos. Publicacao automatica e
Publora ficam desativadas ate existir governanca, credenciais separadas e teste
de rollback.

O guia independente do Marcondes foi revisado e confirma esse desenho. Ele e um
bom manual em portugues, mas nao adiciona uma ferramenta nova. A analise
detalhada esta em `04-marcondes-guide-review.md`.

## Open Carrusel

Executar futuramente em pasta separada, sem copiar para o app O6. O teste deve
validar:

- qualidade do editor comparada ao fluxo HTML atual;
- preservacao do Brand Book;
- versionamento e reordenacao;
- custo de manutencao;
- funcionamento real no Windows;
- dependencia da Claude CLI.

## Regra arquitetural

O pipeline final deve ter uma autoridade por etapa:

`Pesquisa -> Estrategia -> Copy -> O6 Carousel -> QA -> Aprovacao -> Publicacao`

Nenhuma skill externa pode escolher paleta, case ou CTA depois que o trabalho
entra na etapa `O6 Carousel`.
