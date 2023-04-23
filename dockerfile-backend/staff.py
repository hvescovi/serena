from config import *
from modelo import *

from difflib import SequenceMatcher  # similaridade entre strings
# https://stackoverflow.com/questions/17388213/find-the-similarity-metric-between-two-strings


@app.route("/")
def inicio():
    return "Serena: servidor backend staff."


@app.route('/exibir_respostas/<id_circulo>')
def exibir_respostas_circulo(id_circulo):

    # selecionar id's das respostas que foram respondidas no círculo
    sql = "select r.id from resposta r, respostanocirculo rc where rc.resposta_id = r.id AND rc.circulo_id = "+id_circulo +" order by r.questao_id"
    # results = db.session.execute(sql)
    # ERRO inserido em nova versão de sqlalchemy
    results = db.session.execute(text(sql))
    print(sql)
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

@app.route('/gerar_nota_alunos')
def gerar_nota_alunos():
    
    '''
    notas = db.session.execute(text("""select SUM(r.pontuacao) * 10 / COUNT(r.pontuacao) AS nota, 
    rp.nome AS nome from resposta as r 
    inner join respondente as rp 
    on r.respondente_id = rp.id group by rp.id
    order by r.respondente_id;"""))
'''

    notas = db.session.execute(text("""
select round(SUM(r.pontuacao) * 10 / COUNT(r.pontuacao),2) AS nota, rp.nome AS nome, rc.circulo_id  
    from resposta as r 
    inner join respondente as rp 
    inner join respostanocirculo as rc
    on r.respondente_id = rp.id AND
    rc.resposta_id = r.id 
    group by rp.id, rc.circulo_id 
    order by rc.circulo_id desc, nome
"""))

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
  File "lib/sqlalchemy/cyextension/resultproxy.pyx", line 68, in sqlalchemy.cyextension.resultproxy.BaseRow.__getitem__
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

@app.route('/circle')
def circle():
    resp = []
    dados = Circulo.query.all()
    for q in dados:
        resp.append(q.json())
    
    retorno = {"result":"ok"}
    retorno.update({"details":resp})
    return jsonify(retorno)

app.run(port=4999) #, debug=True)

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