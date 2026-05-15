import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trial, getTrials, getSettings } from '../../src/utils/storage';
import { colors, spacing, getCurrencySymbol } from '../../src/utils/theme';

export default function History() {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [totalSaved, setTotalSaved] = useState(0);
  const [currency, setCurrency] = useState('GBP');

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [t, s] = await Promise.all([getTrials(), getSettings()]);
        setTrials(t.filter((tr) => tr.status === 'cancelled'));
        setTotalSaved(s.totalSaved);
        setCurrency(s.currency);
      })();
    }, [])
  );

  const sym = getCurrencySymbol(currency);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>History</Text>

      <View style={styles.savedCard}>
        <Text style={styles.savedLabel}>Total saved</Text>
        <Text style={styles.savedAmount}>{sym}{totalSaved.toFixed(2)}</Text>
        <Text style={styles.savedSub}>{trials.length} trial{trials.length !== 1 ? 's' : ''} cancelled on time</Text>
      </View>

      {trials.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No cancelled trials yet</Text>
          <Text style={styles.emptySubtext}>
            When you cancel a trial, it'll appear here with your savings
          </Text>
        </View>
      ) : (
        <FlatList
          data={trials}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardLeft}>
                <Text style={styles.cardIcon}>{item.serviceIcon || '📱'}</Text>
                <View>
                  <Text style={styles.cardName}>{item.serviceName}</Text>
                  <Text style={styles.cardDate}>
                    Cancelled {new Date(item.trialEndDate).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardSaved}>
                {sym}{item.chargeAmount.toFixed(2)} saved
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  savedCard: {
    margin: spacing.lg,
    backgroundColor: colors.accentDark + '20',
    borderRadius: 20,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent + '40',
  },
  savedLabel: { fontSize: 14, color: colors.accent },
  savedAmount: { fontSize: 48, fontWeight: '800', color: colors.accent, marginVertical: spacing.xs },
  savedSub: { fontSize: 14, color: colors.textSecondary },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: { fontSize: 28 },
  cardName: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardDate: { fontSize: 13, color: colors.textSecondary },
  cardSaved: { fontSize: 15, fontWeight: '700', color: colors.accent },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  emptySubtext: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
});
