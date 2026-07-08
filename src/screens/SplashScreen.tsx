import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import Logo from '../components/Logo';
import { colors, radius, spacing } from '../theme/colors';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const LOAD_DURATION = 1200;

export default function SplashScreen({ navigation }: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const initialUrl = await Linking.getInitialURL();

      if (initialUrl) {
        const parsed = Linking.parse(initialUrl);
        // Pour un schéma custom "poketo://reset-password", le segment
        // après "://" est traité comme hostname et non comme path.
        const target = (parsed.hostname || parsed.path || '').replace(/^\//, '');

        if (target === 'reset-password' || target === 'login' || target === 'verify-email') {
          // La config `linking` du NavigationContainer prend déjà en charge
          // le routage vers le bon écran : on ne fait rien de plus ici pour
          // éviter un conflit de navigation.
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      const destination: 'Login' | 'Home' = data.session ? 'Home' : 'Login';

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