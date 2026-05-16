import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveSettings } from '../src/utils/storage';
import { colors, spacing } from '../src/utils/theme';

const plans = [
  {
    id: 'weekly',
    label: 'Weekly',
    price: '£3.99 weekly',
    note: '3-day free trial',
    tag: 'Most Popular',
  },
  {
    id: 'yearly',
    label: 'Annual',
    price: '£29.99 yearly',
    note: 'Save 85%',
    tag: null,
  },
];

export default function PaywallScreen() {
  const [selectedPlan, setSelectedPlan] = useState('weekly');

  const handlePurchase = async () => {
    // RevenueCat integration — placeholder until API keys configured
    Alert.alert(
      'Purchase',
      'In-app purchase coming soon. RevenueCat API keys needed.',
      [{ text: 'OK' }]
    );
  };

  const handleRestore = async () => {
    Alert.alert('Restore', 'No previous purchases found.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={styles.emoji}>🚀</Text>
        <Text style={styles.title}>Upgrade to Premium</Text>
        <Text style={styles.subtitle}>
          Track unlimited subscriptions and never miss a cancellation deadline
        </Text>

        <View style={styles.featureList}>
          {[
            'Unlimited subscription tracking',
            'Smart cancel reminders',
            'Savings history & stats',
            'Priority support',
          ].map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureCheck}>✅</Text>
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        {plans.map((plan) => (
          <Pressable
            key={plan.id}
            style={[
              styles.planCard,
              selectedPlan === plan.id && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan(plan.id)}
          >
            <View style={styles.planLeft}>
              <View style={[styles.radio, selectedPlan === plan.id && styles.radioSelected]} />
              <View>
                <View style={styles.planLabelRow}>
                  <Text style={styles.planLabel}>{plan.label}</Text>
                  {plan.tag && (
                    <View style={styles.tagBadge}>
                      <Text style={styles.tagText}>{plan.tag}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.planNote}>{plan.note}</Text>
              </View>
            </View>
            <Text style={styles.planPrice}>{plan.price}</Text>
          </Pressable>
        ))}

        <Pressable style={styles.purchaseButton} onPress={handlePurchase}>
          <Text style={styles.purchaseButtonText}>
            {selectedPlan === 'weekly' ? 'Start Free Trial' : 'Subscribe Now'}
          </Text>
        </Pressable>

        <Pressable onPress={handleRestore} style={styles.restoreBtn}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </Pressable>

        <Text style={styles.legalText}>
          Recurring billing. Cancel anytime in your App Store settings.
          Payment charged at end of trial period.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    alignItems: 'flex-end',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 16, color: colors.textSecondary },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    alignItems: 'center',
  },
  emoji: { fontSize: 56, marginBottom: spacing.md },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  featureList: { width: '100%', marginBottom: spacing.xl },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  featureCheck: { fontSize: 16 },
  featureText: { fontSize: 16, color: colors.white, lineHeight: 24 },
  planCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    marginBottom: 12,
  },
  planCardSelected: { borderColor: colors.accent },
  planLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  planLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.cardBorder,
  },
  radioSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  tagBadge: {
    backgroundColor: colors.accent + '30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: { fontSize: 11, fontWeight: '700', color: colors.accent },
  planLabel: { fontSize: 17, fontWeight: '600', color: colors.white },
  planNote: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  planPrice: { fontSize: 17, fontWeight: '700', color: colors.accent },
  purchaseButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: 16,
    width: '100%',
    marginTop: spacing.md,
  },
  purchaseButtonText: { fontSize: 18, fontWeight: '700', color: colors.white },
  restoreBtn: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  restoreText: {
    fontSize: 14,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
  legalText: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingBottom: spacing.lg,
    lineHeight: 16,
  },
});
