from unittest.mock import patch
from app.services.model_service import model_service


def test_predict_valid_jpeg(client, sample_leaf_image_bytes):
    """Test POST /api/v1/disease/predict with valid leaf image returns 200 with prediction."""
    response = client.post(
        "/api/v1/disease/predict",
        files={"file": ("leaf.jpg", sample_leaf_image_bytes, "image/jpeg")},
        data={"user_id": "test_farmer_1"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "prediction" in data
    assert "crop" in data["prediction"]
    assert "disease" in data["prediction"]
    assert "class_name" in data["prediction"]
    assert 0 <= data["prediction"]["confidence"] <= 100

    # Verify top alternatives (should contain 3 predictions)
    assert len(data["alternatives"]) == 3
    for alt in data["alternatives"]:
        assert "crop" in alt
        assert "disease" in alt
        assert "confidence" in alt

    # Verify disease information
    assert "disease_information" in data
    assert "symptoms" in data["disease_information"]
    assert "treatment" in data["disease_information"]

    # Verify performance and metadata
    assert data["inference_time_ms"] > 0
    assert "timestamp" in data
    assert "disclaimer" in data


def test_predict_valid_png(client, sample_png_image_bytes):
    """Test POST /api/v1/disease/predict with valid PNG image."""
    response = client.post(
        "/api/v1/disease/predict",
        files={"file": ("leaf.png", sample_png_image_bytes, "image/png")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["prediction"]["confidence"] > 0


def test_predict_empty_file(client, empty_file_bytes):
    """Test POST /api/v1/disease/predict rejects empty file with 400."""
    response = client.post(
        "/api/v1/disease/predict",
        files={"file": ("empty.jpg", empty_file_bytes, "image/jpeg")},
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_predict_corrupted_file(client, corrupted_file_bytes):
    """Test POST /api/v1/disease/predict rejects corrupted file with 400."""
    response = client.post(
        "/api/v1/disease/predict",
        files={"file": ("corrupt.jpg", corrupted_file_bytes, "image/jpeg")},
    )
    assert response.status_code == 400
    assert "corrupted" in response.json()["detail"].lower() or "unreadable" in response.json()["detail"].lower()


def test_predict_unsupported_format(client):
    """Test POST /api/v1/disease/predict rejects non-image formats (e.g. text/plain) with 400/415."""
    fake_text_bytes = b"This is just a plain text file, not an image."
    response = client.post(
        "/api/v1/disease/predict",
        files={"file": ("notes.txt", fake_text_bytes, "text/plain")},
    )
    assert response.status_code in (400, 415)


def test_predict_oversized_file(client, oversized_file_bytes):
    """Test POST /api/v1/disease/predict rejects oversized file (>10MB) with 413."""
    response = client.post(
        "/api/v1/disease/predict",
        files={"file": ("huge.jpg", oversized_file_bytes, "image/jpeg")},
    )
    assert response.status_code == 413
    assert "exceeds" in response.json()["detail"].lower()


def test_uncertainty_handling_mocked(client, sample_leaf_image_bytes):
    """Test that low confidence predictions (< 50%) are flagged as uncertain with warning."""
    low_confidence_results = [
        ("Tomato___Early_blight", 38.5),
        ("Tomato___Late_blight", 32.1),
        ("Potato___Early_blight", 15.4),
    ]
    with patch.object(model_service, "predict", return_value=(low_confidence_results, 25.0)):
        response = client.post(
            "/api/v1/disease/predict",
            files={"file": ("blurry.jpg", sample_leaf_image_bytes, "image/jpeg")},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["is_uncertain"] is True
        assert data["uncertainty_warning"] is not None
        assert "confidence is low" in data["uncertainty_warning"].lower()
        assert data["prediction"]["confidence"] == 38.5


def test_model_unavailable_returns_503(client, sample_leaf_image_bytes):
    """Test that 503 is returned when model_service.is_loaded is False."""
    with patch.object(model_service, "is_loaded", False):
        response = client.post(
            "/api/v1/disease/predict",
            files={"file": ("leaf.jpg", sample_leaf_image_bytes, "image/jpeg")},
        )
        assert response.status_code == 503
        assert "unavailable" in response.json()["detail"].lower()
