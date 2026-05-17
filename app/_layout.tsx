import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as LocalAuthentication from 'expo-local-authentication';
import { getSettings, getTrials } from '../src/utils/storage';
import { requestPermissions, scheduleWeeklyDigest, scheduleMonthlyDigest } from '../src/utils/notifications';
import { initPurchases } from '../src/utils/purchases';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(false);

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
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Unlock Unsub',
            fallbackLabel: 'Use passcode',
            disableDeviceFallback: false,
          });
          if (result.success) setLocked(false);
        }
      } catch {}

      clearTimeout(timeout);
      setReady(true);
    })();
    return () => clearTimeout(timeout);
  }, []);

  if (!ready) return null;

  if (locked) {
    return (
      <View style={styles.lockScreen}>
        <StatusBar style="light" />
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.lockText}>Unsub is locked</Text>
        <Text style={styles.lockSubtext}>Authenticate to continue</Text>
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
});
