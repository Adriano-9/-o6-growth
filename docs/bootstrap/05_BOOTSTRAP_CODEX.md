# 05 · Bootstrap Codex

## Propósito

Definir o papel pretendido do Codex como agente de **frontend, UI, refatoração e componentes** — delegando o que Claude Code não deveria estar fazendo sozinho.

## Status real

🔴 **Codex não está wired a este repositório hoje.** `AGENTS.md` existe como convenção que qualquer agente (incluindo Codex) deveria seguir, mas não há evidência de execução real do Codex neste projeto nesta sessão — toda a UI foi construída por Claude Code.

## Responsabilidade pretendida (quando ativado)

| Faz | Não faz |
|---|---|
| Componentes React/Next visuais | Migrations, schema Supabase |
| Refatoração de UI existente | Lógica de negócio/scoring |
| Landing pages, dashboards visuais | Decisão de arquitetura de módulo |
| Ajuste fino de Tailwind/Framer Motion | Deploy, commits estruturais sem revisão |

## Regras que valem para Codex (herdadas de `AGENTS.md`)

- Nunca `any` em TypeScript.
- `"use client"` no topo de qualquer componente com hooks.
- Reusar `getSupabase()`, nunca criar novo `createClient`.
- Design System Modern Noir obrigatório — nunca inventar paleta nova.
- Framer Motion para toda animação interativa — CSS `transition` só para hover simples.

## Handoff Claude Code → Codex (fluxo pretendido, não testado)

```
Claude Code define:
  - Schema de dados (props, tipos)
  - Rota/API que alimenta o componente
  - Contrato de dados (o que entra, o que sai)
       │
       ▼
Codex implementa:
  - Componente visual completo
  - Estados de loading/erro
  - Responsividade (375px mobile-first)
       │
       ▼
Claude Code valida:
  - Integração com a API real
  - TypeScript strict
  - Preview funcional
```

## Prompt reutilizável — briefing para Codex

```
CONTRATO DE DADOS:
  input: [tipo TypeScript exato]
  output esperado: [componente + estados]

DESIGN SYSTEM: Modern Noir — #0D0D0D bg, #FF5722 accent, #111111 cards, #222222 bordas
ANIMAÇÃO: Framer Motion obrigatório (fade-up, counter, hover scale)
RESPONSIVO: mobile-first, breakpoint 375px

NÃO TOCAR: lógica de negócio, schema, rotas de API — só consome o que já existe.
```

## Checklist antes de aceitar entrega do Codex

- [ ] Zero `any`, zero erro de TypeScript?
- [ ] Segue Modern Noir sem inventar cor nova?
- [ ] Framer Motion usado corretamente (não CSS puro em interações)?
- [ ] Testado em 375px?
- [ ] Reusa componentes existentes em vez de duplicar?
