import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useCart } from '../../context/CartContext';
import { Header } from '../../components/common/Header';
import { WeatherCard } from '../../components/dashboard/WeatherCard';
import { SoilCard } from '../../components/dashboard/SoilCard';
import { QuickActions } from '../../components/dashboard/QuickActions';
import { CropHealthCard } from '../../components/dashboard/CropHealthCard';
import { FarmingTips } from '../../components/dashboard/FarmingTips';
import { ProductCard } from '../../components/marketplace/ProductCard';
import { ArrowRight, Sparkles } from 'lucide-react-native';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, role } = useAuth();
  const { products } = useMarketplace();
  const { addToCart } = useCart();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  const recentProducts = products.slice(0, 3);

  return (
    <View style={styles.container}>
      <Header
        title="AgriSense"
        subtitle={role === 'farmer' ? '🌾 Farmer Operations' : '🛒 Fresh Harvest Hub'}
        showRoleSwitch={true}
        onCartPress={role === 'buyer' ? () => navigation.navigate('Cart') : undefined}
        onNotificationsPress={() => navigation.navigate('Orders')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* User Greeting Banner */}
        <View style={styles.greetingSection}>
          <View>
            <View style={styles.roleTag}>
              <Sparkles size={12} color={colors.primary} />
              <Text style={styles.roleTagText}>
                {role === 'farmer' ? 'FARMER PORTAL' : 'BUYER PORTAL'}
              </Text>
            </View>
            <Text style={styles.greetingTitle}>
              Namaste, {user?.name.split(' ')[0] || 'Farmer'} 👋
            </Text>
            <Text style={styles.greetingSub}>
              {role === 'farmer'
                ? 'Your crops are showing healthy vegetative growth today.'
                : 'Fresh harvest direct from verified regional farmers.'}
            </Text>
          </View>
        </View>

        {/* Live Weather Card */}
        <WeatherCard
          onPress={() => navigation.navigate('WeatherTab')}
        />

        {/* Quick Action Grid */}
        <QuickActions
          onScanPress={() => navigation.navigate('DiseaseTab')}
          onWeatherPress={() => navigation.navigate('WeatherTab')}
          onSoilPress={() => navigation.navigate('SoilDetails')}
          onMarketplacePress={() => navigation.navigate('MarketplaceTab')}
          onSellPress={() => navigation.navigate('AddListing')}
          onOrdersPress={() => navigation.navigate('Orders')}
        />

        {/* Soil Moisture & Temperature preview */}
        <SoilCard
          onPress={() => navigation.navigate('SoilDetails')}
        />

        {/* Crop Health & Disease Diagnostic summary */}
        <CropHealthCard
          onScanPress={() => navigation.navigate('DiseaseTab')}
          onViewHistoryPress={() => navigation.navigate('DiseaseHistory')}
        />

        {/* Agronomy Insights */}
        <FarmingTips />

        {/* Marketplace Section */}
        <View style={styles.marketHeader}>
          <View>
            <Text style={styles.marketTitle}>Fresh From Farms</Text>
            <Text style={styles.marketSub}>Direct harvest, no middleman markups</Text>
          </View>
          <TouchableOpacity
            style={styles.viewAllRow}
            onPress={() => navigation.navigate('MarketplaceTab')}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <ArrowRight size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {recentProducts.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onPress={() => navigation.navigate('ProductDetail', { product: p })}
            onAddToCart={() => addToCart(p, 1)}
            showAddButton={role === 'buyer'}
          />
        ))}

        <View style={{ height: 30 }} />
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
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  greetingSection: {
    marginBottom: 16,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  greetingSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  marketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  marketTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  marketSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});
