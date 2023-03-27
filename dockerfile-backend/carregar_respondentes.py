from config import *
from modelo import *

# https://csvjson.com/csv2json

import json
import sys

# ler arquivo json das outras coisas
#data301 = json.load(open('/home/friend/01-github/serena/dockerfile-backend/301.json'))
#data302 = json.load(open('/home/friend/01-github/serena/dockerfile-backend/302.json'))
#data202 = json.load(open('/home/friend/01-github/serena/dockerfile-backend/202.json'))

try:
    # tenta obter o primeiro parâmetro
    arquivo = sys.argv[1] 
except:
    # não foi informado o arquivo?
    print("Informe o nome de um arquivo json que seja uma lista na qual "+
          "cada registro tenha os campos nome, email, observacao")
    exit()

print("carregando...", arquivo)
dados = json.load(open(arquivo))

def insere(fonte): #, identificador):
    # insere respondentes
    for q in fonte:
    #for q in fonte['respondentes']:
        joao = Respondente(nome = q['nome'], email=q['email'], observacao = q['observacao'])
        #if identificador:
        #    joao.identificador=identificador
        db.session.add(joao)
        db.session.commit()
        print("\nRespondente carregado: "+str(joao))    

#insere(data301, "|g:301-2022|")
#insere(data302, "|g:302-2022|")
insere(dados) # , "|g:202-2022|")

print("Fim da importação")
