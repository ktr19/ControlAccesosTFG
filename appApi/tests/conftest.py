import pytest
from appApi import create_app

# Parchea el decorador ANTES de que la app se cree
@pytest.fixture
def app(monkeypatch):
    monkeypatch.setattr("appApi.routes.employee.token_requerido", lambda f: f)
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SECRET_KEY": "test-secret",
    })
    return app

@pytest.fixture
def client(app):
    return app.test_client()
