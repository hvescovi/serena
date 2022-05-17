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
if os.path.exists("/home/friend/01-github/serena/dockerfile-backend/"):
    arquivobd = "/home/friend/01-github/serena/dockerfile-backend/database/serena.db"
else:    
    # execução em container do docker
    arquivobd = "/database/serena.db"

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///'+arquivobd
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # remove warning
db = SQLAlchemy(app)

from datetime import datetime

import hashlib