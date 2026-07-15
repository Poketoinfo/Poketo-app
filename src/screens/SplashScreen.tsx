import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import Logo from '../components/Logo';
import { colors, radius, spacing } from '../theme/colors';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';
import { claimRecoveryUrl, isResetPasswordUrl } from '../lib/authDeepLink';
import { addLog } from '../lib/debugLog';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const LOAD_DURATION = 1200;
// Sur Android en particulier, l'URL de lancement (getInitialURL) peut
// arriver quelques centaines de ms après le montage de l'écran, sous forme
// d'événement 'url' plutôt que d'URL initiale immédiatement disponible. On
// attend ce court délai avant de conclure "pas de deep link" et de partir
// sur Login.
const DEEP_LINK_GRACE_MS = 800;

// Course entre getInitialURL() et un éventuel événement 'url' qui arriverait
// dans la foulée du cold start.
function waitForLaunchUrl(graceMs: number): Promise<string | null> {
  return new Promise((resolve) => {
    let settled = false;
    let subscription: { remove: () => void } | null = null;

    const finish = (url: string | null) => {
      if (settled) return;
      settled = true;
      subscription?.remove();
      resolve(url);
    };

    subscription = Linking.addEventListener('url', ({ url }) => finish(url));

    Linking.getInitialURL().then((url) => {
      if (url) finish(url);
    });

    setTimeout(() => finish(null), graceMs);
  });
}

export default function SplashScreen({ navigation }: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      addLog('Splash: en attente de l\'URL de lancement...');
      const initialUrl = await waitForLaunchUrl(DEEP_LINK_GRACE_MS);
      addLog(`Splash: URL de lancement = ${initialUrl ?? '(aucune)'}`);

      if (initialUrl && isResetPasswordUrl(initialUrl)) {
        addLog('Splash: URL identifiée comme reset-password');
        // claimRecoveryUrl() renvoie null si RootNavigator (son propre
        // listener 'url', toujours actif) a déjà pris en charge cette même
        // URL en parallèle. Dans ce cas on NE FAIT RIEN ici : retraiter
        // l'URL provoquerait une double consommation du code PKCE (à usage
        // unique) et ferait échouer l'un des deux appels avec un faux "lien
        // expiré". C'est alors RootNavigator qui se chargera de naviguer
        // vers ResetPassword une fois l'échange terminé.
        const claim = claimRecoveryUrl(initialUrl);
        if (claim) {
          const status = await claim;
          addLog(`Splash: statut final = ${status} → navigation vers ResetPassword`);
          if (isMounted) {
            navigation.replace('ResetPassword', { prehandled: true, status });
          }
        } else {
          addLog('Splash: URL déjà réclamée ailleurs, Splash ne navigue pas');
        }
        return;
      }

      // Les autres deep links (login, verify-email, ...) restent gérés par
      // la résolution automatique de React Navigation : pas d'action ici.
      if (initialUrl && (initialUrl.includes('login') || initialUrl.includes('verify-email'))) {
        return;
      }

      const { data } = await supabase.auth.getSession();
      const destination: 'Login' | 'Home' = data.session ? 'Home' : 'Login';
      addLog(`Splash: pas de deep link reset → destination = ${destination}`);

      Animated.timing(progress, {
        toValue: 1,
        duration: LOAD_DURATION,
        useNativeDriver: false,
      }).start(() => {
        if (isMounted) navigation.replace(destination);
      });
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Logo size={150} />
      </View>

      <View style={styles.bottom}>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, { width }]} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, justifyContent: 'space-between' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  bottom: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  track: { height: 6, borderRadius: radius.full, backgroundColor: colors.primaryLight, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.full, backgroundColor: colors.primary },
});