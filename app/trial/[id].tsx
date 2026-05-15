import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  Alert,
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
import { colors, spacing, getUrgencyColor, getCurrencySymbol } from '../../src/utils/theme';

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
  const sym = getCurrencySymbol(currency);

  const handleCancel = () => {
    if (trial.cancelUrl) {
      Linking.openURL(trial.cancelUrl);
    }
  };

  const handleCancelled = async () => {
    const settings = await getSettings();
    await updateTrial(trial.id, { status: 'cancelled' });
    await saveSettings({ totalSaved: settings.totalSaved + trial.chargeAmount });
    await cancelTrialReminders(trial.id);

    Alert.alert(
      '🎉 Money Saved!',
      `You saved ${sym}${trial.chargeAmount.toFixed(2)} by cancelling ${trial.serviceName} on time!`,
      [{ text: 'Nice!', onPress: () => router.back() }]
    );
  };

  const handleDelete = () => {
    Alert.alert('Delete trial?', `Remove ${trial.serviceName} from tracking?`, [
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
      </View>

      <View style={styles.center}>
        <Text style={styles.icon}>{trial.serviceIcon || '📱'}</Text>
        <Text style={styles.name}>{trial.serviceName}</Text>
        <Text style={[styles.countdown, { color: urgencyColor }]}>{countdown}</Text>
        <Text style={styles.charge}>
          {sym}{trial.chargeAmount.toFixed(2)}/month if not cancelled
        </Text>
      </View>

      <View style={styles.actions}>
        {trial.cancelUrl ? (
          <Pressable style={[styles.actionButton, { backgroundColor: colors.red }]} onPress={handleCancel}>
            <Text style={styles.actionText}>Cancel Now →</Text>
          </Pressable>
        ) : null}

        <Pressable style={[styles.actionButton, { backgroundColor: colors.accent }]} onPress={handleCancelled}>
          <Text style={styles.actionText}>I've Cancelled ✓</Text>
        </Pressable>

        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>

      <View style={styles.info}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Trial ends</Text>
          <Text style={styles.infoValue}>
            {new Date(trial.trialEndDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Added</Text>
          <Text style={styles.infoValue}>
            {new Date(trial.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Reminders</Text>
          <Text style={styles.infoValue}>
            {[
              trial.reminders['3day'] && '3d',
              trial.reminders['1day'] && '1d',
              trial.reminders['2hour'] && '2h',
            ]
              .filter(Boolean)
              .join(', ')}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  backText: { fontSize: 16, color: colors.accent },
  center: { alignItems: 'center', paddingTop: spacing.xl },
  icon: { fontSize: 64, marginBottom: spacing.md },
  name: { fontSize: 28, fontWeight: '800', color: colors.text },
  countdown: { fontSize: 36, fontWeight: '700', marginTop: spacing.sm },
  charge: { fontSize: 16, color: colors.textSecondary, marginTop: spacing.sm },
  actions: { paddingHorizontal: spacing.lg, marginTop: spacing.xl, gap: spacing.sm },
  actionButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionText: { fontSize: 18, fontWeight: '700', color: colors.white },
  deleteButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  deleteText: { fontSize: 15, color: colors.textSecondary },
  info: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  infoLabel: { fontSize: 15, color: colors.textSecondary },
  infoValue: { fontSize: 15, fontWeight: '600', color: colors.text },
});
