from flask import Blueprint, jsonify, request
from marshmallow import ValidationError
from sqlalchemy import String, cast, func
from werkzeug.security import check_password_hash, generate_password_hash
from appApi import db
from appApi.models.employee import Employee
from appApi.utils.jwt import crear_token, token_requerido
from appApi.schemas.EmployeeSchema import EmployeeSchema

employee_bp = Blueprint("employee_bp", __name__)
employee_schema = EmployeeSchema()
employee_schema_partial = EmployeeSchema(partial=True)  # Para update (validar parcialmente)


@employee_bp.route("/employees", methods=["POST"])
@token_requerido
def create_employee():
    json_data = request.json
    try:
        employee_data = employee_schema.load(json_data)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    if Employee.query.filter_by(email=employee_data["email"]).first():
        return jsonify({"message": "El correo ya está registrado"}), 400

    password_hash = generate_password_hash(employee_data["password"])

    employee = Employee(
        company_id=employee_data["company_id"],
        office_id=employee_data.get("office_id"),
        first_name=employee_data["first_name"],
        last_name=employee_data["last_name"],
        email=employee_data["email"],
        password_hash=password_hash,
        role=employee_data.get("role", "employee"),

    )
    db.session.add(employee)
    db.session.commit()

    result = employee_schema.dump(employee)
    return jsonify({"message": "Empleado creado", "employee": result}), 201


@employee_bp.route("/login", methods=["POST"])
def login_employee():
    data = request.json
    employee = Employee.query.filter_by(email=data.get("email")).first()

    if not employee:
        return jsonify({"message": "Usuario no encontrado"}), 404

    if not check_password_hash(employee.password_hash, data.get("password", "")):
        return jsonify({"message": "Contraseña incorrecta"}), 401

    employee.last_login = func.now()
    db.session.commit()

    token = crear_token(employee)

    result = employee_schema.dump(employee)
    return jsonify({
        "message": "Login exitoso",
        "token": token,
        "employee": result
    }), 200


@employee_bp.route("/employees", methods=["GET"])
@token_requerido
def get_all_employees():
    employees = Employee.query.all()
    result = employee_schema.dump(employees, many=True)
    return jsonify(result), 200


@employee_bp.route("/employees/<int:employee_id>", methods=["PUT"])
@token_requerido
def update_employee(employee_id):
    emp = Employee.query.get_or_404(employee_id)
    json_data = request.json

    try:
        # Validación parcial para update
        employee_data = employee_schema_partial.load(json_data)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    # Actualizar campos permitidos
    emp.first_name = employee_data.get("first_name", emp.first_name)
    emp.last_name = employee_data.get("last_name", emp.last_name)
    emp.role = employee_data.get("role", emp.role)
    emp.is_active = employee_data.get("is_active", emp.is_active)
    emp.office_id = employee_data.get("office_id", emp.office_id)

    if "password" in employee_data:
        # Usar generate_password_hash para que sea compatible
        emp.password_hash = generate_password_hash(employee_data["password"])

    db.session.commit()
    result = employee_schema.dump(emp)
    return jsonify({"message": "Empleado actualizado", "employee": result}), 200


@employee_bp.route("/employees/<int:employee_id>", methods=["DELETE"])
@token_requerido
def delete_employee(employee_id):
    emp = Employee.query.get_or_404(employee_id)
    db.session.delete(emp)
    db.session.commit()
    return jsonify({"message": "Empleado eliminado"}), 200


@employee_bp.route("/companies/<int:company_id>/employees", methods=["GET"])
@token_requerido
def get_employees_by_company(company_id):
    employees = Employee.query.filter_by(company_id=company_id).all()

    if not employees:
        return jsonify({"message": "No se encontraron empleados para esta compañía"}), 404

    result = employee_schema.dump(employees, many=True)
    return jsonify(result), 200


@employee_bp.route("/employees/<int:employee_id>/qr", methods=["POST"])
@token_requerido
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
@token_requerido
def activate_employee_by_qr():
    data = request.json
    qr_code = data.get("qr_code")
    employee_id = data.get("employee_id")
    company_id = data.get("company_id")

    if not qr_code or not employee_id or not company_id:
        return jsonify({"message": "QR code, ID de empleado y compañía son requeridos"}), 400

    employee = Employee.query.filter_by(
        qr_code=qr_code,
        employee_id=employee_id,
        company_id=company_id
    ).first()

    if not employee:
        return jsonify({"message": "Datos inválidos o QR no coincide"}), 404

    employee.is_active = not employee.is_active
    db.session.commit()

    return jsonify({
        "message": f"Empleado {'activado' if employee.is_active else 'desactivado'}",
        "employee_id": employee.employee_id,
        "nombre": employee.first_name,
        "estado": "activo" if employee.is_active else "inactivo"
    }), 200


@employee_bp.route("/employees/<int:employee_id>/change_password", methods=["PUT"])
@token_requerido
def change_password(employee_id):
    emp = Employee.query.get_or_404(employee_id)
    data = request.json

    new_password = data.get("new_password")
    if not new_password:
        return jsonify({"message": "Nueva contraseña es requerida"}), 400

    if len(new_password) < 8:
        return jsonify({"message": "La nueva contraseña debe tener al menos 8 caracteres"}), 400

    # Aquí podrías agregar validación de complejidad similar al schema, si quieres
    emp.password_hash = generate_password_hash(new_password)
    db.session.commit()

    return jsonify({"message": "Contraseña cambiada exitosamente"}), 200


@employee_bp.route("/employees/<int:employee_id>", methods=["GET"])
@token_requerido
def get_employee_by_id(employee_id):
    employee = Employee.query.get_or_404(employee_id)
    result = employee_schema.dump(employee)
    return jsonify(result), 200


@employee_bp.route("/employees/search", methods=["GET"])
@token_requerido
def search_employees():
    query = request.args.get("query", "").strip()

    if not query:
        return jsonify({"message": "Debes ingresar un término de búsqueda"}), 400

    employees = Employee.query.filter(
        (cast(Employee.employee_id, String).ilike(f"%{query}%")) |
        (Employee.first_name.ilike(f"%{query}%")) |
        (Employee.email.ilike(f"%{query}%"))
    ).all()

    if not employees:
        return jsonify({"message": "No se encontraron empleados con ese criterio"}), 404

    result = employee_schema.dump(employees, many=True)
    return jsonify(result), 200


@employee_bp.route("/dashboard-login", methods=["POST"])
def login_admin():
    data = request.json
    employee = Employee.query.filter_by(email=data.get("email")).first()

    if not employee:
        return jsonify({"message": "Usuario no encontrado"}), 404

    if employee.role != "admin":
        return jsonify({"message": "Acceso denegado: Solo administradores pueden ingresar"}), 403

    if not check_password_hash(employee.password_hash, data.get("password", "")):
        return jsonify({"message": "Contraseña incorrecta"}), 401

    employee.last_login = func.now()
    db.session.commit()

    token = crear_token(employee)

    return jsonify({
        "message": "Login exitoso",
        "token": token,
        "employee_id": employee.employee_id,
        "email": employee.email,
        "role": employee.role,
        "company_id": employee.company_id
    }), 200
