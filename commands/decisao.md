# /decisao - Registrar mudança de decisão

Registra uma mudança de decisão na hora: atualiza o `ESTADO-ATUAL.md` do projeto, acrescenta ao changelog e deprecia as notas superadas, num passo só. É o gesto padrão quando algo muda no meio de qualquer sessão.

## Uso

- `/decisao <projeto>: <o que mudou>`
- `/decisao` sem argumento: perguntar o projeto e o que mudou (uma pergunta curta).

## Passos

1. Localizar o projeto em `Sistema/projetos.md` (slug ou alias) e abrir `Projetos/<slug>/ESTADO-ATUAL.md`. Sem pasta ainda: propor criar pelo template da skill `vault-system` antes de continuar.
2. Entender a mudança: o que valia antes, o que vale agora, por quê. Extrair da conversa; no máximo uma pergunta.
3. Encontrar as notas afetadas: buscar na pasta do projeto as notas que documentam o modelo superado. Mais de três notas: delegar a busca a um subagente barato, só leitura.
4. Atualizar o `ESTADO-ATUAL.md`: editar ou acrescentar o item em "Decisões vigentes"; acrescentar no topo do "Changelog" a linha `- AAAA-MM-DD: o que mudou, por quê, [[nota-deprecada]] -> [[nota-vigente]]`; atualizar `atualizado`.
5. Deprecar cada nota superada, nunca apagar: frontmatter `status: deprecated`, `deprecated_em`, `substituida_por: "[[nota-vigente]]"` (ou `"[[Projetos/<slug>/ESTADO-ATUAL]]"` se não houver nota nova); banner `> [!warning] DEPRECATED em AAAA-MM-DD` logo após o frontmatter com o que mudou e a substituta; no `INDEX.md` da pasta, prefixar a linha com `DEPRECATED - `.
6. Se o repositório do projeto (coluna `repo` do registro) tiver `AGENTS.md` afirmando a decisão antiga, corrigir a afirmação.
7. Confirmar com um resumo: o que mudou, notas depreciadas, linha do changelog.

## Regra

Instrução fresca do dono > notas do vault. Este comando mantém essa hierarquia verdadeira sem perder histórico.
