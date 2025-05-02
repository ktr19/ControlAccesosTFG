from appApi.routes.company import company_bp

def register_blueprints(app):

    app.register_blueprint(company_bp, url_prefix='/')  
