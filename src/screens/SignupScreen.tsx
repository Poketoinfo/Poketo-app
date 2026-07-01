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
import PrimaryButton from '../components/PrimaryButton';
import { supabase } from '../lib/supabase';
import { colors, spacing, typography } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!username.trim() || !email.trim() || !password) {
      return 'Merci de remplir tous les champs.';
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return 'Adresse e-mail invalide.';
    }
    if (password.length < 6) {
      return 'Le mot de passe doit contenir au moins 6 caractères.';
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
      },
    });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        username: username.trim(),
        email: email.trim(),
      });
    }

    setLoading(false);
    navigation.replace('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Logo size={110} />
            </View>
            <Text style={styles.welcomeText}>Rejoignez l'aventure</Text>
            <Text style={styles.subtitle}>
              Créez votre compte pour commencer à collectionner
            </Text>
          </View>

          <View style={styles.form}>
            <TextField
              label="Nom d'utilisateur"
              placeholder="ex: pokly_master"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
            <TextField
              label="Adresse e-mail"
              placeholder="vous@exemple.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TextField
              label="Mot de passe"
              placeholder="Minimum 6 caractères"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {!!error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorMessage}>{error}</Text>
              </View>
            )}

            <PrimaryButton
              title="Créer mon compte"
              onPress={handleSignup}
              loading={loading}
              style={styles.signupButton}
            />
          </View>

          <View style={styles.footer}>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <Text style={styles.footerText}>Déjà membre POKLY ?</Text>
            <Pressable style={styles.loginLink} onPress={() => navigation.goBack()}>
              <Text style={styles.loginLinkText}>Se connecter</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || colors.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    marginBottom: spacing.md,
  },
  welcomeText: {
    ...typography.h1,
    color: colors.text,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.xl,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    color: colors.error || '#DC2626',
    ...typography.small,
    textAlign: 'center',
    fontWeight: '500',
  },
  signupButton: {
    marginTop: spacing.sm,
  },
  footer: {
    alignItems: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border || '#E5E7EB',
  },
  dividerText: {
    ...typography.small,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    fontWeight: '500',
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 15,
    marginBottom: spacing.xs,
  },
  loginLink: {
    paddingVertical: spacing.xs,
  },
  loginLinkText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
});