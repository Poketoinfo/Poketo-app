import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { CurrencyProvider } from './src/lib/CurrencyContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <CurrencyProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </CurrencyProvider>
    </SafeAreaProvider>
  );
}