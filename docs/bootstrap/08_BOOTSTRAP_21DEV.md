# 08 · Bootstrap 21st.dev MCP

## Propósito

Documentar a relação real (fraca) entre o projeto O6 e o 21st.dev — hoje é referência de padrão visual, não integração funcional.

## Status: 🔴 Planejado / não conectado

`21st.dev` aparece nesta sessão como **MCP server listado mas nunca autorizado com sucesso** ("The following MCP servers require authentication before their tools can be used: 21st"). Nenhuma chamada real foi feita à API do 21st.dev neste projeto.

## Uso real que ocorreu

Em tarefas de redesign de landing pages (Jhun Bistrô, Empório dos Grãos), o usuário pediu explicitamente para "buscar referência no 21st.dev ou outro site" para elevar o nível de design. Como o MCP não estava autorizado, Claude Code:

1. Não inventou acesso que não tinha.
2. Aplicou os **padrões conhecidos** do 21st.dev (custom cursor, magnetic buttons, scroll-linked reveals, testimonials orbitais) manualmente em HTML/CSS/JS vanilla, usando a lib `motion` (motion.dev, mesma equipe do Framer Motion) via CDN — já que essas páginas são standalone, fora do Next.js.
3. Documentou a substituição: "usei o padrão X do 21st.dev, implementado manualmente, não via API."

## Regra derivada

Quando um MCP não está autorizado e a tarefa não pode esperar a autorização (sessão não-interativa não consegue rodar OAuth), a alternativa válida é: **implementar manualmente o padrão conhecido, documentando a fonte de inspiração e a limitação**, nunca fingir que a chamada de API aconteceu.

## Como autorizar (para quando fizer sentido)

Conectores de claude.ai (incluindo 21st) são autorizados em `claude.ai → Settings → Connectors`, não pela sessão do Claude Code. Isso precisa ser feito pelo usuário, fora desta ferramenta.

## Padrões de design já aplicados manualmente (catálogo para reuso)

| Padrão | Onde foi usado | Como reimplementar sem API |
|---|---|---|
| Custom cursor (dot + ring, cresce em hover) | `public/demos/jhun-bistro-premium.html` | CSS `position: fixed` + `mousemove` listener + `requestAnimationFrame` easing |
| Magnetic button | Mesmos demos | `mousemove` no botão, `translate()` proporcional à distância do centro |
| Scroll-linked reveal | `app/os/*`, dashboards | Framer Motion `useInView` (React) ou `motion.dev` `scroll()` (vanilla) |
| Testimonials orbitais | `jhun-bistro-premium.html` seção "Vozes" | `transform: rotate() translate() rotate()` posicionando avatares em círculo |
| Horizontal pin-scroll | `emporio-dos-graos-premium.html` categorias | `position: sticky` + `translateX` proporcional ao scroll |

## Checklist antes de "buscar no 21st.dev"

- [ ] O MCP está de fato autorizado nesta sessão? (verificar lista de servidores conectados)
- [ ] Se não estiver, isso foi comunicado ao usuário — não fingido?
- [ ] O padrão foi implementado manualmente com qualidade equivalente, documentando a fonte?
