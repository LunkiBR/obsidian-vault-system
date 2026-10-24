# Vault system

Transforme um vault Obsidian qualquer em memória de longo prazo para agentes de código (Claude Code, Codex): o agente lê o que precisa em dois saltos, sabe qual é a verdade vigente de cada projeto, anota o que você diz no mesmo turno e nunca reorganiza nada sem a sua aprovação.

Turns any Obsidian vault into long-term memory for coding agents. The kit is in Portuguese; file names and frontmatter keys are what the scripts read, the prose you can translate.

## Instalar

```bash
npx skills add LunkiBR/obsidian-vault-system -g -y
```

Sem o `skills` CLI: clone este repositório em `~/.claude/skills/vault-system`.

Depois, numa sessão do Claude Code:

```
monte o sistema do meu vault em C:\caminho\do\vault
```

O agente segue o playbook de `SKILL.md` em sete fases: backup em git, inventário sem LLM, mapa de reorganização que você aprova antes de qualquer movimento, mover, esqueleto (índices, `ESTADO-ATUAL.md` por projeto, protocolo, registro), frontmatter, instalação na sua máquina e verificação.

## O que fica na sua máquina

| Onde | O quê |
|---|---|
| no vault | `INDEX.md` raiz, `AGENTS.md` do vault, `Sistema/` (protocolo de vigência, registro de projetos), `Projetos/<slug>/` com `ESTADO-ATUAL.md` e `INDEX.md`, `Arquivo/`, `+Inbox/` |
| `~/.claude/hooks/vault-state.js` | hook sem LLM: imprime o registro de projetos no início da sessão e aponta a pasta certa quando um prompt cita um projeto |
| `~/.claude/settings.json` | `env.VAULT_DIR` e os dois hooks (`SessionStart`, `UserPromptSubmit`) |
| `~/.claude/commands/` | `/decisao`, `/compress`, `/inbox-process`, `/weekly-review` (só os que você ainda não tem) |
| `~/.claude/CLAUDE.md` | uma seção que o instalador imprime e você cola; o agente não edita esse arquivo sozinho |

Nada sai da sua máquina: o kit não tem telemetria nem rede. O que o agente lê do vault vai para o provedor do modelo, como em qualquer sessão.

## Como funciona no dia a dia

- `INDEX.md` -> índice do domínio -> nota. Nunca varredura.
- `Projetos/<slug>/ESTADO-ATUAL.md` é a fonte da verdade do projeto; em conflito, ele vence.
- Toda nota tem `status: ativo | deprecated | arquivado`; nota superada ganha banner e aponta a substituta, nunca é apagada.
- O que você diz e o vault não tem vai datado para `capturas.md` no mesmo turno; `/inbox-process` e `/weekly-review` promovem para as notas curadas.
- Decisão que muda: `/decisao` atualiza o `ESTADO-ATUAL`, o changelog e deprecia o que foi superado, num passo.

## Scripts

- `node scripts/inventory.mjs <vault>`: relatório determinístico (notas por pasta, frontmatter, notas fora de índice, links não resolvidos, pastas candidatas a projeto). Roda antes e depois da migração.
- `node scripts/install.mjs --vault <vault> [--dry-run]`: hook, settings e comandos, idempotente.

Requisitos: Node 18 ou mais novo; Claude Code 2.1.277 ou mais novo lê `AGENTS.md` sozinho (o template inclui um `CLAUDE.md` com `@AGENTS.md` para versões anteriores); Obsidian e o MCP do Obsidian são opcionais, mas o MCP é o que mantém os links ao mover notas.

## Por que é assim

O modelo mental vem de Kun Chen: o arquivo de preferências do usuário é escrito à mão e pequeno; memória vive em arquivos no disco que qualquer agente lê, não numa camada privada de um fornecedor; mecânica repetida vai para hook sem LLM, julgamento fica com o modelo. Leitura: [Your AGENTS.md is a neural net](https://kunchenguid.substack.com/p/your-agentsmd-is-a-neural-net).

## Licença

MIT.
