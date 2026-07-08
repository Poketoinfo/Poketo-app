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
import * as Linking from 'expo-linking';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import Logo from '../components/Logo';
import TextField from '../components/TextField';
import PasswordField from '../components/PasswordField';
import PrimaryButton from '../components/PrimaryButton';
import { supabase } from '../lib/supabase';
import { colors, spacing, typography } from '../theme/colors';
import { useLanguage } from '../lib/i18n/LanguageContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!username.trim() || !email.trim() || !password) {
      return t('errorFillFields');
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return t('errorInvalidEmail');
    }
    if (password.length < 6) {
      return t('errorPasswordShort');
    }
    return '';
  };

  const handleSignup = async () => {
    const validationError = validate();
    setError(validationError);
    if (validationError) return;

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { username: username.trim() },
        emailRedirectTo: Linking.createURL('login'),
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (!data.session) {
      navigation.replace('VerifyEmail', { email: email.trim() });
    } else {
      navigation.replace('Home');
    }
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
            <Text style={styles.title}>{t('signupTitle')}</Text>
            <Text style={styles.subtitle}>{t('signupSubtitle')}</Text>
          </View>

          <View style={styles.form}>
            <TextField
              label={t('usernameLabel')}
              placeholder={t('usernamePlaceholder')}
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
            <TextField
              label={t('emailLabel')}
              placeholder={t('emailPlaceholder')}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <PasswordField
              label={t('passwordLabel')}
              placeholder={t('passwordPlaceholder')}
              value={password}
              onChangeText={setPassword}
            />

            {!!error && <Text style={styles.error}>{error}</Text>}

            <PrimaryButton
              title={t('signupButton')}
              onPress={handleSignup}
              loading={loading}
              style={{ marginTop: spacing.sm }}
            />
          </View>

          <Pressable style={styles.footer} onPress={() => navigation.goBack()}>
            <Text style={styles.footerText}>
              {t('haveAccount')} <Text style={styles.footerLink}>{t('backToLogin')}</Text>
            </Text>
          </Pressable>
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
    marginBottom: spacing.lg,
  },
  error: {
    color: colors.error,
    ...typography.small,
    marginBottom: spacing.sm,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});