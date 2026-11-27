import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '../../constants/colors';
import { useDetection } from '../../context/DetectionContext';
import { ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react-native';

interface CropHealthCardProps {
  onScanPress: () => void;
  onViewHistoryPress: () => void;
}

export const CropHealthCard: React.FC<CropHealthCardProps> = ({
  onScanPress,
  onViewHistoryPress,
}) => {
  const { history } = useDetection();
  const latest = history[0];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <ShieldCheck size={18} color={colors.primary} />
          <Text style={styles.title}>Crop Health & Scans</Text>
        </View>
        <TouchableOpacity onPress={onViewHistoryPress} activeOpacity={0.7}>
          <Text style={styles.historyLink}>History ({history.length})</Text>
        </TouchableOpacity>
      </View>

      {latest ? (
        <View style={styles.latestCard}>
          <Image
            source={{ uri: latest.imageUri }}
            style={styles.leafThumbnail}
          />
          <View style={styles.infoCol}>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.severityPill,
                  {
                    backgroundColor:
                      latest.severity === 'Severe'
                        ? '#FEE2E2'
                        : latest.severity === 'Moderate'
                        ? '#FEF3C7'
                        : '#DCFCE7',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.severityText,
                    {
                      color:
                        latest.severity === 'Severe'
                          ? '#DC2626'
                          : latest.severity === 'Moderate'
                          ? '#B45309'
                          : '#15803D',
                    },
                  ]}
                >
                  {latest.severity} Severity
                </Text>
              </View>
              <Text style={styles.confidenceText}>
                {latest.confidence}% Match
              </Text>
            </View>

            <Text style={styles.diseaseName} numberOfLines={1}>
              {latest.diseaseName}
            </Text>
            <Text style={styles.cropName}>{latest.cropName}</Text>
            <Text style={styles.dateText}>{latest.date}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No Scans Yet</Text>
          <Text style={styles.emptySubtitle}>
            Capture a leaf image to test AI detection.
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.scanButton}
        onPress={onScanPress}
        activeOpacity={0.8}
      >
        <Text style={styles.scanButtonText}>Scan Another Plant</Text>
        <ArrowRight size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  historyLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  latestCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    gap: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  leafThumbnail: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  infoCol: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  severityPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  diseaseName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cropName: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  dateText: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scanButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
