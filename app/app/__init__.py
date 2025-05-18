from flask import Flask
from app.routes.main_routes import main_bp 

def create_app():
    app = Flask(__name__)
    
    app.config.from_pyfile('../config.py')

    app.register_blueprint(main_bp, url_prefix='/')
    
    from .db import init_db
    init_db(app)

    return app
