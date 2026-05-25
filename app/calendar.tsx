import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Trial, getTrials, getSettings } from '../src/utils/storage';
import { colors, spacing, getCategoryColor, getCurrencySymbol } from '../src/utils/theme';
import { ServiceLogo } from '../src/components/ServiceLogo';
import { useTheme } from '../src/contexts/ThemeContext';
import { PremiumScreen } from '../src/components/PremiumGate';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export default function CalendarScreen() {
  const { colors: tc } = useTheme();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [trials, setTrials] = useState<Trial[]>([]);
  const [currency, setCurrency] = useState('GBP');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [t, s] = await Promise.all([getTrials(), getSettings()]);
        setTrials(t.filter((tr) => tr.status === 'active'));
        setCurrency(s.currency);
        setIsPremium(!!s.isPremium);
      })();
    }, [])
  );

  const sym = getCurrencySymbol(currency);
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const trialsByDay = new Map<number, Trial[]>();
  trials.forEach((t) => {
    const d = new Date(t.trialEndDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!trialsByDay.has(day)) trialsByDay.set(day, []);
      trialsByDay.get(day)!.push(t);
    }
  });

  const prevMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDay(null);
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDay(null);
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const selectedTrials = selectedDay ? (trialsByDay.get(selectedDay) || []) : [];
  const today = now.getDate();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tc.bg }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }} style={[styles.backBtn, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}>
            <Ionicons name="arrow-back" size={22} color={tc.white} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: tc.white }]}>Calendar</Text>
          <View style={{ width: 36 }} />
        </View>

        {!isPremium ? (
          <PremiumScreen feature="See all your subscription due dates on a calendar. Upgrade to Premium — just £3.99 once." />
        ) : (
        <>
        <View style={styles.monthNav}>
          <Pressable onPress={prevMonth} style={[styles.navBtn, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}>
            <Ionicons name="chevron-back" size={20} color={tc.white} />
          </Pressable>
          <Text style={[styles.monthLabel, { color: tc.white }]}>{MONTHS[month]} {year}</Text>
          <Pressable onPress={nextMonth} style={[styles.navBtn, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}>
            <Ionicons name="chevron-forward" size={20} color={tc.white} />
          </Pressable>
        </View>

        <View style={[styles.calendarCard, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}>
          <View style={styles.dayHeaders}>
            {DAYS.map((d) => (
              <Text key={d} style={[styles.dayHeaderText, { color: tc.textSecondary }]}>{d}</Text>
            ))}
          </View>

          <View style={styles.grid}>
            {Array.from({ length: firstDay }).map((_, i) => (
              <View key={`empty-${i}`} style={styles.dayCell} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const hasTrials = trialsByDay.has(day);
              const isToday = isCurrentMonth && day === today;
              const isSelected = day === selectedDay;
              return (
                <Pressable
                  key={day}
                  style={[styles.dayCell, isToday && styles.dayCellToday, isSelected && styles.dayCellSelected]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedDay(day === selectedDay ? null : day);
                  }}
                >
                  <Text style={[styles.dayText, { color: tc.white }, isToday && styles.dayTextToday, isSelected && styles.dayTextSelected]}>
                    {day}
                  </Text>
                  {hasTrials && (
                    <View style={styles.dotRow}>
                      {(trialsByDay.get(day) || []).slice(0, 3).map((t, idx) => (
                        <View key={idx} style={[styles.calDot, { backgroundColor: getCategoryColor(t.category) }]} />
                      ))}
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {selectedDay && selectedTrials.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>DUE ON {selectedDay} {MONTHS[month].toUpperCase().slice(0, 3)}</Text>
            {selectedTrials.map((trial, index) => (
              <Animated.View key={trial.id} entering={FadeInDown.duration(300).delay(index * 80)}>
                <Pressable
                  style={[styles.billCard, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/trial/${trial.id}`); }}
                >
                  <View style={styles.billLeft}>
                    <ServiceLogo name={trial.serviceName} color={getCategoryColor(trial.category)} />
                    <View>
                      <Text style={[styles.billName, { color: tc.white }]}>{trial.serviceName}</Text>
                      <Text style={[styles.billCategory, { color: tc.textSecondary }]}>{trial.category || 'Other'}</Text>
                    </View>
                  </View>
                  <Text style={[styles.billAmount, { color: tc.white }]}>{sym}{trial.chargeAmount.toFixed(2)}</Text>
                </Pressable>
              </Animated.View>
            ))}
          </>
        )}

        {!selectedDay && (
          <View style={styles.hint}>
            <Ionicons name="information-circle-outline" size={18} color={tc.textSecondary} />
            <Text style={[styles.hintText, { color: tc.textSecondary }]}>Tap a day to see due subscriptions</Text>
          </View>
        )}
        </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 60 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.white },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: 12,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  monthLabel: { fontSize: 17, fontWeight: '700', color: colors.white },
  calendarCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  dayHeaders: { flexDirection: 'row', marginBottom: 8 },
  dayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  dayCellToday: {
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderRadius: 10,
  },
  dayCellSelected: {
    backgroundColor: colors.accent,
    borderRadius: 10,
  },
  dayText: { fontSize: 14, color: colors.white, fontWeight: '500' },
  dayTextToday: { color: colors.accent, fontWeight: '700' },
  dayTextSelected: { color: '#000', fontWeight: '700' },
  dotRow: { flexDirection: 'row', gap: 2, marginTop: 2 },
  calDot: { width: 4, height: 4, borderRadius: 2 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.sectionHeader,
    letterSpacing: 1,
    marginHorizontal: spacing.lg,
    marginTop: 20,
    marginBottom: 10,
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
  billName: { fontSize: 16, fontWeight: '600', color: colors.white },
  billCategory: { fontSize: 12, color: colors.textSecondary, marginTop: 2, textTransform: 'capitalize' },
  billAmount: { fontSize: 17, fontWeight: '700', color: colors.white },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
  },
  hintText: { fontSize: 13, color: colors.textSecondary },
});
