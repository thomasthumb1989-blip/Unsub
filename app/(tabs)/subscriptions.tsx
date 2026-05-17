import { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Trial, getTrials, getSettings } from '../../src/utils/storage';
import { colors, spacing, getCategoryColor, getCurrencySymbol, categoryColors } from '../../src/utils/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { ServiceLogo } from '../../src/components/ServiceLogo';
import { getExchangeRates, convertCurrency, ExchangeRates } from '../../src/utils/currency';

type SortMode = 'name' | 'price-high' | 'price-low' | 'date';

type StatusFilter = 'active' | 'cancelled' | 'all';

export default function Subscriptions() {
  const [allTrials, setAllTrials] = useState<Trial[]>([]);
  const [currency, setCurrency] = useState('GBP');
  const [rates, setRates] = useState<ExchangeRates>({ GBP: 1 });
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('name');
  const [showSort, setShowSort] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [t, s, r] = await Promise.all([getTrials(), getSettings(), getExchangeRates()]);
        setAllTrials(t);
        setCurrency(s.currency);
        setRates(r);
      })();
    }, [])
  );

  const sym = getCurrencySymbol(currency);
  const trials = useMemo(() => {
    if (statusFilter === 'all') return allTrials;
    return allTrials.filter((t) => t.status === statusFilter);
  }, [allTrials, statusFilter]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    trials.forEach((t) => cats.add(t.category || 'other'));
    return Array.from(cats).sort();
  }, [trials]);

  const filtered = useMemo(() => {
    let list = trials;
    if (search) {
      list = list.filter((t) => t.serviceName.toLowerCase().includes(search.toLowerCase()));
    }
    if (categoryFilter) {
      list = list.filter((t) => (t.category || 'other') === categoryFilter);
    }
    switch (sortMode) {
      case 'name': return [...list].sort((a, b) => a.serviceName.localeCompare(b.serviceName));
      case 'price-high': return [...list].sort((a, b) => b.chargeAmount - a.chargeAmount);
      case 'price-low': return [...list].sort((a, b) => a.chargeAmount - b.chargeAmount);
      case 'date': return [...list].sort((a, b) => new Date(a.trialEndDate).getTime() - new Date(b.trialEndDate).getTime());
      default: return list;
    }
  }, [trials, search, categoryFilter, sortMode]);

  const monthlyTotal = filtered.reduce((sum, t) => sum + convertCurrency(t.chargeAmount, t.currency || currency, currency, rates), 0);

  const sortOptions: { mode: SortMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { mode: 'name', label: 'Name', icon: 'text-outline' },
    { mode: 'price-high', label: 'Price ↓', icon: 'arrow-down-outline' },
    { mode: 'price-low', label: 'Price ↑', icon: 'arrow-up-outline' },
    { mode: 'date', label: 'Due date', icon: 'calendar-outline' },
  ];

  const { colors: tc } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tc.bg }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.brandLogo}>Unsub</Text>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowSort(!showSort); setShowSearch(false); }}
            style={[styles.actionBtn, showSort && styles.actionBtnActive]}
          >
            <Ionicons name="swap-vertical-outline" size={18} color={showSort ? colors.accent : colors.textSecondary} />
          </Pressable>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowSearch(!showSearch); setShowSort(false); }}
            style={[styles.actionBtn, showSearch && styles.actionBtnActive]}
          >
            <Ionicons name={showSearch ? 'close' : 'search'} size={18} color={showSearch ? colors.accent : colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      <View style={styles.statusRow}>
        {(['active', 'cancelled', 'all'] as StatusFilter[]).map((s) => (
          <Pressable
            key={s}
            style={[styles.statusChip, statusFilter === s && styles.statusChipActive]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setStatusFilter(s); }}
          >
            <Text style={[styles.statusChipText, statusFilter === s && styles.statusChipTextActive]}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {showSearch && (
        <TextInput
          style={styles.searchInput}
          placeholder="Search subscriptions..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          autoFocus
        />
      )}

      {showSort && (
        <View style={styles.sortRow}>
          {sortOptions.map((opt) => (
            <Pressable
              key={opt.mode}
              style={[styles.sortChip, sortMode === opt.mode && styles.sortChipActive]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSortMode(opt.mode); }}
            >
              <Ionicons name={opt.icon} size={14} color={sortMode === opt.mode ? colors.accent : colors.textSecondary} />
              <Text style={[styles.sortChipText, sortMode === opt.mode && styles.sortChipTextActive]}>{opt.label}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {categories.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <Pressable
            style={[styles.filterChip, !categoryFilter && styles.filterChipActive]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCategoryFilter(null); }}
          >
            <Text style={[styles.filterChipText, !categoryFilter && styles.filterChipTextActive]}>All</Text>
          </Pressable>
          {categories.map((cat) => (
            <Pressable
              key={cat}
              style={[styles.filterChip, categoryFilter === cat && styles.filterChipActive]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCategoryFilter(categoryFilter === cat ? null : cat); }}
            >
              <View style={[styles.filterDot, { backgroundColor: getCategoryColor(cat) }]} />
              <Text style={[styles.filterChipText, categoryFilter === cat && styles.filterChipTextActive]}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <FlashList
        data={filtered}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        estimatedItemSize={72}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item, index }) => {
          const catColor = getCategoryColor(item.category);
          const cycle = item.cycle || 'monthly';
          return (
            <Animated.View entering={FadeInDown.duration(400).delay(index * 60)}>
              <Pressable
                style={styles.card}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/trial/${item.id}`); }}
              >
                <View style={styles.cardLeft}>
                  <ServiceLogo name={item.serviceName} color={catColor} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardName}>{item.serviceName + '  '}</Text>
                    <Text style={styles.cardCategory}>{(item.category || 'Other') + '  '}</Text>
                  </View>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.cardAmount}>{sym}{item.chargeAmount.toFixed(2)}</Text>
                  <Text style={styles.cardCycle}>
                    {(item.status === 'cancelled' ? 'CANCELLED' : (cycle || 'monthly').toUpperCase()) + '  '}
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={40} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No subscriptions found</Text>
          </View>
        }
        ListFooterComponent={
          filtered.length > 0 ? (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{'Monthly Total (' + filtered.length + ')  '}</Text>
              <Text style={styles.totalAmount}>{sym}{monthlyTotal.toFixed(2)}{'  '}</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
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
  headerActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  actionBtnActive: { borderColor: colors.accent },
  statusRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: 8,
    marginBottom: 8,
  },
  statusChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  statusChipActive: { borderColor: colors.accent, backgroundColor: 'rgba(245,158,11,0.1)' },
  statusChipText: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  statusChipTextActive: { color: colors.accent },
  searchInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: spacing.lg,
    marginBottom: 8,
    fontSize: 15,
    color: colors.white,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  sortRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: 8,
    marginBottom: 8,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  sortChipActive: { borderColor: colors.accent, backgroundColor: 'rgba(245,158,11,0.1)' },
  sortChipText: { fontSize: 12, fontWeight: '500', color: colors.textSecondary },
  sortChipTextActive: { color: colors.accent },
  filterRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 10,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  filterChipActive: { borderColor: colors.accent, backgroundColor: 'rgba(245,158,11,0.1)' },
  filterDot: { width: 6, height: 6, borderRadius: 3 },
  filterChipText: { fontSize: 12, fontWeight: '500', color: colors.textSecondary },
  filterChipTextActive: { color: colors.accent },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
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
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  cardName: { fontSize: 16, fontWeight: '600', color: colors.white },
  cardCategory: { fontSize: 13, color: colors.textSecondary, marginTop: 2, textTransform: 'capitalize' },
  cardRight: { alignItems: 'flex-end' },
  cardAmount: { fontSize: 17, fontWeight: '700', color: colors.white },
  cardCycle: { fontSize: 10, color: colors.textSecondary, letterSpacing: 1, marginTop: 2 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  totalLabel: { fontSize: 15, color: colors.accent },
  totalAmount: { fontSize: 22, fontWeight: '800', color: colors.white },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 16, color: colors.textSecondary, textAlign: 'center' },
});
