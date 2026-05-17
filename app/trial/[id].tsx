import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  Alert,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Trial,
  getTrials,
  updateTrial,
  deleteTrial,
  getSettings,
  saveSettings,
} from '../../src/utils/storage';
import { cancelTrialReminders } from '../../src/utils/notifications';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, spacing, getCategoryColor, getUrgencyColor, getCurrencySymbol } from '../../src/utils/theme';
import { ServiceLogo } from '../../src/components/ServiceLogo';
import { getCancelGuide } from '../../src/data/cancelGuides';

export default function TrialDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [trial, setTrial] = useState<Trial | null>(null);
  const [countdown, setCountdown] = useState('');
  const [currency, setCurrency] = useState('GBP');

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [trials, settings] = await Promise.all([getTrials(), getSettings()]);
        const found = trials.find((t) => t.id === id);
        setTrial(found || null);
        setCurrency(settings.currency);
      })();
    }, [id])
  );

  useEffect(() => {
    if (!trial) return;
    const timer = setInterval(() => {
      const diff = new Date(trial.trialEndDate).getTime() - Date.now();
      if (diff <= 0) {
        setCountdown('Expired');
        clearInterval(timer);
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${d}d ${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, [trial]);

  if (!trial) return null;

  const daysLeft = Math.max(0, (new Date(trial.trialEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const urgencyColor = getUrgencyColor(daysLeft);
  const catColor = getCategoryColor(trial.category);
  const sym = getCurrencySymbol(currency);

  const handleCancel = () => {
    if (trial.cancelUrl) Linking.openURL(trial.cancelUrl);
  };

  const handleCancelled = async () => {
    const settings = await getSettings();
    await updateTrial(trial.id, { status: 'cancelled' });
    await saveSettings({ totalSaved: settings.totalSaved + trial.chargeAmount });
    await cancelTrialReminders(trial.id);

    Alert.alert(
      'Money Saved!',
      `You saved ${sym}${trial.chargeAmount.toFixed(2)} by cancelling ${trial.serviceName} on time!`,
      [{ text: 'Nice!', onPress: () => router.back() }]
    );
  };

  const handleDelete = () => {
    Alert.alert('Delete subscription?', `Remove ${trial.serviceName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTrial(trial.id);
          await cancelTrialReminders(trial.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </Pressable>
          <Text style={styles.headerTitle}>Details</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.center}>
          <ServiceLogo name={trial.serviceName} color={catColor} size={80} />
          <Text style={styles.name}>{trial.serviceName}</Text>
          <Text style={styles.categoryLabel}>{trial.category || 'Other'}</Text>

          <View style={styles.priceCard}>
            <Text style={styles.priceAmount}>{sym}{trial.chargeAmount.toFixed(2)}</Text>
            <Text style={styles.priceCycle}> per {trial.cycle || 'month'}</Text>
          </View>

          <View style={[styles.countdownPill, { backgroundColor: urgencyColor + '20' }]}>
            <Text style={[styles.countdownText, { color: urgencyColor }]}>{countdown}</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>DETAILS</Text>
        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Next bill</Text>
            <Text style={styles.detailValue}>
              {new Date(trial.trialEndDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Added</Text>
            <Text style={styles.detailValue}>
              {new Date(trial.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reminders</Text>
            <Text style={styles.detailValue}>
              {[
                trial.reminders['3day'] && '3d',
                trial.reminders['1day'] && '1d',
                trial.reminders['2hour'] && '2h',
              ].filter(Boolean).join(', ') || 'None'}
            </Text>
          </View>
        </View>

        {(() => {
          const guide = getCancelGuide(trial.serviceName);
          if (!guide) return null;
          return (
            <>
              <Text style={styles.sectionHeader}>HOW TO CANCEL</Text>
              <Animated.View entering={FadeInDown.duration(400)} style={styles.guideCard}>
                {guide.steps.map((step, i) => (
                  <View key={i} style={styles.guideStep}>
                    <View style={styles.guideStepNumber}>
                      <Text style={styles.guideStepNumText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.guideStepText}>{step}</Text>
                  </View>
                ))}
                {guide.note && (
                  <View style={styles.guideNote}>
                    <Ionicons name="information-circle-outline" size={16} color={colors.accent} />
                    <Text style={styles.guideNoteText}>{guide.note}</Text>
                  </View>
                )}
                {guide.url && (
                  <Pressable
                    style={styles.guideLink}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL(guide.url!); }}
                  >
                    <Ionicons name="open-outline" size={16} color={colors.accent} />
                    <Text style={styles.guideLinkText}>Open cancellation page</Text>
                  </Pressable>
                )}
              </Animated.View>
            </>
          );
        })()}

        <View style={styles.actions}>
          {trial.cancelUrl && (
            <Pressable style={styles.cancelNowBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); handleCancel(); }}>
              <Ionicons name="close-circle-outline" size={20} color={colors.white} />
              <Text style={styles.cancelNowText}>Cancel Subscription</Text>
            </Pressable>
          )}

          <Pressable style={styles.cancelledBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); handleCancelled(); }}>
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.white} />
            <Text style={styles.cancelledText}>I've Cancelled</Text>
          </Pressable>

          <Pressable style={styles.deleteBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); handleDelete(); }}>
            <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
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
  center: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  name: { fontSize: 24, fontWeight: '800', color: colors.white },
  categoryLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  priceCard: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 20,
  },
  priceAmount: { fontSize: 36, fontWeight: '800', color: colors.white },
  priceCycle: { fontSize: 16, color: colors.textSecondary },
  countdownPill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 99,
    marginTop: 16,
  },
  countdownText: { fontSize: 15, fontWeight: '700' },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.sectionHeader,
    letterSpacing: 1,
    marginHorizontal: spacing.lg,
    marginTop: 28,
    marginBottom: 10,
  },
  detailCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginHorizontal: spacing.lg,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  detailLabel: { fontSize: 15, color: colors.textSecondary },
  detailValue: { fontSize: 15, fontWeight: '600', color: colors.white },
  divider: { height: 0.5, backgroundColor: colors.cardBorder, marginLeft: 20 },
  actions: {
    paddingHorizontal: spacing.lg,
    marginTop: 24,
    gap: 10,
  },
  guideCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginHorizontal: spacing.lg,
    padding: 16,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
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
  cancelNowBtn: {
    backgroundColor: colors.red,
    borderRadius: 14,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cancelNowText: { fontSize: 16, fontWeight: '700', color: colors.white },
  cancelledBtn: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cancelledText: { fontSize: 16, fontWeight: '700', color: colors.white },
  deleteBtn: {
    borderRadius: 14,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  deleteText: { fontSize: 15, color: colors.textSecondary },
});
