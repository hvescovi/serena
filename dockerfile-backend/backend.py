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

# curl -d '{ "idq": 2, "resposta": "123", "user_name":"Hylson Netto", "user_email":"hvescovi@gmail.com", "token":"123" }' -X POST http://localhost:5000/verificar_resposta_aberta
@app.route('/verificar_resposta_aberta', methods=['post'])
def verificar_resposta_aberta():
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
        token = dados['token']

        # obtém questão 
        q = db.session.query(Aberta).filter(Aberta.id == idq).all()

        # verifica se existe o respondente
        r = db.session.query(Respondente).filter(Respondente.email == user_email).all()
        # respondente não existe?
        alguem = None
        if len(r) == 0:
            # adiciona novo respondente (!!! não vai mais ser assim, precisa se logar !!!)
            alguem = Respondente(nome = user_name, email=user_email, observacao = "")
            db.session.add(alguem)
            db.session.commit()
        else:
            alguem = r[0]
          
        '''
        # verifica token
        s = db.session.query(Respondente).filter(Respondente.token == token).all()
        if len(s) == 0:
            response = jsonify({"message": "ok", "details": "token inválido"})
        else:
            '''
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
        # - outros tipos de questão (OK)
        # - buscar apenas questão ainda não respondida (OK)
        # - buscar apenas questões de assuntos do círculo
        
        #q = db.session.query(Aberta).all()
        #nq = random.randint(1,len(q))
        #resp = q[nq-1].json()

        # obter círculo
        #circs = Circulo.query.filter(Circulo.id == id_circulo).all()
        # este circulo
        #este_circulo = circs[0] # este_circulo.assuntos

        # questões que eu respondi
        r1 = db.session.query(Resposta.questao_id).filter(Resposta.respondente_id == id_respondente)
        #r1 = db.session.query(Questao).all()
            
        # obtém questões que ainda não respondi
        res = Questao.query.filter(Questao.id.notin_(r1)).all()

        # sorteia uma questão
        nq = random.randint(1,len(res)) # questoes_ainda_nao))

        resp = ""

        # obtém a questão        
        q = res[nq-1]

        # faz uma conversão de tipo para obter o json

        if q.type == "aberta":
            q.__class__ = Aberta
            resp = q.json()
            
        if q.type == "completar":
            q.__class__ = Completar
            resp = q.json()

        if q.type == "multiplaescolha":
            q.__class__ = MultiplaEscolha
            resp = q.json()            
        
        # registrar que a questão foi aberta, exibida na tela
        ex = QuestaoExibidaNoCirculo(circulo_id=id_circulo, respondente_id=id_respondente, questao_id=q.id)
        db.session.add(ex)
        db.session.commit()               

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

@app.route('/imagem/<nome>')
def imagem(nome):
    filename = 'imagens_questoes/'+nome
    return send_file(filename, mimetype='image/png')

@app.route('/retornar_questoes_exibidas_no_circulo')
def retornar_questoes_exibidas_no_circulo():
    resp = []
    registros = QuestaoExibidaNoCirculo.query.all()
    for r in registros:
        resp.append(r.json())    
    ret = jsonify(resp)
    
    # jsonify é para retornar algo do tipo Response,
    # informação na qual se pode adicionar headers
    ret.headers.add('Access-Control-Allow-Origin', '*')        
    return ret


@app.route('/retornar_questao/<id_questao>')
def retornar_questao(id_questao):
    resp = []
    questoes = Questao.query.filter(Questao.id == id_questao).all()
    for q in questoes:
        if q.type == "aberta":
            q.__class__ = Aberta
            resp.append(q.json())
            
        if q.type == "completar":
            q.__class__ = Completar
            resp.append(q.json())

        if q.type == "multiplaescolha":
            q.__class__ = MultiplaEscolha
            resp.append(q.json())

    ret = jsonify(resp)
    
    # jsonify é para retornar algo do tipo Response,
    # informação na qual se pode adicionar headers
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
            stmt = db.session.update(Questao).where(Questao.id==5).\
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

# curl localhost:5000/get_token/hvescovi@gmail.com
@app.route('/create_token/<email>')
def get_token(email):
    
    try:
        # obter a data atual
        now = datetime.now() # current date and time
        data = now.strftime("%Y %m %d")

        # obter o salt
        f = open(saltfile, "r")
        salt = f.read()
        f.close()
        
        # gerar hash
        # https://www.geeksforgeeks.org/md5-hash-python/    
        phrase = data+salt+email
        hash = hashlib.md5(phrase.encode('utf-8')).hexdigest()
        
        ret = jsonify({"message": "ok", "details": hash})

    except Exception as e:
        # resposta de erro
        ret = jsonify({"message": "error", "details": str(e)})

    # jsonify é para retornar algo do tipo Response,
    # informação na qual se pode adicionar headers
    ret.headers.add('Access-Control-Allow-Origin', '*')        
    return ret

    

# curl localhost:5000/salvar_token/agaasdafdsada/ae234
# 
#@app.route('/salvar_token/<identif>/<token>')
#def salvar_token(identif, token):
# curl -d '{ "identificador": "aab", "token":"123" }' -X POST http://localhost:5000/salvar_token
@app.route('/salvar_token', methods=['post'])
def salvar_token():
    # prepara a resposta padrão otimista
    ret = jsonify({"message": "ok", "details": "ok"})    
    try:
        # pega os dados informados
        dados = request.get_json(force=True)

        identif = dados['identificador']
        token = dados['token']

        # verificar se o usuario existe
        r = db.session.query(Respondente).filter(Respondente.identificador == identif).all()
        
        if len(r) > 0:
            # atualizar token do usuario
            db.session.query().\
                filter(Respondente.identificador == identif).\
                update({"token": token})
            # efetivar alterações
            db.session.commit()

            #stmt = update(Respondente).\
            #    where(Respondente.identificador == identif).\
            #    values(token = token)
            ret = jsonify({"message": "ok", "details": "respondente atualizado"})                    
        else:
            # incluir respondente
            novo = Respondente(nome="novo", email="novo", observacao="", identificador=identif, token = token)
            db.session.add(novo)
            ret = jsonify({"message": "ok", "details": "token do respondente criado"})                    
            # efetivar alterações
            db.session.commit()          
        
    except Exception as e:
        # resposta de erro
        ret = jsonify({"message": "error", "details": str(e)})

    # jsonify é para retornar algo do tipo Response,
    # informação na qual se pode adicionar headers
    ret.headers.add('Access-Control-Allow-Origin', '*')        
    return ret

    
app.run(host='0.0.0.0', debug=True)

