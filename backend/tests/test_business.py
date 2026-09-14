import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def auth_headers(client: TestClient) -> dict[str, str]:
    reg_payload = {
        "full_name": "Business Owner",
        "email": "owner@bizpilot.ai",
        "password": "OwnerPassword123",
        "business_name": "Primary Business",
    }
    res = client.post("/api/v1/auth/register", json=reg_payload)
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_create_and_list_businesses(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    # Create a secondary business
    create_payload = {
        "name": "Secondary Bistro",
        "business_type": "restaurant_cafe",
        "currency": "USD",
        "timezone": "UTC",
    }
    create_res = client.post(
        "/api/v1/businesses", json=create_payload, headers=auth_headers
    )
    assert create_res.status_code == 201
    created_data = create_res.json()
    assert created_data["name"] == "Secondary Bistro"
    assert created_data["role"] == "owner"

    # List businesses
    list_res = client.get("/api/v1/businesses", headers=auth_headers)
    assert list_res.status_code == 200
    businesses = list_res.json()
    assert len(businesses) == 2
    names = [b["name"] for b in businesses]
    assert "Primary Business" in names
    assert "Secondary Bistro" in names


def test_get_business_by_id(client: TestClient, auth_headers: dict[str, str]) -> None:
    list_res = client.get("/api/v1/businesses", headers=auth_headers)
    business_id = list_res.json()[0]["id"]

    get_res = client.get(f"/api/v1/businesses/{business_id}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == business_id


def test_update_business_settings_by_owner(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    list_res = client.get("/api/v1/businesses", headers=auth_headers)
    business_id = list_res.json()[0]["id"]

    patch_payload = {
        "name": "Updated Primary Business",
        "currency": "EUR",
    }
    patch_res = client.patch(
        f"/api/v1/businesses/{business_id}", json=patch_payload, headers=auth_headers
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["name"] == "Updated Primary Business"
    assert patch_res.json()["currency"] == "EUR"
