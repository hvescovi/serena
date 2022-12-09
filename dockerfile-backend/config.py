# https://flask-sqlalchemy.palletsprojects.com/en/2.x/quickstart/
# https://pypi.org/project/Flask-SQLAlchemy/

# SERENA	Sistema abERto pErguNtAs

from flask import Flask, jsonify, request, send_file#, Response
from flask_sqlalchemy import SQLAlchemy
import os
from sqlalchemy import func, update

import random

from flask_cors import CORS # permitir back receber json do front

#from sqlalchemy import inspect

#from flask_marshmallow import Marshmallow
# pip3 install -U marshmallow-sqlalchemy
# pip install flask-marshmallow

#
# configurações e ambiente
#

# configurações
app = Flask(__name__)
CORS(app) # aplicar o cross domain

# execução local?
caminho_BD = "/home/friend/Dropbox/10-serena-BD/"
if os.path.exists(caminho_BD):
    arquivobd = caminho_BD + "serena.db"
else:    
    # execução em container do docker
    arquivobd = "/database/serena.db"

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///'+arquivobd
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # remove warning
db = SQLAlchemy(app)

from datetime import datetime

import hashlib

# comando mágico que se tornou necessário por causa de alguma versão nova do python
app.app_context().push()