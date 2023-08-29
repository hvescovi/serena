import classes.alternativa as m # m = modelo

# criar alternativas
a1 = m.Alternativa(descricao = "Uma linguagem compilável", certa = False)
a2 = m.Alternativa(descricao = "Uma linguagem interpretada", certa = True)
a3 = m.Alternativa(descricao = "Uma linguagem de marcação", certa = False)
# persistir
m.c.db.session.add(a1) # m.c = m.config
m.c.db.session.add(a2)
m.c.db.session.add(a3)
m.c.db.session.commit()
# exibir
print(a1, a2, a3)
print(a1.json()) # teste json