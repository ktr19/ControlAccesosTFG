from appApi.extension import db
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship


class Employee(db.Model):
    __tablename__ = "employees"
    
    employee_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.company_id'), nullable=False)
    first_name = db.Column(db.String(255), nullable=False)
    last_name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default='employee', nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    is_locked = db.Column(db.Boolean, default=False)
    last_login = db.Column(db.DateTime, nullable=True)
    creation_date = db.Column(db.DateTime, default=func.now())
    entry_date = db.Column(db.DateTime, nullable=True)
    exit_date = db.Column(db.DateTime, nullable=True)
    qr_code = db.Column(db.String(255), nullable=True)


    company = relationship('Company', backref='employees')

    def __repr__(self):
        return f"<Employee {self.first_name} {self.last_name}, Role: {self.role}>"
