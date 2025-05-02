import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from flask_cors import CORS
from appApi import models  
from appApi.extension import db 

load_dotenv()


class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

def create_app():
    app = Flask(__name__)

    CORS(app)


    app.config.from_object(Config)


    db.init_app(app)


    from appApi.routes.company import company_bp
    app.register_blueprint(company_bp, url_prefix='/companies')
    
    from appApi.routes.employee import employee_bp
    app.register_blueprint(employee_bp, url_prefix='/')

    return app
