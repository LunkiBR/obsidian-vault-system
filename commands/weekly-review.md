# /weekly-review - Revisão semanal

Consolida a semana e audita a memória: o que foi feito, o que mudou, o que contradiz o `ESTADO-ATUAL` de cada projeto.

## Passos

1. Período: sem argumento, a semana atual (segunda até hoje); com data (`/weekly-review AAAA-MM-DD`), a semana a partir dela.
2. Coletar: registros em `Arquivo/registros-de-sessao/` do período, linhas novas em `Projetos/*/capturas.md`, notas com `atualizado` no período (ou mtime, via `search_query` quando houver MCP).
3. Auditoria de memória, num subagente barato e só leitura: para cada projeto com atividade, ler o `ESTADO-ATUAL.md` e as notas modificadas; devolver (a) contradições entre notas ativas e as decisões vigentes, com o trecho, (b) notas deprecated ainda citadas sem aviso em índices, (c) capturas que ainda não estão refletidas na nota curada.
4. Apresentar a lista; após a aprovação, aplicar: deprecações (frontmatter + banner, conforme `Sistema/protocolo-memoria.md`), promoções de capturas, linhas no changelog de cada `ESTADO-ATUAL`.
5. Rodar o `/inbox-process` se `+Inbox/` não estiver vazio.
6. Salvar `Sistema/revisoes/AAAA-WNN.md` (criar a pasta e adicioná-la ao `Sistema/INDEX.md` na primeira vez) com a estrutura abaixo.

```markdown
---
tipo: revisao-semanal
data: AAAA-MM-DD
status: ativo
tags: [revisao, semanal]
---

# Revisão semanal - semana NN (DD/MM a DD/MM)

## O que foi feito

## O que arrastou

## Decisões e aprendizados

## Projetos com atividade

| Projeto | Situação | Próximo passo |
|---|---|---|

## Saúde da memória

- Notas depreciadas:
- Contradições resolvidas:
- Capturas promovidas:

## Prioridades da próxima semana

1.
```
