import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Sprout, Mail, Lock, UserCheck, Shield } from 'lucide-react-native';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToRegister }) => {
  const { login } = useAuth();
  const [role, setRole] = useState<UserRole>('farmer');
  const [email, setEmail] = useState('farmer@agrisense.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelect = (r: UserRole) => {
    setRole(r);
    if (r === 'farmer') {
      setEmail('farmer@agrisense.com');
    } else {
      setEmail('buyer@agrisense.com');
    }
  };

  const handleLogin = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, role);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo & Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Sprout size={36} color={colors.primary} />
            </View>
            <Text style={styles.appName}>AgriSense</Text>
            <Text style={styles.welcomeText}>Welcome back to your smart farm</Text>
          </View>

          {/* Role Selector Card */}
          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>Select your user role:</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                onPress={() => handleRoleSelect('farmer')}
                style={[
                  styles.roleCard,
                  role === 'farmer' && styles.roleCardActive,
                ]}
                activeOpacity={0.8}
              >
                <Text style={styles.roleEmoji}>🌾</Text>
                <Text
                  style={[
                    styles.roleTitle,
                    role === 'farmer' && styles.roleTitleActive,
                  ]}
                >
                  Farmer
                </Text>
                <Text style={styles.roleDesc}>Crops, Soil & Sales</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleRoleSelect('buyer')}
                style={[
                  styles.roleCard,
                  role === 'buyer' && styles.roleCardActive,
                ]}
                activeOpacity={0.8}
              >
                <Text style={styles.roleEmoji}>🛒</Text>
                <Text
                  style={[
                    styles.roleTitle,
                    role === 'buyer' && styles.roleTitleActive,
                  ]}
                >
                  Buyer
                </Text>
                <Text style={styles.roleDesc}>Direct Farm Orders</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Input
              label="Email Address"
              placeholder="e.g. yourname@domain.com"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={18} color={colors.textSecondary} />}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setError('');
              }}
              isPassword
              leftIcon={<Lock size={18} color={colors.textSecondary} />}
            />

            {Boolean(error) && (
              <View style={styles.errorBox}>
                <Text style={styles.errorMsg}>{error}</Text>
              </View>
            )}

            <Button
              title={`Sign In as ${role === 'farmer' ? 'Farmer' : 'Buyer'}`}
              onPress={handleLogin}
              loading={loading}
              style={styles.signInButton}
            />

            {/* Demo Notice */}
            <View style={styles.demoNotice}>
              <Shield size={14} color="#0284C7" />
              <Text style={styles.demoNoticeText}>
                Demo Mode: Pre-filled credentials ready. Tap Sign In to enter.
              </Text>
            </View>
          </View>

          {/* Switch to Register */}
          <View style={styles.footerRow}>
            <Text style={styles.footerPrompt}>Don't have an account?</Text>
            <TouchableOpacity onPress={onNavigateToRegister} activeOpacity={0.7}>
              <Text style={styles.registerLink}> Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  welcomeText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  roleContainer: {
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  roleCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  roleCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#F0FDF4',
  },
  roleEmoji: {
    fontSize: 26,
    marginBottom: 4,
  },
  roleTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  roleTitleActive: {
    color: colors.primary,
  },
  roleDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 10,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  errorMsg: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  signInButton: {
    marginTop: 6,
    marginBottom: 14,
  },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F9FF',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  demoNoticeText: {
    fontSize: 11,
    color: '#0369A1',
    flex: 1,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerPrompt: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
});
