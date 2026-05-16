import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trial, getTrials, getSettings } from '../../src/utils/storage';
import { colors, spacing, getCategoryColor, getCurrencySymbol } from '../../src/utils/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_H_MARGIN = spacing.lg;
const CARD_PADDING = spacing.lg;
const GRID_WIDTH = SCREEN_WIDTH - (CARD_H_MARGIN * 2) - (CARD_PADDING * 2);
const CELL_SIZE = Math.floor(GRID_WIDTH / 7);

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarScreen() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [trials, setTrials] = useState<Trial[]>([]);
  const [currency, setCurrency] = useState('GBP');

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [t, s] = await Promise.all([getTrials(), getSettings()]);
        setTrials(t.filter((tr) => tr.status === 'active'));
        setCurrency(s.currency);
      })();
    }, [])
  );

  const sym = getCurrencySymbol(currency);
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const billsByDay = new Map<number, Trial[]>();
  trials.forEach((t) => {
    const d = new Date(t.trialEndDate);
    if (d.getMonth() === month && d.getFullYear() === year) {
      const day = d.getDate();
      if (!billsByDay.has(day)) billsByDay.set(day, []);
      billsByDay.get(day)!.push(t);
    }
  });

  const monthBills = trials.filter((t) => {
    const d = new Date(t.trialEndDate);
    return d.getMonth() === month && d.getFullYear() === year;
  }).sort((a, b) => new Date(a.trialEndDate).getTime() - new Date(b.trialEndDate).getTime());

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) currentWeek.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    currentWeek.push(d);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Calendar</Text>

        <View style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <Text style={styles.monthTitle}>{MONTHS[month]} {year}</Text>
            <View style={styles.monthNav}>
              <Pressable onPress={prevMonth}><Text style={styles.navArrow}>‹</Text></Pressable>
              <Pressable onPress={nextMonth}><Text style={styles.navArrow}>›</Text></Pressable>
            </View>
          </View>

          <View style={styles.weekRow}>
            {DAYS.map((d, i) => (
              <View key={i} style={styles.dayCell}>
                <Text style={styles.weekDay}>{d}</Text>
              </View>
            ))}
          </View>

          {weeks.map((week, wi) => (
            <View key={wi} style={styles.weekRow}>
              {week.map((day, di) => (
                <View key={di} style={styles.dayCell}>
                  {day !== null && (
                    <>
                      <View style={isToday(day) ? styles.todayCircle : undefined}>
                        <Text
                          style={[
                            styles.dayText,
                            isToday(day) && styles.todayText,
                            billsByDay.has(day) && styles.boldDay,
                          ]}
                        >
                          {day}
                        </Text>
                      </View>
                      {billsByDay.has(day) && (
                        <View style={styles.dotRow}>
                          {(billsByDay.get(day) || []).slice(0, 2).map((t, j) => (
                            <View key={j} style={[styles.dot, { backgroundColor: getCategoryColor(t.category) }]} />
                          ))}
                        </View>
                      )}
                    </>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>

        <Text style={styles.sectionHeader}>BILLS THIS MONTH</Text>
        {monthBills.length === 0 ? (
          <Text style={styles.noBills}>No bills this month</Text>
        ) : (
          monthBills.map((trial) => {
            const d = new Date(trial.trialEndDate);
            const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
            return (
              <Pressable
                key={trial.id}
                style={styles.billCard}
                onPress={() => router.push(`/trial/${trial.id}`)}
              >
                <View style={styles.billLeft}>
                  <View style={[styles.billDot, { backgroundColor: getCategoryColor(trial.category) }]} />
                  <View>
                    <Text style={styles.billName}>{trial.serviceName}</Text>
                    <Text style={styles.billDate}>{dateStr}</Text>
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
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.white,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  calendarCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthTitle: { fontSize: 18, fontWeight: '700', color: colors.white },
  monthNav: { flexDirection: 'row', gap: 20 },
  navArrow: { fontSize: 24, color: colors.textSecondary, paddingHorizontal: 4 },
  weekRow: { flexDirection: 'row' },
  weekDay: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  dayCell: {
    width: CELL_SIZE,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayText: {
    color: colors.white,
    fontWeight: '700',
  },
  dayText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  boldDay: { color: colors.white, fontWeight: '700' },
  dotRow: { flexDirection: 'row', gap: 3, marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
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
  billDot: { width: 10, height: 10, borderRadius: 5 },
  billName: { fontSize: 16, fontWeight: '600', color: colors.white },
  billDate: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  billAmount: { fontSize: 17, fontWeight: '700', color: colors.white },
  noBills: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 15,
    paddingVertical: 20,
  },
});
