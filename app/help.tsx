import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, spacing } from '../src/utils/theme';
import { useTheme } from '../src/contexts/ThemeContext';

const FAQ = [
  {
    q: 'How do I add a trial?',
    a: 'Tap the + button on the tab bar, then search for the service or type the name manually. Set the trial length, price, and reminders, then tap "Add Free Trial" or "Add Subscription".',
    icon: 'add-circle-outline' as const,
  },
  {
    q: 'How do reminders work?',
    a: 'Unsub sends you push notifications before your trial ends. By default you get reminders at 3 days, 1 day, and 2 hours before expiry. You can customise which reminders are active when adding a trial.',
    icon: 'notifications-outline' as const,
  },
  {
    q: 'What happens when I upgrade?',
    a: 'Free users can track up to 4 active subscriptions. Upgrading to Premium removes this limit and gives you unlimited tracking, savings history, and priority support.',
    icon: 'diamond-outline' as const,
  },
  {
    q: 'Can I get a refund?',
    a: 'Refunds are handled by Apple (iOS) or Google (Android) through their respective app stores. Go to your purchase history in the App Store or Google Play to request a refund.',
    icon: 'card-outline' as const,
  },
  {
    q: 'How do I cancel a subscription?',
    a: 'Open the subscription from your list, then scroll to the "How to Cancel" section for step-by-step instructions. You can also browse all cancel guides from Settings > Cancel Guides or tap the button below the FAQs. Once cancelled, tap "I\'ve Cancelled" to log it and track your savings.',
    icon: 'close-circle-outline' as const,
  },
];

function AccordionItem({ q, a, icon, index }: { q: string; a: string; icon: keyof typeof Ionicons.glyphMap; index: number }) {
  const [open, setOpen] = useState(false);
  const { colors: tc } = useTheme();

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(100 + index * 80)}>
      <Pressable
        style={[styles.faqCard, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setOpen(!open); }}
      >
        <View style={styles.faqHeader}>
          <Ionicons name={icon} size={20} color={tc.accent} style={{ marginRight: 12 }} />
          <Text style={[styles.faqQuestion, { color: tc.white }]}>{q}</Text>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={tc.accent} />
        </View>
        {open && <Text style={[styles.faqAnswer, { color: tc.textSecondary, borderTopColor: tc.cardBorder }]}>{a}</Text>}
      </Pressable>
    </Animated.View>
  );
}

export default function HelpScreen() {
  const { colors: tc } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tc.bg }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
            style={[styles.backBtn, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}
          >
            <Ionicons name="arrow-back" size={22} color={tc.white} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: tc.white }]}>Help Center</Text>
          <View style={{ width: 36 }} />
        </View>

        <Text style={[styles.sectionLabel, { color: tc.sectionHeader }]}>FREQUENTLY ASKED QUESTIONS</Text>

        {FAQ.map((item, i) => (
          <AccordionItem key={i} q={item.q} a={item.a} icon={item.icon} index={i} />
        ))}

        <Animated.View entering={FadeInDown.duration(400).delay(550)}>
          <Pressable
            style={[styles.guidesBtn, { backgroundColor: tc.card, borderColor: colors.accent }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/cancel-guides'); }}
          >
            <Ionicons name="close-circle-outline" size={22} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.guidesBtnTitle, { color: tc.white }]}>Browse Cancel Guides</Text>
              <Text style={[styles.guidesBtnSub, { color: tc.textSecondary }]}>Step-by-step instructions for 30+ services</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.accent} />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(600)}>
          <View style={[styles.contactCard, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}>
            <Ionicons name="mail-outline" size={24} color={tc.accent} />
            <Text style={[styles.contactTitle, { color: tc.white }]}>Still need help?</Text>
            <Text style={[styles.contactBody, { color: tc.textSecondary }]}>
              Contact us at support@unsub.app and we'll get back to you within 24 hours.
            </Text>
          </View>
        </Animated.View>
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
    marginBottom: spacing.lg,
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
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.sectionHeader,
    letterSpacing: 1,
    marginHorizontal: spacing.lg,
    marginBottom: 12,
  },
  faqCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: spacing.lg,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqQuestion: { fontSize: 15, fontWeight: '600', color: colors.white, flex: 1, paddingRight: 8 },
  faqAnswer: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: colors.cardBorder,
    marginLeft: 32,
  },
  guidesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: spacing.lg,
    marginTop: 16,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  guidesBtnTitle: { fontSize: 16, fontWeight: '700', color: colors.white },
  guidesBtnSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  contactCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: spacing.lg,
    marginTop: 12,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    gap: 8,
  },
  contactTitle: { fontSize: 16, fontWeight: '700', color: colors.white },
  contactBody: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});
