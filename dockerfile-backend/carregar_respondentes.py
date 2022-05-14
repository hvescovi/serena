from config import *
from modelo import *

import json

# ler arquivo json das outras coisas
#data = json.load(open('/home/friend/01-github/serena/dockerfile-backend/outros2.json'))
data = json.load(open('/home/friend/01-github/serena/dockerfile-backend/302.json'))

# insere respondentes
for q in data['respondentes']:
    joao = Respondente(nome = q['nome'], email=q['email'], observacao = q['observacao'])
    db.session.add(joao)
    db.session.commit()
    print("\nRespondente carregado: "+str(joao))    

print("Fim da importação")
