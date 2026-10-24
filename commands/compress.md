# /compress - Salvar a sessão atual como registro

Comprime a sessão atual num registro estruturado em `Arquivo/registros-de-sessao/` do vault.

## Passos

1. Checar mudanças de decisão (obrigatório): alguma decisão de produto, domínio ou infra mudou ou foi revertida nesta sessão? Se sim, executar o fluxo do `/decisao` agora, antes de salvar.
2. Identificar o projeto (slug de `Sistema/projetos.md`); perguntar só se não der para inferir.
3. Perguntar, numa pergunta só, se algo não deve entrar no registro (informação sensível, rascunho).
4. Criar `Arquivo/registros-de-sessao/AAAA-MM-DD_HHMM_<slug>.md` com a estrutura abaixo (criar a pasta se não existir).
5. Acrescentar a linha do registro no `Arquivo/INDEX.md` (seção "Registros de sessão", criar se faltar) e, se o projeto ganhou pendências ou decisões, uma seção datada no `ESTADO-ATUAL.md` dele.
6. Confirmar com o caminho completo.

```markdown
---
tipo: sessao
data: AAAA-MM-DD
projeto: <slug>
status: arquivado
tags: [sessao, <slug>]
---

# Registro de sessão - <projeto> - <data>

## Resumo

<Narrativa curta: o que foi feito, como, por quê.>

## Decisões tomadas

-

## Aprendizados e padrões

-

## Pendências

- [ ]

## Arquivos modificados

-

## Erros e soluções

-
```

Nunca registre segredos (senhas, tokens, connection strings).
