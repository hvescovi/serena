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
                    pass

                if r.questao.type == "multiplaescolha":
                    pass
        response = jsonify({"message": "ok", "details": "ok:"+str(cont)+" pontuações sugeridas"})
        
    except Exception as e:
        response = jsonify({"message": "error", "details": str(e)})
    
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


app.run(port=4999, debug=True)