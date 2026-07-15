import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme/colors';
import PrimaryButton from '../components/PrimaryButton';
import TextField from '../components/TextField';
import DueDatePicker from '../components/DueDatePicker';
import PhotoPicker from '../components/PhotoPicker';
import {
  TransactionType,
  addTransaction,
  uploadReceiptPhoto,
} from '../lib/transactions';
import { supabase } from '../lib/supabase';
import { useCurrency } from '../lib/CurrencyContext';
import { CURRENCIES } from '../lib/currency';
import { scheduleDueDateReminders } from '../lib/notifications';
import { useLanguage } from '../lib/i18n/LanguageContext';

type Props = NativeStackScreenProps<RootStackParamList, 'AddTransaction'>;

export default function AddTransactionScreen({ navigation, route }: Props) {
  const { currency } = useCurrency();
  const { t } = useLanguage();
  const currencySymbol = CURRENCIES[currency].symbol;

  // Si l'écran est ouvert depuis l'historique "Prêts" ou "Dettes", le type
  // est imposé et non modifiable.
  const fixedType = route.params?.fixedType;

  const [type, setType] = useState<TransactionType>(fixedType ?? 'pret');
  const [amount, setAmount] = useState('');
  const [contactName, setContactName] = useState('');
  const [note, setNote] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');

    const numericAmount = parseFloat(amount.replace(',', '.'));

    if (!contactName.trim()) {
      setError(t('errorNameRequired'));
      return;
    }
    if (!numericAmount || numericAmount <= 0) {
      setError(t('errorInvalidAmount'));
      return;
    }
    if (!dueDate) {
      setError(t('errorDueDateRequired'));
      return;
    }

    setLoading(true);
    try {
      let photoUrl: string | null = null;

      if (photoUri) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          photoUrl = await uploadReceiptPhoto(photoUri, user.id);
        }
      }

      await addTransaction({
        type,
        amount: numericAmount,
        currency, // devise active au moment de la saisie
        contact_name: contactName.trim(),
        note: note.trim() || null,
        photo_url: photoUrl,
        due_date: dueDate,
      });

      await scheduleDueDateReminders({
        contactName: contactName.trim(),
        amount: numericAmount,
        type,
        dueDateISO: dueDate,
      });

      navigation.goBack();
    } catch (e: any) {
      setError(e.message ?? t('errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="close" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>
          {fixedType === 'pret'
            ? t('iLent')
            : fixedType === 'dette'
            ? t('iBorrowed')
            : t('addTitle')}
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Type - masqué si imposé depuis l'historique */}
          {!fixedType && (
            <>
              <Text style={styles.label}>{t('selectType')}</Text>
              <View style={styles.typeRow}>
                <Pressable
                  style={[
                    styles.typeButton,
                    type === 'pret' && styles.typeButtonActive,
                  ]}
                  onPress={() => setType('pret')}
                >
                  <Ionicons
                    name="arrow-up-circle"
                    size={18}
                    color={type === 'pret' ? colors.success : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.typeText,
                      type === 'pret' && { color: colors.success },
                    ]}
                  >
                    {t('iLent')}
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.typeButton,
                    type === 'dette' && styles.typeButtonActive,
                  ]}
                  onPress={() => setType('dette')}
                >
                  <Ionicons
                    name="arrow-down-circle"
                    size={18}
                    color={type === 'dette' ? colors.error : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.typeText,
                      type === 'dette' && { color: colors.error },
                    ]}
                  >
                    {t('iBorrowed')}
                  </Text>
                </Pressable>
              </View>
            </>
          )}

          {/* Montant */}
          <Text style={styles.label}>{t('amount')}</Text>
          <View style={styles.amountRow}>
            <TextInput
              style={styles.amountInput}
              keyboardType="decimal-pad"
              placeholder="0,00"
              placeholderTextColor={colors.textSecondary}
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
            <Text style={styles.amountSuffix}>{currencySymbol}</Text>
          </View>

          {/* Contact */}
          <TextField
            label={t('contactLabel')}
            placeholder={t('contactPlaceholder')}
            value={contactName}
            onChangeText={setContactName}
          />

          {/* Note - directement sous "À qui ?" */}
          <TextField
            label={t('addNote')}
            placeholder={t('notePlaceholder')}
            value={note}
            onChangeText={setNote}
          />

          {/* Date d'échéance - obligatoire */}
          <DueDatePicker
            label={t('dueDateLabel')}
            value={dueDate}
            onChange={setDueDate}
          />
          {!!dueDate && <Text style={styles.hint}>{t('dueDateHint')}</Text>}

          {/* Photo - sous la date */}
          <Text style={styles.label}>{t('addPhoto')}</Text>
          <PhotoPicker
            photoUri={photoUri}
            onChange={setPhotoUri}
            onError={setError}
          />

          {!!error && <Text style={styles.error}>{error}</Text>}

          <PrimaryButton
            title={t('validate')}
            onPress={handleSubmit}
            loading={loading}
            style={{ marginTop: spacing.lg }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
  scroll: {
    padding: spacing.lg,
  },
  label: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  typeText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    height: 64,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  amountSuffix: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  hint: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  error: {
    ...typography.small,
    color: colors.error,
    marginTop: spacing.md,
  },
});