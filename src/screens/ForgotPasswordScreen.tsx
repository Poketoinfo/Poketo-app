import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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
import { addLog } from '../lib/debugLog';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

type Step = 'email' | 'code' | 'success';

export default function ForgotPasswordScreen({ navigation }: Props) {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    setError('');
    if (!email.trim()) {
      setError(t('errorFillFields'));
      return;
    }
    setLoading(true);
    addLog(`ForgotPassword: demande de code OTP pour ${email.trim()}`);
    // Pas de redirectTo ici : on n'utilise plus de lien cliquable, seulement
    // le code à 6 chiffres envoyé dans le corps du mail ({{ .Token }} côté
    // template Supabase). Ça évite les faux "lien expiré" causés par le
    // pré-scan automatique des liens par Gmail/Outlook.
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);

    if (resetError) {
      addLog(`ForgotPassword: resetPasswordForEmail ÉCHEC: ${resetError.message}`);
      setError(resetError.message);
      return;
    }
    addLog('ForgotPassword: code OTP envoyé');
    setStep('code');
  };

  const handleVerifyAndReset = async () => {
    setError('');

    if (!otpCode.trim()) {
      setError(t('errorFillFields'));
      return;
    }
    if (newPassword.length < 6) {
      setError(t('errorPasswordShort'));
      return;
    }

    setLoading(true);
    addLog(`ForgotPassword: vérification du code OTP...`);
    const { error: otpError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otpCode.trim(),
      type: 'recovery',
    });

    if (otpError) {
      addLog(`ForgotPassword: verifyOtp ÉCHEC: ${otpError.message}`);
      setLoading(false);
      setError(otpError.message);
      return;
    }
    addLog('ForgotPassword: verifyOtp OK, mise à jour du mot de passe...');

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (updateError) {
      addLog(`ForgotPassword: updateUser ÉCHEC: ${updateError.message}`);
      setError(updateError.message);
      return;
    }

    addLog('ForgotPassword: mot de passe mis à jour avec succès');
    setStep('success');
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
            <Text style={styles.title}>{t('forgotPasswordTitle')}</Text>
            <Text style={styles.subtitle}>
              {step === 'email' ? t('forgotPasswordSubtitle') : t('resetPasswordSubtitle')}
            </Text>
          </View>

          {step === 'success' ? (
            <>
              <Text style={styles.success}>{t('resetPasswordSuccess')}</Text>
              <PrimaryButton
                title={t('backToLogin')}
                onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
                style={{ marginTop: spacing.lg }}
              />
            </>
          ) : step === 'email' ? (
            <View style={styles.form}>
              <TextField
                label={t('emailLabel')}
                placeholder={t('emailPlaceholder')}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              {!!error && <Text style={styles.error}>{error}</Text>}
              <PrimaryButton
                title={t('sendResetLink')}
                onPress={handleSendCode}
                loading={loading}
                style={{ marginTop: spacing.sm }}
              />
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.hint}>{email.trim()}</Text>
              <TextField
                label={t('otpCodeLabel')}
                placeholder={t('otpCodePlaceholder')}
                keyboardType="number-pad"
                maxLength={12}
                value={otpCode}
                onChangeText={setOtpCode}
              />
              <PasswordField
                label={t('newPasswordLabel')}
                placeholder={t('passwordPlaceholder')}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              {!!error && <Text style={styles.error}>{error}</Text>}
              <PrimaryButton
                title={t('resetPasswordButton')}
                onPress={handleVerifyAndReset}
                loading={loading}
                style={{ marginTop: spacing.sm }}
              />
              <PrimaryButton
                title={t('sendResetLink')}
                onPress={handleSendCode}
                loading={loading}
                variant="outline"
                style={{ marginTop: spacing.sm }}
              />
            </View>
          )}

          {step !== 'success' && (
            <PrimaryButton
              title={t('backToLogin')}
              onPress={() => navigation.goBack()}
              variant="outline"
              style={{ marginTop: spacing.lg }}
            />
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
  hint: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  form: { marginBottom: spacing.xl },
  error: { color: colors.error, ...typography.small, marginBottom: spacing.sm },
  success: {
    ...typography.body,
    color: colors.success,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});