import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Trial, getTrials, getSettings } from '../../src/utils/storage';
import { colors, spacing, getCategoryColor, getCurrencySymbol } from '../../src/utils/theme';

function DonutChart({ total, segments, currency }: {
  total: number;
  segments: { value: number; color: string }[];
  currency: string;
}) {
  const size = 180;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const sym = getCurrencySymbol(currency);

  let accumulated = 0;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={center} cy={center} r={radius}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {segments.map((seg, i) => {
          const segLength = total > 0 ? (seg.value / total) * circumference : 0;
          const rotation = total > 0 ? (accumulated / total) * 360 - 90 : -90;
          accumulated += seg.value;
          return (
            <Circle
              key={i}
              cx={center} cy={center} r={radius}
              stroke={seg.color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${segLength} ${circumference - segLength}`}
              strokeLinecap="round"
              transform={`rotate(${rotation} ${center} ${center})`}
            />
          );
        })}
      </Svg>
      <View style={styles.donutCenter}>
        <Text style={styles.donutAmount}>{sym}{total.toFixed(2)}</Text>
        <Text style={styles.donutLabel}>MONTHLY</Text>
      </View>
    </View>
  );
}

function LetterAvatar({ name, color }: { name: string; color: string }) {
  return (
    <View style={[styles.avatar, { backgroundColor: color }]}>
      <Text style={styles.avatarLetter}>{name.charAt(0).toUpperCase()}</Text>
    </View>
  );
}

export default function Dashboard() {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [settings, setSettings] = useState({ currency: 'GBP', totalSaved: 0 });

  const load = useCallback(async () => {
    const [t, s] = await Promise.all([getTrials(), getSettings()]);
    setTrials(t.filter((tr) => tr.status === 'active'));
    setSettings(s);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const sym = getCurrencySymbol(settings.currency);
  const monthlyTotal = trials.reduce((sum, t) => sum + t.chargeAmount, 0);

  const sorted = [...trials].sort(
    (a, b) => new Date(a.trialEndDate).getTime() - new Date(b.trialEndDate).getTime()
  );
  const upcoming = sorted.slice(0, 3);
  const highest = trials.length > 0 ? Math.max(...trials.map((t) => t.chargeAmount)) : 0;
  const lowest = trials.length > 0 ? Math.min(...trials.map((t) => t.chargeAmount)) : 0;

  const categoryMap = new Map<string, number>();
  trials.forEach((t) => {
    const cat = t.category || 'other';
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + t.chargeAmount);
  });
  const segments = Array.from(categoryMap.entries()).map(([cat, value]) => ({
    value,
    color: getCategoryColor(cat),
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.chartCard}>
          <DonutChart total={monthlyTotal} segments={segments} currency={settings.currency} />
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Active</Text>
              <Text style={styles.statValue}>{trials.length}</Text>
            </View>
            <View style={[styles.statItem, styles.statBorder]}>
              <Text style={styles.statLabel}>Highest</Text>
              <Text style={styles.statValue}>{sym}{highest.toFixed(2)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Lowest</Text>
              <Text style={styles.statValue}>{sym}{lowest.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <Pressable style={styles.summaryCard} onPress={() => router.push('/(tabs)/subscriptions')}>
            <Text style={styles.summaryLabel}>YOUR SUBS</Text>
            <View style={styles.summaryBottom}>
              <Text style={styles.summaryValue}>{trials.length}</Text>
              <Text style={styles.summaryArrow}>›</Text>
            </View>
          </Pressable>
          <Pressable style={styles.summaryCard} onPress={() => router.push('/(tabs)/calendar')}>
            <Text style={styles.summaryLabel}>UPCOMING</Text>
            <View style={styles.summaryBottom}>
              <Text style={styles.summaryValue}>{upcoming.length}</Text>
              <Text style={styles.summaryArrow}>›</Text>
            </View>
          </Pressable>
        </View>

        <Text style={styles.sectionHeader}>UPCOMING BILLS</Text>
        {upcoming.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No upcoming bills</Text>
            <Pressable style={styles.addBtn} onPress={() => router.push('/trial/add')}>
              <Text style={styles.addBtnText}>+ Add Subscription</Text>
            </Pressable>
          </View>
        ) : (
          upcoming.map((trial) => {
            const catColor = getCategoryColor(trial.category);
            const dueDate = new Date(trial.trialEndDate);
            const dueStr = `Due ${dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
            return (
              <Pressable
                key={trial.id}
                style={styles.billCard}
                onPress={() => router.push(`/trial/${trial.id}`)}
              >
                <View style={styles.billLeft}>
                  <LetterAvatar name={trial.serviceName} color={catColor} />
                  <View>
                    <Text style={styles.billName}>{trial.serviceName}</Text>
                    <Text style={styles.billDue}>{dueStr}</Text>
                  </View>
                </View>
                <Text style={styles.billAmount}>{sym}{trial.chargeAmount.toFixed(2)}</Text>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 100 },
  chartCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.lg,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  donutCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutAmount: { fontSize: 28, fontWeight: '800', color: colors.white },
  donutLabel: { fontSize: 11, color: colors.textSecondary, letterSpacing: 1, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    width: '100%',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statBorder: {
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '700', color: colors.white },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: spacing.lg,
    marginTop: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.sectionHeader,
    letterSpacing: 1,
    fontWeight: '600',
  },
  summaryBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  summaryValue: { fontSize: 24, fontWeight: '800', color: colors.white },
  summaryArrow: { fontSize: 20, color: colors.textSecondary },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.sectionHeader,
    letterSpacing: 1,
    marginHorizontal: spacing.lg,
    marginTop: 24,
    marginBottom: 12,
  },
  billCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: spacing.lg,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  billLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontSize: 18, fontWeight: '700', color: colors.white },
  billName: { fontSize: 16, fontWeight: '600', color: colors.white },
  billDue: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  billAmount: { fontSize: 17, fontWeight: '700', color: colors.white },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, color: colors.textSecondary, marginBottom: 16 },
  addBtn: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  addBtnText: { fontSize: 15, fontWeight: '600', color: colors.white },
});
