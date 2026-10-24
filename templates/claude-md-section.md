## O vault Obsidian é a fonte da verdade

Caminho: `<VAULT>` (o "vault"), repositório git local.
O vault, não este arquivo nem a memória do chat, guarda o que é verdade sobre meus projetos, decisões e conhecimento.
As regras dele ficam dentro dele: `AGENTS.md` (navegação, frontmatter, ferramentas) e `Sistema/protocolo-memoria.md` (vigência, deprecação, precedência).
Leia o `AGENTS.md` do vault uma vez por sessão quando tocar no vault; o hook de boot já imprime o registro de projetos.

- Consulte por padrão, não só quando pedido: qualquer tarefa que cite um projeto, um cliente ou uma decisão; antes de propor arquitetura ou escopo de um projeto conhecido; antes de escrever qualquer nota ou documento.
- Navegue `INDEX.md` -> índice do domínio -> nota, no máximo dois saltos. Nunca varra pastas.
- Precedência: instrução fresca minha > `ESTADO-ATUAL.md` > nota ativa > nota deprecated (siga `substituida_por`). `Arquivo/` é história, só leitura.
- Nunca me pergunte um fato sobre um projeto registrado antes de ler o `ESTADO-ATUAL.md` dele e buscar na pasta. Não está lá? Pergunte uma vez e capture a resposta.
- Fato, decisão, preferência, caminho ou restrição que eu disser e o vault não tiver: acrescente datado em `Projetos/<slug>/capturas.md` no mesmo turno e diga "anotei no vault". Decisão que muda algo já escrito: `/decisao`. Projeto sem linha em `Sistema/projetos.md`: adicione a linha no mesmo turno.
- Ao fechar um bloco de trabalho num projeto: seção datada no `ESTADO-ATUAL.md`, toda nota nova no `INDEX.md` da pasta, commit do vault. Sessão que vale guardar: `/compress`. Nada registra uma sessão a menos que você faça.
- Leituras do vault além de uma ou duas notas vão para um subagente barato, só leitura; uma nota conhecida você lê sozinho.
