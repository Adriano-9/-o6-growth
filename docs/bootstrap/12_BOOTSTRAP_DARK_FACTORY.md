# 12 · Bootstrap Dark Factory

## Propósito

Este documento existe para **registrar a lacuna**, não para descrever uma arquitetura — seguindo o mesmo padrão de `memory/audit-engine.md` (charter + perguntas em aberto para módulos planejados sem definição clara).

## Status: 🔴 Conceito não definido

"Factory Dark" foi citado na constituição da O6 como um dos sistemas da plataforma, mas em nenhum momento desta sessão — nem em `CLAUDE.md`, `AGENTS.md`, `memory/*`, ou conversas anteriores auditáveis — o conceito foi explicado. **Não existe código, não existe schema, não existe nem uma frase descrevendo o que ela faz.**

## Por que este documento não inventa um escopo

A regra "nunca documente como implementado algo que ainda não existe" se aplica com ainda mais força aqui: inventar uma arquitetura para um nome ambíguo criaria documentação **enganosa**, pior que a ausência de documentação. Duas leituras plausíveis do termo "Dark Factory":

1. **Dark Factory (manufatura)** — fábrica 100% autônoma, sem intervenção humana, luzes apagadas. Nesse caso, seria uma "meta-factory": o conjunto de Factories (Sites, LPs, Dashboards, Conteúdo) rodando sem trigger humano, orquestrado por Hermes.
2. **"Dark" marketing/growth** — técnicas agressivas, growth hacking de zona cinzenta, ou conteúdo controverso para viralização.

Essas duas leituras levam a produtos completamente diferentes. Implementar qualquer uma sem confirmação seria adivinhação, não arquitetura.

## Perguntas em aberto (bloqueantes)

- [ ] Qual das duas leituras acima (ou uma terceira) é a intenção real?
- [ ] Existe precedente em outro projeto do usuário (ex.: `xrun-projeto`, mencionado em `memory/xrun.md` como "placeholder, escopo indefinido" — mesma categoria de dívida)?
- [ ] Qual pilar de negócio ela fortalece — Intelligence, Factory, Operations?
- [ ] Há um MVP mínimo que valide o conceito antes de arquitetura completa?

## Ação recomendada

Não escrever nenhuma linha de código sob este nome até as perguntas acima serem respondidas pelo usuário. Quando isso acontecer, este arquivo deve ser reescrito com uma seção nova (não apagar o histórico — seguir a regra de `memory/*`: "entradas antigas só são editadas se a decisão foi revertida, com strikethrough").
