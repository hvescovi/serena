from config import *
from modelo import *

from difflib import SequenceMatcher  # similaridade entre strings
# https://stackoverflow.com/questions/17388213/find-the-similarity-metric-between-two-strings


@app.route("/")
def inicio():
    return "Serena: servidor backend staff."


@app.route('/exibir_respostas/<id_circulo>')
def exibir_respostas_circulo(id_circulo):
    lista = []
    respostas = Resposta.query.order_by(Resposta.questao_id).all()
    for r in respostas:
        lista.append(r.json())

    ret = jsonify({"message": "ok", "details": lista})

    ret.headers.add('Access-Control-Allow-Origin', '*')
    return ret


@app.route('/imagem/<nome>')
def imagem(nome):

    filename = 'imagens_questoes/'+nome
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
            if r.pontuacao is None:  # resposta sem pontuação?
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
    duplicados = db.session.execute('select count(id) q, questao_id, respondente_id'+\
    ' from resposta'+\
    ' group by questao_id, respondente_id'+\
    ' having q > 1'+\
    ' order by q desc')

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
        ids_respostas_duplicadas = db.session.execute(sql)

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
        sqls_exclusao.append(sql_excluir1)
        sqls_exclusao.append(sql_excluir2)

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

app.run(port=4999, debug=True)