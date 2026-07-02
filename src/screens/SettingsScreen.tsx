import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';
import { colors, radius, shadow, spacing, typography } from '../theme/colors';
import PrimaryButton from '../components/PrimaryButton';
import { useCurrency } from '../lib/CurrencyContext';
import { CURRENCIES, CurrencyCode } from '../lib/currency';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const CURRENCY_OPTIONS: CurrencyCode[] = ['EUR', 'USD', 'MGA'];

export default function SettingsScreen({ navigation }: Props) {
  const { currency, setCurrency } = useCurrency();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>Réglages</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionLabel}>Devise</Text>
        <View style={styles.currencyCard}>
          {CURRENCY_OPTIONS.map((code, index) => {
            const config = CURRENCIES[code];
            const active = currency === code;
            const isLast = index === CURRENCY_OPTIONS.length - 1;
            return (
              <Pressable
                key={code}
                style={[
                  styles.currencyRow,
                  active && styles.currencyRowActive,
                  isLast && { borderBottomWidth: 0 },
                ]}
                onPress={() => setCurrency(code)}
              >
                <View style={styles.currencyLeft}>
                  <Text style={styles.currencySymbol}>{config.symbol}</Text>
                  <Text style={[styles.currencyLabel, active && styles.currencyLabelActive]}>
                    {config.label}
                  </Text>
                </View>
                {active && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                )}
              </Pressable>
            );
          })}
        </View>

        <PrimaryButton
          title="Se déconnecter"
          onPress={handleLogout}
          loading={loading}
          variant="outline"
          style={{ marginTop: spacing.xl }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    padding: spacing.lg,
  },
  sectionLabel: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  currencyCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadow.soft,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  currencyRowActive: {
    backgroundColor: colors.primaryLight,
  },
  currencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  currencySymbol: {
    width: 28,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  currencyLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  currencyLabelActive: {
    color: colors.primary,
  },
});
