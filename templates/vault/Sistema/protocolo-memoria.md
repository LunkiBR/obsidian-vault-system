---
tipo: protocolo
status: ativo
atualizado: <DATA>
tags: [sistema, memoria, protocolo]
---

# Protocolo de memória: vigência do conhecimento

Regras que mantêm o vault confiável como memória de agentes. Vale para todo o vault.

## O contrato

1. Toda nota tem vigência no frontmatter: `status: ativo | deprecated | arquivado` e `atualizado: AAAA-MM-DD`.
2. Nota deprecated nunca guia decisão. Ela recebe `status: deprecated`, `deprecated_em`, `substituida_por: "[[nota-vigente]]"` e um banner `> [!warning] DEPRECATED em AAAA-MM-DD` no topo dizendo o que mudou e apontando a substituta. Não se apaga: histórico tem valor, mas precisa estar sinalizado.
3. Fonte da verdade por projeto: `Projetos/<slug>/ESTADO-ATUAL.md`, com as decisões vigentes datadas e um changelog. Em conflito, ele vence qualquer outra nota.
4. Toda mudança de decisão é registrada na hora via `/decisao`: atualiza o `ESTADO-ATUAL`, acrescenta ao changelog e deprecia as notas superadas, num passo só.
5. Auditoria semanal (`/weekly-review`): um subagente barato lê as notas modificadas na semana, compara com cada `ESTADO-ATUAL` e propõe deprecações para as contradições.
6. Zero notas órfãs: toda nota nova entra no `INDEX.md` da pasta no mesmo turno. Pasta nova sem índice ganha um, ligado ao índice pai.

## `status:` e `etapa:`

`status:` é só vigência (`ativo | deprecated | arquivado`). Estado de trabalho ou de reunião (`concluido`, `rascunho`, `agendada`) usa `etapa:`. As duas chaves nunca competem.

## Regras de leitura para agentes

- Carregue o `ESTADO-ATUAL.md` do projeto antes de usar qualquer outra nota.
- Ao citar uma nota, confira o `status`. Se `deprecated`, siga `substituida_por` e cite a substituta.
- Instrução fresca do dono vence qualquer nota. Se conflitarem, sinalize e proponha `/decisao`.
- Contradição entre notas ativas: não escolha em silêncio; aponte e proponha qual deve ser deprecated.
