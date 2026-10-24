# AGENTS.md - Regras do vault para agentes

Vale para qualquer agente (Claude Code, Codex, outro) que leia ou escreva neste vault.
`CLAUDE.md` na raiz contém só `@AGENTS.md`. Edite só este arquivo.
Vault: `<VAULT>`, repositório git local.

## Dono e estilo

<NOME>. Respostas diretas, foco no trabalho. Notas em <LINGUA>, nomes de pasta em ascii-kebab.

## Estrutura

```
INDEX.md                 hub: roteamento por intenção -> índice do domínio -> nota
AGENTS.md / CLAUDE.md    este arquivo e o import
Sistema/                 protocolo-memoria, projetos (registro), migracao-*
Projetos/<slug>/         um projeto por pasta: ESTADO-ATUAL.md, INDEX.md, capturas.md (quando houver), subpastas livres
Conhecimento/            reutilizável entre projetos
Infraestrutura/          servidores, ambientes
Pessoal/                 a pessoa fora dos projetos
Relatorios/  Apresentacoes/   saídas datadas
Arquivo/                 só leitura; nunca guia decisão
+Inbox/                  captura bruta sem índice
```

Registro de projetos: [[Sistema/projetos]] (slug, aliases, pasta, repo, uma linha).
O hook `vault-state.js` do Claude Code lê esse registro no início da sessão e a cada prompt que cite um alias.

## Precedência e vigência ([[Sistema/protocolo-memoria]])

1. Instrução fresca do dono > `ESTADO-ATUAL.md` do projeto > nota ativa > nota deprecated (ignorada; siga `substituida_por`).
2. `status:` é vigência (`ativo | deprecated | arquivado`); progresso de trabalho usa `etapa:`.
3. Nota deprecated nunca é apagada: recebe frontmatter e banner apontando a substituta.
4. `Arquivo/` nunca guia decisão.

## Recall antes de perguntar

Antes de perguntar ao dono qualquer fato sobre um projeto registrado, leia o `ESTADO-ATUAL.md` dele (seção Resumo primeiro) e faça uma busca na pasta.
Se depois disso o fato não estiver no vault, pergunte uma vez e capture a resposta.

## Captura no mesmo turno

Fato, decisão, preferência, caminho ou restrição que o dono disser e o vault não tiver:
acrescente em `Projetos/<slug>/capturas.md` (crie se não existir), formato `- AAAA-MM-DD: <uma ou duas linhas, nas palavras dele>`, e diga "anotei no vault".
Decisão que muda algo já escrito vai por `/decisao`. `capturas.md` não é fonte de verdade: `/inbox-process` e `/weekly-review` promovem as linhas para as notas curadas.

## Frontmatter padrão

```yaml
---
tipo: projeto | estado-atual | decisao | arquitetura | pesquisa | reuniao | referencia | protocolo | index | nota
status: ativo | deprecated | arquivado
etapa: rascunho | em_andamento | concluido     # opcional
atualizado: AAAA-MM-DD
tags: [a, b]
# se deprecated: deprecated_em, substituida_por: "[[nota-vigente]]"
---
```

## Como acessar

Com o MCP do Obsidian (`mcp__obsidian__*`), prefira-o a ler e escrever no disco: ele mantém links e backlinks e atualiza links ao mover.

| Para | Use | Evite |
|---|---|---|
| Ver uma pasta | `vault_list` | varrer o disco |
| Achar por metadado | `search_query` (JsonLogic sobre `path`, `frontmatter.*`, `tags`, `links`, `backlinks`, `stat.mtime`) | `search_simple` com termo comum (devolve o vault inteiro) |
| Ler | `vault_get_document_map` e depois `vault_read` de uma seção | ler a nota inteira quando uma seção basta |
| Editar trecho | `vault_patch` em heading, block ou frontmatter, com `ifMatch` igual ao `version` | `vault_write` em nota existente (sobrescreve sem aviso) |
| Acrescentar | `vault_append` | reescrever o arquivo |
| Mover ou renomear | `vault_move` | `mv` no disco |

Sem o MCP: leia pelo disco; para escrever, avise e use o caminho exato.
Leituras largas (resumo, comparação, auditoria de links) vão para um subagente barato, só leitura, briefado com a pergunta, o índice de partida e o formato da resposta.
Imagens e PDFs ficam em `anexos/` da pasta e são citados com `![[nome.png]]`.

## Fechar um trabalho

1. Acrescente uma seção datada ao `ESTADO-ATUAL.md` do projeto e atualize `atualizado`. Nunca reescreva o passado.
2. Toda nota nova entra no `INDEX.md` da pasta (zero órfãs); a versão superada vira `deprecated` no lugar.
3. Projeto novo: pasta `Projetos/<slug>/`, `ESTADO-ATUAL.md`, `INDEX.md`, linha em [[Sistema/projetos]].
4. `/decisao` para decisão mudada; `/compress` para registrar a sessão em `Arquivo/registros-de-sessao/`.
5. Commit no git ao fim do bloco de trabalho: `git -C "<VAULT>" add -A && git -C "<VAULT>" commit -m "<o que mudou>"`.
