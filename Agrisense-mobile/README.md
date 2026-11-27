# AgriSense — AI-Powered Smart Agriculture Platform

> **Modern Mobile Application Frontend** built with **React Native**, **Expo SDK 58**, **TypeScript**, and **React Navigation**.

AgriSense is an agricultural mobile application designed for farmers and buyers. It integrates **AI Plant Pathology Diagnostics**, **Soil & Weather IoT Telemetry**, and a **Farm-to-Buyer Marketplace** with live delivery route tracking.

---

## 📱 Key Features & Modules

### 1. 🌿 Splash & Interactive Onboarding
- **Branded Splash Screen**: Forest green theme with animated loading indicator.
- **3-Step Onboarding**:
  - *Slide 1*: AI Plant Disease Detection.
  - *Slide 2*: Smart Weather and Soil IoT Telemetry.
  - *Slide 3*: Farmer-to-Buyer Marketplace.
- Allows skipping directly into the app or progressing through slides.

### 2. 🔐 Authentication & Role Management
- **User Roles**: Distinct flows for **🌾 Farmer** and **🛒 Buyer**.
- **Demo Login**: Pre-filled credentials for one-tap sign-in testing.
- **Registration**: Full form with role selector, name, email, phone, location, and password validation.
- **Live Role Switcher**: Quick toggle button in headers and profile to switch between Farmer and Buyer modes without re-logging.

### 3. 🏡 Home Dashboard
- **Personalized Greeting**: Context-aware based on active role (Farmer / Buyer).
- **Live Weather Summary**: Temperature, condition, humidity, wind speed, and agronomic spray advice.
- **Quick Action Grid**: One-tap shortcuts to Scan Leaf, Weather, Soil IoT, Sell Produce, and Track Orders.
- **Soil Moisture & Temp Preview**: Radial telemetry preview with optimal threshold badges.
- **Crop Health Overview**: Displays latest leaf scan with severity rating and confidence percentage.
- **Agronomy Tips**: Interactive insight cards covering drip irrigation, natural pest control, and mulching.
- **Fresh From Farms**: Preview of latest harvest listings with direct Add to Basket.

### 4. 🔬 AI Plant Disease Doctor
- **Leaf Viewport**: Target corner guides and scanner overlay.
- **Input Methods**:
  - **Camera**: Capture a leaf directly.
  - **Gallery Picker**: Choose any leaf image from phone storage.
  - **Quick Test Samples**: One-tap sample leaves (Tomato Early Blight, Capsicum Powdery Mildew, Healthy Foliage).
- **Simulated AI Inference**: Multi-step animated analysis (leaf texture extraction, pathogen dataset comparison, treatment compilation).
- **Diagnosis Results Modal**:
  - Uploaded leaf preview with confidence percentage (e.g. 95.4%).
  - Severity level: Mild, Moderate, or Severe.
  - Pathogen description & biological details.
  - Identified symptoms checklist.
  - **Organic & Biological Control** protocols (Neem oil, Bacillus subtilis, etc.).
  - **Chemical Treatment Options** (Mancozeb, Azoxystrobin, etc.).
  - **Agronomic Prevention Guidelines** (Airflow, drip irrigation, crop rotation).
  - **Expert Disclaimer**: Clearly highlights that AI inference is simulated for student/demo evaluation.
- **Detection History Screen**: Saves all past scans with search and clear history support.

### 5. ⛅ Agro Weather Dashboard
- **Regional Zone Selector**: Switch between Nashik Valley, Pune, Nagpur, Karnal, and Bengaluru.
- **Hero Condition Card**: Big temperature display, feels-like metrics, humidity, precipitation, and UV index.
- **Spray & Irrigation Advisory**: Alerts for safe chemical/organic spraying based on wind velocity.
- **7-Day Extended Forecast**: Daily minimum/maximum temperatures, weather conditions, and rain probability.

### 6. 🌱 Soil Health & ESP32 IoT Monitoring
- **Hardware Telemetry Strip**: Displays device ID (`ESP32-AGRI-IOT-04`) and toggle between Simulated and Physical ESP32 modes.
- **Moisture Radial Gauge**: Visual circular gauge with color-coded stages:
  - *Dry / Low Moisture* (< 45% - Amber)
  - *Optimal Root Moisture* (50% - 75% - Green)
  - *Saturated Soil* (> 75% - Sky Blue)
- **Soil Metrics Grid**: Soil temperature (°C), soil pH level (6.7 - Neutral), and macronutrients (NPK: Nitrogen, Phosphorus, Potassium).
- **24-Hour Trend History Chart**: Dual-bar comparison of moisture (%) and temperature (°C) across the day.

### 7. 🛒 Farm-to-Buyer Marketplace
- **Search & Filtering**: Real-time keyword search across titles, locations, and farmers, plus horizontal category chips (All, Vegetables, Fruits, Grains, Seeds, Fertilizers).
- **Product Details Screen**:
  - High-resolution imagery, organic badges, rating stars, location, harvest dates.
  - Farmer profile card with direct simulated call button.
  - Quantity stepper (+ / -) and Add to Basket.
- **Produce Basket (Cart)**:
  - Item listing with quantity increments and deletions.
  - Subtotal, packaging fee, and grand total calculations.
- **Checkout Flow**:
  - Delivery address editor and contact mobile input.
  - Payment preferences: Cash on Delivery (COD) and Demo UPI.
  - Clear demo transaction disclaimers.
- **Order Confirmation Screen**: Order reference ID, status pill, and direct link to track delivery.

### 8. 🌾 Farmer "Sell Harvest" Portal
- **Add Listing Form**:
  - Image selection from gallery or presets (Tomatoes, Mangoes, Basmati, Capsicum).
  - Crop title, category, price per unit, available quantity, location, and description.
  - Instant addition to active marketplace state and local storage.

### 9. 🚚 Logistics & Live Route Map
- **Orders Screen**: Segmented into *Active Deliveries* and *Completed History* with status badges (Pending, Confirmed, In Transit, Delivered).
- **Delivery Route Visualizer**:
  - Highway corridor representation with farm origin pin (Nashik) and buyer destination pin (Pune).
  - Moving delivery truck icon on the route line.
  - Live telemetry overlay: ETA (2h 45m), Distance (164 km), Transit Speed (62 km/h).
  - Delivery rider details with simulated contact button.
  - **Google Maps Navigation Handoff**: Button to launch external navigation.

### 10. 👤 Profile & Settings
- Identity card with avatar, role pill, and contact details.
- Modal to edit name, phone, and farm location.
- Live role switcher (Farmer <-> Buyer).
- Activity shortcuts (My Farm Listings, Orders & Deliveries, Disease History).
- App information and support dialogues.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| **React Native** (0.88.1) | Core mobile framework |
| **Expo SDK 58** | Tooling, build pipeline, and runtime environment |
| **TypeScript** (6.0.3) | Type-safe application architecture |
| **React Navigation** (v7) | Native stack navigation and bottom tab navigation |
| **Lucide Icons** (`lucide-react-native`) | Modern vector icons |
| **Expo Linear Gradient** | Visual cards and hero banners |
| **Expo Image Picker** | Camera and photo gallery selection |
| **AsyncStorage** | Local offline persistence for cart, orders, scans, and user profile |

---

## 🎨 Design System

- **Primary Colors**:
  - Deep Forest Green: `#1E5631`
  - Meadow Leaf Green: `#4C9A2A`
  - Emerald Green: `#10B981`
  - Light Herb Green: `#DCFCE7`
- **Backgrounds**: Soft leafy white (`#F8FAF8`), Clean Card White (`#FFFFFF`)
- **Cards**: 16–20px rounded corners with subtle elevations.
- **Typography**: Responsive, high-contrast, bold headlines.

---

## 🚀 Installation & Running the App

### Prerequisites
- Node.js (v18 or higher recommended; project tested on Node v24).
- npm installed (`npm -v`).

### 1. Navigate to the project directory
```bash
cd AgriSense-Mobile
```

### 2. Install dependencies (if not already installed)
```bash
npm install
```

### 3. Start the Expo development server
```bash
npx expo start
```
or
```bash
npm start
```

---

## 📱 Running on Devices

### Option A: Physical Android Phone (Easiest)
1. Install **Expo Go** from the Google Play Store on your phone.
2. Ensure your phone and development computer are connected to the same Wi-Fi network.
3. Run `npx expo start` in your terminal.
4. Open the Expo Go app and scan the **QR code** displayed in your terminal or browser window.
5. The application will bundle and launch immediately.

### Option B: Android Emulator
1. Open Android Studio and launch a configured Android Virtual Device (AVD).
2. With the emulator running, execute:
   ```bash
   npm run android
   ```
   *(or start Expo with `npx expo start` and press `a` in the terminal).*

### Option C: Web Browser Preview
For quick UI previewing:
```bash
npm run web
```
*(or press `w` in the Expo terminal).*

---

## 📦 Generating an Installable Android APK

To build a standalone `.apk` file that can be installed on any Android device without Expo Go:

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Log in to your Expo account
```bash
eas login
```
*(Create a free account at [expo.dev](https://expo.dev) if you don't have one).*

### Step 3: Configure EAS Build
```bash
eas build:configure
```

### Step 4: Add an APK build profile to `eas.json`
Ensure `eas.json` has a preview profile configured for APK builds:
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}
```

### Step 5: Start the Cloud Build
```bash
eas build -p android --profile preview
```
Once the build completes on the Expo cloud, EAS will output a direct download link and QR code for your standalone Android `.apk` file!

---

## 📂 Project Structure

```
AgriSense-Mobile/
├── App.tsx                      # Root entry with Theme, Nav & Context Providers
├── app.json                     # Expo configuration & app branding
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript configuration
├── assets/                      # App icons and splash assets
├── src/
│   ├── constants/
│   │   ├── colors.ts            # Color tokens (Forest, Leaf, Earth, Alerts)
│   │   └── mockData.ts          # Comprehensive demo data (users, products, orders, weather, soil)
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces for all models
│   ├── context/
│   │   ├── AuthContext.tsx      # User profile, role switcher & demo auth state
│   │   ├── CartContext.tsx      # Produce basket management & totals
│   │   ├── MarketplaceContext.tsx # Products catalog, CRUD & order pipeline
│   │   └── DetectionContext.tsx # Simulated AI diagnosis & scan history
│   ├── components/
│   │   ├── common/              # Header, Button, Input, Card, Badge
│   │   ├── dashboard/           # WeatherCard, SoilCard, QuickActions, CropHealthCard, FarmingTips
│   │   ├── marketplace/         # ProductCard, CategoryFilter
│   │   └── soil/                # MoistureGauge (radial visual)
│   ├── screens/
│   │   ├── auth/                # SplashScreen, OnboardingScreen, LoginScreen, RegisterScreen
│   │   ├── tabs/                # HomeScreen, DiseaseScreen, WeatherScreen, MarketplaceScreen, ProfileScreen
│   │   ├── soil/                # SoilScreen (Hardware status, NPK, 24h charts)
│   │   ├── marketplace/         # ProductDetailScreen, CartScreen, CheckoutScreen, OrderConfirmationScreen, AddListingScreen
│   │   ├── orders/              # OrdersScreen, DeliveryMapScreen
│   │   └── disease/             # DiseaseResultModal, DiseaseHistoryScreen
│   └── navigation/
│       ├── TabNavigator.tsx     # 5-tab bottom navigation with custom styling
│       └── RootNavigator.tsx    # Native stack orchestrating all screens and modals
└── README.md
```

---

## 🎓 Academic Evaluation & Verification Notes

- **Frontend Simulation**: This project demonstrates a production-grade UI/UX for an agritech application. AI disease predictions, weather forecasts, soil telemetry, and payments are interactive simulations populated with realistic agronomic data.
- **Offline & State Persistence**: All actions (adding products, modifying quantities, placing orders, running scans, and editing profiles) persist locally in memory and `AsyncStorage` during the session.
- **Zero Syntax Errors**: Verified with `npx tsc --noEmit` and bundled successfully for Android through Metro.
