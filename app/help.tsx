import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../src/utils/theme';

const FAQ = [
  {
    q: 'How do I add a trial?',
    a: 'Tap the + button on the tab bar, then search for the service or type the name manually. Set the trial length, price, and reminders, then tap "Add Free Trial" or "Add Subscription".',
  },
  {
    q: 'How do reminders work?',
    a: 'Unsub sends you push notifications before your trial ends. By default you get reminders at 3 days, 1 day, and 2 hours before expiry. You can customise which reminders are active when adding a trial.',
  },
  {
    q: 'What happens when I upgrade?',
    a: 'Free users can track up to 3 active subscriptions. Upgrading to Premium removes this limit and gives you unlimited tracking, savings history, and priority support.',
  },
  {
    q: 'Can I get a refund?',
    a: 'Refunds are handled by Apple (iOS) or Google (Android) through their respective app stores. Go to your purchase history in the App Store or Google Play to request a refund.',
  },
  {
    q: 'How do I cancel a subscription?',
    a: 'Open the subscription from your list, then tap "Cancel Subscription" to go directly to the service\'s cancellation page. Once cancelled, tap "I\'ve Cancelled" to log it and track your savings.',
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Pressable style={styles.faqCard} onPress={() => setOpen(!open)}>
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{q}</Text>
        <Text style={styles.faqArrow}>{open ? '−' : '+'}</Text>
      </View>
      {open && <Text style={styles.faqAnswer}>{a}</Text>}
    </Pressable>
  );
}

export default function HelpScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Help Center</Text>
          <View style={{ width: 32 }} />
        </View>

        <Text style={styles.sectionLabel}>FREQUENTLY ASKED QUESTIONS</Text>

        {FAQ.map((item, i) => (
          <AccordionItem key={i} q={item.q} a={item.a} />
        ))}

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactBody}>
            Contact us at support@unsub.app and we'll get back to you within 24 hours.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: spacing.xxl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    marginBottom: spacing.lg,
  },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 28, color: colors.textSecondary },
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: { fontSize: 16, fontWeight: '600', color: colors.white, flex: 1, paddingRight: 12 },
  faqArrow: { fontSize: 20, fontWeight: '600', color: colors.accent },
  faqAnswer: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: colors.cardBorder,
  },
  contactCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: spacing.lg,
    marginTop: 12,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  contactTitle: { fontSize: 16, fontWeight: '700', color: colors.white, marginBottom: 8 },
  contactBody: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});
