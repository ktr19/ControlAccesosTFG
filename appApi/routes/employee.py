from hashlib import scrypt
from flask import Blueprint, jsonify, request
from sqlalchemy import func
from appApi import db  
from appApi.models.employee import  Employee
from werkzeug.security import check_password_hash,generate_password_hash
employee_bp = Blueprint("employee_bp", __name__)

@employee_bp.route("/employees", methods=["POST"])
def create_employee():
    data = request.json
    if Employee.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "El correo ya está registrado"}), 400

    password_hash = generate_password_hash(data["password"])  # Correcto

    employee = Employee(
        company_id=data["company_id"],
        office_id=data.get("office_id"),
        first_name=data["first_name"],
        last_name=data["last_name"],
        email=data["email"],
        password_hash=password_hash,
        role=data.get("role", "employee"),
        entry_date=data.get("entry_date"),
        exit_date=data.get("exit_date"),
    )
    db.session.add(employee)
    db.session.commit()

    return jsonify({"message": "Empleado creado", "employee_id": employee.employee_id}), 201



@employee_bp.route("/login", methods=["POST"])
def login_employee():
    data = request.json
    employee = Employee.query.filter_by(email=data["email"]).first()

    if not employee:
        return jsonify({"message": "Usuario no encontrado"}), 404

    # Comparar la contraseña proporcionada con el hash almacenado usando check_password_hash
    if not check_password_hash(employee.password_hash, data["password"]):
        return jsonify({"message": "Contraseña incorrecta"}), 401

    # Actualizar la fecha de último inicio de sesión
    employee.last_login = func.now()
    db.session.commit()

    return jsonify({
        "message": "Login exitoso",
        "employee_id": employee.employee_id,
        "company_id": employee.company_id,
        "office_id": employee.office_id,
        "first_name": employee.first_name,
        "last_name": employee.last_name,
        "email": employee.email,
        "role": employee.role,
        "is_active": employee.is_active,
        "is_locked": employee.is_locked,
        "last_login": employee.last_login,
        "creation_date": employee.creation_date,
        "entry_date": employee.entry_date,
        "exit_date": employee.exit_date,
        "qr_code": employee.qr_code
    }), 200


@employee_bp.route("/employees", methods=["GET"])
def get_all_employees():
    employees = Employee.query.all()
    result = []

    for emp in employees:
        result.append({
            "employee_id": emp.employee_id,
            "first_name": emp.first_name,
            "last_name": emp.last_name,
            "email": emp.email,
            "role": emp.role,
            "is_active": emp.is_active,
            "company_id": emp.company_id,
            "office_id": emp.office_id
        })
    
    return jsonify(result)

@employee_bp.route("/employees/<int:employee_id>", methods=["PUT"])
def update_employee(employee_id):
    emp = Employee.query.get_or_404(employee_id)
    data = request.json

    emp.first_name = data.get("first_name", emp.first_name)
    emp.last_name = data.get("last_name", emp.last_name)
    emp.role = data.get("role", emp.role)
    emp.is_active = data.get("is_active", emp.is_active)
    emp.office_id = data.get("office_id", emp.office_id)

    if "password" in data:
        emp.password_hash = scrypt.generate_password_hash(data["password"]).decode("utf-8")

    db.session.commit()
    return jsonify({"message": "Empleado actualizado"})

@employee_bp.route("/employees/<int:employee_id>", methods=["DELETE"])
def delete_employee(employee_id):
    emp = Employee.query.get_or_404(employee_id)
    db.session.delete(emp)
    db.session.commit()
    return jsonify({"message": "Empleado eliminado"})

@employee_bp.route("/companies/<int:company_id>/employees", methods=["GET"])
def get_employees_by_company(company_id):
    employees = Employee.query.filter_by(company_id=company_id).all()

    if not employees:
        return jsonify({"message": "No se encontraron empleados para esta compañía"}), 404

    result = []
    for emp in employees:
        result.append({
            "employee_id": emp.employee_id,
            "first_name": emp.first_name,
            "last_name": emp.last_name,
            "email": emp.email,
            "role": emp.role,
            "is_active": emp.is_active,
            "is_locked": emp.is_locked,
            "office_id": emp.office_id,
            "qr_code": emp.qr_code
        })

    return jsonify(result), 200

@employee_bp.route("/employees/<int:employee_id>/qr", methods=["POST"])
def save_qr_for_employee(employee_id):
    employee = Employee.query.get_or_404(employee_id)
    data = request.json
    qr_code = data.get("qr_code")

    if not qr_code:
        return jsonify({"message": "QR code es requerido"}), 400

    employee.qr_code = qr_code
    db.session.commit()
    return jsonify({"message": "QR guardado correctamente"}), 200

@employee_bp.route("/employees/activate", methods=["POST"])
def activate_employee_by_qr():
    data = request.json
    qr_code = data.get("qr_code")

    if not qr_code:
        return jsonify({"message": "QR code es requerido"}), 400

    employee = Employee.query.filter_by(qr_code=qr_code).first()

    if not employee:
        return jsonify({"message": "QR inválido"}), 404

    employee.is_active = True
    db.session.commit()

    return jsonify({
        "message": "Empleado activado",
        "employee_id": employee.employee_id,
        "nombre": employee.first_name
    }), 200

@employee_bp.route("/employees/<int:employee_id>/change_password", methods=["PUT"])
def change_password(employee_id):
    # Buscar al empleado en la base de datos usando el ID proporcionado
    emp = Employee.query.get_or_404(employee_id)
    data = request.json

    # Verificar que la nueva contraseña esté en el request
    new_password = data.get("new_password")
    if not new_password:
        return jsonify({"message": "Nueva contraseña es requerida"}), 400

    # Validar que la nueva contraseña tenga una longitud mínima (por ejemplo, 8 caracteres)
    if len(new_password) < 8:
        return jsonify({"message": "La nueva contraseña debe tener al menos 8 caracteres"}), 400

    # Generar el hash de la nueva contraseña
    password_hash = scrypt.generate_password_hash(new_password).decode("utf-8")

    # Actualizar el hash de la contraseña en el registro del empleado
    emp.password_hash = password_hash
    db.session.commit()

    return jsonify({"message": "Contraseña cambiada exitosamente"}), 200