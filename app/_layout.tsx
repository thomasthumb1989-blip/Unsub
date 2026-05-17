import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { getSettings, saveSettings, getTrials } from '../src/utils/storage';
import { requestPermissions, scheduleWeeklyDigest, scheduleMonthlyDigest } from '../src/utils/notifications';
import { initPurchases } from '../src/utils/purchases';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(false);

  const authenticate = useCallback(async () => {
    // Check if device supports biometrics
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!compatible || !enrolled) {
      // Device can't do biometrics — disable setting and unlock
      await saveSettings({ biometricLock: false });
      setLocked(false);
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Unsub',
      fallbackLabel: 'Use passcode',
      disableDeviceFallback: false,
    });
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setLocked(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setReady(true), 3000);
    (async () => {
      try { await requestPermissions(); } catch {}
      try { await initPurchases(); } catch {}

      try {
        const [settings, allTrials] = await Promise.all([getSettings(), getTrials()]);
        const activeTrials = allTrials.filter((t) => t.status === 'active');
        const monthlyTotal = activeTrials.reduce((sum, t) => sum + t.chargeAmount, 0);
        scheduleWeeklyDigest(activeTrials).catch(() => {});
        scheduleMonthlyDigest(monthlyTotal, settings.currency, activeTrials.length).catch(() => {});

        if (settings.biometricLock) {
          setLocked(true);
          // Auth happens after setReady so lock screen renders first
        }
      } catch {}

      clearTimeout(timeout);
      setReady(true);
    })();
    return () => clearTimeout(timeout);
  }, []);

  // Trigger auth after lock screen is visible
  useEffect(() => {
    if (locked && ready) {
      authenticate();
    }
  }, [locked, ready, authenticate]);

  if (!ready) return null;

  if (locked) {
    return (
      <View style={styles.lockScreen}>
        <StatusBar style="light" />
        <Ionicons name="lock-closed" size={48} color="#F59E0B" style={{ marginBottom: 16 }} />
        <Text style={styles.lockText}>Unsub is locked</Text>
        <Text style={styles.lockSubtext}>Authenticate to continue</Text>
        <Pressable
          style={styles.unlockButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            authenticate();
          }}
        >
          <Ionicons name="finger-print" size={22} color="#fff" />
          <Text style={styles.unlockButtonText}>Tap to unlock</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}

function ThemedApp() {
  const { isDark, colors } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'slide_from_right',
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  lockScreen: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: { fontSize: 48, marginBottom: 16 },
  lockText: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 8 },
  lockSubtext: { fontSize: 14, color: '#8E8E93' },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 32,
    backgroundColor: 'rgba(245,158,11,0.15)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
  },
  unlockButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
