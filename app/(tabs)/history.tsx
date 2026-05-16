import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trial, getTrials, getSettings } from '../../src/utils/storage';
import { colors, spacing, getCurrencySymbol } from '../../src/utils/theme';

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function HistoryScreen() {
  const [cancelled, setCancelled] = useState<Trial[]>([]);
  const [currency, setCurrency] = useState('GBP');

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [trials, settings] = await Promise.all([getTrials(), getSettings()]);
        const list = trials
          .filter((t) => t.status === 'cancelled')
          .sort((a, b) => new Date(b.trialEndDate).getTime() - new Date(a.trialEndDate).getTime());
        setCancelled(list);
        setCurrency(settings.currency);
      })();
    }, [])
  );

  const sym = getCurrencySymbol(currency);
  const totalSaved = cancelled.reduce((sum, t) => sum + t.chargeAmount, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.pageTitle}>History</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Saved</Text>
        <Text style={styles.summaryAmount}>{sym}{totalSaved.toFixed(2)}</Text>
        <Text style={styles.summaryCount}>
          {cancelled.length} subscription{cancelled.length !== 1 ? 's' : ''} cancelled
        </Text>
      </View>

      <FlatList
        data={cancelled}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.serviceName}>{item.serviceName}</Text>
              <Text style={styles.dateText}>{formatDate(item.trialEndDate)}</Text>
            </View>
            <Text style={styles.savedAmount}>{sym}{item.chargeAmount.toFixed(2)}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No cancelled subscriptions yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.white,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  dateText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  savedAmount: {
    fontSize: 17,
    fontWeight: '700',
    color: '#10B981',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
