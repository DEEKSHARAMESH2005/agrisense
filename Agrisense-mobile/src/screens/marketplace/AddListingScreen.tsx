import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Camera, Image as ImageIcon, Tag, Check, Sparkles } from 'lucide-react-native';

const categories = ['Vegetables', 'Fruits', 'Grains', 'Seeds', 'Fertilizers'];

const presetPhotos = [
  { label: 'Tomatoes', uri: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600' },
  { label: 'Mangoes', uri: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600' },
  { label: 'Basmati', uri: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600' },
  { label: 'Capsicum', uri: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600' },
];

interface AddListingScreenProps {
  navigation: any;
}

export const AddListingScreen: React.FC<AddListingScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { addProduct } = useMarketplace();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<any>('Vegetables');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('kg');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState(user?.location || 'Nashik Valley, Maharashtra');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(presetPhotos[0].uri);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        setImageUrl(res.assets[0].uri);
      }
    } catch (e) {
      console.warn('Image picker error', e);
    }
  };

  const handlePublish = () => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a product/crop name.');
      return;
    }
    if (!price || isNaN(Number(price))) {
      Alert.alert('Required Field', 'Please enter a valid price.');
      return;
    }
    if (!quantity || isNaN(Number(quantity))) {
      Alert.alert('Required Field', 'Please enter available quantity.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      addProduct({
        title,
        category,
        price: Number(price),
        unit,
        quantity: Number(quantity),
        availableDate: new Date().toISOString().split('T')[0],
        location,
        farmerName: user?.name || 'Ramesh Patel',
        farmerPhone: user?.phone || '+91 98765 43210',
        imageUrl,
        description: description || 'Fresh naturally cultivated farm produce directly from grower.',
        rating: 5.0,
        isOrganic: true,
      });

      setLoading(false);
      Alert.alert('Listing Published', 'Your produce is now visible on the marketplace!', [
        { text: 'View in Market', onPress: () => navigation.goBack() },
      ]);
    }, 600);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Sell Harvest"
        subtitle="Post Produce to Marketplace"
        showBack={true}
        onBack={() => navigation.goBack()}
        showRoleSwitch={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image Preview & Selection */}
        <View style={styles.imageSection}>
          <Image source={{ uri: imageUrl }} style={styles.previewImage} />
          <TouchableOpacity style={styles.uploadBtn} onPress={pickImage} activeOpacity={0.8}>
            <ImageIcon size={16} color={colors.primary} />
            <Text style={styles.uploadText}>Change Photo from Gallery</Text>
          </TouchableOpacity>

          <Text style={styles.presetLabel}>Or pick a farm crop preset:</Text>
          <View style={styles.presetRow}>
            {presetPhotos.map((p, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setImageUrl(p.uri)}
                style={[styles.presetChip, imageUrl === p.uri && styles.presetChipActive]}
              >
                <Text
                  style={[
                    styles.presetChipText,
                    imageUrl === p.uri && styles.presetChipTextActive,
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category Picker */}
        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            {categories.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setCategory(c)}
                style={[styles.catPill, category === c && styles.catPillActive]}
              >
                <Text style={[styles.catText, category === c && styles.catTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Input
            label="Product Name"
            placeholder="e.g. Organic Red Tomatoes"
            value={title}
            onChangeText={setTitle}
          />

          <View style={styles.row}>
            <View style={{ flex: 2 }}>
              <Input
                label="Price (₹)"
                placeholder="e.g. 40"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Unit"
                placeholder="kg / dozen"
                value={unit}
                onChangeText={setUnit}
              />
            </View>
          </View>

          <Input
            label="Available Quantity"
            placeholder="e.g. 200"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />

          <Input
            label="Farm Location"
            placeholder="e.g. Nashik, Maharashtra"
            value={location}
            onChangeText={setLocation}
          />

          <Input
            label="Produce Details / Harvest Notes"
            placeholder="Describe harvest date, pesticide-free status, packaging..."
            value={description}
            onChangeText={setDescription}
            multiline
            style={{ height: 80 }}
          />

          <Button
            title="Publish Produce Listing"
            onPress={handlePublish}
            loading={loading}
            style={styles.publishBtn}
          />
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
    paddingBottom: 40,
  },
  imageSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    marginBottom: 12,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  presetChipActive: {
    backgroundColor: colors.primary,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  presetChipTextActive: {
    color: '#FFFFFF',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  catScroll: {
    marginBottom: 14,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  catPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  catTextActive: {
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  publishBtn: {
    marginTop: 10,
  },
});
