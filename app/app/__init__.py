from flask import Flask
from app.routes.main_routes import main_bp 
from flask_cors import CORS

def create_app():
    app = Flask(__name__, static_folder='../frontend/build')
    app.config.from_pyfile('../config.py')

    app.register_blueprint(main_bp, url_prefix='/')
    CORS(app, resources={r"/api/*": {"origins": "*"}})
     
    from .db import init_db
    init_db(app)

    return app
