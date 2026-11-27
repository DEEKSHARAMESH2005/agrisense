import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { colors } from '../../constants/colors';
import { useDetection } from '../../context/DetectionContext';
import { Header } from '../../components/common/Header';
import { DiseaseResultModal } from '../disease/DiseaseResultModal';
import { LiveCameraScannerModal } from '../../components/disease/LiveCameraScannerModal';
import { VideoLeafPlayer } from '../../components/disease/VideoLeafPlayer';
import { DiseaseDetection } from '../../types';
import {
  sampleLeaves as defaultSampleLeaves,
  fetchSampleLeaves,
  SampleLeaf,
} from '../../constants/mockData';
import {
  getBackendBaseUrl,
  setBackendBaseUrl,
  LAN_HOST,
} from '../../services/diseaseApi';
import {
  Camera,
  Image as ImageIcon,
  Video as VideoIcon,
  FileUp,
  Scan,
  Sparkles,
  History,
  AlertCircle,
  HelpCircle,
  Settings,
  Server,
  RefreshCw,
  CheckCircle,
  X,
  ArrowRight,
} from 'lucide-react-native';

interface DiseaseScreenProps {
  navigation: any;
}

export const DiseaseScreen: React.FC<DiseaseScreenProps> = ({ navigation }) => {
  const {
    analyzeImage,
    analyzeVideo,
    saveDetectionResult,
    isAnalyzing,
    latestResult,
    history,
    backendStatus,
    isBackendOnline,
    checkStatus,
  } = useDetection();

  const [leaves, setLeaves] = useState<SampleLeaf[]>(defaultSampleLeaves);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedBase64, setSelectedBase64] = useState<string | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<'image' | 'video'>('image');
  const [selectedVideoMeta, setSelectedVideoMeta] = useState<{
    uri: string;
    mimeType?: string;
    fileName?: string;
    durationMs?: number;
    webFile?: File;
  } | null>(null);
  const [activeResult, setActiveResult] = useState<DiseaseDetection | null>(null);
  const [isCustomUpload, setIsCustomUpload] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [liveCameraVisible, setLiveCameraVisible] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState('Initializing AI analysis...');

  // Backend config modal state
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState('http://10.0.2.2:8000');
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  useEffect(() => {
    fetchSampleLeaves().then(setLeaves);
    getBackendBaseUrl().then((url) => {
      setServerUrlInput(url || 'http://10.0.2.2:8000');
    });
    checkStatus();
  }, []);

  const handleTestConnection = async (testUrl?: string) => {
    const rawUrl = testUrl || serverUrlInput;
    const urlToTest =
      rawUrl && rawUrl.trim().length > 0 ? rawUrl.trim() : 'http://10.0.2.2:8000';
    setServerUrlInput(urlToTest);
    setIsTestingConnection(true);
    try {
      await setBackendBaseUrl(urlToTest);
      const status = await checkStatus();
      if (status.online) {
        Alert.alert(
          'Connected!',
          `Successfully connected to ${status.modelName} on ${status.device.toUpperCase()}!\nActive Host: ${status.url}`
        );
      } else {
        Alert.alert(
          'Connection Failed',
          `Could not connect to ${status.url}.\nEnsure the backend is running with:\npython run.py`
        );
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Connection test failed');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const ensureMediaLibraryPermission = async (mediaLabel: string): Promise<boolean> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission Needed',
        `Gallery access is needed to select a leaf ${mediaLabel} from your phone.`
      );
      return false;
    }
    return true;
  };

  const handleClearMedia = () => {
    setSelectedImage(null);
    setSelectedBase64(null);
    setSelectedMediaType('image');
    setSelectedVideoMeta(null);
    setActiveResult(null);
    setIsCustomUpload(false);
  };

  const pickFromGallery = async () => {
    try {
      if (!(await ensureMediaLibraryPermission('photo'))) return;

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.85,
        base64: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        setActiveResult(null);
        setSelectedMediaType('image');
        setSelectedVideoMeta(null);
        setSelectedImage(res.assets[0].uri);
        setSelectedBase64(res.assets[0].base64 || null);
        setIsCustomUpload(true);
      }
    } catch (e) {
      console.warn('Error picking image', e);
      Alert.alert('Notice', 'Unable to open gallery to select image.');
    }
  };

  const pickVideoFromGallery = async () => {
    try {
      if (!(await ensureMediaLibraryPermission('video'))) return;

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        let previewUri: string | null = null;
        try {
          const thumb = await VideoThumbnails.getThumbnailAsync(asset.uri, {
            time: 500,
            quality: 0.7,
          });
          previewUri = thumb.uri;
        } catch {
          // Thumbnail generation optional on some devices
        }

        setActiveResult(null);
        setSelectedMediaType('video');
        setSelectedVideoMeta({
          uri: asset.uri,
          mimeType: asset.mimeType || 'video/mp4',
          fileName: asset.fileName || 'leaf_video.mp4',
          durationMs: asset.duration || undefined,
          webFile: asset.file,
        });
        setSelectedImage(previewUri);
        setSelectedBase64(null);
        setIsCustomUpload(true);
      }
    } catch (e) {
      console.warn('Error picking video', e);
      Alert.alert('Notice', 'Unable to open gallery to select video.');
    }
  };

  const pickFromFileSystem = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'video/*'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        const mime = (asset.mimeType || '').toLowerCase();
        const name = (asset.name || '').toLowerCase();
        const isVideo =
          mime.startsWith('video/') ||
          /\.(mp4|mov|avi|mkv|webm|3gp|m4v)$/i.test(name);
        const isImage =
          mime.startsWith('image/') ||
          /\.(jpg|jpeg|png|webp|bmp)$/i.test(name);

        setActiveResult(null);

        if (isVideo) {
          setSelectedMediaType('video');
          setSelectedVideoMeta({
            uri: asset.uri,
            mimeType: asset.mimeType || 'video/mp4',
            fileName: asset.name || 'leaf_video.mp4',
            webFile: asset.file,
          });
          setSelectedImage(null);
          setSelectedBase64(null);
          setIsCustomUpload(true);
        } else if (isImage) {
          let b64: string | null = null;
          let imageUri = asset.uri;
          try {
            const manip = await manipulateAsync(asset.uri, [], {
              base64: true,
              format: SaveFormat.JPEG,
            });
            b64 = manip.base64 || null;
            imageUri = manip.uri;
          } catch (e) {
            console.warn('Could not pre-convert to base64', e);
          }

          setSelectedMediaType('image');
          setSelectedVideoMeta(null);
          setSelectedImage(imageUri);
          setSelectedBase64(b64);
          setIsCustomUpload(true);
        } else {
          Alert.alert(
            'Unsupported File Type',
            'Please select an image (JPG, PNG, WEBP) or video (MP4, MOV, MKV) file.'
          );
        }
      }
    } catch (e) {
      console.warn('Error picking file', e);
      Alert.alert('Notice', 'Unable to pick file from device storage.');
    }
  };

  const openLiveCamera = () => {
    setLiveCameraVisible(true);
  };

  const handleAnalyze = async () => {
    if (!selectedImage && !selectedVideoMeta) {
      Alert.alert(
        'Select Media',
        'Please open the camera or upload a leaf photo, video, or file first.'
      );
      return;
    }

    const isVideo = selectedMediaType === 'video' && Boolean(selectedVideoMeta);

    if (isVideo) {
      setAnalyzingStep('Uploading leaf video for frame sampling...');
    } else if (isBackendOnline) {
      setAnalyzingStep('Uploading image to MobileNetV2 backend...');
    } else {
      setAnalyzingStep('Scanning chlorophyll & cellular patterns...');
    }

    const timer1 = setTimeout(() => {
      setAnalyzingStep(
        isVideo
          ? 'Sampling key video frames & running MobileNetV2 inference...'
          : isBackendOnline
          ? 'Running PyTorch neural network forward pass (224x224 RGB)...'
          : 'Comparing with 54,000+ agricultural pathogen patterns...'
      );
    }, 600);

    const timer2 = setTimeout(() => {
      setAnalyzingStep('Compiling organic, chemical, and agronomic cure protocols...');
    }, 1200);

    try {
      let result: DiseaseDetection;
      if (isVideo && selectedVideoMeta) {
        result = await analyzeVideo(selectedVideoMeta.uri, {
          mimeType: selectedVideoMeta.mimeType,
          fileName: selectedVideoMeta.fileName,
          webFile: selectedVideoMeta.webFile,
          previewUri: selectedImage || selectedVideoMeta.uri,
        });
      } else if (selectedImage) {
        result = await analyzeImage(selectedImage, selectedBase64);
      } else {
        throw new Error('No media selected for analysis.');
      }

      clearTimeout(timer1);
      clearTimeout(timer2);
      setActiveResult(result);
      setModalVisible(true);
    } catch (e: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      Alert.alert(
        'Analysis Error',
        e.message || 'Diagnosis failed. Please verify server connection.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="AI Plant Doctor"
        subtitle="Leaf Diagnostic & Pathology Engine"
        showRoleSwitch={false}
        rightAction={
          <TouchableOpacity
            style={styles.historyBtn}
            onPress={() => navigation.navigate('DiseaseHistory')}
            activeOpacity={0.7}
          >
            <History size={18} color={colors.textPrimary} />
            <Text style={styles.historyBtnText}>({history.length})</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Backend Connection Status Pill */}
        <TouchableOpacity
          style={[
            styles.serverStatusStrip,
            isBackendOnline
              ? styles.serverStatusOnline
              : styles.serverStatusOffline,
          ]}
          onPress={() => setConfigModalVisible(true)}
          activeOpacity={0.75}
        >
          <View style={styles.serverStatusLeft}>
            <View
              style={[
                styles.serverStatusDot,
                { backgroundColor: isBackendOnline ? '#16A34A' : '#D97706' },
              ]}
            />
            <Text
              style={[
                styles.serverStatusText,
                { color: isBackendOnline ? '#15803D' : '#92400E' },
              ]}
              numberOfLines={1}
            >
              {isBackendOnline
                ? `MobileNetV2 Live AI (${backendStatus?.device?.toUpperCase() || 'CPU'})`
                : 'Backend Offline (Using Standalone Mode)'}
            </Text>
          </View>
          <View style={styles.serverStatusRight}>
            <Text
              style={[
                styles.serverActionText,
                { color: isBackendOnline ? '#15803D' : '#92400E' },
              ]}
            >
              Config
            </Text>
            <Settings size={13} color={isBackendOnline ? '#15803D' : '#92400E'} />
          </View>
        </TouchableOpacity>

        {/* Main Leaf Viewport / Video Player / Camera Frame */}
        <View style={styles.scannerCard}>
          <View style={styles.imageFrame}>
            {selectedMediaType === 'video' && selectedVideoMeta ? (
              <VideoLeafPlayer
                videoUri={selectedVideoMeta.uri}
                fileName={selectedVideoMeta.fileName}
                durationMs={selectedVideoMeta.durationMs}
                detectionResult={activeResult}
                isAnalyzing={isAnalyzing}
                onClear={handleClearMedia}
                onViewDetails={() => setModalVisible(true)}
              />
            ) : selectedImage ? (
              <View style={styles.imageWrapper}>
                <Image source={{ uri: selectedImage }} style={styles.previewImage} />

                {/* Corner guide lines */}
                <View style={[styles.cornerGuide, styles.topLeft]} />
                <View style={[styles.cornerGuide, styles.topRight]} />
                <View style={[styles.cornerGuide, styles.bottomLeft]} />
                <View style={[styles.cornerGuide, styles.bottomRight]} />

                {/* AI badge overlay */}
                <View style={styles.aiBadgeOverlay}>
                  <Sparkles size={13} color="#FFFFFF" />
                  <Text style={styles.aiBadgeText}>
                    {isCustomUpload
                      ? 'Uploaded Leaf Photo'
                      : isBackendOnline
                      ? 'Hugging Face MobileNetV2'
                      : 'AI Vision Scanner'}
                  </Text>
                </View>

                {/* Clear / Remove media action */}
                <TouchableOpacity
                  style={styles.clearImageBtn}
                  onPress={handleClearMedia}
                  activeOpacity={0.8}
                >
                  <X size={13} color="#FFFFFF" />
                  <Text style={styles.clearImageText}>Clear</Text>
                </TouchableOpacity>

                {/* Disease HUD on image if analyzed */}
                {activeResult && (
                  <TouchableOpacity
                    style={styles.imageHudCard}
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.imageHudHeader}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.imageHudCrop}>{activeResult.cropName}</Text>
                        <Text style={styles.imageHudDisease} numberOfLines={1}>
                          {activeResult.diseaseName}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.imageHudBadge,
                          {
                            backgroundColor:
                              activeResult.diseaseName.toLowerCase().includes('healthy')
                                ? '#15803D'
                                : '#B91C1C',
                          },
                        ]}
                      >
                        <Text style={styles.imageHudBadgeText}>
                          {Math.round(
                            activeResult.confidence > 1
                              ? activeResult.confidence
                              : activeResult.confidence * 100
                          )}%
                        </Text>
                      </View>
                    </View>
                    <View style={styles.imageHudCtaRow}>
                      <Text style={styles.imageHudSummary} numberOfLines={1}>
                        {activeResult.description}
                      </Text>
                      <View style={styles.imageHudViewBtn}>
                        <Text style={styles.imageHudViewText}>Cure</Text>
                        <ArrowRight size={11} color="#FFFFFF" />
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.placeholderBox}>
                <View style={styles.placeholderIconRing}>
                  <Scan size={38} color="#22C55E" />
                </View>
                <Text style={styles.placeholderTitle}>No Leaf Media Selected</Text>
                <Text style={styles.placeholderText}>
                  Open live camera or upload a leaf photo, video, or file to diagnose
                </Text>
              </View>
            )}
          </View>

          {/* Controls: Camera / Photo / Video / File */}
          <View style={styles.controlsGrid}>
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={openLiveCamera}
              activeOpacity={0.8}
            >
              <Camera size={20} color={colors.primary} />
              <Text style={styles.controlBtnText}>Open Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlBtn}
              onPress={pickFromGallery}
              activeOpacity={0.8}
            >
              <ImageIcon size={20} color={colors.primary} />
              <Text style={styles.controlBtnText}>Upload Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlBtn}
              onPress={pickVideoFromGallery}
              activeOpacity={0.8}
            >
              <VideoIcon size={20} color={colors.primary} />
              <Text style={styles.controlBtnText}>Upload Video</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlBtn}
              onPress={pickFromFileSystem}
              activeOpacity={0.8}
            >
              <FileUp size={20} color={colors.primary} />
              <Text style={styles.controlBtnText}>Upload File</Text>
            </TouchableOpacity>
          </View>

          {/* Primary Analyze Action */}
          <TouchableOpacity
            style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
            onPress={handleAnalyze}
            disabled={isAnalyzing}
            activeOpacity={0.8}
          >
            {isAnalyzing ? (
              <View style={styles.analyzingRow}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.analyzingText}>{analyzingStep}</Text>
              </View>
            ) : (
              <View style={styles.analyzeContent}>
                <Sparkles size={18} color="#FFFFFF" />
                <Text style={styles.analyzeButtonText}>
                  {selectedMediaType === 'video'
                    ? 'Diagnose Leaf Video (Sample Frames)'
                    : isBackendOnline
                    ? 'Diagnose with MobileNetV2'
                    : 'Diagnose Leaf Health'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Sample Leaves Picker (for easy testing without camera) */}
        <View style={styles.sampleSection}>
          <View style={styles.sampleTitleRow}>
            <Text style={styles.sampleSectionTitle}>Or Test With Sample Leaves</Text>
            <Text style={styles.sampleSub}>
              Tap to test AI diagnostic accuracy instantly
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sampleScroll}
          >
            {leaves.map((leaf, idx) => {
              const isSelected = !isCustomUpload && selectedImage === leaf.uri;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.sampleCard,
                    isSelected && styles.sampleCardActive,
                  ]}
                  onPress={() => {
                    setSelectedMediaType('image');
                    setSelectedVideoMeta(null);
                    setSelectedImage(leaf.uri);
                    setSelectedBase64(null);
                    setActiveResult(null);
                    setIsCustomUpload(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: leaf.uri }} style={styles.sampleThumb} />
                  <View style={styles.sampleMeta}>
                    <Text style={styles.sampleCardTitle} numberOfLines={1}>
                      {leaf.title}
                    </Text>
                    <Text style={styles.sampleCropName}>{leaf.crop}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Photography / Scanning Guidelines */}
        <View style={styles.guidelineCard}>
          <View style={styles.guideTitleRow}>
            <HelpCircle size={16} color="#0284C7" />
            <Text style={styles.guideTitle}>Optimal Diagnosis Tips</Text>
          </View>
          <Text style={styles.guideBullet}>
            • Focus directly on the single affected leaf with good natural lighting.
          </Text>
          <Text style={styles.guideBullet}>
            • When recording or uploading leaf video, pan slowly across the leaf surface for 3-10 seconds.
          </Text>
          <Text style={styles.guideBullet}>
            • Supported formats: JPG, PNG, WEBP, MP4, MOV, MKV, AVI, WEBM.
          </Text>
        </View>
      </ScrollView>

      {/* Live Camera Scanner Modal */}
      <LiveCameraScannerModal
        visible={liveCameraVisible}
        onClose={() => setLiveCameraVisible(false)}
        onOpenConfig={() => setConfigModalVisible(true)}
        onSaveAndViewDetails={async (detection) => {
          await saveDetectionResult(detection);
          setSelectedMediaType('image');
          setSelectedVideoMeta(null);
          setSelectedImage(detection.imageUri);
          setSelectedBase64(null);
          setActiveResult(detection);
          setIsCustomUpload(true);
          setLiveCameraVisible(false);
          setModalVisible(true);
        }}
      />

      {/* Disease Diagnosis & Cure Modal */}
      <DiseaseResultModal
        visible={modalVisible}
        result={activeResult || latestResult}
        onClose={() => setModalVisible(false)}
        onScanAnother={() => {
          setModalVisible(false);
          handleClearMedia();
        }}
      />

      {/* Backend Host Configuration Modal */}
      <Modal
        visible={configModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfigModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.configModalCard}>
            <View style={styles.configModalHeader}>
              <View style={styles.configModalTitleRow}>
                <Server size={20} color={colors.primary} />
                <Text style={styles.configModalTitle}>Backend Server Host</Text>
              </View>
              <TouchableOpacity
                style={styles.configModalClose}
                onPress={() => setConfigModalVisible(false)}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.configModalSubtitle}>
              Connect mobile app to the FastAPI MobileNetV2 backend.
            </Text>

            <View style={styles.statusBox}>
              <Text style={styles.statusBoxLabel}>Current Active Target:</Text>
              <Text
                style={[
                  styles.statusBoxValue,
                  { color: isBackendOnline ? '#15803D' : '#DC2626' },
                ]}
              >
                {backendStatus?.url || serverUrlInput} •{' '}
                {isBackendOnline ? 'ONLINE' : 'UNREACHABLE'}
              </Text>
            </View>

            <Text style={styles.inputLabel}>Server URL (Host & Port):</Text>
            <TextInput
              style={styles.urlInput}
              value={serverUrlInput}
              onChangeText={setServerUrlInput}
              placeholder="http://10.0.2.2:8000"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.presetLabel}>Quick Presets:</Text>
            <View style={styles.presetRow}>
              <TouchableOpacity
                style={styles.presetBtn}
                onPress={() => handleTestConnection('http://10.0.2.2:8000')}
              >
                <Text style={styles.presetBtnText}>Android Emulator</Text>
                <Text style={styles.presetSubText}>10.0.2.2:8000</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.presetBtn}
                onPress={() => handleTestConnection(LAN_HOST)}
              >
                <Text style={styles.presetBtnText}>Wi-Fi Device</Text>
                <Text style={styles.presetSubText}>{LAN_HOST.replace(/^https?:\/\//, '')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.presetBtn}
                onPress={() => handleTestConnection('http://localhost:8000')}
              >
                <Text style={styles.presetBtnText}>Localhost / Web</Text>
                <Text style={styles.presetSubText}>127.0.0.1:8000</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.testBtn}
              onPress={() => handleTestConnection()}
              disabled={isTestingConnection}
              activeOpacity={0.8}
            >
              {isTestingConnection ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <RefreshCw size={16} color="#FFFFFF" />
                  <Text style={styles.testBtnText}>Test & Save Connection</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF8',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  historyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  serverStatusStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
  },
  serverStatusOnline: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  serverStatusOffline: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  serverStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  serverStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  serverStatusText: {
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  serverStatusRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serverActionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  imageFrame: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  placeholderIconRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(34, 197, 94, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  placeholderTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  placeholderText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 17,
  },
  clearImageBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    zIndex: 10,
  },
  clearImageText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cornerGuide: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#22C55E',
  },
  topLeft: {
    top: 14,
    left: 14,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 14,
    right: 14,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 14,
    left: 14,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 14,
    right: 14,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  aiBadgeOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    zIndex: 10,
  },
  aiBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  imageHudCard: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(34, 197, 94, 0.6)',
    zIndex: 10,
  },
  imageHudHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  imageHudCrop: {
    color: '#4ADE80',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  imageHudDisease: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  imageHudBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  imageHudBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  imageHudCtaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  imageHudSummary: {
    color: '#CBD5E1',
    fontSize: 10,
    flex: 1,
  },
  imageHudViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  imageHudViewText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  controlsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 14,
  },
  controlBtn: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  controlBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
  analyzeButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#1E5631CC',
  },
  analyzeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  analyzingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  analyzingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  sampleSection: {
    marginBottom: 20,
  },
  sampleTitleRow: {
    marginBottom: 10,
  },
  sampleSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  sampleSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sampleScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  sampleCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  sampleCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#F0FDF4',
  },
  sampleThumb: {
    width: '100%',
    height: 80,
    resizeMode: 'cover',
  },
  sampleMeta: {
    padding: 8,
  },
  sampleCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sampleCropName: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
  guidelineCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  guideTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  guideTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0369A1',
  },
  guideBullet: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  configModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  configModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  configModalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  configModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  configModalClose: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  configModalSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 14,
  },
  statusBox: {
    backgroundColor: '#F8FAF8',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusBoxLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  statusBoxValue: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  urlInput: {
    backgroundColor: '#F8FAF8',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 14,
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  presetBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  presetBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  presetSubText: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  testBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
  },
  testBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
