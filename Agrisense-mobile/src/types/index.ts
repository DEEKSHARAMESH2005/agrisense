export type UserRole = 'farmer' | 'buyer';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  location: string;
  avatarUrl?: string;
}

export interface DiseaseDetection {
  id: string;
  cropName: string;
  diseaseName: string;
  confidence: number; // e.g. 94.6
  severity: 'Mild' | 'Moderate' | 'Severe';
  description: string;
  symptoms: string[];
  treatment: {
    organic: string[];
    chemical: string[];
    cultural?: string[];
  };
  prevention: string[];
  imageUri: string;
  date: string;
  isDemo: boolean;
  isUncertain?: boolean;
  uncertaintyWarning?: string;
  alternatives?: Array<{
    crop: string;
    disease: string;
    confidence: number;
    class_name?: string;
  }>;
  inferenceTimeMs?: number;
  causes?: string[];
}

export interface Product {
  id: string;
  title: string;
  category: 'Vegetables' | 'Fruits' | 'Grains' | 'Seeds' | 'Fertilizers' | 'Equipment';
  price: number;
  unit: string; // e.g. "kg", "dozen", "quintal", "bag"
  quantity: number;
  availableDate: string;
  location: string;
  farmerName: string;
  farmerPhone: string;
  imageUrl: string;
  description: string;
  rating?: number;
  isOrganic?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  buyerName: string;
  buyerPhone: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  orderDate: string;
  deliveryAddress: string;
  pickupAddress: string;
  pickupCoords: { latitude: number; longitude: number };
  deliveryCoords: { latitude: number; longitude: number };
  estimatedDelivery: string;
  deliveryRider?: {
    name: string;
    phone: string;
    vehicle: string;
  };
  isDemo: boolean;
}

export interface SoilTelemetry {
  moisturePercentage: number;
  temperatureCelsius: number;
  humidityPercentage: number;
  ph: number;
  npk: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  sensorStatus: 'Connected' | 'Simulated' | 'Offline';
  deviceId: string;
  lastUpdated: string;
  isDemo: boolean;
  history: {
    time: string;
    moisture: number;
    temperature: number;
  }[];
}

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  conditionIcon: string;
  humidity: number;
  windSpeed: number;
  rainfallMm: number;
  uvIndex: number;
  lastUpdated: string;
  forecast: {
    day: string;
    tempMin: number;
    tempMax: number;
    condition: string;
    rainfallProb: number;
  }[];
  farmingAdvice: string;
  isDemo: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'order' | 'disease' | 'soil' | 'weather';
  read: boolean;
}
