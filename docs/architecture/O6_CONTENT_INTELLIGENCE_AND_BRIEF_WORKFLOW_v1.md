# O6 Content Intelligence and Brief Workflow v1

**Status:** arquitetura operacional; coleta recorrente ainda não implantada.

## Decisão

Radar e Brief Motor são partes do mesmo sistema, com responsabilidades
distintas. O Radar descobre e registra evidências. O Brief transforma somente
as oportunidades úteis em uma pauta contextualizada para cada marca.

```text
Fonte pública autorizada
  -> captura de evidência
  -> deduplicação e pontuação (Radar)
  -> checagem de contexto, fonte e adequação (Brief)
  -> pauta priorizada
  -> roteiro e direção criativa
  -> produção
  -> QA e aprovação humana
  -> publicação
  -> métricas e aprendizado
```

## Papéis

| Camada | Responsabilidade | Estado atual |
| --- | --- | --- |
| Intelligence Engine / Radar | Monitorar fontes permitidas, registrar referência, data, link, formato, desempenho observado e hipótese. | Planilha de mineração existe; coleta diária não está automatizada. |
| Brief Motor | Relacionar a descoberta ao ICP, oferta, voz, objetivo, canal e evidência necessária. | Pode ser executado com Offer Book e revisão humana; não há base unificada. |
| Content Engine | Criar pauta, roteiro, carrossel, vídeo, legenda e adaptações. | Assistido; skills e templates existem. |
| QA e aprovação | Conferir origem, direitos, claims, identidade, CTA e links. | Manual; gate obrigatório antes de publicar. |
| Distribution & Analytics | Preparar publicação, registrar URL e ler resultados. | Parcial; publicação e métricas multicanal não são automáticas. |

## Ativos reaproveitáveis

- **O6 Growth Operating System v1:** define os cinco motores e confirma que
  Content e Intelligence são complementares.
- **Mineração YouTube:** fornece campos de canal, visualizações, engajamento,
  potencial viral e dificuldade de recriação. Há duplicações e `#NAME?`; é
  fonte de recuperação, não sistema pronto.
- **Offer Book:** fornece público, oferta, voz, objeções e posicionamento para
  evitar que tendência vire conteúdo genérico.
- **Hermes:** hoje é bot/monitor e piloto de inteligência. Não é agente
  autônomo de publicação nem scheduler comercial completo.

## Contrato mínimo de uma descoberta

Cada item do Radar deve carregar: fonte e URL, data da coleta, plataforma,
tema, formato, público aparente, hook observado, evidência mensurável,
limitações de uso, hipótese editorial, pontuação, status e responsável pela
revisão. Transcrições e referências servem para analisar estrutura; o roteiro
final deve ser original.

## Pontuação de prioridade

Pontuar de 0 a 3, sem inventar métricas:

1. aderência ao ICP e à oferta;
2. clareza do problema;
3. evidência pública verificável;
4. potencial de adaptação original;
5. viabilidade de produção;
6. proximidade com uma conversão ou conversa comercial.

Itens sem fonte, fora da voz da marca, dependentes de copiar terceiros ou sem
CTA coerente não entram na fila de produção.

## Próxima implementação, na ordem

1. Recuperar e limpar a planilha de Mineração YouTube em cópia versionada.
2. Definir uma única base de `content_opportunities` e `content_briefs` no
   Supabase, com migration nomeada e aprovação humana antes de aplicar.
3. Executar sete dias de coleta manual assistida pelo Hermes para calibrar
   critérios e fontes.
4. Só então conectar n8n para agendar coleta, deduplicar e avisar no Telegram.
5. Manter publicação, investimento e qualquer interação externa sob aprovação
   humana explícita.

## Limites

O sistema não promete viralização, acesso irrestrito a dados de redes,
transcrição ou reutilização de obras de terceiros. Ele reduz tempo de pesquisa
e melhora a seleção de pautas; não substitui direção, direitos de uso ou
aprovação editorial.
