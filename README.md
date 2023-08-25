# Serena

> Ferramenta de geração automática de avaliações circulares.

Aqui estão informações básicas sobre o uso da ferramenta Serena.


### Cadastro de questões

Para cadastrar questões no Serena, é necessário seguir os passos abaixo:

1) criar questões em formato textual simples, em arquivo txt (sugestão)
2) fazer backup do banco de dados, que deve estar em pasta privada; usar data invertida para facilitar ordenação
3) rodar `staff.py` (backend do admin)
4) acessar a interface de cadastro de questões: `form_inserir_questao.html` (pode acessar sem servidor web, diretamente no arquivo)
5) incluir as questões

	a) preencher enunciado

	b) escolher o tipo de questão

	c) preencher em uma das duas caixas de texto, dependendo do tipo de questão

* se for resposta aberta ou de completar, informar a resposta
* O formulário vem preenchido com dados de exemplo.


### Víncular as questões a um círculo

1) criar o círculo que vai mostrar as questões
	
    a) acessar o banco de dados e criar o círculo na tabela circulo (tarefa ainda manual, infelizmente)
    
    b) definir o círculo como `ativo=1` (deixar os outros com `0`)
    
2) incluir as questões no círculo
	
    a) executar o servidor vue
    
    	i. entrar na pasta serena/vue/serena_manager
        ii. npm run dev
    	iii. acessar http://localhost:5173/
        
    b) o último círculo aparece marcado, mas é preciso marcar em outro círculo e clicar novamente no círculo ao qual se deseja trabalhar (TODO: melhorar isso!)
    
    c) pedir para listar todas as questões (radiobutton `List all questions`)
  
  	d) marcar o radiobutton `"Add question to the checked circle"`
  	
    e) marcar o radiobutton da questão que deseja incluir no círculo
  	
    f) clicar no botão `"Do it!"`
    	
        i. pode ir no banco de dados verificar se realmente incluiu o vínculo da questão na tabela `questaodocirculo`
        
  	g) voltar ao passo "e)" enquanto desejar incluir outras questões no círculo
 
### Testar o acesso às questões na visão de aluno:

1) rodar o `backend.py`
2) iniciar um servidor web na pasta de páginas `html`: `serena/dockerfile-frontend/root_html_files`
	
    a) pode-se usar o comando: `python3 -m http.server`
    
    b) o servidor vai rodar na porta `8000`
    
3) acessar a página pelo IP da máquina. Exemplo: `192.168.5.178:8000`
4) cada visualização de questão insere um registro na tabela `questao_exibida_no_circulo`
5) cada resposta insere um registro na tabela `resposta` e um registro na tabela `respostanocirculo`
6) as tabelas dos itens 4 e 5 devem ter os registros apagados depois que os testes forem feitos, referente às questões de teste; em geral, basta observar o `timestamp` e o `circulo_id` para saber quais foram os novos registros de teste

=> na prática, acaba sendo mais prático usar o `curl`:

```curl localhost:4999/questions_circle/129/14 -X POST```

### Alterar o número de questões

a) o número de questões que serão respondidas pelos alunos está no início do arquivo `backend.py`; deve-se alterar para o número de questões que vão ser respondidas. No futuro isso será agregado ao círculo (essa informação virá do círculo).

### Definir o círculo ativo

Acessar tabela `circulo` e observar a existência do campo `ativo`. Apenas um registro deve ter esse campo igual a `1`.

## Autores

### Equipe atual

- Hylson Vescovi Netto: [hylson.netto@ifc.edu.br](mailto:hylson.netto@ifc.edu.br)

### Contribuidores

- Ricardo de la Rocha Ladeira: [ricardo.ladeira@ifc.edu.br](mailto:ricardo.ladeira@ifc.edu.br)

---

## Como Contribuir

Sinta-se livre para relatar _bugs_, impressões ou sugerir mudanças, tanto por meio da criação de **issues** e **pull requests** quanto pelo contato direto com a [equipe atual](#Equipe-atual). Pedimos apenas que utilize uma linguagem clara, descrevendo o seu ambiente e o passo a passo para reproduzir o _bug_. Seja breve e objetivo, mostrando _prints_ se possível.

---
