import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { colors, radius, shadow, spacing, typography } from '../theme/colors';
import PrimaryButton from '../components/PrimaryButton';
import TextField from '../components/TextField';
import DueDatePicker from '../components/DueDatePicker';
import PhotoPicker from '../components/PhotoPicker';
import { useCurrency } from '../lib/CurrencyContext';
import { CURRENCIES, formatAmount } from '../lib/currency';
import { formatDate } from '../lib/date';
import { useLanguage } from '../lib/i18n/LanguageContext';
import {
  Transaction,
  TransactionType,
  deleteTransaction,
  fetchTransactionById,
  updateTransaction,
  uploadReceiptPhoto,
} from '../lib/transactions';
import { supabase } from '../lib/supabase';
import { scheduleDueDateReminders } from '../lib/notifications';

type Props = NativeStackScreenProps<RootStackParamList, 'TransactionDetail'>;

// Cross-platform confirmation helper
// Uses Alert.alert on mobile and window.confirm on web
function confirmAsync(
  title: string,
  message: string,
  confirmLabel: string,
  cancelLabel: string
): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancelLabel, style: 'cancel', onPress: () => resolve(false) },
      { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

export default function TransactionDetailScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const { currency } = useCurrency();
  const { t } = useLanguage();

  // State Management
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [type, setType] = useState<TransactionType>('pret');
  const [amount, setAmount] = useState('');
  const [contactName, setContactName] = useState('');
  const [note, setNote] = useState('');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Load Transaction Data
  useEffect(() => {
    fetchTransactionById(id)
      .then((tr) => {
        setTransaction(tr);
        setType(tr.type);
        setAmount(String(tr.amount));
        setContactName(tr.contact_name);
        setNote(tr.note ?? '');
        setDueDate(tr.due_date);
        setPhotoUri(tr.photo_url);
      })
      .catch((e) => setError(e.message ?? t('errorGeneric')))
      .finally(() => setLoading(false));
  }, [id]);

  // Save Transaction Handler
  const handleSave = async () => {
    if (!transaction) return;
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

    setSaving(true);
    try {
      let photoUrl = photoUri;

      // Upload photo if it's a new local file
      if (photoUri && !photoUri.startsWith('http')) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          photoUrl = await uploadReceiptPhoto(photoUri, user.id);
        }
      }

      // Update transaction
      await updateTransaction(transaction.id, {
        type,
        amount: numericAmount,
        contact_name: contactName.trim(),
        note: note.trim() || null,
        photo_url: photoUrl,
        due_date: dueDate,
      });

      // Schedule reminders if due date is set
      if (dueDate) {
        await scheduleDueDateReminders({
          contactName: contactName.trim(),
          amount: numericAmount,
          type,
          dueDateISO: dueDate,
        });
      }

      // Update local state
      setTransaction({
        ...transaction,
        type,
        amount: numericAmount,
        contact_name: contactName.trim(),
        note: note.trim() || null,
        photo_url: photoUrl,
        due_date: dueDate,
      });
      setPhotoUri(photoUrl);
      setEditing(false);
    } catch (e: any) {
      setError(e.message ?? t('errorGeneric'));
    } finally {
      setSaving(false);
    }
  };

  // Delete Transaction Handler
  const handleDelete = async () => {
    if (!transaction) return;
    const confirmed = await confirmAsync(
      t('deleteConfirmTitle'),
      t('deleteConfirmMessage'),
      t('deleteConfirmYes'),
      t('deleteConfirmNo')
    );
    if (!confirmed) return;

    setSaving(true);
    try {
      await deleteTransaction(transaction.id);
      navigation.goBack();
    } catch (e: any) {
      setError(e.message ?? t('errorGeneric'));
      setSaving(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
      </SafeAreaView>
    );
  }

  // Error State
  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <Ionicons name="close" size={26} color={colors.text} />
          </Pressable>
          <Text style={styles.topTitle}>{t('detailTitle')}</Text>
          <View style={{ width: 26 }} />
        </View>
        <Text style={styles.error}>{error || t('notFound')}</Text>
      </SafeAreaView>
    );
  }

  // Main Render
  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="close" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>
          {editing ? t('editTitle') : t('detailTitle')}
        </Text>
        <View style={styles.topActions}>
          <Pressable onPress={handleDelete} hitSlop={10}>
            <Ionicons name="trash-outline" size={21} color={colors.error} />
          </Pressable>
          {!editing && (
            <Pressable onPress={() => setEditing(true)} hitSlop={10}>
              <Ionicons name="create-outline" size={22} color={colors.primary} />
            </Pressable>
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {!editing ? (
            // View Mode
            <>
              <View style={styles.summaryCard}>
                <Text
                  style={[
                    styles.summaryAmount,
                    { color: type === 'pret' ? colors.success : colors.error },
                  ]}
                >
                  {formatAmount(type === 'pret' ? transaction.amount : -transaction.amount, currency)}
                </Text>
                <Text style={styles.summaryType}>
                  {type === 'pret' ? t('loan') : t('debt')}
                </Text>
              </View>

              <DetailRow label={t('contactLabel')} value={transaction.contact_name} />
              {!!transaction.note && <DetailRow label={t('addNote')} value={transaction.note} />}
              {!!transaction.due_date && (
                <DetailRow label={t('dueDateLabel')} value={formatDate(transaction.due_date)} />
              )}
              <DetailRow
                label={t('addedOn')}
                value={new Date(transaction.created_at).toLocaleDateString()}
              />

              {transaction.photo_url && (
                <Image source={{ uri: transaction.photo_url }} style={styles.photo} />
              )}
            </>
          ) : (
            // Edit Mode
            <>
              <View style={styles.typeRow}>
                <Pressable
                  style={[styles.typeButton, type === 'pret' && styles.typeButtonActive]}
                  onPress={() => setType('pret')}
                >
                  <Text style={[styles.typeText, type === 'pret' && styles.typeTextActive]}>
                    {t('iLent')}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.typeButton, type === 'dette' && styles.typeButtonActive]}
                  onPress={() => setType('dette')}
                >
                  <Text style={[styles.typeText, type === 'dette' && styles.typeTextActive]}>
                    {t('iBorrowed')}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.amountRow}>
                <TextInput
                  style={styles.amountInput}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
                <Text style={styles.amountSuffix}>{CURRENCIES[currency].symbol}</Text>
              </View>

              <TextField label={t('contactLabel')} value={contactName} onChangeText={setContactName} />
              <TextField label={t('addNote')} value={note} onChangeText={setNote} />
              <DueDatePicker label={t('dueDateLabel')} value={dueDate} onChange={setDueDate} />

              <PhotoPicker
                photoUri={photoUri}
                onChange={setPhotoUri}
                onError={setError}
              />

              {!!error && <Text style={styles.error}>{error}</Text>}

              <PrimaryButton
                title={t('save')}
                onPress={handleSave}
                loading={saving}
                style={{ marginTop: spacing.lg }}
              />
              <PrimaryButton
                title={t('cancel')}
                onPress={() => setEditing(false)}
                variant="outline"
                style={{ marginTop: spacing.sm }}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Helper Component
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
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
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  topTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
  },
  scroll: {
    padding: spacing.lg,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
    ...shadow.soft,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '800',
  },
  summaryType: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  photo: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
    marginTop: spacing.lg,
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  typeButton: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
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
  typeTextActive: {
    color: colors.primary,
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
  error: {
    ...typography.small,
    color: colors.error,
    marginTop: spacing.md,
  },
});