from flask import Flask
from backend.routes import api

app = Flask(__name__)
app.json.ensure_ascii = False

app.register_blueprint(api, url_prefix="/api")