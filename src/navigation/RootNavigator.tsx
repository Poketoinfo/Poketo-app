import React, { useEffect, useRef } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import type { RootStackParamList } from './types';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TransactionDetailScreen from '../screens/TransactionDetailScreen';
import TransactionHistoryScreen from '../screens/TransactionHistoryScreen';
import InactivityManager from '../lib/InactivityManager';
import { handleRecoveryUrl, isResetPasswordUrl } from '../lib/authDeepLink';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const linking = {
  prefixes: [Linking.createURL('/'), 'poketo://'],
  config: {
    screens: {
      Splash: 'splash',
      Login: 'login',
      Signup: 'signup',
      VerifyEmail: 'verify-email',
      ForgotPassword: 'forgot-password',
      // 'reset-password' est volontairement ABSENT d'ici : ce lien contient
      // un code à usage unique, traité manuellement (Splash pour cold
      // start, listener ci-dessous pour warm start) pour qu'il ne soit
      // jamais consommé deux fois.
      Home: 'home',
      Settings: 'settings',
      Profile: 'profile',
      AddTransaction: 'add-transaction',
      TransactionDetail: 'transaction/:id',
      TransactionHistory: 'history/:type',
    },
  },
};

export default function RootNavigator() {
  const lastHandledUrl = useRef<string | null>(null);

  useEffect(() => {
    // Warm start : l'app est déjà ouverte quand le lien est tapé. Le cold
    // start est géré exclusivement par SplashScreen.
    const subscription = Linking.addEventListener('url', async ({ url }) => {
      if (!isResetPasswordUrl(url)) return;
      if (lastHandledUrl.current === url) return;
      lastHandledUrl.current = url;

      const status = await handleRecoveryUrl(url);
      if (navigationRef.isReady()) {
        navigationRef.navigate('ResetPassword', { prehandled: true, status });
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <InactivityManager navigationRef={navigationRef} />
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="AddTransaction"
          component={AddTransactionScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="TransactionDetail"
          component={TransactionDetailScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}