import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { demoWeatherData, fetchWeatherData } from '../../constants/mockData';
import { WeatherData } from '../../types';
import { CloudSun, Droplets, Wind, ChevronRight } from 'lucide-react-native';

interface WeatherCardProps {
  onPress: () => void;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ onPress }) => {
  const [weatherData, setWeatherData] = useState<WeatherData>(demoWeatherData);

  useEffect(() => {
    fetchWeatherData().then(setWeatherData);
  }, []);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <LinearGradient
        colors={['#1E5631', '#2D7D46']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientCard}
      >
        <View style={styles.topRow}>
          <View>
            <View style={styles.tagRow}>
              <Text style={styles.locationText}>{weatherData.location}</Text>
              <View style={styles.demoBadge}>
                <Text style={styles.demoBadgeText}>DEMO</Text>
              </View>
            </View>
            <Text style={styles.conditionText}>{weatherData.condition}</Text>
          </View>
          <View style={styles.iconCircle}>
            <CloudSun size={32} color="#FEF08A" />
          </View>
        </View>

        <View style={styles.middleRow}>
          <Text style={styles.tempText}>{weatherData.temperature}°C</Text>
          <View style={styles.metricsContainer}>
            <View style={styles.metricItem}>
              <Droplets size={14} color="#A7F3D0" />
              <Text style={styles.metricLabel}>Humidity</Text>
              <Text style={styles.metricValue}>{weatherData.humidity}%</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Wind size={14} color="#A7F3D0" />
              <Text style={styles.metricLabel}>Wind</Text>
              <Text style={styles.metricValue}>{weatherData.windSpeed} km/h</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <CloudSun size={14} color="#A7F3D0" />
              <Text style={styles.metricLabel}>UV Index</Text>
              <Text style={styles.metricValue}>{weatherData.uvIndex}/10</Text>
            </View>
          </View>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerAdvice} numberOfLines={1}>
            💡 {weatherData.farmingAdvice}
          </Text>
          <View style={styles.viewMoreRow}>
            <Text style={styles.viewMoreText}>7-Day</Text>
            <ChevronRight size={14} color="#D1FAE5" />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gradientCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#1E5631',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 13,
    color: '#D1FAE5',
    fontWeight: '600',
  },
  demoBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  demoBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  conditionText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 2,
  },
  iconCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 24,
    padding: 10,
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 14,
  },
  tempText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  metricsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  metricItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  metricLabel: {
    fontSize: 10,
    color: '#A7F3D0',
    marginTop: 2,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: 10,
  },
  footerAdvice: {
    flex: 1,
    fontSize: 11,
    color: '#E0F2FE',
    marginRight: 8,
  },
  viewMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D1FAE5',
  },
});
