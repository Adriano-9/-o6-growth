# 20 · Bootstrap Deploy

## Propósito

Documentar o processo real de deploy — Vercel (app Next.js) e VPS (Intelligence Engine + Hermes Bot) — e as convenções de commit usadas de fato nesta sessão.

## Deploy Vercel (app principal)

| Item | Valor real |
|---|---|
| Projeto | `personaltraineradriano-4648s-projects/o6-growth` |
| Repositório GitHub conectado | `https://github.com/Adriano-9/-o6-growth` (branch `main`) |
| URL de produção | `https://o6-growth.vercel.app` |
| Comando | `npx vercel --prod --yes` (CLI local, autenticado como `personaltraineradriano-4648`) |

### Fluxo real de setup (feito uma vez)

```bash
git remote add origin https://github.com/Adriano-9/-o6-growth.git
git branch -M main
git push -u origin main
npx vercel link --yes --scope personaltraineradriano-4648s-projects
npx vercel --prod --yes
```

**Nota real:** `vercel link` sem `--scope` correto falha com "You cannot set your Personal Account as the scope" — usar o scope de time (`...-projects`), não o pessoal.

### Verificação pós-deploy (obrigatória, não opcional)

```bash
curl -s -o /dev/null -w "%{http_code}" https://o6-growth.vercel.app/<rota> --max-time 20
```

Toda rota nova é testada com `curl` retornando 200 antes de reportar sucesso ao usuário — nunca assumir que o build passou só porque o comando não deu erro.

## Deploy VPS (Intelligence Engine, Hermes Bot)

**Limitação real e permanente nesta sessão:** Claude Code **não tem acesso SSH** ao VPS (`147.182.135.206`) — todo `ssh root@...` retorna `Permission denied (publickey,password)`.

### Padrão adotado (usado 3 vezes com sucesso)

1. Claude Code escreve um script bash idempotente e completo (`scripts/vps-bootstrap-*.sh` ou `vps-patch-*.sh`).
2. O script inclui: criação de diretórios, heredocs com o código Python, instalação de deps, criação de systemd unit, teste automático no final.
3. O usuário abre o console root do VPS (painel do provedor, ex.: DigitalOcean) e cola o script.
4. O usuário reporta a saída (log do systemd, resultado do teste).
5. Claude Code só declara sucesso **depois** de ver a prova real (nunca antes).

### Scripts VPS existentes

| Script | Status de execução |
|---|---|
| `scripts/vps-bootstrap-intelligence.sh` | 🟢 executado, confirmado (Telegram brief funcionando) |
| `scripts/vps-bootstrap-hermes-bot.sh` | 🟢 executado, `/ping` confirmado no Telegram |
| `scripts/vps-patch-offer-book-mini.sh` | 🟡 pronto, aguardando execução do usuário |

### Regra de segurança de secrets

Nenhum script commitado no repositório contém chave real. `scripts/vps-bootstrap-intelligence.sh` foi sanitizado (commit `37ab2da`) trocando chaves reais por `<YOUR_*>` depois que o classificador de segurança bloqueou o commit original — as chaves reais vivem só em `/opt/o6-intelligence/.env` no servidor.

## Convenção de commits (Conventional Commits, aplicada de fato)

```
feat(<escopo>): descrição curta e imperativa
fix(<escopo>): correção de bug
refactor(<escopo>): reorganização sem mudar comportamento
docs: documentação
chore: build, deps, configs
```

**Regras observadas nesta sessão:**
- Nunca `--no-verify`, nunca `--amend` de commit já pushado.
- Um commit por tarefa lógica — não misturar feature nova com refactor não relacionado.
- Mensagem sempre explica o "porquê", não só o "o quê".
- `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>` (ou modelo ativo na sessão) no rodapé.

## Design System Modern Noir (aplicado em toda UI nova)

```css
--bg: #0D0D0D;
--card-bg: #111111;
--border: #222222;
--accent: #FF5722;
--text-primary: #FFFFFF;
--text-secondary: #888888;
```

Framer Motion obrigatório para toda animação interativa (fade-up com `useInView`, counter com `useSpring`, hover scale). Nunca CSS `transition` para isso — só para hover simples.

## Checklist antes de qualquer deploy

- [ ] `npx tsc --noEmit -p .` limpo?
- [ ] Rotas novas testadas com `curl` retornando 200 em produção (não só local)?
- [ ] Se toca no VPS, o script é idempotente e tem teste embutido?
- [ ] Secrets reais nunca aparecem em texto plano no que será commitado?
