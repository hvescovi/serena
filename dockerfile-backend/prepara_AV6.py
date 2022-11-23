from config import *
from modelo import *

    # apagar o arquivo, se houver
if os.path.exists(arquivobd):
    os.remove(arquivobd)

# criar tabelas
db.create_all()


# criar circulos
c1 = Circulo(nome="AV6 302", data = "24/11/2022", filtro_respondente="|g:302-2022|", ativo="1")
db.session.add(c1)
db.session.commit()
print("Circulo:",c1)

c2 = Circulo(nome="AV6 301", data = "24/11/2022", filtro_respondente="|g:301-2022|", ativo="0")
db.session.add(c2)
db.session.commit()
print("Circulo:",c2)

