import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { Scan, CloudRain, Sprout, PlusCircle, ShoppingBag, Truck } from 'lucide-react-native';

interface QuickActionsProps {
  onScanPress: () => void;
  onWeatherPress: () => void;
  onSoilPress: () => void;
  onMarketplacePress: () => void;
  onSellPress: () => void;
  onOrdersPress: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onScanPress,
  onWeatherPress,
  onSoilPress,
  onMarketplacePress,
  onSellPress,
  onOrdersPress,
}) => {
  const { role } = useAuth();

  const farmerActions = [
    {
      id: 'scan',
      label: 'Scan Leaf',
      subtitle: 'AI Diagnosis',
      icon: <Scan size={22} color={colors.primary} />,
      bg: '#DCFCE7',
      onPress: onScanPress,
    },
    {
      id: 'soil',
      label: 'Soil Health',
      subtitle: 'IoT Telemetry',
      icon: <Sprout size={22} color="#0284C7" />,
      bg: '#E0F2FE',
      onPress: onSoilPress,
    },
    {
      id: 'sell',
      label: 'Sell Produce',
      subtitle: 'Post Listing',
      icon: <PlusCircle size={22} color="#7C3AED" />,
      bg: '#F3E8FF',
      onPress: onSellPress,
    },
    {
      id: 'orders',
      label: 'Farm Orders',
      subtitle: 'Deliveries',
      icon: <Truck size={22} color="#D97706" />,
      bg: '#FEF3C7',
      onPress: onOrdersPress,
    },
  ];

  const buyerActions = [
    {
      id: 'market',
      label: 'Marketplace',
      subtitle: 'Buy Direct',
      icon: <ShoppingBag size={22} color={colors.primary} />,
      bg: '#DCFCE7',
      onPress: onMarketplacePress,
    },
    {
      id: 'scan',
      label: 'Check Plant',
      subtitle: 'AI Diagnosis',
      icon: <Scan size={22} color="#0284C7" />,
      bg: '#E0F2FE',
      onPress: onScanPress,
    },
    {
      id: 'weather',
      label: 'Weather',
      subtitle: 'Agro Forecast',
      icon: <CloudRain size={22} color="#2563EB" />,
      bg: '#DBEAFE',
      onPress: onWeatherPress,
    },
    {
      id: 'track',
      label: 'Track Order',
      subtitle: 'Live Route',
      icon: <Truck size={22} color="#D97706" />,
      bg: '#FEF3C7',
      onPress: onOrdersPress,
    },
  ];

  const actions = role === 'farmer' ? farmerActions : buyerActions;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.grid}>
        {actions.map((act) => (
          <TouchableOpacity
            key={act.id}
            activeOpacity={0.75}
            onPress={act.onPress}
            style={styles.actionCard}
          >
            <View style={[styles.iconContainer, { backgroundColor: act.bg }]}>
              {act.icon}
            </View>
            <Text style={styles.actionLabel}>{act.label}</Text>
            <Text style={styles.actionSubtitle}>{act.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconContainer: {
    padding: 10,
    borderRadius: 14,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
});
