import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ExpoLinking from 'expo-linking';
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

const PRIVACY_URL = 'https://poketo.info/confidentialite.html';
const TERMS_URL = 'https://poketo.info/conditions.html';

export default function SignupScreen({ navigation }: Props) {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
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
    if (!acceptedTerms) {
      return t('errorAcceptTerms');
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
        emailRedirectTo: ExpoLinking.createURL('login'),
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

  const openPrivacy = () => Linking.openURL(PRIVACY_URL);
  const openTerms = () => Linking.openURL(TERMS_URL);

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

            <Pressable
              style={styles.checkboxRow}
              onPress={() => setAcceptedTerms((prev) => !prev)}
              hitSlop={8}
            >
              <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxText}>
                {t('acceptTermsPrefix')}{' '}
                <Text style={styles.linkText} onPress={openPrivacy}>
                  {t('privacyPolicyLink')}
                </Text>{' '}
                {t('andConnector')}{' '}
                <Text style={styles.linkText} onPress={openTerms}>
                  {t('termsOfUseLink')}
                </Text>
              </Text>
            </Pressable>

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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 14,
  },
  checkboxText: {
    ...typography.small,
    color: colors.textSecondary,
    flex: 1,
    flexWrap: 'wrap',
  },
  linkText: {
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
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