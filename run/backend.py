from config import *
from modelo import *

# inicializa uma fila de respondentes
fila_respondentes = []

# NÚMERO DE QUESTÕES PARA RESPONDER
# DEPOIS PRECISA VIRAR UM PARÂMETRO :-)
maximo_questoes = 5
# maximo_questoes = 8 # para os círculo 13 e 14


@app.route("/")
def inicio():
    return "Serena: servidor backend."


@app.route('/retornar_questoes')
def retornar_questoes():
    print(request.remote_addr)
    if not ipok(request.remote_addr):
        return failed()

    resp = []
    questoes = Questao.query.all()
    for q in questoes:
        resp.append(q.json())
    ret = jsonify(resp)

    # jsonify é para retornar algo do tipo Response,
    # informação na qual se pode adicionar headers
    ret.headers.add('Access-Control-Allow-Origin', '*')
    return ret

@app.route('/preparar_rodada/<id_circulo>/<id_respondente>')
def preparar_rodada(id_circulo, id_respondente):
    if not ipok(request.remote_addr):
        return failed()

    '''
    Objetivo geral da rota: retornar um respondente que
    esteja participando do circulo

    se id_respondente == 0 => sorteia o respondente (modo círculo)
    se não, usa aquele respondente informado (modo linha)

    exemplo de saída:

    curl localhost:5000/preparar_rodada/17
        
    {
    "details": {
        "circulo_id": 17,
        "data_circulo": "13/11/2023",
        "email": "yasminalvesdesouza27@gmail.com",
        "id": 111,
        "nome": "YASMIN VICTORIA ALVES DE SOUZ",
        "nome_circulo": "AV5 301 2023",
        "observacao": "|g:301-2023|",
        "questoes_respondidas": 10
    },
    "message": "ok"
    }

    '''
    # carrega o circulo atual
    # MUDANÇA DE VERSÃO DO SQLALCHEMY
    # ERRO
    # LegacyAPIWarning: The Query.get() method is considered legacy as of the 
    # 1.x series of SQLAlchemy and becomes a legacy construct in 2.0. 
    # The method is now available as Session.get() (deprecated since: 2.0) 
    # (Background on SQLAlchemy 2.0 at: https://sqlalche.me/e/b8d9)
    #circulo = Circulo.query.get(id_circulo)
    circulo = db.session.get(Circulo, id_circulo)

    # pega os respondentes do circulo
    todos = db.session.query(Respondente).filter(
        Respondente.observacao.contains(circulo.filtro_respondente)).all()

    '''
    if id_circulo == '1':
        todos = db.session.query(Respondente).filter(
            Respondente.observacao == "301").all()
    else:
        todos = db.session.query(Respondente).filter(
            Respondente.observacao == "302").all()
    '''

    
    if len(todos) == 0:
        resp = {"message": "error", "details": "não há respondentes"}
    else:

        # não foi informado respondente?
        if not id_respondente:
            resp = {"message": "error", "details": "não foi informado o modo da rodada (parâmetro id_respondente) "}
        else:

            # declaração padrão do escolhido
            escolhido = id_respondente

            # modo círculo (sorteio)?
            if id_respondente == "0":

                # quantidade de respostas no círculo - vai ser preenchida dentro do for
                qresps = -1

                # tenta 15 vezes
                for i in range(1, 15):
                    # escolhe um respondente
                    nquem = random.randint(1, len(todos))

                    # pega o id dele
                    id_respondente_TMP = todos[nquem-1].id

                    # verifica se o respondente já respondeu "n" questões NO CIRCULOOOOOOO
                    sql = f"select q.id from questao q, resposta r, questaodocirculo qc, respostanocirculo rc where r.respondente_id = {id_respondente_TMP} AND r.questao_id=q.id AND qc.id_questao = q.id AND qc.id_circulo = {id_circulo} AND rc.resposta_id = r.id AND rc.circulo_id = {id_circulo}"
                    
                    # results = db.session.execute(sql)
                    # NOVO ERRO de versão sqlalchemy
                    # sqlalchemy.exc.ArgumentError: Textual SQL expression 'select q.id from questao ...' should be explicitly declared as text('select q.id from questao ...')
                    results = db.session.execute(text(sql))

                    #print(sql)
                    r1 = []
                    for linha in results:
                        r1.append(linha[0])

                    qresps = len(r1)
                    # print("questoes respondidas", r1)
                    # já respondeu o maximo de questoes?
                    if qresps >= maximo_questoes:
                        # tenta outro
                        continue
                        # eu estava usando break aqui em vez do continue, CABEÇÃAAAAAO

                    # print(fila_respondentes)
                    # verifica se o respondente não está na fila dos últimos 10
                    if id_respondente_TMP not in fila_respondentes:
                        # pode parar de tentar
                        break

                # adiciona o respondente na fila
                fila_respondentes.append(id_respondente_TMP)

                # se a fila encheu
                if len(fila_respondentes) >= 15: # TAMANHO DA FILA
                    # remove o primeiro da fila, para a fila "andar"
                    fila_respondentes.pop(0)

                # atualiza: o escolhido é o sorteado
                escolhido = id_respondente_TMP

            # retorna o respondente sorteado
            q = db.session.query(Respondente).filter(
                Respondente.id == escolhido).all()

            detalhes = q[0].json()

            # OUTRA CONSULTA
            # verificar quantas questões a pessoa já respondeu NO CIRCULOOOOO TODO TODO TODO
            # não precisa mais, já é feita a consulta antes
            #q = Resposta.query.filter_by(respondente_id=id_respondente).count()

            if qresps == -1:
                detalhes.update({"questoes_respondidas": qresps}) # PROBLEMA AQUI
            else:
                # adicionar no json essa quantidade de questões respondidas
                detalhes.update({"questoes_respondidas": qresps})

            # adicionar informações do círculo
            detalhes.update({"circulo_id": circulo.id,
                            "nome_circulo": circulo.nome,
                            "data_circulo": circulo.data})

            # ver quantas questões a pessoa já pulou
            # PRECISA SER AJUSTADO PARA CONSIDERAR APENAS O CÍRCULO ATUAL
            # ALÉM DISSO É UMA CONSULTA A MAIS QUE ESTÁ "PESANDO" NA HORA DA EXECUÇÃO
            # PARA FAZER TODO
            # https://stackoverflow.com/questions/26182027/how-to-use-not-in-clause-in-sqlalchemy-orm-query

            # REMOVIDO para não carregar o sistema
            # ficou lento em execução 22/08/2022, 08:00hs
            # lista de ID's das questões respondidas
            # ids_respondidas = db.session.query(Resposta.questao_id).filter(Resposta.respondente_id == id_respondente).all()

            # lista das questões (ids) exibidas ao respondente
            # ids_exibidas = db.session.query(QuestaoExibidaNoCirculo.questao_id).filter(QuestaoExibidaNoCirculo.respondente_id == id_respondente).all()

            # diferença
            # https://stackoverflow.com/questions/41125909/python-find-elements-in-one-list-that-are-not-in-the-other
            # puladas = list(set(ids_exibidas) - set(ids_respondidas))

            # q = query.count()
            # q = len(puladas)
            # resp.update({"questoes_puladas": q})
            resp = {"message": "ok", "details": detalhes}

    # retornos
    ret = jsonify(resp)
    ret.headers.add('Access-Control-Allow-Origin', '*')
    return ret

# curl localhost/preparar_rodada/1
# manter compatibilidade da versão círculo
@app.route('/preparar_rodada/<id_circulo>')
def preparar_rodada_padrao(id_circulo):
    return preparar_rodada(id_circulo, "0")

@app.route('/abrir_questao_circulo/<id_circulo>/<id_respondente>')
def abrir_questao_circulo(id_circulo, id_respondente):
    if not ipok(request.remote_addr):
        return failed()

    # geral: escolhe uma questao de assunto do circulo
    resp = []
    try:
        # temp: retorna uma questao aberta
        # ampliações:
        # - outros tipos de questão (OK)
        # - buscar apenas questão ainda não respondida (OK)
        # - buscar apenas questões de assuntos do círculo

        # q = db.session.query(Aberta).all()
        # nq = random.randint(1,len(q))
        # resp = q[nq-1].json()

        # obter círculo
        # circs = Circulo.query.filter(Circulo.id == id_circulo).all()
        # este circulo
        # este_circulo = circs[0] # este_circulo.assuntos

        # questões que eu respondi no círculo atual
        # ORIGINAL 1.0
        #r1 = db.session.query(Resposta.questao_id).filter(
        #    Resposta.respondente_id == id_respondente)

        # r1 = db.session.query(Resposta.questao_id).join(questaoDoCirculo).filter(
        #    Resposta.respondente_id == id_respondente & questaoDoCirculo.id_questao == Resposta.questao_id)

        # retornar questões que eu já respondi
        # - que estão no círculo atual
        # - que são questões minhas (meu respondente)
        sql = "select q.id from questao q, resposta r, questaodocirculo qc, respostanocirculo rc where r.respondente_id = "+\
                    id_respondente+" AND r.questao_id=q.id AND qc.id_questao = q.id AND qc.id_circulo = "+id_circulo +" and rc.resposta_id=r.id and rc.circulo_id="+id_circulo #order by q.id

                    # and rc.resposta_id=r.id and rc.circulo_id=17

        # XXX

        # inserido text por causa de NOVO ERRO DE VERSÃO do sqlalchemy
        results = db.session.execute(text(sql))
        #print(sql)
        r1 = []
        for linha in results:
            r1.append(linha[0])

        #print("tamanho:",len(r1)," r1=", r1)
        if len(r1) >= maximo_questoes:
        #if len(r1.all()) >= 10:
            retorno = jsonify(
                {"message": "error", "details": "Já foram respondidas todas as questões previstas para este círculo"})
        else:
            # selecionar todas as questões do círculo
            sql2 = "select q.id from questao q, questaodocirculo qc where qc.id_questao = q.id AND qc.id_circulo = "+id_circulo # order by q.id

            # inserido text por causa de NOVO ERRO DE VERSÃO do sqlalchemy
            results2 = db.session.execute(text(sql2))
            #print(sql)
            r2 = []
            for linha in results2:
                r2.append(linha[0])        

            #print("r2 (todas do círculo)", r2)

            # obter complemento: questões que estão no círculo, MENOS as questões que eu já respondi 
            # https://stackoverflow.com/questions/52417929/remove-elements-from-one-array-if-present-in-another-array-keep-duplicates-nu
            r3 = list(set(r2) - set(r1))

            #print("r3 (só as que não respondi", r3)

            res = Questao.query.filter(Questao.id.in_(r3)).all()


            if len(res) == 0:
                retorno = jsonify(
                    {"message": "error", "details": "Não há mais perguntas a responder"})
            else:

                # sorteia uma questão
                nq = random.randint(1, len(res))  # questoes_ainda_nao))

                # prepara a variável de questão
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
                ex = QuestaoExibidaNoCirculo(
                    circulo_id=id_circulo, respondente_id=id_respondente, questao_id=q.id)
                db.session.add(ex)
                db.session.commit()

                retorno = jsonify({"message": "ok", "details": resp})

    except Exception as e:
        # resposta de erro
        retorno = jsonify({"message": "error", "details": str(e)})

    # retornos
    # retorno = jsonify(resultado)
    retorno.headers.add('Access-Control-Allow-Origin', '*')
    return retorno



# retornar questões com filtro
@app.route('/retornar_questoes/<filtro>/<parametro>')
def retornar_questoes_com_filtro(filtro, parametro):
    if not ipok(request.remote_addr):
        return failed()

    resp = []

    # resposta padrao
    questoes = Questao.query.all()

    if filtro == "naofeitas":
        # obtém o respondente atual
        r = db.session.query(Respondente).filter(
            Respondente.email == parametro).all()

        # encontrou?
        if len(r) > 0:
            alguem = r[0]

            # obtém as respostas daquele respondente
            res = db.session.query(Resposta.questao_id).filter(
                Resposta.respondente_id == alguem.id)

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
    if not ipok(request.remote_addr):
        return failed()

    # prepara a resposta padrão otimista
    response = jsonify({"message": "ok", "details": "ok"})
    try:
        # pega os dados informados
        dados = request.get_json(force=True)
        idq = dados['idq']  # id da questão
        resposta = dados['resposta']

        # obtém usuario
        user_name = dados['user_name']
        user_email = dados['user_email']
        token = dados['token']

        # obtém questão
        q = db.session.query(Aberta).filter(Aberta.id == idq).all()

        # verifica se existe o respondente
        r = db.session.query(Respondente).filter(
            Respondente.email == user_email).all()
        # respondente não existe?
        alguem = None
        if len(r) == 0:
            # adiciona novo respondente (!!! não vai mais ser assim, precisa se logar !!!)
            alguem = Respondente(
                nome=user_name, email=user_email, observacao="")
            db.session.add(alguem)
            db.session.commit()
        else:
            alguem = r[0]

        '''
        # verifica token
        s = db.session.query(Respondente).filter(
            Respondente.token == token).all()
        if len(s) == 0:
            response = jsonify({"message": "ok", "details": "token inválido"})
        else:
            '''
        # cria a resposta
        nova_resposta = Resposta(
            questao=q[0], respondente=alguem, resposta=resposta)
        db.session.add(nova_resposta)
        db.session.commit()

        # q[0].resposta

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
    if not ipok(request.remote_addr):
        return failed()

    # prepara a resposta padrão otimista
    response = jsonify({"message": "ok", "details": "ok"})
    try:
        # pega os dados informados
        dados = request.get_json(force=True)
        idq = dados['idq']  # id da questão
        alternativa = dados['alternativa']

        # obtém usuario
        user_name = dados['user_name']
        user_email = dados['user_email']

        # obtém a resposta da questão
        q = db.session.query(MultiplaEscolha).filter(
            MultiplaEscolha.id == idq).all()

        # verifica se existe o respondente
        r = db.session.query(Respondente).filter(
            Respondente.email == user_email).all()
        # respondente não existe?
        alguem = None
        if len(r) == 0:
            # adiciona novo respondente
            alguem = Respondente(
                nome=user_name, email=user_email, observacao="")
            db.session.add(alguem)
            db.session.commit()
        else:
            alguem = r[0]

        # cria a resposta
        nova_resposta = Resposta(
            questao=q[0], respondente=alguem, resposta=alternativa)
        db.session.add(nova_resposta)
        db.session.commit()

        # percorrer as alternativas
        descricao_certa = "não encontrada"
        for alt in q[0].alternativas:
            if alt.certa:
                descricao_certa = alt.descricao

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
    if not ipok(request.remote_addr):
        return failed()

    # prepara a resposta padrão otimista
    response = jsonify({"message": "ok", "details": "ok"})
    try:
        # pega os dados informados
        dados = request.get_json(force=True)
        idq = dados['idq']  # id da questão
        lacunas = dados['lacunas']

        # obtém usuario
        user_name = dados['user_name']
        user_email = dados['user_email']

        # obtém a resposta da questão
        q = db.session.query(Completar).filter(Completar.id == idq).all()

        # verifica se existe o respondente
        r = db.session.query(Respondente).filter(
            Respondente.email == user_email).all()
        # respondente não existe?
        alguem = None
        if len(r) == 0:
            # adiciona novo respondente
            alguem = Respondente(
                nome=user_name, email=user_email, observacao="")
            db.session.add(alguem)
            db.session.commit()
        else:
            alguem = r[0]

        # cria a resposta
        nova_resposta = Resposta(
            questao=q[0], respondente=alguem, resposta=lacunas)
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
    if not ipok(request.remote_addr):
        return failed()

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
# INTERROMPIDO
def retornar_contagem_respostas(filtro, parametro):
    resp = []

    # resposta padrao
    # sql correto: retorna quantidade de respostas por respondente por questão
    contagem = Resposta.query.with_entities(Resposta.respondente_id, Resposta.questao_id, func.count(
        Resposta.timestamp)).group_by(Resposta.questao_id).all()

    if filtro == "email":
        # obtém o respondente atual
        r = db.session.query(Respondente).filter(
            Respondente.email == parametro).all()

        # encontrou?
        if len(r) > 0:
            alguem = r[0]

            # obtém as respostas daquele respondente
            res = db.session.query(Resposta.questao_id).filter(
                Resposta.respondente_id == alguem.id)
            contagem = Resposta.query.with_entities(Resposta.respondente_id == alguem.id, Resposta.questao_id, func.count(
                Resposta.timestamp)).group_by(Resposta.questao_id).all()

            # obtém questões que ainda não respondi
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
        r = db.session.query(Resposta).filter(
            Resposta.respondente_id == alguem.id, Resposta.questao_id == questao).all()

        resp = len(r)
        # contagem = Resposta.query.with_entities(Resposta.respondente_id == alguem.id, Resposta.questao_id == questao, func.count(Resposta.timestamp)).all()

        # for q in contagem:
        #    resp.append(q)

    ret = jsonify(resp)

    # jsonify é para retornar algo do tipo Response,
    # informação na qual se pode adicionar headers
    ret.headers.add('Access-Control-Allow-Origin', '*')
    return ret


# curl -d '{ "idq": 2, "resposta": "git é legal", "id_respondente":1, "id_circulo":1 }' -X POST http://localhost:5000/responder_questao_circulo


@app.route('/responder_questao_circulo', methods=['post'])
def responder_questao_circulo():
    if not ipok(request.remote_addr):
        return failed()

    # prepara a resposta padrão otimista
    response = jsonify({"message": "ok", "details": "ok"})
    try:
        # pega os dados informados
        dados = request.get_json(force=True)

        idq = dados['idq']  # id da questão
        id_respondente = dados['id_respondente']
        resposta = dados['resposta']
        id_circulo = dados['id_circulo']

        # encontrar o respondente
        r = db.session.query(Respondente).filter(
            Respondente.id == id_respondente).all()
        alguem = r[0]

        # encontrar a questão
        q = db.session.query(Questao).filter(Questao.id == idq).all()
        quest = q[0]

        # encontra o circulo
        c = db.session.query(Circulo).filter(Circulo.id == id_circulo).all()
        circ = c[0]

        # cria a resposta
        nova_resposta = Resposta(
            questao=quest, respondente=alguem, resposta=resposta)
        db.session.add(nova_resposta)
        db.session.commit()

        # associa a resposta ao circulo
        rc = RespostaNoCirculo(circulo=circ, resposta=nova_resposta)
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
    if not ipok(request.remote_addr):
        return failed()

    filename = caminho_imagens+nome
    return send_file(filename, mimetype='image/png')


@app.route('/retornar_questoes_exibidas_no_circulo')
def retornar_questoes_exibidas_no_circulo():
    if not ipok(request.remote_addr):
        return failed()

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
    if not ipok(request.remote_addr):
        return failed()

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



# curl localhost:5000/get_token/hvescovi@gmail.com

@app.route('/create_token/<email>')
def get_token(email):

    try:
        # obter a data atual
        now = datetime.now()  # current date and time
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
# @app.route('/salvar_token/<identif>/<token>')
# def salvar_token(identif, token):
# curl -d '{ "identificador": "aab", "token":"123" }' -X POST http://localhost:5000/salvar_token
@app.route('/salvar_token', methods=['post'])
def salvar_token():
    if not ipok(request.remote_addr):
        return failed()

    # prepara a resposta padrão otimista
    ret = jsonify({"message": "ok", "details": "ok"})
    try:
        # pega os dados informados
        dados = request.get_json(force=True)

        identif = dados['identificador']
        token = dados['token']

        # verificar se o usuario existe
        r = db.session.query(Respondente).filter(
            Respondente.identificador == identif).all()

        if len(r) > 0:
            # atualizar token do usuario
            db.session.query().\
                filter(Respondente.identificador == identif).\
                update({"token": token})
            # efetivar alterações
            db.session.commit()

            # stmt = update(Respondente).\
            #    where(Respondente.identificador == identif).\
            #    values(token = token)
            ret = jsonify(
                {"message": "ok", "details": "respondente atualizado"})
        else:
            # incluir respondente
            novo = Respondente(nome="novo", email="novo",
                               observacao="", identificador=identif, token=token)
            db.session.add(novo)
            ret = jsonify(
                {"message": "ok", "details": "token do respondente criado"})
            # efetivar alterações
            db.session.commit()

    except Exception as e:
        # resposta de erro
        ret = jsonify({"message": "error", "details": str(e)})

    # jsonify é para retornar algo do tipo Response,
    # informação na qual se pode adicionar headers
    ret.headers.add('Access-Control-Allow-Origin', '*')
    return ret


@app.route('/getall/<string:classe>', methods=['get'])
def get_generico(classe):
    if not ipok(request.remote_addr):
        return failed()

    # reflexao
    # https://stackoverflow.com/questions/4821104/dynamic-instantiation-from-string-name-of-a-class-in-dynamically-imported-module
    modulo = __import__("modelo")
    refclasse = getattr(modulo, classe)

    result = db.session.query(refclasse).all()
    result_json = [x.json() for x in result]
    resposta = jsonify(result_json)
    resposta.headers.add('Access-Control-Allow-Origin', '*')

    return resposta


@app.route('/get/<string:classe>/<string:id>', methods=['get'])
def get_especifico(classe, id):

    # reflexao: instanciando a classe a partir de seu nome em string
    # https://stackoverflow.com/questions/4821104/dynamic-instantiation-from-string-name-of-a-class-in-dynamically-imported-module
    modulo = __import__("modelo")
    refclasse = getattr(modulo, classe)
    
    # ERRO nova versão sqlalchemy
    # LegacyAPIWarning: The Query.get() method is considered legacy as 
    # of the 1.x series of SQLAlchemy and becomes a legacy construct in 2.0. 
    # The method is now available as Session.get() (deprecated since: 2.0) 
    # (Background on SQLAlchemy 2.0 at: https://sqlalche.me/e/b8d9)
    #result = refclasse.query.get(id)
    result = db.session.get(refclasse, id)

    resposta = jsonify(result.json())
    resposta.headers.add('Access-Control-Allow-Origin', '*')

    return resposta


@app.route('/exibir_respostas/<id_circulo>')
def exibir_respostas_circulo(id_circulo):
    if not ipok(request.remote_addr):
        return failed()

    lista = []
    respostas = Resposta.query.order_by(Resposta.questao_id).all()
    for r in respostas:
        lista.append(r.json())

    ret = jsonify({"message": "ok", "details": lista})

    ret.headers.add('Access-Control-Allow-Origin', '*')
    return ret

# controle de ips?
ipcontrol = False
ips = []


def ipok(ip):
    if ipcontrol:
        ret = (ip in ips)
        return ret
    else:
        return True


def failed():
    return jsonify({"message": "error", "details": "unauthorized"})


def loadiptable():
    f = open('/home/friend/01-github/serena/dockerfile-backend/ips.txt', 'r')
    for x in f:
        ips.append(x[:-1])
    print(ips)


@app.route('/circulo_ativo')
def circulo_ativo():
    if not ipok(request.remote_addr):
        return failed()

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



@app.route('/retornar_contagem_respostas_geral/<circulo_id>')
def retornar_contagem_respostas_geral(circulo_id):
    
    where2 = " and rc.circulo_id = "+circulo_id

    # inserido text por causa de NOVO ERRO DE VERSÃO do sqlalchemy
    resultado = db.session.execute(text("""select rc.circulo_id, count(r.id) q, rte.nome
from resposta r, respondente rte, respostanocirculo rc
where rc.resposta_id=r.id 
and rte.id = r.respondente_id """ + where2 + """
group by rte.nome, rc.circulo_id 
order by rc.circulo_id, q desc, rte.nome"""))

    lista = []
    for r in resultado:
        lista.append({
            "circulo_id": r["circulo_id"],
            "q": r["q"],
            "nome": r["nome"]
        })
    
    ret = jsonify({"message": "ok", "details": lista})

    ret.headers.add('Access-Control-Allow-Origin', '*')
    return ret





# start of backend

if ipcontrol:
    loadiptable()

app.run(host='0.0.0.0', debug=True)
# app.run(host="0.0.0.0")
