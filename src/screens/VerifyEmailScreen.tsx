import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import Logo from '../components/Logo';
import PrimaryButton from '../components/PrimaryButton';
import { colors, spacing, typography } from '../theme/colors';
import { useLanguage } from '../lib/i18n/LanguageContext';

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyEmail'>;

export default function VerifyEmailScreen({ navigation, route }: Props) {
  const { t } = useLanguage();
  const { email } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Logo size={90} />
        <Text style={styles.title}>{t('verifyEmailTitle')}</Text>
        <Text style={styles.message}>{t('verifyEmailMessage', { email })}</Text>

        <PrimaryButton
          title={t('backToLogin')}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
          style={{ marginTop: spacing.xl }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});