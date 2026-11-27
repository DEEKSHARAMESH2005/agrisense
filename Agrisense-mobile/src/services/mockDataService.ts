import mockDataJson from '../data/mockData.json';
import {
  Product,
  Order,
  SoilTelemetry,
  WeatherData,
  DiseaseDetection,
  User,
} from '../types';

export interface FarmingTip {
  id: string;
  category: string;
  title: string;
  text: string;
}

export interface SampleLeaf {
  title: string;
  crop: string;
  uri: string;
  type: string;
}

export interface MockDatabase {
  demoFarmer: User;
  demoBuyer: User;
  initialProducts: Product[];
  initialOrders: Order[];
  demoSoilData: SoilTelemetry;
  demoWeatherData: WeatherData;
  sampleDiseaseResults: Record<string, DiseaseDetection>;
  initialDetectionHistory: DiseaseDetection[];
  farmingTips: FarmingTip[];
  sampleLeaves: SampleLeaf[];
  regionalZones: string[];
}

// Cast JSON to strongly typed mock database
const db: MockDatabase = mockDataJson as unknown as MockDatabase;

/**
 * Simulate network latency for realistic frontend data fetching
 */
const delay = (ms: number = 50) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch entire mock database from JSON
 */
export const fetchMockData = async (): Promise<MockDatabase> => {
  await delay();
  return JSON.parse(JSON.stringify(db));
};

/**
 * Fetch demo user profiles from JSON
 */
export const fetchDemoUsers = async (): Promise<{ demoFarmer: User; demoBuyer: User }> => {
  await delay();
  return {
    demoFarmer: { ...db.demoFarmer },
    demoBuyer: { ...db.demoBuyer },
  };
};

/**
 * Fetch all marketplace products from JSON
 */
export const fetchProducts = async (): Promise<Product[]> => {
  await delay();
  return JSON.parse(JSON.stringify(db.initialProducts));
};

/**
 * Fetch a single product by ID from JSON
 */
export const fetchProductById = async (id: string): Promise<Product | undefined> => {
  await delay();
  const found = db.initialProducts.find((p) => p.id === id);
  return found ? JSON.parse(JSON.stringify(found)) : undefined;
};

/**
 * Fetch all orders from JSON
 */
export const fetchOrders = async (): Promise<Order[]> => {
  await delay();
  return JSON.parse(JSON.stringify(db.initialOrders));
};

/**
 * Fetch a single order by ID from JSON
 */
export const fetchOrderById = async (id: string): Promise<Order | undefined> => {
  await delay();
  const found = db.initialOrders.find((o) => o.id === id);
  return found ? JSON.parse(JSON.stringify(found)) : undefined;
};

/**
 * Fetch soil telemetry from JSON
 */
export const fetchSoilTelemetry = async (): Promise<SoilTelemetry> => {
  await delay();
  return JSON.parse(JSON.stringify(db.demoSoilData));
};

/**
 * Fetch weather data from JSON
 */
export const fetchWeatherData = async (): Promise<WeatherData> => {
  await delay();
  return JSON.parse(JSON.stringify(db.demoWeatherData));
};

/**
 * Fetch disease detection history from JSON
 */
export const fetchDiseaseHistory = async (): Promise<DiseaseDetection[]> => {
  await delay();
  return JSON.parse(JSON.stringify(db.initialDetectionHistory));
};

/**
 * Fetch sample disease diagnoses dictionary from JSON
 */
export const fetchSampleDiseaseResults = async (): Promise<Record<string, DiseaseDetection>> => {
  await delay();
  return JSON.parse(JSON.stringify(db.sampleDiseaseResults));
};

/**
 * Fetch farming tips from JSON
 */
export const fetchFarmingTips = async (): Promise<FarmingTip[]> => {
  await delay();
  return JSON.parse(JSON.stringify(db.farmingTips));
};

/**
 * Fetch sample leaves for disease scanner from JSON
 */
export const fetchSampleLeaves = async (): Promise<SampleLeaf[]> => {
  await delay();
  return JSON.parse(JSON.stringify(db.sampleLeaves));
};

/**
 * Fetch regional weather zones from JSON
 */
export const fetchRegionalZones = async (): Promise<string[]> => {
  await delay();
  return [...db.regionalZones];
};

export default {
  fetchMockData,
  fetchDemoUsers,
  fetchProducts,
  fetchProductById,
  fetchOrders,
  fetchOrderById,
  fetchSoilTelemetry,
  fetchWeatherData,
  fetchDiseaseHistory,
  fetchSampleDiseaseResults,
  fetchFarmingTips,
  fetchSampleLeaves,
  fetchRegionalZones,
};
