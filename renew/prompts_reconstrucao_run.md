# Prompts para reconstruir as páginas de `run/` com React/Next

Este roteiro foi elaborado comparando as páginas HTML e seus scripts em `run/` com a aplicação Next existente em `manager/`. Os prompts abaixo podem ser usados em sequência por um agente de código.

## Mapa de páginas e destinos sugeridos

O projeto `manager/` já usa o App Router em `manager/app/pages/`; preserve esse padrão para as telas administrativas existentes. Para o fluxo de participação, use rotas separadas sob `manager/app/run/`, evitando misturar a experiência dos respondentes com o painel de gestão.

| Origem em `run/` | Responsabilidade | Destino sugerido |
|---|---|---|
| `index.html` | Entrada que redireciona para o círculo | `manager/app/run/page.tsx` → redirecionar para `/run/circulo` |
| `escolher.html` + `js/escolher.js` | Escolher respondente para a rodada e iniciar | `manager/app/run/escolher/page.tsx` |
| `circulo.html` + `js/circulo_new.js` | PIN, seleção do círculo, respondente, apresentação e resposta de questões | `manager/app/run/circulo/page.tsx` e componentes sob `manager/app/run/components/` |
| `admin/painel.html` + `admin/js/painel.js` | Acompanhamento de respostas e questões puladas | Nova página `manager/app/pages/painel-run/page.tsx` |
| `admin/notas.html` + `admin/js/notas.js` | Notas por círculo | Reaproveitar/estender `manager/app/pages/respostas_aluno/page.tsx` ou criar `manager/app/pages/notas/page.tsx` |
| `admin/corrigir.html` + `admin/js/corrigir.js` | Listar e pontuar respostas, ver gabarito e gerar sugestões | Reaproveitar/estender `manager/app/pages/corrigir/page.tsx` e `manager/app/components/Corrigir.tsx` |

As páginas administrativas equivalentes já existentes devem ser inspecionadas antes de criar novas rotas. Prefira completar a implementação atual, sem duplicar telas ou lógica.

## Prompt 1 — fundação, configuração e componentes compartilhados

> Inspecione `manager/` e `run/` antes de editar. A aplicação React/Next está em `manager/` e usa App Router. Reimplemente o front-end legado do diretório `run/` sem alterar os contratos ou a persistência do backend, salvo se uma incompatibilidade real for comprovada.
>
> Separe as URLs dos dois serviços em configuração reutilizável: `NEXT_PUBLIC_API_URL` para o serviço administrativo (historicamente `staff.py`, porta 4999) e `NEXT_PUBLIC_RUNTIME_API_URL` para o serviço de execução (`backend.py`, porta 5000). Não componha URLs com IP lido do DOM, não fixe IDs de círculo (os scripts antigos contêm, por exemplo, 55/56) e não coloque credenciais no código. Trate erros HTTP e respostas de negócio com estados de carregamento, erro e vazio visíveis.
>
> Mantenha a experiência legada responsiva e a identidade visual Serena. Reutilize os estilos e imagens necessários de `run/css/` e `run/images/`, copiando somente os ativos efetivamente usados para `manager/public/` e ajustando seus caminhos. Aproveite componentes e estilos já existentes em `manager/app/`; não migre jQuery nem Bootstrap apenas para reproduzir a implementação antiga.
>
> Crie helpers tipados para chamadas aos dois serviços e componentes compartilhados para cabeçalho, mensagens de estado e renderização de enunciado. Como o fluxo usa `sessionStorage`, implemente-o em componentes cliente e só leia o armazenamento após a hidratação. Preserve os caminhos de API descritos nos prompts seguintes e valide os formatos de resposta observando `run/backend.py` e `run/staff.py`.

## Prompt 2 — entrada e escolha do respondente

> Reconstrua `run/index.html` e `run/escolher.html` com Next/React. A rota `/run` deve substituir o redirecionamento legado de dois segundos e levar a `/run/circulo`. Na página `/run/escolher`, mostre o endereço/identificação do serviço apenas se isso já for útil à interface; carregue o círculo ativo do serviço de execução (`GET /circulo_ativo`) e os respondentes/progresso com `GET /retornar_contagem_respostas_geral/{circuloId}`.
>
> Exiba uma tabela/lista acessível com respondente e quantidade de respostas. Ao selecionar uma pessoa, guarde seu ID em `sessionStorage` com a chave compatível `id_quem_responde` e ofereça uma ação clara para iniciar em `/run/circulo`. Não use o círculo 55 fixo que aparece em `run/js/escolher.js`: use o ID retornado pela API. Mostre estados de carregamento, lista vazia e erro de conexão; não avance para a rodada quando a seleção falhar.

## Prompt 3 — fluxo de participação e respostas

> Reconstrua `run/circulo.html` e a lógica relevante de `run/js/circulo_new.js` em `/run/circulo`, usando componentes React. Preserve o fluxo: solicitar PIN se não existir na sessão; consultar `GET /get_circles_of_user/{pin}`; permitir escolher e guardar o círculo; preparar a rodada via `GET /preparar_rodada/{circuloId}/{respondenteId}` (use `0` para sorteio quando não houver respondente selecionado); mostrar círculo, respondente e quantidade respondida; pedir confirmação do usuário antes de revelar a questão; permitir passar a vez/recarregar a rodada.
>
> Ao abrir uma questão, chame `GET /abrir_questao_circulo/{circuloId}/{respondenteId}` e renderize os três formatos já usados: `aberta` (textarea), `multiplaescolha` (alternativas embaralhadas e seleção única) e `completar` (um campo por lacuna marcada por `___`). Valide respostas obrigatórias, confirme o envio quando aplicável e envie `POST /responder_questao_circulo` com `idq`, `resposta`, `id_circulo` e `id_respondente`, mantendo o formato esperado pelo backend para cada tipo. Após sucesso, informe o respondente e volte ao início do fluxo para carregar a próxima rodada; em erro, mantenha os dados para nova tentativa e explique o problema.
>
> Preserve imagens internas em `data:image/...` e imagens externas servidas por `GET /imagem/{nome}`. Inspecione o conteúdo e os modelos em `run/backend.py` para confirmar campos e formatos; não assuma que as respostas dos três tipos são intercambiáveis. Não adicione autenticação ou fluxo de login que não exista no backend.

## Prompt 4 — painel de acompanhamento

> Reconstrua `run/admin/painel.html` e `run/admin/js/painel.js` como uma página administrativa em Next, sugerida em `/pages/painel-run`. Consulte o círculo ativo com `GET /circulo_ativo` e as contagens com `GET /retornar_contagem_respostas_geral/{circuloId}` no serviço de execução. Depois, carregue as questões puladas via `GET /retornar_contagem_questoes_puladas/{circuloId}` e associe os IDs às pessoas correspondentes.
>
> Mostre respondente, total respondido e questões puladas em tabela responsiva. Atualize os dados periodicamente, preservando a atualização de 30 segundos da página antiga, mas limpe o timer ao desmontar o componente. Remova a dependência de IDs fixos (o script antigo força círculo 55), mostre claramente o horário da última atualização e trate falhas de cada chamada sem apresentar dados incompletos como se fossem atuais.

## Prompt 5 — notas por círculo

> Reimplemente `run/admin/notas.html` e `run/admin/js/notas.js` em React/Next. Inicialize o campo de círculo com `GET /circulo_ativo` no serviço administrativo. Permita informar outro ID; antes de carregar notas, valide-o usando `GET /circulo/{circuloId}`. Apresente o nome/data do círculo e carregue a tabela com `GET /gerar_nota_alunos/{circuloId}`. Cada linha deve mostrar respondente e nota.
>
> Use a configuração do serviço administrativo e o formato real de resposta de `run/staff.py`. Ao trocar de círculo, limpe os dados anteriores enquanto carrega; sinalize ID inválido, lista sem resultados e falha de rede. Inspecione `manager/app/pages/respostas_aluno/page.tsx` para decidir se componentes existentes podem ser reutilizados sem misturar a visão de respostas individuais com o resumo de notas.

## Prompt 6 — correção de respostas

> Compare `run/admin/corrigir.html` e `run/admin/js/corrigir.js` com `manager/app/pages/corrigir/page.tsx` e `manager/app/components/Corrigir.tsx`. Complete a página administrativa existente, sem criar uma segunda tela de correção, para permitir informar/selecionar o círculo e carregar `GET /exibir_respostas/{circuloId}` no serviço administrativo.
>
> Agrupe as respostas por questão; mostre enunciado, gabarito e resposta enviada. Para múltipla escolha, identifique a alternativa escolhida e ofereça sugestão 1/0; para questão aberta/completar, use `pontuacao_sugerida` quando disponível. Permita editar a pontuação e salvá-la via `POST /pontuar_resposta` com `{ id, pontuacao }`; após sucesso, sinalize a resposta corrigida e evite envio duplicado. Preserve a ação “Gerar sugestões” via `GET /gerar_recomendacoes_respostas_sem_pontuacao`.
>
> Preserve suporte às imagens externas (`/imagem/{nome}`) e às imagens embutidas. Se houver ação para renderizar conteúdo HTML, não interprete HTML fornecido por respondentes como conteúdo confiável. Exiba carregamento, erro, validação de pontuação e confirmação visual do salvamento. Verifique no backend os nomes dos campos e o significado de respostas “sem pontuação”.

## Critérios de conclusão para a reconstrução

- Todas as páginas indicadas têm rota Next acessível e navegação coerente entre seleção, participação e administração.
- Os dois serviços usam configurações separadas e não há IDs de círculo hardcoded.
- PIN, círculo selecionado e respondente escolhido sobrevivem à navegação na sessão, sem acesso ao `sessionStorage` durante renderização no servidor.
- Os três tipos de questão continuam compatíveis com o backend existente.
- As telas têm estados de carregamento, erro e ausência de dados; ações de escrita dão retorno explícito.
- As telas administrativas já existentes em `manager/` foram reaproveitadas quando apropriado, sem regressões em seus fluxos atuais.
- Execute a validação disponível em `manager/` (build e/ou verificações direcionadas) e informe limitações do backend/CORS caso impeçam testes integrados.
