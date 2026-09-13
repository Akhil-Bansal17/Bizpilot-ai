from unittest.mock import patch

from fastapi import status
from fastapi.testclient import TestClient

from app.core.exceptions import NotFoundException


def test_health_endpoint(client: TestClient):
    """Asserts GET /api/v1/health returns 200 with service metadata."""
    response = client.get("/api/v1/health")
    assert response.status_code == status.HTTP_200_OK
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["service"] == "bizpilot-ai-backend"
    assert "version" in payload


def test_db_health_endpoint_success(client: TestClient):
    """Asserts GET /api/v1/health/db returns 200 when database ping succeeds."""
    with patch("app.api.v1.endpoints.health.check_db_connection", return_value=True):
        response = client.get("/api/v1/health/db")
        assert response.status_code == status.HTTP_200_OK
        payload = response.json()
        assert payload["status"] == "ok"
        assert payload["database"] == "reachable"


def test_db_health_endpoint_failure(client: TestClient):
    """Asserts GET /api/v1/health/db returns 503 degraded when database connection fails."""
    with patch("app.api.v1.endpoints.health.check_db_connection", return_value=False):
        response = client.get("/api/v1/health/db")
        assert response.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
        payload = response.json()
        assert payload["status"] == "degraded"
        assert payload["database"] == "unreachable"


def test_app_exception_envelope_formatting(client: TestClient):
    """Asserts domain exceptions return the standardized error JSON shape."""
    from app.main import app

    @app.get("/api/v1/test-error-trigger")
    def trigger_error():
        raise NotFoundException("Requested entity was not found.")

    response = client.get("/api/v1/test-error-trigger")
    assert response.status_code == status.HTTP_404_NOT_FOUND
    payload = response.json()
    assert "error" in payload
    assert payload["error"]["code"] == "not_found"
    assert payload["error"]["message"] == "Requested entity was not found."
