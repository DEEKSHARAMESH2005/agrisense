import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ArrowLeft, ShoppingBag, Bell, RefreshCw } from 'lucide-react-native';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  showRoleSwitch?: boolean;
  rightAction?: React.ReactNode;
  onCartPress?: () => void;
  onNotificationsPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  showRoleSwitch = true,
  rightAction,
  onCartPress,
  onNotificationsPress,
}) => {
  const { role, switchRole } = useAuth();
  const { totalCount } = useCart();

  const toggleRole = () => {
    switchRole(role === 'farmer' ? 'buyer' : 'farmer');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.left}>
          {showBack && (
            <TouchableOpacity
              onPress={onBack}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ArrowLeft size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {Boolean(subtitle) && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.right}>
          {showRoleSwitch && (
            <TouchableOpacity
              onPress={toggleRole}
              style={[
                styles.roleTogglePill,
                role === 'farmer' ? styles.farmerPill : styles.buyerPill,
              ]}
              activeOpacity={0.8}
            >
              <RefreshCw size={11} color={role === 'farmer' ? colors.primaryDark : '#0284C7'} />
              <Text
                style={[
                  styles.roleToggleText,
                  { color: role === 'farmer' ? colors.primaryDark : '#0369A1' },
                ]}
              >
                {role === 'farmer' ? '🌾 Farmer' : '🛒 Buyer'}
              </Text>
            </TouchableOpacity>
          )}

          {onCartPress && (
            <TouchableOpacity
              onPress={onCartPress}
              style={styles.iconBtn}
              activeOpacity={0.7}
            >
              <ShoppingBag size={20} color={colors.textPrimary} />
              {totalCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {totalCount > 9 ? '9+' : totalCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {onNotificationsPress && (
            <TouchableOpacity
              onPress={onNotificationsPress}
              style={styles.iconBtn}
              activeOpacity={0.7}
            >
              <Bell size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          )}

          {rightAction}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 6,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
  },
  farmerPill: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  buyerPill: {
    backgroundColor: '#E0F2FE',
    borderColor: '#7DD3FC',
  },
  roleToggleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  iconBtn: {
    padding: 7,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.danger,
    borderRadius: 10,
    width: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
