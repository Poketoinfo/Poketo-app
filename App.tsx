import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { CurrencyProvider } from './src/lib/CurrencyContext';
import { LanguageProvider } from './src/lib/i18n/LanguageContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </CurrencyProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
