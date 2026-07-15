// ResetPasswordScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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

const EXCHANGE_WAIT_MS = 8000;

type LinkStatus = 'checking' | 'valid' | 'invalid';

export default function ResetPasswordScreen({ navigation, route }: Props) {
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Si Splash a déjà traité le lien (cas normal du cold start), on récupère
  // directement le statut connu et on ne retraite JAMAIS l'URL — un code
  // PKCE est à usage unique, le retraiter provoquerait une fausse erreur
  // "lien expiré" même quand tout s'est bien passé.
  const prehandled = route.params?.prehandled === true;
  const [linkStatus, setLinkStatus] = useState<LinkStatus>(
    prehandled ? (route.params?.status ?? 'invalid') : 'checking'
  );

  const url = Linking.useURL();

  const handledRef = useRef(prehandled);
  const exchangePromiseRef = useRef<Promise<void> | null>(null);

  const processUrl = async (rawUrl: string): Promise<void> => {
    if (handledRef.current) return;
    handledRef.current = true;

    try {
      const parsed = Linking.parse(rawUrl);
      const qp = parsed.queryParams ?? {};

      const errorCode = (qp.error_code || qp.error) as string | undefined;
      if (errorCode) {
        console.warn('Lien de réinitialisation invalide:', qp.error_description ?? errorCode);
        setLinkStatus('invalid');
        return;
      }

      const code = qp.code as string | undefined;
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(rawUrl);
        if (exchangeError) {
          console.warn('exchangeCodeForSession error:', exchangeError.message);
          setLinkStatus('invalid');
          return;
        }
        setLinkStatus('valid');
        return;
      }

      const tokenHash = (qp.token_hash || qp.token) as string | undefined;
      if (tokenHash) {
        const { error: otpError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery',
        });
        if (otpError) {
          console.warn('verifyOtp error:', otpError.message);
          setLinkStatus('invalid');
          return;
        }
        setLinkStatus('valid');
        return;
      }

      const hashPart = rawUrl.split('#')[1];
      if (hashPart) {
        const params = new URLSearchParams(hashPart);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        const hashError = params.get('error_code') || params.get('error');

        if (hashError) {
          console.warn('Lien de réinitialisation invalide (hash):', hashError);
          setLinkStatus('invalid');
          return;
        }

        if (access_token && refresh_token) {
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (setSessionError) {
            console.warn('setSession error:', setSessionError.message);
            setLinkStatus('invalid');
            return;
          }
          setLinkStatus('valid');
          return;
        }
      }

      setLinkStatus((prev) => (prev === 'checking' ? 'valid' : prev));
    } catch (e: any) {
      console.warn('processUrl threw:', e?.message);
      setLinkStatus('invalid');
    }
  };

  const startProcessing = (rawUrl: string) => {
    if (prehandled) return; // déjà traité par Splash, on ignore toute URL
    if (exchangePromiseRef.current) return;
    exchangePromiseRef.current = processUrl(rawUrl);
  };

  // Cas "warm start" : l'app était déjà ouverte quand le lien a été tapé.
  useEffect(() => {
    if (url) startProcessing(url);
  }, [url]);

  useEffect(() => {
    if (prehandled) return;
    let isMounted = true;
    Linking.getInitialURL().then((initial) => {
      if (isMounted && initial && !handledRef.current) {
        startProcessing(initial);
      } else if (isMounted && !initial && !handledRef.current) {
        setTimeout(() => {
          if (isMounted) setLinkStatus((prev) => (prev === 'checking' ? 'invalid' : prev));
        }, EXCHANGE_WAIT_MS);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const waitForExchange = async () => {
    if (!exchangePromiseRef.current) return;
    await Promise.race([
      exchangePromiseRef.current,
      new Promise((resolve) => setTimeout(resolve, EXCHANGE_WAIT_MS)),
    ]);
  };

  const handleReset = async () => {
    setError('');

    if (password.length < 6) {
      setError(t('errorPasswordShort'));
      return;
    }

    setLoading(true);
    await waitForExchange();

    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      const message = updateError.message?.toLowerCase() ?? '';
      if (message.includes('session') || message.includes('token')) {
        setLinkStatus('invalid');
      } else {
        setError(updateError.message);
      }
      return;
    }

    setSuccess(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
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
          ) : linkStatus === 'checking' ? (
            <View style={styles.checkingBox}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.checkingText}>{t('resetPasswordVerifying')}</Text>
            </View>
          ) : linkStatus === 'invalid' ? (
            <View style={styles.form}>
              <Text style={styles.error}>{t('resetLinkInvalid')}</Text>
              <PrimaryButton
                title={t('forgotPassword')}
                onPress={() => navigation.replace('ForgotPassword')}
                variant="outline"
                style={{ marginTop: spacing.sm }}
              />
            </View>
          ) : (
            <View style={styles.form}>
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
                style={{ marginTop: spacing.sm }}
              />
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
  error: { color: colors.error, ...typography.small, marginBottom: spacing.sm, textAlign: 'center' },
  success: {
    ...typography.body,
    color: colors.success,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  checkingBox: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  checkingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});