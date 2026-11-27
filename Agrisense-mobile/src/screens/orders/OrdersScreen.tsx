import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../constants/colors';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Order } from '../../types';
import { Header } from '../../components/common/Header';
import { Truck, CheckCircle2, Clock, ChevronRight, MapPin, Package } from 'lucide-react-native';

interface OrdersScreenProps {
  navigation: any;
}

export const OrdersScreen: React.FC<OrdersScreenProps> = ({ navigation }) => {
  const { orders } = useMarketplace();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'active') {
      return o.status === 'pending' || o.status === 'confirmed' || o.status === 'in_transit';
    }
    return o.status === 'delivered' || o.status === 'cancelled';
  });

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'in_transit':
        return { label: 'In Transit 🚚', bg: '#FEF3C7', text: '#B45309' };
      case 'delivered':
        return { label: 'Delivered ✅', bg: '#DCFCE7', text: '#15803D' };
      case 'confirmed':
        return { label: 'Confirmed 📦', bg: '#E0F2FE', text: '#0369A1' };
      default:
        return { label: 'Pending ⏳', bg: '#F1F5F9', text: colors.textSecondary };
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Orders & Logistics"
        subtitle="Live Farm Shipments & History"
        showBack={true}
        onBack={() => navigation.goBack()}
        showRoleSwitch={false}
      />

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Active Deliveries ({orders.filter((o) => o.status !== 'delivered').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
          onPress={() => setActiveTab('completed')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
            Completed History
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const badge = getStatusBadge(item.status);

          return (
            <View style={styles.orderCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.orderId}>{item.id}</Text>
                  <Text style={styles.orderDate}>{item.orderDate}</Text>
                </View>

                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.badgeText, { color: badge.text }]}>
                    {badge.label}
                  </Text>
                </View>
              </View>

              <View style={styles.itemsSummary}>
                <Package size={14} color={colors.textSecondary} />
                <Text style={styles.itemsText} numberOfLines={1}>
                  {item.items.map((i) => `${i.quantity}x ${i.product.title}`).join(', ')}
                </Text>
              </View>

              <View style={styles.addressRow}>
                <MapPin size={14} color={colors.textSecondary} />
                <Text style={styles.addressText} numberOfLines={1}>
                  {item.deliveryAddress}
                </Text>
              </View>

              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.totalLabel}>Total Value</Text>
                  <Text style={styles.totalValue}>₹{item.totalAmount}</Text>
                </View>

                <TouchableOpacity
                  style={styles.trackBtn}
                  onPress={() => navigation.navigate('DeliveryMap', { order: item })}
                  activeOpacity={0.8}
                >
                  <Truck size={15} color="#FFFFFF" />
                  <Text style={styles.trackBtnText}>Live Route Map</Text>
                  <ChevronRight size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Orders in this category</Text>
            <Text style={styles.emptySub}>
              Place an order from the marketplace to track its delivery here.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF8',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  orderDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  itemsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  itemsText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  addressText: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
  },
  trackBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  trackBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
