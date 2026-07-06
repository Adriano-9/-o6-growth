# 07 · Bootstrap Higgsfield MCP

## Propósito

Documentar o uso real (limitado) do Higgsfield como gerador de vídeo via connector do Claude Chat, e o que falta para virar um pipeline real.

## Status: 🔴 Planejado / uso manual único

Higgsfield **não está integrado ao Claude Code** — é um MCP connector configurado em `claude.ai → Settings → Connectors`, acessível apenas em sessões de Claude Chat.

## O que aconteceu de real (caso auditado)

1. Usuário conectou Higgsfield via claude.ai (`https://mcp.higgsfield.ai/mcp`), autenticou via OAuth.
2. Gerou um vídeo pedindo conteúdo do Jhun Bistrô (peixe/chef/prato).
3. O vídeo entregue continha, na prática, uma animação de **marca O6 Growth** (texto "O6 GROWTH · SISTEMA COMERCIAL"), não o conteúdo do bistrô pedido.
4. Claude Code auditou o conteúdo do vídeo (via screenshot/Puppeteer) **antes** de integrar, identificou a divergência, e perguntou ao usuário como proceder em vez de assumir.
5. Decisão: o vídeo foi usado no lugar certo — hero da landing principal da O6 (`components/o6/O6Hero.tsx`), com `useScroll`/`useTransform` real do Framer Motion.

## Lição arquitetural

**Nunca integrar output de geração de mídia (Higgsfield, geração de imagem, etc.) sem validação de conteúdo.** O agente que gera não sabe o contexto de onde o asset será usado — quem integra (Claude Code) é responsável por conferir antes.

## Limitações conhecidas

- Claude Code **não pode** iniciar sessões OAuth (`claude mcp`/`/mcp` precisam de sessão interativa).
- Não há API key/token do Higgsfield disponível para chamada direta fora do connector claude.ai.
- Não existe pipeline automatizado — cada vídeo é gerado manualmente, um de cada vez, por humano usando Claude Chat.

## O que precisaria existir para virar pipeline (🔴 não implementado)

```
Trigger (ex.: novo prospect fechado)
     │
     ▼
Briefing automático (nome, nicho, pratos/serviços reais)
     │
     ▼
Chamada à API Higgsfield (precisa de credencial própria, não connector)
     │
     ▼
Validação de conteúdo (comparar briefing vs. output — heurística ou humano)
     │
     ▼
Upload em public/videos/<cliente>/ + integração na demo
```

Isso exigiria: (a) credencial de API própria da Higgsfield fora do connector, (b) rota `/api/video/generate` no Next.js, (c) etapa de validação automática ou humana antes do deploy.

## Checklist antes de qualquer vídeo gerado ir para produção

- [ ] O conteúdo do vídeo corresponde ao briefing pedido (nome, marca, contexto)?
- [ ] Foi revisado visualmente (screenshot), não só assumido pelo nome do arquivo?
- [ ] Se o conteúdo não bate, foi perguntado ao usuário antes de integrar em qualquer lugar?
