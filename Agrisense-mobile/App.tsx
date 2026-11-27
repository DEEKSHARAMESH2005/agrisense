import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { MarketplaceProvider } from './src/context/MarketplaceContext';
import { DetectionProvider } from './src/context/DetectionContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <MarketplaceProvider>
            <DetectionProvider>
              <NavigationContainer>
                <StatusBar style="dark" />
                <RootNavigator />
              </NavigationContainer>
            </DetectionProvider>
          </MarketplaceProvider>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
