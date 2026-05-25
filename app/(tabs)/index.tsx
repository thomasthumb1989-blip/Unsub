import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Share } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Trial, getTrials, getSettings, trialsToShareText } from '../../src/utils/storage';
import { colors, spacing, getCategoryColor, getCurrencySymbol, getUrgencyColor } from '../../src/utils/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { ServiceLogo } from '../../src/components/ServiceLogo';
import { getExchangeRates, convertCurrency, areRatesStale, refreshExchangeRates, ExchangeRates } from '../../src/utils/currency';
import { PremiumGate } from '../../src/components/PremiumGate';

function SpendRing({ total, segments, currency, tc }: {
  total: number;
  segments: { value: number; color: string }[];
  currency: string;
  tc: any;
}) {
  const barHeight = 8;
  const barWidth = 220;
  const sym = getCurrencySymbol(currency);
  let accumulated = 0;

  const formatAmount = (n: number) => {
    if (n >= 10000) return `${sym}${(n / 1000).toFixed(1)}k`;
    if (n >= 1000) return `${sym}${n.toFixed(0)}`;
    return `${sym}${n.toFixed(2)}`;
  };

  return (
    <View style={{ alignItems: 'center', paddingVertical: 16 }}>
      <Text style={{ fontSize: 36, fontWeight: '800', color: tc.white, textAlign: 'center' }}>{formatAmount(total)}</Text>
      <View style={{ marginTop: 12, height: 8, borderRadius: 4, backgroundColor: tc.cardBorder, width: 220, overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', height: barHeight, borderRadius: barHeight / 2, overflow: 'hidden', width: barWidth }}>
          {segments.map((seg, i) => {
            const pct = total > 0 ? (seg.value / total) * 100 : 0;
            return (
              <View key={i} style={{ width: `${pct}%`, backgroundColor: seg.color, height: barHeight }} />
            );
          })}
        </View>
      </View>
    </View>
  );
}


export default function Dashboard() {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [settings, setSettings] = useState({ currency: 'GBP', totalSaved: 0, isPremium: false });
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');
  const [rates, setRates] = useState<ExchangeRates>({ GBP: 1 });

  const load = useCallback(async () => {
    const [t, s, r] = await Promise.all([getTrials(), getSettings(), getExchangeRates()]);
    setTrials(t.filter((tr) => tr.status === 'active'));
    setSettings(s);
    setRates(r);
    // Refresh rates in background if stale
    areRatesStale().then((stale) => { if (stale) refreshExchangeRates().then(setRates); });
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const sym = getCurrencySymbol(settings.currency);
  const homeCurrency = settings.currency;
  const getHomeAmount = (t: Trial) => convertCurrency(t.chargeAmount, t.currency || homeCurrency, homeCurrency, rates);
  const monthlyTotal = trials.reduce((sum, t) => sum + getHomeAmount(t), 0);
  const displayTotal = viewMode === 'yearly' ? monthlyTotal * 12 : monthlyTotal;

  const sorted = [...trials].sort(
    (a, b) => new Date(a.trialEndDate).getTime() - new Date(b.trialEndDate).getTime()
  );
  const upcoming = sorted.slice(0, 3);
  const multiplier = viewMode === 'yearly' ? 12 : 1;
  const highest = trials.length > 0 ? Math.max(...trials.map((t) => getHomeAmount(t))) * multiplier : 0;
  const lowest = trials.length > 0 ? Math.min(...trials.map((t) => getHomeAmount(t))) * multiplier : 0;

  const categoryMap = new Map<string, number>();
  trials.forEach((t) => {
    const cat = t.category || 'other';
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + getHomeAmount(t));
  });
  const segments = Array.from(categoryMap.entries()).map(([cat, value]) => ({
    value: viewMode === 'yearly' ? value * 12 : value,
    color: getCategoryColor(cat),
  }));

  const toggleView = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setViewMode(viewMode === 'monthly' ? 'yearly' : 'monthly');
  };

  const { colors: tc } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tc.bg }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topRow}>
          <Text style={styles.brandLogo}>Unsub</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              style={[styles.calendarBtn, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Share.share({ message: trialsToShareText(trials, settings.currency) });
              }}
            >
              <Ionicons name="share-outline" size={18} color={tc.textSecondary} />
            </Pressable>
            <Pressable
              style={[styles.calendarBtn, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/calendar'); }}
            >
              <Ionicons name="calendar-outline" size={18} color={tc.textSecondary} />
            </Pressable>
          </View>
        </View>

        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <LinearGradient
            colors={[tc.card, tc.bg]}
            style={[styles.chartCard, { borderColor: tc.cardBorder }]}
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

            <SpendRing total={displayTotal} segments={segments} currency={settings.currency} tc={tc} />

            <Text style={[styles.donutLabel, { color: tc.textSecondary }]}>{viewMode === 'monthly' ? 'MONTHLY  ' : 'YEARLY  '}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: tc.textSecondary }]}>{'Active  '}</Text>
                <Text style={[styles.statValue, { color: tc.white }]}>{trials.length}</Text>
              </View>
              <View style={[styles.statItem, styles.statBorder, { borderColor: tc.cardBorder }]}>
                <Text style={[styles.statLabel, { color: tc.textSecondary }]}>{'Highest  '}</Text>
                <Text style={[styles.statValue, { color: tc.white }]} numberOfLines={1} adjustsFontSizeToFit>{sym}{highest >= 1000 ? `${(highest/1000).toFixed(1)}k` : highest.toFixed(2)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: tc.textSecondary }]}>{'Lowest  '}</Text>
                <Text style={[styles.statValue, { color: tc.white }]} numberOfLines={1} adjustsFontSizeToFit>{sym}{lowest >= 1000 ? `${(lowest/1000).toFixed(1)}k` : lowest.toFixed(2)}</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.summaryRow}>
          <Pressable style={{ flex: 1 }} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/subscriptions'); }}>
            <LinearGradient colors={[tc.card, tc.bg]} style={styles.summaryCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="layers-outline" size={18} color={tc.accent} />
              <Text style={[styles.summaryLabel, { color: tc.sectionHeader }]}>{'YOUR SUBS  '}</Text>
              <View style={styles.summaryBottom}>
                <Text style={[styles.summaryValue, { color: tc.white }]}>{trials.length}</Text>
                <Ionicons name="chevron-forward" size={16} color={tc.textSecondary} />
              </View>
            </LinearGradient>
          </Pressable>
          <Pressable style={{ flex: 1 }} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/calendar'); }}>
            <LinearGradient colors={[tc.card, tc.bg]} style={styles.summaryCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="time-outline" size={18} color={tc.accent} />
              <Text style={[styles.summaryLabel, { color: tc.sectionHeader }]}>{'UPCOMING  '}</Text>
              <View style={styles.summaryBottom}>
                <Text style={[styles.summaryValue, { color: tc.white }]}>{upcoming.length}</Text>
                <Ionicons name="chevron-forward" size={16} color={tc.textSecondary} />
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {categoryMap.size > 0 && (
          <PremiumGate isLocked={!settings.isPremium} feature="See spending breakdown by category. Upgrade to Premium — just £3.99 once.">
            <Text style={[styles.sectionHeader, { color: tc.sectionHeader }]}>SPENDING BREAKDOWN</Text>
            <Animated.View entering={FadeInDown.duration(500).delay(250)} style={[styles.insightsContainer, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}>
              {Array.from(categoryMap.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amount]) => {
                  const displayAmount = viewMode === 'yearly' ? amount * 12 : amount;
                  const pct = displayTotal > 0 ? (displayAmount / displayTotal) * 100 : 0;
                  return (
                    <View key={cat} style={styles.insightRow}>
                      <View style={styles.insightLeft}>
                        <View style={[styles.insightDot, { backgroundColor: getCategoryColor(cat) }]} />
                        <Text style={[styles.insightCat, { color: tc.textSecondary }]} numberOfLines={1}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Text>
                      </View>
                      <View style={styles.insightRight}>
                        <View style={styles.insightBarBg}>
                          <View style={[styles.insightBarFill, { width: `${Math.min(pct, 80)}%`, backgroundColor: getCategoryColor(cat) }]} />
                        </View>
                        <Text style={[styles.insightAmount, { color: tc.white }]} numberOfLines={1}>{sym}{displayAmount >= 1000 ? `${(displayAmount/1000).toFixed(1)}k` : displayAmount.toFixed(0)}</Text>
                      </View>
                    </View>
                  );
                })}
            </Animated.View>
          </PremiumGate>
        )}

        <Text style={[styles.sectionHeader, { color: tc.sectionHeader }]}>UPCOMING BILLS</Text>
        {upcoming.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={40} color={tc.textSecondary} />
            <Text style={[styles.emptyText, { color: tc.textSecondary }]}>No upcoming subscriptions</Text>
            <Pressable
              style={styles.emptyBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/trial/add');
              }}
            >
              <Ionicons name="add-circle-outline" size={18} color="#F59E0B" />
              <Text style={styles.emptyBtnText}>Add your first subscription</Text>
            </Pressable>
          </View>
        ) : (
          upcoming.map((trial, index) => {
            const catColor = getCategoryColor(trial.category);
            const dueDate = new Date(trial.trialEndDate);
            const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            const urgencyColor = getUrgencyColor(daysLeft);
            const dueStr = daysLeft <= 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft} days`;
            return (
              <Animated.View key={trial.id} entering={FadeInDown.duration(400).delay(300 + index * 100)}>
                <Pressable
                  style={[styles.billCard, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/trial/${trial.id}`); }}
                >
                  <View style={styles.billLeft}>
                    <ServiceLogo name={trial.serviceName} color={catColor} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.billName, { color: tc.white }]}>{trial.serviceName + '  '}</Text>
                      <Text style={[styles.billDue, { color: urgencyColor }]}>{'• ' + dueStr + '  '}</Text>
                    </View>
                  </View>
                  <Text style={[styles.billAmount, { color: tc.white }]}>{sym}{getHomeAmount(trial).toFixed(2)}</Text>
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  brandLogo: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: -1,
  },
  calendarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  chartCard: {
    borderRadius: 20,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: 24,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    overflow: 'visible',
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
  donutLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 8, letterSpacing: 1, paddingRight: 2 },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    width: '100%',
    overflow: 'visible',
  },
  statItem: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  statBorder: {
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4, textAlign: 'center', alignSelf: 'stretch' },
  statValue: { fontSize: 18, fontWeight: '700', color: colors.white, textAlign: 'center', alignSelf: 'stretch' },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: spacing.lg,
    marginTop: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
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
    borderRadius: 16,
    padding: 16,
    marginHorizontal: spacing.lg,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  billLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  billName: { fontSize: 16, fontWeight: '600', color: colors.white },
  billDue: { fontSize: 13 },
  billAmount: { fontSize: 17, fontWeight: '700', color: colors.white },
  insightsContainer: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
    gap: 10,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  insightLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, width: 130 },
  insightDot: { width: 8, height: 8, borderRadius: 4 },
  insightCat: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  insightRight: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 },
  insightBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  insightBarFill: { height: 6, borderRadius: 3 },
  insightAmount: { fontSize: 12, fontWeight: '600', color: colors.white, minWidth: 45, textAlign: 'right' },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 12, paddingHorizontal: spacing.lg, width: '100%' },
  emptyText: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', width: '100%' },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    backgroundColor: 'rgba(245,158,11,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)',
  },
  emptyBtnText: { fontSize: 14, fontWeight: '600', color: '#F59E0B' },
});
