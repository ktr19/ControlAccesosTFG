from flask import Blueprint, jsonify
from app import db  
from app.models.Company import Company

company_bp = Blueprint('company_bp', __name__)

@company_bp.route('/', methods=['GET'])
def get_companies():
    try:
        companies = Company.query.all() 
        
        if not companies:
            return jsonify({'message': 'No se encontraron compañías.'}), 404

        return jsonify([
            {'company_id': company.company_id, 'name': company.name, 'acronym': company.acronym, 'nif': company.nif}
            for company in companies
        ])
    except Exception as e:
        return jsonify({'message': 'Error al obtener compañías', 'error': str(e)}), 500
