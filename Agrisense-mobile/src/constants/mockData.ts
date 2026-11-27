import mockDataJson from '../data/mockData.json';
import { Product, Order, SoilTelemetry, WeatherData, DiseaseDetection, User } from '../types';

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

// Typed exports read directly from mockData.json
export const demoFarmer: User = mockDataJson.demoFarmer as User;
export const demoBuyer: User = mockDataJson.demoBuyer as User;
export const initialProducts: Product[] = mockDataJson.initialProducts as Product[];
export const initialOrders: Order[] = mockDataJson.initialOrders as Order[];
export const demoSoilData: SoilTelemetry = mockDataJson.demoSoilData as SoilTelemetry;
export const demoWeatherData: WeatherData = mockDataJson.demoWeatherData as WeatherData;
export const sampleDiseaseResults: Record<string, DiseaseDetection> =
  mockDataJson.sampleDiseaseResults as unknown as Record<string, DiseaseDetection>;
export const initialDetectionHistory: DiseaseDetection[] =
  mockDataJson.initialDetectionHistory as DiseaseDetection[];
export const farmingTips: FarmingTip[] = mockDataJson.farmingTips as FarmingTip[];
export const sampleLeaves: SampleLeaf[] = mockDataJson.sampleLeaves as SampleLeaf[];
export const regionalZones: string[] = mockDataJson.regionalZones as string[];

// Export async data fetching functions
export * from '../services/mockDataService';
