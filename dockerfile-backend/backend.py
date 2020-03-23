from config import *
from modelo import *

@app.route("/")
def inicio():
    return "Serena: servidor backend."

@app.route('/retornar_questoes')
def retornar_questoes():
    resp = []
    questoes = Questao.query.all()
    for q in questoes:
        resp.append(q.json())    
    ret = jsonify(resp)
    
    # jsonify é para retornar algo do tipo Response,
    # informação na qual se pode adicionar headers
    ret.headers.add('Access-Control-Allow-Origin', '*')        
    return ret

# retornar questões com filtro
@app.route('/retornar_questoes/<filtro>/<parametro>')
def retornar_questoes_com_filtro(filtro, parametro):
    resp = []

    # resposta padrao
    questoes = Questao.query.all()

    if filtro == "naofeitas":
        # obtém o respondente atual
        r = db.session.query(Respondente).filter(Respondente.email == parametro).all()

        # encontrou?
        if len(r) > 0:
            alguem = r[0]

            # obtém as respostas daquele respondente
            res = db.session.query(Resposta.questao_id).filter(Resposta.respondente_id == alguem.id)
            
            # obtém questões que ainda não respondi
            # PORQUE NAO É notin??
            questoes = Questao.query.filter(Questao.id.notin_(res)).all()
    
    for q in questoes:
        resp.append(q.json())    
    ret = jsonify(resp)
    
    # jsonify é para retornar algo do tipo Response,
    # informação na qual se pode adicionar headers
    ret.headers.add('Access-Control-Allow-Origin', '*')        
    return ret    

# curl -d '{ "idq": 2, "resposta": "123", "user_name":"Hylson Netto", "user_email":"hvescovi@gmail.com" }' -X POST http://localhost:5000/verificar_resposta_aberta
@app.route('/verificar_resposta_aberta', methods=['post'])
def verificar_resposta():
    # prepara a resposta padrão otimista
    response = jsonify({"message": "ok", "details": "ok"})
    try:
        # pega os dados informados
        dados = request.get_json(force=True)
        idq = dados['idq'] # id da questão
        resposta = dados['resposta']

        # obtém usuario
        user_name = dados['user_name']
        user_email = dados['user_email']

        # obtém questão 
        q = db.session.query(Aberta).filter(Aberta.id == idq).all()

        # verifica se existe o respondente
        r = db.session.query(Respondente).filter(Respondente.email == user_email).all()
        # respondente não existe?
        alguem = None
        if len(r) == 0:
            # adiciona novo respondente
            alguem = Respondente(nome = user_name, email=user_email, observacao = "")
            db.session.add(alguem)
            db.session.commit()
        else:
            alguem = r[0]
          
        # cria a resposta
        nova_resposta = Resposta(questao=q[0], respondente=alguem, resposta=resposta)         
        db.session.add(nova_resposta)
        db.session.commit()
                
        #q[0].resposta

        # a resposta será a resposta da questão aberta, para conferência
        response = jsonify({"message": "ok", "details": q[0].resposta})

    except Exception as e:
        # resposta de erro
        response = jsonify({"message": "error", "details": str(e)})

    # informa que outras origens podem acessar os dados desde servidor/serviço
    response.headers.add('Access-Control-Allow-Origin', '*')
    # retorno!
    return response

# curl -d '{ "idq": 10, "alternativa": 7 }' -X POST http://localhost:5000/verificar_resposta_multipla_escolha
@app.route('/verificar_resposta_multipla_escolha', methods=['post'])
def verificar_resposta_multipla_escolha():
    # prepara a resposta padrão otimista
    response = jsonify({"message": "ok", "details": "ok"})
    try:
        # pega os dados informados
        dados = request.get_json(force=True)
        idq = dados['idq'] # id da questão
        alternativa = dados['alternativa']

        # obtém usuario
        user_name = dados['user_name']
        user_email = dados['user_email']

        # obtém a resposta da questão
        q = db.session.query(MultiplaEscolha).filter(MultiplaEscolha.id == idq).all()

        # verifica se existe o respondente
        r = db.session.query(Respondente).filter(Respondente.email == user_email).all()
        # respondente não existe?
        alguem = None
        if len(r) == 0:
            # adiciona novo respondente
            alguem = Respondente(nome = user_name, email=user_email, observacao = "")
            db.session.add(alguem)
            db.session.commit()
        else:
            alguem = r[0]
          
        # cria a resposta
        nova_resposta = Resposta(questao=q[0], respondente=alguem, resposta=alternativa)         
        db.session.add(nova_resposta)
        db.session.commit()

        
        # percorrer as alternativas
        descricao_certa = "não encontrada"
        for alt in q[0].alternativas:
            if alt.certa:
                descricao_certa = alt.descricao;

        # a resposta será a resposta da questão aberta, para conferência
        response = jsonify({"message": "ok", "details": descricao_certa})

    except Exception as e:
        # resposta de erro
        response = jsonify({"message": "error", "details": str(e)})

    # informa que outras origens podem acessar os dados desde servidor/serviço
    response.headers.add('Access-Control-Allow-Origin', '*')
    # retorno!
    return response

# curl -d '{ "idq": 10, "lacunas": "python | linux" }' -X POST http://localhost:5000/verificar_resposta_lacunas
@app.route('/verificar_resposta_completar', methods=['post'])
def verificar_resposta_lacunas():
    # prepara a resposta padrão otimista
    response = jsonify({"message": "ok", "details": "ok"})
    try:
        # pega os dados informados
        dados = request.get_json(force=True)
        idq = dados['idq'] # id da questão
        lacunas = dados['lacunas']

        # obtém usuario
        user_name = dados['user_name']
        user_email = dados['user_email']

        # obtém a resposta da questão
        q = db.session.query(Completar).filter(Completar.id == idq).all()

        # verifica se existe o respondente
        r = db.session.query(Respondente).filter(Respondente.email == user_email).all()
        # respondente não existe?
        alguem = None
        if len(r) == 0:
            # adiciona novo respondente
            alguem = Respondente(nome = user_name, email=user_email, observacao = "")
            db.session.add(alguem)
            db.session.commit()
        else:
            alguem = r[0]
          
        # cria a resposta
        nova_resposta = Resposta(questao=q[0], respondente=alguem, resposta=lacunas)         
        db.session.add(nova_resposta)
        db.session.commit()        
        
        # obtém as lacunas
        partes = q[0].lacunas

        # a resposta será a resposta da questão aberta, para conferência
        response = jsonify({"message": "ok", "details": partes})

    except Exception as e:
        # resposta de erro
        response = jsonify({"message": "error", "details": str(e)})

    # informa que outras origens podem acessar os dados desde servidor/serviço
    response.headers.add('Access-Control-Allow-Origin', '*')
    # retorno!
    return response    

@app.route('/retornar_respostas')
def retornar_respostas():
    resp = []
    respostas = Resposta.query.all()
    for q in respostas:
        resp.append(q.json())    
    ret = jsonify(resp)
    
    # jsonify é para retornar algo do tipo Response,
    # informação na qual se pode adicionar headers
    ret.headers.add('Access-Control-Allow-Origin', '*')        
    return ret

@app.route('/retornar_respondentes')
def retornar_respondentes():
    resp = []
    respondentes = Respondente.query.all()
    for q in respondentes:
        resp.append(q.json())    
    ret = jsonify(resp)
    
    # jsonify é para retornar algo do tipo Response,
    # informação na qual se pode adicionar headers
    ret.headers.add('Access-Control-Allow-Origin', '*')        
    return ret

@app.route('/retornar_contagem_respostas/<filtro>/<parametro>')
# filtro1: email, parametro=email (só esse implementado)
# filtro2: assunto, parametro=assunto
# filtro3: data, parametro=data

#INTERROMPIDO
def retornar_contagem_respostas(filtro, parametro):
    resp = []

    # resposta padrao
    # sql correto: retorna quantidade de respostas por respondente por questão
    contagem = Resposta.query.with_entities(Resposta.respondente_id, Resposta.questao_id, func.count(Resposta.timestamp)).group_by(Resposta.questao_id).all()

    if filtro == "email":
        # obtém o respondente atual
        r = db.session.query(Respondente).filter(Respondente.email == parametro).all()

        # encontrou?
        if len(r) > 0:
            alguem = r[0]

            # obtém as respostas daquele respondente
            res = db.session.query(Resposta.questao_id).filter(Resposta.respondente_id == alguem.id)
            contagem = Resposta.query.with_entities(Resposta.respondente_id == alguem.id, Resposta.questao_id, func.count(Resposta.timestamp)).group_by(Resposta.questao_id).all()
            
            # obtém questões que ainda não respondi
            # PORQUE NAO É notin??
            questoes = Questao.query.filter(Questao.id.notin_(res)).all()
    
    for q in contagem:
        resp.append(q)    
    ret = jsonify(resp)
    
    # jsonify é para retornar algo do tipo Response,
    # informação na qual se pode adicionar headers
    ret.headers.add('Access-Control-Allow-Origin', '*')        
    return ret    

@app.route('/retornar_contagem_respostas_questao/<email>/<questao>')
def retornar_contagem_respostas_questao(email, questao):
    resp = []

    # obtém o respondente
    r = db.session.query(Respondente).filter(Respondente.email == email).all()

    # encontrou?
    if len(r) > 0:
        alguem = r[0]

        # quantidade de respostas da questão
        r = db.session.query(Resposta).filter(Resposta.respondente_id == alguem.id, Resposta.questao_id == questao).all()
        
        resp = len(r)
        #contagem = Resposta.query.with_entities(Resposta.respondente_id == alguem.id, Resposta.questao_id == questao, func.count(Resposta.timestamp)).all()
    
        #for q in contagem:
        #    resp.append(q)    

    ret = jsonify(resp)
    
    # jsonify é para retornar algo do tipo Response,
    # informação na qual se pode adicionar headers
    ret.headers.add('Access-Control-Allow-Origin', '*')        
    return ret    

@app.route('/preparar_rodada/<id_circulo>')
def preparar_rodada(id_circulo):
    # geral: escolhe um respondente que esteja participando do circulo
    
    # pega os respondentes do circulo (por enquanto pega todos)
    todos = db.session.query(Respondente).all()

    # escolhe um respondente
    nquem = random.randint(1,len(todos))

    q = db.session.query(Respondente).filter(Respondente.id == todos[nquem-1].id).all()
    resp = q[0].json()

    # retornos
    ret = jsonify(resp)
    ret.headers.add('Access-Control-Allow-Origin', '*')        
    return ret    

@app.route('/abrir_questao_circulo/<id_circulo>/<id_respondente>')
def abrir_questao_circulo(id_circulo, id_respondente):
    # geral: escolhe uma questao de assunto do circulo
    resp = []
    try:
        # temp: retorna uma questao aberta
        # ampliações:
        # - outros tipos de questão
        # - buscar apenas questão ainda não respondida
        # - buscar apenas questões do círculo
        q = db.session.query(Aberta).all()
        nq = random.randint(1,len(q))
        resp = q[nq-1].json()

        # obter assuntos do círculo
        circs = Circulo.query.filter(Circulo.id == id_circulo).all()
        assuntos = circs[0].assunto
        partes = assuntos.split("|")

        # questões que eu respondi
        res = db.session.query(Resposta.questao_id).filter(Resposta.respondente_id == id_respondente)
            
        # obtém questões que ainda não respondi
        questoes1 = Questao.query.filter(Questao.id.notin_(res)).all()

        # questoes do circulo: aquelas que incluem assuntos do circulo
        circ = Questao.query.filter(Questao.assunto == "assunto1").all()

        # questões que estiverem no círculo
        questoes2 = Questao.query.filter(Questao.id.in_(circ)).all()
        
        

    except Exception as e:
        # resposta de erro
        resp = jsonify({"message": "error", "details": str(e)})

    # retornos
    ret = jsonify(resp)
    ret.headers.add('Access-Control-Allow-Origin', '*')        
    return ret    

# curl -d '{ "idq": 2, "resposta": "git é legal", "id_respondente":1, "id_circulo":1 }' -X POST http://localhost:5000/responder_questao_circulo
@app.route('/responder_questao_circulo', methods=['post'])
def responder_questao_circulo():
    # prepara a resposta padrão otimista
    response = jsonify({"message": "ok", "details": "ok"})
    try:
        # pega os dados informados
        dados = request.get_json(force=True)
        
        idq = dados['idq'] # id da questão
        id_respondente = dados['id_respondente']
        resposta = dados['resposta']
        id_circulo = dados['id_circulo']
        
        # encontrar o respondente
        r = db.session.query(Respondente).filter(Respondente.id == id_respondente).all()
        alguem = r[0]

        # encontrar a questão
        q = db.session.query(Questao).filter(Questao.id == idq).all()
        quest = q[0]
        
        # encontra o circulo
        c = db.session.query(Circulo).filter(Circulo.id == id_circulo).all()
        circ = c[0]

        # cria a resposta
        nova_resposta = Resposta(questao=quest, respondente=alguem, resposta=resposta)         
        db.session.add(nova_resposta)
        db.session.commit()        

        # associa a resposta ao circulo
        rc = RespostaNoCirculo(circulo = circ, resposta = nova_resposta)
        db.session.add(rc)
        db.session.commit()
      
    except Exception as e:
        # resposta de erro
        response = jsonify({"message": "error", "details": str(e)})

    # informa que outras origens podem acessar os dados desde servidor/serviço
    response.headers.add('Access-Control-Allow-Origin', '*')
    # retorno!
    return response    

app.run(host='0.0.0.0', debug=True)
