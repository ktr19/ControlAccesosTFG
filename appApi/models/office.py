from appApi.extension import db
from sqlalchemy.orm import relationship
from appApi.models.Company import Company

class Office(db.Model):
    __tablename__ = "offices"
    
    office_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.company_id'), nullable=False)
    address = db.Column(db.String(255), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    country = db.Column(db.String(100), nullable=True)
    office_phone = db.Column(db.String(20), nullable=True)
    creation_date = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    

    company = relationship("Company", backref="offices") 
    def __repr__(self):
        return f"<Office {self.address}, {self.city}, {self.country}>"
