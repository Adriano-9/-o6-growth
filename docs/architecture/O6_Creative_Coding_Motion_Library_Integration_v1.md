# O6 Creative Coding Motion Library Integration v1

## O que é

O repositório [Awesome Opus 5.5 Videos](https://github.com/yihui-dev/awesome-opus5-5-videos) reúne prompts e referências de animações geradas como código. A página oficial informa que os exemplos usam HTML, Canvas, SVG, GSAP, Three.js e tecnologias relacionadas, com licença MIT para o repositório. O acervo é atualizado; portanto, a contagem deve ser conferida no momento de cada uso.

## Onde entra no O6

Essa biblioteca será uma camada de **motion graphics e creative coding** dentro do Visual Production Workflow.

Ela pode fornecer:

- aberturas e encerramentos;
- tipografia cinética;
- transições;
- gráficos e dados animados;
- explainers visuais;
- cenas 3D de produto;
- módulos interativos para sites e demos.

## Onde não entra

Não é um editor de vídeo e não substitui:

- corte de gravações;
- tratamento de áudio;
- legendagem de entrevistas;
- edição de talking head;
- geração de personagens por HyperFrames;
- montagem final em Remotion.

## Fluxo O6

```text
referência → seleção do prompt → adaptação de conteúdo e design system →
geração do módulo → exportação → montagem em Remotion/HyperFrames/site → QA → aprovação
```

## Classificação de uso

| Categoria | Uso no O6 |
|---|---|
| Motion graphics | aberturas, dados, títulos e transições |
| Explainers | demonstrações e educação do prospect |
| 3D scenes | produto, serviço, arquitetura e tecnologia |
| Games/interativos | demos, landing pages e experiências de site |

## Regras de adaptação

1. Preservar a estrutura de movimento que motivou a seleção.
2. Trocar tema, texto, cores e conteúdo pelo briefing aprovado.
3. Aplicar o design system do cliente ou do O6.
4. Não reutilizar automaticamente pessoas, logos, músicas ou imagens do post original.
5. Registrar autor, URL, licença, tecnologia, prompt original e alterações.
6. Submeter o módulo ao mesmo QA visual, jurídico e de marca dos demais assets.

## Decisão Creative Coding, HyperFrames, Remotion e avatar

- **Creative coding:** método de criação com código e biblioteca de referências para gráficos, interface, tipografia, dados e módulos interativos.
- **HyperFrames:** camada HTML-native para composição, motion graphics, demos e renderização frame a frame.
- **Remotion:** composição React, edição programática, áudio, legendas, CTA e múltiplas versões.
- **Ferramentas de avatar:** criação de rosto, personagem, voz, lip-sync e performance, quando necessárias.
- **O6:** orquestração, dados, aprovação humana, publicação e métricas.

Creative coding e HyperFrames podem se sobrepor: um prompt ou módulo de creative coding pode ser executado e renderizado dentro de HyperFrames. Remotion continua sendo a camada preferencial para composição React, edição programática e versões por canal.

Arquitetura recomendada:

```text
Creative Coding Library
        ↓
Roteiro + storyboard + design system
        ↓
Avatar/voz/lip-sync, quando necessário
        ↓
HyperFrames ou Remotion
        ↓
QA visual e de conteúdo
        ↓
Aprovação humana
        ↓
Publicação + CRM + métricas
```

## Backlog derivado

- criar catálogo interno de módulos aprovados;
- registrar tecnologia e licença por módulo;
- criar schema `MotionModule`;
- testar um módulo para XRUN e um para Espaço Redoma;
- exportar módulos para uso em Remotion;
- testar uma demo interativa em Next.js somente após o piloto visual.

## Schema sugerido

```json
{
  "id": "motion_module_001",
  "title": "string",
  "category": "motion_graphics",
  "sourceUrl": "https://github.com/yihui-dev/awesome-opus5-5-videos",
  "originalAuthor": "string",
  "license": "MIT",
  "technology": ["SVG", "GSAP"],
  "promptVersion": "v1",
  "adaptations": ["colors", "copy", "brand"],
  "exportFormats": ["webm", "mp4", "html"],
  "approved": false
}
```

## Conclusão

O acervo deve ser incorporado ao O6 como **biblioteca de módulos visuais reutilizáveis**, e não como um novo editor ou um novo squad. O agente responsável será o `Motion Editor`/`Creative Coding Agent` dentro do Visual Production Squad, acionado quando o briefing pedir uma animação gráfica, um explainer, uma cena 3D ou uma demo interativa.

## Próximo piloto: MotionModule Espaço Redoma

Implementar um único módulo, sem ampliar a arquitetura:

- hook de 3 segundos;
- tela dividida;
- captura da auditoria;
- identidade visual O6 Modern Noir (`#0D0D0D`, `#111111`, `#222222`, `#F8F9FA`, `#FF5722`);
- duração total de 15 segundos;
- saída HyperFrames;
- versão vertical;
- checklist de QA;
- aprovação humana antes do envio.

