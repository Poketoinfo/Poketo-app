import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import Logo from '../components/Logo';
import TextField from '../components/TextField';
import PasswordField from '../components/PasswordField';
import PrimaryButton from '../components/PrimaryButton';
import { supabase } from '../lib/supabase';
import { colors, spacing, typography } from '../theme/colors';
import { useLanguage } from '../lib/i18n/LanguageContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { t } = useLanguage();
  const [identifier, setIdentifier] = useState(''); // email ou pseudo
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resolveEmail = async (value: string): Promise<string | null> => {
    if (value.includes('@')) return value;

    // Value looks like a username: resolve it to an email via a secure RPC
    // qui lit raw_user_meta_data->>'username' dans auth.users.
    const { data, error: rpcError } = await supabase.rpc('get_email_by_username', {
      p_username: value,
    });

    if (rpcError) {
      console.warn('get_email_by_username RPC error:', rpcError.message);
      return null;
    }
    if (!data) {
      console.warn('Aucun compte trouvé pour le pseudo:', value);
      return null;
    }
    return data as string;
  };

  const handleLogin = async () => {
    setError('');

    const value = identifier.trim();
    if (!value || !password) {
      setError(t('errorFillFields'));
      return;
    }

    setLoading(true);

    const loginEmail = await resolveEmail(value);
    if (!loginEmail) {
      setLoading(false);
      setError(t('errorUserNotFound'));
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });
    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    navigation.replace('Home');
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
            <Text style={styles.title}>{t('loginTitle')}</Text>
            <Text style={styles.subtitle}>{t('loginSubtitle')}</Text>
          </View>

          <View style={styles.form}>
            <TextField
              label={t('emailOrUsernameLabel')}
              placeholder={t('emailOrUsernamePlaceholder')}
              autoCapitalize="none"
              value={identifier}
              onChangeText={setIdentifier}
            />
            <PasswordField
              label={t('passwordLabel')}
              placeholder={t('passwordPlaceholder')}
              value={password}
              onChangeText={setPassword}
            />

            <Pressable
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotWrap}
              hitSlop={8}
            >
              <Text style={styles.forgotText}>{t('forgotPassword')}</Text>
            </Pressable>

            {!!error && <Text style={styles.error}>{error}</Text>}

            <PrimaryButton
              title={t('loginButton')}
              onPress={handleLogin}
              loading={loading}
              style={{ marginTop: spacing.sm }}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('noAccount')}</Text>
            <PrimaryButton
              title={t('createAccount')}
              onPress={() => navigation.navigate('Signup')}
              variant="outline"
              style={{ marginTop: spacing.sm }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  form: {
    marginBottom: spacing.xl,
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    marginBottom: spacing.md,
    marginTop: -spacing.xs,
  },
  forgotText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
  error: {
    color: colors.error,
    ...typography.small,
    marginBottom: spacing.sm,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});