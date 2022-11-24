from config import *
from modelo import *

import json

# ler arquivo json das outras coisas
data301 = json.load(open('/home/friend/01-github/serena/dockerfile-backend/301.json'))
data302 = json.load(open('/home/friend/01-github/serena/dockerfile-backend/302.json'))

def insere(fonte, identificador):
    # insere respondentes
    for q in fonte['respondentes']:
        joao = Respondente(nome = q['nome'], email=q['email'], observacao = q['observacao'])
        joao.observacao=identificador
        db.session.add(joao)
        db.session.commit()
        print("\nRespondente carregado: "+str(joao))    

insere(data301, "|g:301-2022|")
insere(data302, "|g:302-2022|")

print("Fim da importação")
