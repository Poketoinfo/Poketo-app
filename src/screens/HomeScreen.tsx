import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
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
import { daysUntil } from '../lib/date';
import Logo from '../components/Logo';
import {
  Transaction,
  fetchTransactions,
  checkOverdueTransactions,
} from '../lib/transactions';
import { notifyOverdue } from '../lib/notifications';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const STATUS_COLORS: Record<string, string> = {
  en_cours: colors.primary,
  en_attente_validation: '#E08E0B',
  paye: colors.success,
};

export default function HomeScreen({ navigation }: Props) {
  const { currency, convert } = useCurrency();
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await fetchTransactions();
      setTransactions(data);
      setErrorMsg('');

      // Vérifie les échéances dépassées et passe leur statut en "en attente"
      const newlyOverdue = await checkOverdueTransactions(data);
      if (newlyOverdue.length > 0) {
        setTransactions((prev) =>
          prev.map((tr) => newlyOverdue.find((o) => o.id === tr.id) ?? tr)
        );
        newlyOverdue.forEach((tr) => notifyOverdue(tr.contact_name, t));
      }
    } catch (e: any) {
      setErrorMsg(e.message ?? t('errorGeneric'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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

  // Soldes convertis dans la devise active à partir de la devise d'origine
  // de chaque transaction (chaque transaction garde sa devise de saisie).
  const { onMeDoit, jeDois, balanceGlobale } = useMemo(() => {
    const onMeDoitSum = transactions
      .filter((t) => t.type === 'pret')
      .reduce((sum, t) => sum + convert(t.amount, t.currency), 0);

    const jeDoisSum = transactions
      .filter((t) => t.type === 'dette')
      .reduce((sum, t) => sum + convert(t.amount, t.currency), 0);

    return {
      onMeDoit: onMeDoitSum,
      jeDois: jeDoisSum,
      balanceGlobale: onMeDoitSum - jeDoisSum,
    };
  }, [transactions, currency]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter(
      (t) =>
        t.contact_name.toLowerCase().includes(q) ||
        (t.note ?? '').toLowerCase().includes(q)
    );
  }, [transactions, search]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navigation Bar - Fixed */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <Logo size={28} />
          <Text style={styles.brand}>{t('appName')}</Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate('Settings')}
          style={styles.iconButton}
          hitSlop={10}
        >
          <Ionicons name="settings-outline" size={22} color={colors.text} />
        </Pressable>
      </View>

      {/* Search Bar - Fixed */}
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

      {/* Fixed Content (Balance & Summary Cards) */}
      <View style={styles.fixedContent}>
        {/* Balance Card */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLabel}>{t('balanceGlobal').toUpperCase()}</Text>
          <Text style={styles.balanceValue}>
            {formatAmount(balanceGlobale, currency)}
          </Text>
        </LinearGradient>

        {/* Summary Cards - cliquables vers l'historique */}
        <View style={styles.row}>
          <Pressable
            style={[styles.miniCard, { marginRight: spacing.sm }]}
            onPress={() => navigation.navigate('TransactionHistory', { type: 'pret' })}
          >
            <View style={[styles.miniDot, { backgroundColor: colors.success }]} />
            <Text style={styles.miniLabel}>{t('onMeDoit')}</Text>
            <Text style={[styles.miniValue, { color: colors.success }]}>
              {formatAmount(onMeDoit, currency)}
            </Text>
          </Pressable>
          <Pressable
            style={styles.miniCard}
            onPress={() => navigation.navigate('TransactionHistory', { type: 'dette' })}
          >
            <View style={[styles.miniDot, { backgroundColor: colors.error }]} />
            <Text style={styles.miniLabel}>{t('jeDois')}</Text>
            <Text style={[styles.miniValue, { color: colors.error }]}>
              {formatAmount(-jeDois, currency)}
            </Text>
          </Pressable>
        </View>

        {/* Transactions List Header */}
        <Text style={styles.sectionTitle}>
          {search ? `${t('results')} (${filtered.length})` : t('recentOps')}
        </Text>
      </View>

      {/* Scrollable Transactions List */}
      <ScrollView
        style={styles.scrollFlex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
        ) : errorMsg ? (
          <Text style={styles.error}>{errorMsg}</Text>
        ) : filtered.length === 0 ? (
          <Text style={styles.empty}>
            {search ? t('noResults') : t('noOpsYet')}
          </Text>
        ) : (
          <View style={styles.list}>
            {filtered.map((t2) => {
              const remaining = t2.due_date ? daysUntil(t2.due_date) : null;
              const isUrgent = remaining !== null && remaining <= 5 && remaining >= 0;
              const isOverdue = remaining !== null && remaining < 0;
              const accent = t2.type === 'pret' ? colors.success : colors.error;

              return (
                <Pressable
                  key={t2.id}
                  style={[styles.operationRow, { borderLeftColor: accent }]}
                  onPress={() => navigation.navigate('TransactionDetail', { id: t2.id })}
                >
                  <View style={styles.operationIcon}>
                    {t2.photo_url ? (
                      <Image source={{ uri: t2.photo_url }} style={styles.thumb} />
                    ) : (
                      <Ionicons
                        name={t2.note ? 'document-text-outline' : 'person-outline'}
                        size={18}
                        color={colors.primary}
                      />
                    )}
                  </View>

                  <View style={styles.operationInfo}>
                    <Text style={styles.operationName}>{t2.contact_name}</Text>
                    <Text style={styles.operationType}>
                      {t2.type === 'pret' ? t('loan') : t('debt')}
                      {t2.note ? ` · ${t2.note}` : ''}
                    </Text>
                    <View style={styles.badgeRow}>
                      {(isUrgent || isOverdue) && t2.status === 'en_cours' && (
                        <Text
                          style={[
                            styles.dueBadge,
                            { color: isOverdue ? colors.error : colors.primary },
                          ]}
                        >
                          {isOverdue
                            ? t('overdue')
                            : remaining === 0
                            ? t('dueToday')
                            : t('dueInDays', { n: remaining })}
                        </Text>
                      )}
                      <Text style={[styles.statusBadge, { color: STATUS_COLORS[t2.status] }]}>
                        {t2.status === 'en_cours'
                          ? t('statusEnCours')
                          : t2.status === 'en_attente_validation'
                          ? t('statusEnAttenteValidation')
                          : t('statusPaye')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.operationRight}>
                    <Text style={[styles.operationAmount, { color: accent }]}>
                      {formatAmount(
                        convert(
                          t2.type === 'pret' ? t2.amount : -t2.amount,
                          t2.currency
                        ),
                        currency
                      )}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Bottom spacing for FAB */}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Floating Action Button - Fixed */}
      <Pressable
        style={({ pressed }) => [styles.fabWrapper, pressed && styles.fabPressed]}
        onPress={() => navigation.navigate('AddTransaction')}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Ionicons name="add" size={26} color={colors.white} />
          <Text style={styles.fabText}>{t('addButton')}</Text>
        </LinearGradient>
      </Pressable>
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
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  brand: {
    ...typography.h2,
    color: colors.primary,
    letterSpacing: 2,
    fontWeight: '800',
  },
  searchWrapper: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
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
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  fixedContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  balanceCard: {
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadow.fab,
  },
  balanceLabel: {
    ...typography.small,
    color: colors.white,
    opacity: 0.85,
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: colors.white,
  },
  row: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  miniCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    ...shadow.soft,
  },
  miniDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    marginBottom: spacing.xs,
  },
  miniLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  miniValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  scrollFlex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  empty: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  error: {
    ...typography.body,
    color: colors.error,
    marginTop: spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
  operationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    ...shadow.soft,
  },
  operationIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  thumb: {
    width: 42,
    height: 42,
  },
  operationInfo: {
    flex: 1,
  },
  operationName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  operationType: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  dueBadge: {
    ...typography.small,
    fontWeight: '700',
  },
  statusBadge: {
    ...typography.small,
    fontWeight: '700',
  },
  operationRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  operationAmount: {
    ...typography.body,
    fontWeight: '700',
  },
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