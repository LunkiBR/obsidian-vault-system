---
name: vault-system
description: Transforma um vault Obsidian qualquer num sistema de memória para agentes (INDEX -> MOC -> nota, uma pasta por projeto com ESTADO-ATUAL.md, registro de projetos lido por hook, protocolo de vigência, captura no mesmo turno, comandos) e escreve a seção correspondente no CLAUDE.md da pessoa. Use quando alguém pedir para organizar, migrar ou montar o vault para trabalhar com Claude Code, Codex ou outro agente.
---

# Vault system

Como usar: instale com `npx skills add LunkiBR/obsidian-vault-system -g -y` (ou copie esta pasta para `~/.claude/skills/vault-system`) e diga ao agente: "monte o sistema do meu vault em `<caminho>`". O agente segue as fases abaixo, na ordem. Nada é movido, apagado ou escrito fora do vault antes de a pessoa aprovar.

## O modelo

O agente começa toda sessão com a janela de contexto vazia. O vault é o disco: fica fora da cabeça do agente e é paginado para dentro quando precisa. Tudo que entra na janela é cobrado em toda sessão, para sempre, e a obediência às instruções cai conforme o texto cresce. O sistema inteiro é uma política de paginação:

- **Na janela, sempre**: a seção curta do `CLAUDE.md` da pessoa (preferências escritas à mão) e a saída do hook de boot (o registro de projetos, uma linha por projeto). Isso diz ao agente o que existe e onde está, sem ler nada.
- **No disco, lido em dois saltos**: `INDEX.md` raiz -> índice do domínio -> nota. Nunca varredura.
- **Fonte da verdade por projeto**: `Projetos/<slug>/ESTADO-ATUAL.md`. Em conflito com qualquer outra nota, ele vence.
- **Vigência explícita**: toda nota diz se está `ativo`, `deprecated` ou `arquivado`; nota superada nunca é apagada, ganha banner e aponta a substituta.
- **Captura barata, promoção criteriosa**: o que a pessoa diz e o vault não tem entra datado em `capturas.md` no mesmo turno; vira nota curada depois, na revisão.
- **Mecânica em hook, julgamento no modelo**: o hook é um script sem LLM que imprime o registro no boot e aponta a pasta certa quando um prompt cita um projeto.

## A estrutura alvo

```
<VAULT>/
  INDEX.md                      roteamento por intenção -> índice do domínio -> nota
  AGENTS.md                     regras do vault para qualquer agente; CLAUDE.md contém só `@AGENTS.md`
  Sistema/
    protocolo-memoria.md        vigência, precedência, frontmatter
    projetos.md                 registro: slug | aliases | pasta | repo | uma linha (o hook lê isto)
    migracao-<data>.md          tabela de -> de cada movimento feito
    INDEX.md
  Projetos/<slug>/              uma pasta por projeto, slug ascii-kebab
    ESTADO-ATUAL.md             fonte da verdade: resumo, decisões vigentes, pendências, changelog
    INDEX.md                    índice do projeto; subpastas livres
    capturas.md                 captura bruta datada (quando houver)
  Conhecimento/                 reutilizável entre projetos (uma nota ou MOC por tema)
  Infraestrutura/               servidores, ambientes, runbooks
  Pessoal/                      a pessoa fora dos projetos
  Relatorios/  Apresentacoes/   saídas datadas
  Arquivo/                      só leitura; nunca guia decisão (sessões antigas, legado)
  +Inbox/                       captura sem lugar, sem índice; esvaziar na revisão
```

Os templates desta skill em `templates/vault/` são a versão vazia de cada arquivo. Nomes de pasta em ascii sem espaço; nomes de nota livres.

## O contrato de uma nota

```yaml
---
tipo: projeto | estado-atual | decisao | arquitetura | pesquisa | reuniao | referencia | protocolo | index | nota
status: ativo | deprecated | arquivado        # vigência, só isto
etapa: rascunho | em_andamento | concluido    # progresso de trabalho, opcional
atualizado: AAAA-MM-DD
tags: [a, b]
# se deprecated: deprecated_em: AAAA-MM-DD, substituida_por: "[[nota-vigente]]"
---
```

Precedência: instrução fresca da pessoa > `ESTADO-ATUAL.md` > nota ativa > nota deprecated (ignorada; siga `substituida_por`). O texto completo está em `templates/vault/Sistema/protocolo-memoria.md`.

## Fases

### 0. Antes de tocar

- Git no vault: `git init` se não houver, e um commit do estado atual. É o backup.
- Node instalado (o hook e os scripts são Node). Obsidian MCP é opcional, mas é o que mantém links ao mover; sem ele, `scripts/inventory.mjs` lista os links que vão quebrar.
- Pergunte só o que o inventário não responde: o nome da pessoa, a língua das notas, e se há pastas que não podem ser tocadas.

### 1. Inventário (sem LLM)

```
node scripts/inventory.mjs "<VAULT>" > inventario.md
```

Sai um relatório: notas por pasta, chaves de frontmatter em uso, notas sem frontmatter, notas que nenhum índice cita, links não resolvidos, pastas candidatas a projeto (têm nota de estado, decisão ou ADR, ou cinco ou mais notas). Leia o relatório inteiro antes de propor qualquer coisa.

### 2. Mapa, com aprovação

Proponha, num só documento, e espere a aprovação:

1. O registro de projetos: slug ascii-kebab, aliases como a pessoa fala do projeto, pasta de destino, repositório no disco se houver, uma linha de resumo.
2. A tabela de movimentos `de -> para`, uma linha por pasta ou nota. Classifique por este critério: tem dono, objetivo e decisões -> `Projetos/<slug>/`; vale para vários projetos -> `Conhecimento/`; servidor ou ambiente -> `Infraestrutura/`; sobre a pessoa -> `Pessoal/`; entrega datada -> `Relatorios/` ou `Apresentacoes/`; histórico que ninguém consulta para decidir -> `Arquivo/`; não sabe -> `+Inbox/`.
3. O que será deprecated (duas notas ativas que se contradizem: proponha qual vence) e o que não será tocado.

Mudanças que a pessoa recusar saem do mapa. Não mova nada "para depois".

### 3. Mover

Com Obsidian MCP: `vault_move` nota a nota (os links são reescritos). Sem MCP: mova e reescreva os `[[links]]` que o inventário apontou. Cada movimento vai para `Sistema/migracao-<data>.md`, na tabela `de | para`. Commit ao fim.

### 4. Esqueleto

Para cada projeto: `ESTADO-ATUAL.md` e `INDEX.md` dos templates. O `ESTADO-ATUAL` não fica vazio: leia as notas da pasta e escreva Resumo, Decisões vigentes, Pendências e a primeira linha do Changelog, marcando com "(inferido, confirmar)" tudo que não veio de uma afirmação explícita. `INDEX.md` raiz, `Projetos/INDEX.md`, um `INDEX.md` por domínio, `Sistema/` com protocolo e registro, `AGENTS.md` do vault com `<NOME>`, `<LINGUA>` e `<VAULT>` preenchidos, `CLAUDE.md` contendo `@AGENTS.md`. Troque `<DATA>` pela data do dia em todos os templates.

Regra que vale deste ponto em diante: toda nota nova entra no `INDEX.md` da pasta no mesmo turno. Zero órfãs.

### 5. Frontmatter

Acrescente `tipo`, `status: ativo` e `atualizado` (data de modificação do arquivo) onde faltam. Valor de workflow em `status` (concluído, draft, agendada) vai para `etapa`. Aplique as deprecações aprovadas: frontmatter mais o banner `> [!warning] DEPRECATED em AAAA-MM-DD`, dizendo o que mudou e apontando a substituta.

### 6. Instalar na máquina da pessoa

```
node scripts/install.mjs --vault "<VAULT>"
```

Copia `hooks/vault-state.js` para `~/.claude/hooks/`, grava `VAULT_DIR` no bloco `env` e os dois hooks (`SessionStart`, `UserPromptSubmit`) em `~/.claude/settings.json`, sem duplicar o que já existe, e copia os comandos de `commands/` para `~/.claude/commands/` quando não existem. Ao final imprime o conteúdo de `templates/claude-md-section.md` com `<VAULT>` preenchido: mostre à pessoa e pergunte onde inserir no `~/.claude/CLAUDE.md` dela. Esse arquivo é dela, escrito à mão; o agente nunca o edita sem mostrar o diff.

### 7. Verificar e fechar

- Nova sessão imprime o registro no boot (o hook) e, num prompt que cite um alias, as duas linhas de ponteiro.
- `inventory.mjs` de novo: zero notas fora de índice, zero links não resolvidos, zero notas sem frontmatter fora de `Arquivo/`.
- Cada `Projetos/<slug>/` tem `ESTADO-ATUAL.md` com `atualizado` e uma linha em `Sistema/projetos.md`.
- Commit: `git -C "<VAULT>" add -A && git -C "<VAULT>" commit -m "vault-system: estrutura instalada"`.

## Operação, depois de instalado

As regras diárias ficam em dois lugares e não se duplicam: o que o agente deve fazer antes de perguntar, ao ouvir um fato novo e ao fechar um bloco de trabalho está em `templates/claude-md-section.md` (vai para o `CLAUDE.md` da pessoa); como navegar, ler e editar está em `templates/vault/AGENTS.md` (fica no vault). Os comandos: `/decisao` quando uma decisão muda, `/compress` para guardar uma sessão, `/inbox-process` para esvaziar o `+Inbox/` e promover capturas, `/weekly-review` para a auditoria semanal que deprecia contradições.

## Adaptações

- Codex ou outro agente: lê o `AGENTS.md` do vault; o hook e os comandos são do Claude Code.
- Língua: os templates estão em português; traduza o texto e mantenha os nomes de arquivo e de chave de frontmatter, que o hook e os comandos leem.
- Vault pequeno (menos de 50 notas): pule o inventário formal, mas não pule o mapa aprovado.
