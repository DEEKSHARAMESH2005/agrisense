import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sprout } from 'lucide-react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#1E5631', '#143C22']}
      style={styles.container}
    >
      <View style={styles.centerBox}>
        <View style={styles.logoCircle}>
          <Sprout size={56} color="#4C9A2A" />
        </View>

        <Text style={styles.appName}>AgriSense</Text>
        <Text style={styles.tagline}>Smart Agriculture Platform</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>AI Plant Doctor • IoT Soil • Direct Market</Text>
        </View>

        <View style={styles.loaderArea}>
          <ActivityIndicator size="small" color="#A7F3D0" />
          <Text style={styles.loadingText}>Initializing farm intelligence...</Text>
        </View>
      </View>

      <Text style={styles.footerText}>
        Designed for Modern Farmers & Sustainable Agriculture
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  appName: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: '#A7F3D0',
    fontWeight: '600',
    marginTop: 4,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 20,
  },
  badgeText: {
    color: '#E0F2FE',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loaderArea: {
    marginTop: 40,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#D1FAE5',
    fontWeight: '500',
  },
  footerText: {
    position: 'absolute',
    bottom: 30,
    fontSize: 11,
    color: '#86EFAC',
    fontWeight: '500',
    textAlign: 'center',
  },
});
