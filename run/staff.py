from config import *
from modelo import *

from difflib import SequenceMatcher  # similaridade entre strings
# https://stackoverflow.com/questions/17388213/find-the-similarity-metric-between-two-strings


@app.route("/test")
def test():
    return "Serena: servidor backend staff."

@app.route('/')
def vue():
    return render_template("index.html")



@app.route('/exibir_respostas/<id_circulo>')
def exibir_respostas_circulo(id_circulo):

    # selecionar id's das respostas que foram respondidas no círculo
    sql = "select r.id from resposta r, respostanocirculo rc where rc.resposta_id = r.id AND rc.circulo_id = "+id_circulo +" order by r.questao_id"
    # results = db.session.execute(sql)
    # ERRO inserido em nova versão de sqlalchemy
    results = db.session.execute(text(sql))
    # print(sql)
    r1 = []
    for linha in results:
        r1.append(linha[0])        

    # obter as respostas completas
    lista = []
    #respostas = Resposta.query.filter(Resposta.id.in_(r1)).all()
    q = Resposta.query.filter(Resposta.id.in_(r1))
    # order por questão :-) dá-le marco véio # https://docs.sqlalchemy.org/en/14/orm/query.html#sqlalchemy.orm.Query.order_by
    q = q.order_by(Resposta.questao_id) 
    respostas = q.all()
    for r in respostas:
        lista.append(r.json())

    ret = jsonify({"message": "ok", "details": lista})

    ret.headers.add('Access-Control-Allow-Origin', '*')
    return ret




@app.route('/imagem/<nome>')
def imagem(nome):

    filename = caminho_imagens+nome
    return send_file(filename, mimetype='image/png')


@app.route('/lista_imagens')
def lista_imagens():
    try:
        if not os.path.exists(caminho_imagens):
            return jsonify({"message": "ok", "details": []})

        arquivos = [f for f in os.listdir(caminho_imagens) if os.path.isfile(os.path.join(caminho_imagens, f))]
        retorno = jsonify({"message": "ok", "details": arquivos})
    except Exception as e:
        retorno = jsonify({"message": "error", "details": str(e)})

    retorno.headers.add('Access-Control-Allow-Origin', '*')
    return retorno


@app.route('/upload_imagem', methods=['POST'])
def upload_imagem():
    response = jsonify({"message": "error", "details": "no file provided"})
    
    try:
        # verifica se o arquivo foi enviado
        if 'file' not in request.files:
            return jsonify({"message": "error", "details": "no file part"}), 400
        
        file = request.files['file']
        
        # verifica se o arquivo tem um nome
        if file.filename == '':
            return jsonify({"message": "error", "details": "no selected file"}), 400
        
        # validar extensão de arquivo (apenas imagens)
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
        if '.' not in file.filename or file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
            return jsonify({"message": "error", "details": "file type not allowed"}), 400
        
        # criar pasta se não existir
        #os.makedirs(caminho_imagens, exist_ok=True)
        
        # salvar arquivo
        filename = file.filename

        # ajustar o nome do arquivo para evitar conflitos (ex: adicionar timestamp)
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"{timestamp}_{filename}"

        # remover espacos do nome do arquivo
        filename = filename.replace(" ", "_")

        # remover caracteres invalidos ou estranhos do nome do arquivo
        filename = "".join(c for c in filename if c.isalnum() or c in ('_', '.', '-')).rstrip()
        
        filepath = os.path.join(caminho_imagens, filename)
        file.save(filepath)
        
        response = jsonify({
            "message": "ok", 
            "details": {
                "filename": filename,
                "url": f"/imagem/{filename}"
            }
        })
    
    except Exception as e:
        response = jsonify({"message": "error", "details": str(e)})
    
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response




@app.route('/pontuar_resposta', methods=['post'])
def pontuar_resposta():
    # prepara a resposta padrão otimista
    response = jsonify({"message": "ok", "details": "ok"})
    try:
        # pega os dados informados
        dados = request.get_json(force=True)

        id = dados['id']

        # obtem a resposta
        resposta = Resposta.query.get(id)

        # atualiza a pontuacao
        pts = dados['pontuacao']
        resposta.pontuacao = pts

        # atualiza a resposta.
        db.session.commit()

    except Exception as e:
        # resposta de erro
        response = jsonify({"message": "error", "details": str(e)})

    # informa que outras origens podem acessar os dados desde servidor/serviço
    response.headers.add('Access-Control-Allow-Origin', '*')
    # retorno!
    return response


@app.route('/gerar_recomendacoes_respostas_sem_pontuacao', methods=['get'])
def gerar_recomendacoes_respostas_sem_pontuacao():
    # prepara a resposta padrão otimista
    response = jsonify({"message": "ok", "details": "ok"})

    try:    
        respostas = Resposta.query.order_by(Resposta.questao_id).all()
        cont = 0;
        for r in respostas:
            if r.pontuacao_sugerida is None:  # resposta sem pontuação?
                if r.questao.type == "aberta":
                    resposta_aluno = r.resposta
                    gabarito = r.questao.resposta

                    # fornecer pontuação sugerida
                    nova = Resposta.query.get(r.id)
                    nova.pontuacao_sugerida = SequenceMatcher(None, resposta_aluno, gabarito).ratio()
                    db.session.commit()

                    cont+=1

                if r.questao.type == "completar":
                    resposta_aluno = r.resposta
                    lacunas = r.questao.lacunas

                    # fornecer pontuação sugerida
                    nova = Resposta.query.get(r.id)
                    nova.pontuacao_sugerida = SequenceMatcher(None, resposta_aluno, lacunas).ratio()
                    db.session.commit()

                    cont+=1

                if r.questao.type == "multiplaescolha":
                    pass # recomendação sendo feita pelo front-end

        response = jsonify({"message": "ok", "details": "ok:"+str(cont)+" pontuações sugeridas"})
        
    except Exception as e:
        response = jsonify({"message": "error", "details": str(e)})
    
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response



@app.route('/eliminar_respostas_duplicadas')
def eliminar_respostas_duplicadas():
    
    # obter IDs de questao e respondente, das respostas duplicadas
    ''' 
    select count(id) q, questao_id, respondente_id
    from resposta
    group by questao_id, respondente_id
    having q > 1
    order by q desc
    '''

    # https://stackoverflow.com/questions/17972020/how-to-execute-raw-sql-in-flask-sqlalchemy-app
    duplicados = db.session.execute(text('select count(id) q, questao_id, respondente_id'+\
    ' from resposta'+\
    ' group by questao_id, respondente_id'+\
    ' having q > 1'+\
    ' order by q desc'))

    # conta os elementos duplicados
    contagem_geral = 0

    sqls_exclusao = []

    # percorre os elementos que possuem duplicação
    for dados in duplicados:

        contagem_geral += 1

        # obtem os dados separadamente
        q = dados['q']
        qn = int(q) # versão numérica
        questao_id = dados['questao_id']
        respondente_id = dados['respondente_id']
    
        # prepara um SQL para essa resposta duplicada
        sql = 'select id from resposta where questao_id='+\
               str(questao_id)+' and respondente_id='+str(respondente_id)

        # obtém esses registros duplicados
        ids_respostas_duplicadas = db.session.execute(text(sql))

        # monta os SQLs de exclusão
        sql_excluir1 = "delete from resposta where "
        sql_excluir2 = "delete from respostanocirculo where "
        
        # percorre essa lista na quantidade de ids, menos 1
        
        conta = 0
        # percorre os ids
        for ids in ids_respostas_duplicadas:
            # adiciona o id para ser excluído
            sql_excluir1 += "id="+str(ids['id'])
            sql_excluir2 += "resposta_id="+str(ids['id'])

            # mais um id contabilizado            
            conta += 1
            # ainda tem mais?
            if conta < (qn):
                # é o último? O último não deve ser apagado
                if conta == (qn-1):
                    break
                else:
                    # insere o OR
                    sql_excluir1 += " OR "
                    sql_excluir2 += " OR "

        print(sql_excluir1)
        print(sql_excluir2)
        print("total: ", q, ", para apagar: ", conta)

        # adiciona o SQL na lista de execuções
        # melhor apagar primeiro o registro relacionado (N), depois o principal (1)
        sqls_exclusao.append(sql_excluir2)
        sqls_exclusao.append(sql_excluir1)
        

        # não é possível já excluir o registro, pois a tabela
        # está sendo percorrida!
        #db.session.execute(sql_excluir)
        #db.session.commit()
    
    # agora vamos apagar a galera
    for detona in sqls_exclusao:
        db.session.execute(detona)
        db.session.commit()
    

    print("foram resolvidas duplicações de ", contagem_geral, " respondentes")

    ret = jsonify({"message": "ok", "details": "registros duplicados apagados"})

    ret.headers.add('Access-Control-Allow-Origin', '*')
    return ret

@app.route('/gerar_nota_alunos/<int:c>')
def gerar_nota_alunos(c):
    
    '''
    notas = db.session.execute(text("""select SUM(r.pontuacao) * 10 / COUNT(r.pontuacao) AS nota, 
    rp.nome AS nome from resposta as r 
    inner join respondente as rp 
    on r.respondente_id = rp.id group by rp.id
    order by r.respondente_id;"""))
'''

    sql = f'''
    select round(SUM(r.pontuacao) * 10 / COUNT(r.pontuacao),2) AS nota, 
            rp.nome AS nome, rc.circulo_id  
    from resposta as r 
    inner join respondente as rp 
    inner join respostanocirculo as rc
    on r.respondente_id = rp.id AND
    rc.resposta_id = r.id 
    and rc.circulo_id={c}
    group by rp.id, rc.circulo_id 
    order by rc.circulo_id desc, nome
    '''
    notas = db.session.execute(text(sql))

    '''
select SUM(r.pontuacao) * 10 / COUNT(r.pontuacao) AS nota, rp.nome AS nome 
    from resposta as r 
    inner join respondente as rp 
    inner join respostanocirculo as rc
    on r.respondente_id = rp.id AND
    rc.resposta_id = r.id AND
	rc.circulo_id = 4   
    group by rp.id

    ''' 

    lista = []
    for nota in notas:
        lista.append({
            "nota": nota[0], # nota["nota"],
            "respondente": nota[1], # nota["nome"],
            "circulo":nota[2] #nota['circulo_id']
        })

    '''
    erro novo
    "nota": nota["nota"],
  File "lib/sqlalchemy/cyextension/resultproxy.pyx", line 68, 
  in sqlalchemy.cyextension.resultproxy.BaseRow.__getitem__
TypeError: tuple indices must be integers or slices, not str
    '''
    
    ret = jsonify({"message": "ok", "details": lista})

    ret.headers.add('Access-Control-Allow-Origin', '*')
    return ret

@app.route('/circulo_ativo')
def circulo_ativo():
    
    # busca o primeiro circulo ativo
    circulo = db.session.query(Circulo).filter(Circulo.ativo == "1").first()

    if circulo == None:
        resp = {"message": "erro", "details": "não há círculo ativo!"}
    else:
        resp = {"message": "ok"}
        resp.update({"details": circulo.json()})

    ret = jsonify(resp)
    ret.headers.add('Access-Control-Allow-Origin', '*')
    return ret



'''

CRUD routes for Questao

'''



# curl -d '{ "idq": 1, "enunciado":"ok mudou", "autor": "eu", "data_cadastro":"1/1/2020", "resposta":"ok valeu" }' -X POST http://localhost:5000/alterar_questao

@app.route('/alterar_questao', methods=['post'])
def alterar_questao():
    
    # prepara a resposta padrão otimista
    response = jsonify({"message": "ok", "details": "ok"})
    try:
        # pega os dados informados
        dados = request.get_json(force=True)

        # verifica o tipo de questão
        if dados['type'] == "aberta":
            stmt = db.session.update(Questao).where(Questao.id == 5).\
                values(enunciado=dados['enunciado'],
                       autor=dados['autor'],
                       data_cadastro=dados['data_cadastro'],
                       resposta=dados['resposta'])
            db.session.commit()

    except Exception as e:
        # resposta de erro
        response = jsonify({"message": "error", "details": str(e)})

    # informa que outras origens podem acessar os dados desde servidor/serviço
    response.headers.add('Access-Control-Allow-Origin', '*')
    # retorno!
    return response


@app.route('/incluir_questao', methods=['POST'])
def incluir_questao():
    
    # prepara a resposta padrão otimista
    response = jsonify({"message": "ok", "details": "ok"})
    try:
        # pega os dados informados
        dados = request.get_json()

        nova = None

        # verifica o tipo de questão
        if dados['type'] == "aberta":
            nova = Aberta()
            nova.resposta = dados['resposta']
        elif dados['type'] == "completar":
            nova = Completar()
            nova.lacunas = dados['lacunas']
        elif dados['type'] == "multiplaescolha":
            nova = MultiplaEscolha()
            for i in range(1, 10):
                desc = 'a'+str(i)+'_descricao'
                try:  # sera que tem essa alternativa?
                    a = Alternativa()
                    # aqui dá erro se não houve a altenativa
                    a.descricao = dados[desc]
                    tmp = dados['a'+str(i)+'_certa']
                    if tmp.upper() == "TRUE":
                        a.certa = True
                    else:
                        a.certa = False
                    db.session.add(a)
                    db.session.commit()
                    nova.alternativas.append(a)
                except:
                    pass  # acabaram as alternativas
        elif dados['type'] == "multiplaescolha_remodelada":
            nova = MultiplaEscolha()
            # percorre as alternativas certas
            for alt in dados['corrects']:
                a = Alternativa()
                a.descricao = alt["op"]
                a.certa = True # é certa :-)
                db.session.add(a)
                db.session.commit()
                nova.alternativas.append(a)
            # percorre as alternativas erradas
            for alt in dados['wrongs']:
                a = Alternativa()
                a.descricao = alt["op"]
                a.certa = False # é errada >-(
                db.session.add(a)
                db.session.commit()
                nova.alternativas.append(a)            
             
        # comum para todas as questões
        nova.enunciado = dados['enunciado']
        nova.observacao = dados['observacao']

        # TODO pode ser algo relativo ao tipo, string ou int, está dando erro se pegar do front
        nova.ativa = 1 # dados['ativa'] 

        now = datetime.now()
        nova.data_cadastro = now.strftime("%d/%m/%Y, %H:%M:%S")
        nova.autor = "Hylson"

        db.session.add(nova)
        db.session.commit()

    except Exception as e:
        # resposta de erro
        response = jsonify({"message": "error", "details": str(e)})

    # informa que outras origens podem acessar os dados desde servidor/serviço
    response.headers.add('Access-Control-Allow-Origin', '*')
    # retorno!
    return response

@app.route('/question')
def retornar_questoes():
    resp = []
    questoes = Questao.query.all()
    for q in questoes:
        resp.append(q.json())
    
    retorno = {"result":"ok"}
    retorno.update({"details":resp})
    return jsonify(retorno)



# update question by ID
@app.route('/question/<int:question_id>', methods=['PUT'])
def update_question(question_id):
    try:
        dados = request.get_json()
        # find the question
        question = db.session.get(Questao, question_id)
        if question is None:
            return jsonify({"result": "error", "details": "Question not found"}), 404

        # Update allowed fields
        for key, value in dados.items():
            # Only update attributes that exist and are not relationships
            if key.startswith('_') or key in ['alternativas', 'questao_id']:
                continue
            if hasattr(question, key):
                setattr(question, key, value)

        db.session.commit()
        return jsonify({"result": "ok", "details": "Question updated successfully"})
    except Exception as e:
        print("Erro ao atualizar questão:", e)
        return jsonify({"result": "error", "details": str(e)}), 500# CRUD routes for Respondente


# assuntos da questão, via relacionamento
@app.route("/questao/<int:questao_id>/assuntos", methods=["GET"])
def get_assuntos_por_questao(questao_id):
    questao = db.session.get(Questao, questao_id)
    if not questao:
        return jsonify({"result": "error", "details": "Questao nao encontrada"}), 404

    # se relaciona via subject list
    assuntos = [a.json() for a in questao.assuntos]
    return jsonify({"result": "ok", "details": assuntos})



'''



'''



@app.route('/circle')
def circle():
    resp = []
    dados = Circulo.query.all()
    for q in dados:
        resp.append(q.json())
    
    retorno = {"result":"ok"}
    retorno.update({"details":resp})
    return jsonify(retorno)

@app.route('/respondente')
def respondente():
    resp = []
    dados = Respondente.query.all()
    for q in dados:
        resp.append(q.json())
    
    retorno = {"result":"ok"}
    retorno.update({"details":resp})
    ret = jsonify(retorno)
    ret.headers.add('Access-Control-Allow-Origin', '*')
    return ret

# curl localhost:4999/questions_circle/91/10 -X POST
# add question to the circle!
@app.route("/questions_circle/<int:q>/<int:c>", methods=['post'])
def questions_circle_add(q, c):
    try:
        circulo = db.session.get(Circulo, c) # load the circle
        question = db.session.get(Questao, q) # load the question
        circulo.questoes.append(question)
        db.session.commit() # update the list of questions in the circle
        return jsonify({"result":"ok", "details":"ok"})
    except Exception as e:
        return jsonify({"result": "error", "details": str(e)})


# retornar informações sobre um círculo
@app.route('/circulo/<int:c>')
def circulo_info(c):
    
    # busca o primeiro circulo ativo
    circulo = db.session.query(Circulo).filter(Circulo.id == c).first()

    if circulo == None:
        resp = {"message": "erro", "details": "o círculo especificado não existe!"}
    else:
        resp = {"message": "ok"}
        resp.update({"details": circulo.json()})

    ret = jsonify(resp)
    ret.headers.add('Access-Control-Allow-Origin', '*')
    return ret

# curl -d '[{"nome":"AMANDA PAZIANOTI HORST", "email":"amanda.horst07@gmail.com", "observacao":"|g:optweb-301-2025|"},{"nome":"ANTONIO HENRIQUE ROHLING FROEHNER","email":"rf.antonio2007@gmail.com", "observacao":"|g:optweb-301-2025|"}]' -H 'Content-Type:application/json' localhost:4999/incluir_respondentes

@app.route('/incluir_respondentes', methods=['POST'])
def incluir_respondentes():
        
    retorno = ""
    
    # prepara a resposta padrão otimista
    response = jsonify({"message": "ok", "details": "ok"})
    try:
        print("incluir_respondentes: obtendo dados...")
        # pega os dados informados
        dados = request.get_json()      
        print("incluir_respondentes: dados OK!")
       # print(dados)

        # percorre os novos respondentes
        for q in dados:
            # procura o estudante (e se ele existir?)
            estudante = db.session.query(Respondente).filter(Respondente.nome == q["nome"]).first()
            print("estudante: ", estudante)
            # ele não existe mesmo?
            if estudante == None:
                # adiciona!
                joao = Respondente(nome = q['nome'], email=q['email'], observacao = q['observacao'])
                db.session.add(joao)
                db.session.commit()
                retorno += ";Respondente carregado: "+str(joao)
                print("adicionado: ", joao)
            else:
                # já possui a observação?
                if q['observacao'] in estudante.observacao:
                    retorno += ";Respondente já estava cadastrado e já continha a observação: "+str(estudante)
                    print("já tinha a observação: ", estudante)
                else:
                    # remove eventuais espaços do começo e fim
                    estudante.observacao = estudante.observacao.strip()
                    # se tem observação
                    if len(estudante.observacao)>0:
                        # se a observacao termina com "|"
                        if estudante.observacao[-1] == "|":
                            # remove o último caracter, pois vai adicionar mais
                            estudante.observacao = estudante.observacao[:-1]                    
                    # acrescentra a tag/observação :-)
                    estudante.observacao += q['observacao']
                    db.session.commit()
                    retorno += ";Respondente já estava cadastrado e foi atualizado com a nova observação: "+str(estudante)
                    print("atualizado: ", estudante)
                    
        return jsonify({"result":"ok", "details":retorno})
    except Exception as e:
        retorno += str(e)
        return jsonify({"result": "error", "details":retorno})
 

# curl -d '{"nome":"AV1 optweb EMI maio 2025","data":"05/05/2025","filtro_respondente":"|g:optweb-301-2025|","ativo":"0","maximo_questoes":10,"autor":"hvescovi","senha":""}' -X POST -H 'Content-Type:application/json' localhost:4999/add/Circulo

@app.route("/add/<string:classe>", methods=['post'])
def add(classe):
    # receber as informações do novo objeto
    dados = request.get_json()  
    try:  
        nova = None
        if classe == "Circulo":
            c = db.session.query(Circulo).filter(Circulo.nome == dados["nome"]).first()
            # ele não existe mesmo?
            if c == None:          
                nova = Circulo(**dados)
        
        db.session.add(nova)  # adicionar no BD
        db.session.commit()  # efetivar a operação de gravação
        # retorno de sucesso :-)
        return jsonify({"result": "ok", "details": "ok"})
    except Exception as e:  # em caso de erro...
        # informar mensagem de erro :-(
        return jsonify({"result": "error", "details": str(e)})

@app.route("/list/<string:classe>", methods=['GET'])
def generic_list(classe):
    resp = []
    if classe == "Circulo":
        dados = Circulo.query.all()
    for q in dados:
        resp.append(q.json())
    
    retorno = {"result":"ok"}
    retorno.update({"details":resp})
    return jsonify(retorno)


@app.route("/delete/Circulo/<string:nome>", methods=['DELETE'])
def delete_circulo(nome):
    # Delete by nome
    ...

@app.route("/circle/<int:circle_id>", methods=['PUT'])
def update_circulo(circle_id):
    # Update circle by ID
    dados = request.get_json()
    try:
        circulo = db.session.get(Circulo, circle_id)
        if circulo is None:
            return jsonify({"result": "error", "details": "Circle not found"}), 404
        
        # Only update simple columns, skip relationships and internal attributes
        for key, value in dados.items():
            # skip SQLAlchemy internal attributes and relationships
            if key.startswith('_') or key in ['questoes', 'respostasNoCirculo']:
                continue
            if hasattr(Circulo, key):
                setattr(circulo, key, value)

        db.session.commit()
        return jsonify({"result": "ok", "details": "Circle updated successfully"})
    except Exception as e:
        print("Erro ao atualizar círculo:", e)
        return jsonify({"result": "error", "details": str(e)}), 500
    

'''

CRUD routes for link Circle and Question

'''

@app.route("/questions_circle/<int:q>/<int:c>", methods=['DELETE'])
def questions_circle_remove(q, c):
    try:
        circulo = db.session.get(Circulo, c)
        question = db.session.get(Questao, q)
        if question in circulo.questoes:
            circulo.questoes.remove(question)
            db.session.commit()
            return jsonify({"result":"ok", "details":"Question removed from circle"})
        else:
            return jsonify({"result":"error", "details":"Question not in circle"})
    except Exception as e:
        return jsonify({"result": "error", "details": str(e)})

# get questions from a circle
@app.route('/questions_circle/<int:circle_id>', methods=['GET'])
def questions_in_circle(circle_id):
    circulo = db.session.get(Circulo, circle_id)
    if not circulo:
        return jsonify({"result": "error", "details": "Circle not found"}), 404
    questions = [q.json() for q in circulo.questoes]
    return jsonify({"result": "ok", "details": questions})






'''

CRUD routes for Respondente

'''




@app.route('/respondentes', methods=['GET'])
def list_respondentes():
    resp = []
    respondentes = Respondente.query.all()
    for r in respondentes:
        resp.append(r.json())
    
    retorno = {"result":"ok"}
    retorno.update({"details":resp})
    ret = jsonify(retorno)
    ret.headers.add('Access-Control-Allow-Origin', '*')
    return ret

@app.route('/respondente/<int:id>', methods=['GET'])
def get_respondente(id):
    respondente = db.session.get(Respondente, id)
    if respondente is None:
        resp = jsonify({"result": "error", "details": "Respondente not found"})
        resp.headers.add('Access-Control-Allow-Origin', '*')
        return resp, 404
    resp = jsonify({"result": "ok", "details": respondente.json()})
    resp.headers.add('Access-Control-Allow-Origin', '*')
    return resp

@app.route('/respondente', methods=['POST'])
def create_respondente():
    dados = request.get_json()
    try:
        # Check if already exists by nome
        existente = db.session.query(Respondente).filter(Respondente.nome == dados["nome"]).first()
        if existente:
            resp = jsonify({"result": "error", "details": "Respondente already exists"})
            resp.headers.add('Access-Control-Allow-Origin', '*')
            return resp
        nova = Respondente(**dados)
        db.session.add(nova)
        db.session.commit()
        resp = jsonify({"result": "ok", "details": "Respondente created"})
        resp.headers.add('Access-Control-Allow-Origin', '*')
        return resp
    except Exception as e:
        resp = jsonify({"result": "error", "details": str(e)})
        resp.headers.add('Access-Control-Allow-Origin', '*')
        return resp

@app.route('/respondente/<int:id>', methods=['PUT'])
def update_respondente(id):
    dados = request.get_json()
    try:
        respondente = db.session.get(Respondente, id)
        if respondente is None:
            resp = jsonify({"result": "error", "details": "Respondente not found"})
            resp.headers.add('Access-Control-Allow-Origin', '*')
            return resp, 404
        
        # Only update simple columns
        for key, value in dados.items():
            if key.startswith('_'):
                continue
            if hasattr(Respondente, key):
                setattr(respondente, key, value)
        db.session.commit()
        resp = jsonify({"result": "ok", "details": "Respondente updated successfully"})
        resp.headers.add('Access-Control-Allow-Origin', '*')
        return resp
    except Exception as e:
        resp = jsonify({"result": "error", "details": str(e)})
        resp.headers.add('Access-Control-Allow-Origin', '*')
        return resp

@app.route('/respondente/<int:id>', methods=['DELETE'])
def delete_respondente(id):
    try:
        respondente = db.session.get(Respondente, id)
        if respondente is None:
            resp = jsonify({"result": "error", "details": "Respondente not found"})
            resp.headers.add('Access-Control-Allow-Origin', '*')
            return resp, 404
        db.session.delete(respondente)
        db.session.commit()
        resp = jsonify({"result": "ok", "details": "Respondente deleted"})
        resp.headers.add('Access-Control-Allow-Origin', '*')
        return resp
    except Exception as e:
        resp = jsonify({"result": "error", "details": str(e)})
        resp.headers.add('Access-Control-Allow-Origin', '*')
        return resp



'''

CRUD routes for Assunto

'''


@app.route("/assuntos", methods=["GET"])
def list_assuntos():
    try:
        assuntos = Assunto.query.all()
        return jsonify({"result": "ok", "details": [a.json() for a in assuntos]})
    except Exception as e:
        return jsonify({"result": "error", "details": str(e)}), 500
    

@app.route("/assunto/<int:assunto_id>", methods=["GET"])
def get_assunto(assunto_id):
    assunto = db.session.get(Assunto, assunto_id)
    if assunto is None:
        return jsonify({"result": "error", "details": "Assunto não encontrado"}), 404
    return jsonify({"result": "ok", "details": assunto.json()})


@app.route("/assunto", methods=["POST"])
def create_assunto():
    dados = request.get_json()
    try:
        novo = Assunto(**dados)
        db.session.add(novo)
        db.session.commit()
        return jsonify({"result": "ok", "details": novo.json()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"result": "error", "details": str(e)}), 400
    

@app.route("/assunto/<int:assunto_id>", methods=["PUT"])
def update_assunto(assunto_id):
    dados = request.get_json()
    assunto = db.session.get(Assunto, assunto_id)
    if assunto is None:
        return jsonify({"result": "error", "details": "Assunto não encontrado"}), 404
    try:
        for k, v in dados.items():
            if hasattr(Assunto, k):
                setattr(assunto, k, v)
        db.session.commit()
        return jsonify({"result": "ok", "details": assunto.json()})
    except Exception as e:
        db.session.rollback()
        return jsonify({"result": "error", "details": str(e)}), 400
    
@app.route("/assunto/<int:assunto_id>", methods=["DELETE"])
def delete_assunto(assunto_id):
    assunto = db.session.get(Assunto, assunto_id)
    if assunto is None:
        return jsonify({"result": "error", "details": "Assunto não encontrado"}), 404
    try:
        db.session.delete(assunto)
        db.session.commit()
        return jsonify({"result": "ok", "details": f"Assunto {assunto_id} removido"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"result": "error", "details": str(e)}), 500




'''

CRUD routes for link Assunto and Questao

'''

@app.route("/assunto/<int:assunto_id>/questoes", methods=["GET"])
def get_questoes_por_assunto(assunto_id):
    assunto = db.session.get(Assunto, assunto_id)
    if not assunto:
        return jsonify({"result": "error", "details": "Assunto não encontrado"}), 404

    # se `questoes` for relationship
    questoes = [q.json() for q in assunto.questoes]
    return jsonify({"result": "ok", "details": questoes})





# se existir association table:
# assunto.questoes = relationship("Questao", secondary=assunto_questao, back_populates="assuntos")

@app.route("/assunto/<int:assunto_id>/questao/<int:questao_id>", methods=["POST"])
def add_m2m_assunto_questao(assunto_id, questao_id):
    assunto = db.session.get(Assunto, assunto_id)
    questao = db.session.get(Questao, questao_id)
    if not assunto or not questao:
        return jsonify({"result": "error", "details": "Não encontrado"}), 404

    if questao not in assunto.questoes:
        assunto.questoes.append(questao)
        db.session.commit()
    return jsonify({"result":"ok","details":"Vinculado já ou feito"})


@app.route("/assunto/<int:assunto_id>/questao/<int:questao_id>", methods=["DELETE"])
def del_m2m_assunto_questao(assunto_id, questao_id):
    assunto = db.session.get(Assunto, assunto_id)
    questao = db.session.get(Questao, questao_id)
    if not assunto or not questao:
        return jsonify({"result": "error", "details": "Não encontrado"}), 404

    if questao in assunto.questoes:
        assunto.questoes.remove(questao)
        db.session.commit()
    return jsonify({"result":"ok","details":"Desvinculado ou já estava assim"})



app.run(port=4999, debug=True)

'''
contagem de respostas por respondente:

select count(resposta) AS q, rp.nome AS nome 
    from resposta as r 
    inner join respondente as rp 
    inner join respostanocirculo as rc
    on r.respondente_id = rp.id AND
    rc.resposta_id = r.id AND
	rc.circulo_id = 9   
    group by rp.id
    
    '''

