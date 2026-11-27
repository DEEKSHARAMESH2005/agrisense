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
import { User, Mail, Phone, MapPin, Lock, ArrowLeft } from 'lucide-react-native';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigateToLogin }) => {
  const { register } = useAuth();
  const [role, setRole] = useState<UserRole>('farmer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!phone.trim() || phone.length < 8) {
      setError('Please enter a valid mobile number');
      return;
    }
    if (!location.trim()) {
      setError('Please enter your farm or city location');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await register(name, email, phone, role, location);
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
          {/* Back button */}
          <TouchableOpacity
            onPress={onNavigateToLogin}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={colors.textPrimary} />
            <Text style={styles.backText}>Back to Sign In</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Join AgriSense</Text>
            <Text style={styles.subtitle}>
              Connect with smart farming diagnostics and direct markets
            </Text>
          </View>

          {/* Role selector */}
          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>I want to join as a:</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                onPress={() => setRole('farmer')}
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
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setRole('buyer')}
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
              </TouchableOpacity>
            </View>
          </View>

          {/* Form fields */}
          <Input
            label="Full Name"
            placeholder="e.g. Ramesh Patel"
            value={name}
            onChangeText={(t) => {
              setName(t);
              setError('');
            }}
            leftIcon={<User size={18} color={colors.textSecondary} />}
          />

          <Input
            label="Email Address"
            placeholder="e.g. ramesh@farmmail.com"
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
            label="Mobile Number"
            placeholder="e.g. +91 98765 43210"
            value={phone}
            onChangeText={(t) => {
              setPhone(t);
              setError('');
            }}
            keyboardType="phone-pad"
            leftIcon={<Phone size={18} color={colors.textSecondary} />}
          />

          <Input
            label={role === 'farmer' ? 'Farm Location / Village' : 'City / Delivery Address'}
            placeholder={role === 'farmer' ? 'e.g. Nashik, Maharashtra' : 'e.g. Pune, Maharashtra'}
            value={location}
            onChangeText={(t) => {
              setLocation(t);
              setError('');
            }}
            leftIcon={<MapPin size={18} color={colors.textSecondary} />}
          />

          <Input
            label="Password"
            placeholder="Create a secure password"
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
            title={`Create ${role === 'farmer' ? 'Farmer' : 'Buyer'} Account`}
            onPress={handleRegister}
            loading={loading}
            style={styles.submitBtn}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerPrompt}>Already have an account?</Text>
            <TouchableOpacity onPress={onNavigateToLogin} activeOpacity={0.7}>
              <Text style={styles.loginLink}> Sign In</Text>
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
    paddingVertical: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  roleContainer: {
    marginBottom: 18,
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  roleCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  roleCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#F0FDF4',
  },
  roleEmoji: {
    fontSize: 22,
    marginBottom: 2,
  },
  roleTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  roleTitleActive: {
    color: colors.primary,
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
  submitBtn: {
    marginTop: 8,
    marginBottom: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  footerPrompt: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
});
