import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import {
  Play,
  Pause,
  X,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Video as VideoIcon,
} from 'lucide-react-native';
import { DiseaseDetection } from '../../types';
import { colors } from '../../constants/colors';

interface VideoLeafPlayerProps {
  videoUri: string;
  fileName?: string;
  durationMs?: number;
  detectionResult?: DiseaseDetection | null;
  isAnalyzing?: boolean;
  onClear: () => void;
  onViewDetails?: () => void;
}

export const VideoLeafPlayer: React.FC<VideoLeafPlayerProps> = ({
  videoUri,
  fileName,
  durationMs,
  detectionResult,
  isAnalyzing = false,
  onClear,
  onViewDetails,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const player = useVideoPlayer(videoUri, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  const togglePlay = () => {
    try {
      if (player.playing) {
        player.pause();
        setIsPlaying(false);
      } else {
        player.play();
        setIsPlaying(true);
      }
    } catch {
      setIsPlaying(!isPlaying);
    }
  };

  const isHealthy =
    detectionResult?.diseaseName?.toLowerCase().includes('healthy') ?? false;

  const confidencePct = detectionResult?.confidence
    ? Math.round(
        detectionResult.confidence > 1
          ? detectionResult.confidence
          : detectionResult.confidence * 100
      )
    : 0;

  return (
    <View style={styles.container}>
      {/* Native Video Player */}
      <VideoView
        style={styles.video}
        player={player}
        contentFit="cover"
        nativeControls={false}
        surfaceType="textureView"
      />

      {/* Viewfinder corner brackets */}
      <View style={[styles.corner, styles.topLeft]} />
      <View style={[styles.corner, styles.topRight]} />
      <View style={[styles.corner, styles.bottomLeft]} />
      <View style={[styles.corner, styles.bottomRight]} />

      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <View style={styles.badgeRow}>
          <View style={styles.mediaBadge}>
            <VideoIcon size={12} color="#FFFFFF" />
            <Text style={styles.mediaBadgeText} numberOfLines={1}>
              {fileName || 'Leaf Video'}
              {durationMs ? ` (${Math.max(1, Math.round(durationMs / 1000))}s)` : ''}
            </Text>
          </View>

          {detectionResult ? (
            <View
              style={[
                styles.healthPill,
                { backgroundColor: isHealthy ? '#16A34ACC' : '#DC2626CC' },
              ]}
            >
              {isHealthy ? (
                <CheckCircle size={11} color="#FFFFFF" />
              ) : (
                <AlertTriangle size={11} color="#FFFFFF" />
              )}
              <Text style={styles.healthPillText}>
                {isHealthy ? 'Healthy Leaf' : 'Disease Detected'}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.topActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={togglePlay}
            activeOpacity={0.8}
            accessibilityLabel={isPlaying ? 'Pause Video' : 'Play Video'}
          >
            {isPlaying ? (
              <Pause size={14} color="#FFFFFF" />
            ) : (
              <Play size={14} color="#FFFFFF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, styles.clearBtn]}
            onPress={onClear}
            activeOpacity={0.8}
            accessibilityLabel="Remove Video"
          >
            <X size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Analyzing Scanning Overlay */}
      {isAnalyzing && (
        <View style={styles.analyzingOverlay}>
          <View style={styles.scanLaser} />
          <View style={styles.analyzingBox}>
            <ActivityIndicator size="small" color="#22C55E" />
            <Text style={styles.analyzingText}>
              Sampling frames & analyzing with MobileNetV2...
            </Text>
          </View>
        </View>
      )}

      {/* Disease Detection HUD Overlay ON the video itself */}
      {detectionResult ? (
        <TouchableOpacity
          style={styles.hudCard}
          onPress={onViewDetails}
          activeOpacity={0.9}
        >
          <View style={styles.hudHeader}>
            <View style={styles.hudTitleGroup}>
              <Text style={styles.hudCropName}>{detectionResult.cropName}</Text>
              <Text style={styles.hudDiseaseName} numberOfLines={1}>
                {detectionResult.diseaseName}
              </Text>
            </View>

            <View
              style={[
                styles.confidenceBadge,
                { backgroundColor: isHealthy ? '#15803D' : '#B91C1C' },
              ]}
            >
              <Text style={styles.confidenceText}>{confidencePct}%</Text>
            </View>
          </View>

          {/* Quick Cure / Summary hint */}
          <Text style={styles.hudSummary} numberOfLines={2}>
            {detectionResult.description ||
              (isHealthy
                ? 'Leaf tissue shows normal chlorophyll and cellular structures.'
                : 'Pathogen detected. Tap to inspect recommended cure protocols.')}
          </Text>

          {/* CTA Row */}
          <View style={styles.hudCtaRow}>
            <View style={styles.aiTag}>
              <Sparkles size={11} color="#4ADE80" />
              <Text style={styles.aiTagText}>AI Diagnosed on Video</Text>
            </View>

            <View style={styles.viewDetailsBtn}>
              <Text style={styles.viewDetailsText}>View Cure</Text>
              <ArrowRight size={12} color="#FFFFFF" />
            </View>
          </View>
        </TouchableOpacity>
      ) : !isAnalyzing ? (
        <View style={styles.idleHintBanner}>
          <Text style={styles.idleHintText}>
            ▶ Video Playing • Tap "Diagnose Leaf Video" below
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#000000',
    overflow: 'hidden',
    borderRadius: 14,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  corner: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderColor: '#22C55E',
    zIndex: 5,
  },
  topLeft: {
    top: 10,
    left: 10,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 10,
    right: 10,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 10,
    left: 10,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 10,
    right: 10,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  topBar: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  mediaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    maxWidth: '65%',
  },
  mediaBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  healthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
  },
  healthPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  clearBtn: {
    backgroundColor: 'rgba(220, 38, 38, 0.85)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 8,
  },
  scanLaser: {
    position: 'absolute',
    top: '40%',
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: '#22C55E',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  analyzingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  analyzingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  hudCard: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(34, 197, 94, 0.6)',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  hudHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  hudTitleGroup: {
    flex: 1,
    marginRight: 8,
  },
  hudCropName: {
    color: '#4ADE80',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hudDiseaseName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 1,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  confidenceText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  hudSummary: {
    color: '#CBD5E1',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 8,
  },
  hudCtaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiTagText: {
    color: '#86EFAC',
    fontSize: 10,
    fontWeight: '700',
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  viewDetailsText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  idleHintBanner: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 9,
  },
  idleHintText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
  },
});
