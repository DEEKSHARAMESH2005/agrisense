import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Product } from '../../types';
import { colors } from '../../constants/colors';
import { MapPin, Plus, Star } from 'lucide-react-native';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onAddToCart?: () => void;
  showAddButton?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onAddToCart,
  showAddButton = true,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.imageUrl }} style={styles.image} />
        {product.isOrganic && (
          <View style={styles.organicBadge}>
            <Text style={styles.organicText}>🌱 Organic</Text>
          </View>
        )}
        {product.rating && (
          <View style={styles.ratingBadge}>
            <Star size={10} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.ratingText}>{product.rating}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {product.title}
        </Text>

        <View style={styles.locationRow}>
          <MapPin size={11} color={colors.textSecondary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {product.location}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <View>
            <Text style={styles.price}>
              ₹{product.price}
              <Text style={styles.unit}> / {product.unit}</Text>
            </Text>
            <Text style={styles.stock}>
              Stock: {product.quantity} {product.unit}s
            </Text>
          </View>

          {showAddButton && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation?.();
                onAddToCart?.();
              }}
              style={styles.addBtn}
              activeOpacity={0.8}
            >
              <Plus size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 14,
  },
  imageContainer: {
    height: 140,
    width: '100%',
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  organicBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  organicText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  content: {
    padding: 12,
  },
  category: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  unit: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  stock: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  addBtn: {
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 10,
  },
});
