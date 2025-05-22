from datetime import datetime
import json
import pytest
from unittest.mock import patch
from appApi.models.employee import Employee
from datetime import datetime
from types import SimpleNamespace

# Fixture global para parchear el decorador token_requerido (que protege rutas)
@pytest.fixture(autouse=True)
def patch_token_required(monkeypatch):
    monkeypatch.setattr("appApi.utils.jwt.token_requerido", lambda f: f)

# Helper para headers con token falso
def auth_header(token="testtoken"):
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def new_employee_data():
    return {
        "company_id": 1,
        "first_name": "Juan",
        "last_name": "Perez",
        "email": "juan@example.com",
        "password": "Secure123",
        "role": "employee"
    }


@pytest.fixture
def login_data():
    return {"email": "juan@example.com", "password": "securepass123"}

def test_create_employee_success(client, app, new_employee_data, monkeypatch):
    # Mock token creation para login o autorización
    monkeypatch.setattr("appApi.routes.employee.crear_token", lambda emp: "fake-token")

    class QueryFilterMock:
        def first(self):
            return None  # No existe email duplicado

    class QueryMock:
        def filter_by(self, **kwargs):
            return QueryFilterMock()

    with app.app_context():
        monkeypatch.setattr("appApi.models.employee.Employee.query", QueryMock())

        # Aquí simulamos pasar un token válido
        headers = {
            "Authorization": "Bearer faketoken"
        }

        response = client.post("/employees", json=new_employee_data, headers=headers)

        print(response.get_json())  # Para ver detalles si falla
        assert response.status_code == 201
        json_response = response.get_json()
        assert json_response["message"] == "Empleado creado"
        assert json_response["employee"]["email"] == new_employee_data["email"]



def test_login_employee_success(client, app, login_data, monkeypatch):
    # Mock del objeto Employee con atributos necesarios
    class EmployeeMock:
        def __init__(self):
            self.employee_id = 1
            self.first_name = "Juan"
            self.last_name = "Perez"
            self.email = login_data["email"]
            self.password_hash = "hashed"
            self.role = "admin"  # debe ser admin para pasar el check
            self.company_id = 1
            self.last_login = datetime.utcnow()  # datetime real para evitar error

    employee_mock = EmployeeMock()

    class QueryFilterMock:
        def filter_by(self, **kwargs):
            class FirstMock:
                def first(self_inner):
                    return employee_mock
            return FirstMock()

    with app.app_context():
        # Mockear consulta a BD
        monkeypatch.setattr("appApi.models.employee.Employee.query", QueryFilterMock())
        # Mockear función check_password_hash para que siempre devuelva True
        monkeypatch.setattr("appApi.routes.employee.check_password_hash", lambda pw_hash, pw: True)
        # Mockear func.now() para que devuelva datetime real y evitar error en la serialización
        monkeypatch.setattr("appApi.routes.employee.func.now", lambda: datetime.utcnow())

        response = client.post("/dashboard-login", json=login_data)

    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "Login exitoso"
    assert data["email"] == login_data["email"]
    assert data["role"] == "admin"

def test_change_password_success(client, app, monkeypatch):
    employee_mock = Employee(
        employee_id=1,
        first_name="Nombre1",
        last_name="Perez",
        email="kvillarreal@test.com",
        password_hash="old_hash"
    )

    class QueryMock:
        def get_or_404(self, id):
            return employee_mock

    with app.app_context():
        monkeypatch.setattr("appApi.models.employee.Employee.query", QueryMock())

        # Aquí va la llamada al cliente (request)
        response = client.put(
            "/employees/1/change_password",
            json={"new_password": "P2sswor_d"},
            headers=auth_header()
        )

    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "Contraseña cambiada exitosamente"

def test_search_employees_by_query_and_is_active(client, app, monkeypatch):
    employee_list = [
        Employee(
            employee_id=1,
            first_name="Juan",
            email="kvillarreal@test.com",
            is_active=True,
            password_hash="hash"
        )
    ]

    class QueryMock:
        def filter(self, *args):
            return self
        def all(self):
            return employee_list

    with app.app_context():
        monkeypatch.setattr("appApi.models.employee.Employee.query", QueryMock())
        monkeypatch.setattr("appApi.schemas.EmployeeSchema.EmployeeSchema.dump", lambda self, obj, many=False: [{"first_name": "Nombre1"}])

        response = client.get("/employees/search?query=Juan&is_active=true", headers=auth_header())
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) == 1
        assert data[0]["first_name"] == "Nombre1"




def test_delete_employee_success(client, app):
    employee_mock = Employee(employee_id=1)

    class FakeQuery:
        def get_or_404(self, id):
            return employee_mock

    with app.app_context():
        # Parchea query con get_or_404
        with patch("appApi.models.employee.Employee.query", new=FakeQuery()):
            # Parchea session.delete y session.commit para que no hagan nada real
            with patch("appApi.db.session.delete", lambda emp: None):
                with patch("appApi.db.session.commit", lambda: None):
                    response = client.delete("/employees/1", headers=auth_header())
                    assert response.status_code == 200
                    data = response.get_json()
                    assert data["message"] == "Empleado eliminado"
