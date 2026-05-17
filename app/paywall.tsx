import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { saveSettings } from '../src/utils/storage';
import { colors, spacing } from '../src/utils/theme';
import { useTheme } from '../src/contexts/ThemeContext';

const features = [
  { icon: 'infinite-outline' as const, text: 'Unlimited subscription tracking' },
  { icon: 'mail-outline' as const, text: 'Email scanning for subscriptions' },
  { icon: 'analytics-outline' as const, text: 'Full spending analytics' },
  { icon: 'calendar-outline' as const, text: 'Calendar view & custom categories' },
  { icon: 'download-outline' as const, text: 'CSV export & multi-currency' },
];

export default function PaywallScreen() {
  const { colors: tc } = useTheme();

  const handlePurchase = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // TODO: RevenueCat purchase flow
    // Product ID: unsub_premium_lifetime
    // UK: £3.99, US: $3.99
    Alert.alert(
      'Purchase',
      'In-app purchase coming soon. RevenueCat integration needed.',
      [{ text: 'OK' }]
    );
  };

  const handleRestore = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Restore', 'No previous purchases found.');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tc.bg }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
          style={[styles.closeBtn, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}
        >
          <Ionicons name="close" size={20} color={tc.textSecondary} />
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
          <Text style={[styles.title, { color: tc.white }]}>Upgrade to Premium</Text>
          <Text style={[styles.subtitle, { color: tc.textSecondary }]}>
            Track unlimited subscriptions and never miss a cancellation deadline
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.featureList}>
          {features.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIconWrap}>
                <Ionicons name={f.icon} size={18} color={colors.success} />
              </View>
              <Text style={[styles.featureText, { color: tc.white }]}>{f.text}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(400)} style={{ width: '100%' }}>
          <View style={[styles.planCard, styles.planCardSelected, { backgroundColor: tc.card, borderColor: colors.accent }]}>
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>ONE-TIME</Text>
            </View>
            <View style={styles.planLeft}>
              <Ionicons name="diamond" size={22} color={colors.accent} />
              <View>
                <Text style={[styles.planLabel, { color: tc.white }]}>Premium Lifetime</Text>
                <Text style={[styles.planNote, { color: tc.textSecondary }]}>Pay once, own forever</Text>
              </View>
            </View>
            <Text style={styles.planPrice}>£3.99</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(500)} style={{ width: '100%' }}>
          <Pressable style={styles.purchaseButton} onPress={handlePurchase}>
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              style={styles.purchaseGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.purchaseButtonText}>Unlock Premium — £3.99</Text>
            </LinearGradient>
          </Pressable>

          <Pressable onPress={handleRestore} style={styles.restoreBtn}>
            <Text style={[styles.restoreText, { color: tc.textSecondary }]}>Restore Purchases</Text>
          </Pressable>

          <Text style={[styles.legalText, { color: tc.textSecondary }]}>
            One-time purchase. No subscription. No hidden fees.{'\n'}
            Restore purchases anytime in Settings.
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
