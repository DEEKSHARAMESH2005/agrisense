import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { DiseaseDetection } from '../../types';
import { colors } from '../../constants/colors';
import {
  X,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Leaf,
  FlaskConical,
  RotateCcw,
  Sparkles,
  Clock,
  HelpCircle,
} from 'lucide-react-native';

interface DiseaseResultModalProps {
  visible: boolean;
  result: DiseaseDetection | null;
  onClose: () => void;
  onScanAnother: () => void;
}

export const DiseaseResultModal: React.FC<DiseaseResultModalProps> = ({
  visible,
  result,
  onClose,
  onScanAnother,
}) => {
  if (!result) return null;

  const isHealthy = result.diseaseName.toLowerCase().includes('healthy');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.titleGroup}>
            <Text style={styles.topTitle}>Diagnosis Results</Text>
            <View style={[styles.demoTag, { backgroundColor: '#DCFCE7' }]}>
              <Text style={[styles.demoTagText, { color: '#15803D' }]}>
                LIVE AI (MobileNetV2)
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <X size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Leaf image header with overlay */}
          <View style={styles.imageBox}>
            <Image source={{ uri: result.imageUri }} style={styles.image} />
            <View style={styles.confidenceOverlay}>
              <Text style={styles.confidenceLabel}>Confidence</Text>
              <Text style={styles.confidenceValue}>{result.confidence}%</Text>
              {result.inferenceTimeMs !== undefined && (
                <View style={styles.latencyRow}>
                  <Clock size={10} color="#A7F3D0" />
                  <Text style={styles.latencyText}>{result.inferenceTimeMs}ms</Text>
                </View>
              )}
            </View>
          </View>

          {/* Uncertainty Notice Alert (if confidence < 50%) */}
          {result.isUncertain && (
            <View style={styles.uncertaintyBox}>
              <AlertTriangle size={18} color="#D97706" />
              <View style={styles.uncertaintyTextCol}>
                <Text style={styles.uncertaintyTitle}>Uncertain Classification (&lt;50% Confidence)</Text>
                <Text style={styles.uncertaintyText}>
                  {result.uncertaintyWarning ||
                    'The image may be blurry, poorly lit, or contains an unrecognized plant leaf. Verification with an agronomist is recommended.'}
                </Text>
              </View>
            </View>
          )}

          {/* Disease title & severity badge */}
          <View style={styles.headerBlock}>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.severityBadge,
                  {
                    backgroundColor: isHealthy
                      ? '#DCFCE7'
                      : result.severity === 'Severe'
                      ? '#FEE2E2'
                      : '#FEF3C7',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.severityText,
                    {
                      color: isHealthy
                        ? '#16A34A'
                        : result.severity === 'Severe'
                        ? '#DC2626'
                        : '#B45309',
                    },
                  ]}
                >
                  {isHealthy ? 'Healthy Plant' : `${result.severity} Severity`}
                </Text>
              </View>
              <Text style={styles.dateStamp}>{result.date}</Text>
            </View>

            <Text style={styles.diseaseTitle}>{result.diseaseName}</Text>
            <Text style={styles.cropSub}>{result.cropName}</Text>
            <Text style={styles.description}>{result.description}</Text>
          </View>

          {/* Alternative Predictions List (from MobileNetV2 top-3) */}
          {result.alternatives && result.alternatives.length > 1 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleRow}>
                <Sparkles size={18} color={colors.primary} />
                <Text style={styles.sectionTitle}>Model Prediction Probabilities</Text>
              </View>
              {result.alternatives.map((alt, i) => (
                <View key={i} style={styles.altRow}>
                  <View style={styles.altTopLine}>
                    <Text style={styles.altDisease}>{alt.disease}</Text>
                    <Text style={styles.altConfidence}>{alt.confidence}%</Text>
                  </View>
                  <Text style={styles.altCrop}>{alt.crop}</Text>
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.min(alt.confidence, 100)}%`,
                          backgroundColor: i === 0 ? colors.primary : '#94A3B8',
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Expert Disclaimer Alert */}
          <View style={styles.disclaimerBox}>
            <AlertTriangle size={16} color="#B45309" />
            <Text style={styles.disclaimerText}>
              Disclaimer: AI predictions are assistive diagnostic references. Always verify chemical controls with a local agricultural extension officer.
            </Text>
          </View>

          {/* Symptoms Section */}
          {result.symptoms && result.symptoms.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleRow}>
                <ShieldAlert size={18} color="#EF4444" />
                <Text style={styles.sectionTitle}>Identified Symptoms</Text>
              </View>
              {result.symptoms.map((symp, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={styles.redDot} />
                  <Text style={styles.bulletText}>{symp}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Treatment Section */}
          {result.treatment && (
            <View style={styles.sectionCard}>
              {result.treatment.organic && result.treatment.organic.length > 0 && (
                <>
                  <View style={styles.sectionTitleRow}>
                    <Leaf size={18} color="#16A34A" />
                    <Text style={styles.sectionTitle}>Organic & Biological Control</Text>
                  </View>
                  {result.treatment.organic.map((treat, i) => (
                    <View key={i} style={styles.bulletRow}>
                      <CheckCircle2 size={16} color="#16A34A" />
                      <Text style={styles.bulletText}>{treat}</Text>
                    </View>
                  ))}
                </>
              )}

              {result.treatment.chemical && result.treatment.chemical.length > 0 && (
                <>
                  <View style={[styles.sectionTitleRow, { marginTop: 14 }]}>
                    <FlaskConical size={18} color="#0284C7" />
                    <Text style={styles.sectionTitle}>Chemical Treatment Options</Text>
                  </View>
                  {result.treatment.chemical.map((chem, i) => (
                    <View key={i} style={styles.bulletRow}>
                      <CheckCircle2 size={16} color="#0284C7" />
                      <Text style={styles.bulletText}>{chem}</Text>
                    </View>
                  ))}
                </>
              )}
            </View>
          )}

          {/* Prevention Guidelines */}
          {result.prevention && result.prevention.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleRow}>
                <CheckCircle2 size={18} color={colors.primary} />
                <Text style={styles.sectionTitle}>Agronomic Prevention</Text>
              </View>
              {result.prevention.map((prev, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={styles.greenDot} />
                  <Text style={styles.bulletText}>{prev}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Bottom Action Button */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              onClose();
              onScanAnother();
            }}
            activeOpacity={0.8}
          >
            <RotateCcw size={18} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Scan Another Leaf</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAF8',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  demoTag: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  demoTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0369A1',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  imageBox: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 14,
    backgroundColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  confidenceOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 10,
    color: '#A7F3D0',
    fontWeight: '600',
  },
  confidenceValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  latencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  latencyText: {
    fontSize: 9,
    color: '#A7F3D0',
    fontWeight: '600',
  },
  uncertaintyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  uncertaintyTextCol: {
    flex: 1,
  },
  uncertaintyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 2,
  },
  uncertaintyText: {
    fontSize: 11,
    color: '#B45309',
    lineHeight: 16,
  },
  headerBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '800',
  },
  dateStamp: {
    fontSize: 11,
    color: colors.textMuted,
  },
  diseaseTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cropSub: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 10,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  altRow: {
    marginBottom: 10,
  },
  altTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  altDisease: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  altConfidence: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  altCrop: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginTop: 6,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 10,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
