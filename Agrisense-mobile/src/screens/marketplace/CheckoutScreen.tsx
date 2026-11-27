import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import {
  MapPin,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react-native';

interface CheckoutScreenProps {
  route: { params: { grandTotal: number } };
  navigation: any;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  route,
  navigation,
}) => {
  const { grandTotal } = route.params;
  const { user } = useAuth();
  const { items, clearCart } = useCart();
  const { createOrder } = useMarketplace();

  const [address, setAddress] = useState(
    user?.location || 'Flat 402, Green Meadows, Viman Nagar, Pune, MH - 411014'
  );
  const [phone, setPhone] = useState(user?.phone || '+91 98220 12345');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = () => {
    if (!address.trim()) {
      Alert.alert('Delivery Address', 'Please provide a valid delivery address.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const order = createOrder(
        user?.name || 'Anita Sharma',
        phone,
        address,
        items,
        grandTotal
      );
      clearCart();
      setLoading(false);
      navigation.replace('OrderConfirmation', { order });
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Checkout & Delivery"
        subtitle="Finalize Farm Order"
        showBack={true}
        onBack={() => navigation.goBack()}
        showRoleSwitch={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Demo Notice Alert */}
        <View style={styles.demoNotice}>
          <AlertCircle size={18} color="#0369A1" />
          <Text style={styles.demoNoticeText}>
            Demo Simulation: No real payments or credit cards required. Placing this order registers an active shipment in your demo order tracking timeline.
          </Text>
        </View>

        {/* Delivery Address Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <MapPin size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Delivery Address</Text>
          </View>

          <Input
            label="Street Address / Apartment"
            value={address}
            onChangeText={setAddress}
            multiline
            style={{ height: 60 }}
          />

          <Input
            label="Contact Mobile for Rider"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        {/* Demo Payment Method Selection */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <CreditCard size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Payment Preference</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'cod' && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentMethod('cod')}
            activeOpacity={0.8}
          >
            <View style={styles.optionLeft}>
              <View
                style={[
                  styles.radioDot,
                  paymentMethod === 'cod' && styles.radioDotActive,
                ]}
              />
              <View>
                <Text style={styles.optionTitle}>Cash on Farm Delivery (COD)</Text>
                <Text style={styles.optionSub}>Pay when harvest arrives at your doorstep</Text>
              </View>
            </View>
            <Truck size={20} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'upi' && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentMethod('upi')}
            activeOpacity={0.8}
          >
            <View style={styles.optionLeft}>
              <View
                style={[
                  styles.radioDot,
                  paymentMethod === 'upi' && styles.radioDotActive,
                ]}
              />
              <View>
                <Text style={styles.optionTitle}>UPI / Net Banking (Demo)</Text>
                <Text style={styles.optionSub}>Simulate instant digital settlement</Text>
              </View>
            </View>
            <ShieldCheck size={20} color="#16A34A" />
          </TouchableOpacity>
        </View>

        {/* Order Items Preview */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary ({items.length} items)</Text>
          {items.map((it, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {it.quantity}x {it.product.title}
              </Text>
              <Text style={styles.itemPrice}>
                ₹{it.product.price * it.quantity}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalPrice}>₹{grandTotal}</Text>
          </View>
        </View>

        <Button
          title={loading ? 'Processing Order...' : `Place Demo Order • ₹${grandTotal}`}
          onPress={handlePlaceOrder}
          loading={loading}
          style={styles.placeOrderBtn}
        />
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
    paddingBottom: 40,
  },
  demoNotice: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 14,
    padding: 12,
    gap: 10,
    marginBottom: 16,
  },
  demoNoticeText: {
    fontSize: 12,
    color: '#0369A1',
    lineHeight: 17,
    flex: 1,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    backgroundColor: '#F8FAFC',
  },
  paymentOptionActive: {
    borderColor: colors.primary,
    backgroundColor: '#F0FDF4',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  radioDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#94A3B8',
  },
  radioDotActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  optionSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  itemTitle: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary,
  },
  placeOrderBtn: {
    marginTop: 8,
  },
});
