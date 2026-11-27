import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';
import { demoSoilData, fetchSoilTelemetry } from '../../constants/mockData';
import { SoilTelemetry } from '../../types';
import { Sprout, Activity, ChevronRight, Gauge } from 'lucide-react-native';

interface SoilCardProps {
  onPress: () => void;
}

export const SoilCard: React.FC<SoilCardProps> = ({ onPress }) => {
  const [soilData, setSoilData] = useState<SoilTelemetry>(demoSoilData);

  useEffect(() => {
    fetchSoilTelemetry().then(setSoilData);
  }, []);

  const moisture = soilData.moisturePercentage;
  const isOptimal = moisture >= 55 && moisture <= 75;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.cardContainer}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={styles.iconBadge}>
            <Sprout size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.titleText}>Soil & IoT Telemetry</Text>
            <View style={styles.sensorStatusRow}>
              <View style={styles.liveDot} />
              <Text style={styles.sensorStatusText}>
                {soilData.deviceId} (Demo IoT)
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionArrow}>
          <Text style={styles.viewDetailsText}>Telemetry</Text>
          <ChevronRight size={14} color={colors.primary} />
        </View>
      </View>

      <View style={styles.statsRow}>
        {/* Moisture Block */}
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Soil Moisture</Text>
          <View style={styles.valueRow}>
            <Text style={styles.statValue}>{moisture}%</Text>
            <View
              style={[
                styles.statusPill,
                { backgroundColor: isOptimal ? '#DCFCE7' : '#FEF3C7' },
              ]}
            >
              <Text
                style={[
                  styles.statusPillText,
                  { color: isOptimal ? '#15803D' : '#B45309' },
                ]}
              >
                {isOptimal ? 'Optimal' : 'Attention'}
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(moisture, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.rangeSubtext}>Target: 55% - 75% for current crop</Text>
        </View>

        {/* Temperature Block */}
        <View style={styles.statBoxAlt}>
          <Text style={styles.statLabel}>Soil Temp</Text>
          <Text style={styles.statValue}>{soilData.temperatureCelsius}°C</Text>
          <View style={styles.phRow}>
            <Activity size={12} color={colors.textSecondary} />
            <Text style={styles.phText}>pH {soilData.ph} (Neutral)</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBadge: {
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 10,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sensorStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  sensorStatusText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  actionArrow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 3,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  statBoxAlt: {
    flex: 2,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0284C7',
    borderRadius: 3,
  },
  rangeSubtext: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  phRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  phText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
