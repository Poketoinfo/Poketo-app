import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme/colors';
import { formatAmount } from '../lib/format';
import {
  Transaction,
  computeBalances,
  fetchTransactions,
} from '../lib/transactions';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

  return (
    <SafeAreaView style={styles.container}>
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

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>BALANCE GLOBALE</Text>
          <Text
            style={[
              styles.balanceValue,
              { color: balanceGlobale >= 0 ? colors.success : colors.error },
            ]}
          >
            {formatAmount(balanceGlobale)}
          </Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.miniCard, { marginRight: spacing.sm }]}>
            <Text style={styles.miniLabel}>On me doit</Text>
            <Text style={[styles.miniValue, { color: colors.success }]}>
              {formatAmount(onMeDoit)}
            </Text>
          </View>
          <View style={styles.miniCard}>
            <Text style={styles.miniLabel}>Je dois</Text>
            <Text style={[styles.miniValue, { color: colors.error }]}>
              {formatAmount(-jeDois)}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Dernières opérations</Text>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
        ) : errorMsg ? (
          <Text style={styles.error}>{errorMsg}</Text>
        ) : transactions.length === 0 ? (
          <Text style={styles.empty}>
            Aucune opération pour l'instant. Ajoute ta première avec le bouton +.
          </Text>
        ) : (
          <View style={styles.list}>
            {transactions.map((t) => (
              <View key={t.id} style={styles.operationRow}>
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
                </View>

                <Text
                  style={[
                    styles.operationAmount,
                    { color: t.type === 'pret' ? colors.success : colors.error },
                  ]}
                >
                  {formatAmount(t.type === 'pret' ? t.amount : -t.amount)}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate('AddTransaction')}
      >
        <Ionicons name="add" size={30} color={colors.white} />
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
    paddingBottom: spacing.md,
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
    letterSpacing: 1,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
  },
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  balanceLabel: {
    ...typography.small,
    color: colors.white,
    opacity: 0.8,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  balanceValue: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.white,
  },
  row: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  miniCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  miniLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
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
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  operationIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  thumb: {
    width: 40,
    height: 40,
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
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});