from app.services.model_service import model_service


def test_model_status_endpoint(client):
    """Test GET /api/v1/model/status returns model details."""
    response = client.get("/api/v1/model/status")
    assert response.status_code == 200
    data = response.json()
    assert data["model_name"] == "neghani/plantvillage-mobilenetv2"
    assert data["model_loaded"] is True
    assert data["device"] in ("cpu", "cuda")
    assert data["supported_classes_count"] == 38
    assert data["available"] is True


def test_disease_classes_endpoint(client):
    """Test GET /api/v1/disease/classes returns all 38 classes."""
    response = client.get("/api/v1/disease/classes")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 38
    assert len(data["classes"]) == 38

    # Verify first and last classes match model configuration
    class_names = [c["class_name"] for c in data["classes"]]
    assert "Apple___Apple_scab" in class_names
    assert "Tomato___Early_blight" in class_names
    assert "Tomato___healthy" in class_names

    first_item = data["classes"][0]
    assert "id" in first_item
    assert "crop" in first_item
    assert "disease" in first_item
    assert "is_healthy" in first_item


def test_disease_info_existing_class(client):
    """Test GET /api/v1/disease/info/{class_name} returns structured agronomy data."""
    response = client.get("/api/v1/disease/info/Tomato___Early_blight")
    assert response.status_code == 200
    data = response.json()
    assert data["crop"] == "Tomato"
    assert data["disease"] == "Early Blight"
    assert data["is_healthy"] is False
    assert len(data["symptoms"]) > 0
    assert len(data["treatment"]["organic"]) > 0
    assert len(data["treatment"]["chemical"]) > 0
    assert len(data["prevention"]) > 0


def test_disease_info_unknown_class_fallback(client):
    """Test GET /api/v1/disease/info/{class_name} for unknown class returns safe fallback."""
    response = client.get("/api/v1/disease/info/UnknownCrop___UnknownDisease")
    assert response.status_code == 200
    data = response.json()
    assert "Treatment information is currently unavailable" in data["treatment"]["organic"][0]
