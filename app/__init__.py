import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv


load_dotenv()


db = SQLAlchemy()

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

def create_app():
    app = Flask(__name__)


    app.config.from_object(Config)


    db.init_app(app)


    from app.routes.company import company_bp
    app.register_blueprint(company_bp, url_prefix='/companies')

    return app
