# AgriSense Plant Disease Detection Backend — API Documentation

This document describes all REST API endpoints exposed by the AgriSense Disease Detection Backend.

- **Base URL (Local):** `http://localhost:8000/api/v1`
- **Interactive Swagger Documentation:** `http://localhost:8000/docs`
- **ReDoc Documentation:** `http://localhost:8000/redoc`

---

## Endpoint Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check and operational status |
| `GET` | `/model/status` | Model loading status, hardware device, and class count |
| `GET` | `/disease/classes` | Complete list of all 38 supported disease classes |
| `GET` | `/disease/info/{class_name}` | Agronomic information (symptoms, causes, treatments) |
| `POST` | `/disease/predict` | Classify plant disease from uploaded leaf image |
| `GET` | `/disease/history` | List detection history with pagination and filtering |
| `GET` | `/disease/history/{id}` | Retrieve a specific detection history record |
| `DELETE` | `/disease/history/{id}` | Delete a specific detection history record |

---

## 1. System Health

### `GET /api/v1/health`
Checks whether the service is up and if the AI model is ready.

#### Request Example
```bash
curl -X GET "http://localhost:8000/api/v1/health"
```

#### Response (`200 OK`)
```json
{
  "status": "healthy",
  "app_name": "AgriSense Disease Detection API",
  "version": "1.0.0",
  "environment": "development",
  "model_loaded": true,
  "timestamp": "2026-11-17T16:30:00.000000Z"
}
```

---

## 2. Model Operational Status

### `GET /api/v1/model/status`
Returns information regarding the loaded Hugging Face MobileNetV2 model.

#### Request Example
```bash
curl -X GET "http://localhost:8000/api/v1/model/status"
```

#### Response (`200 OK`)
```json
{
  "model_name": "neghani/plantvillage-mobilenetv2",
  "model_loaded": true,
  "device": "cpu",
  "supported_classes_count": 38,
  "available": true
}
```

---

## 3. Supported Disease Classes

### `GET /api/v1/disease/classes`
Returns all 38 plant disease and healthy classes recognized by the model.

#### Request Example
```bash
curl -X GET "http://localhost:8000/api/v1/disease/classes"
```

#### Response (`200 OK`)
```json
{
  "total": 38,
  "classes": [
    {
      "id": 0,
      "class_name": "Apple___Apple_scab",
      "crop": "Apple",
      "disease": "Apple Scab",
      "is_healthy": false
    },
    {
      "id": 29,
      "class_name": "Tomato___Early_blight",
      "crop": "Tomato",
      "disease": "Early Blight",
      "is_healthy": false
    },
    {
      "id": 37,
      "class_name": "Tomato___healthy",
      "crop": "Tomato",
      "disease": "Healthy Foliage",
      "is_healthy": true
    }
  ]
}
```

---

## 4. Disease Agronomic Knowledge

### `GET /api/v1/disease/info/{class_name}`
Retrieves verified symptoms, causes, organic/chemical/cultural treatments, and prevention guidelines for a model class.

#### Request Example
```bash
curl -X GET "http://localhost:8000/api/v1/disease/info/Tomato___Early_blight"
```

#### Response (`200 OK`)
```json
{
  "crop": "Tomato",
  "disease": "Early Blight",
  "class_name": "Tomato___Early_blight",
  "is_healthy": false,
  "description": "Early blight is a common fungal disease caused by Alternaria solani...",
  "symptoms": [
    "Dark brown to black spots with concentric rings (target spot appearance)",
    "Yellow chlorotic halos surrounding lesions",
    "Starts on mature lower leaves and progresses upwards"
  ],
  "causes": [
    "Fungus Alternaria solani",
    "Overwintering in solanaceous plant residue and weeds",
    "Frequent heavy dew, rainfall, and warm temperatures (24-29°C)"
  ],
  "treatment": {
    "organic": [
      "Apply cold-pressed neem oil spray (5ml per liter) every 7 days",
      "Copper soap (Copper Octanoate) or Bordeaux mixture at first sign of spots"
    ],
    "chemical": [
      "Mancozeb 75% WP (2-2.5 g/liter water)",
      "Azoxystrobin 23% SC (1ml / liter) for translaminar control"
    ],
    "cultural": [
      "Stake and prune lower leaves (bottom 30 cm) to prevent ground splashback",
      "Apply clean straw or plastic mulch to seal soil surface"
    ]
  },
  "prevention": [
    "Select tomato cultivars with high tolerance or resistance",
    "Ensure wide plant spacing (60 cm) to facilitate quick canopy drying"
  ],
  "references": [
    "Penn State Extension - Early Blight on Tomato",
    "UC Davis IPM - Tomato Early Blight Guidelines"
  ]
}
```

---

## 5. Plant Leaf Disease Prediction

### `POST /api/v1/disease/predict`
Uploads a leaf image (`multipart/form-data`) and classifies it using MobileNetV2.

#### Request Parameters
| Parameter | Type | Required | Description |
|---|---|---|---|
| `file` | Binary | Yes | Leaf image file (`JPG`, `JPEG`, `PNG`, `WEBP`, max 10MB) |
| `user_id` | String | No | Optional user ID for tracking detection history |

#### Request Example (cURL)
```bash
curl -X POST "http://localhost:8000/api/v1/disease/predict" \
  -F "file=@/path/to/tomato_leaf.jpg" \
  -F "user_id=farmer_123"
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "is_uncertain": false,
  "uncertainty_warning": null,
  "prediction": {
    "crop": "Tomato",
    "disease": "Early Blight",
    "class_name": "Tomato___Early_blight",
    "confidence": 94.62
  },
  "alternatives": [
    {
      "crop": "Tomato",
      "disease": "Early Blight",
      "class_name": "Tomato___Early_blight",
      "confidence": 94.62
    },
    {
      "crop": "Tomato",
      "disease": "Late Blight",
      "class_name": "Tomato___Late_blight",
      "confidence": 3.41
    },
    {
      "crop": "Potato",
      "disease": "Early Blight",
      "class_name": "Potato___Early_blight",
      "confidence": 1.25
    }
  ],
  "disease_information": {
    "crop": "Tomato",
    "disease": "Early Blight",
    "class_name": "Tomato___Early_blight",
    "is_healthy": false,
    "description": "Early blight is a common fungal disease caused by Alternaria solani...",
    "symptoms": [ ... ],
    "causes": [ ... ],
    "treatment": {
      "organic": [ ... ],
      "chemical": [ ... ],
      "cultural": [ ... ]
    },
    "prevention": [ ... ],
    "references": [ ... ]
  },
  "inference_time_ms": 32.4,
  "timestamp": "2026-11-17T16:35:12.345678+00:00",
  "disclaimer": "AI predictions are not guaranteed diagnoses. Consult an agricultural expert."
}
```

#### Uncertain Prediction Example (Confidence < 50%)
If the image is blurry, ambiguous, or out-of-distribution:
```json
{
  "success": true,
  "is_uncertain": true,
  "uncertainty_warning": "Prediction confidence is low (38.50% < 50.0%). The image may be blurry, poorly lit, captured at an extreme angle, or depicts a non-leaf/unsupported subject. Please capture a clearer, well-lit leaf photo or consult a local agricultural extension expert.",
  "prediction": {
    "crop": "Tomato",
    "disease": "Early Blight",
    "class_name": "Tomato___Early_blight",
    "confidence": 38.50
  },
  ...
}
```

#### Error Responses
- `400 Bad Request`: Empty file or unreadable/corrupted image.
- `413 Payload Too Large`: Image exceeds 10 MB limit.
- `415 Unsupported Media Type`: Non-image file format (e.g. PDF, EXE, GIF).
- `503 Service Unavailable`: AI model is currently offline or loading.

---

## 6. Detection History

### `GET /api/v1/disease/history`
Returns historical predictions stored in the database.

#### Query Parameters
| Parameter | Type | Default | Description |
|---|---|---|---|
| `skip` | Integer | `0` | Offset for pagination |
| `limit` | Integer | `20` | Max records to return (1-100) |
| `crop` | String | `null` | Case-insensitive filter by crop name |
| `user_id` | String | `null` | Filter by user identifier |

#### Request Example
```bash
curl -X GET "http://localhost:8000/api/v1/disease/history?limit=10&crop=Tomato"
```

#### Response (`200 OK`)
```json
{
  "total": 1,
  "items": [
    {
      "id": 1,
      "user_id": "farmer_123",
      "crop_name": "Tomato",
      "disease_name": "Early Blight",
      "class_name": "Tomato___Early_blight",
      "confidence": 94.62,
      "is_uncertain": false,
      "image_path": null,
      "image_filename": "tomato_leaf.jpg",
      "top_alternatives": "[{\"crop\":\"Tomato\",\"disease\":\"Early Blight\",\"confidence\":94.62}]",
      "timestamp": "2026-11-17T16:35:12.345678"
    }
  ]
}
```

### `GET /api/v1/disease/history/{id}`
Retrieves a single historical record by its primary key ID.

#### Request Example
```bash
curl -X GET "http://localhost:8000/api/v1/disease/history/1"
```

### `DELETE /api/v1/disease/history/{id}`
Deletes a single historical record by ID.

#### Request Example
```bash
curl -X DELETE "http://localhost:8000/api/v1/disease/history/1"
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Detection record 1 successfully deleted.",
  "deleted_id": 1
}
```
