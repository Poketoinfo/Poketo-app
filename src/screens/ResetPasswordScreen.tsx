import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import Logo from '../components/Logo';
import PasswordField from '../components/PasswordField';
import PrimaryButton from '../components/PrimaryButton';
import { supabase } from '../lib/supabase';
import { colors, spacing, typography } from '../theme/colors';
import { useLanguage } from '../lib/i18n/LanguageContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen({ navigation }: Props) {
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);

  const handleUrl = async (url: string | null) => {
    if (!url) {
      setChecking(false);
      return;
    }
    try {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(url);
      if (exchangeError) {
        console.warn('exchangeCodeForSession error:', exchangeError.message);
        setError(t('errorGeneric'));
      } else {
        setReady(true);
      }
    } catch (e: any) {
      console.warn('exchangeCodeForSession threw:', e?.message);
      setError(t('errorGeneric'));
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    // Cas 1 : l'app était fermée et s'ouvre directement via le lien
    Linking.getInitialURL().then(handleUrl);

    // Cas 2 : l'app était déjà ouverte en arrière-plan
    const subscription = Linking.addEventListener('url', (event) => {
      handleUrl(event.url);
    });

    return () => subscription.remove();
  }, []);

  const handleReset = async () => {
    setError('');
    if (password.length < 6) {
      setError(t('errorPasswordShort'));
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSuccess(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Logo size={90} />
            <Text style={styles.title}>{t('resetPasswordTitle')}</Text>
            <Text style={styles.subtitle}>{t('resetPasswordSubtitle')}</Text>
          </View>

          {success ? (
            <>
              <Text style={styles.success}>{t('resetPasswordSuccess')}</Text>
              <PrimaryButton
                title={t('backToLogin')}
                onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
                style={{ marginTop: spacing.lg }}
              />
            </>
          ) : (
            <View style={styles.form}>
              {checking ? (
                <Text style={styles.subtitle}>{t('resetPasswordSubtitle')}</Text>
              ) : (
                <>
                  <PasswordField
                    label={t('newPasswordLabel')}
                    placeholder={t('passwordPlaceholder')}
                    value={password}
                    onChangeText={setPassword}
                  />
                  {!!error && <Text style={styles.error}>{error}</Text>}
                  <PrimaryButton
                    title={t('resetPasswordButton')}
                    onPress={handleReset}
                    loading={loading}
                    disabled={!ready}
                    style={{ marginTop: spacing.sm }}
                  />
                  {!ready && !error && (
                    <Text style={styles.hint}>{t('resetPasswordVerifying')}</Text>
                  )}
                </>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    justifyContent: 'center',
  },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  title: { ...typography.h2, color: colors.text, marginTop: spacing.md, textAlign: 'center' },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  form: { marginBottom: spacing.xl },
  error: { color: colors.error, ...typography.small, marginBottom: spacing.sm },
  success: {
    ...typography.body,
    color: colors.success,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  hint: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});