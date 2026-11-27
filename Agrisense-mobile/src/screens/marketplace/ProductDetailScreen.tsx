import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../../constants/colors';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import {
  MapPin,
  Calendar,
  Phone,
  ShieldCheck,
  Star,
  Plus,
  Minus,
  ShoppingBag,
  CheckCircle,
} from 'lucide-react-native';

interface ProductDetailScreenProps {
  route: { params: { product: Product } };
  navigation: any;
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { product } = route.params;
  const { addToCart } = useCart();
  const { role } = useAuth();
  const [qty, setQty] = useState(1);

  const handleAddToCart = () => {
    addToCart(product, qty);
    Alert.alert(
      'Added to Cart',
      `${qty} ${product.unit}(s) of ${product.title} added to your cart.`,
      [
        { text: 'Keep Browsing', style: 'cancel' },
        { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={product.title}
        showBack={true}
        onBack={() => navigation.goBack()}
        showRoleSwitch={false}
        onCartPress={role === 'buyer' ? () => navigation.navigate('Cart') : undefined}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Product Image */}
        <View style={styles.imageBox}>
          <Image source={{ uri: product.imageUrl }} style={styles.image} />
          {product.isOrganic && (
            <View style={styles.organicTag}>
              <Text style={styles.organicTagText}>🌱 Certified Natural / Organic</Text>
            </View>
          )}
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryBadge}>{product.category}</Text>
            <View style={styles.ratingRow}>
              <Star size={12} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingText}>{product.rating || '4.8'} (Verified)</Text>
            </View>
          </View>

          <Text style={styles.title}>{product.title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MapPin size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>{product.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <Calendar size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>Harvest: {product.availableDate}</Text>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <View>
              <Text style={styles.priceLabel}>Price per {product.unit}</Text>
              <Text style={styles.priceVal}>
                ₹{product.price}
                <Text style={styles.priceUnit}> / {product.unit}</Text>
              </Text>
            </View>

            <View style={styles.stockBox}>
              <Text style={styles.stockLabel}>Available Stock</Text>
              <Text style={styles.stockVal}>
                {product.quantity} {product.unit}s
              </Text>
            </View>
          </View>

          <Text style={styles.sectionHeader}>Produce Description</Text>
          <Text style={styles.description}>{product.description}</Text>

          {/* Farmer Profile Card */}
          <View style={styles.farmerCard}>
            <View style={styles.farmerHeader}>
              <View style={styles.farmerAvatar}>
                <Text style={styles.avatarLetter}>
                  {product.farmerName.charAt(0)}
                </Text>
              </View>
              <View style={styles.farmerDetails}>
                <View style={styles.nameRow}>
                  <Text style={styles.farmerName}>{product.farmerName}</Text>
                  <ShieldCheck size={14} color="#16A34A" />
                </View>
                <Text style={styles.farmerSub}>Verified Regional Producer</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.callFarmerBtn}
              onPress={() =>
                Alert.alert(
                  'Call Farmer',
                  `Simulating direct phone call to ${product.farmerName} at ${product.farmerPhone}`
                )
              }
              activeOpacity={0.8}
            >
              <Phone size={15} color={colors.primary} />
              <Text style={styles.callFarmerText}>Contact: {product.farmerPhone}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.stepper}>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => setQty(Math.max(1, qty - 1))}
            activeOpacity={0.7}
          >
            <Minus size={16} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{qty}</Text>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => setQty(qty + 1)}
            activeOpacity={0.7}
          >
            <Plus size={16} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.addToCartBtn}
          onPress={handleAddToCart}
          activeOpacity={0.85}
        >
          <ShoppingBag size={18} color="#FFFFFF" />
          <Text style={styles.addToCartText}>
            Add to Basket • ₹{product.price * qty}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF8',
  },
  scrollContent: {
    paddingBottom: 90,
  },
  imageBox: {
    width: '100%',
    height: 250,
    backgroundColor: '#E2E8F0',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  organicTag: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  organicTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  metaRow: {
    gap: 6,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  priceLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  priceVal: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primary,
    marginTop: 2,
  },
  priceUnit: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  stockBox: {
    alignItems: 'flex-end',
  },
  stockLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  stockVal: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 20,
  },
  farmerCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 16,
    padding: 14,
  },
  farmerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  farmerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  farmerDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  farmerName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  farmerSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  callFarmerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  callFarmerText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#F8FAFC',
  },
  stepBtn: {
    padding: 6,
  },
  qtyText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    paddingHorizontal: 10,
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
