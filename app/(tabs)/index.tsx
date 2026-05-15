import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trial, getTrials, getSettings } from '../../src/utils/storage';
import { colors, spacing, getUrgencyColor, getCurrencySymbol } from '../../src/utils/theme';

function getDaysLeft(endDate: string): number {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, diff / (1000 * 60 * 60 * 24));
}

function formatCountdown(endDate: string): string {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m`;
}

function TrialCard({ trial, currency }: { trial: Trial; currency: string }) {
  const daysLeft = getDaysLeft(trial.trialEndDate);
  const urgencyColor = getUrgencyColor(daysLeft);
  const sym = getCurrencySymbol(currency);

  return (
    <Pressable
      style={[styles.card, { borderLeftColor: urgencyColor, borderLeftWidth: 4 }]}
      onPress={() => router.push(`/trial/${trial.id}`)}
    >
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <Text style={styles.cardIcon}>{trial.serviceIcon || '📱'}</Text>
          <View>
            <Text style={styles.cardName}>{trial.serviceName}</Text>
            <Text style={styles.cardCharge}>{sym}{trial.chargeAmount.toFixed(2)}/month</Text>
          </View>
        </View>
        <View style={[styles.badge, { backgroundColor: urgencyColor + '20' }]}>
          <Text style={[styles.badgeText, { color: urgencyColor }]}>
            {formatCountdown(trial.trialEndDate)}
          </Text>
        </View>
      </View>

      <Pressable
        style={[styles.cancelButton, { borderColor: urgencyColor }]}
        onPress={() => router.push(`/trial/${trial.id}`)}
      >
        <Text style={[styles.cancelButtonText, { color: urgencyColor }]}>Cancel now</Text>
      </Pressable>
    </Pressable>
  );
}

export default function Home() {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [settings, setSettings] = useState({ currency: 'GBP', totalSaved: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [t, s] = await Promise.all([getTrials(), getSettings()]);
    const active = t
      .filter((tr) => tr.status === 'active')
      .sort((a, b) => new Date(a.trialEndDate).getTime() - new Date(b.trialEndDate).getTime());
    setTrials(active);
    setSettings(s);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const monthlyTotal = trials.reduce((sum, t) => sum + t.chargeAmount, 0);
  const sym = getCurrencySymbol(settings.currency);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Unsub</Text>
        <Text style={styles.protecting}>
          Protecting {sym}{monthlyTotal.toFixed(2)}/month
        </Text>
      </View>

      {trials.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🛡️</Text>
          <Text style={styles.emptyTitle}>No active trials</Text>
          <Text style={styles.emptySubtitle}>
            Add a free trial to start tracking.{'\n'}We'll remind you before you get charged.
          </Text>
          <Pressable style={styles.addButtonLarge} onPress={() => router.push('/trial/add')}>
            <Text style={styles.addButtonText}>+ Add your first trial</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={trials}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => <TrialCard trial={item} currency={settings.currency} />}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        />
      )}

      {settings.totalSaved > 0 && (
        <View style={styles.savedBar}>
          <Text style={styles.savedText}>You've saved {sym}{settings.totalSaved.toFixed(2)} 🎉</Text>
        </View>
      )}

      {trials.length > 0 && (
        <Pressable style={styles.fab} onPress={() => router.push('/trial/add')}>
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  headerTitle: { fontSize: 32, fontWeight: '800', color: colors.text },
  protecting: { fontSize: 14, color: colors.accent, marginTop: 2 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 120 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: { fontSize: 32 },
  cardName: { fontSize: 17, fontWeight: '600', color: colors.text },
  cardCharge: { fontSize: 14, color: colors.textSecondary },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { fontSize: 13, fontWeight: '700' },
  cancelButton: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelButtonText: { fontSize: 15, fontWeight: '600' },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: { fontSize: 64, marginBottom: spacing.md },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  addButtonLarge: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
  },
  addButtonText: { fontSize: 17, fontWeight: '700', color: colors.white },
  savedBar: {
    position: 'absolute',
    bottom: 95,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.accentDark + '30',
    borderRadius: 12,
    padding: spacing.sm,
    alignItems: 'center',
  },
  savedText: { fontSize: 15, fontWeight: '600', color: colors.accent },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: 105,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: { fontSize: 28, fontWeight: '600', color: colors.white, marginTop: -2 },
});
