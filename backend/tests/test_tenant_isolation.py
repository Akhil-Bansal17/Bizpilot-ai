from fastapi.testclient import TestClient


def test_tenant_isolation_get_business(client: TestClient) -> None:
    # Setup User A with Business A
    user_a_res = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "User A",
            "email": "usera@bizpilot.ai",
            "password": "Password123!",
            "business_name": "Business A",
        },
    )
    token_a = user_a_res.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Setup User B with Business B
    user_b_res = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "User B",
            "email": "userb@bizpilot.ai",
            "password": "Password123!",
            "business_name": "Business B",
        },
    )
    token_b = user_b_res.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}
    business_b_id = user_b_res.json()["selected_business"]["id"]

    # User A tries to GET Business B
    get_res = client.get(f"/api/v1/businesses/{business_b_id}", headers=headers_a)
    assert get_res.status_code == 403
    assert "not authorized" in get_res.json()["detail"].lower()

    # User A tries to PATCH Business B
    patch_res = client.patch(
        f"/api/v1/businesses/{business_b_id}",
        json={"name": "Hacked Name"},
        headers=headers_a,
    )
    assert patch_res.status_code == 403

    # User B CAN access Business B
    get_res_b = client.get(f"/api/v1/businesses/{business_b_id}", headers=headers_b)
    assert get_res_b.status_code == 200
    assert get_res_b.json()["name"] == "Business B"


def test_tenant_isolation_header_context(client: TestClient) -> None:
    user_a_res = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "User A Context",
            "email": "usera_context@bizpilot.ai",
            "password": "Password123!",
            "business_name": "Context Business A",
        },
    )
    token_a = user_a_res.json()["access_token"]

    user_b_res = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "User B Context",
            "email": "userb_context@bizpilot.ai",
            "password": "Password123!",
            "business_name": "Context Business B",
        },
    )
    business_b_id = user_b_res.json()["selected_business"]["id"]

    # User A passes User B's business ID in X-Business-ID header
    headers = {
        "Authorization": f"Bearer {token_a}",
        "X-Business-ID": business_b_id,
    }

    # Endpoint using get_current_business dependency (e.g. business endpoint or future resource endpoint)
    res = client.get(f"/api/v1/businesses/{business_b_id}", headers=headers)
    assert res.status_code == 403
