def test_health_endpoint(client):
    """Test GET /api/v1/health returns 200 with healthy status and metadata."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("healthy", "degraded")
    assert "AgriSense" in data["app_name"]
    assert "version" in data
    assert "timestamp" in data
    assert "model_loaded" in data


def test_root_redirect(client):
    """Test root URL redirects to /docs Swagger UI."""
    response = client.get("/", follow_redirects=False)
    assert response.status_code in (307, 302)
    assert response.headers["location"] == "/docs"
