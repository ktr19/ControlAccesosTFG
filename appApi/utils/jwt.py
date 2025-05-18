import jwt
import datetime
from flask import current_app, request, jsonify
from functools import wraps

def crear_token(employee):
    """
    Genera un token JWT para un empleado autenticado.

    Args:
        employee (Employee): Objeto del modelo Employee con la información del usuario.

    Returns:
        str: Token JWT firmado que contiene la información del empleado.
    """
    payload = {
        "employee_id": employee.employee_id,
        "email": employee.email,
        "role": employee.role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)  # Expira en 2 horas
    }

    # Codifica el payload en un token JWT usando la clave secreta del entorno Flask
    token = jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")
    return token


def token_requerido(f):
    """
    Decorador para proteger rutas que requieren autenticación JWT.

    Verifica que el token esté presente y sea válido. Si lo es,
    adjunta los datos del usuario al objeto `request`.

    Returns:
        function: La función decorada solo se ejecuta si el token es válido.
    """
    @wraps(f)
    def decorador(*args, **kwargs):
        token = None

        # Buscar token en los encabezados de la solicitud (Authorization: Bearer <token>)
        if "Authorization" in request.headers:
            parts = request.headers["Authorization"].split(" ")
            if len(parts) == 2 and parts[0] == "Bearer":
                token = parts[1]

        if not token:
            return jsonify({"message": "Token es requerido"}), 401

        try:
            # Decodificar el token usando la clave secreta y el algoritmo HS256
            datos = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
            request.user_data = datos  # Se puede acceder en las rutas protegidas como `request.user_data`
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "El token ha expirado"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Token inválido"}), 401

        return f(*args, **kwargs)
    
    return decorador
