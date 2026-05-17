import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
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
      <Text style={styles.brandLogo}>Unsub</Text>
      <Text style={styles.pageTitle}>History</Text>

      <Animated.View entering={FadeInDown.duration(500)}>
        <LinearGradient
          colors={['#1a1a0a', '#161618']}
          style={styles.summaryCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="wallet-outline" size={24} color="#10B981" />
          <Text style={styles.summaryLabel}>Total Saved</Text>
          <Text style={styles.summaryAmount}>{sym}{totalSaved.toFixed(2)}</Text>
          <Text style={styles.summaryCount}>
            {cancelled.length} subscription{cancelled.length !== 1 ? 's' : ''} cancelled
          </Text>
        </LinearGradient>
      </Animated.View>

      <FlatList
        data={cancelled}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.duration(400).delay(100 + index * 80)}>
            <View style={styles.card}>
              <View style={styles.cardLeft}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <View>
                  <Text style={styles.serviceName}>{item.serviceName}</Text>
                  <Text style={styles.dateText}>{formatDate(item.trialEndDate)}</Text>
                </View>
              </View>
              <Text style={styles.savedAmount}>{sym}{item.chargeAmount.toFixed(2)}</Text>
            </View>
          </Animated.View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="trophy-outline" size={40} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No cancelled subscriptions yet</Text>
            <Text style={styles.emptySubtext}>Cancel unwanted subs to start saving</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  brandLogo: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: -1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.white,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  summaryCard: {
    borderRadius: 20,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 0.5,
    borderColor: 'rgba(16,185,129,0.2)',
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
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
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
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
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    opacity: 0.7,
  },
});
