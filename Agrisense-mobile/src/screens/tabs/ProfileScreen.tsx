import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useDetection } from '../../context/DetectionContext';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  ShoppingBag,
  History,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Edit3,
  RefreshCw,
  Sparkles,
} from 'lucide-react-native';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, role, switchRole, updateProfile, logout } = useAuth();
  const { products, orders } = useMarketplace();
  const { history } = useDetection();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');

  const myProductsCount = products.filter((p) => p.farmerName.includes(user?.name.split(' ')[0] || '')).length;

  const handleSaveProfile = async () => {
    await updateProfile({ name, phone, location });
    setEditModalVisible(false);
    Alert.alert('Profile Updated', 'Your profile details have been saved.');
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of AgriSense?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Profile & Settings"
        subtitle="Account Preferences & Tools"
        showRoleSwitch={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Identity Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <Image
              source={{
                uri:
                  user?.avatarUrl ||
                  'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=250',
              }}
              style={styles.avatar}
            />

            <View style={styles.userMeta}>
              <View style={styles.roleBadgeRow}>
                <View
                  style={[
                    styles.roleBadge,
                    {
                      backgroundColor:
                        role === 'farmer' ? '#DCFCE7' : '#E0F2FE',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.roleBadgeText,
                      {
                        color:
                          role === 'farmer' ? '#15803D' : '#0369A1',
                      },
                    ]}
                  >
                    {role === 'farmer' ? '🌾 Verified Farmer' : '🛒 Registered Buyer'}
                  </Text>
                </View>
              </View>

              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Text style={styles.userLocation}>📍 {user?.location}</Text>
            </View>

            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => {
                setName(user?.name || '');
                setPhone(user?.phone || '');
                setLocation(user?.location || '');
                setEditModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <Edit3 size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Quick role switch pill */}
          <View style={styles.switchBox}>
            <View style={styles.switchInfo}>
              <RefreshCw size={14} color={colors.primary} />
              <Text style={styles.switchInfoText}>
                Active View: <Text style={{ fontWeight: '800' }}>{role.toUpperCase()}</Text>
              </Text>
            </View>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => switchRole(role === 'farmer' ? 'buyer' : 'farmer')}
              activeOpacity={0.8}
            >
              <Text style={styles.switchButtonText}>
                Switch to {role === 'farmer' ? 'Buyer' : 'Farmer'} Mode
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Operational Shortcuts */}
        <View style={styles.menuCard}>
          <Text style={styles.menuSectionTitle}>My Activity & Records</Text>

          {role === 'farmer' && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('AddListing')}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconCircle, { backgroundColor: '#F3E8FF' }]}>
                  <ShoppingBag size={18} color="#7C3AED" />
                </View>
                <View>
                  <Text style={styles.menuTitle}>My Farm Listings</Text>
                  <Text style={styles.menuSub}>Create or manage crop listings</Text>
                </View>
              </View>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Orders')}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <ShoppingBag size={18} color="#D97706" />
              </View>
              <View>
                <Text style={styles.menuTitle}>Orders & Deliveries</Text>
                <Text style={styles.menuSub}>{orders.length} total shipments tracked</Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('DiseaseHistory')}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: '#DCFCE7' }]}>
                <History size={18} color="#16A34A" />
              </View>
              <View>
                <Text style={styles.menuTitle}>Plant Disease Scans</Text>
                <Text style={styles.menuSub}>{history.length} saved diagnostic records</Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* App Settings & Help */}
        <View style={styles.menuCard}>
          <Text style={styles.menuSectionTitle}>Preferences & Support</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              Alert.alert(
                'AgriSense Platform',
                'AgriSense v1.0.0 (Production Frontend)\nExpo SDK 58 • React Native\nOffline Mock Store & State Persistence enabled.'
              )
            }
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: '#F1F5F9' }]}>
                <Settings size={18} color={colors.textPrimary} />
              </View>
              <View>
                <Text style={styles.menuTitle}>Application Info</Text>
                <Text style={styles.menuSub}>Version, build & architecture</Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              Alert.alert(
                'Help & Agro Support',
                'For student project evaluations, all buttons are interactive with instant simulated feedback. Call 1800-AGRI-SENSE for farmer helpline.'
              )
            }
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: '#E0F2FE' }]}>
                <HelpCircle size={18} color="#0284C7" />
              </View>
              <View>
                <Text style={styles.menuTitle}>Help & Support</Text>
                <Text style={styles.menuSub}>FAQ, guides & demonstration tips</Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LogOut size={18} color="#DC2626" />
          <Text style={styles.logoutText}>Sign Out of AgriSense</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Input
              label="Full Name"
              value={name}
              onChangeText={setName}
            />

            <Input
              label="Contact Phone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <Input
              label="Farm / City Location"
              value={location}
              onChangeText={setLocation}
            />

            <Button
              title="Save Profile Changes"
              onPress={handleSaveProfile}
              style={{ marginTop: 10 }}
            />
          </View>
        </View>
      </Modal>
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
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E2E8F0',
  },
  userMeta: {
    flex: 1,
  },
  roleBadgeRow: {
    marginBottom: 4,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  userName: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  userLocation: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  editBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  switchBox: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  switchInfoText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  switchButton: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  switchButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  menuSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  menuSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  cancelText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modalBody: {
    gap: 4,
  },
});
