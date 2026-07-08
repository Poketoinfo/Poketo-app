import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme/colors';
import TextField from '../components/TextField';
import PasswordField from '../components/PasswordField';
import PrimaryButton from '../components/PrimaryButton';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../lib/i18n/LanguageContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [infoError, setInfoError] = useState('');
  const [infoSuccess, setInfoSuccess] = useState('');
  const [savingInfo, setSavingInfo] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setEmail(data.user.email ?? '');
        setUsername((data.user.user_metadata?.username as string) ?? '');
      }
    });
  }, []);

  const handleSaveInfo = async () => {
    setInfoError('');
    setInfoSuccess('');
    if (!username.trim()) {
      setInfoError(t('errorNameRequired'));
      return;
    }
    setSavingInfo(true);
    const { error } = await supabase.auth.updateUser({
      data: { username: username.trim() },
    });
    setSavingInfo(false);
    if (error) {
      setInfoError(error.message);
      return;
    }
    setInfoSuccess(t('infoUpdated'));
  };

  const handleSavePassword = async () => {
    setPwdError('');
    setPwdSuccess('');
    if (newPassword.length < 6) {
      setPwdError(t('errorPasswordShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError(t('errorPasswordMismatch'));
      return;
    }
    setSavingPwd(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPwd(false);
    if (error) {
      setPwdError(error.message);
      return;
    }
    setNewPassword('');
    setConfirmPassword('');
    setPwdSuccess(t('passwordUpdated'));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>{t('profileTitle')}</Text>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>{t('personalInfo')}</Text>
          <TextField
            label={t('usernameFieldLabel')}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextField label={t('emailFieldLabel')} value={email} editable={false} style={styles.disabled} />
          {!!infoError && <Text style={styles.error}>{infoError}</Text>}
          {!!infoSuccess && <Text style={styles.success}>{infoSuccess}</Text>}
          <PrimaryButton
            title={t('savePersonalInfo')}
            onPress={handleSaveInfo}
            loading={savingInfo}
            style={{ marginTop: spacing.sm, marginBottom: spacing.xl }}
          />

          <Text style={styles.sectionTitle}>{t('changePasswordTitle')}</Text>
          <PasswordField
            label={t('newPasswordFieldLabel')}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <PasswordField
            label={t('confirmPasswordLabel')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          {!!pwdError && <Text style={styles.error}>{pwdError}</Text>}
          {!!pwdSuccess && <Text style={styles.success}>{pwdSuccess}</Text>}
          <PrimaryButton
            title={t('savePasswordButton')}
            onPress={handleSavePassword}
            loading={savingPwd}
            style={{ marginTop: spacing.sm }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topTitle: { ...typography.body, fontWeight: '700', color: colors.text },
  scroll: { padding: spacing.lg },
  sectionTitle: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  disabled: { opacity: 0.6 },
  error: { ...typography.small, color: colors.error, marginBottom: spacing.sm },
  success: { ...typography.small, color: colors.success, marginBottom: spacing.sm },
});