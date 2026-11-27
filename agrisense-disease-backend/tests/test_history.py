def test_history_creation_and_retrieval(client, sample_leaf_image_bytes):
    """Test that a prediction creates a history record that can be retrieved via GET /history."""
    # 1. Trigger prediction
    client.post(
        "/api/v1/disease/predict",
        files={"file": ("leaf.jpg", sample_leaf_image_bytes, "image/jpeg")},
        data={"user_id": "farmer_99"},
    )

    # 2. Query history
    response = client.get("/api/v1/disease/history")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert len(data["items"]) >= 1

    first_item = data["items"][0]
    assert first_item["user_id"] == "farmer_99"
    assert "crop_name" in first_item
    assert "disease_name" in first_item
    assert "confidence" in first_item
    assert "timestamp" in first_item
    assert "id" in first_item


def test_history_filter_by_crop(client, sample_leaf_image_bytes):
    """Test filtering history by crop parameter."""
    client.post(
        "/api/v1/disease/predict",
        files={"file": ("leaf.jpg", sample_leaf_image_bytes, "image/jpeg")},
    )

    # Search with a non-matching crop
    response = client.get("/api/v1/disease/history?crop=NonExistentExoticCrop")
    assert response.status_code == 200
    assert response.json()["total"] == 0


def test_history_get_by_id(client, sample_leaf_image_bytes):
    """Test GET /api/v1/disease/history/{id}."""
    post_res = client.post(
        "/api/v1/disease/predict",
        files={"file": ("leaf.jpg", sample_leaf_image_bytes, "image/jpeg")},
    )
    assert post_res.status_code == 200

    history_res = client.get("/api/v1/disease/history")
    item_id = history_res.json()["items"][0]["id"]

    # Fetch by id
    detail_res = client.get(f"/api/v1/disease/history/{item_id}")
    assert detail_res.status_code == 200
    assert detail_res.json()["id"] == item_id


def test_history_get_nonexistent_id_returns_404(client):
    """Test GET with unknown ID returns 404."""
    response = client.get("/api/v1/disease/history/999999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_history_delete_by_id(client, sample_leaf_image_bytes):
    """Test DELETE /api/v1/disease/history/{id} deletes record."""
    client.post(
        "/api/v1/disease/predict",
        files={"file": ("leaf.jpg", sample_leaf_image_bytes, "image/jpeg")},
    )
    history_res = client.get("/api/v1/disease/history")
    item_id = history_res.json()["items"][0]["id"]

    # Delete
    del_res = client.delete(f"/api/v1/disease/history/{item_id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True
    assert del_res.json()["deleted_id"] == item_id

    # Verify 404 on subsequent get
    get_again = client.get(f"/api/v1/disease/history/{item_id}")
    assert get_again.status_code == 404


def test_history_delete_nonexistent_returns_404(client):
    """Test DELETE with unknown ID returns 404."""
    response = client.delete("/api/v1/disease/history/999999")
    assert response.status_code == 404
