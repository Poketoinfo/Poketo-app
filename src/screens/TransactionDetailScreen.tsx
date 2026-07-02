import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, shadow, spacing, typography } from '../theme/colors';
import PrimaryButton from '../components/PrimaryButton';
import TextField from '../components/TextField';
import DueDatePicker from '../components/DueDatePicker';
import { useCurrency } from '../lib/CurrencyContext';
import { CURRENCIES, formatAmount } from '../lib/currency';
import { formatDate } from '../lib/date';
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

export default function TransactionDetailScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const { currency } = useCurrency();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Champs éditables
  const [type, setType] = useState<TransactionType>('pret');
  const [amount, setAmount] = useState('');
  const [contactName, setContactName] = useState('');
  const [note, setNote] = useState('');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactionById(id)
      .then((t) => {
        setTransaction(t);
        setType(t.type);
        setAmount(String(t.amount));
        setContactName(t.contact_name);
        setNote(t.note ?? '');
        setDueDate(t.due_date);
        setPhotoUri(t.photo_url);
      })
      .catch((e) => setError(e.message ?? 'Impossible de charger cette opération.'))
      .finally(() => setLoading(false));
  }, [id]);

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("L'accès aux photos est nécessaire.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!transaction) return;
    setError('');

    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (!contactName.trim()) {
      setError("Merci d'indiquer un nom.");
      return;
    }
    if (!numericAmount || numericAmount <= 0) {
      setError('Merci d\'indiquer un montant valide.');
      return;
    }

    setSaving(true);
    try {
      let photoUrl = photoUri;

      // Nouvelle photo locale (pas encore uploadée = uri qui ne vient pas de Supabase)
      if (photoUri && !photoUri.startsWith('http')) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          photoUrl = await uploadReceiptPhoto(photoUri, user.id);
        }
      }

      await updateTransaction(transaction.id, {
        type,
        amount: numericAmount,
        contact_name: contactName.trim(),
        note: note.trim() || null,
        photo_url: photoUrl,
        due_date: dueDate,
      });

      if (dueDate) {
        await scheduleDueDateReminders({
          contactName: contactName.trim(),
          amount: numericAmount,
          type,
          dueDateISO: dueDate,
        });
      }

      setTransaction({
        ...transaction,
        type,
        amount: numericAmount,
        contact_name: contactName.trim(),
        note: note.trim() || null,
        photo_url: photoUrl,
        due_date: dueDate,
      });
      setEditing(false);
    } catch (e: any) {
      setError(e.message ?? 'Impossible d\'enregistrer les modifications.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!transaction) return;
    setSaving(true);
    try {
      await deleteTransaction(transaction.id);
      navigation.goBack();
    } catch (e: any) {
      setError(e.message ?? 'Impossible de supprimer cette opération.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
      </SafeAreaView>
    );
  }

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <Ionicons name="close" size={26} color={colors.text} />
          </Pressable>
          <Text style={styles.topTitle}>Opération</Text>
          <View style={{ width: 26 }} />
        </View>
        <Text style={styles.error}>{error || 'Opération introuvable.'}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="close" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>
          {editing ? 'Modifier' : 'Détail de l\'opération'}
        </Text>
        {editing ? (
          <Pressable onPress={handleDelete} hitSlop={10}>
            <Ionicons name="trash-outline" size={22} color={colors.error} />
          </Pressable>
        ) : (
          <Pressable onPress={() => setEditing(true)} hitSlop={10}>
            <Ionicons name="create-outline" size={22} color={colors.primary} />
          </Pressable>
        )}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {!editing ? (
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
                  {type === 'pret' ? 'Prêt' : 'Dette'}
                </Text>
              </View>

              <DetailRow label="Contact" value={transaction.contact_name} />
              {!!transaction.note && <DetailRow label="Note" value={transaction.note} />}
              {!!transaction.due_date && (
                <DetailRow label="Échéance" value={formatDate(transaction.due_date)} />
              )}
              <DetailRow
                label="Ajouté le"
                value={new Date(transaction.created_at).toLocaleDateString('fr-FR')}
              />

              {transaction.photo_url && (
                <Image source={{ uri: transaction.photo_url }} style={styles.photo} />
              )}
            </>
          ) : (
            <>
              <View style={styles.typeRow}>
                <Pressable
                  style={[styles.typeButton, type === 'pret' && styles.typeButtonActive]}
                  onPress={() => setType('pret')}
                >
                  <Text style={[styles.typeText, type === 'pret' && styles.typeTextActive]}>
                    J'ai prêté
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.typeButton, type === 'dette' && styles.typeButtonActive]}
                  onPress={() => setType('dette')}
                >
                  <Text style={[styles.typeText, type === 'dette' && styles.typeTextActive]}>
                    J'ai emprunté
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

              <TextField label="Contact" value={contactName} onChangeText={setContactName} />
              <TextField label="Note" value={note} onChangeText={setNote} />
              <DueDatePicker label="Date d'échéance" value={dueDate} onChange={setDueDate} />

              <Pressable style={styles.optionRow} onPress={pickPhoto}>
                <Ionicons name="camera-outline" size={20} color={colors.primary} />
                <Text style={styles.optionText}>
                  {photoUri ? 'Changer la photo' : 'Ajouter une photo'}
                </Text>
              </Pressable>
              {photoUri && <Image source={{ uri: photoUri }} style={styles.photo} />}

              {!!error && <Text style={styles.error}>{error}</Text>}

              <PrimaryButton
                title="Enregistrer"
                onPress={handleSave}
                loading={saving}
                style={{ marginTop: spacing.lg }}
              />
              <PrimaryButton
                title="Annuler"
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
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  optionText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  error: {
    ...typography.small,
    color: colors.error,
    marginTop: spacing.md,
  },
});
