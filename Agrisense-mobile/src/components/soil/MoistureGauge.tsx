import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { Droplet } from 'lucide-react-native';

interface MoistureGaugeProps {
  percentage: number;
}

export const MoistureGauge: React.FC<MoistureGaugeProps> = ({ percentage }) => {
  const getStatus = (val: number) => {
    if (val < 45) return { label: 'Dry / Low Moisture', color: '#D97706', bg: '#FEF3C7' };
    if (val <= 75) return { label: 'Optimal Root Moisture', color: '#16A34A', bg: '#DCFCE7' };
    return { label: 'Saturated Soil', color: '#0284C7', bg: '#E0F2FE' };
  };

  const status = getStatus(percentage);

  return (
    <View style={styles.container}>
      <View style={styles.gaugeCircle}>
        <View style={[styles.innerCircle, { borderColor: status.color }]}>
          <Droplet size={32} color={status.color} />
          <Text style={styles.valueText}>{percentage}%</Text>
          <Text style={styles.unitText}>Volumetric Content</Text>
        </View>
      </View>

      <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
        <Text style={[styles.statusText, { color: status.color }]}>
          {status.label}
        </Text>
      </View>

      {/* Threshold reference line */}
      <View style={styles.scaleContainer}>
        <View style={styles.scaleRow}>
          <Text style={styles.scaleLabel}>0% (Dry)</Text>
          <Text style={styles.scaleLabel}>50% - 75% Optimal</Text>
          <Text style={styles.scaleLabel}>100%</Text>
        </View>
        <View style={styles.scaleBar}>
          <View style={[styles.scaleSegment, { backgroundColor: '#FDE68A', flex: 45 }]} />
          <View style={[styles.scaleSegment, { backgroundColor: '#86EFAC', flex: 30 }]} />
          <View style={[styles.scaleSegment, { backgroundColor: '#7DD3FC', flex: 25 }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  gaugeCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 6,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  innerCircle: {
    width: 146,
    height: 146,
    borderRadius: 73,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFCFA',
  },
  valueText: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.textPrimary,
    marginTop: 4,
  },
  unitText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 14,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  scaleContainer: {
    width: '100%',
    marginTop: 16,
    paddingHorizontal: 10,
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  scaleLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  scaleBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scaleSegment: {
    height: '100%',
  },
});
