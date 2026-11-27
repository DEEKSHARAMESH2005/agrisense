import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { colors } from '../../constants/colors';
import { Scan, Sprout, ShoppingBag, ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

const slides = [
  {
    id: 1,
    title: 'AI Plant Disease Detection',
    subtitle: 'Point your camera at any affected leaf to get instant disease diagnosis, severity grading, and organic treatment plans.',
    icon: <Scan size={64} color="#1E5631" />,
    badge: 'AI Diagnostic Engine',
    bgLight: '#DCFCE7',
  },
  {
    id: 2,
    title: 'Smart Soil & Weather IoT',
    subtitle: 'Track real-time moisture levels, root temperature, and hyper-local farm weather forecasts to optimize your irrigation cycles.',
    icon: <Sprout size={64} color="#0284C7" />,
    badge: 'Hardware & Climate Telemetry',
    bgLight: '#E0F2FE',
  },
  {
    id: 3,
    title: 'Farmer-to-Buyer Marketplace',
    subtitle: 'Sell your freshly harvested produce directly to buyers with transparent fair pricing, digital orders, and map delivery tracking.',
    icon: <ShoppingBag size={64} color="#7C3AED" />,
    badge: 'Direct Farm Trade',
    bgLight: '#F3E8FF',
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const slide = slides[currentSlide];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Skip button */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onComplete} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip to App</Text>
          </TouchableOpacity>
        </View>

        {/* Slide Graphic */}
        <View style={styles.centerSection}>
          <View style={[styles.iconCircle, { backgroundColor: slide.bgLight }]}>
            {slide.icon}
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>{slide.badge}</Text>
          </View>

          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.subtitle}>{slide.subtitle}</Text>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomSection}>
          <View style={styles.dots}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === currentSlide && styles.activeDot,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {currentSlide === slides.length - 1 ? 'Get Started' : 'Next Step'}
            </Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  topBar: {
    alignItems: 'flex-end',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    padding: 8,
  },
  centerSection: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  badge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomSection: {
    gap: 20,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  activeDot: {
    width: 24,
    backgroundColor: colors.primary,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
