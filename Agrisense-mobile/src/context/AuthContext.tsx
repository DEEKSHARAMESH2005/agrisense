import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '../types';
import { demoFarmer, demoBuyer, fetchDemoUsers } from '../constants/mockData';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isLoggedIn: boolean;
  isLoading: boolean;
  hasSeenOnboarding: boolean;
  completeOnboarding: () => Promise<void>;
  login: (email: string, role: UserRole) => Promise<void>;
  register: (name: string, email: string, phone: string, role: UserRole, location: string) => Promise<void>;
  switchRole: (newRole: UserRole) => void;
  updateProfile: (updated: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: '@agrisense_user',
  ONBOARDING: '@agrisense_onboarding_done',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(demoFarmer);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedOnboarding = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING);
      if (storedOnboarding !== null) {
        setHasSeenOnboarding(storedOnboarding === 'true');
      }

      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setIsLoggedIn(true);
      } else {
        // Fetch demo farmer from mock data JSON
        const { demoFarmer: fetchedFarmer } = await fetchDemoUsers();
        setUser(fetchedFarmer);
        setIsLoggedIn(true);
      }
    } catch (e) {
      console.warn('Error loading auth from storage', e);
      const { demoFarmer: fetchedFarmer } = await fetchDemoUsers();
      setUser(fetchedFarmer);
      setIsLoggedIn(true);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    setHasSeenOnboarding(true);
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING, 'true');
  };

  const login = async (email: string, role: UserRole) => {
    const newUser: User = role === 'farmer' ? { ...demoFarmer, email } : { ...demoBuyer, email };
    setUser(newUser);
    setIsLoggedIn(true);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
  };

  const register = async (name: string, email: string, phone: string, role: UserRole, location: string) => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      phone,
      role,
      location,
      avatarUrl: role === 'farmer' ? demoFarmer.avatarUrl : demoBuyer.avatarUrl,
    };
    setUser(newUser);
    setIsLoggedIn(true);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'farmer') {
      setUser({ ...demoFarmer });
    } else {
      setUser({ ...demoBuyer });
    }
  };

  const updateProfile = async (updated: Partial<User>) => {
    if (!user) return;
    const merged = { ...user, ...updated };
    setUser(merged);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(merged));
  };

  const logout = async () => {
    setUser(null);
    setIsLoggedIn(false);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'farmer',
        isLoggedIn,
        isLoading,
        hasSeenOnboarding,
        completeOnboarding,
        login,
        register,
        switchRole,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
