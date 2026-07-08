import React, { useEffect, useRef, useState } from 'react';
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

const EXCHANGE_WAIT_MS = 5000; // délai max qu'on attend silencieusement avant de tenter quand même

export default function ResetPasswordScreen({ navigation }: Props) {
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(false);

  // URL captée par expo-linking (lancement à froid ou événement pendant que
  // l'app est ouverte).
  const url = Linking.useURL();

  const handledRef = useRef(false);
  // Cette promesse représente le traitement du lien (exchange du code, ou
  // setSession si le lien utilise le flux implicite). handleReset l'attend
  // brièvement avant de tenter updateUser, sans jamais bloquer l'affichage
  // du formulaire.
  const exchangePromiseRef = useRef<Promise<void> | null>(null);

  const processUrl = async (rawUrl: string): Promise<void> => {
    if (handledRef.current) return;
    handledRef.current = true;

    try {
      const parsed = Linking.parse(rawUrl);
      const code = parsed.queryParams?.code as string | undefined;

      if (code) {
        // Flux PKCE (celui utilisé par ce projet, cf. supabase.ts flowType: 'pkce')
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(rawUrl);
        if (exchangeError) {
          console.warn('exchangeCodeForSession error:', exchangeError.message);
        }
        return;
      }

      // Filet de sécurité pour un éventuel flux implicite (#access_token=...)
      const hashPart = rawUrl.split('#')[1];
      if (hashPart) {
        const params = new URLSearchParams(hashPart);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (access_token && refresh_token) {
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (setSessionError) {
            console.warn('setSession error:', setSessionError.message);
          }
        }
      }
    } catch (e: any) {
      console.warn('processUrl threw:', e?.message);
    }
  };

  const startProcessing = (rawUrl: string) => {
    if (exchangePromiseRef.current) return;
    exchangePromiseRef.current = processUrl(rawUrl);
  };

  useEffect(() => {
    if (url) startProcessing(url);
  }, [url]);

  // Filet de sécurité au montage, au cas où useURL() n'aurait pas encore
  // de valeur alors que l'URL de lancement existe déjà.
  useEffect(() => {
    let isMounted = true;
    Linking.getInitialURL().then((initial) => {
      if (isMounted && initial && !handledRef.current) {
        startProcessing(initial);
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
    setLinkInvalid(false);

    if (password.length < 6) {
      setError(t('errorPasswordShort'));
      return;
    }

    setLoading(true);

    // On attend silencieusement (max 5s) que le lien ait fini d'être traité
    // s'il est encore en cours de vérification, sans jamais bloquer le
    // formulaire visuellement.
    await waitForExchange();

    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      // "Auth session missing" ou équivalent = le lien n'a pas pu être
      // validé (expiré, déjà utilisé, ou mal configuré côté Supabase).
      const message = updateError.message?.toLowerCase() ?? '';
      if (message.includes('session') || message.includes('token')) {
        setLinkInvalid(true);
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
          ) : (
            <View style={styles.form}>
              <PasswordField
                label={t('newPasswordLabel')}
                placeholder={t('passwordPlaceholder')}
                value={password}
                onChangeText={setPassword}
              />

              {!!error && <Text style={styles.error}>{error}</Text>}

              {linkInvalid && (
                <>
                  <Text style={styles.error}>{t('errorGeneric')}</Text>
                  <PrimaryButton
                    title={t('forgotPassword')}
                    onPress={() => navigation.replace('ForgotPassword')}
                    variant="outline"
                    style={{ marginBottom: spacing.sm }}
                  />
                </>
              )}

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
});