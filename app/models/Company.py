from app import db 

class Company(db.Model):
    __tablename__ = 'companies'

    company_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    acronym = db.Column(db.String(50))
    nif = db.Column(db.String(20), nullable=False, unique=True)
    creation_date = db.Column(db.DateTime, nullable=False, server_default=db.func.now())

    def __repr__(self):
        return f"<Company {self.name} ({self.acronym})>"
