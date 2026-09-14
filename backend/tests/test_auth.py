from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import verify_password
from app.models.user import User


def test_register_success(client: TestClient) -> None:
    payload = {
        "full_name": "Test Manager",
        "email": "manager@bizpilot.ai",
        "password": "SecurePassword123",
        "business_name": "Tasty Bites Cafe",
        "currency": "INR",
        "timezone": "Asia/Kolkata",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "manager@bizpilot.ai"
    assert data["user"]["full_name"] == "Test Manager"
    assert data["selected_business"]["name"] == "Tasty Bites Cafe"
    assert data["selected_business"]["role"] == "owner"


def test_register_duplicate_email(client: TestClient) -> None:
    payload = {
        "full_name": "Duplicate User",
        "email": "duplicate@bizpilot.ai",
        "password": "SecurePassword123",
        "business_name": "Duplicate Business",
    }
    res1 = client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 400
    assert "already registered" in res2.json()["detail"].lower()


def test_password_hashing(client: TestClient, db_session: Session) -> None:
    payload = {
        "full_name": "Security User",
        "email": "security@bizpilot.ai",
        "password": "MySecretPassword123",
    }
    client.post("/api/v1/auth/register", json=payload)

    user = db_session.query(User).filter(User.email == "security@bizpilot.ai").first()
    assert user is not None
    assert user.password_hash != "MySecretPassword123"
    assert verify_password("MySecretPassword123", user.password_hash)


def test_login_success(client: TestClient) -> None:
    # Register user first
    reg_payload = {
        "full_name": "Login User",
        "email": "login@bizpilot.ai",
        "password": "LoginPassword123",
    }
    client.post("/api/v1/auth/register", json=reg_payload)

    # Login
    login_payload = {
        "email": "login@bizpilot.ai",
        "password": "LoginPassword123",
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "login@bizpilot.ai"


def test_login_invalid_credentials(client: TestClient) -> None:
    payload = {
        "email": "nonexistent@bizpilot.ai",
        "password": "WrongPassword123",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401
    assert "invalid email or password" in response.json()["detail"].lower()


def test_get_me_authenticated(client: TestClient) -> None:
    reg_payload = {
        "full_name": "Me User",
        "email": "me@bizpilot.ai",
        "password": "MePassword123",
        "business_name": "Me Cafe",
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    token = reg_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "me@bizpilot.ai"
    assert len(data["businesses"]) == 1
    assert data["businesses"][0]["name"] == "Me Cafe"


def test_get_me_unauthenticated(client: TestClient) -> None:
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
