import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Linking } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, spacing } from '../src/utils/theme';
import { useTheme } from '../src/contexts/ThemeContext';
import { ServiceLogo } from '../src/components/ServiceLogo';
import { getAllCancelGuides, CancelGuide } from '../src/data/cancelGuides';

function GuideCard({ name, guide, index }: { name: string; guide: CancelGuide; index: number }) {
  const [open, setOpen] = useState(false);
  const { colors: tc } = useTheme();

  return (
    <Animated.View entering={FadeInDown.duration(300).delay(Math.min(index * 40, 400))}>
      <Pressable
        style={[styles.card, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setOpen(!open); }}
      >
        <View style={styles.cardHeader}>
          <ServiceLogo name={name} color={colors.accent} size={36} />
          <Text style={[styles.cardName, { color: tc.white }]}>{name}</Text>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={tc.accent} />
        </View>

        {open && (
          <View style={styles.guideContent}>
            {guide.steps.map((step, i) => (
              <View key={i} style={styles.guideStep}>
                <View style={styles.guideStepNumber}>
                  <Text style={styles.guideStepNumText}>{i + 1}</Text>
                </View>
                <Text style={[styles.guideStepText, { color: tc.textSecondary }]}>{step}</Text>
              </View>
            ))}
            {guide.note && (
              <View style={styles.guideNote}>
                <Ionicons name="information-circle-outline" size={16} color={tc.accent} />
                <Text style={[styles.guideNoteText, { color: tc.accent }]}>{guide.note}</Text>
              </View>
            )}
            {guide.url && (
              <Pressable
                style={styles.guideLink}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL(guide.url!); }}
              >
                <Ionicons name="open-outline" size={16} color={tc.accent} />
                <Text style={[styles.guideLinkText, { color: tc.accent }]}>Open cancellation page</Text>
              </Pressable>
            )}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function CancelGuidesScreen() {
  const { colors: tc } = useTheme();
  const [search, setSearch] = useState('');
  const allGuides = useMemo(() => getAllCancelGuides(), []);

  const filtered = useMemo(() => {
    if (!search.trim()) return allGuides;
    const q = search.toLowerCase();
    return allGuides.filter((g) => g.name.toLowerCase().includes(q));
  }, [allGuides, search]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tc.bg }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
          style={[styles.backBtn, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}
        >
          <Ionicons name="arrow-back" size={22} color={tc.white} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: tc.white }]}>Cancel Guides</Text>
        <View style={{ width: 36 }} />
      </View>

      <TextInput
        style={[styles.searchInput, { backgroundColor: tc.card, color: tc.white, borderColor: tc.cardBorder }]}
        placeholder="Search services..."
        placeholderTextColor={tc.textSecondary}
        value={search}
        onChangeText={setSearch}
      />

      <Text style={[styles.countLabel, { color: tc.textSecondary }]}>
        {filtered.length} service{filtered.length !== 1 ? 's' : ''} with cancel guides
      </Text>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {filtered.map((item, i) => (
          <GuideCard key={item.name} name={item.name} guide={item.guide} index={i} />
        ))}
        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={40} color={tc.textSecondary} />
            <Text style={[styles.emptyText, { color: tc.textSecondary }]}>No guides found for "{search}"</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
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
  countLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginHorizontal: spacing.lg,
    marginBottom: 12,
  },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 60 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardName: { fontSize: 16, fontWeight: '600', color: colors.white, flex: 1 },
  guideContent: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 0.5,
    borderTopColor: colors.cardBorder,
    gap: 12,
  },
  guideStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  guideStepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(245,158,11,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideStepNumText: { fontSize: 12, fontWeight: '700', color: colors.accent },
  guideStepText: { fontSize: 14, color: colors.textSecondary, flex: 1, lineHeight: 20 },
  guideNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: colors.cardBorder,
  },
  guideNoteText: { fontSize: 13, color: colors.accent, flex: 1, fontStyle: 'italic' },
  guideLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: colors.cardBorder,
  },
  guideLinkText: { fontSize: 14, fontWeight: '600', color: colors.accent },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 16, color: colors.textSecondary, textAlign: 'center' },
});
