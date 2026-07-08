import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import { supabase } from './supabase';
import type { RootStackParamList } from '../navigation/types';

const STORAGE_KEY = 'poketo:last_background_at';
const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

type Props = {
  navigationRef: NavigationContainerRefWithCurrent<RootStackParamList>;
};

/**
 * Déconnecte automatiquement l'utilisateur si l'app est restée en arrière-plan
 * plus de 5 minutes, pour éviter de rester connecté indéfiniment.
 * Ne passe jamais par l'écran Splash (voir consigne "affiché une seule fois").
 */
export default function InactivityManager({ navigationRef }: Props) {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (next: AppStateStatus) => {
      const prev = appState.current;
      appState.current = next;

      if (prev === 'active' && (next === 'background' || next === 'inactive')) {
        await AsyncStorage.setItem(STORAGE_KEY, String(Date.now()));
        return;
      }

      if (prev !== 'active' && next === 'active') {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!stored) return;

        const elapsed = Date.now() - Number(stored);
        if (elapsed >= TIMEOUT_MS) {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            await supabase.auth.signOut();
          }
          if (navigationRef.isReady()) {
            navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
          }
        }
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
    });

    return () => subscription.remove();
  }, [navigationRef]);

  return null;
}