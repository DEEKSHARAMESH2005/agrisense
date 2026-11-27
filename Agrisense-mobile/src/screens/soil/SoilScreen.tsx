import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { colors } from '../../constants/colors';
import { demoSoilData, fetchSoilTelemetry } from '../../constants/mockData';
import { SoilTelemetry } from '../../types';
import { Header } from '../../components/common/Header';
import { MoistureGauge } from '../../components/soil/MoistureGauge';
import {
  Sprout,
  Cpu,
  Thermometer,
  Droplets,
  Activity,
  AlertCircle,
  RefreshCw,
  Clock,
} from 'lucide-react-native';

interface SoilScreenProps {
  navigation: any;
}

export const SoilScreen: React.FC<SoilScreenProps> = ({ navigation }) => {
  const [soilData, setSoilData] = useState<SoilTelemetry>(demoSoilData);
  const [isSimulated, setIsSimulated] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [moistureOffset, setMoistureOffset] = useState(0);

  useEffect(() => {
    fetchSoilTelemetry().then((data) => {
      setSoilData(data);
    });
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await fetchSoilTelemetry();
      setSoilData(data);
      // micro fluctuation to show dynamic response
      setMoistureOffset((prev) => (prev === 0 ? 1.2 : 0));
    } finally {
      setRefreshing(false);
    }
  };

  const currentMoisture = Number((soilData.moisturePercentage + moistureOffset).toFixed(1));

  return (
    <View style={styles.container}>
      <Header
        title="Soil Health IoT"
        subtitle="ESP32 Telemetry & Crop Moisture"
        showBack={true}
        onBack={() => navigation.goBack()}
        showRoleSwitch={false}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {/* Hardware Status Strip */}
        <View style={styles.hardwareStrip}>
          <View style={styles.hwInfo}>
            <Cpu size={18} color={colors.primary} />
            <View>
              <Text style={styles.hwTitle}>{soilData.deviceId}</Text>
              <Text style={styles.hwStatus}>
                Status: {isSimulated ? 'Simulated Telemetry' : 'ESP32 Physical Connected'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setIsSimulated(!isSimulated)}
            style={styles.modeToggleBtn}
            activeOpacity={0.7}
          >
            <RefreshCw size={11} color={colors.primary} />
            <Text style={styles.modeToggleText}>
              {isSimulated ? 'Use Live' : 'Use Demo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Demo Notice Banner */}
        <View style={styles.demoBanner}>
          <AlertCircle size={15} color="#0369A1" />
          <Text style={styles.demoBannerText}>
            Simulated Sensor Reading: Calibrated for Black Loam / Sandy Loam Soil Types.
          </Text>
        </View>

        {/* Main Moisture Radial Gauge Card */}
        <View style={styles.gaugeCard}>
          <Text style={styles.cardHeader}>Root Zone Soil Moisture</Text>
          <MoistureGauge percentage={currentMoisture} />
          <View style={styles.timestampRow}>
            <Clock size={12} color={colors.textMuted} />
            <Text style={styles.timestampText}>
              Last transmission: {soilData.lastUpdated}
            </Text>
          </View>
        </View>

        {/* Temperature & NPK Metric Cards */}
        <View style={styles.gridRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconBadge}>
              <Thermometer size={18} color="#EA580C" />
            </View>
            <Text style={styles.statValue}>{soilData.temperatureCelsius}°C</Text>
            <Text style={styles.statLabel}>Soil Temperature</Text>
            <Text style={styles.statSub}>Optimum: 20° - 28°C</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBadge, { backgroundColor: '#E0F2FE' }]}>
              <Activity size={18} color="#0284C7" />
            </View>
            <Text style={styles.statValue}>{soilData.ph} pH</Text>
            <Text style={styles.statLabel}>Soil Acidity / pH</Text>
            <Text style={styles.statSub}>Slightly Acidic (Good)</Text>
          </View>
        </View>

        {/* Macronutrients (NPK) Card */}
        <View style={styles.npkCard}>
          <Text style={styles.cardHeader}>Macronutrients (NPK Profile)</Text>
          <View style={styles.npkRow}>
            <View style={styles.npkCol}>
              <Text style={styles.npkLabel}>Nitrogen (N)</Text>
              <Text style={styles.npkValue}>{soilData.npk.nitrogen} mg/kg</Text>
              <View style={[styles.npkPill, { backgroundColor: '#DCFCE7' }]}>
                <Text style={[styles.npkPillText, { color: '#15803D' }]}>Adequate</Text>
              </View>
            </View>

            <View style={styles.npkDivider} />

            <View style={styles.npkCol}>
              <Text style={styles.npkLabel}>Phosphorus (P)</Text>
              <Text style={styles.npkValue}>{soilData.npk.phosphorus} mg/kg</Text>
              <View style={[styles.npkPill, { backgroundColor: '#DCFCE7' }]}>
                <Text style={[styles.npkPillText, { color: '#15803D' }]}>Good</Text>
              </View>
            </View>

            <View style={styles.npkDivider} />

            <View style={styles.npkCol}>
              <Text style={styles.npkLabel}>Potassium (K)</Text>
              <Text style={styles.npkValue}>{soilData.npk.potassium} mg/kg</Text>
              <View style={[styles.npkPill, { backgroundColor: '#DCFCE7' }]}>
                <Text style={[styles.npkPillText, { color: '#15803D' }]}>High</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 24-Hour Historical Readings Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.cardHeader}>24-Hour Trend History</Text>
            <Text style={styles.chartLegend}>🟦 Moisture (%)  🟧 Temp (°C)</Text>
          </View>

          <View style={styles.chartBarsContainer}>
            {soilData.history.map((h, i) => (
              <View key={i} style={styles.barCol}>
                <View style={styles.barsPair}>
                  {/* Moisture bar */}
                  <View
                    style={[
                      styles.chartBarMoisture,
                      { height: `${(h.moisture / 100) * 120}px` as any },
                    ]}
                  />
                  {/* Temp bar */}
                  <View
                    style={[
                      styles.chartBarTemp,
                      { height: `${(h.temperature / 40) * 120}px` as any },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{h.time}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
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
    paddingBottom: 30,
  },
  hardwareStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  hwInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hwTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  hwStatus: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  modeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  modeToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  demoBannerText: {
    fontSize: 11,
    color: '#0369A1',
    flex: 1,
    fontWeight: '500',
  },
  gaugeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  timestampText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statIconBadge: {
    backgroundColor: '#FFF7ED',
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 2,
  },
  statSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  npkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  npkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  npkCol: {
    flex: 1,
    alignItems: 'center',
  },
  npkDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#F1F5F9',
  },
  npkLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  npkValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  npkPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  npkPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  chartLegend: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chartBarsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 6,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  barsPair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 120,
  },
  chartBarMoisture: {
    width: 6,
    backgroundColor: '#0284C7',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  chartBarTemp: {
    width: 6,
    backgroundColor: '#EA580C',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  barLabel: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 6,
  },
});
