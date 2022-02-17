import config as c

class Alternativa(c.db.Model):
    # o id não é informado no json, via importação; 
    # apenas é usado para exportação
    id = c.db.Column(c.db.Integer, primary_key=True)
    descricao = c.db.Column(c.db.String(254))
    certa = c.db.Column(c.db.Boolean())

    def __str__(self):
        return "{0} ({1})".format(
            self.descricao, self.certa)
            
    def json(self):
        return {
            "id":self.id,
            "descricao":self.descricao,
            "certa":self.certa
        }