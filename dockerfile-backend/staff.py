from config import *
from modelo import *


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

app.run(debug=True, port=4999)