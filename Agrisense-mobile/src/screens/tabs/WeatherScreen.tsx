import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/colors';
import {
  demoWeatherData,
  regionalZones as defaultZones,
  fetchWeatherData,
  fetchRegionalZones,
} from '../../constants/mockData';
import { WeatherData } from '../../types';
import { Header } from '../../components/common/Header';
import {
  CloudSun,
  Droplets,
  Wind,
  CloudRain,
  Sun,
  Compass,
  Search,
  CheckCircle,
  Lightbulb,
} from 'lucide-react-native';

export const WeatherScreen: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData>(demoWeatherData);
  const [zones, setZones] = useState<string[]>(defaultZones);
  const [selectedZone, setSelectedZone] = useState(defaultZones[0]);
  const [refreshing, setRefreshing] = useState(false);
  const [isGpsActive, setIsGpsActive] = useState(true);

  useEffect(() => {
    fetchWeatherData().then(setWeatherData);
    fetchRegionalZones().then((res) => {
      setZones(res);
      if (res.length > 0 && !res.includes(selectedZone)) {
        setSelectedZone(res[0]);
      }
    });
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await fetchWeatherData();
      setWeatherData(data);
    } finally {
      setRefreshing(false);
    }
  };

  const getConditionIcon = (cond: string) => {
    if (cond.includes('Rain') || cond.includes('Showers')) {
      return <CloudRain size={20} color="#0284C7" />;
    }
    if (cond.includes('Clear') || cond.includes('Sun')) {
      return <Sun size={20} color="#F59E0B" />;
    }
    return <CloudSun size={20} color="#16A34A" />;
  };

  return (
    <View style={styles.container}>
      <Header
        title="Agro Weather"
        subtitle="Micro-Climate Forecast & Advisories"
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
        {/* Location selector pills */}
        <View style={styles.locationSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {zones.map((zone) => {
              const active = zone === selectedZone;
              return (
                <TouchableOpacity
                  key={zone}
                  onPress={() => setSelectedZone(zone)}
                  style={[styles.zonePill, active && styles.zonePillActive]}
                  activeOpacity={0.75}
                >
                  <Compass size={12} color={active ? '#FFFFFF' : colors.textSecondary} />
                  <Text style={[styles.zoneText, active && styles.zoneTextActive]}>
                    {zone}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Hero Current Weather Card */}
        <LinearGradient
          colors={['#1E5631', '#143C22']}
          style={styles.heroCard}
        >
          <View style={styles.heroHeader}>
            <View>
              <View style={styles.demoPill}>
                <Text style={styles.demoPillText}>SIMULATED DEMO WEATHER</Text>
              </View>
              <Text style={styles.zoneName}>{selectedZone}</Text>
              <Text style={styles.updatedText}>Updated {weatherData.lastUpdated}</Text>
            </View>
            <View style={styles.weatherIconLarge}>
              <CloudSun size={48} color="#FEF08A" />
            </View>
          </View>

          <View style={styles.tempRow}>
            <Text style={styles.bigTemp}>{weatherData.temperature}°C</Text>
            <View style={styles.conditionCol}>
              <Text style={styles.heroCondition}>{weatherData.condition}</Text>
              <Text style={styles.feelsLikeText}>Feels like 29°C • Pleasant</Text>
            </View>
          </View>

          {/* Environmental metrics grid */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Droplets size={18} color="#A7F3D0" />
              <Text style={styles.metricVal}>{weatherData.humidity}%</Text>
              <Text style={styles.metricSub}>Humidity</Text>
            </View>

            <View style={styles.metricCard}>
              <Wind size={18} color="#A7F3D0" />
              <Text style={styles.metricVal}>{weatherData.windSpeed} km/h</Text>
              <Text style={styles.metricSub}>Wind Speed</Text>
            </View>

            <View style={styles.metricCard}>
              <CloudRain size={18} color="#A7F3D0" />
              <Text style={styles.metricVal}>{weatherData.rainfallMm} mm</Text>
              <Text style={styles.metricSub}>Precipitation</Text>
            </View>

            <View style={styles.metricCard}>
              <Sun size={18} color="#A7F3D0" />
              <Text style={styles.metricVal}>{weatherData.uvIndex}/10</Text>
              <Text style={styles.metricSub}>UV Rating</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Practical Crop Advisory */}
        <View style={styles.advisoryCard}>
          <View style={styles.advisoryTitleRow}>
            <Lightbulb size={20} color="#D97706" />
            <Text style={styles.advisoryTitle}>Smart Spray & Irrigation Advisory</Text>
          </View>
          <Text style={styles.advisoryBody}>
            {weatherData.farmingAdvice}
          </Text>
          <View style={styles.advisoryCheckRow}>
            <CheckCircle size={14} color="#16A34A" />
            <Text style={styles.advisoryCheckText}>
              Low drift hazard: Wind velocity under 15 km/h is safe for spraying.
            </Text>
          </View>
        </View>

        {/* 7-Day Extended Forecast */}
        <View style={styles.forecastContainer}>
          <Text style={styles.sectionHeading}>7-Day Agro Forecast</Text>

          {weatherData.forecast.map((item, index) => (
            <View key={index} style={styles.forecastRow}>
              <Text style={styles.forecastDay}>{item.day}</Text>
              <View style={styles.forecastConditionRow}>
                {getConditionIcon(item.condition)}
                <Text style={styles.forecastConditionText}>{item.condition}</Text>
              </View>
              <View style={styles.rainChance}>
                <Text style={styles.rainChanceText}>{item.rainfallProb}% rain</Text>
              </View>
              <View style={styles.tempRange}>
                <Text style={styles.tempHigh}>{item.tempMax}°</Text>
                <Text style={styles.tempLow}>{item.tempMin}°</Text>
              </View>
            </View>
          ))}
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
  locationSelector: {
    marginBottom: 14,
  },
  zonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
  },
  zonePillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  zoneText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  zoneTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  heroCard: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#1E5631',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  demoPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  demoPillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  zoneName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  updatedText: {
    fontSize: 11,
    color: '#A7F3D0',
    marginTop: 2,
  },
  weatherIconLarge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 12,
    borderRadius: 24,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 18,
  },
  bigTemp: {
    fontSize: 54,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  conditionCol: {
    flex: 1,
  },
  heroCondition: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  feelsLikeText: {
    fontSize: 12,
    color: '#D1FAE5',
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 12,
    borderRadius: 16,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
  },
  metricSub: {
    fontSize: 10,
    color: '#A7F3D0',
    marginTop: 1,
  },
  advisoryCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 16,
  },
  advisoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  advisoryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B45309',
  },
  advisoryBody: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 18,
    marginBottom: 10,
  },
  advisoryCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  advisoryCheckText: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '600',
    flex: 1,
  },
  forecastContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  forecastDay: {
    width: 60,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  forecastConditionRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  forecastConditionText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  rainChance: {
    width: 64,
  },
  rainChanceText: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '600',
  },
  tempRange: {
    flexDirection: 'row',
    gap: 8,
    width: 54,
    justifyContent: 'flex-end',
  },
  tempHigh: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  tempLow: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
});
