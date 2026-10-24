---
tipo: registro
status: ativo
atualizado: <DATA>
tags: [sistema, projetos, registro]
---

# Registro de projetos

Uma linha por projeto. O hook `vault-state.js` imprime esta tabela no início de cada sessão e, a cada prompt que cite um alias, aponta o agente para a pasta certa.
Regras: `slug` em ascii-kebab; `aliases` separados por `;` (como o dono fala do projeto); `pasta` relativa ao vault e contendo `ESTADO-ATUAL.md`; `repo` é o caminho no disco ou `-`.
Projeto novo = linha nova aqui, no mesmo turno em que a pasta é criada.

| slug | aliases | pasta | repo | uma linha |
|---|---|---|---|---|
| exemplo | Exemplo; Projeto Exemplo | Projetos/exemplo | - | Apague esta linha ao registrar o primeiro projeto |
