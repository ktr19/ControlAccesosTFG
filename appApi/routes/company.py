from flask import Blueprint, jsonify, request
from appApi import db  
from appApi.models.Company import Company

company_bp = Blueprint('company_bp', __name__)

@company_bp.route("/companies", methods=["GET"])
def get_all_companies():
    companies = Company.query.all()
    result = []

    for company in companies:
        result.append({
            "company_id": company.company_id,
            "name": company.name,
            "acronym": company.acronym,
            "nif": company.nif,
            "creation_date": company.creation_date
        })

    return jsonify(result)


@company_bp.route("/companies", methods=["POST"])
def create_company():
    data = request.json

    if Company.query.filter_by(nif=data["nif"]).first():
        return jsonify({"message": "NIF ya registrado"}), 400

    company = Company(
        name=data["name"],
        acronym=data.get("acronym"),
        nif=data["nif"]
    )
    db.session.add(company)
    db.session.commit()

    return jsonify({
        "message": "Compañía creada",
        "company_id": company.company_id
    }), 201

@company_bp.route("/companies/<int:company_id>", methods=["GET"])
def get_company(company_id):
    company = Company.query.get_or_404(company_id)

    return jsonify({
        "company_id": company.company_id,
        "name": company.name,
        "acronym": company.acronym,
        "nif": company.nif,
        "creation_date": company.creation_date
    })

@company_bp.route("/companies/<int:company_id>", methods=["DELETE"])
def delete_company(company_id):
    company = Company.query.get_or_404(company_id)
    db.session.delete(company)
    db.session.commit()
    return jsonify({"message": "Compañía eliminada"})

