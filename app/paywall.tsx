import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { saveSettings } from '../src/utils/storage';
import { colors, spacing } from '../src/utils/theme';

const plans = [
  {
    id: 'weekly',
    label: 'Weekly',
    price: '£3.99/week',
    note: '3-day free trial',
    popular: true,
  },
  {
    id: 'yearly',
    label: 'Annual',
    price: '£29.99/year',
    note: 'Save 85%',
    popular: false,
  },
];

const features = [
  { icon: 'infinite-outline' as const, text: 'Unlimited subscription tracking' },
  { icon: 'notifications-outline' as const, text: 'Smart cancel reminders' },
  { icon: 'analytics-outline' as const, text: 'Savings history & insights' },
  { icon: 'shield-checkmark-outline' as const, text: 'Priority support' },
  { icon: 'share-outline' as const, text: 'Export & share savings' },
];

export default function PaywallScreen() {
  const [selectedPlan, setSelectedPlan] = useState('weekly');

  const handlePurchase = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Purchase',
      'In-app purchase coming soon. RevenueCat API keys needed.',
      [{ text: 'OK' }]
    );
  };

  const handleRestore = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Restore', 'No previous purchases found.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
          style={styles.closeBtn}
        >
          <Ionicons name="close" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={ZoomIn.duration(400).delay(100)}>
          <LinearGradient
            colors={['rgba(245,158,11,0.2)', 'rgba(245,158,11,0.05)']}
            style={styles.iconCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="diamond" size={40} color={colors.accent} />
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
          <Text style={styles.title}>Upgrade to Premium</Text>
          <Text style={styles.subtitle}>
            Track unlimited subscriptions and never miss a cancellation deadline
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.featureList}>
          {features.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIconWrap}>
                <Ionicons name={f.icon} size={18} color={colors.success} />
              </View>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(400)} style={{ width: '100%' }}>
          {plans.map((plan) => (
            <Pressable
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.planCardSelected,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedPlan(plan.id);
              }}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>POPULAR</Text>
                </View>
              )}
              <View style={styles.planLeft}>
                <View style={[styles.radio, selectedPlan === plan.id && styles.radioSelected]}>
                  {selectedPlan === plan.id && <View style={styles.radioInner} />}
                </View>
                <View>
                  <Text style={styles.planLabel}>{plan.label}</Text>
                  <Text style={styles.planNote}>{plan.note}</Text>
                </View>
              </View>
              <Text style={styles.planPrice}>{plan.price}</Text>
            </Pressable>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(500)} style={{ width: '100%' }}>
          <Pressable style={styles.purchaseButton} onPress={handlePurchase}>
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              style={styles.purchaseGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.purchaseButtonText}>
                {selectedPlan === 'weekly' ? 'Start Free Trial' : 'Subscribe Now'}
              </Text>
            </LinearGradient>
          </Pressable>

          <Pressable onPress={handleRestore} style={styles.restoreBtn}>
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </Pressable>

          <Text style={styles.legalText}>
            Recurring billing. Cancel anytime in your App Store settings.{'\n'}
            Payment charged at end of trial period.
          </Text>
        </Animated.View>
      </ScrollView>
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
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: 30,
    alignItems: 'center',
    paddingBottom: 40,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  featureList: { width: '100%', marginBottom: 24 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  featureIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(16,185,129,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { fontSize: 15, color: colors.white, flex: 1 },
  planCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    marginBottom: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  planCardSelected: { borderColor: colors.accent },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomLeftRadius: 8,
  },
  popularText: { fontSize: 9, fontWeight: '700', color: '#000', letterSpacing: 0.5 },
  planLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.accent },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
  },
  planLabel: { fontSize: 16, fontWeight: '600', color: colors.white },
  planNote: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  planPrice: { fontSize: 16, fontWeight: '700', color: colors.accent },
  purchaseButton: {
    width: '100%',
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  purchaseGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  purchaseButtonText: { fontSize: 18, fontWeight: '700', color: '#000' },
  restoreBtn: {
    alignItems: 'center',
    marginTop: 16,
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
    marginTop: 12,
    lineHeight: 16,
    opacity: 0.7,
  },
});
