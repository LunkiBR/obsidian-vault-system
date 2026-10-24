---
tipo: index
status: ativo
atualizado: <DATA>
tags: [index, hub]
---

# Índice raiz do vault

> Ponto de entrada único para agentes e pessoas.
> Caminho: `INDEX.md` (aqui) -> índice do domínio -> nota alvo. Nunca varra pastas.
> Projeto: comece pelo `ESTADO-ATUAL.md` dele. Em conflito com qualquer outra nota, ele vence ([[Sistema/protocolo-memoria]]).

## Roteamento por intenção

| Se você precisa de... | Vá para | O que encontra |
|---|---|---|
| Qualquer projeto | [[Sistema/projetos]] e depois `Projetos/<slug>/ESTADO-ATUAL.md` | Registro com slug, aliases, pasta, repo e uma linha por projeto |
| Lista de projetos com uma linha cada | [[Projetos/INDEX]] | |
| Conhecimento reutilizável | [[Conhecimento/INDEX]] | |
| Servidores e ambientes | [[Infraestrutura/INDEX]] | |
| A pessoa fora dos projetos | [[Pessoal/INDEX]] | |
| Relatórios e apresentações | [[Relatorios/INDEX]], [[Apresentacoes/INDEX]] | Saídas datadas |
| Regras do vault, registro, migrações | [[Sistema/INDEX]] | |
| História congelada | [[Arquivo/INDEX]] | Só leitura; nunca guia decisão |
| Captura rápida ainda sem lugar | `+Inbox/` | Processar com `/inbox-process` |

## Regras curtas para agentes

1. Zero notas órfãs: toda nota nova entra no `INDEX.md` da pasta no mesmo turno.
2. Projeto novo: pasta `Projetos/<slug>/` com `ESTADO-ATUAL.md` e `INDEX.md`, mais uma linha em [[Sistema/projetos]].
3. Fato novo dito pelo dono e ausente do vault: `Projetos/<slug>/capturas.md`, datado, no mesmo turno.
4. Decisão que muda algo já escrito: `/decisao`.
5. Instruções completas em [[AGENTS]].
