# 07/11/2026

-------------------------------------------
Acrescentar indicativos de total de acertos
-------------------------------------------

I) preciso de uma rota no staff.py que a partir de um ID de questão que seja do tipo "multiplaescolha" (essa informação está no campo "type"):

a) conte quantas respostas existem para aquela questão

b) das respostas que existem, conte em quantas respostas foi atribuída a "pontuacao" igual a 1 (ou seja, quantas respostas foram certas)

II) na página que vincula questões a círculos (questions_circle_batch/page.jsx), acrescente ao lado de cada questão listada a informação sobre quantas respostas existem e quantas respostas corretas existem. Essa informação está na rota chamada estatisticas_respostas_multipla_escolha. Mostre também o percentual de acertos na questão.

III) preciso de uma rota no staff.py que, a partir de um ID de questão que seja dos tipos "aberta" ou "completar" (essa informação está no campo "type"):

a) conte quantas respostas existem para aquela questão

b) das respostas que existem, calcule a pontuação média das respostas; isso pode ser calculado com um SQL que agregue a média do campo "pontuacao"

IV) na página que vincula questões a círculos (questions_circle_batch/page.jsx), acrescente ao lado de cada questão listada a informação sobre quantas respostas existem e qual foi a pontuação média alcançada daquela questão, agora no caso das questões do tipo "completar" e "aberta". Essa informação está na rota chamada estatisticas_respostas_aberta_completar. 

-----------------
Duplicar questões
-----------------

Isso é importante pois, quando questões podem ser melhoradas, o ideal é duplicar a questão e modificar a nova questão duplicada. Assim, não comprometemos o histório de respostas, "contaminando" a questão modificada com resposta anteriores.

melhoria 07_11_2026_V
V) crie uma rota em staff.py que, dada uma questão X, será gerada uma nova questão Y no banco de dados, igual à questão X ("duplica" uma questão, criando uma nova igual). O objetivo dessa ação é que, em vez de modificar uma questão, seja feita uma "nova versão" da questão. Isso evita "contaminar" o histório de respostas, quando uma questão é "alterada". Em vez de alterar uma questão, vamos fazer uma cópia e modificar a nova, que ainda não possui histórico de respostas.

melhoria 07_11_2026_VI
VI) na página que associa questões a um círculo (questions_circle_batch/page.jsx), crie um botão ao lado de cada questão para acionar a rota que duplica questão (/question/<int:question_id>/duplicate, em staff.py). O botão deve confirmar se o usuário deseja mesmo duplicar a questão.

----------------------
Construção de questões
----------------------

VI) faça DUAS páginas para editar questões. 

* Nessas páginas deve ser mostrado o número de respostas que existem para a questão que vai ser editada.

* Coloque estas páginas em pastas (dentro de "pages"): /question_img_internal e /question_img_external, para imagens dentro do texto ou imagens fora do texto, respectivamente

* Cada página vai editar questões conforme o estilo que existe no banco de dados:

a) uma página vai editar questões que referenciam figuras FORA do enunciado da questão, ou fora das alternativas da questão; essas questões usam a referência do *nome de arquivo* na tag img; por exemplo: <img src=classes_pessoa_e_paciente_com_heranca.png>. Nome da pasta: question_img_external. Essa página pode usar componente textarea comum para editar conteúdos, mas deve ter uma área para visualizar o HTML renderizado (um "preview") e uma área para fazer upload de imagens, atribuindo um nome aleatório à imagem que for enviada ao diretório das imagens. Esse caminho está no backend, em uma variável caminho_imagens. Já existe uma rota no backend administrativo (staff.py) para fazer upload de imagens

b) uma página vai editar questões que referenciam figuras DENTRO do enunciado da questão, ou DENTRO das alternativas da questão; essas questões contém no enunciado ou nas alternativas um código da imagem, similar a este: <img src="data:image/png;base64,iVBORw0KGgoAAAAN...........TkSuQmCC">. Pasta desta página: question_img_internal. Essa página usa o componente 'primereact/editor' para editar conteúdos.

VII) adicione essas duas novas páginas (question_img_external e question_img_internal) no menu, que está dentro de componentes.

VIII) faça uma página para cadastrar questão, BEM SIMILAR à página newquestion/page.jsx, mas considerando questões que armazenam imagens de forma EXTERNA, por exemplo: <img src=classes_pessoa_e_paciente_com_heranca.png>. Deve ser um textarea simples, mostrando preview. Essa página, portanto, não deve usar componente 'primereact/editor'. Essa página pode estar na pasta newquestion_img_external.

IX) acrescente nessa página newquestion_img_external um mecanismo para permitir upload de imagens (existe uma rota no staff.py para upload). Faça também assim: para cada "enter" que houver no enunciado já será inserido um <br> no campo de preview.