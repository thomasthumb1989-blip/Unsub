import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trial, getTrials, getSettings } from '../../src/utils/storage';
import { colors, spacing, getCategoryColor, getCurrencySymbol } from '../../src/utils/theme';

function LetterAvatar({ name, color }: { name: string; color: string }) {
  return (
    <View style={[styles.avatar, { backgroundColor: color }]}>
      <Text style={styles.avatarLetter}>{name.charAt(0).toUpperCase()}</Text>
    </View>
  );
}

export default function Subscriptions() {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [currency, setCurrency] = useState('GBP');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

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
  const filtered = search
    ? trials.filter((t) => t.serviceName.toLowerCase().includes(search.toLowerCase()))
    : trials;
  const monthlyTotal = filtered.reduce((sum, t) => sum + t.chargeAmount, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.brandLogo}>Unsub</Text>
        <Pressable onPress={() => setShowSearch(!showSearch)} style={styles.searchBtn}>
          <Text style={styles.searchIcon}>⌕</Text>
        </Pressable>
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

      <FlatList
        data={filtered}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => {
          const catColor = getCategoryColor(item.category);
          const cycle = item.cycle || 'monthly';
          return (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/trial/${item.id}`)}
            >
              <View style={styles.cardLeft}>
                <LetterAvatar name={item.serviceName} color={catColor} />
                <View>
                  <Text style={styles.cardName}>{item.serviceName}</Text>
                  <Text style={styles.cardCategory}>{item.category || 'Other'}</Text>
                </View>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.cardAmount}>{sym}{item.chargeAmount.toFixed(2)}</Text>
                <Text style={styles.cardCycle}>{cycle.toUpperCase()}</Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No subscriptions yet</Text>
          </View>
        }
        ListFooterComponent={
          filtered.length > 0 ? (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Monthly Total</Text>
              <Text style={styles.totalAmount}>{sym}{monthlyTotal.toFixed(2)}</Text>
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
    paddingBottom: spacing.md,
  },
  brandLogo: {
    fontSize: 22,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: -1,
  },
  searchBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: { fontSize: 20, color: colors.textSecondary },
  searchInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: spacing.lg,
    marginBottom: 12,
    fontSize: 15,
    color: colors.white,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
  },
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
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontSize: 18, fontWeight: '700', color: colors.white },
  cardName: { fontSize: 16, fontWeight: '600', color: colors.white },
  cardCategory: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
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
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, color: colors.textSecondary, textAlign: 'center' },
});
