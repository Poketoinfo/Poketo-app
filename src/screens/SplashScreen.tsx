import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../components/Logo';
import { colors, radius, spacing, typography } from '../theme/colors';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const LOAD_DURATION = 2200;

export default function SplashScreen({ navigation }: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let destination: 'Login' | 'Home' = 'Login';

    // On vérifie en parallèle si une session existe déjà,
    // pendant que la barre de progression s'anime.
    const checkSession = supabase.auth.getSession().then(({ data }) => {
      destination = data.session ? 'Home' : 'Login';
    });

    Animated.timing(progress, {
      toValue: 1,
      duration: LOAD_DURATION,
      useNativeDriver: false,
    }).start(async () => {
      await checkSession;
      navigation.replace(destination);
    });
  }, []);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Logo size={140} />
        <Text style={styles.title}>POKLY</Text>
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
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    letterSpacing: 2,
    marginTop: spacing.sm,
  },
  bottom: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  track: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
});
