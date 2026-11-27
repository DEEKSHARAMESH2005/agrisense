import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { TabNavigator } from './TabNavigator';
import { SoilScreen } from '../screens/soil/SoilScreen';
import { ProductDetailScreen } from '../screens/marketplace/ProductDetailScreen';
import { CartScreen } from '../screens/marketplace/CartScreen';
import { CheckoutScreen } from '../screens/marketplace/CheckoutScreen';
import { OrderConfirmationScreen } from '../screens/marketplace/OrderConfirmationScreen';
import { AddListingScreen } from '../screens/marketplace/AddListingScreen';
import { OrdersScreen } from '../screens/orders/OrdersScreen';
import { DeliveryMapScreen } from '../screens/orders/DeliveryMapScreen';
import { DiseaseHistoryScreen } from '../screens/disease/DiseaseHistoryScreen';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const { isLoggedIn, hasSeenOnboarding, completeOnboarding } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!hasSeenOnboarding) {
    return <OnboardingScreen onComplete={completeOnboarding} />;
  }

  if (!isLoggedIn) {
    if (authMode === 'register') {
      return <RegisterScreen onNavigateToLogin={() => setAuthMode('login')} />;
    }
    return <LoginScreen onNavigateToRegister={() => setAuthMode('register')} />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="SoilDetails" component={SoilScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen as any} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen as any} />
      <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen as any} />
      <Stack.Screen name="AddListing" component={AddListingScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="DeliveryMap" component={DeliveryMapScreen as any} />
      <Stack.Screen name="DiseaseHistory" component={DiseaseHistoryScreen} />
    </Stack.Navigator>
  );
};
