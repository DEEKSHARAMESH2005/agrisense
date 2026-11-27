# AgriSense Plant Disease Detection Backend

An independent, production-ready FastAPI backend designed to classify plant leaf diseases from mobile photo uploads using the official Hugging Face **MobileNetV2** model ([`neghani/plantvillage-mobilenetv2`](https://huggingface.co/neghani/plantvillage-mobilenetv2)).

Provides AI classification across 38 crop condition classes, confidence scoring, uncertainty detection, verified agronomy treatment guides, and SQLite/PostgreSQL detection history.

---

## Table of Contents
1. [Key Features](#key-features)
2. [Prerequisites](#prerequisites)
3. [Quick Start (Beginner Friendly)](#quick-start-beginner-friendly)
4. [Testing the APIs via Swagger UI](#testing-the-apis-via-swagger-ui)
5. [Testing with cURL](#testing-with-curl)
6. [Connecting from React Native Expo](#connecting-from-react-native-expo)
7. [Running on Android Emulator vs Physical Phone](#running-on-android-emulator-vs-physical-phone)
8. [Automated Testing](#automated-testing)
9. [Architecture & Project Structure](#architecture--project-structure)
10. [Troubleshooting & FAQ](#troubleshooting--faq)

---

## Key Features

- **Hugging Face AI Integration:** Automatically downloads, caches, and loads `neghani/plantvillage-mobilenetv2` once on startup.
- **CPU & GPU Support:** Runs on standard CPU by default; automatically uses CUDA if an NVIDIA GPU is available.
- **Top-3 Alternatives & Confidence:** Returns primary prediction and top three alternative classifications with percentage probabilities.
- **Uncertainty Flagging:** Detects low confidence (<50%) and provides an advisory warning for blurry or out-of-distribution images.
- **Agronomy Knowledge Base:** Comprehensive JSON database covering all 38 classes with symptoms, causes, organic/chemical/cultural treatments, and prevention recommendations.
- **Detection History:** Stores past classifications with SQLite for local dev and full compatibility with PostgreSQL.
- **Security & Validation:** Enforces 10MB upload limits, image integrity checking (rejects corrupted/fake files), and safe RGB conversion.

---

## Prerequisites

- **Python:** 3.10, 3.11, or 3.12 (Tested on Python 3.12).
- **RAM:** At least 2 GB of free RAM.
- **Disk Space:** ~500 MB for Python packages and the cached model (~14 MB).
- **Internet Connection:** Required only during the very first startup to download the Hugging Face model weights. Subsequent startups run completely offline using cached files.

---

## Quick Start (Beginner Friendly)

### 1. Open Terminal or PowerShell
Navigate into the backend project folder:

**Windows PowerShell:**
```powershell
cd D:\deekshaproj\agrisense-disease-backend
```

**Linux / macOS:**
```bash
cd agrisense-disease-backend
```

### 2. Create and Activate a Virtual Environment (Recommended)

**Windows PowerShell:**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```
*(If PowerShell gives an execution policy error, run: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`)*

**Linux / macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:

**Windows PowerShell:**
```powershell
Copy-Item .env.example .env
```

**Linux / macOS:**
```bash
cp .env.example .env
```

The default settings work immediately out-of-the-box for local testing.

### 5. Start the Server
Run the application using the entrypoint script:
```bash
python run.py
```

Or using Uvicorn directly:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

> **First Run Note:** On the first execution, you will see a download progress bar as the MobileNetV2 model (~14 MB) downloads from Hugging Face. Subsequent runs load the model from the local cache in ~0.5 seconds!

You should see:
```text
INFO: Starting AgriSense Disease Detection API v1.0.0 [development]...
INFO: Database initialized successfully.
INFO: Loading Hugging Face model: 'neghani/plantvillage-mobilenetv2'...
INFO: Selected computation device: CPU
INFO: Model successfully loaded in 420.5ms. Supported classes: 38 on cpu.
INFO: Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

---

## Testing the APIs via Swagger UI

Open your web browser and go to:
👉 **[http://localhost:8000/docs](http://localhost:8000/docs)**

This opens the interactive Swagger UI where you can test every endpoint directly:

1. Click on **`POST /api/v1/disease/predict`**.
2. Click **Try it out**.
3. Under **file**, click **Choose File** and select any plant leaf photo (`.jpg` or `.png`).
4. (Optional) Enter a `user_id` like `farmer_demo_1`.
5. Click **Execute**.
6. View the complete JSON response with crop name, disease name, confidence score, alternative probabilities, and organic/chemical treatments!

---

## Testing with cURL

### 1. Check System Health
```bash
curl -X GET "http://localhost:8000/api/v1/health"
```

### 2. Check Model Status
```bash
curl -X GET "http://localhost:8000/api/v1/model/status"
```

### 3. List All 38 Supported Disease Classes
```bash
curl -X GET "http://localhost:8000/api/v1/disease/classes"
```

### 4. Predict Plant Disease from an Image
```bash
curl -X POST "http://localhost:8000/api/v1/disease/predict" \
  -F "file=@sample_leaf.jpg" \
  -F "user_id=farmer_101"
```

### 5. View Detection History
```bash
curl -X GET "http://localhost:8000/api/v1/disease/history?limit=5"
```

---

## Connecting from React Native Expo

To integrate this backend with your mobile app (such as the `AgriSense-Mobile` project):

### TypeScript / Axios Example
```typescript
import axios from 'axios';

// Choose the correct base URL based on your development environment:
// 1. Android Emulator: 'http://10.0.2.2:8000/api/v1'
// 2. Physical Android Phone on same Wi-Fi: 'http://192.168.1.XX:8000/api/v1'
// 3. iOS Simulator: 'http://localhost:8000/api/v1'
const API_BASE_URL = 'http://10.0.2.2:8000/api/v1';

export interface DiseasePredictionResult {
  success: boolean;
  is_uncertain: boolean;
  uncertainty_warning?: string;
  prediction: {
    crop: string;
    disease: string;
    class_name: string;
    confidence: number;
  };
  alternatives: Array<{
    crop: string;
    disease: string;
    confidence: number;
  }>;
  disease_information: {
    description: string;
    symptoms: string[];
    causes: string[];
    treatment: {
      organic: string[];
      chemical: string[];
      cultural: string[];
    };
    prevention: string[];
  };
  inference_time_ms: number;
}

/**
 * Upload a leaf image picked from camera or gallery to the FastAPI backend.
 */
export const diagnoseLeafImage = async (
  imageUri: string,
  userId?: string
): Promise<DiseasePredictionResult> => {
  const formData = new FormData();

  const filename = imageUri.split('/').pop() || 'leaf.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  // React Native FormData format
  formData.append('file', {
    uri: imageUri,
    name: filename,
    type: type,
  } as any);

  if (userId) {
    formData.append('user_id', userId);
  }

  const response = await axios.post<DiseasePredictionResult>(
    `${API_BASE_URL}/disease/predict`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 15000, // 15 second timeout
    }
  );

  return response.data;
};
```

---

## Running on Android Emulator vs Physical Phone

When running a mobile app on Android, `localhost` refers to the Android device itself, not your development PC.

| Testing Environment | Backend Host URL | Explanation |
|---|---|---|
| **Web Browser** | `http://localhost:8000` | Same machine |
| **Android Emulator** | `http://10.0.2.2:8000` | Android emulator loopback alias pointing to your PC host |
| **Physical Phone (USB/Wi-Fi)** | `http://192.168.X.X:8000` | Your PC's local Wi-Fi IP address (ensure phone & PC are on the same Wi-Fi) |
| **iOS Simulator** | `http://localhost:8000` | iOS simulator shares localhost network with Mac |

### To find your PC's local Wi-Fi IP address:
- **Windows:** Open PowerShell and run `ipconfig`. Look for **IPv4 Address** (e.g. `192.168.1.45`).
- **Mac / Linux:** Run `ifconfig` or `ip a`.

Make sure your Windows Firewall allows incoming connections on port `8000` for private networks.

---

## Automated Testing

The backend includes a comprehensive test suite covering health, model loading, image validation (valid images, corrupted bytes, empty files, oversized files), uncertainty handling, and detection history CRUD operations.

Run the tests with:
```bash
python -m pytest tests -v
```

All 20 test cases will execute and report results.

---

## Architecture & Project Structure

```text
agrisense-disease-backend/
├── app/
│   ├── main.py                  # FastAPI application entrypoint & lifespan
│   ├── config.py                # Environment configuration & settings
│   │
│   ├── api/
│   │   └── routes/
│   │       ├── health.py        # GET /api/v1/health
│   │       ├── disease.py       # POST /api/v1/disease/predict, classes, info, status
│   │       └── history.py       # GET/DELETE /api/v1/disease/history
│   │
│   ├── services/
│   │   ├── model_service.py     # Hugging Face MobileNetV2 singleton & inference
│   │   ├── image_service.py     # Pillow validation, RGB normalization, security
│   │   ├── prediction_service.py# Prediction orchestrator & uncertainty analyzer
│   │   └── disease_info_service.py # Agronomic knowledge retrieval
│   │
│   ├── database/
│   │   ├── database.py          # SQLAlchemy engine & session dependency
│   │   └── models.py            # DetectionHistory table model
│   │
│   ├── schemas/
│   │   ├── disease.py           # Pydantic models for prediction & model metadata
│   │   └── history.py           # Pydantic models for history pagination & CRUD
│   │
│   └── data/
│       └── disease_information.json # Verified knowledge base for all 38 classes
│
├── tests/
│   ├── conftest.py              # TestClient, in-memory SQLite, image fixtures
│   ├── test_health.py           # Health & root route tests
│   ├── test_model.py            # Model status, class catalog, knowledge base tests
│   ├── test_disease.py          # Image validation & prediction inference tests
│   └── test_history.py          # Database history CRUD tests
│
├── docs/
│   ├── API_DOCUMENTATION.md     # Detailed API schemas and curl examples
│   ├── MODEL_INFORMATION.md     # Deep dive into MobileNetV2 & OOD limits
│   └── PROGRESS.md              # Development changelog & checklist
│
├── .env.example                 # Template for environment configuration
├── .gitignore                   # Git exclusion rules
├── requirements.txt             # Production Python dependencies
├── README.md                    # Beginner-friendly documentation
└── run.py                       # CLI execution script
```

---

## Troubleshooting & FAQ

### Q1: The download seems slow or stuck on the first run.
**A:** Hugging Face downloads the weights on the first startup. Ensure you have an active internet connection. Once downloaded, it is permanently cached in your user directory (`~/.cache/huggingface/hub/`). Subsequent startups take less than 1 second.

### Q2: Symlink warning on Windows.
**A:** Windows may display a notice: `cache-system uses symlinks by default...`. This is harmless; caching still works completely normally on Windows. To suppress it, the `.env` includes `HF_HUB_DISABLE_SYMLINKS_WARNING=1`.

### Q3: Address already in use (`Errno 10048` or `Port 8000 in use`).
**A:** Another process is using port 8000. Either stop that process or change `PORT=8001` in your `.env` file.

### Q4: My mobile app cannot connect to the backend.
**A:**
1. Check that you are not using `localhost` on an Android emulator or physical phone.
   - For Android Emulator, use `http://10.0.2.2:8000`.
   - For a real phone, use your PC's Wi-Fi IP (e.g. `http://192.168.1.50:8000`).
2. Make sure your PC and physical phone are connected to the exact same Wi-Fi network.
3. Check your Windows Defender Firewall to ensure incoming connections on port 8000 are allowed.

---

## License & Agricultural Disclaimers

AI classifications are intended as assistive diagnostic references for students, researchers, and farmers. They are not guaranteed clinical diagnoses. Always verify high-impact crop treatment decisions with a local agricultural extension officer.
