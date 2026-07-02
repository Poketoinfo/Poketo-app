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
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, shadow, spacing, typography } from '../theme/colors';
import { formatAmount } from '../lib/currency';
import { useCurrency } from '../lib/CurrencyContext';
import { daysUntil } from '../lib/date';
import {
  Transaction,
  computeBalances,
  fetchTransactions,
} from '../lib/transactions';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { currency } = useCurrency();
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
    } catch (e: any) {
      setErrorMsg(e.message ?? "Impossible de charger les opérations.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Recharge la liste à chaque fois qu'on revient sur l'écran
  // (par exemple après avoir ajouté ou modifié une transaction).
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

  const { onMeDoit, jeDois, balanceGlobale } = computeBalances(transactions);

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
      {/* Barre du haut (fixe) */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => navigation.navigate('Settings')}
          style={styles.iconButton}
          hitSlop={10}
        >
          <Ionicons name="settings-outline" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.brand}>POKLY</Text>
        <View style={styles.iconButton} />
      </View>

      {/* Recherche (fixe, la liste scrolle sous elle) */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un nom, une note..."
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

      <ScrollView
        style={styles.scrollFlex}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Balance globale */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>BALANCE GLOBALE</Text>
          <Text
            style={[
              styles.balanceValue,
              { color: balanceGlobale >= 0 ? colors.success : colors.error },
            ]}
          >
            {formatAmount(balanceGlobale, currency)}
          </Text>
        </View>

        {/* Blocs On me doit / Je dois */}
        <View style={styles.row}>
          <View style={[styles.miniCard, { marginRight: spacing.sm }]}>
            <View style={[styles.miniDot, { backgroundColor: colors.success }]} />
            <Text style={styles.miniLabel}>On me doit</Text>
            <Text style={[styles.miniValue, { color: colors.success }]}>
              {formatAmount(onMeDoit, currency)}
            </Text>
          </View>
          <View style={styles.miniCard}>
            <View style={[styles.miniDot, { backgroundColor: colors.error }]} />
            <Text style={styles.miniLabel}>Je dois</Text>
            <Text style={[styles.miniValue, { color: colors.error }]}>
              {formatAmount(-jeDois, currency)}
            </Text>
          </View>
        </View>

        {/* Dernières opérations */}
        <Text style={styles.sectionTitle}>
          {search ? `Résultats (${filtered.length})` : 'Dernières opérations'}
        </Text>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
        ) : errorMsg ? (
          <Text style={styles.error}>{errorMsg}</Text>
        ) : filtered.length === 0 ? (
          <Text style={styles.empty}>
            {search
              ? 'Aucune opération ne correspond à ta recherche.'
              : "Aucune opération pour l'instant. Ajoute ta première avec le bouton +."}
          </Text>
        ) : (
          <View style={styles.list}>
            {filtered.map((t) => {
              const remaining = t.due_date ? daysUntil(t.due_date) : null;
              const isUrgent = remaining !== null && remaining <= 5 && remaining >= 0;
              const isOverdue = remaining !== null && remaining < 0;

              return (
                <Pressable
                  key={t.id}
                  style={styles.operationRow}
                  onPress={() => navigation.navigate('TransactionDetail', { id: t.id })}
                >
                  <View style={styles.operationIcon}>
                    {t.photo_url ? (
                      <Image source={{ uri: t.photo_url }} style={styles.thumb} />
                    ) : (
                      <Ionicons
                        name={t.note ? 'document-text-outline' : 'person-outline'}
                        size={18}
                        color={colors.primary}
                      />
                    )}
                  </View>

                  <View style={styles.operationInfo}>
                    <Text style={styles.operationName}>{t.contact_name}</Text>
                    <Text style={styles.operationType}>
                      {t.type === 'pret' ? 'Prêt' : 'Dette'}
                      {t.note ? ` · ${t.note}` : ''}
                    </Text>
                    {(isUrgent || isOverdue) && (
                      <Text
                        style={[
                          styles.dueBadge,
                          { color: isOverdue ? colors.error : colors.primary },
                        ]}
                      >
                        {isOverdue
                          ? 'Échéance dépassée'
                          : remaining === 0
                          ? "Échéance aujourd'hui"
                          : `Échéance dans ${remaining} j`}
                      </Text>
                    )}
                  </View>

                  <View style={styles.operationRight}>
                    <Text
                      style={[
                        styles.operationAmount,
                        { color: t.type === 'pret' ? colors.success : colors.error },
                      ]}
                    >
                      {formatAmount(t.type === 'pret' ? t.amount : -t.amount, currency)}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bouton central d'ajout */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => navigation.navigate('AddTransaction')}
      >
        <Ionicons name="add" size={28} color={colors.white} />
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
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
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
  scrollFlex: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
  },
  balanceCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadow.soft,
  },
  balanceLabel: {
    ...typography.small,
    color: colors.textSecondary,
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
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
  dueBadge: {
    ...typography.small,
    fontWeight: '700',
    marginTop: 2,
  },
  operationRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  operationAmount: {
    ...typography.body,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.fab,
  },
  fabPressed: {
    backgroundColor: colors.primaryDark,
    transform: [{ scale: 0.96 }],
  },
});
