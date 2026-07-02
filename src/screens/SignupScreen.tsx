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

    // Enregistrement du profil dans la table "profiles" (à créer côté Supabase)
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
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Logo size={90} />
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.subtitle}>Rejoins POKLY en quelques secondes</Text>
          </View>

          <View style={styles.form}>
            <TextField
              label="Nom d'utilisateur"
              placeholder="ex : pokly_user"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
            <TextField
              label="E-mail"
              placeholder="toi@exemple.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TextField
              label="Mot de passe"
              placeholder="6 caractères minimum"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {!!error && <Text style={styles.error}>{error}</Text>}

            <PrimaryButton
              title="S'inscrire"
              onPress={handleSignup}
              loading={loading}
              style={{ marginTop: spacing.sm }}
            />
          </View>

          <Pressable style={styles.footer} onPress={() => navigation.goBack()}>
            <Text style={styles.footerText}>
              Déjà un compte ? <Text style={styles.footerLink}>Se connecter</Text>
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
