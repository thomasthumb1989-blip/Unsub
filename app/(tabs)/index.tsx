import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Trial, getTrials, getSettings } from '../../src/utils/storage';
import { colors, spacing, getCategoryColor, getCurrencySymbol, getUrgencyColor } from '../../src/utils/theme';

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
      </View>
    </View>
  );
}

function LetterAvatar({ name, color }: { name: string; color: string }) {
  return (
    <LinearGradient
      colors={[color, `${color}99`]}
      style={styles.avatar}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={styles.avatarLetter}>{name.charAt(0).toUpperCase()}</Text>
    </LinearGradient>
  );
}

export default function Dashboard() {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [settings, setSettings] = useState({ currency: 'GBP', totalSaved: 0 });
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

  const load = useCallback(async () => {
    const [t, s] = await Promise.all([getTrials(), getSettings()]);
    setTrials(t.filter((tr) => tr.status === 'active'));
    setSettings(s);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const sym = getCurrencySymbol(settings.currency);
  const monthlyTotal = trials.reduce((sum, t) => sum + t.chargeAmount, 0);
  const displayTotal = viewMode === 'yearly' ? monthlyTotal * 12 : monthlyTotal;

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
    value: viewMode === 'yearly' ? value * 12 : value,
    color: getCategoryColor(cat),
  }));

  const toggleView = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setViewMode(viewMode === 'monthly' ? 'yearly' : 'monthly');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.brandLogo}>Unsub</Text>

        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <LinearGradient
            colors={['#1a1810', '#161618']}
            style={styles.chartCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View style={styles.toggleRow}>
              <Pressable
                style={[styles.toggleBtn, viewMode === 'monthly' && styles.toggleActive]}
                onPress={toggleView}
              >
                <Text style={[styles.toggleText, viewMode === 'monthly' && styles.toggleTextActive]}>Monthly</Text>
              </Pressable>
              <Pressable
                style={[styles.toggleBtn, viewMode === 'yearly' && styles.toggleActive]}
                onPress={toggleView}
              >
                <Text style={[styles.toggleText, viewMode === 'yearly' && styles.toggleTextActive]}>Yearly</Text>
              </Pressable>
            </View>

            <DonutChart total={displayTotal} segments={segments} currency={settings.currency} />

            <Text style={styles.donutLabel}>{viewMode === 'monthly' ? 'MONTHLY' : 'YEARLY'}</Text>

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
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.summaryRow}>
          <Pressable style={styles.summaryCard} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/subscriptions'); }}>
            <Ionicons name="layers-outline" size={18} color={colors.accent} />
            <Text style={styles.summaryLabel}>YOUR SUBS</Text>
            <View style={styles.summaryBottom}>
              <Text style={styles.summaryValue}>{trials.length}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </View>
          </Pressable>
          <Pressable style={styles.summaryCard} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/history'); }}>
            <Ionicons name="time-outline" size={18} color={colors.accent} />
            <Text style={styles.summaryLabel}>UPCOMING</Text>
            <View style={styles.summaryBottom}>
              <Text style={styles.summaryValue}>{upcoming.length}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </View>
          </Pressable>
        </Animated.View>

        <Text style={styles.sectionHeader}>UPCOMING BILLS</Text>
        {upcoming.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={40} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No upcoming subscriptions</Text>
          </View>
        ) : (
          upcoming.map((trial, index) => {
            const catColor = getCategoryColor(trial.category);
            const dueDate = new Date(trial.trialEndDate);
            const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            const urgencyColor = getUrgencyColor(daysLeft);
            const dueStr = daysLeft <= 0 ? 'Due today' : daysLeft === 1 ? 'Due tomorrow' : `Due in ${daysLeft} days`;
            return (
              <Animated.View key={trial.id} entering={FadeInDown.duration(400).delay(300 + index * 100)}>
                <Pressable
                  style={styles.billCard}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/trial/${trial.id}`); }}
                >
                  <View style={styles.billLeft}>
                    <LetterAvatar name={trial.serviceName} color={catColor} />
                    <View>
                      <Text style={styles.billName}>{trial.serviceName}</Text>
                      <View style={styles.urgencyRow}>
                        <View style={[styles.urgencyDot, { backgroundColor: urgencyColor }]} />
                        <Text style={[styles.billDue, { color: urgencyColor }]}>{dueStr}</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.billAmount}>{sym}{trial.chargeAmount.toFixed(2)}</Text>
                </Pressable>
              </Animated.View>
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
  brandLogo: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: -1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  chartCard: {
    borderRadius: 20,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.lg,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 3,
    marginBottom: spacing.md,
  },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: colors.accent,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.white,
  },
  donutCenter: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    bottom: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutAmount: { fontSize: 28, fontWeight: '800', color: colors.white },
  donutLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 8, letterSpacing: 1 },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    width: '100%',
  },
  statItem: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
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
    marginTop: 8,
  },
  summaryBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  summaryValue: { fontSize: 24, fontWeight: '800', color: colors.white },
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
  urgencyRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  urgencyDot: { width: 6, height: 6, borderRadius: 3 },
  billDue: { fontSize: 13 },
  billAmount: { fontSize: 17, fontWeight: '700', color: colors.white },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 16, color: colors.textSecondary },
});
