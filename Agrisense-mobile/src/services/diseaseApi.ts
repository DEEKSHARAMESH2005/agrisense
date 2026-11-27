import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { DiseaseDetection } from '../types';

const BACKEND_URL_KEY = '@agrisense_backend_url';

// Default host configurations:
// - Android Emulator: 10.0.2.2 routes to the host computer's localhost
// - Android Physical Device over LAN: uses the local Wi-Fi IP
// - iOS Simulator / Web: localhost
const DEFAULT_HOST = Platform.select({
  android: 'http://10.0.2.2:8000',
  default: 'http://localhost:8000',
});

// Fallback LAN IP for physical device testing on same Wi-Fi
export const LAN_HOST = 'http://192.168.0.5:8000';

export interface BackendStatus {
  online: boolean;
  modelLoaded: boolean;
  modelName: string;
  device: string;
  supportedClasses: number;
  url: string;
  error?: string;
}

export interface BackendPredictionResponse {
  success: boolean;
  is_uncertain: boolean;
  uncertainty_warning: string | null;
  prediction: {
    crop: string;
    disease: string;
    class_name: string;
    confidence: number;
  };
  alternatives: Array<{
    crop: string;
    disease: string;
    class_name: string;
    confidence: number;
  }>;
  disease_information: {
    crop?: string;
    disease?: string;
    class_name?: string;
    is_healthy?: boolean;
    description?: string;
    symptoms?: string[];
    causes?: string[];
    treatment?: {
      organic?: string[];
      chemical?: string[];
      cultural?: string[];
    };
    prevention?: string[];
    references?: string[];
  };
  inference_time_ms: number;
  timestamp: string;
  disclaimer: string;
}

/**
 * Get active backend base URL (saved in storage or default)
 */
export const getBackendBaseUrl = async (): Promise<string> => {
  try {
    const saved = await AsyncStorage.getItem(BACKEND_URL_KEY);
    if (saved && saved.trim().length > 0) return saved.trim();
  } catch (e) {
    // Ignore storage read error
  }
  return DEFAULT_HOST;
};

/**
 * Save user-configured backend base URL
 */
export const setBackendBaseUrl = async (url: string): Promise<void> => {
  let cleaned = (url || '').trim();
  if (!cleaned) {
    cleaned = DEFAULT_HOST;
  }
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `http://${cleaned}`;
  }
  if (cleaned.endsWith('/')) {
    cleaned = cleaned.slice(0, -1);
  }
  // Strip /api/v1 if typed
  if (cleaned.endsWith('/api/v1')) {
    cleaned = cleaned.replace('/api/v1', '');
  }
  await AsyncStorage.setItem(BACKEND_URL_KEY, cleaned);
};

/**
 * Ping backend health & model status with multi-host auto-discovery
 */
export const checkBackendStatus = async (): Promise<BackendStatus> => {
  const configuredUrl = await getBackendBaseUrl();
  const candidateUrls = Array.from(
    new Set([
      configuredUrl,
      'http://10.0.2.2:8000',
      'http://localhost:8000',
      'http://127.0.0.1:8000',
      LAN_HOST,
    ])
  ).filter(Boolean);

  for (const url of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${url}/api/v1/model/status`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (url !== configuredUrl) {
          await setBackendBaseUrl(url);
        }
        return {
          online: true,
          modelLoaded: Boolean(data.model_loaded),
          modelName: data.model_name || 'neghani/plantvillage-mobilenetv2',
          device: data.device || 'CPU',
          supportedClasses: data.supported_classes_count || 38,
          url: url,
        };
      }
    } catch (e) {
      // Try next candidate
    }
  }

  return {
    online: false,
    modelLoaded: false,
    modelName: '',
    device: '',
    supportedClasses: 0,
    url: configuredUrl,
    error: 'Backend is unreachable across candidate hosts (10.0.2.2, localhost, LAN).',
  };
};

/**
 * Determine severity label from disease name and confidence
 */
const calculateSeverity = (diseaseName: string, confidence: number): 'Mild' | 'Moderate' | 'Severe' => {
  const lower = diseaseName.toLowerCase();
  if (lower.includes('healthy')) return 'Mild';
  if (lower.includes('late blight') || lower.includes('black rot') || lower.includes('greening')) {
    return 'Severe';
  }
  if (lower.includes('early blight') || lower.includes('bacterial') || lower.includes('spot') || lower.includes('mold')) {
    return confidence > 85 ? 'Severe' : 'Moderate';
  }
  return 'Moderate';
};

/**
 * Predict plant disease by uploading leaf image to the FastAPI backend
 */
/**
 * Convert a URI (remote URL, file://, or content://) to a Base64 string safely
 */
export const uriToBase64 = async (uri: string): Promise<string> => {
  if (uri.startsWith('data:')) {
    const parts = uri.split(',');
    return parts.length > 1 ? parts[1] : parts[0];
  }

  // 1. Primary Strategy: native image manipulator (handles file://, content://, and assets)
  try {
    const manip = await manipulateAsync(uri, [], {
      base64: true,
      format: SaveFormat.JPEG,
    });
    if (manip.base64) {
      return manip.base64;
    }
  } catch (err) {
    // Continue to next strategy if manipulator fails (e.g. non-image file)
  }

  // 2. Secondary Strategy: native FileSystem.readAsStringAsync
  try {
    const b64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    if (b64) return b64;
  } catch (err) {
    // Continue to next strategy
  }

  // 3. Web / Remote fallback: fetch blob + FileReader
  const res = await fetch(uri);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const b64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      resolve(b64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Map FastAPI prediction JSON to the app's DiseaseDetection shape
 */
const mapBackendPredictionToDetection = (
  data: BackendPredictionResponse,
  imageUri: string
): DiseaseDetection => {
  const pred = data.prediction;
  const info = data.disease_information || {};

  return {
    id: `diag_${Date.now()}`,
    cropName: pred.crop,
    diseaseName: pred.disease,
    confidence: pred.confidence,
    severity: calculateSeverity(pred.disease, pred.confidence),
    description:
      info.description ||
      `AI model diagnosis of ${pred.disease} on ${pred.crop} with ${pred.confidence}% confidence.`,
    symptoms: info.symptoms || [],
    treatment: {
      organic: info.treatment?.organic || [],
      chemical: info.treatment?.chemical || [],
      cultural: info.treatment?.cultural || [],
    },
    prevention: info.prevention || [],
    causes: info.causes || [],
    imageUri: imageUri,
    date: new Date(data.timestamp || Date.now()).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
    isDemo: false, // Live AI result from Hugging Face model!
    isUncertain: data.is_uncertain,
    uncertaintyWarning: data.uncertainty_warning || undefined,
    alternatives: data.alternatives || [],
    inferenceTimeMs: data.inference_time_ms,
  };
};

/**
 * Predict plant disease for a live camera video frame (skips DB history logging)
 */
export const predictLiveFrameFromBackend = async (
  imageUri: string,
  base64Data: string,
  userId?: string
): Promise<DiseaseDetection> => {
  const baseUrl = await getBackendBaseUrl();
  const candidateUrls = Array.from(
    new Set([
      baseUrl,
      'http://10.0.2.2:8000',
      'http://localhost:8000',
      'http://127.0.0.1:8000',
      LAN_HOST,
    ])
  ).filter(Boolean);

  let lastError: any = null;

  for (const url of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`${url}/api/v1/disease/predict-base64`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          image_base64: base64Data,
          filename: 'live_frame.jpg',
          user_id: userId || null,
          save_history: false,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        if (url !== baseUrl) {
          await setBackendBaseUrl(url);
        }
        const data: BackendPredictionResponse = await response.json();
        return mapBackendPredictionToDetection(data, imageUri);
      }
      lastError = new Error(`Backend returned status ${response.status}`);
    } catch (err: any) {
      lastError = err;
    }
  }

  throw new Error(lastError?.message || 'Could not reach AI backend for live detection.');
};

export interface VideoUploadOptions {
  mimeType?: string;
  fileName?: string;
  webFile?: File;
  previewUri?: string;
  userId?: string;
}

/**
 * Predict plant disease by uploading a recorded/gallery leaf video to FastAPI
 */
export const predictVideoFromBackend = async (
  videoUri: string,
  options?: VideoUploadOptions
): Promise<DiseaseDetection> => {
  const baseUrl = await getBackendBaseUrl();
  const candidateUrls = Array.from(
    new Set([
      baseUrl,
      'http://10.0.2.2:8000',
      'http://localhost:8000',
      'http://127.0.0.1:8000',
      LAN_HOST,
    ])
  ).filter(Boolean);

  const fileName = options?.fileName || videoUri.split('/').pop() || 'leaf_video.mp4';
  const mimeType = options?.mimeType || 'video/mp4';

  let resData: BackendPredictionResponse | null = null;
  let lastError: any = null;

  for (const url of candidateUrls) {
    try {
      if (Platform.OS === 'web') {
        const formData = new FormData();
        if (options?.webFile) {
          formData.append('file', options.webFile, fileName);
        }
        if (options?.userId) {
          formData.append('user_id', options.userId);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);
        const response = await fetch(`${url}/api/v1/disease/predict-video`, {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          resData = await response.json();
          if (url !== baseUrl) await setBackendBaseUrl(url);
          break;
        } else {
          const errorText = await response.text();
          throw new Error(errorText || `Backend returned ${response.status}`);
        }
      } else {
        // Native Android / iOS: Use FileSystem.uploadAsync
        // Bypasses React Native's FormData which throws "Unsupported FormDataPart implementation"
        const uploadResult = await FileSystem.uploadAsync(
          `${url}/api/v1/disease/predict-video`,
          videoUri,
          {
            httpMethod: 'POST',
            uploadType: FileSystem.FileSystemUploadType.MULTIPART,
            fieldName: 'file',
            mimeType: mimeType,
            parameters: options?.userId ? { user_id: options.userId } : undefined,
            headers: {
              Accept: 'application/json',
            },
          }
        );

        if (uploadResult.status >= 200 && uploadResult.status < 300) {
          resData = JSON.parse(uploadResult.body);
          if (url !== baseUrl) await setBackendBaseUrl(url);
          break;
        } else {
          let errorMsg = `Upload failed with status ${uploadResult.status}`;
          try {
            const parsed = JSON.parse(uploadResult.body);
            if (parsed.detail) errorMsg = parsed.detail;
          } catch {}
          throw new Error(errorMsg);
        }
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  if (!resData) {
    throw new Error(lastError?.message || 'Video analysis failed. Please verify server connection.');
  }

  return mapBackendPredictionToDetection(resData, options?.previewUri || videoUri);
};

/**
 * Predict plant disease by sending leaf image to the FastAPI backend
 */
export const predictDiseaseFromBackend = async (
  imageUri: string,
  base64Data?: string | null,
  userId?: string
): Promise<DiseaseDetection> => {
  let baseUrl = await getBackendBaseUrl();
  let b64Payload = base64Data;

  if (!b64Payload) {
    try {
      b64Payload = await uriToBase64(imageUri);
    } catch (e) {
      // conversion failed, will try uploadAsync
    }
  }

  const candidateUrls = Array.from(
    new Set([
      baseUrl,
      'http://10.0.2.2:8000',
      'http://localhost:8000',
      'http://127.0.0.1:8000',
      LAN_HOST,
    ])
  ).filter(Boolean);

  let resData: BackendPredictionResponse | null = null;
  let lastError: any = null;

  // 1. Primary Strategy: JSON Base64 (Immune to all React Native FormData bugs)
  if (b64Payload) {
    for (const url of candidateUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);
        const endpoint = `${url}/api/v1/disease/predict-base64`;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            image_base64: b64Payload,
            filename: 'leaf_photo.jpg',
            user_id: userId || null,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          resData = await response.json();
          if (url !== baseUrl) await setBackendBaseUrl(url);
          break;
        }
      } catch (err: any) {
        lastError = err;
      }
    }
  }

  // 2. Secondary Strategy: Native FileSystem Upload (Immune to New Architecture FormData bugs)
  if (!resData) {
    const filename = imageUri.split('/').pop() || 'leaf_photo.jpg';
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

    for (const url of candidateUrls) {
      try {
        if (Platform.OS === 'web') {
          const formData = new FormData();
          const blobRes = await fetch(imageUri);
          const blob = await blobRes.blob();
          formData.append('file', blob, filename);
          if (userId) formData.append('user_id', userId);

          const response = await fetch(`${url}/api/v1/disease/predict`, {
            method: 'POST',
            body: formData,
            headers: { Accept: 'application/json' },
          });
          if (response.ok) {
            resData = await response.json();
            if (url !== baseUrl) await setBackendBaseUrl(url);
            break;
          }
        } else {
          // Native mobile: FileSystem.uploadAsync
          const uploadResult = await FileSystem.uploadAsync(
            `${url}/api/v1/disease/predict`,
            imageUri,
            {
              httpMethod: 'POST',
              uploadType: FileSystem.FileSystemUploadType.MULTIPART,
              fieldName: 'file',
              mimeType: mimeType,
              parameters: userId ? { user_id: userId } : undefined,
              headers: { Accept: 'application/json' },
            }
          );

          if (uploadResult.status >= 200 && uploadResult.status < 300) {
            resData = JSON.parse(uploadResult.body);
            if (url !== baseUrl) await setBackendBaseUrl(url);
            break;
          }
        }
      } catch (err: any) {
        lastError = err;
      }
    }
  }

  if (!resData) {
    throw new Error(
      lastError?.message || 'Plant disease diagnosis failed. Please check backend connection.'
    );
  }

  return mapBackendPredictionToDetection(resData, imageUri);
};
