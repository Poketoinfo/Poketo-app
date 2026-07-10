// SettingsScreen.tsx
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';
import { colors, radius, shadow, spacing, typography } from '../theme/colors';
import PrimaryButton from '../components/PrimaryButton';
import { useCurrency } from '../lib/CurrencyContext';
import { CURRENCIES, CurrencyCode } from '../lib/currency';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { LANGUAGE_LABELS, LanguageCode } from '../lib/i18n/translations';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const CURRENCY_OPTIONS: CurrencyCode[] = ['EUR', 'USD', 'MGA'];
const LANGUAGE_OPTIONS: LanguageCode[] = ['fr', 'en', 'mg', 'es', 'de'];

const LANGUAGE_FLAGS: Record<LanguageCode, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
  mg: '🇲🇬',
  es: '🇪🇸',
  de: '🇩🇪',
};

type Section = 'language' | 'currency' | null;

export default function SettingsScreen({ navigation }: Props) {
  const { currency, setCurrency } = useCurrency();
  const { language, isAutomatic, setLanguage, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [openSection, setOpenSection] = useState<Section>(null);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const toggleSection = (section: Section) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const currentLanguageLabel = isAutomatic
    ? t('systemLanguage')
    : LANGUAGE_LABELS[language];

  const currentLanguageFlag = isAutomatic ? '📱' : LANGUAGE_FLAGS[language];

  const currentCurrencyLabel = CURRENCIES[currency].label;
  const currentCurrencyFlag = CURRENCIES[currency].symbol;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>{t('settingsTitle')}</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile link */}
        <Pressable style={styles.profileCard} onPress={() => navigation.navigate('Profile')}>
          <View style={styles.rowLeft}>
            <Ionicons name="person-circle-outline" size={22} color={colors.primary} />
            <Text style={styles.rowLabel}>{t('profileMenuItem')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </Pressable>

        {/* Language Dropdown */}
        <Text style={styles.sectionLabel}>{t('languageLabel')}</Text>
        <View style={styles.card}>
          <Pressable
            style={styles.dropdownHeader}
            onPress={() => toggleSection('language')}
          >
            <View style={styles.rowLeft}>
              <Text style={styles.rowFlag}>{currentLanguageFlag}</Text>
              <Text style={styles.rowLabel}>{currentLanguageLabel}</Text>
            </View>
            <Ionicons
              name={openSection === 'language' ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textSecondary}
            />
          </Pressable>

          {openSection === 'language' && (
            <View style={styles.dropdownList}>
              <Pressable
                style={[styles.row, isAutomatic && styles.rowActive]}
                onPress={() => {
                  setLanguage(null);
                  setOpenSection(null);
                }}
              >
                <View style={styles.rowLeft}>
                  <Ionicons name="phone-portrait-outline" size={18} color={colors.textSecondary} />
                  <Text style={[styles.rowLabel, isAutomatic && styles.rowLabelActive]}>
                    {t('systemLanguage')}
                  </Text>
                </View>
                {isAutomatic && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                )}
              </Pressable>

              {LANGUAGE_OPTIONS.map((code, index) => {
                const active = !isAutomatic && language === code;
                const isLast = index === LANGUAGE_OPTIONS.length - 1;
                return (
                  <Pressable
                    key={code}
                    style={[
                      styles.row,
                      active && styles.rowActive,
                      isLast && { borderBottomWidth: 0 },
                    ]}
                    onPress={() => {
                      setLanguage(code);
                      setOpenSection(null);
                    }}
                  >
                    <View style={styles.rowLeft}>
                      <Text style={styles.rowFlag}>{LANGUAGE_FLAGS[code]}</Text>
                      <Text style={[styles.rowLabel, active && styles.rowLabelActive]}>
                        {LANGUAGE_LABELS[code]}
                      </Text>
                    </View>
                    {active && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Currency Dropdown */}
        <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>{t('currencyLabel')}</Text>
        <View style={styles.card}>
          <Pressable
            style={styles.dropdownHeader}
            onPress={() => toggleSection('currency')}
          >
            <View style={styles.rowLeft}>
              <Text style={styles.rowFlag}>{currentCurrencyFlag}</Text>
              <Text style={styles.rowLabel}>{currentCurrencyLabel}</Text>
            </View>
            <Ionicons
              name={openSection === 'currency' ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textSecondary}
            />
          </Pressable>

          {openSection === 'currency' && (
            <View style={styles.dropdownList}>
              {CURRENCY_OPTIONS.map((code, index) => {
                const config = CURRENCIES[code];
                const active = currency === code;
                const isLast = index === CURRENCY_OPTIONS.length - 1;
                return (
                  <Pressable
                    key={code}
                    style={[
                      styles.row,
                      active && styles.rowActive,
                      isLast && { borderBottomWidth: 0 },
                    ]}
                    onPress={() => {
                      setCurrency(code);
                      setOpenSection(null);
                    }}
                  >
                    <View style={styles.rowLeft}>
                      <Text style={styles.rowFlag}>{config.symbol}</Text>
                      <Text style={[styles.rowLabel, active && styles.rowLabelActive]}>
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
          )}
        </View>

        {/* Logout Button */}
        <PrimaryButton
          title={t('logout')}
          onPress={handleLogout}
          loading={loading}
          variant="outline"
          style={{ marginTop: spacing.xl }}
        />

        <View style={{ height: spacing.xl }} />
      </ScrollView>
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
    flexGrow: 1,
  },
  sectionLabel: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadow.soft,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  dropdownList: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowActive: {
    backgroundColor: colors.primaryLight,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowFlag: {
    width: 28,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  rowLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  rowLabelActive: {
    color: colors.primary,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadow.soft,
  },
});