# https://flask-sqlalchemy.palletsprojects.com/en/2.x/quickstart/
# https://pypi.org/project/Flask-SQLAlchemy/

# SERENA	Sistema abERto pErguNtAs

from flask import Flask, jsonify, request#, Response
from flask_sqlalchemy import SQLAlchemy
import os

from sqlalchemy import func

import random

#from sqlalchemy import inspect

#from flask_marshmallow import Marshmallow
# pip3 install -U marshmallow-sqlalchemy
# pip install flask-marshmallow

#
# configurações e ambiente
#

app = Flask(__name__)

if os.path.exists("/home/friend/pcloud/04-experiments/07-questoes-online-python-sqlalchemy/Serena/dockerfile-backend/"):
    arquivobd = "/home/friend/pcloud/04-experiments/07-questoes-online-python-sqlalchemy/Serena/dockerfile-backend/serena.db"
else:    
    arquivobd = "/serena.db"

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///'+arquivobd
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # remove warning
db = SQLAlchemy(app)

