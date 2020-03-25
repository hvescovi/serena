from config import *

class Alternativa(db.Model):
    # o id não é informado no json, via importação; 
    # apenas é usado para exportação
    id = db.Column(db.Integer, primary_key=True)
    descricao = db.Column(db.String(254))
    certa = db.Column(db.Boolean())

    def __str__(self):
        return "{0} ({1})".format(self.descricao, self.certa)

    def json(self):
        return {
            "id":self.id,
            "descricao":self.descricao,
            "certa":self.certa
        }

class Assunto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(254))
    def __str__(self):
        return self.nome + "("+str(self.id)+")"
        
    def json(self):
        return {
            "id":self.id,
            "nome": self.nome
        }
 

class Questao(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    enunciado = db.Column(db.String(254))
    autor = db.Column(db.String(254))
    #assunto = db.Column(db.String(254))
    data_cadastro = db.Column(db.String(254))

    # n x n
    assuntos = db.relationship("Assunto", secondary="assuntodaquestao")

    #questoesNaProva = db.relationship("QuestaoNaProva")
    #respostas = db.relationship("Resposta")

    # atributo necessário para armazenar tipo de classe especializada, 
    # que deriva desta
    # o nome precisa ser type
    type = db.Column(db.String(50))
    
    __mapper_args__ = {
        'polymorphic_identity':'questao', 
        'polymorphic_on':type
    }
    def __str__(self):
        return self.enunciado

# https://docs.sqlalchemy.org/en/13/orm/basic_relationships.html
# tabela de mapeamento n x n
alternativasDaQuestao = db.Table('alternativasDaQuestao', db.metadata,
    db.Column('id_alternativa', db.Integer, db.ForeignKey(Alternativa.id)),
    db.Column('id_questao', db.Integer, db.ForeignKey(Questao.id))
)


assuntoDaQuestao = db.Table('assuntodaquestao', db.metadata,
    db.Column('id_assunto', db.Integer, db.ForeignKey(Questao.id)),
    db.Column('id_questao', db.Integer, db.ForeignKey(Assunto.id))
)


class MultiplaEscolha(Questao):
    id = db.Column(db.Integer, db.ForeignKey('questao.id'), primary_key=True)
    alternativas = db.relationship("Alternativa", secondary=alternativasDaQuestao)

    __mapper_args__ = {
        'polymorphic_identity':'multiplaescolha',
    }

    def __str__(self):
        # chama o str do pai
        retorno = super().__str__()
        # monta as alternativas
        for a in self.alternativas:
            retorno += "\n=> "+str(a)
        # retorna :-p
        return retorno

    def json(self):
        return {
            # atributos gerais da questão
            "id":self.id,
            "enunciado":self.enunciado,
            "autor": self.autor,
            #"assunto": self.assunto,
            "data_cadastro":self.data_cadastro,
            # assuntos...
            "type":self.__class__.__name__,
            # específico desse tipo de questão
                "alternativas":[alternativa.json() for alternativa in self.alternativas]
        }

class Respondente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(254))
    email = db.Column(db.String(254))
    observacao = db.Column(db.String(254))
    def __str__(self):
        return self.nome+" ("+self.email+")"+self.observacao

    def json(self):
        return {
            "id":self.id,
            "nome":self.nome,
            "email": self.email,
            "observacao": self.observacao,
        }
    #provas = db.relationship("Prova")

# tabela de mapeamento n x n
#questoesNaProva = db.Table('questoesNaProva', db.metadata,
#    db.Column('id_questao', db.Integer, db.ForeignKey(QuestaoNaProva.id)),
#    db.Column('id_prova', db.Integer, db.ForeignKey('prova.id')) # Prova.id ainda não está definido, por isso prcisa usar string!
#)

class Prova(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.String(254))
    #questoesNaProva = db.relationship("QuestaoNaProva")#, secondary=questoesNaProva)
    
    # atributo para acessar questões a partir de uma prova
    questoesDaProva = db.relationship("Questao", secondary="questaodeprova")

    def __str__(self):
        s = str(self.data)
        return s
    def json(self):
        return {
            "id":self.id,
            "data":self.data,
            "questoes":[q.json() for q in self.questoesDaProva]
        }

class QuestaoDeProva(db.Model):
    __tablename__ = "questaodeprova"
    
    questao_id = db.Column(db.Integer, db.ForeignKey(Questao.id), primary_key=True)
    prova_id = db.Column(db.Integer, db.ForeignKey(Prova.id), primary_key=True)

    # atributos de relacionamento
    questao = db.relationship("Questao")
    prova = db.relationship("Prova")
    
    # atributos da questão de prova
    ordem = db.Column(db.Integer)
    pontos = db.Column(db.Float)

    def __str__(self):
        return str(self.questao)+" em "+str(self.prova)+\
            ", ordem="+str(self.ordem)+", pts="+str(self.pontos)

class Resposta(db.Model):
    # pode haver mais de uma resposta do respondente, da mesma pergunta
    id = db.Column(db.Integer, primary_key=True) 
    
    # atributos de relacionamento
    questao_id = db.Column(db.Integer, db.ForeignKey(Questao.id))
    questao = db.relationship("Questao")
    respondente_id = db.Column(db.Integer, db.ForeignKey(Respondente.id))
    respondente = db.relationship("Respondente")
    
    # atributos da resposta
    resposta = db.Column(db.String(254))
    timestamp = db.Column(db.DateTime(timezone=True), server_default=db.func.now()) # quando a questão foi respondida

    def __str__(self):
        return str(self.questao) + "\n, por: "+str(self.respondente)+"\n resposta: " + self.resposta + " em "+ str(self.timestamp)

    def json(self):
        return {
            "id":self.id,
            "questa_id":self.questao_id,
            "questao": self.questao.json(),
            "respondente_id": self.respondente_id,
            "respondente":self.respondente.json(),
            "resposta":self.resposta,
            "timestamp":self.timestamp
        }

class Completar(Questao):
    id = db.Column(db.Integer, db.ForeignKey('questao.id'), primary_key=True)
    lacunas = db.Column(db.String(254)) # palavras separadas por vírgulas

    __mapper_args__ = {
        'polymorphic_identity':'completar',
    }

    def __str__(self):
        # chama o str do pai
        retorno = super().__str__()
        # retorna :-p
        return retorno + ", lacunas="+ self.lacunas

    def json(self):
        return {
            # atributos gerais da questão
            "id":self.id,
            "enunciado": self.enunciado,
            "autor": self.autor,
            #"assunto": self.assunto,
            "data_cadastro": self.data_cadastro,
            # assuntos ...
            "type": self.__class__.__name__,
            # específico desse tipo de questão
            "lacunas":self.lacunas
        }

class Aberta(Questao):
    id = db.Column(db.Integer, db.ForeignKey('questao.id'), primary_key=True)
    resposta = db.Column(db.String(254))

    __mapper_args__ = {
        'polymorphic_identity':'aberta',
    }

    def __str__(self):
        # chama o str do pai
        retorno = super().__str__()
        # retorna :-p
        return retorno + ", resposta="+ self.resposta

    def json(self):
        return {
            # atributos gerais da questão
            "id":self.id,
            "enunciado":self.enunciado,
            "autor": self.autor,
#            "assunto": self.assunto,
            "data_cadastro":self.data_cadastro,
#   assuntos = db.relationship("Assunto", secondary="assuntodaquestao")         
            "type":self.__class__.__name__,
            # específico desse tipo de questão
            "resposta": self.resposta
        }  

class Circulo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(254))
    data = db.Column(db.String(254))
    
    # relacionamento n x n 
    assuntos = db.relationship("Assunto", secondary="assuntodocirculo")
    
    #assuntos = db.Column(db.String(254)) # separados por "|"
    
    #questoesNaProva = db.relationship("QuestaoNaProva")#, secondary=questoesNaProva)
    
    # atributo para acessar questões a partir de uma prova
    respostasNoCirculo = db.relationship("Resposta", secondary="respostanocirculo")

    def __str__(self):
        s = self.nome + "("+str(self.id)+"), em "+self.data
        for assunto in self.assuntos:
            s = s + " > " + str(assunto)       
        return s
        
    def json(self):
        return {
            "id":self.id,
            "nome": self.nome,
            "data":self.data,
            #"assuntos": self.assuntos
            "assuntos":[a.json() for a in self.assuntos]
        }

assuntoDoCirculo = db.Table('assuntodocirculo', db.metadata,
    # Circulo.id como string, pois a definição vem depois!
    db.Column('id_circulo', db.Integer, db.ForeignKey(Circulo.id)),
    db.Column('id_assunto', db.Integer, db.ForeignKey(Assunto.id))
)


class RespostaNoCirculo(db.Model):
    __tablename__ = "respostanocirculo"
    
    circulo_id = db.Column(db.Integer, db.ForeignKey(Circulo.id), primary_key=True)
    resposta_id = db.Column(db.Integer, db.ForeignKey(Resposta.id), primary_key=True)

    # atributos de relacionamento
    circulo = db.relationship("Circulo")
    resposta = db.relationship("Resposta")
    
    # atributos especificos - nao tem
    # a ordem serah obtida pelos timestamps das respostas
    

    def __str__(self):
        return str(self.resposta)+" em "+str(self.circulo)

class QuestaoExibidaNoCirculo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    circulo_id = db.Column(db.Integer, db.ForeignKey(Circulo.id))
    questao_id = db.Column(db.Integer, db.ForeignKey(Questao.id))
    respondente_id = db.Column(db.Integer, db.ForeignKey(Respondente.id))
    
    def json(self):
        return {
            "id":self.id,
            "circulo_id":self.circulo_id,
            "questao_id":self.questao_id,
            "respondente_id":self.respondente_id
        }

#
# teste
#

if __name__ == "__main__":

    # apagar o arquivo, se houver
    if os.path.exists(arquivobd):
        os.remove(arquivobd)

    # criar tabelas
    db.create_all()

    # aberta
    #ab = Aberta(descricao="")

    # criar alternativas
    a1 = Alternativa(descricao = "Uma linguagem compilável", certa = False)
    a2 = Alternativa(descricao = "Uma linguagem interpretada", certa = True)
    a3 = Alternativa(descricao = "Uma linguagem de marcação", certa = False)
    # persistir
    db.session.add(a1)
    db.session.add(a2)
    db.session.add(a3)
    db.session.commit()
    # exibir
    print(a1,a2,a3)

    # questão de multipla escolha
    pyt = Assunto(nome = "javascript básico")
    db.session.add(pyt)
    db.session.commit()

    m1 = MultiplaEscolha(enunciado = "O que é javascript?")
    m1.assuntos.append(pyt)
    m1.alternativas.append(a1)
    m1.alternativas.append(a2)
    m1.alternativas.append(a3)
    db.session.add(m1)
    db.session.commit()
    print(m1)

    # resposta
    joao = Respondente(nome = "Joao da Silva", email="josilva@gmail.com", observacao = "PGM2 2020/1 302")
    r1 = Resposta(questao=m1, respondente=joao, resposta="1")
    db.session.add(joao)
    db.session.add(r1)
    db.session.commit()
    print(r1)

    # prova
    p1 = Prova(data = "22/02/2020")
    qp1 = QuestaoDeProva(prova=p1, questao=m1, ordem=1, pontos=1.0)
    db.session.add(qp1)
    db.session.add(p1)
    db.session.commit()
    print(p1)  

    # questão de lacuna
    git = Assunto(nome = "git")

    lac1 = Completar(enunciado = "Os comandos do git para enviar programas para o repositório remoto "+\
        "do github.com são add, commit e __________", lacunas = "push")
    lac1.assuntos.append(git)        

    db.session.add(git)
    db.session.commit()

    db.session.add(lac1)
    db.session.commit()

    # adicionar na prova
    qp2 = QuestaoDeProva(questao = lac1, prova = p1, ordem = 2, pontos = 0.5)
    db.session.add(qp2)
    db.session.commit()

    # for user in session.query(User).filter_by(name='jack'):
    # exibir
    for qp in db.session.query(QuestaoDeProva).all():
        print(qp)

    # questoes da prova
    for q in p1.questoesDaProva:
        print("questao da prova "+p1.data+":"+str(q))

    # criar um novo circulo
    c1 = Circulo(nome="prova 1", data = "22/03/2020")
    c1.assuntos.append(git)
    c1.assuntos.append(pyt)
    db.session.add(c1)
    db.session.commit()

    # adicionar resposta ao circulo
    rc = RespostaNoCirculo(circulo = c1, resposta = r1)
    db.session.add(rc)
    db.session.commit()

    print("\n Teste de reposta no circulo\n"+str(rc))
