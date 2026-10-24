# /inbox-process - Processar o +Inbox e as capturas

Lê `+Inbox/` e os `capturas.md` de cada projeto e leva cada item para o lugar certo do vault.

## Passos

1. Listar `+Inbox/` e todos os `Projetos/*/capturas.md`.
2. Para cada item, decidir: que tipo é (ideia, reunião, referência, tarefa, fato de projeto, recurso), a que projeto pertence (registro em `Sistema/projetos.md`), se é duradouro ou efêmero.
3. Propor o destino de cada item, num plano só, e esperar a aprovação:
   - fato ou decisão de projeto -> `Projetos/<slug>/ESTADO-ATUAL.md` (seção certa) ou nota da pasta; decisão que muda algo já escrito -> `/decisao`
   - reunião -> `Projetos/<slug>/reunioes/`
   - referência permanente -> pasta adequada, com frontmatter
   - efêmero -> descartar
   - incerto -> perguntar
4. Depois da aprovação: mover ou escrever cada item, completar o frontmatter padrão, acrescentar notas novas ao `INDEX.md` da pasta, remover do `capturas.md` as linhas promovidas.
5. Reportar: itens processados, se `+Inbox/` ficou vazio, o que ficou pendente.

Regra: nunca mover nada de `Arquivo/`.
