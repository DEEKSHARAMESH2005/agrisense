import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import {
  X,
  Zap,
  ZapOff,
  RefreshCw,
  Pause,
  Play,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Server,
  Camera,
} from 'lucide-react-native';
import { DiseaseDetection } from '../../types';
import { predictLiveFrameFromBackend } from '../../services/diseaseApi';
import { colors } from '../../constants/colors';

interface LiveCameraScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveAndViewDetails: (detection: DiseaseDetection) => void;
  onOpenConfig: () => void;
}

const FRAME_INTERVAL_MS = 900;

export const LiveCameraScannerModal: React.FC<LiveCameraScannerModalProps> = ({
  visible,
  onClose,
  onSaveAndViewDetails,
  onOpenConfig,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [torchOn, setTorchOn] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [liveResult, setLiveResult] = useState<DiseaseDetection | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isProcessingFrame, setIsProcessingFrame] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const recentLabelsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!visible) {
      setCameraReady(false);
      setIsPaused(false);
      setTorchOn(false);
      setLiveResult(null);
      setIsConfirmed(false);
      setConnectionError(null);
      setCameraError(null);
      recentLabelsRef.current = [];
      return;
    }

    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [visible, permission?.granted]);

  useEffect(() => {
    if (!visible || !permission?.granted || !cameraReady || isPaused || cameraError) {
      return;
    }

    let active = true;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const scanNextFrame = async () => {
      if (!active) return;

      if (cameraRef.current) {
        setIsProcessingFrame(true);
        try {
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.4,
            base64: false,
            shutterSound: false,
          });

          if (!active || !photo?.uri) {
            return;
          }

          let frameBase64 = photo.base64 || '';
          let frameUri = photo.uri;

          try {
            const resized = await manipulateAsync(
              photo.uri,
              [{ resize: { width: 320 } }],
              { compress: 0.65, format: SaveFormat.JPEG, base64: true }
            );
            if (resized.base64) {
              frameBase64 = resized.base64;
              frameUri = resized.uri;
            }
          } catch {
            // Fallback to raw capture if resize fails on a platform
            if (!frameBase64) {
              const fallback = await cameraRef.current.takePictureAsync({
                quality: 0.3,
                base64: true,
                shutterSound: false,
              });
              frameBase64 = fallback?.base64 || '';
              frameUri = fallback?.uri || frameUri;
            }
          }

          if (!active || !frameBase64) {
            return;
          }

          const detection = await predictLiveFrameFromBackend(frameUri, frameBase64);
          if (!active) return;

          setConnectionError(null);
          setLiveResult(detection);

          const labelKey = `${detection.cropName}___${detection.diseaseName}`;
          const nextLabels = detection.isUncertain
            ? []
            : [...recentLabelsRef.current, labelKey].slice(-3);
          recentLabelsRef.current = nextLabels;

          const matchingCount = nextLabels.filter((l) => l === labelKey).length;
          setIsConfirmed(!detection.isUncertain && matchingCount >= 2);
        } catch (err: any) {
          if (!active) return;
          const msg = err?.message || 'Unable to reach AI backend';
          // Ignore transient capture errors when camera unmounts/pauses
          if (!/unmount|not ready|stopped/i.test(msg)) {
            setConnectionError(msg);
          }
        } finally {
          if (active) {
            setIsProcessingFrame(false);
          }
        }
      }

      if (active) {
        timerId = setTimeout(scanNextFrame, FRAME_INTERVAL_MS);
      }
    };

    // Kick off first scan shortly after camera preview stabilizes
    timerId = setTimeout(scanNextFrame, 450);

    return () => {
      active = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [visible, permission?.granted, cameraReady, isPaused, cameraError]);

  const isHealthy = liveResult?.diseaseName?.toLowerCase().includes('healthy');

  const getSeverityBadgeStyle = (severity?: string) => {
    if (isHealthy) return { bg: '#DCFCE7', text: '#15803D' };
    if (severity === 'Severe') return { bg: '#FEE2E2', text: '#B91C1C' };
    if (severity === 'Moderate') return { bg: '#FEF3C7', text: '#B45309' };
    return { bg: '#DCFCE7', text: '#15803D' };
  };

  const severityStyle = getSeverityBadgeStyle(liveResult?.severity);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        {!permission?.granted ? (
          <SafeAreaView style={styles.permissionBox}>
            <View style={styles.permissionIconRing}>
              <Camera size={38} color="#22C55E" />
            </View>
            <Text style={styles.permissionTitle}>Camera Permission Needed</Text>
            <Text style={styles.permissionSubtitle}>
              Allow camera access to point at a plant leaf and detect diseases live.
            </Text>
            <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
              <Text style={styles.permissionBtnText}>Grant Camera Access</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelLink} onPress={onClose}>
              <Text style={styles.cancelLinkText}>Close</Text>
            </TouchableOpacity>
          </SafeAreaView>
        ) : (
          <View style={styles.cameraContainer}>
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing={facing}
              enableTorch={torchOn}
              animateShutter={false}
              onCameraReady={() => setCameraReady(true)}
              onMountError={(e) => setCameraError(e.message || 'Camera failed to start')}
            />

            {/* Top HUD Bar */}
            <SafeAreaView style={styles.topOverlay}>
              <View style={styles.topBar}>
                <TouchableOpacity style={styles.iconPillBtn} onPress={onClose}>
                  <X size={20} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.liveStatusPill}>
                  <View
                    style={[
                      styles.liveDot,
                      {
                        backgroundColor: isPaused
                          ? '#94A3B8'
                          : connectionError
                          ? '#EF4444'
                          : '#22C55E',
                      },
                    ]}
                  />
                  <Text style={styles.liveStatusText}>
                    {isPaused
                      ? 'PAUSED'
                      : connectionError
                      ? 'BACKEND OFFLINE'
                      : isProcessingFrame
                      ? 'ANALYZING LEAF...'
                      : 'LIVE AI SCAN'}
                  </Text>
                  {liveResult?.inferenceTimeMs ? (
                    <Text style={styles.latencyText}>
                      {Math.round(liveResult.inferenceTimeMs)}ms
                    </Text>
                  ) : null}
                </View>

                <View style={styles.topRightActions}>
                  <TouchableOpacity
                    style={styles.iconPillBtn}
                    onPress={() => setTorchOn((prev) => !prev)}
                  >
                    {torchOn ? (
                      <Zap size={18} color="#FACC15" />
                    ) : (
                      <ZapOff size={18} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconPillBtn}
                    onPress={() =>
                      setFacing((prev) => (prev === 'back' ? 'front' : 'back'))
                    }
                  >
                    <RefreshCw size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              {connectionError ? (
                <TouchableOpacity
                  style={styles.errorBanner}
                  onPress={() => {
                    onClose();
                    onOpenConfig();
                  }}
                >
                  <Server size={15} color="#FEF2F2" />
                  <Text style={styles.errorBannerText} numberOfLines={2}>
                    {connectionError} — Tap to configure backend host
                  </Text>
                </TouchableOpacity>
              ) : null}

              {cameraError ? (
                <View style={styles.errorBanner}>
                  <AlertTriangle size={15} color="#FEF2F2" />
                  <Text style={styles.errorBannerText}>{cameraError}</Text>
                </View>
              ) : null}
            </SafeAreaView>

            {/* Center Leaf Alignment Reticle */}
            <View style={styles.reticleWrapper} pointerEvents="none">
              <View
                style={[
                  styles.reticleBox,
                  liveResult && !liveResult.isUncertain && styles.reticleBoxLocked,
                ]}
              >
                <View style={[styles.corner, styles.tl, isConfirmed && styles.cornerConfirmed]} />
                <View style={[styles.corner, styles.tr, isConfirmed && styles.cornerConfirmed]} />
                <View style={[styles.corner, styles.bl, isConfirmed && styles.cornerConfirmed]} />
                <View style={[styles.corner, styles.br, isConfirmed && styles.cornerConfirmed]} />
              </View>
              <Text style={styles.reticleHint}>
                Center the leaf inside the frame
              </Text>
            </View>

            {/* Bottom Live Diagnosis HUD */}
            <SafeAreaView style={styles.bottomOverlay}>
              <View style={styles.hudCard}>
                {!liveResult ? (
                  <View style={styles.waitingRow}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <View style={styles.waitingTextWrap}>
                      <Text style={styles.waitingTitle}>
                        Point camera at a plant leaf
                      </Text>
                      <Text style={styles.waitingSub}>
                        Live MobileNetV2 disease detection will appear here automatically.
                      </Text>
                    </View>
                  </View>
                ) : liveResult.isUncertain ? (
                  <View>
                    <View style={styles.hudTopRow}>
                      <View style={styles.uncertainBadge}>
                        <AlertTriangle size={13} color="#B45309" />
                        <Text style={styles.uncertainBadgeText}>
                          Low Confidence ({liveResult.confidence.toFixed(1)}%)
                        </Text>
                      </View>
                      <Text style={styles.possibleLabel}>
                        Best guess: {liveResult.cropName} — {liveResult.diseaseName}
                      </Text>
                    </View>
                    <Text style={styles.uncertainHint}>
                      Move closer to the symptomatic leaf in bright light and hold steady.
                    </Text>
                  </View>
                ) : (
                  <View>
                    <View style={styles.hudTopRow}>
                      <View style={styles.cropPill}>
                        <Sparkles size={12} color="#15803D" />
                        <Text style={styles.cropPillText}>{liveResult.cropName}</Text>
                      </View>
                      <View
                        style={[
                          styles.severityPill,
                          { backgroundColor: severityStyle.bg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.severityPillText,
                            { color: severityStyle.text },
                          ]}
                        >
                          {isHealthy ? 'Healthy' : liveResult.severity} •{' '}
                          {liveResult.confidence.toFixed(1)}%
                        </Text>
                      </View>
                      {isConfirmed ? (
                        <View style={styles.confirmedPill}>
                          <CheckCircle size={12} color="#15803D" />
                          <Text style={styles.confirmedText}>Locked</Text>
                        </View>
                      ) : null}
                    </View>

                    <Text style={styles.diseaseTitle} numberOfLines={2}>
                      {liveResult.diseaseName}
                    </Text>

                    {liveResult.symptoms?.length > 0 ? (
                      <Text style={styles.symptomSnippet} numberOfLines={2}>
                        {liveResult.symptoms[0]}
                      </Text>
                    ) : (
                      <Text style={styles.symptomSnippet} numberOfLines={2}>
                        {liveResult.description}
                      </Text>
                    )}
                  </View>
                )}

                <View style={styles.hudActions}>
                  <TouchableOpacity
                    style={styles.pauseBtn}
                    onPress={() => setIsPaused((prev) => !prev)}
                  >
                    {isPaused ? (
                      <Play size={16} color={colors.textPrimary} />
                    ) : (
                      <Pause size={16} color={colors.textPrimary} />
                    )}
                    <Text style={styles.pauseBtnText}>
                      {isPaused ? 'Resume' : 'Pause'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.saveBtn,
                      !liveResult && styles.saveBtnDisabled,
                    ]}
                    disabled={!liveResult}
                    onPress={() => {
                      if (liveResult) {
                        setIsPaused(true);
                        onSaveAndViewDetails(liveResult);
                      }
                    }}
                  >
                    <CheckCircle size={16} color="#FFFFFF" />
                    <Text style={styles.saveBtnText}>Save & View Cure</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#020617',
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  permissionBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: '#0F172A',
  },
  permissionIconRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(34, 197, 94, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  permissionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionSubtitle: {
    color: '#CBD5E1',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  permissionBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  permissionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelLink: {
    marginTop: 16,
    padding: 8,
  },
  cancelLinkText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  topOverlay: {
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  topRightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconPillBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveStatusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  latencyText: {
    color: '#86EFAC',
    fontSize: 11,
    fontWeight: '700',
  },
  errorBanner: {
    marginTop: 10,
    backgroundColor: 'rgba(185, 28, 28, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorBannerText: {
    color: '#FEF2F2',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  reticleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticleBox: {
    width: 240,
    height: 240,
    position: 'relative',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  reticleBoxLocked: {
    backgroundColor: 'rgba(34, 197, 94, 0.06)',
  },
  corner: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderColor: '#FFFFFF',
  },
  cornerConfirmed: {
    borderColor: '#22C55E',
  },
  tl: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  tr: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  bl: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  br: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  reticleHint: {
    marginTop: 12,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    overflow: 'hidden',
  },
  bottomOverlay: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  hudCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 22,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  waitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  waitingTextWrap: {
    flex: 1,
  },
  waitingTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  waitingSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
  hudTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  cropPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  cropPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  severityPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  severityPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  confirmedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  confirmedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  diseaseTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  symptomSnippet: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    marginBottom: 14,
  },
  uncertainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  uncertainBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  possibleLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    flexShrink: 1,
  },
  uncertainHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 17,
  },
  hudActions: {
    flexDirection: 'row',
    gap: 10,
  },
  pauseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  pauseBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  saveBtnDisabled: {
    opacity: 0.45,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
