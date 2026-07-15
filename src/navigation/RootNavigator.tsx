import React, { useEffect } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';
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
import { claimRecoveryUrl, isResetPasswordUrl } from '../lib/authDeepLink';
import { addLog, getLogsAsText, clearLogs } from '../lib/debugLog';

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
      // un code à usage unique, traité manuellement (voir listener
      // ci-dessous, partagé avec SplashScreen via claimRecoveryUrl) pour
      // qu'il ne soit jamais consommé deux fois.
      Home: 'home',
      Settings: 'settings',
      Profile: 'profile',
      AddTransaction: 'add-transaction',
      TransactionDetail: 'transaction/:id',
      TransactionHistory: 'history/:type',
    },
  },
};

// Bouton flottant visible uniquement en dev, pour consulter les logs
// directement sur le téléphone sans passer par adb. À retirer une fois le
// flux de reset-password stabilisé.
function DebugLogButton() {
  // Temporairement affiché dans tous les types de build (dev, preview,
  // production) le temps de debugger le flux de reset-password. Remettre
  // `if (!__DEV__) return null;` une fois le problème résolu.

  return (
    <Pressable
      style={styles.debugButton}
      onPress={() => {
        Alert.alert('Logs', getLogsAsText(), [
          { text: 'Effacer', onPress: () => clearLogs() },
          { text: 'Fermer', style: 'cancel' },
        ]);
      }}
    >
      <Text style={styles.debugButtonText}>Logs</Text>
    </Pressable>
  );
}

export default function RootNavigator() {
  useEffect(() => {
    // Ce listener tourne en permanence dès le montage de l'app — il gère
    // le cas "warm start" (app déjà ouverte quand le lien est tapé) ET,
    // sur Android, peut aussi recevoir l'URL de lancement en même temps
    // que SplashScreen (double déclenchement du même cold start).
    //
    // claimRecoveryUrl() est le verrou partagé : si SplashScreen a déjà
    // "réclamé" cette URL exacte (ou vice versa), on reçoit `null` ici et
    // on ne fait STRICTEMENT rien — ni exchange, ni navigation. L'autre
    // s'en charge déjà. Ça évite la double consommation du code PKCE qui
    // provoquait le "lien toujours expiré".
    const subscription = Linking.addEventListener('url', async ({ url }) => {
      addLog(`RootNavigator: event 'url' reçu = ${url}`);
      if (!isResetPasswordUrl(url)) return;

      const claim = claimRecoveryUrl(url);
      if (!claim) {
        addLog('RootNavigator: URL déjà réclamée ailleurs, ignoré ici');
        return;
      }

      const status = await claim;
      addLog(`RootNavigator: statut final = ${status}, navigationRef ready = ${navigationRef.isReady()}`);
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
      <DebugLogButton />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  debugButton: {
    position: 'absolute',
    bottom: 40,
    right: 16,
    backgroundColor: '#000000cc',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 9999,
    elevation: 9999,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});