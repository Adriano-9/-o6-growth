# O6 Edit Direction Layer v1

## Objetivo

Transformar a fala, o roteiro e a intenção comercial em decisões visuais de edição: cortes, ritmo, composição, movimento, tipografia, legendas, efeitos sonoros e conexão entre planos.

Esta camada complementa o `O6 Visual Production Workflow`, a `Creative Coding Motion Library`, HyperFrames e Remotion.

## Arquitetura

```text
Roteiro/narração
  ↓
Análise semântica da fala
  ↓
Direção editorial por beat
  ↓
Storyboard + shot list
  ↓
Assets: HyperFrames, creative coding, imagens e gravações
  ↓
Remotion/editor
  ↓
QA + aprovação humana
```

## Regra central

Quando a fala descreve uma relação, a edição deve mostrá-la visualmente.

| Intenção verbal | Tradução visual possível |
|---|---|
| separar | elementos se afastam, corte dividido, quebra de composição |
| conectar | linhas se unem, match cut, transição contínua |
| comparar | tela dividida, lado a lado, alternância A/B |
| aumentar | escala, zoom, crescimento de gráfico ou objeto |
| reduzir | shrink, afastamento, perda de contraste |
| acelerar | cortes mais curtos, speed ramp, repetição rítmica |
| parar | hold frame, silêncio, redução de movimento |
| revelar | máscara, wipe, foco, iluminação progressiva |
| corrigir | antes/depois, substituição de elemento, mudança de cor |
| demonstrar | callout, destaque, zoom funcional ou sequência passo a passo |

## Edit Beat

Cada unidade de fala deve ser convertida em um `EditBeat` com:

- fala ou trecho da narração;
- intenção comunicacional;
- palavra-chave visual;
- asset ou plano correspondente;
- tipo de corte/transição;
- ritmo e duração;
- texto na tela;
- música e SFX;
- critério de aprovação.

### Schema sugerido

```json
{
  "id": "beat_001",
  "voiceover": "Quando você separa identidade e corpo...",
  "intent": "explain",
  "visualVerb": "separate",
  "visualAction": "face_sheet and body_sheet move apart",
  "assetIds": ["identity_sheet", "headless_body_sheet"],
  "transition": "split_reveal",
  "durationSeconds": 3,
  "onScreenText": "Identidade ≠ corpo",
  "audio": {"music": "low_pulse", "sfx": "soft_whoosh"},
  "approvalStatus": "draft"
}
```

## Relação com os outros módulos

- **Roteirista:** escreve a fala e marca intenções.
- **Editorial Director/Motion Editor:** converte fala em Edit Beats.
- **Storyboard Agent:** transforma beats em quadros.
- **Creative Coding Agent:** cria gráficos, textos e relações visuais.
- **HyperFrames:** gera os planos de personagem, ação e câmera.
- **Remotion:** compõe cortes, transições, texto, áudio, legendas e versões.
- **QA:** verifica se a edição reforça a mensagem e não cria interpretação errada.

## Regras para edição de conteúdo falado

1. Não ilustrar cada palavra de forma literal quando isso prejudicar a clareza.
2. Priorizar a ideia principal de cada frase.
3. Usar texto na tela apenas para reforçar, não duplicar tudo que é falado.
4. Sincronizar mudança visual com a palavra-chave ou pausa relevante.
5. Dar tempo suficiente para leitura e compreensão.
6. Usar contraste de movimento: ação para explicar, pausa para destacar.
7. Manter identidade, roupa, cenário e direção de luz consistentes.
8. Evitar efeitos que pareçam promessa, diagnóstico ou garantia em saúde e advocacia.

## Exemplo aplicado ao O6

### Fala

“O rosto fica separado do corpo para melhorar a consistência.”

### Direção editorial

1. Mostrar o Face/Identity Sheet no lado esquerdo.
2. Mostrar o Headless Body Sheet no lado direito.
3. Usar uma linha de separação ciano.
4. Fazer os dois elementos se afastarem suavemente.
5. Exibir `IDENTIDADE` e `CORPO + ROUPA`.
6. Conectar os dois apenas na composição final.
7. Fechar com o hero frame aprovado.

## QA da camada editorial

- [ ] Cada beat tem uma intenção clara.
- [ ] A imagem reforça a fala, sem criar contradição.
- [ ] A transição tem função narrativa.
- [ ] O texto é legível e não excessivo.
- [ ] O ritmo corresponde ao tom da marca.
- [ ] Não há excesso de efeitos decorativos.
- [ ] Áudio, SFX e cortes estão sincronizados.
- [ ] A versão final funciona sem áudio quando necessário.

## Decisão operacional

Esta camada não cria um novo squad. Ela amplia o papel do `Motion Editor` e do `Editorial Director` dentro do Visual Production Squad. O backlog de implementação deve incluir o job `compile-edit-beats`, responsável por transformar roteiro em uma lista estruturada de decisões editoriais.

