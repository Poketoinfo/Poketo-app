import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, shadow, spacing, typography } from '../theme/colors';
import { formatAmount } from '../lib/currency';
import { useCurrency } from '../lib/CurrencyContext';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { daysUntil, formatDate } from '../lib/date';
import { Transaction, TransactionStatus, fetchTransactionsByType } from '../lib/transactions';

type Props = NativeStackScreenProps<RootStackParamList, 'TransactionHistory'>;

const STATUS_COLORS: Record<TransactionStatus, string> = {
  en_cours: colors.primary,
  en_attente_validation: '#E08E0B',
  paye: colors.success,
};

type StatusFilter = 'all' | TransactionStatus;

export default function TransactionHistoryScreen({ navigation, route }: Props) {
  const { type } = route.params;
  const { currency, convert } = useCurrency();
  const { t } = useLanguage();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const load = useCallback(async () => {
    try {
      const data = await fetchTransactionsByType(type);
      setTransactions(data);
      setErrorMsg('');
    } catch (e: any) {
      setErrorMsg(e.message ?? t('errorGeneric'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [type]);

  // Se relance à chaque retour sur l'écran, donc après l'ajout d'une
  // transaction depuis le FAB ci-dessous, la liste est automatiquement à jour.
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const total = useMemo(() => {
    return transactions.reduce((sum, tr) => sum + convert(tr.amount, tr.currency), 0);
  }, [transactions, currency]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((tr) => {
      const matchesSearch =
        !q ||
        tr.contact_name.toLowerCase().includes(q) ||
        (tr.note ?? '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || tr.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [transactions, search, statusFilter]);

  const accent = type === 'pret' ? colors.success : colors.error;
  const statusFilters: StatusFilter[] = ['all', 'en_cours', 'en_attente_validation', 'paye'];

  const statusLabel = (status: StatusFilter) => {
    switch (status) {
      case 'all':
        return t('results');
      case 'en_cours':
        return t('statusEnCours');
      case 'en_attente_validation':
        return t('statusEnAttenteValidation');
      case 'paye':
        return t('statusPaye');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>
          {type === 'pret' ? t('historyLoans') : t('historyDebts')}
        </Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Total Card */}
      <View style={styles.totalWrapper}>
        <View style={[styles.totalCard, { borderColor: accent }]}>
          <Text style={styles.totalLabel}>{t('balanceGlobal')}</Text>
          <Text style={[styles.totalValue, { color: accent }]}>
            {formatAmount(total, currency)}
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Status filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        style={styles.chipsScroll}
      >
        {statusFilters.map((sf) => {
          const active = statusFilter === sf;
          return (
            <Pressable
              key={sf}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setStatusFilter(sf)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {statusLabel(sf)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* List */}
      <ScrollView
        style={styles.scrollFlex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<Pressable onPress={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
        ) : errorMsg ? (
          <Text style={styles.error}>{errorMsg}</Text>
        ) : filtered.length === 0 ? (
          <Text style={styles.empty}>{search ? t('noResults') : t('noOpsYet')}</Text>
        ) : (
          <View style={styles.list}>
            {filtered.map((tr) => {
              const remaining = tr.due_date ? daysUntil(tr.due_date) : null;
              const isOverdue = remaining !== null && remaining < 0 && tr.status === 'en_cours';

              return (
                <Pressable
                  key={tr.id}
                  style={[styles.row, { borderLeftColor: accent }]}
                  onPress={() => navigation.navigate('TransactionDetail', { id: tr.id })}
                >
                  <View style={styles.icon}>
                    {tr.photo_url ? (
                      <Image source={{ uri: tr.photo_url }} style={styles.thumb} />
                    ) : (
                      <Ionicons name="person-outline" size={18} color={colors.primary} />
                    )}
                  </View>

                  <View style={styles.info}>
                    <Text style={styles.name}>{tr.contact_name}</Text>
                    {!!tr.note && <Text style={styles.note}>{tr.note}</Text>}
                    {!!tr.due_date && (
                      <Text style={[styles.dueDate, isOverdue && { color: colors.error }]}>
                        {formatDate(tr.due_date)}
                      </Text>
                    )}
                    <Text style={[styles.status, { color: STATUS_COLORS[tr.status] }]}>
                      {tr.status === 'en_cours'
                        ? t('statusEnCours')
                        : tr.status === 'en_attente_validation'
                        ? t('statusEnAttenteValidation')
                        : t('statusPaye')}
                    </Text>
                  </View>

                  <View style={styles.amountCol}>
                    <Text style={[styles.amount, { color: accent }]}>
                      {formatAmount(convert(tr.amount, tr.currency), currency)}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
        {/* Espace réservé pour ne pas être masqué par le FAB */}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Floating Action Button - ajoute directement un Prêt ou une Dette,
          selon le type de l'historique affiché, avec le même formulaire
          que celui de HomeScreen (fixedType masque le sélecteur de type). */}
      <Pressable
        style={({ pressed }) => [styles.fabWrapper, pressed && styles.fabPressed]}
        onPress={() => navigation.navigate('AddTransaction', { fixedType: type })}
      >
        <LinearGradient
          colors={type === 'pret' ? [colors.success, colors.success] : [colors.error, colors.error]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Ionicons name="add" size={26} color={colors.white} />
          <Text style={styles.fabText}>
            {type === 'pret' ? t('iLent') : t('iBorrowed')}
          </Text>
        </LinearGradient>
      </Pressable>
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
  totalWrapper: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  totalCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1.5,
    padding: spacing.md,
    alignItems: 'center',
    ...shadow.soft,
  },
  totalLabel: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  totalValue: { fontSize: 26, fontWeight: '800', marginTop: spacing.xs },
  searchWrapper: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.text },
  chipsScroll: { marginTop: spacing.md, flexGrow: 0 },
  chipsRow: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.small, color: colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: colors.white },
  scrollFlex: { flex: 1, marginTop: spacing.md },
  scrollContent: { paddingHorizontal: spacing.lg },
  empty: { ...typography.body, color: colors.textSecondary, marginTop: spacing.lg },
  error: { ...typography.body, color: colors.error, marginTop: spacing.lg },
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    padding: spacing.sm,
    ...shadow.soft,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  thumb: { width: 42, height: 42 },
  info: { flex: 1 },
  name: { ...typography.body, fontWeight: '600', color: colors.text },
  note: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  dueDate: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  status: { ...typography.small, fontWeight: '700', marginTop: 2 },
  amountCol: { alignItems: 'flex-end', gap: 2 },
  amount: { ...typography.body, fontWeight: '700' },
  fabWrapper: {
    position: 'absolute',
    bottom: spacing.xl,
    alignSelf: 'center',
    borderRadius: radius.full,
    ...shadow.fab,
  },
  fabPressed: {
    transform: [{ scale: 0.96 }],
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 64,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
  },
  fabText: {
    ...typography.button,
    fontSize: 17,
    color: colors.white,
    fontWeight: '700',
  },
});