import React, { useState } from 'react';
import {
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
import { colors, radius, spacing, typography } from '../theme/colors';
import PrimaryButton from '../components/PrimaryButton';
import TextField from '../components/TextField';
import DueDatePicker from '../components/DueDatePicker';
import {
  TransactionType,
  addTransaction,
  uploadReceiptPhoto,
} from '../lib/transactions';
import { supabase } from '../lib/supabase';
import { useCurrency } from '../lib/CurrencyContext';
import { CURRENCIES } from '../lib/currency';
import { scheduleDueDateReminders } from '../lib/notifications';

type Props = NativeStackScreenProps<RootStackParamList, 'AddTransaction'>;

export default function AddTransactionScreen({ navigation }: Props) {
  const { currency } = useCurrency();
  const currencySymbol = CURRENCIES[currency].symbol;
  const [type, setType] = useState<TransactionType>('pret');
  const [amount, setAmount] = useState('');
  const [contactName, setContactName] = useState('');
  const [note, setNote] = useState('');
  const [showNoteField, setShowNoteField] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("L'accès aux photos est nécessaire pour ajouter un justificatif.");
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

  const handleSubmit = async () => {
    setError('');

    const numericAmount = parseFloat(amount.replace(',', '.'));

    if (!contactName.trim()) {
      setError('Merci d\'indiquer un nom.');
      return;
    }
    if (!numericAmount || numericAmount <= 0) {
      setError('Merci d\'indiquer un montant valide.');
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
        contact_name: contactName.trim(),
        note: note.trim() || null,
        photo_url: photoUrl,
        due_date: dueDate,
      });

      // Planifie les rappels (J-5 et jour J) si une échéance est définie.
      // Sans effet sur le web : Expo n'y supporte pas les notifications programmées.
      if (dueDate) {
        await scheduleDueDateReminders({
          contactName: contactName.trim(),
          amount: numericAmount,
          type,
          dueDateISO: dueDate,
        });
      }

      navigation.goBack();
    } catch (e: any) {
      setError(e.message ?? "Une erreur est survenue, réessaie.");
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
        <Text style={styles.topTitle}>Nouvelle opération</Text>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Sélection du type */}
          <Text style={styles.label}>Sélectionner le type</Text>
          <View style={styles.typeRow}>
            <Pressable
              style={[
                styles.typeButton,
                type === 'pret' && styles.typeButtonActive,
              ]}
              onPress={() => setType('pret')}
            >
              <Text
                style={[
                  styles.typeText,
                  type === 'pret' && styles.typeTextActive,
                ]}
              >
                J'ai prêté
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.typeButton,
                type === 'dette' && styles.typeButtonActive,
              ]}
              onPress={() => setType('dette')}
            >
              <Text
                style={[
                  styles.typeText,
                  type === 'dette' && styles.typeTextActive,
                ]}
              >
                J'ai emprunté
              </Text>
            </Pressable>
          </View>

          {/* Montant */}
          <Text style={styles.label}>Montant</Text>
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
            label="À qui ? / De qui ?"
            placeholder="Entrez un nom... (ex: Paul)"
            value={contactName}
            onChangeText={setContactName}
          />

          {/* Date d'échéance */}
          <DueDatePicker
            label="Date d'échéance (optionnel)"
            value={dueDate}
            onChange={setDueDate}
          />
          {!!dueDate && (
            <Text style={styles.hint}>
              Rappel automatique 5 jours avant, et alerte le jour même.
            </Text>
          )}

          {/* Options */}
          <Text style={styles.label}>Options (optionnel)</Text>

          {showNoteField ? (
            <TextField
              label="Note / Explication"
              placeholder="ex : prêté pour le resto"
              value={note}
              onChangeText={setNote}
            />
          ) : (
            <Pressable style={styles.optionRow} onPress={() => setShowNoteField(true)}>
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.optionText}>Ajouter une note / explication</Text>
            </Pressable>
          )}

          <Pressable style={styles.optionRow} onPress={pickPhoto}>
            <Ionicons name="camera-outline" size={20} color={colors.primary} />
            <Text style={styles.optionText}>
              {photoUri ? 'Changer la photo' : 'Prendre / Ajouter une photo'}
            </Text>
          </Pressable>

          {photoUri && (
            <Image source={{ uri: photoUri }} style={styles.preview} />
          )}

          {!!error && <Text style={styles.error}>{error}</Text>}

          <PrimaryButton
            title="Valider l'action"
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
  preview: {
    width: '100%',
    height: 160,
    borderRadius: radius.md,
    marginTop: spacing.sm,
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
