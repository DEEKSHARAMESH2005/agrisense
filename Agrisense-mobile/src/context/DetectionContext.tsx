import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DiseaseDetection } from '../types';
import {
  initialDetectionHistory,
  fetchDiseaseHistory,
} from '../constants/mockData';
import {
  predictDiseaseFromBackend,
  checkBackendStatus,
  BackendStatus,
} from '../services/diseaseApi';

interface DetectionContextType {
  history: DiseaseDetection[];
  latestResult: DiseaseDetection | null;
  isAnalyzing: boolean;
  backendStatus: BackendStatus | null;
  isBackendOnline: boolean;
  checkStatus: () => Promise<BackendStatus>;
  analyzeImage: (imageUri: string, base64Data?: string | null) => Promise<DiseaseDetection>;
  saveDetectionResult: (result: DiseaseDetection) => Promise<void>;
  clearHistory: () => Promise<void>;
  setLatestResult: (result: DiseaseDetection | null) => void;
}

const DetectionContext = createContext<DetectionContextType | undefined>(undefined);
const HISTORY_KEY = '@agrisense_detection_history';

export const DetectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<DiseaseDetection[]>(initialDetectionHistory);
  const [latestResult, setLatestResult] = useState<DiseaseDetection | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);

  useEffect(() => {
    loadHistory();
    refreshStatus();
  }, []);

  const refreshStatus = async (): Promise<BackendStatus> => {
    try {
      const status = await checkBackendStatus();
      setBackendStatus(status);
      setIsBackendOnline(status.online);
      return status;
    } catch (e) {
      setIsBackendOnline(false);
      return {
        online: false,
        modelLoaded: false,
        modelName: '',
        device: '',
        supportedClasses: 0,
        url: '',
      };
    }
  };

  const loadHistory = async () => {
    try {
      const data = await AsyncStorage.getItem(HISTORY_KEY);
      if (data) {
        setHistory(JSON.parse(data));
      } else {
        const initial = await fetchDiseaseHistory();
        setHistory(initial);
      }
    } catch (e) {
      console.warn('Failed to load detection history', e);
    }
  };

  const recordDetection = async (result: DiseaseDetection) => {
    setIsBackendOnline(true);
    setLatestResult(result);
    setHistory((prev) => {
      const updated = [result, ...prev];
      AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated)).catch((e) =>
        console.warn('Failed to save detection history', e)
      );
      return updated;
    });
  };

  const saveDetectionResult = async (result: DiseaseDetection) => {
    await recordDetection(result);
  };

  const analyzeImage = async (
    imageUri: string,
    base64Data?: string | null
  ): Promise<DiseaseDetection> => {
    setIsAnalyzing(true);

    try {
      // 1. Attempt live classification using FastAPI MobileNetV2 backend
      const liveResult = await predictDiseaseFromBackend(imageUri, base64Data);
      await recordDetection(liveResult);
      setIsAnalyzing(false);

      return liveResult;
    } catch (backendError: any) {
      setIsBackendOnline(false);
      setIsAnalyzing(false);
      console.warn('Backend prediction failed:', backendError.message);
      throw new Error(backendError.message || 'Could not connect to FastAPI AI backend.');
    }
  };

  const clearHistory = async () => {
    setHistory([]);
    await AsyncStorage.removeItem(HISTORY_KEY);
  };

  return (
    <DetectionContext.Provider
      value={{
        history,
        latestResult,
        isAnalyzing,
        backendStatus,
        isBackendOnline,
        checkStatus: refreshStatus,
        analyzeImage,
        saveDetectionResult,
        clearHistory,
        setLatestResult,
      }}
    >
      {children}
    </DetectionContext.Provider>
  );
};

export const useDetection = () => {
  const context = useContext(DetectionContext);
  if (!context) {
    throw new Error('useDetection must be used within a DetectionProvider');
  }
  return context;
};
