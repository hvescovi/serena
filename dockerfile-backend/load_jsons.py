from config import *
from modelo import *

import json

def associaAssuntosAQuestao(questao, assuntos):
    # percorre os assuntos
    for a in assuntos:
        ass = Assunto.query.filter(Assunto.nome == a).all()
        novo = ""
        # o assunto não existe?
        if len(ass) == 0:
            # adiciona o assunto
            novo = Assunto(nome = a)
            db.session.add(novo)
            db.session.commit()
        else:
            novo = ass[0]
        
        # associa o assunto à questão
        questao.assuntos.append(novo)
        db.session.add(questao)
        db.session.commit()

def associaAssuntosACirculo(circulo, assuntos):
    # percorre os assuntos
    for a in assuntos:
        ass = Assunto.query.filter(Assunto.nome == a).all()
        novo = ""
        # o assunto não existe?
        if len(ass) == 0:
            # adiciona o assunto
            novo = Assunto(nome = a)
            db.session.add(novo)
            db.session.commit()
        else:
            novo = ass[0]
        
        # associa o assunto à questão
        circulo.assuntos.append(novo)
        db.session.add(circulo)
        db.session.commit()        

# apagar o arquivo, se houver
if os.path.exists(arquivobd):
    os.remove(arquivobd)

# criar tabelas
db.create_all()

# ler arquivo json
data = json.load(open('questoes.json'))

# percorrer o json
for q in data['questoes']:

    if q['type'] == 'Aberta':
        ab = Aberta(id=q['id'], 
            enunciado = q['enunciado'],
            autor = q['autor'],
            #assunto = q['assunto'],
            data_cadastro = q['data_cadastro'],
            resposta = q['resposta']
            )
        
        db.session.add(ab)
        db.session.commit()
    
        associaAssuntosAQuestao(ab, q['assuntos'])
            
        print("=> Questão carregada: "+str(ab))
        

    if q['type'] == 'MultiplaEscolha':
        
        ab = MultiplaEscolha(id=q['id'], 
            enunciado = q['enunciado'],
            autor = q['autor'],
            #assunto = q['assunto'],
            data_cadastro = q['data_cadastro'])

        for alt in q['alternativas']:
            a = Alternativa(descricao = alt['descricao'], certa = alt['certa'])
            ab.alternativas.append(a)

            db.session.add(a)
            db.session.commit()

        print("=> Questão carregada: "+str(ab))
        db.session.add(ab)
        db.session.commit()            

        associaAssuntosAQuestao(ab, q['assuntos'])
        
        
    if q['type'] == 'Completar':
        c = Completar(id=q['id'], 
            enunciado = q['enunciado'],
            autor = q['autor'],
            #assunto = q['assunto'],
            data_cadastro = q['data_cadastro'],
            lacunas = q['lacunas']
            )

        print("=> Questão carregada: "+str(c))
        db.session.add(c)
        db.session.commit()

        associaAssuntosAQuestao(c, q['assuntos'])
        

# ler arquivo json das outras coisas
data = json.load(open('outros.json'))

# insere circulos
for q in data['circulos']:
    c1 = Circulo(nome=q['nome'], data = q['data']) #, assuntos=q['assuntos'])
    db.session.add(c1)
    db.session.commit()
    print("\nCirculo carregado: "+str(c1))

    associaAssuntosACirculo(c1, q['assuntos'])

# insere respondentes
for q in data['respondentes']:
    joao = Respondente(nome = q['nome'], email=q['email'], observacao = q['observacao'])
    db.session.add(joao)
    db.session.commit()
    print("\nRespondente carregado: "+str(joao))    

print("Fim da importação")
